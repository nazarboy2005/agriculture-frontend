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
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl rounded-bl-md">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-gray-500 font-medium">{message}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
