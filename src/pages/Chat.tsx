import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Bot, 
  ThumbsDown, 
  Search, 
  Filter,
  Loader,
  MessageCircle,
  CheckCheck,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import MessageBubble from '../components/chat/MessageBubble';
import TypingIndicator from '../components/chat/TypingIndicator';
import QuickActions from '../components/chat/QuickActions';
import ChatStats from '../components/chat/ChatStats';
import ChatInput from '../components/chat/ChatInput';
import { chatApi } from '../services/api';
import { formatDateTime } from '../utils/format';
import { checkAuthStatus } from '../utils/authTest';
import { useAuth } from '../contexts/AuthContext';
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Get farmer ID from auth context or use a default for demo
  const { user } = useAuth();
  const farmerId = user?.id || 1;

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const { data: chatHistory, isLoading: historyLoading } = useQuery(
    ['chat-history', farmerId],
    () => chatApi.getChatHistory(farmerId),
    { 
      enabled: !!farmerId,
      retry: 3,
      retryDelay: 1000,
      onError: (error: any) => {
        console.error('Failed to load chat history:', error);
        if (error.response?.status !== 401) {
          toast.error('Failed to load chat history. Please try again.');
        }
      }
    }
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

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Message copied to clipboard');
  };


  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Only scroll to bottom if user is near the bottom
    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer) {
      const isNearBottom = messagesContainer.scrollTop + messagesContainer.clientHeight >= messagesContainer.scrollHeight - 100;
      if (isNearBottom) {
        scrollToBottom();
      }
    }
  }, [displayChats, isTyping]);

  const messageTypeOptions = [
    { value: 'GENERAL', label: 'General', icon: '💬', color: 'bg-blue-100 text-blue-800' },
    { value: 'WEATHER', label: 'Weather', icon: '🌤️', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'CROP_HEALTH', label: 'Crop Health', icon: '🌱', color: 'bg-green-100 text-green-800' },
    { value: 'IRRIGATION', label: 'Irrigation', icon: '💧', color: 'bg-cyan-100 text-cyan-800' },
    { value: 'PEST_CONTROL', label: 'Pest Control', icon: '🐛', color: 'bg-red-100 text-red-800' },
    { value: 'FERTILIZER', label: 'Fertilizer', icon: '🧪', color: 'bg-purple-100 text-purple-800' },
    { value: 'MARKET_PRICES', label: 'Market Prices', icon: '💰', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'FARM_EQUIPMENT', label: 'Farm Equipment', icon: '🚜', color: 'bg-orange-100 text-orange-800' },
    { value: 'SOIL_HEALTH', label: 'Soil Health', icon: '🌍', color: 'bg-amber-100 text-amber-800' }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Modern Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Farm Assistant</h1>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleShowHistory}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:bg-gray-50 rounded-xl"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {showHistory ? 'Hide History' : 'History'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 rounded-xl"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden h-[calc(100vh-200px)] flex flex-col">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Agricultural Consultant</h3>
                    <p className="text-sm text-gray-600">Ready to help with your farming questions</p>
                  </div>
                </div>
              </div>
              
              {/* Messages Area */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-gray-50/50"
              >
                {historyLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="flex items-center space-x-3">
                      <Loader className="h-6 w-6 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">Loading chat history...</span>
                    </div>
                  </div>
                ) : showHistory ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Previous Conversations</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentChatId(null)}
                          className="text-gray-600"
                        >
                          Show All
                        </Button>
                      </div>
                      {filteredChats.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No previous conversations found.</p>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {[...filteredChats].reverse().map((chat) => (
                            <div 
                              key={chat.id} 
                              onClick={() => handleSelectChat(chat)}
                              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                                currentChatId === chat.id 
                                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                                    {chat.userMessage}
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      messageTypeOptions.find(opt => opt.value === chat.messageType || 'GENERAL')?.color || 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {messageTypeOptions.find(opt => opt.value === chat.messageType || 'GENERAL')?.icon} {messageTypeOptions.find(opt => opt.value === chat.messageType || 'GENERAL')?.label}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatDateTime(chat.createdAt)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-3">
                                  {chat.isHelpful === true && (
                                    <CheckCheck className="h-4 w-4 text-green-500" />
                                  )}
                                  {chat.isHelpful === false && (
                                    <ThumbsDown className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                ) : displayChats.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Bot className="h-12 w-12 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to AI Farm Assistant!</h3>
                      <p className="text-gray-600 mb-8 leading-relaxed">
                        I'm your intelligent farming companion. Ask me anything about crops, weather, soil health, irrigation, or agricultural best practices.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 p-3 rounded-xl">
                          <div className="text-2xl mb-1">🌱</div>
                          <div className="text-sm font-medium text-blue-800">Crop Health</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-xl">
                          <div className="text-2xl mb-1">🌤️</div>
                          <div className="text-sm font-medium text-green-800">Weather</div>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-xl">
                          <div className="text-2xl mb-1">💧</div>
                          <div className="text-sm font-medium text-yellow-800">Irrigation</div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-xl">
                          <div className="text-2xl mb-1">🧪</div>
                          <div className="text-sm font-medium text-purple-800">Fertilizer</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {displayChats.map((chat) => (
                      <div key={chat.id} className="space-y-4">
                        {/* User Message */}
                        <MessageBubble
                          message={chat.userMessage || ''}
                          isUser={true}
                          timestamp={chat.createdAt || new Date().toISOString()}
                          onCopy={handleCopyMessage}
                        />

                        {/* AI Response */}
                        <MessageBubble
                          message={chat.aiResponse || ''}
                          isUser={false}
                          timestamp={chat.createdAt || new Date().toISOString()}
                          messageType={chat.messageType || 'GENERAL'}
                          isHelpful={chat.isHelpful}
                          onFeedback={(isHelpful) => handleFeedback(chat.id, isHelpful)}
                          onCopy={handleCopyMessage}
                          messageTypeOptions={messageTypeOptions}
                        />
                      </div>
                    ))}
                    
                    <TypingIndicator isVisible={isTyping} />
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-100 bg-white p-4">
                <ChatInput
                  message={message}
                  setMessage={setMessage}
                  messageType={messageType}
                  setMessageType={setMessageType}
                  onSubmit={handleSendMessage}
                  isLoading={sendMessageMutation.isLoading}
                  placeholder="Ask me anything about your farm..."
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Search & Filter */}
            <div className="bg-white rounded-2xl shadow-lg border-0 p-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <Search className="h-5 w-5 mr-2 text-blue-600" />
                Search & Filter
              </h3>
              <div className="space-y-3">
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                  className="border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border-0 p-4">
              <QuickActions
                onQuestionSelect={(question, type) => {
                  setMessage(question);
                  setMessageType(type);
                }}
              />
            </div>

            {/* Chat Stats */}
            <div className="bg-white rounded-2xl shadow-lg border-0 p-4">
              <ChatStats
                totalMessages={displayChats.length}
                weeklyMessages={displayChats.filter(chat => {
                  const chatDate = new Date(chat.createdAt);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return chatDate >= weekAgo;
                }).length}
                helpfulResponses={displayChats.filter(chat => chat.isHelpful === true).length}
                responseRate={displayChats.length > 0 ? Math.round((displayChats.filter(chat => chat.isHelpful === true).length / displayChats.length) * 100) : 0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;