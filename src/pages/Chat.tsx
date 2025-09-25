import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Send, 
  Bot, 
  ThumbsUp, 
  ThumbsDown, 
  Search, 
  Filter,
  Loader
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { chatApi } from '../services/api';
import { formatDateTime } from '../utils/format';
import { checkAuthStatus } from '../utils/authTest';
import toast from 'react-hot-toast';

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('GENERAL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Mock farmer ID - in real app, this would come from auth context
  // For demo purposes, we'll use a default farmer ID or create one if needed
  const farmerId = 1;

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const { data: chatHistory, isLoading: historyLoading } = useQuery(
    ['chat-history', farmerId],
    () => chatApi.getChatHistory(farmerId),
    { enabled: !!farmerId }
  );


  const sendMessageMutation = useMutation(
    ({ message, messageType }: { message: string; messageType: string }) =>
      chatApi.sendMessage(farmerId, message, messageType),
    {
      onMutate: async ({ message, messageType }) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries(['chat-history', farmerId]);
        
        // Optimistically add the message to the chat
        const optimisticChat = {
          id: Date.now(), // Temporary ID
          farmerId: farmerId,
          userMessage: message,
          aiResponse: 'Thinking...',
          messageType: messageType,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isHelpful: null,
          userFeedback: null
        };
        
        // Update the cache optimistically
        queryClient.setQueryData(['chat-history', farmerId], (old: any) => {
          if (!old || !old.data || !Array.isArray(old.data)) {
            return { data: { data: [optimisticChat] } };
          }
          return {
            ...old,
            data: {
              ...old.data,
              data: [optimisticChat, ...old.data.data]
            }
          };
        });
        
        return { optimisticChat };
      },
      onSuccess: (response, variables, context) => {
        console.log('Chat API Success:', response);
        console.log('Response data:', response?.data);
        
        // Extract the actual chat data from the response
        const chatData = response?.data?.data;
        
        // Replace the optimistic update with the real response
        queryClient.setQueryData(['chat-history', farmerId], (old: any) => {
          if (!old || !Array.isArray(old)) {
            return chatData ? [chatData] : [];
          }
          return old.map((chat: any) => 
            chat.id === context?.optimisticChat.id ? (chatData || chat) : chat
          );
        });
        setMessage('');
        setIsTyping(false);
        toast.success('Message sent successfully');
      },
      onError: (error: any, variables, context) => {
        console.error('Chat API Error:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        });
        
        // Update the optimistic message with error information
        queryClient.setQueryData(['chat-history', farmerId], (old: any) => {
          if (!old || !old.data || !Array.isArray(old.data.data)) {
            return { data: { data: [] } };
          }
          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map((chat: any) => {
                if (chat.id === context?.optimisticChat.id) {
                  return {
                    ...chat,
                    aiResponse: 'Sorry, I encountered an error. Please try again.',
                    messageType: 'ERROR'
                  };
                }
                return chat;
              })
            }
          };
        });
        
        setIsTyping(false);
        
        // Handle specific error cases
        if (error.response?.status === 401) {
          toast.error('Please log in to use the chat feature');
        } else if (error.response?.status === 403) {
          toast.error('Access denied. Please check your permissions');
        } else if (error.message?.includes('Network Error') || error.message?.includes('CORS')) {
          toast.error('Network error. Please check your connection and try again');
        } else if (error.code === 'ECONNREFUSED') {
          toast.error('Cannot connect to server. Please check if the backend is running.');
        } else {
          toast.error(error.response?.data?.message || `Failed to send message: ${error.message}`);
        }
      },
    }
  );

  const updateFeedbackMutation = useMutation(
    ({ chatId, isHelpful, feedback }: { chatId: number; isHelpful: boolean; feedback?: string }) =>
      chatApi.updateFeedback(chatId, isHelpful, feedback),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['chat-history', farmerId]);
        toast.success('Feedback submitted');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to submit feedback');
      },
    }
  );

  const chats = chatHistory?.data?.data || [];
  
  // Sort chats by creation date (oldest first for better conversation flow)
  const sortedChats = [...chats].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  const filteredChats = sortedChats.filter(chat => {
    const matchesSearch = !searchQuery || 
      chat.userMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.aiResponse.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterType || chat.messageType || 'GENERAL' === filterType;
    
    return matchesSearch && matchesFilter;
  });

  // Get chats to display - either selected chat or all chats
  const displayChats = currentChatId 
    ? filteredChats.filter(chat => chat.id === currentChatId)
    : filteredChats;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsTyping(true);
    
    // Add a fallback timeout in case the API call hangs
    const fallbackTimeout = setTimeout(() => {
      if (isTyping) {
        console.warn('Chat API call timed out, showing fallback message');
        setIsTyping(false);
        toast.error('Request timed out. Please try again.');
      }
    }, 65000); // 65 seconds fallback timeout
    
    sendMessageMutation.mutate({ message, messageType }, {
      onSettled: () => {
        clearTimeout(fallbackTimeout);
        setIsTyping(false);
      }
    });
  };

  const handleFeedback = (chatId: number, isHelpful: boolean) => {
    updateFeedbackMutation.mutate({ chatId, isHelpful });
  };


  const handleShowHistory = () => {
    setShowHistory(!showHistory);
  };

  const handleSelectChat = (chat: any) => {
    setCurrentChatId(chat.id);
    setShowHistory(false);
    toast.success('Selected conversation');
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Only scroll to bottom if user is near the bottom
    const messagesContainer = messagesEndRef.current?.parentElement;
    if (messagesContainer) {
      const isNearBottom = messagesContainer.scrollTop + messagesContainer.clientHeight >= messagesContainer.scrollHeight - 100;
      if (isNearBottom) {
        scrollToBottom();
      }
    }
  }, [displayChats, isTyping]);

  const messageTypeOptions = [
    { value: 'GENERAL', label: 'General', icon: '💬' },
    { value: 'IRRIGATION_ADVICE', label: 'Irrigation', icon: '💧' },
    { value: 'CROP_MANAGEMENT', label: 'Crop Management', icon: '🌱' },
    { value: 'WEATHER_QUERY', label: 'Weather', icon: '🌤️' },
    { value: 'PEST_DISEASE', label: 'Pest & Disease', icon: '🐛' },
    { value: 'SOIL_HEALTH', label: 'Soil Health', icon: '🌍' },
    { value: 'FERTILIZER_ADVICE', label: 'Fertilizer', icon: '🌿' },
    { value: 'HARVEST_PLANNING', label: 'Harvest', icon: '🌾' },
    { value: 'MARKET_INFO', label: 'Market Info', icon: '📈' },
    { value: 'TECHNICAL_SUPPORT', label: 'Technical', icon: '🔧' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">AI Agricultural Consultant</h1>
          <p className="text-secondary-600">Get personalized advice based on your farm data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Agricultural Consultant</h3>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleShowHistory}
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Search className="h-4 w-4 mr-1" />
                    {showHistory ? 'Hide History' : 'View History'}
                  </Button>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Online</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 p-4 max-h-96">
                {historyLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader className="h-6 w-6 animate-spin text-primary-600" />
                  </div>
                ) : showHistory ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Previous Conversations</h4>
                    {filteredChats.length === 0 ? (
                      <p className="text-gray-500 text-sm">No previous conversations found.</p>
                    ) : (
                      [...filteredChats].reverse().map((chat) => (
                        <div 
                          key={chat.id} 
                          onClick={() => handleSelectChat(chat)}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            currentChatId === chat.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {chat.userMessage}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDateTime(chat.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1 ml-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {messageTypeOptions.find(opt => opt.value === chat.messageType || 'GENERAL')?.icon} {messageTypeOptions.find(opt => opt.value === chat.messageType || 'GENERAL')?.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : displayChats.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                    <p className="text-secondary-600">No messages yet. Start a conversation!</p>
                  </div>
                ) : (
                  displayChats.map((chat) => (
                    <div key={chat.id} className="space-y-4">
                      {/* User Message */}
                      <div className="flex justify-end">
                        <div className="max-w-xs lg:max-w-md">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg rounded-br-sm shadow-sm">
                            <p className="text-sm">{chat.userMessage || ''}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-right">
                            {formatDateTime(chat.createdAt || new Date().toISOString())}
                          </p>
                        </div>
                      </div>

                      {/* AI Response */}
                      <div className="flex justify-start">
                        <div className="max-w-xs lg:max-w-md">
                          <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg rounded-bl-sm shadow-sm">
                            <div className="flex items-start space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Bot className="h-3 w-3 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm text-gray-900 leading-relaxed">
                                  {(chat.aiResponse || '').split('\n').map((line, index) => {
                                    // Clean up markdown formatting
                                    const cleanLine = line
                                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                      .replace(/^\* /g, '• ')
                                      .replace(/^\d+\. /g, (match) => match);
                                    
                                    return (
                                      <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: cleanLine }} />
                                    );
                                  })}
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {messageTypeOptions.find(opt => opt.value === chat.messageType || 'GENERAL')?.icon} {messageTypeOptions.find(opt => opt.value === chat.messageType || 'GENERAL')?.label}
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <button
                                      onClick={() => handleFeedback(chat.id, true)}
                                      className={`p-1.5 rounded-full transition-colors ${chat.isHelpful === true ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                                    >
                                      <ThumbsUp className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleFeedback(chat.id, false)}
                                      className={`p-1.5 rounded-full transition-colors ${chat.isHelpful === false ? 'text-red-600 bg-red-100' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                                    >
                                      <ThumbsDown className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg rounded-bl-sm shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                          <Bot className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">AI is typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <div className="flex space-x-2">
                    <select
                      value={messageType}
                      onChange={(e) => setMessageType(e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12"
                    >
                      {messageTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      value={message}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                      placeholder="Ask me anything about your farm..."
                      className="flex-1 h-12 text-base"
                      disabled={sendMessageMutation.isLoading}
                    />
                    <Button 
                      type="submit" 
                      disabled={!message.trim() || sendMessageMutation.isLoading}
                      loading={sendMessageMutation.isLoading}
                      className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-6 py-3 rounded-lg h-12"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Search & Filter */}
          <Card>
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                {messageTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('');
                }}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Questions</h3>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {[
                  "What's my irrigation schedule?",
                  "How's the weather affecting my crops?",
                  "Any pest issues to watch for?",
                  "Soil health recommendations?",
                  "Harvest timing advice?"
                ].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(question)}
                    className="w-full text-left p-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Stats */}
          <Card>
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Chat Statistics</h3>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Messages</span>
                  <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">{displayChats.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {displayChats.filter(chat => {
                      const chatDate = new Date(chat.createdAt);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return chatDate >= weekAgo;
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Helpful Responses</span>
                  <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    {displayChats.filter(chat => chat.isHelpful === true).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;
