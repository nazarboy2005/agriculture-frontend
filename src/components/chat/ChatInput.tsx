import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Mic, MicOff, X } from 'lucide-react';
import Button from '../ui/Button';

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
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const quickEmojis = ['🌱', '🌤️', '💧', '🐛', '💰', '🚜', '🌍', '🧪', '📊', '⚡'];

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !isLoading) {
        onSubmit(e);
      }
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setMessage(message + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // Here you would implement voice recording functionality
    // For now, just toggle the state
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Here you would handle file upload
      console.log('File selected:', file);
    }
    setShowAttachmentMenu(false);
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
    <div className={`bg-white border-t border-gray-100 p-6 ${className}`}>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Message Type Selector */}
        <div className="flex space-x-3">
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 bg-white shadow-sm"
          >
            {messageTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Input Area */}
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={isLoading}
              className="w-full p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm resize-none min-h-[48px] max-h-[120px]"
              rows={1}
            />
            
            {/* Action Buttons */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Smile className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Paperclip className="h-4 w-4" />
              </button>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 p-3 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Quick Emojis</span>
                  <button
                    onClick={() => setShowEmojiPicker(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {quickEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmojiClick(emoji)}
                      className="p-2 text-lg hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Attachment Menu */}
            {showAttachmentMenu && (
              <div className="absolute bottom-full right-0 mb-2 p-3 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Attach File</span>
                  <button
                    onClick={() => setShowAttachmentMenu(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Paperclip className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Upload File</span>
                  </label>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button
              type="button"
              onClick={handleVoiceToggle}
              variant="outline"
              className={`p-3 h-12 w-12 rounded-xl ${
                isRecording 
                  ? 'bg-red-100 text-red-600 border-red-300' 
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            
            <Button 
              type="submit" 
              disabled={!message.trim() || isLoading}
              loading={isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl h-12 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
