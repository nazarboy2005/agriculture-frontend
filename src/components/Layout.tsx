import React, { useState } from 'react';
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
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
}

const getNavigationItems = (userRole: string) => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Smart Irrigation', href: '/smart-irrigation', icon: Droplets },
    { name: 'Disease Detection', href: '/disease-detection', icon: Search },
    { name: 'Heat Alerts', href: '/heat-alerts', icon: TrendingUp },
    { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
    { name: 'AI Chat', href: '/chat', icon: MessageSquare },
  ];

  // Add admin-specific navigation
  if (userRole === 'ADMIN') {
    baseNavigation.push(
      { name: 'Farmers', href: '/farmers', icon: Users },
      { name: 'Alerts', href: '/alerts', icon: Bell },
      { name: 'Admin', href: '/admin', icon: Settings }
    );
  }

  // Add Zone Management at the bottom for all users
  baseNavigation.push(
    { name: 'Zone Management', href: '/zone-management', icon: MapPin }
  );

  return baseNavigation;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Get navigation items based on user role
  const navigation = getNavigationItems(user?.role || 'USER');

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-secondary-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Droplets className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-secondary-900">AgriSmart</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-secondary-400 hover:text-secondary-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {navigation.map((item, index) => {
                const isActive = location.pathname === item.href;
                const isZoneManagement = item.name === 'Zone Management';
                const showSeparator = isZoneManagement;
                
                return (
                  <li key={item.name}>
                    {showSeparator && (
                      <div className="my-4 border-t border-secondary-200"></div>
                    )}
                    <Link
                      to={item.href}
                      className={cn(
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-primary-100 text-primary-700"
                          : "text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900",
                        isZoneManagement && "mt-2"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0",
                        isActive ? "text-primary-500" : "text-secondary-400 group-hover:text-secondary-500"
                      )} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto bg-white shadow-lg">
          <div className="flex h-16 items-center px-4">
            <Droplets className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-secondary-900">AgriSmart</span>
          </div>
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {navigation.map((item, index) => {
                const isActive = location.pathname === item.href;
                const isZoneManagement = item.name === 'Zone Management';
                const showSeparator = isZoneManagement;
                
                return (
                  <li key={item.name}>
                    {showSeparator && (
                      <div className="my-4 border-t border-secondary-200"></div>
                    )}
                    <Link
                      to={item.href}
                      className={cn(
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-primary-100 text-primary-700"
                          : "text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900",
                        isZoneManagement && "mt-2"
                      )}
                    >
                      <item.icon className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0",
                        isActive ? "text-primary-500" : "text-secondary-400 group-hover:text-secondary-500"
                      )} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-secondary-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-secondary-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-secondary-900">
                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="flex items-center gap-x-2 text-sm text-secondary-600">
                <TrendingUp className="h-4 w-4" />
                <span>System Status: Online</span>
              </div>
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-sm text-secondary-700 hover:text-secondary-900"
                >
                  {user?.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-600" />
                    </div>
                  )}
                  <span className="hidden sm:block">{user?.name}</span>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-secondary-200">
                      <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
                      <p className="text-xs text-secondary-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
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

export default Layout;
