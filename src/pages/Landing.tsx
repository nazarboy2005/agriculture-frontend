import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Droplets, 
  Thermometer, 
  Search,
  BarChart3,
  ArrowRight,
  Leaf,
  MessageCircle,
  MapPin,
  Shield,
  Zap,
  Users,
  CheckCircle,
  Play,
  Sparkles,
  TrendingUp,
  Award,
  Target,
  Heart,
  Brain
} from 'lucide-react';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Search,
      title: 'AI Disease Detection',
      description: 'Instantly identify plant diseases from photos with 95% accuracy and get treatment recommendations.',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      highlight: '95% Accuracy'
    },
    {
      icon: Droplets,
      title: 'Smart Irrigation',
      description: 'Save up to 40% water with AI-powered irrigation scheduling based on weather and soil data.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      highlight: '40% Water Saved'
    },
    {
      icon: Thermometer,
      title: 'Heat Protection',
      description: 'Real-time temperature monitoring with instant SMS alerts to protect your crops from heat stress.',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      highlight: 'Real-time Alerts'
    },
    {
      icon: MessageCircle,
      title: 'AI Consultant',
      description: 'Get personalized farming advice 24/7 from our advanced AI agricultural expert.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      highlight: '24/7 Support'
    },
    {
      icon: MapPin,
      title: 'Zone Management',
      description: 'Manage multiple farm zones with precision monitoring and location-based recommendations.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      highlight: 'Multi-Zone'
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Comprehensive insights and predictions to optimize your farm performance and maximize yields.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      highlight: 'Data-Driven'
    }
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Increase Yields',
      description: 'Average 25% increase in crop yields through optimized farming practices'
    },
    {
      icon: Droplets,
      title: 'Save Water',
      description: 'Reduce water usage by up to 40% with smart irrigation management'
    },
    {
      icon: Shield,
      title: 'Prevent Losses',
      description: 'Early disease detection and weather alerts prevent crop losses'
    },
    {
      icon: Zap,
      title: 'Save Time',
      description: 'Automated monitoring and alerts save hours of manual work daily'
    }
  ];


  const steps = [
    {
      number: '01',
      title: 'Sign Up & Connect',
      description: 'Create your account in 2 minutes and connect your farm data through our intuitive interface.',
      icon: Users
    },
    {
      number: '02',
      title: 'AI Analysis',
      description: 'Our advanced AI analyzes your data and provides personalized recommendations for optimal farming.',
      icon: Brain
    },
    {
      number: '03',
      title: 'Optimize & Grow',
      description: 'Implement our recommendations and watch your yields increase while saving water and resources.',
      icon: Target
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">AgriSmart</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="hidden sm:inline-flex border-gray-300 hover:bg-gray-50"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/30 via-blue-100/30 to-indigo-100/30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Agriculture Platform</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Revolutionize Your
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent"> Farming</span>
              <br />
              with AI
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Harness the power of artificial intelligence to optimize your agricultural practices, 
              increase yields by 25%, save 40% water, and build a sustainable farming future.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                onClick={() => navigate('/register')}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-10 py-5 text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 hover:border-gray-400 px-10 py-5 text-xl font-semibold"
              >
                <Play className="mr-3 h-6 w-6" />
                Watch Demo
              </Button>
            </div>
            <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Setup in 2 Minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>24/7 AI Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why Choose AgriSmart?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of farmers who have already transformed their agricultural practices with our AI-powered platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-green-50/50 via-blue-50/50 to-indigo-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need for Smart Farming
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge AI technology with practical farming knowledge 
              to help you achieve optimal results.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm group">
                <div className="flex items-start space-x-4">
                  <div className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                      <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                        {feature.highlight}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just three simple steps and transform your farming
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <step.icon className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center space-x-2 bg-white/20 text-white px-6 py-3 rounded-full text-sm font-medium mb-8">
            <Award className="h-5 w-5" />
            <span>Trusted by 10,000+ Farmers</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-8">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-xl text-green-100 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join thousands of farmers who are already using AI to optimize their agricultural practices 
            and build a sustainable future. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              onClick={() => navigate('/register')}
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
            <div className="flex items-center space-x-2 text-green-100">
              <Heart className="h-5 w-5" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">AgriSmart</span>
            </div>
            <div className="text-center text-gray-400">
              <p>&copy; 2024 AgriSmart. All rights reserved. Made with ❤️ for farmers worldwide.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;