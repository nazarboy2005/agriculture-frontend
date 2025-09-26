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
    { value: 'WEATHER_QUERY', label: 'Weather', icon: '🌤️', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'CROP_MANAGEMENT', label: 'Crop Health', icon: '🌱', color: 'bg-green-100 text-green-800' },
    { value: 'IRRIGATION_ADVICE', label: 'Irrigation', icon: '💧', color: 'bg-cyan-100 text-cyan-800' },
    { value: 'PEST_DISEASE', label: 'Pest Control', icon: '🐛', color: 'bg-red-100 text-red-800' },
    { value: 'FERTILIZER_ADVICE', label: 'Fertilizer', icon: '🧪', color: 'bg-purple-100 text-purple-800' },
    { value: 'MARKET_INFO', label: 'Market Prices', icon: '💰', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'TECHNICAL_SUPPORT', label: 'Farm Equipment', icon: '🚜', color: 'bg-orange-100 text-orange-800' },
    { value: 'SOIL_HEALTH', label: 'Soil Health', icon: '🌍', color: 'bg-amber-100 text-amber-800' }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto h-screen flex flex-col">
        {/* Modern Glass Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 px-6 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                AI Farm Assistant
              </h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 font-medium">Online & Ready</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleShowHistory}
              variant="outline"
              size="sm"
              className="border-white/30 hover:bg-white/50 rounded-xl text-sm font-medium shadow-sm backdrop-blur-sm bg-white/20"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {showHistory ? 'Hide History' : 'View History'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/30 hover:bg-white/50 rounded-xl shadow-sm backdrop-blur-sm bg-white/20"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Chat Interface */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-white/60 backdrop-blur-sm flex flex-col rounded-t-3xl shadow-2xl">
              
              {/* Messages Area */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto bg-gradient-to-b from-white/80 to-white/40 backdrop-blur-sm"
              >
                {historyLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="flex items-center space-x-3">
                      <Loader className="h-6 w-6 animate-spin text-green-600" />
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
                  <div className="flex items-center justify-center h-full px-6">
                    <div className="text-center max-w-3xl">
                      <div className="relative mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                          <Bot className="h-12 w-12 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                          <span className="text-sm">✨</span>
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                        How can I help you today?
                      </h3>
                      <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                        I'm your intelligent farming assistant. Ask me anything about crops, weather, soil health, irrigation, or agricultural best practices.
                      </p>
                      <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/90 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl border border-white/50" onClick={() => {setMessage("What's the best time to water my crops?"); setMessageType("IRRIGATION_ADVICE");}}>
                          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">💧</div>
                          <div className="text-sm font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">Irrigation Advice</div>
                          <div className="text-xs text-gray-500 mt-1">Smart watering tips</div>
                        </div>
                        <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/90 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl border border-white/50" onClick={() => {setMessage("How's the weather affecting my crops?"); setMessageType("WEATHER_QUERY");}}>
                          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🌤️</div>
                          <div className="text-sm font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">Weather Query</div>
                          <div className="text-xs text-gray-500 mt-1">Weather insights</div>
                        </div>
                        <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/90 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl border border-white/50" onClick={() => {setMessage("My crops look unhealthy, what should I do?"); setMessageType("CROP_MANAGEMENT");}}>
                          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🌱</div>
                          <div className="text-sm font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">Crop Health</div>
                          <div className="text-xs text-gray-500 mt-1">Plant diagnostics</div>
                        </div>
                        <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/90 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl border border-white/50" onClick={() => {setMessage("What fertilizer should I use?"); setMessageType("FERTILIZER_ADVICE");}}>
                          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🧪</div>
                          <div className="text-sm font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">Fertilizer</div>
                          <div className="text-xs text-gray-500 mt-1">Nutrient guidance</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-6">
                    {displayChats.map((chat) => (
                      <div key={chat.id} className="space-y-6 mb-8">
                        {/* User Message */}
                        <div className="flex justify-end">
                          <div className="max-w-3xl">
                            <MessageBubble
                              message={chat.userMessage || ''}
                              isUser={true}
                              timestamp={chat.createdAt || new Date().toISOString()}
                              onCopy={handleCopyMessage}
                            />
                          </div>
                        </div>

                        {/* AI Response */}
                        <div className="flex justify-start">
                          <div className="max-w-3xl">
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
                        </div>
                      </div>
                    ))}
                    
                    <TypingIndicator isVisible={isTyping} />
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-white/20 bg-white/40 backdrop-blur-sm p-6">
                <ChatInput
                  message={message}
                  setMessage={setMessage}
                  messageType={messageType}
                  setMessageType={setMessageType}
                  onSubmit={handleSendMessage}
                  isLoading={sendMessageMutation.isLoading}
                  placeholder="Message AI Farm Assistant..."
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Only show when history is open */}
          {showHistory && (
            <div className="w-80 bg-white/60 backdrop-blur-xl border-l border-white/20 flex flex-col shadow-2xl">
              {/* Search & Filter */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Search & Filter</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="h-4 w-4" />}
                    className="border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
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
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-4 border-b border-gray-200">
                <QuickActions
                  onQuestionSelect={(question, type) => {
                    setMessage(question);
                    setMessageType(type);
                  }}
                />
              </div>

              {/* Chat Stats */}
              <div className="p-4">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;