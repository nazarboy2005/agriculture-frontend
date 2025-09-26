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
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Quick Questions</h3>
      </div>
      
      {/* Category Filter - Modern */}
      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => setSelectedCategory(category.name)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
              selectedCategory === category.name
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl'
                : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white/90 border border-white/50'
            }`}
          >
            <category.icon className={`h-4 w-4 ${selectedCategory === category.name ? 'text-white' : category.color}`} />
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Questions Grid - Modern Cards */}
      <div className="grid gap-3">
        {filteredQuestions.map((item, index) => (
          <button
            key={index}
            onClick={() => onQuestionSelect(item.question, item.type)}
            className="w-full text-left p-4 text-sm text-gray-700 hover:bg-white/90 hover:text-emerald-700 rounded-2xl transition-all duration-300 border border-white/50 hover:border-emerald-200 hover:shadow-xl group bg-white/60 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center group-hover:from-emerald-100 group-hover:to-teal-200 transition-all duration-300">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </span>
              </div>
              <div className="flex-1">
                <span className="font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">{item.question}</span>
                <div className="text-xs text-gray-500 mt-1 font-medium">{item.category}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 font-medium">No questions in this category</p>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
