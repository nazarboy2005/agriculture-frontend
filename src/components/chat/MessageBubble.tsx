import React, { useState } from 'react';
import { Bot, Copy, ThumbsUp, ThumbsDown, Check, CheckCheck, MoreVertical } from 'lucide-react';
import { formatDateTime } from '../../utils/format';
import toast from 'react-hot-toast';

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: string;
  messageType?: string;
  isHelpful?: boolean | null;
  onFeedback?: (isHelpful: boolean) => void;
  onCopy?: (text: string) => void;
  messageTypeOptions?: Array<{
    value: string;
    label: string;
    icon: string;
    color: string;
  }>;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isUser,
  timestamp,
  messageType = 'GENERAL',
  isHelpful,
  onFeedback,
  onCopy,
  messageTypeOptions = []
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy(message);
    } else {
      navigator.clipboard.writeText(message);
      toast.success('Message copied to clipboard');
    }
  };

  const getMessageStatus = () => {
    if (isHelpful === true) return { icon: CheckCheck, color: 'text-green-500', text: 'Helpful' };
    if (isHelpful === false) return { icon: ThumbsDown, color: 'text-red-500', text: 'Not helpful' };
    return { icon: Check, color: 'text-gray-400', text: 'Sent' };
  };

  const messageTypeInfo = messageTypeOptions.find(opt => opt.value === messageType) || {
    icon: '💬',
    label: 'General',
    color: 'bg-blue-100 text-blue-800'
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl rounded-br-md shadow-lg">
            <p className="text-sm leading-relaxed">{message}</p>
          </div>
          <div className="flex items-center justify-end mt-2 space-x-2">
            <span className="text-xs text-gray-500">
              {formatDateTime(timestamp)}
            </span>
            <button
              onClick={handleCopy}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-2xl">
        <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-md shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-900 leading-relaxed">
                {message.split('\n').map((line, index) => {
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
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${messageTypeInfo.color}`}>
                    {messageTypeInfo.icon} {messageTypeInfo.label}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onFeedback?.(true)}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      isHelpful === true 
                        ? 'text-green-600 bg-green-100 shadow-sm' 
                        : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onFeedback?.(false)}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      isHelpful === false 
                        ? 'text-red-600 bg-red-100 shadow-sm' 
                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center mt-2 space-x-2">
          <span className="text-xs text-gray-500">
            {formatDateTime(timestamp)}
          </span>
          {getMessageStatus().icon && (
            <div className="flex items-center space-x-1">
              <getMessageStatus().icon className={`h-3 w-3 ${getMessageStatus().color}`} />
              <span className="text-xs text-gray-500">{getMessageStatus().text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
