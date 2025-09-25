import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Lightbulb, 
  Droplets, 
  Bell, 
  TrendingUp, 
  CloudRain,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import RoleGuard from '../components/RoleGuard';
import { farmerApi, alertApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: farmersData, isLoading: farmersLoading } = useQuery('farmers-stats', () => farmerApi.getStats.total());
  const { data: smsOptInData, isLoading: smsLoading } = useQuery('sms-opt-in-stats', () => farmerApi.getStats.smsOptIn());
  const { data: alertsData, isLoading: alertsLoading } = useQuery('alerts-stats', () => alertApi.getStats.successful(1));

  const isAdmin = user?.role === 'ADMIN';

  const stats = isAdmin ? [
    {
      name: 'Total Farmers',
      value: farmersData?.data?.data || 0,
      icon: Users,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      name: 'SMS Opt-in',
      value: smsOptInData?.data?.data || 0,
      icon: Bell,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
    },
    {
      name: 'Active Recommendations',
      value: alertsData?.data?.data || 0,
      icon: Lightbulb,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
    },
    {
      name: 'Water Saved Today',
      value: '0 L',
      icon: Droplets,
      color: 'text-info-600',
      bgColor: 'bg-info-100',
    },
  ] : [
    {
      name: 'My Recommendations',
      value: 0,
      icon: Lightbulb,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
    },
    {
      name: 'Water Saved Today',
      value: '0 L',
      icon: Droplets,
      color: 'text-info-600',
      bgColor: 'bg-info-100',
    },
    {
      name: 'Active Alerts',
      value: 0,
      icon: Bell,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
    },
    {
      name: 'Chat Sessions',
      value: 0,
      icon: Users,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
  ];

  // Real data will be fetched from APIs when available

  if (farmersLoading || smsLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">
          {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
        </h1>
        <p className="text-secondary-600">
          {isAdmin 
            ? 'Overview of your agriculture management system' 
            : 'Your personal agriculture assistant and recommendations'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Empty State */}
      <RoleGuard allowedRoles={['ADMIN']}>
        {farmersData?.data?.data === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Welcome to Smart Agriculture!</h3>
              <p className="text-secondary-600 mb-6">
                Get started by adding your first farmer to begin managing irrigation recommendations and alerts.
              </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/farmers')}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                <Users className="h-4 w-4 mr-2" />
                Add Your First Farmer
              </Button>
              <Button 
                onClick={() => navigate('/recommendations')}
                variant="outline"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Learn More
              </Button>
            </div>
            </CardContent>
          </Card>
        )}
      </RoleGuard>

      {/* User-specific empty state */}
      <RoleGuard allowedRoles={['USER']}>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lightbulb className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">Welcome to Smart Agriculture!</h3>
            <p className="text-secondary-600 mb-6">
              Start exploring AI-powered recommendations and chat with our agricultural assistant to optimize your farming.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/smart-irrigation')}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                <Droplets className="h-4 w-4 mr-2" />
                Smart Irrigation
              </Button>
              <Button 
                onClick={() => navigate('/heat-alerts')}
                variant="outline"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Heat Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </RoleGuard>

      {/* User-specific content sections - Only show if user has data */}
      <RoleGuard allowedRoles={['USER']}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* My Recommendations */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-secondary-900">My Recent Recommendations</h3>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-secondary-500">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-secondary-300" />
                <p className="text-sm">No recommendations yet. Start by exploring Smart Irrigation to get personalized recommendations.</p>
              </div>
            </CardContent>
          </Card>

          {/* My Progress */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-secondary-900">My Progress</h3>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-secondary-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-secondary-300" />
                <p className="text-sm">Start using the system to track your progress and water savings.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </RoleGuard>

      {/* Admin-only sections */}
      <RoleGuard allowedRoles={['ADMIN']}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Weather Overview */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-secondary-900">Weather Overview</h3>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-secondary-500">
                <CloudRain className="h-12 w-12 mx-auto mb-4 text-secondary-300" />
                <p className="text-sm">Weather data will appear here once farmers are added and zones are configured.</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-secondary-900">Recent Alerts</h3>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-secondary-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-secondary-300" />
                <p className="text-sm">Alerts will appear here once the system starts monitoring and sending notifications.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </RoleGuard>

      {/* Admin Quick Actions */}
      <RoleGuard allowedRoles={['ADMIN']}>
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-secondary-900">Quick Actions</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button 
                onClick={() => navigate('/farmers')}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors bg-white"
              >
                <Users className="h-6 w-6 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Add Farmer</span>
              </button>
              <button 
                onClick={() => navigate('/recommendations')}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors bg-white"
              >
                <Lightbulb className="h-6 w-6 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Generate Recommendation</span>
              </button>
              <button 
                onClick={() => navigate('/alerts')}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors bg-white"
              >
                <Bell className="h-6 w-6 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Send Alert</span>
              </button>
              <button 
                onClick={() => navigate('/admin')}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors bg-white"
              >
                <TrendingUp className="h-6 w-6 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">View Analytics</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </RoleGuard>

      {/* User Quick Actions */}
      <RoleGuard allowedRoles={['USER']}>
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-secondary-900">Quick Actions</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button 
                onClick={() => navigate('/smart-irrigation')}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors bg-white"
              >
                <Droplets className="h-6 w-6 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Smart Irrigation</span>
              </button>
              <button 
                onClick={() => navigate('/heat-alerts')}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors bg-white"
              >
                <TrendingUp className="h-6 w-6 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Heat Alerts</span>
              </button>
              <button 
                onClick={() => navigate('/zone-management')}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors bg-white"
              >
                <MapPin className="h-6 w-6 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Zone Management</span>
              </button>
              <button 
                onClick={() => navigate('/chat')}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors bg-white"
              >
                <Users className="h-6 w-6 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Start AI Chat</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </RoleGuard>
    </div>
  );
};

export default Dashboard;
