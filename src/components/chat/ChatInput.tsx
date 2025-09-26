import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  messageType: string;
  setMessageType: (type: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  placeholder?: string;
  className?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  message,
  setMessage,
  messageType,
  setMessageType,
  onSubmit,
  isLoading,
  placeholder = "Ask me anything about your farm...",
  className = ''
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !isLoading) {
        onSubmit(e);
      }
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className={`bg-transparent ${className}`}>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Message Type Selector - Modern */}
        <div className="flex justify-center">
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
            className="px-4 py-2 border border-white/30 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {messageTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Input Area - Modern Glass Design */}
        <div className="flex items-end space-x-4">
          <div className="flex-1 relative">
            <div className="relative bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500/50">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={isLoading}
                className="w-full p-4 pr-16 bg-transparent text-base resize-none min-h-[56px] max-h-[120px] focus:outline-none placeholder-gray-500 font-medium"
                rows={1}
              />
              
              {/* Send Button - Modern Design */}
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="absolute right-3 bottom-3 p-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
