import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Bot, 
  ThumbsDown, 
  Search, 
  Filter,
  Loader,
  MessageCircle,
  CheckCheck
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

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('GENERAL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connected');
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

  const { isLoading: historyLoading } = useQuery(
    ['chat-history', farmerId],
    () => chatApi.getChatHistory(farmerId),
    { 
      enabled: !!farmerId,
      retry: false,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (data?.data?.data) {
          setLocalMessages(data.data.data);
        }
      }
    }
  );

  const sendMessageMutation = useMutation(
    ({ message, messageType }: { message: string; messageType: string }) =>
      chatApi.sendMessage(farmerId, message, messageType),
    {
      onSuccess: (response) => {
        // console.log('Message sent successfully:', response);
        setConnectionStatus('connected');
        const chatData = response?.data?.data;
        if (chatData) {
          setLocalMessages(prev => {
            // Remove the temporary message and add the real response
            const filtered = prev.filter(msg => msg.tempId !== chatData.tempId);
            return [chatData, ...filtered];
          });
        } else {
          console.warn('No chat data in response:', response);
          // If no chat data, just remove the temporary message
          setLocalMessages(prev => {
            const tempId = prev.find(msg => msg.aiResponse === 'Thinking...')?.tempId;
            if (tempId) {
              return prev.filter(msg => msg.tempId !== tempId);
            }
            return prev;
          });
        }
        setIsTyping(false);
      },
      onError: (error: any) => {
        console.error('Failed to send message:', error);
        setConnectionStatus('disconnected');
        // Remove the temporary message on error
        setLocalMessages(prev => {
          const tempId = prev.find(msg => msg.aiResponse === 'Thinking...')?.tempId;
          if (tempId) {
            return prev.filter(msg => msg.tempId !== tempId);
          }
          return prev;
        });
        setIsTyping(false);
        setIsRetrying(false);
        
        // Set user-friendly error message
        const errorMsg = error?.response?.data?.message || 
                        error?.message || 
                        'Failed to send message. Please check your connection and try again.';
        setErrorMessage(errorMsg);
        
        // Auto-clear error after 5 seconds
        setTimeout(() => setErrorMessage(''), 5000);
      },
    }
  );

  const updateFeedbackMutation = useMutation(
    ({ chatId, isHelpful, feedback }: { chatId: number; isHelpful: boolean; feedback?: string }) =>
      chatApi.updateFeedback(chatId, isHelpful, feedback),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['chat-history', farmerId]);
      },
      onError: () => {
        // Silent error handling
      },
    }
  );

  // Use local messages for immediate display
  const chats = localMessages;
  
  // Debug logging (remove in production)
  // console.log('Local messages:', chats);
  // console.log('Search query:', searchQuery);
  // console.log('Filter type:', filterType);
  
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
    
  // console.log('Display chats:', displayChats);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isLoading) return;

    // Clear any previous errors
    setErrorMessage('');

    const tempId = Date.now();
    const userMessage = message;
    const messageTypeToSend = messageType;

    // console.log('Sending message:', { userMessage, messageTypeToSend, farmerId, tempId });

    // Add message immediately to local state
    const newMessage = {
      id: tempId,
      tempId: tempId, // Store temp ID for later removal
      farmerId: farmerId,
      userMessage: userMessage,
      aiResponse: 'Thinking...',
      messageType: messageTypeToSend,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isHelpful: null,
      userFeedback: null
    };

    // console.log('Adding temporary message:', newMessage);
    setLocalMessages(prev => {
      const updated = [newMessage, ...prev];
      // console.log('Updated local messages:', updated);
      return updated;
    });
    setMessage('');
    setIsTyping(true);
    
    // console.log('Calling sendMessageMutation.mutate');
    sendMessageMutation.mutate({ message: userMessage, messageType: messageTypeToSend });
  };

  const handleRetry = () => {
    setIsRetrying(true);
    setErrorMessage('');
    // Retry the last failed message
    const lastMessage = localMessages.find(msg => msg.aiResponse === 'Thinking...');
    if (lastMessage) {
      sendMessageMutation.mutate({ 
        message: lastMessage.userMessage, 
        messageType: lastMessage.messageType 
      });
    }
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
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
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
      <div className="w-full h-screen flex flex-col pt-0">
        {/* Modern Glass Header - Mobile Responsive */}
        <div className="bg-white/95 backdrop-blur-xl border-b border-white/20 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-lg flex-shrink-0 sticky top-0 z-40">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Bot className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                AI Farm Assistant
              </h1>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' 
                    ? 'bg-emerald-500 animate-pulse' 
                    : connectionStatus === 'connecting'
                    ? 'bg-yellow-500 animate-pulse'
                    : 'bg-red-500 animate-pulse'
                }`}></div>
                <span className="text-xs sm:text-sm text-gray-600 font-medium">
                  {connectionStatus === 'connected' 
                    ? 'Online & Ready' 
                    : connectionStatus === 'connecting'
                    ? 'Connecting...'
                    : 'Connection Lost'
                  }
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {displayChats.length > 0 && (
              <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-600 bg-white/20 px-2 py-1 rounded-lg">
                <MessageCircle className="h-3 w-3" />
                <span>{displayChats.length} message{displayChats.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            <Button
              onClick={handleShowHistory}
              variant="outline"
              size="sm"
              className="border-white/30 hover:bg-white/50 rounded-xl text-xs sm:text-sm font-medium shadow-sm backdrop-blur-sm bg-white/20 px-2 sm:px-3"
            >
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">{showHistory ? 'Hide History' : 'View History'}</span>
              <span className="sm:hidden">{showHistory ? 'Hide' : 'History'}</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Chat Interface */}
          <div className="flex-1 flex flex-col min-h-0 w-full">
            <div className="flex-1 bg-white/60 backdrop-blur-sm flex flex-col shadow-2xl min-h-0 relative max-w-none">
              
              {/* Messages Area */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto bg-gradient-to-b from-white/80 to-white/40 backdrop-blur-sm min-h-0"
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
                  <div className="flex items-center justify-center h-full px-4 sm:px-6">
                    <div className="text-center max-w-4xl w-full">
                      <div className="relative mb-6 sm:mb-8">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                          <Bot className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                          <span className="text-xs sm:text-sm">✨</span>
                        </div>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3 sm:mb-4">
                        Welcome to AI Farm Assistant! 🌱
                      </h3>
                      <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-10 leading-relaxed max-w-2xl mx-auto px-4">
                        I'm your intelligent farming companion. I can help you with crop management, weather insights, irrigation advice, pest control, soil health, and much more. What would you like to know about your farm today?
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto px-4">
                        <div className="group bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl hover:bg-white/90 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl border border-white/50" onClick={() => {setMessage("What's the best time to water my crops?"); setMessageType("IRRIGATION_ADVICE");}}>
                          <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">💧</div>
                          <div className="text-sm font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">Irrigation Advice</div>
                          <div className="text-xs text-gray-500 mt-1">Smart watering tips</div>
                        </div>
                        <div className="group bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl hover:bg-white/90 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl border border-white/50" onClick={() => {setMessage("How's the weather affecting my crops?"); setMessageType("WEATHER_QUERY");}}>
                          <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">🌤️</div>
                          <div className="text-sm font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">Weather Query</div>
                          <div className="text-xs text-gray-500 mt-1">Weather insights</div>
                        </div>
                        <div className="group bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl hover:bg-white/90 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl border border-white/50" onClick={() => {setMessage("My crops look unhealthy, what should I do?"); setMessageType("CROP_MANAGEMENT");}}>
                          <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">🌱</div>
                          <div className="text-sm font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">Crop Health</div>
                          <div className="text-xs text-gray-500 mt-1">Plant diagnostics</div>
                        </div>
                        <div className="group bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl hover:bg-white/90 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl border border-white/50" onClick={() => {setMessage("What fertilizer should I use?"); setMessageType("FERTILIZER_ADVICE");}}>
                          <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">🧪</div>
                          <div className="text-sm font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">Fertilizer</div>
                          <div className="text-xs text-gray-500 mt-1">Nutrient guidance</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-3 sm:px-6 py-4 sm:py-6">
                    {displayChats.map((chat) => (
                      <div key={chat.id} className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                        {/* User Message */}
                        <div className="flex justify-end">
                          <div className="max-w-xs sm:max-w-3xl mr-2 sm:mr-4">
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
                          <div className="max-w-xs sm:max-w-3xl ml-2 sm:ml-4">
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

              {/* Error Banner */}
              {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4 rounded-r-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{errorMessage}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors disabled:opacity-50"
                      >
                        {isRetrying ? 'Retrying...' : 'Retry'}
                      </button>
                      <button
                        onClick={() => setErrorMessage('')}
                        className="text-red-400 hover:text-red-600"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="border-t border-white/20 bg-white/40 backdrop-blur-sm p-4 sm:p-6 flex-shrink-0 relative z-10">
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
            <div className="w-full sm:w-80 bg-white/60 backdrop-blur-xl border-l border-white/20 flex flex-col shadow-2xl flex-shrink-0">
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