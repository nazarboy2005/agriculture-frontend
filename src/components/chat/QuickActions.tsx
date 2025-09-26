import React from 'react';
import { Zap, MessageCircle, TrendingUp, Calendar, BarChart3 } from 'lucide-react';

interface QuickAction {
  question: string;
  type: string;
  icon: string;
  category: string;
}

interface QuickActionsProps {
  onQuestionSelect: (question: string, type: string) => void;
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onQuestionSelect, className = '' }) => {
  const quickQuestions: QuickAction[] = [
    { 
      question: "What's my irrigation schedule?", 
      type: 'IRRIGATION', 
      icon: '💧',
      category: 'Irrigation'
    },
    { 
      question: "How's the weather affecting my crops?", 
      type: 'WEATHER', 
      icon: '🌤️',
      category: 'Weather'
    },
    { 
      question: "Any pest issues to watch for?", 
      type: 'PEST_CONTROL', 
      icon: '🐛',
      category: 'Pest Control'
    },
    { 
      question: "Soil health recommendations?", 
      type: 'SOIL_HEALTH', 
      icon: '🌍',
      category: 'Soil Health'
    },
    { 
      question: "Harvest timing advice?", 
      type: 'CROP_HEALTH', 
      icon: '🌱',
      category: 'Crop Health'
    },
    { 
      question: "Market prices for my crops?", 
      type: 'MARKET_PRICES', 
      icon: '💰',
      category: 'Market'
    },
    { 
      question: "Fertilizer recommendations?", 
      type: 'FERTILIZER', 
      icon: '🧪',
      category: 'Fertilizer'
    },
    { 
      question: "Equipment maintenance tips?", 
      type: 'FARM_EQUIPMENT', 
      icon: '🚜',
      category: 'Equipment'
    }
  ];

  const categories = [
    { name: 'All', icon: MessageCircle, color: 'text-blue-600' },
    { name: 'Irrigation', icon: Zap, color: 'text-cyan-600' },
    { name: 'Weather', icon: TrendingUp, color: 'text-yellow-600' },
    { name: 'Crop Health', icon: BarChart3, color: 'text-green-600' },
    { name: 'Market', icon: Calendar, color: 'text-purple-600' }
  ];

  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredQuestions = selectedCategory === 'All' 
    ? quickQuestions 
    : quickQuestions.filter(q => q.category === selectedCategory);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="h-5 w-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-gray-900">Quick Questions</h3>
      </div>
      
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => setSelectedCategory(category.name)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category.name
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <category.icon className={`h-4 w-4 ${category.color}`} />
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Questions Grid */}
      <div className="grid gap-2">
        {filteredQuestions.map((item, index) => (
          <button
            key={index}
            onClick={() => onQuestionSelect(item.question, item.type)}
            className="w-full text-left p-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200 hover:shadow-sm group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </span>
              <div className="flex-1">
                <span className="font-medium">{item.question}</span>
                <div className="text-xs text-gray-500 mt-1">{item.category}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-6">
          <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No questions in this category</p>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
