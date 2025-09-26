import React, { useState, useEffect, useCallback } from 'react';
import { 
  Droplets, 
  MapPin, 
  Calendar,
  Download,
  Share,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Save,
  History,
  Settings,
  Plus,
  Trash2,
  Star,
  Wind
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { userDataService, IrrigationData } from '../services/userDataService';
import { zoneService } from '../services/zoneService';
import { savedPlanService, SavedIrrigationPlan, SavePlanRequest } from '../services/savedPlanService';
import RecommendationGenerator from '../components/RecommendationGenerator';

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  uvIndex: number;
  heatRisk: 'LOW' | 'MODERATE' | 'HIGH';
}

interface FarmerZone {
  id: string;
  name: string;
  lat: string;
  lng: string;
  description: string;
  createdAt: string;
}

interface IrrigationPlan {
  date: string;
  etc: number;
  liters: number;
  minutes: number;
  time: string;
  heatRisk: 'LOW' | 'MODERATE' | 'HIGH';
  notes: string;
}

const SmartIrrigation: React.FC = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState({ lat: '', lng: '' });
  const [crop, setCrop] = useState('');
  const [area, setArea] = useState('');
  const [irrigationType, setIrrigationType] = useState('');
  const [irrigationRate, setIrrigationRate] = useState('');
  const [emittersPerM2, setEmittersPerM2] = useState('');
  const [soilType, setSoilType] = useState('');
  const [waterBudget, setWaterBudget] = useState('');
  const [planGenerated, setPlanGenerated] = useState(false);
  
  // New state for user data management
  const [savedPlans, setSavedPlans] = useState<SavedIrrigationPlan[]>([]);
  const [showSavedData, setShowSavedData] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveDataName, setSaveDataName] = useState('');
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [realPlanData, setRealPlanData] = useState<any>(null);
  const [farmerZones, setFarmerZones] = useState<FarmerZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [newZone, setNewZone] = useState({ name: '', lat: '', lng: '', description: '' });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Load user data and check if demo user
  useEffect(() => {
    if (user) {
      const demoUser = userDataService.isDemoUser(user.email);
      setIsDemoUser(demoUser);
      
      if (demoUser) {
        // Load demo data for test@gmail.com
        const demoData = userDataService.getDemoData();
        
        // Load default demo data into form
        const defaultData = demoData.find(item => item.isDefault);
        if (defaultData) {
          loadDataIntoForm(defaultData.data);
        }
      } else {
        // Load user's saved data
        userDataService.getUserIrrigationData(user.id);
        
        // Load default data if available
        const defaultData = userDataService.getDefaultIrrigationData(user.id);
        if (defaultData) {
          loadDataIntoForm(defaultData.data);
        }
      }
    }
  }, [user]);

  // Load data into form
  const loadDataIntoForm = (data: IrrigationData) => {
    setLocation(data.location);
    setCrop(data.crop);
    setArea(data.area);
    setIrrigationType(data.irrigationType);
    setIrrigationRate(data.irrigationRate);
    setEmittersPerM2(data.emittersPerM2);
    setSoilType(data.soilType);
    setWaterBudget(data.waterBudget);
  };

  // Mock data for demonstration - only for demo users
  const weatherData: WeatherData = isDemoUser ? {
    temperature: 32,
    humidity: 65,
    rainfall: 0,
    windSpeed: 18,
    uvIndex: 8,
    heatRisk: 'HIGH'
  } : {
    temperature: 0,
    humidity: 0,
    rainfall: 0,
    windSpeed: 0,
    uvIndex: 0,
    heatRisk: 'LOW'
  };

  // Use real plan data if available, otherwise use demo data
  const irrigationPlan: IrrigationPlan[] = realPlanData ? 
    realPlanData.dailyPlans?.map((day: any) => ({
      date: day.date,
      etc: Math.round(day.etc * 100) / 100, // Round to 2 decimal places
      liters: Math.round(day.liters * 10) / 10, // Round to 1 decimal place
      minutes: Math.round(day.minutes), // Round to whole number
      time: day.time,
      heatRisk: day.heatRisk,
      notes: day.notes
    })) || [] :
    (isDemoUser ? [
      { date: '2024-01-15', etc: 3.8, liters: 3.8, minutes: 95, time: '06:10', heatRisk: 'MODERATE', notes: 'Heat 15%' },
      { date: '2024-01-16', etc: 3.8, liters: 3.8, minutes: 95, time: '06:10', heatRisk: 'LOW', notes: 'Normal conditions' },
      { date: '2024-01-17', etc: 3.8, liters: 3.9, minutes: 98, time: '06:30', heatRisk: 'LOW', notes: 'Slight increase' },
      { date: '2024-01-18', etc: 3.8, liters: 4.8, minutes: 120, time: '06:00', heatRisk: 'HIGH', notes: 'High heat risk' },
      { date: '2024-01-19', etc: 5.8, liters: 3.8, minutes: 95, time: '06:00', heatRisk: 'HIGH', notes: 'Extreme heat' }
    ] : []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat: lat.toString(), lng: lng.toString() });
          toast.success('Location detected successfully!');
        },
        (error) => {
          toast.error('Unable to get your location. Please enter manually.');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const handleGeneratePlan = async () => {
    // Validate required fields
    if (!location.lat || !location.lng) {
      toast.error('Please enter your location coordinates');
      return;
    }
    if (!crop) {
      toast.error('Please select a crop');
      return;
    }
    if (!area) {
      toast.error('Please enter the area');
      return;
    }
    if (!irrigationType) {
      toast.error('Please select irrigation type');
      return;
    }
    if (!soilType) {
      toast.error('Please select soil type');
      return;
    }

    // Validate coordinates
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Please enter valid coordinates');
      return;
    }
    
    if (lat < -90 || lat > 90) {
      toast.error('Latitude must be between -90 and 90');
      return;
    }
    
    if (lng < -180 || lng > 180) {
      toast.error('Longitude must be between -180 and 180');
      return;
    }

    try {
      // Call real API to generate irrigation plan
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://agriculture-backend-1077945709935.europe-west1.run.app/api';
      const response = await fetch(`${apiBaseUrl}/v1/smart-irrigation/generate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          cropType: crop,
          area: parseFloat(area),
          irrigationType: irrigationType,
          soilType: soilType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate irrigation plan');
      }

      const data = await response.json();
      
      if (data.success) {
        setPlanGenerated(true);
        toast.success('Irrigation plan generated successfully!');
        // Store the real plan data for display
        setRealPlanData(data.data);
      } else {
        throw new Error(data.message || 'Failed to generate plan');
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error('Failed to generate irrigation plan. Please try again.');
    }
  };


  const handleSavePDF = () => {
    if (!planGenerated || irrigationPlan.length === 0) {
      toast.error('Please generate an irrigation plan first');
      return;
    }

    try {
      // Create a simple HTML content for PDF
      const htmlContent = generateHTMLContent();
      
      // Create a blob and download it
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `irrigation-plan-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      URL.revokeObjectURL(url);
      
      toast.success('PDF file saved successfully!');
    } catch (error) {
      console.error('Error saving PDF:', error);
      toast.error('Failed to save PDF');
    }
  };

  // Generate HTML content for PDF
  const generateHTMLContent = () => {
    const today = new Date().toLocaleDateString();
    const locationName = `${location.lat}, ${location.lng}`;
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Smart Irrigation Plan</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          .schedule { margin-top: 20px; }
          .day { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
          .day-header { font-weight: bold; color: #2c5aa0; }
          .weather-info { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 3px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌱 Smart Irrigation Plan</h1>
          <p>Generated on: ${today}</p>
        </div>
        
        <div class="info">
          <h2>Plan Details</h2>
          <p><strong>Location:</strong> ${locationName}</p>
          <p><strong>Crop:</strong> ${crop}</p>
          <p><strong>Area:</strong> ${area} m²</p>
          <p><strong>Irrigation Type:</strong> ${irrigationType}</p>
          <p><strong>Soil Type:</strong> ${soilType}</p>
        </div>
        
        <div class="schedule">
          <h2>Daily Irrigation Schedule</h2>
    `;
    
    irrigationPlan.forEach((day, index) => {
      html += `
        <div class="day">
          <div class="day-header">Day ${index + 1} - ${day.date}</div>
          <div class="weather-info">
            <p><strong>ETC:</strong> ${day.etc} mm</p>
            <p><strong>Water Required:</strong> ${day.liters} L</p>
            <p><strong>Duration:</strong> ${Math.round(day.minutes)} minutes</p>
            <p><strong>Time:</strong> ${day.time}</p>
            <p><strong>Heat Risk:</strong> ${day.heatRisk}</p>
            <p><strong>Notes:</strong> ${day.notes}</p>
          </div>
        </div>
      `;
    });
    
    html += `
        </div>
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print as PDF</button>
        </div>
      </body>
      </html>
    `;
    
    return html;
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

  // Load saved plans from backend
  const loadSavedPlans = useCallback(async () => {
    if (!user || !user.id) {
      console.warn('User or user ID not available for loading saved plans');
      return;
    }
    
    try {
      const plans = await savedPlanService.getPlansByFarmerId(user.id);
      setSavedPlans(plans);
    } catch (error) {
      console.error('Error loading saved plans:', error);
      toast.error('Failed to load saved plans');
    }
  }, [user]);

  // Load zones on component mount
  useEffect(() => {
    if (user) {
      loadZones();
      loadSavedPlans();
    }
  }, [user, loadZones, loadSavedPlans]);

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

  const handleSelectZone = (zoneId: string) => {
    const zone = farmerZones.find(z => z.id === zoneId);
    if (zone) {
      setLocation({ lat: zone.lat, lng: zone.lng });
      setSelectedZone(zoneId);
      toast.success(`Selected zone: ${zone.name}`);
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

  // Load saved plan data
  const handleLoadSavedPlan = async (planId: number) => {
    if (!user) return;
    
    try {
      const plan = await savedPlanService.getPlanById(user.id, planId);
      setLocation({ lat: plan.locationLat.toString(), lng: plan.locationLng.toString() });
      setCrop(plan.cropType);
      setArea(plan.area.toString());
      setIrrigationType(plan.irrigationType);
      setIrrigationRate(plan.irrigationRate || '');
      setEmittersPerM2(plan.emittersPerM2 || '');
      setSoilType(plan.soilType);
      setWaterBudget(plan.waterBudget || '');
      toast.success(`Loaded plan: ${plan.planName}`);
    } catch (error) {
      console.error('Error loading plan:', error);
      toast.error('Failed to load plan');
    }
  };

  // Delete saved plan
  const handleDeleteSavedPlan = async (planId: number) => {
    if (!user) return;
    
    try {
      await savedPlanService.deletePlan(user.id, planId);
      setSavedPlans(prev => prev.filter(p => p.id !== planId));
      toast.success('Plan deleted successfully!');
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete plan');
    }
  };

  // Set plan as default
  const handleSetDefaultPlan = async (planId: number) => {
    if (!user) return;
    
    try {
      await savedPlanService.setAsDefault(user.id, planId);
      setSavedPlans(prev => prev.map(p => ({ ...p, isDefault: p.id === planId })));
      toast.success('Plan set as default!');
    } catch (error) {
      console.error('Error setting plan as default:', error);
      toast.error('Failed to set plan as default');
    }
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  // Save current form data
  const handleSaveData = async () => {
    if (!user) return;
    
    try {
      const planData: SavePlanRequest = {
        farmerId: user.id,
        planName: saveDataName,
        locationLat: parseFloat(location.lat),
        locationLng: parseFloat(location.lng),
        cropType: crop,
        area: parseFloat(area),
        irrigationType: irrigationType,
        irrigationRate: irrigationRate,
        emittersPerM2: emittersPerM2,
        soilType: soilType,
        waterBudget: waterBudget,
        isDefault: false
      };

      const savedPlan = await savedPlanService.savePlan(planData);
      setSavedPlans(prev => [savedPlan, ...prev]);
      setShowSaveModal(false);
      setSaveDataName('');
      toast.success('Plan saved successfully!');
    } catch (error: any) {
      console.error('Error saving plan:', error);
      toast.error(error.response?.data?.message || 'Failed to save plan');
    }
  };


  const getHeatRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHeatRiskIcon = (risk: string) => {
    switch (risk) {
      case 'LOW': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'MODERATE': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'HIGH': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Smart Irrigation & Heat-stress Advisor
        </h1>
        <p className="text-secondary-600">
          Location-aware watering plan and heat alerts for the next 7 days
        </p>
        {isDemoUser && (
          <div className="mt-2">
            <Badge variant="info" className="bg-blue-100 text-blue-800">
              Demo Mode - Sample data for test@gmail.com
            </Badge>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button 
          onClick={handleGeneratePlan}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
        >
          <Droplets className="h-5 w-5 mr-2" />
          Generate Plan
        </Button>
        
        {user && (
          <>
            <Button 
              onClick={() => setShowSaveModal(true)}
              variant="outline"
              className="px-6 py-3"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Current Data
            </Button>
            
            <Button 
              onClick={() => setShowSavedData(!showSavedData)}
              variant="outline"
              className="px-6 py-3"
            >
              <History className="h-5 w-5 mr-2" />
              {showSavedData ? 'Hide' : 'Show'} Saved Data
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-secondary-900">Inputs</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Zone Selection */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Select Zone</label>
                <div className="space-y-2">
                  {farmerZones.length > 0 ? (
                    <div className="space-y-2">
                      <select
                        value={selectedZone}
                        onChange={(e) => handleSelectZone(e.target.value)}
                        className="w-full p-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a zone</option>
                        {farmerZones.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name} ({zone.lat}, {zone.lng})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-gray-300 rounded-md text-center">
                      <p className="text-sm text-gray-600 mb-2">No zones added yet</p>
                      <Button 
                        onClick={() => setShowZoneModal(true)}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Your First Zone
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setShowZoneModal(true)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Zone
                    </Button>
                    <Button 
                      onClick={getUserLocation}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Use My Location
                    </Button>
                  </div>
                </div>
              </div>

              {/* Crop */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Crop</label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full p-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a crop</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Cucumber">Cucumber</option>
                  <option value="Lettuce">Lettuce</option>
                  <option value="Pepper">Pepper</option>
                </select>
                {!crop && (
                  <p className="text-sm text-red-600 mt-1">Please select a crop</p>
                )}
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Area (m²)</label>
                <Input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Enter area in square meters"
                />
              </div>

              {/* Irrigation */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Irrigation</label>
                <div className="flex gap-2">
                  <select
                    value={irrigationType}
                    onChange={(e) => setIrrigationType(e.target.value)}
                    className="flex-1 p-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select irrigation type</option>
                    <option value="Drip">Drip</option>
                    <option value="Sprinkler">Sprinkler</option>
                    <option value="Flood">Flood</option>
                  </select>
                  <Input
                    type="number"
                    value={irrigationRate}
                    onChange={(e) => setIrrigationRate(e.target.value)}
                    placeholder="L/h"
                    className="w-20"
                  />
                </div>
                {!irrigationType && (
                  <p className="text-sm text-red-600 mt-1">Please select irrigation type</p>
                )}
              </div>

              {/* Emitters per m² */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Emitters per m²</label>
                <Input
                  type="number"
                  value={emittersPerM2}
                  onChange={(e) => setEmittersPerM2(e.target.value)}
                  placeholder="Number of emitters per square meter"
                />
              </div>

              {/* Soil */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Soil</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full p-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select soil type</option>
                  <option value="Sandy">Sandy</option>
                  <option value="Clay">Clay</option>
                  <option value="Loam">Loam</option>
                  <option value="Silt">Silt</option>
                </select>
                {!soilType && (
                  <p className="text-sm text-red-600 mt-1">Please select soil type</p>
                )}
              </div>

              {/* Water Budget */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Water Budget (Optional)</label>
                <Input
                  type="text"
                  value={waterBudget}
                  onChange={(e) => setWaterBudget(e.target.value)}
                  placeholder="L/day"
                />
              </div>

              <Button 
                onClick={handleGeneratePlan}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Droplets className="h-4 w-4 mr-2" />
                Generate Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel - Only show after plan is generated */}
        {planGenerated && (
          <div className="lg:col-span-2 space-y-6">
            {/* Today at a Glance */}
            <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-secondary-900">Today at a Glance</h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-5 w-5 text-blue-600" />
                    <span className="text-lg font-semibold">
                      Water - {irrigationPlan.length > 0 ? `${Math.round(irrigationPlan[0].minutes)} min at ${irrigationPlan[0].time}` : '95 min at 06:10'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSavePDF} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Save PDF
                  </Button>
                  <Button onClick={handleShareLink} variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-1" />
                    Share Link
                  </Button>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Badge className={`${irrigationPlan.length > 0 ? getHeatRiskColor(irrigationPlan[0].heatRisk) : getHeatRiskColor(weatherData.heatRisk)} flex items-center space-x-1`}>
                  {irrigationPlan.length > 0 ? getHeatRiskIcon(irrigationPlan[0].heatRisk) : getHeatRiskIcon(weatherData.heatRisk)}
                  <span>Heat risk {irrigationPlan.length > 0 ? irrigationPlan[0].heatRisk : weatherData.heatRisk}</span>
                </Badge>
                <Badge variant="info" className="flex items-center space-x-1">
                  <Wind className="h-4 w-4" />
                  <span>Windy {weatherData.windSpeed}-{weatherData.windSpeed + 2}</span>
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Hourly Heat Risk */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-secondary-900">Hourly Heat Risk</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {irrigationPlan.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-secondary-500" />
                        <span className="text-sm font-medium">{day.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">ETC {day.etc} mm</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">{day.liters.toLocaleString()} L</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">{Math.round(day.minutes)} min at {day.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getHeatRiskColor(day.heatRisk)}>
                        {day.heatRisk}
                      </Badge>
                      <span className="text-xs text-secondary-500">{day.notes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips & Warnings */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-secondary-900">Tips & Warnings</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <span className="text-sm text-secondary-700">Limit irrigation for wet conditions</span>
                </div>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <span className="text-sm text-secondary-700">High heat risk: Prepare shading</span>
                </div>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <span className="text-sm text-secondary-700">No irrigation under cold weather</span>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        )}
      </div>

      {/* Saved Data Section */}
      {showSavedData && user && (
        <div className="space-y-6">
          {/* Backend Saved Plans */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
                <History className="h-5 w-5 mr-2" />
                Your Saved Irrigation Plans
              </h3>
            </CardHeader>
            <CardContent>
              {savedPlans.length === 0 ? (
                <p className="text-secondary-600 text-center py-4">No saved plans yet. Create your first irrigation plan!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedPlans.map((plan) => (
                    <div key={plan.id} className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-secondary-900 flex items-center">
                          {plan.planName}
                          {plan.isDefault && <Star className="h-4 w-4 text-yellow-500 ml-1" />}
                        </h4>
                        <div className="flex space-x-1">
                          <Button
                            onClick={() => handleLoadSavedPlan(plan.id)}
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteSavedPlan(plan.id)}
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-secondary-600">
                        <p><strong>Crop:</strong> {plan.cropType}</p>
                        <p><strong>Area:</strong> {plan.area} m²</p>
                        <p><strong>Location:</strong> {plan.locationLat}, {plan.locationLng}</p>
                        <p><strong>Soil:</strong> {plan.soilType}</p>
                        <p><strong>Created:</strong> {new Date(plan.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button
                          onClick={() => handleLoadSavedPlan(plan.id)}
                          size="sm"
                          className="flex-1"
                        >
                          Load
                        </Button>
                        {!plan.isDefault && (
                          <Button
                            onClick={() => handleSetDefaultPlan(plan.id)}
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            Set Default
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      )}


      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Save Irrigation Data</h3>
            <div className="space-y-4">
              <Input
                label="Name for this data"
                value={saveDataName}
                onChange={(e) => setSaveDataName(e.target.value)}
                placeholder="e.g., North Field - Summer Plan"
                required
              />
              <div className="flex space-x-3">
                <Button
                  onClick={handleSaveData}
                  className="flex-1"
                  disabled={!saveDataName.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setShowSaveModal(false);
                    setSaveDataName('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zone Management Modal */}
      {showZoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Zone</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Zone Name</label>
                <Input
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                  placeholder="e.g., North Field, Greenhouse 1"
                />
              </div>
              <div>
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
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Description (Optional)</label>
                <Input
                  value={newZone.description}
                  onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                  placeholder="e.g., Main tomato field"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button 
                onClick={handleAddZone}
                className="flex-1"
              >
                Add Zone
              </Button>
              <Button 
                onClick={() => setShowZoneModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Generator */}
      <RecommendationGenerator 
        defaultCategory="irrigation"
        showZoneSelection={true}
        onRecommendationsGenerated={(recommendations) => {
          console.log('Generated irrigation recommendations:', recommendations);
          toast.success(`Generated ${recommendations.length} irrigation recommendations!`);
        }}
      />
    </div>
  );
};

export default SmartIrrigation;
