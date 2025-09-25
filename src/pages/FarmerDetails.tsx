import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Crop, 
  Bell, 
  Calendar,
  Droplets,
  Thermometer,
  CloudRain,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { farmerApi, recommendationApi, alertApi } from '../services/api';
import { formatDate, formatPhoneNumber } from '../utils/format';

const FarmerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const farmerId = parseInt(id || '0');

  const { data: farmerData, isLoading: farmerLoading } = useQuery(
    ['farmer', farmerId],
    () => farmerApi.getById(farmerId),
    { enabled: !!farmerId }
  );

  const { data: recommendationsData } = useQuery(
    ['recommendations', farmerId],
    () => recommendationApi.getByFarmer(farmerId),
    { enabled: !!farmerId }
  );

  const { data: alertsData } = useQuery(
    ['alerts', farmerId],
    () => alertApi.getByFarmer(farmerId),
    { enabled: !!farmerId }
  );

  const farmer = farmerData?.data?.data;
  const recommendations = recommendationsData?.data?.data || [];
  const alerts = alertsData?.data?.data || [];

  if (farmerLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">Farmer not found</h2>
        <p className="text-secondary-600 mb-6">The farmer you're looking for doesn't exist.</p>
        <Link to="/farmers">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farmers
          </Button>
        </Link>
      </div>
    );
  }

  const recentRecommendations = recommendations.slice(0, 5);
  const recentAlerts = alerts.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/farmers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">{farmer.name}</h1>
            <p className="text-secondary-600">Farmer Details & Analytics</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Send Alert
          </Button>
          <Button>
            <TrendingUp className="h-4 w-4 mr-2" />
            Generate Recommendation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Farmer Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-secondary-900">Farmer Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-secondary-400" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">Phone</p>
                  <p className="text-sm text-secondary-600">{formatPhoneNumber(farmer.phone)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-secondary-400" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">Location</p>
                  <p className="text-sm text-secondary-600">{farmer.locationName}</p>
                  <p className="text-xs text-secondary-500">
                    {farmer.latitude}, {farmer.longitude}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Crop className="h-5 w-5 text-secondary-400" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">Preferred Crop</p>
                  <p className="text-sm text-secondary-600">{farmer.preferredCrop}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-secondary-400" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">SMS Notifications</p>
                  <Badge variant={farmer.smsOptIn ? 'success' : 'default'}>
                    {farmer.smsOptIn ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-secondary-400" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">Registered</p>
                  <p className="text-sm text-secondary-600">{formatDate(farmer.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weather Overview */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-secondary-900">Current Weather</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center space-x-3 p-4 bg-secondary-50 rounded-lg">
                  <Thermometer className="h-6 w-6 text-warning-600" />
                  <div>
                    <p className="text-sm text-secondary-600">Temperature</p>
                    <p className="text-xl font-bold text-secondary-900">28°C</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-secondary-50 rounded-lg">
                  <CloudRain className="h-6 w-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-secondary-600">Humidity</p>
                    <p className="text-xl font-bold text-secondary-900">65%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-secondary-50 rounded-lg">
                  <Droplets className="h-6 w-6 text-info-600" />
                  <div>
                    <p className="text-sm text-secondary-600">Rainfall</p>
                    <p className="text-xl font-bold text-secondary-900">0mm</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Recommendations */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-secondary-900">Recent Recommendations</h3>
            </CardHeader>
            <CardContent>
              {recentRecommendations.length > 0 ? (
                <div className="space-y-4">
                  {recentRecommendations.map((rec, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          rec.recommendation === 'HIGH' 
                            ? 'bg-error-100 text-error-600'
                            : rec.recommendation === 'MODERATE'
                            ? 'bg-warning-100 text-warning-600'
                            : 'bg-success-100 text-success-600'
                        }`}>
                          <Droplets className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900">
                            {rec.recommendation} Irrigation
                          </p>
                          <p className="text-sm text-secondary-600">{rec.explanation}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-secondary-500">{formatDate(rec.date)}</p>
                        <Badge variant={
                          rec.recommendation === 'HIGH' ? 'error' :
                          rec.recommendation === 'MODERATE' ? 'warning' : 'success'
                        }>
                          {rec.recommendation}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Droplets className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                  <p className="text-secondary-600">No recommendations available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-secondary-900">Recent Alerts</h3>
            </CardHeader>
            <CardContent>
              {recentAlerts.length > 0 ? (
                <div className="space-y-4">
                  {recentAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          alert.status === 'SENT' 
                            ? 'bg-success-100 text-success-600'
                            : 'bg-error-100 text-error-600'
                        }`}>
                          <Bell className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900">{alert.alertType}</p>
                          <p className="text-sm text-secondary-600">{alert.message}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-secondary-500">{formatDate(alert.sentAt)}</p>
                        <Badge variant={alert.status === 'SENT' ? 'success' : 'error'}>
                          {alert.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                  <p className="text-secondary-600">No alerts sent</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FarmerDetails;
