import React, { useState, useEffect, useCallback } from 'react';
import { 
  Thermometer, 
  AlertTriangle, 
  Sun, 
  Droplets,
  MapPin,
  RefreshCw,
  Bell,
  Settings,
  Plus,
  Trash2,
  Target,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { zoneService } from '../services/zoneService';
import RecommendationGenerator from '../components/RecommendationGenerator';
import toast from 'react-hot-toast';

interface HeatAlert {
  id: string;
  location: string;
  date: string;
  time: string;
  temperature: number;
  heatIndex: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  duration: string;
  recommendations: string[];
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}

interface HourlyHeatData {
  time: string;
  temperature: number;
  humidity: number;
  heatIndex: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
}

interface FarmerZone {
  id: string;
  name: string;
  lat: string;
  lng: string;
  description: string;
  createdAt: string;
}

const HeatAlerts: React.FC = () => {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [realHeatAlerts, setRealHeatAlerts] = useState<HeatAlert[]>([]);
  const [farmerZones, setFarmerZones] = useState<FarmerZone[]>([]);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [newZone, setNewZone] = useState({ name: '', lat: '', lng: '', description: '' });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Use real heat alerts if available, otherwise fetch from API
  const isDemoUser = user?.email === 'test@gmail.com';
  const heatAlerts: HeatAlert[] = realHeatAlerts.length > 0 ? realHeatAlerts : [];

  const hourlyHeatData: HourlyHeatData[] = isDemoUser ? [
    { time: '06:00', temperature: 28, humidity: 70, heatIndex: 30, riskLevel: 'LOW' },
    { time: '08:00', temperature: 32, humidity: 65, heatIndex: 35, riskLevel: 'LOW' },
    { time: '10:00', temperature: 36, humidity: 60, heatIndex: 38, riskLevel: 'MODERATE' },
    { time: '12:00', temperature: 40, humidity: 55, heatIndex: 43, riskLevel: 'HIGH' },
    { time: '14:00', temperature: 42, humidity: 50, heatIndex: 46, riskLevel: 'EXTREME' },
    { time: '16:00', temperature: 38, humidity: 55, heatIndex: 41, riskLevel: 'HIGH' },
    { time: '18:00', temperature: 34, humidity: 60, heatIndex: 36, riskLevel: 'MODERATE' },
    { time: '20:00', temperature: 30, humidity: 65, heatIndex: 32, riskLevel: 'LOW' }
  ] : [];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'EXTREME': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'LOW': return <Sun className="h-4 w-4 text-green-600" />;
      case 'MODERATE': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'HIGH': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'EXTREME': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Thermometer className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleRefreshAlerts = async () => {
    try {
      // Get coordinates from selected zone or use default
      let latitude = 25.2854; // Default Doha coordinates
      let longitude = 51.5310;
      
      if (selectedLocation !== 'All Locations') {
        const selectedZone = farmerZones.find(zone => zone.id === selectedLocation);
        if (selectedZone) {
          latitude = parseFloat(selectedZone.lat);
          longitude = parseFloat(selectedZone.lng);
        }
      }
      
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://agriculture-backend-1077945709935.europe-west1.run.app/api';
      const response = await fetch(`${apiBaseUrl}/v1/smart-irrigation/heat-alerts/${latitude}/${longitude}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch heat alerts');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setDataLoaded(true);
        setRealHeatAlerts(data.data);
        toast.success(`Heat alerts refreshed for ${selectedLocation === 'All Locations' ? 'all locations' : farmerZones.find(z => z.id === selectedLocation)?.name || 'selected zone'}!`);
      } else {
        throw new Error(data.message || 'Failed to fetch alerts');
      }
    } catch (error) {
      console.error('Error fetching heat alerts:', error);
      toast.error('Failed to fetch heat alerts.');
      setDataLoaded(true);
    }
  };

  const handleConfigureAlerts = () => {
    setShowZoneModal(true);
  };

  // Load zones from backend
  const loadZones = useCallback(async () => {
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
      toast.error('Failed to load zones');
    }
  }, [user]);

  // Load zones on component mount
  useEffect(() => {
    if (user) {
      loadZones();
    }
  }, [user, loadZones]);

  // Zone management functions
  const handleAddZone = async () => {
    if (!newZone.name || !newZone.lat || !newZone.lng || !user) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const zoneData = {
        name: newZone.name,
        latitude: parseFloat(newZone.lat),
        longitude: parseFloat(newZone.lng),
        description: newZone.description
      };

      const createdZone = await zoneService.createZone(user.id, zoneData);
      
      const frontendZone: FarmerZone = {
        id: createdZone.id.toString(),
        name: createdZone.name,
        lat: createdZone.latitude.toString(),
        lng: createdZone.longitude.toString(),
        description: createdZone.description,
        createdAt: createdZone.createdAt
      };

      setFarmerZones(prev => [...prev, frontendZone]);
      setNewZone({ name: '', lat: '', lng: '', description: '' });
      setShowZoneModal(false);
      toast.success('Zone added successfully!');
    } catch (error) {
      console.error('Error creating zone:', error);
      toast.error('Failed to create zone');
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!user) return;
    
    try {
      await zoneService.deleteZone(user.id, parseInt(zoneId));
      setFarmerZones(prev => prev.filter(z => z.id !== zoneId));
      if (selectedLocation === zoneId) {
        setSelectedLocation('All Locations');
      }
      toast.success('Zone deleted successfully!');
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error('Failed to delete zone');
    }
  };

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setNewZone(prev => ({
          ...prev,
          lat: lat.toString(),
          lng: lng.toString()
        }));
        
        setIsGettingLocation(false);
        toast.success('Location detected successfully!');
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = 'Unable to retrieve your location. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        
        setLocationError(errorMessage);
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Heat Alerts Dashboard</h1>
          <p className="text-secondary-600">Monitor heat stress and protect your crops</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button onClick={handleRefreshAlerts} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleConfigureAlerts} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-secondary-700 mb-2">Location</label>
              <div className="flex gap-2">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="flex-1 p-2 border border-secondary-300 rounded-md"
                >
                  <option value="All Locations">All Locations</option>
                  {farmerZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => setShowZoneModal(true)}
                  variant="outline"
                  size="sm"
                  title="Manage Zones"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-secondary-700 mb-2">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {!dataLoaded && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Thermometer className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">Heat Alerts Dashboard</h3>
            <p className="text-secondary-600 mb-6">
              Click "Refresh" to load heat alert data for your location and date.
            </p>
            <Button onClick={handleRefreshAlerts} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Load Heat Alerts
            </Button>
          </CardContent>
        </Card>
      )}

      {dataLoaded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Alerts */}
          <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-secondary-900">Active Heat Alerts</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {heatAlerts.filter(alert => alert.status === 'ACTIVE').map((alert) => (
                <div key={alert.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-secondary-500" />
                      <span className="font-medium text-secondary-900">{alert.location}</span>
                    </div>
                    <Badge className={getRiskColor(alert.riskLevel)}>
                      {getRiskIcon(alert.riskLevel)}
                      <span className="ml-1">{alert.riskLevel}</span>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-secondary-600">
                        {alert.temperature}°C (Feels like {alert.heatIndex}°C)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-secondary-600">
                        {alert.time} - {alert.duration}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-secondary-900">Recommendations:</h4>
                    <ul className="space-y-1">
                      {alert.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-secondary-600">
                          <span className="text-primary-500 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
              
              {heatAlerts.filter(alert => alert.status === 'ACTIVE').length === 0 && (
                <div className="text-center py-8">
                  <Sun className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-secondary-600">No active heat alerts</p>
                  <p className="text-sm text-secondary-500">All conditions are within safe limits</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Heat Risk */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-secondary-900">Hourly Heat Risk</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hourlyHeatData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-secondary-500" />
                      <span className="font-medium">{data.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{data.temperature}°C</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{data.humidity}%</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRiskColor(data.riskLevel)}>
                      {getRiskIcon(data.riskLevel)}
                      <span className="ml-1">{data.riskLevel}</span>
                    </Badge>
                    <span className="text-xs text-secondary-500">
                      Feels like {data.heatIndex}°C
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Heat Risk Visualization */}
        <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-secondary-900">Heat Risk Timeline</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-secondary-700">Risk Level</span>
              <div className="flex space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-secondary-600">Low</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-secondary-600">Moderate</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-xs text-secondary-600">High</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-secondary-600">Extreme</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              {hourlyHeatData.map((data, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-16 text-sm font-medium text-secondary-700">{data.time}</div>
                  <div className="flex-1 bg-secondary-200 rounded-full h-4 relative">
                    <div 
                      className={`h-4 rounded-full ${
                        data.riskLevel === 'LOW' ? 'bg-green-500' :
                        data.riskLevel === 'MODERATE' ? 'bg-yellow-500' :
                        data.riskLevel === 'HIGH' ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(data.heatIndex / 50) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-20 text-sm text-secondary-600">{data.heatIndex}°C</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips & Warnings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-secondary-900">Tips & Warnings</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">High Heat Risk</p>
                  <p className="text-sm text-secondary-600">Prepare shading and increase irrigation frequency</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Droplets className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">Water Management</p>
                  <p className="text-sm text-secondary-600">Monitor soil moisture and adjust watering schedule</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Sun className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">Sun Protection</p>
                  <p className="text-sm text-secondary-600">Use shade cloths and consider crop rotation</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Bell className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">Emergency Plan</p>
                  <p className="text-sm text-secondary-600">Have emergency cooling measures ready</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        </Card>

        {/* Tips & Warnings */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-secondary-900">Tips & Warnings</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-secondary-900">High Heat Risk</p>
                    <p className="text-sm text-secondary-600">Prepare shading and increase irrigation frequency</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Droplets className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-secondary-900">Water Management</p>
                    <p className="text-sm text-secondary-600">Monitor soil moisture and adjust watering schedule</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Sun className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-secondary-900">Sun Protection</p>
                    <p className="text-sm text-secondary-600">Use shade cloths and consider crop rotation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Bell className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-secondary-900">Emergency Plan</p>
                    <p className="text-sm text-secondary-600">Have emergency cooling measures ready</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Zone Management Modal */}
      {showZoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-secondary-900">Zone Management</h3>
              <Button
                onClick={() => setShowZoneModal(false)}
                variant="outline"
                size="sm"
              >
                Close
              </Button>
            </div>

            {/* Add New Zone Form */}
            <Card className="mb-6">
              <CardHeader>
                <h4 className="text-lg font-semibold text-secondary-900">Add New Zone</h4>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Zone Name</label>
                    <Input
                      value={newZone.name}
                      onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                      placeholder="e.g., North Field, Greenhouse 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Description</label>
                    <Input
                      value={newZone.description}
                      onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                      placeholder="e.g., Main tomato field"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Location</label>
                    <div className="flex gap-2 mb-2">
                      <Button
                        onClick={handleGetCurrentLocation}
                        disabled={isGettingLocation}
                        variant="outline"
                        className="flex-1"
                      >
                        {isGettingLocation ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Getting Location...
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4 mr-2" />
                            Use My Location
                          </>
                        )}
                      </Button>
                    </div>
                    {locationError && (
                      <p className="text-sm text-red-600 mb-2">{locationError}</p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-secondary-600 mb-1">Latitude</label>
                        <Input
                          type="number"
                          step="any"
                          value={newZone.lat}
                          onChange={(e) => setNewZone({ ...newZone, lat: e.target.value })}
                          placeholder="25.2854"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-secondary-600 mb-1">Longitude</label>
                        <Input
                          type="number"
                          step="any"
                          value={newZone.lng}
                          onChange={(e) => setNewZone({ ...newZone, lng: e.target.value })}
                          placeholder="51.5310"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={handleAddZone}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Zone
                  </Button>
                  <Button 
                    onClick={() => setNewZone({ name: '', lat: '', lng: '', description: '' })}
                    variant="outline"
                    className="flex-1"
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Existing Zones */}
            <Card>
              <CardHeader>
                <h4 className="text-lg font-semibold text-secondary-900">Your Zones</h4>
              </CardHeader>
              <CardContent>
                {farmerZones.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-secondary-600 mb-4">No zones added yet</p>
                    <p className="text-sm text-secondary-500">Add your first zone to start monitoring heat alerts</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {farmerZones.map((zone) => (
                      <div key={zone.id} className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-secondary-900">
                            {zone.name}
                          </h5>
                          <div className="flex space-x-1">
                            <Button
                              onClick={() => setSelectedLocation(zone.id)}
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              title="Select this zone"
                            >
                              <Target className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteZone(zone.id)}
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              title="Delete zone"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-secondary-600">
                          <p><strong>Coordinates:</strong> {zone.lat}, {zone.lng}</p>
                          {zone.description && (
                            <p><strong>Description:</strong> {zone.description}</p>
                          )}
                          <p><strong>Created:</strong> {new Date(zone.createdAt).toLocaleDateString()}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Thermometer className="h-4 w-4 text-red-500" />
                            <span className="font-medium text-red-600">
                              Current: {realHeatAlerts.length > 0 ? realHeatAlerts[0].temperature.toFixed(1) : 'N/A'}°C
                            </span>
                          </div>
                        </div>
                        {selectedLocation === zone.id && (
                          <Badge variant="success" className="mt-2">
                            Selected
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Recommendation Generator */}
      <RecommendationGenerator 
        defaultCategory="heat"
        showZoneSelection={true}
        onRecommendationsGenerated={(recommendations) => {
          console.log('Generated heat recommendations:', recommendations);
          toast.success(`Generated ${recommendations.length} heat management recommendations!`);
        }}
      />
    </div>
  );
};

export default HeatAlerts;
