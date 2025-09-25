import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Droplets, 
  Thermometer, 
  Lightbulb, 
  Search,
  BarChart3,
  ArrowRight,
  Star,
  Leaf,
  MessageCircle,
  MapPin,
  Bell
} from 'lucide-react';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Search,
      title: 'Plant Disease Detection',
      description: 'AI-powered disease identification from plant leaf images with instant treatment recommendations.',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Droplets,
      title: 'Smart Irrigation',
      description: 'AI-powered water management system that optimizes irrigation schedules and saves water.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Thermometer,
      title: 'Heat Alerts',
      description: 'Real-time temperature monitoring with instant SMS notifications to protect your crops.',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      icon: MapPin,
      title: 'Zone Management',
      description: 'Manage multiple farm zones with location-based monitoring and recommendations.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: MessageCircle,
      title: 'AI Agricultural Consultant',
      description: 'Get personalized farming advice from our AI-powered agricultural consultant.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights into your farm performance and optimization opportunities.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      icon: Lightbulb,
      title: 'AI Recommendations',
      description: 'Get personalized farming advice powered by advanced machine learning algorithms.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Proactive notifications for weather changes, irrigation needs, and crop health issues.',
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    }
  ];


  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Rice Farmer, Punjab',
      content: 'This platform has revolutionized my farming. I\'ve saved 35% on water costs and increased my yield by 20%.',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Vegetable Farmer, Maharashtra',
      content: 'The AI recommendations are incredibly accurate. My crops are healthier and more productive than ever.',
      rating: 5
    },
    {
      name: 'Amit Patel',
      role: 'Cotton Farmer, Gujarat',
      content: 'The heat alerts saved my entire crop during the heatwave. This technology is a game-changer.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AgriSmart</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="hidden sm:inline-flex"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Revolutionize Your
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Farming</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Harness the power of AI and IoT to optimize your agricultural practices, 
              save water, increase yields, and build a sustainable future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/register')}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 text-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Transition Section */}
      <section className="py-8 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-blue-50/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Smart Farming
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge technology with practical farming knowledge 
              to help you achieve optimal results.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sign Up & Connect</h3>
              <p className="text-gray-600">
                Create your account and connect your farm data through our easy-to-use interface.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Analysis</h3>
              <p className="text-gray-600">
                Our AI analyzes your data and provides personalized recommendations for optimal farming.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Optimize & Grow</h3>
              <p className="text-gray-600">
                Implement recommendations and watch your yields increase while saving water and resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Farmers Are Saying
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of farmers who have transformed their agricultural practices
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Join thousands of farmers who are already using AI to optimize their agricultural practices 
            and build a sustainable future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/register')}
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">AgriSmart</span>
              </div>
              <p className="text-gray-400">
                Revolutionizing agriculture through AI and IoT technology.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Plant Disease Detection</li>
                <li>Smart Irrigation</li>
                <li>Heat Alerts</li>
                <li>Zone Management</li>
                <li>AI Agricultural Consultant</li>
                <li>Analytics Dashboard</li>
                <li>AI Recommendations</li>
                <li>Smart Alerts</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Help Center</li>
                <li>Community</li>
                <li>Contact Us</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AgriSmart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
