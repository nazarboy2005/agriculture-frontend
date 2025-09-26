import React from 'react';
import { BarChart3, TrendingUp, Clock, ThumbsUp, MessageCircle, Calendar } from 'lucide-react';

interface ChatStatsProps {
  totalMessages: number;
  weeklyMessages: number;
  helpfulResponses: number;
  responseRate: number;
  className?: string;
}

const ChatStats: React.FC<ChatStatsProps> = ({
  totalMessages,
  weeklyMessages,
  helpfulResponses,
  responseRate,
  className = ''
}) => {
  const stats = [
    {
      label: 'Total Messages',
      value: totalMessages,
      icon: MessageCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'All time conversations'
    },
    {
      label: 'This Week',
      value: weeklyMessages,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Recent activity'
    },
    {
      label: 'Helpful Responses',
      value: helpfulResponses,
      icon: ThumbsUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Positive feedback'
    },
    {
      label: 'Response Rate',
      value: `${responseRate}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: 'Helpfulness ratio'
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Chat Statistics</h3>
      </div>
      
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.description}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar for Response Rate */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Satisfaction</span>
          <span className="text-sm font-bold text-indigo-600">{responseRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${responseRate}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-gray-700">Insights</span>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          {responseRate >= 80 && (
            <p>🎉 Excellent! Your AI assistant is very helpful.</p>
          )}
          {responseRate >= 60 && responseRate < 80 && (
            <p>👍 Good! Your AI assistant is quite helpful.</p>
          )}
          {responseRate < 60 && (
            <p>💡 Consider providing more specific feedback to improve responses.</p>
          )}
          {weeklyMessages > 0 && (
            <p>📈 You've been active this week with {weeklyMessages} messages.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatStats;
