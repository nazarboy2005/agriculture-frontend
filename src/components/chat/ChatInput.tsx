import React, { useState, useRef, useEffect } from 'react';
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
    <div className={`bg-white border-t border-gray-200 p-4 ${className}`}>
      <form onSubmit={onSubmit} className="space-y-3">
        {/* Message Type Selector - Compact */}
        <div className="flex justify-center">
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
          >
            {messageTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Input Area - ChatGPT Style */}
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={isLoading}
              className="w-full p-3 border border-gray-300 rounded-2xl text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none min-h-[44px] max-h-[120px] pr-12"
              rows={1}
            />
            
            {/* Send Button - Inside Input */}
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
