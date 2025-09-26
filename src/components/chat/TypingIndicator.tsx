import React from 'react';
import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  isVisible: boolean;
  message?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  isVisible, 
  message = "AI is thinking..." 
}) => {
  if (!isVisible) return null;

  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-3xl">
        <div className="bg-white/90 backdrop-blur-sm border border-white/50 p-5 rounded-3xl rounded-bl-lg shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-gray-600 font-semibold">{message}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
