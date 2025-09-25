import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Lightbulb, 
  Search, 
  Calendar,
  Droplets,
  Thermometer,
  CloudRain,
  Sun,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { farmerApi, recommendationApi } from '../services/api';
import { zoneService } from '../services/zoneService';
import { formatDate, formatTemperature, formatHumidity, formatRainfall, formatWaterVolume } from '../utils/format';
import { Recommendation } from '../types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Recommendations: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const [filterRecommendation, setFilterRecommendation] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [farmerZones, setFarmerZones] = useState<any[]>([]);

  const queryClient = useQueryClient();

  const { data: farmersData } = useQuery('farmers', () => farmerApi.getAll());
  const { isLoading } = useQuery(
    'recommendations',
    () => recommendationApi.getByFarmer(1), // This would need to be updated to get all recommendations
    { enabled: false } // Disabled for now since the endpoint needs implementation
  );

  const generateRecommendationMutation = useMutation(
    ({ farmerId, date }: { farmerId: number; date?: string }) =>
      recommendationApi.getAdHoc(farmerId, date),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('recommendations');
        toast.success('Recommendation generated successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to generate recommendation');
      },
    }
  );

  const scheduleRecommendationMutation = useMutation(
    ({ farmerId, date }: { farmerId: number; date?: string }) =>
      recommendationApi.schedule(farmerId, date),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('recommendations');
        toast.success('Recommendation scheduled successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to schedule recommendation');
      },
    }
  );

  const farmers = farmersData?.data?.data || [];
  
  // Load zones for the current user
  useEffect(() => {
    const loadZones = async () => {
      if (!user || !user.id) {
        console.warn('User or user ID not available for loading zones');
        return;
      }
      
      try {
        const zones = await zoneService.getZonesByFarmerId(user.id);
        setFarmerZones(zones.map(zone => ({
          id: zone.id.toString(),
          name: zone.name,
          lat: zone.latitude.toString(),
          lng: zone.longitude.toString(),
          description: zone.description,
          createdAt: zone.createdAt
        })));
      } catch (error) {
        console.error('Error loading zones:', error);
      }
    };
    
    loadZones();
  }, [user]);
  
  // Mock data for demonstration - only for demo users
  const isDemoUser = user?.email === 'test@gmail.com';
  const mockRecommendations: Recommendation[] = isDemoUser ? [
    {
      id: 1,
      farmerId: user?.id || 1,
      date: new Date().toISOString().split('T')[0],
      cropType: 'Tomato',
      locationName: farmerZones.length > 0 ? farmerZones[0].name : 'Greenhouse 1',
      tempC: 28,
      humidity: 65,
      rainfallMm: 0,
      evapotranspiration: 4.2,
      recommendation: 'MODERATE',
      explanation: 'Tomato-specific recommendation: Moderate irrigation needed. Tomatoes require consistent soil moisture (80-90% field capacity). Current conditions suggest 15-20mm irrigation every 2-3 days. Focus on deep root watering to encourage strong root development.',
      waterSavedLiters: 150,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      farmerId: 2,
      date: new Date().toISOString().split('T')[0],
      cropType: 'Lettuce',
      locationName: 'Field A',
      tempC: 32,
      humidity: 45,
      rainfallMm: 0,
      evapotranspiration: 5.8,
      recommendation: 'HIGH',
      explanation: 'Lettuce-specific recommendation: High irrigation needed immediately. Lettuce has shallow roots and requires frequent, light watering (10-15mm daily). High temperature and low humidity are causing rapid wilting. Water in early morning (6-8 AM) for best absorption and to prevent leaf burn.',
      waterSavedLiters: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      farmerId: 3,
      date: new Date().toISOString().split('T')[0],
      cropType: 'Cucumber',
      locationName: 'Greenhouse 2',
      tempC: 25,
      humidity: 80,
      rainfallMm: 5,
      evapotranspiration: 2.1,
      recommendation: 'LOW',
      explanation: 'Cucumber-specific recommendation: Low irrigation needed. Cucumbers prefer consistent moisture but recent rainfall (5mm) has provided adequate soil moisture. Resume normal watering schedule (8-12mm every 2 days) in 1-2 days. Monitor for signs of overwatering.',
      waterSavedLiters: 300,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      farmerId: 1,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      cropType: 'Pepper',
      locationName: 'Field B',
      tempC: 30,
      humidity: 55,
      rainfallMm: 0,
      evapotranspiration: 4.8,
      recommendation: 'MODERATE',
      explanation: 'Pepper-specific recommendation: Moderate irrigation needed. Peppers require deep, infrequent watering (15-20mm every 3-4 days) to encourage deep root growth. Current warm conditions suggest increasing frequency to every 2-3 days. Avoid wetting foliage to prevent disease.',
      waterSavedLiters: 75,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 5,
      farmerId: 2,
      date: new Date().toISOString().split('T')[0],
      cropType: 'Spinach',
      locationName: 'Field C',
      tempC: 26,
      humidity: 70,
      rainfallMm: 2,
      evapotranspiration: 3.2,
      recommendation: 'LOW',
      explanation: 'Spinach-specific recommendation: Low irrigation needed. Spinach prefers cool, moist conditions. Recent light rainfall (2mm) combined with moderate humidity provides adequate moisture. Resume light watering (5-8mm every 2-3 days) when soil surface dries.',
      waterSavedLiters: 200,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 6,
      farmerId: 3,
      date: new Date().toISOString().split('T')[0],
      cropType: 'Carrot',
      locationName: 'Field D',
      tempC: 24,
      humidity: 75,
      rainfallMm: 3,
      evapotranspiration: 2.8,
      recommendation: 'LOW',
      explanation: 'Carrot-specific recommendation: Low irrigation needed. Carrots require consistent, moderate moisture for proper root development. Current conditions with light rainfall (3mm) are optimal. Maintain soil moisture at 60-70% field capacity with 10-12mm irrigation every 3-4 days.',
      waterSavedLiters: 180,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ] : [];

  const filteredRecommendations = mockRecommendations.filter(rec => {
    const zone = farmerZones.find(z => z.name === rec.locationName);
    const matchesSearch = rec.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.recommendation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = !filterZone || rec.locationName === filterZone;
    const matchesRecommendation = !filterRecommendation || rec.recommendation === filterRecommendation;
    
    return matchesSearch && matchesZone && matchesRecommendation;
  });

  const handleGenerateRecommendation = (farmerId: number) => {
    generateRecommendationMutation.mutate({ farmerId });
  };

  const handleScheduleRecommendation = (farmerId: number) => {
    scheduleRecommendationMutation.mutate({ farmerId });
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'HIGH':
        return 'error';
      case 'MODERATE':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Smart Recommendations</h1>
          <p className="text-secondary-600 mt-1">
            AI-powered irrigation recommendations based on weather data, crop conditions, and soil analysis
          </p>
          {isDemoUser && (
            <div className="mt-2">
              <Badge variant="info" className="bg-blue-100 text-blue-800">
                Demo Mode - Sample recommendations for test@gmail.com
              </Badge>
            </div>
          )}
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate All
          </Button>
        </div>
      </div>

      {/* How to Get Recommendations Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <Lightbulb className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">How to Get Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-secondary-600">
                <div>
                  <h4 className="font-medium text-secondary-900 mb-1">Automatic Recommendations</h4>
                  <p>Our AI system automatically generates recommendations based on:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Real-time weather data</li>
                    <li>Soil moisture levels</li>
                    <li>Crop growth stage</li>
                    <li>Historical patterns</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-secondary-900 mb-1">Manual Generation</h4>
                  <p>You can also generate recommendations manually by:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Clicking the refresh button for specific farmers</li>
                    <li>Using the Smart Irrigation tool</li>
                    <li>Scheduling regular updates</li>
                    <li>Requesting ad-hoc analysis</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder="Search recommendations..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="input"
            >
              <option value="">All Zones</option>
              {farmerZones.map(zone => (
                <option key={zone.id} value={zone.name}>{zone.name}</option>
              ))}
            </select>
            <select
              value={filterRecommendation}
              onChange={(e) => setFilterRecommendation(e.target.value)}
              className="input"
            >
              <option value="">All Recommendations</option>
              <option value="LOW">Low</option>
              <option value="MODERATE">Moderate</option>
              <option value="HIGH">High</option>
            </select>
            <Input
              type="date"
              value={dateRange}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange(e.target.value)}
              leftIcon={<Calendar className="h-4 w-4" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRecommendations.map((rec) => {
          const zone = farmerZones.find(z => z.name === rec.locationName);
          const isHighPriority = rec.recommendation === 'HIGH';
          const isModeratePriority = rec.recommendation === 'MODERATE';
          const isLowPriority = rec.recommendation === 'LOW';
          
          return (
            <Card key={rec.id} className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
              isHighPriority ? 'border-l-4 border-l-red-500 bg-red-50' : 
              isModeratePriority ? 'border-l-4 border-l-yellow-500 bg-yellow-50' : 
              'border-l-4 border-l-green-500 bg-green-50'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg text-secondary-900">{rec.locationName}</h3>
                      {isHighPriority && <Badge variant="error" className="text-xs">URGENT</Badge>}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-secondary-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(rec.date)}
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">{rec.cropType}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={getRecommendationColor(rec.recommendation) as any} className="text-xs">
                    {rec.recommendation}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Weather Conditions */}
                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-white rounded-lg border">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Thermometer className="h-4 w-4 text-red-500 mr-2" />
                      <span className="font-medium">{formatTemperature(rec.tempC)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CloudRain className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="font-medium">{formatHumidity(rec.humidity)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Droplets className="h-4 w-4 text-blue-400 mr-2" />
                      <span className="font-medium">{formatRainfall(rec.rainfallMm)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Sun className="h-4 w-4 text-orange-500 mr-2" />
                      <span className="font-medium">ET: {rec.evapotranspiration.toFixed(1)}mm</span>
                    </div>
                  </div>
                </div>

                {/* Water Savings */}
                <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Droplets className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">Water Saved</span>
                  </div>
                  <span className="text-lg font-bold text-blue-900">
                    {rec.waterSavedLiters ? formatWaterVolume(rec.waterSavedLiters) : 'N/A'}
                  </span>
                </div>

                {/* Recommendation Summary */}
                <div className="mb-4">
                  <p className="text-sm text-secondary-700 line-clamp-3">
                    {rec.explanation}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      title="View detailed explanation"
                      onClick={() => {
                        alert(`Detailed Recommendation:\n\n${rec.explanation}\n\nWeather Conditions:\n- Temperature: ${rec.tempC}°C\n- Humidity: ${rec.humidity}%\n- Rainfall: ${rec.rainfallMm}mm\n- Evapotranspiration: ${rec.evapotranspiration}mm`);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleGenerateRecommendation(rec.farmerId)}
                      loading={generateRecommendationMutation.isLoading}
                      title="Generate new recommendation"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleScheduleRecommendation(rec.farmerId)}
                    loading={scheduleRecommendationMutation.isLoading}
                    title="Schedule automatic recommendations"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-primary-100">
                <Lightbulb className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Recommendations</p>
                <p className="text-2xl font-bold text-secondary-900">{filteredRecommendations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-success-100">
                <Droplets className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Water Saved</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {formatWaterVolume(filteredRecommendations.reduce((sum, rec) => sum + (rec.waterSavedLiters || 0), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-warning-100">
                <Thermometer className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">High Priority</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {filteredRecommendations.filter(rec => rec.recommendation === 'HIGH').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-info-100">
                <CloudRain className="h-6 w-6 text-info-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Avg. Temperature</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {formatTemperature(filteredRecommendations.reduce((sum, rec) => sum + rec.tempC, 0) / filteredRecommendations.length || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900">Recommendations History</h3>
              <p className="text-sm text-secondary-600 mt-1">
                Track your irrigation recommendations over time and analyze patterns
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export History
              </Button>
              <Button size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Timeline View */}
            <div className="space-y-3">
              {filteredRecommendations.slice(0, 5).map((rec, index) => (
                <div key={rec.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${
                      rec.recommendation === 'HIGH' ? 'bg-red-500' :
                      rec.recommendation === 'MODERATE' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    {index < filteredRecommendations.slice(0, 5).length - 1 && (
                      <div className="w-px h-8 bg-gray-300 ml-1.5 mt-1"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-secondary-900">{rec.locationName}</h4>
                        <Badge variant={getRecommendationColor(rec.recommendation) as any} className="text-xs">
                          {rec.recommendation}
                        </Badge>
                      </div>
                      <span className="text-xs text-secondary-500">{formatDate(rec.date)}</span>
                    </div>
                    <p className="text-sm text-secondary-600 mt-1">{rec.cropType}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-secondary-500">
                      <div className="flex items-center">
                        <Thermometer className="h-3 w-3 mr-1" />
                        {formatTemperature(rec.tempC)}
                      </div>
                      <div className="flex items-center">
                        <CloudRain className="h-3 w-3 mr-1" />
                        {formatHumidity(rec.humidity)}
                      </div>
                      <div className="flex items-center">
                        <Droplets className="h-3 w-3 mr-1" />
                        {rec.waterSavedLiters ? formatWaterVolume(rec.waterSavedLiters) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredRecommendations.length === 0 && (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">No Recommendations Yet</h3>
                <p className="text-secondary-600 mb-4">
                  Generate your first AI-powered irrigation recommendation to get started.
                </p>
                <Button>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Generate Recommendations
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Recommendations;
