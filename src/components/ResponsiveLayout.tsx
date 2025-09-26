import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Lightbulb, 
  Bell, 
  Settings, 
  Menu, 
  X,
  Droplets,
  TrendingUp,
  LogOut,
  User,
  MessageSquare,
  MapPin,
  Search,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';
import BackendStatus from './BackendStatus';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const getNavigationItems = (userRole: string) => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, category: 'main' },
    { name: 'Smart Irrigation', href: '/smart-irrigation', icon: Droplets, category: 'main' },
    { name: 'Disease Detection', href: '/disease-detection', icon: Search, category: 'main' },
    { name: 'Heat Alerts', href: '/heat-alerts', icon: TrendingUp, category: 'main' },
    { name: 'Recommendations', href: '/recommendations', icon: Lightbulb, category: 'main' },
    { name: 'AI Chat', href: '/chat', icon: MessageSquare, category: 'main' },
  ];

  // Add admin-specific navigation
  if (userRole === 'ADMIN') {
    baseNavigation.push(
      { name: 'Farmers', href: '/farmers', icon: Users, category: 'admin' },
      { name: 'Alerts', href: '/alerts', icon: Bell, category: 'admin' },
      { name: 'Admin', href: '/admin', icon: Settings, category: 'admin' }
    );
  }

  // Add Zone Management and Settings at the bottom for all users
  baseNavigation.push(
    { name: 'Zone Management', href: '/zone-management', icon: MapPin, category: 'management' },
    { name: 'Settings', href: '/settings', icon: Settings, category: 'management' }
  );

  return baseNavigation;
};

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const location = useLocation();
  const { user, logout } = useAuth();

  // Detect device type
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  // Get navigation items based on user role
  const navigation = getNavigationItems(user?.role || 'USER');

  // Group navigation by category
  const groupedNavigation = navigation.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof navigation>);

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      case 'desktop': return <Monitor className="h-4 w-4" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'main': return 'Main Features';
      case 'admin': return 'Administration';
      case 'management': return 'Management';
      default: return 'Navigation';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      {/* Mobile sidebar overlay */}
      {deviceType === 'mobile' && (
        <div className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="relative flex w-80 max-w-[85vw] flex-col bg-white shadow-2xl transform transition-transform duration-300">
            <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                  <Droplets className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AgriSmart</h1>
                  <p className="text-xs text-gray-500">Smart Agriculture</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="flex-1 px-6 py-6 space-y-6">
              {Object.entries(groupedNavigation).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {getCategoryTitle(category)}
                  </h3>
                  <ul className="space-y-2">
                    {items.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            className={cn(
                              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                              isActive
                                ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg"
                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            )}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <item.icon className={cn(
                              "mr-3 h-5 w-5 flex-shrink-0",
                              isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                            )} />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop/Tablet sidebar */}
      {deviceType !== 'mobile' && (
        <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl border-r border-gray-200">
          <div className="flex h-16 items-center px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AgriSmart</h1>
                <p className="text-xs text-gray-500">Smart Agriculture</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
            {Object.entries(groupedNavigation).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {getCategoryTitle(category)}
                </h3>
                <ul className="space-y-2">
                  {items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={cn(
                            "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                            isActive
                              ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          )}
                        >
                          <item.icon className={cn(
                            "mr-3 h-5 w-5 flex-shrink-0",
                            isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                          )} />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* Main content */}
      <div className={cn(
        "transition-all duration-300",
        deviceType === 'mobile' ? "ml-0" : "ml-64"
      )}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="p-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Device indicator */}
              <div className="hidden sm:flex items-center gap-x-2 text-sm text-gray-600">
                {getDeviceIcon()}
                <span className="capitalize">{deviceType}</span>
              </div>
              
              {/* System status */}
              <BackendStatus />
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 text-sm text-gray-700 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user?.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <p className="text-xs text-blue-600 mt-1">{user?.role}</p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResponsiveLayout;
