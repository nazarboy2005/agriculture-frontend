import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Target,
  Settings,
  Edit,
  Save,
  X,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { zoneService } from '../services/zoneService';
import toast from 'react-hot-toast';

interface FarmerZone {
  id: string;
  name: string;
  lat: string;
  lng: string;
  description: string;
  createdAt: string;
}

const ZoneManagement: React.FC = () => {
  const { user } = useAuth();
  const [farmerZones, setFarmerZones] = useState<FarmerZone[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [newZone, setNewZone] = useState({ name: '', lat: '', lng: '', description: '' });
  const [editZone, setEditZone] = useState({ name: '', lat: '', lng: '', description: '' });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

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
      setShowAddModal(false);
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
      toast.success('Zone deleted successfully!');
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error('Failed to delete zone');
    }
  };

  const handleEditZone = (zone: FarmerZone) => {
    setEditingZone(zone.id);
    setEditZone({
      name: zone.name,
      lat: zone.lat,
      lng: zone.lng,
      description: zone.description
    });
  };

  const handleSaveEdit = async (zoneId: string) => {
    if (!user || !editZone.name || !editZone.lat || !editZone.lng) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const zoneData = {
        name: editZone.name,
        latitude: parseFloat(editZone.lat),
        longitude: parseFloat(editZone.lng),
        description: editZone.description
      };

      await zoneService.updateZone(user.id, parseInt(zoneId), zoneData);
      
      setFarmerZones(prev => prev.map(z => 
        z.id === zoneId 
          ? { ...z, name: editZone.name, lat: editZone.lat, lng: editZone.lng, description: editZone.description }
          : z
      ));
      
      setEditingZone(null);
      toast.success('Zone updated successfully!');
    } catch (error) {
      console.error('Error updating zone:', error);
      toast.error('Failed to update zone');
    }
  };

  const handleCancelEdit = () => {
    setEditingZone(null);
    setEditZone({ name: '', lat: '', lng: '', description: '' });
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
          <h1 className="text-3xl font-bold text-secondary-900">Zone Management</h1>
          <p className="text-secondary-600 mt-1">
            Manage your farming zones and locations for precise monitoring
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Zone
          </Button>
        </div>
      </div>

      {/* Zones Grid */}
      {farmerZones.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">No Zones Added Yet</h3>
            <p className="text-secondary-600 mb-6">
              Add your first farming zone to start monitoring heat alerts and irrigation recommendations.
            </p>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Zone
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmerZones.map((zone) => (
            <Card key={zone.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  {editingZone === zone.id ? (
                    <Input
                      value={editZone.name}
                      onChange={(e) => setEditZone({ ...editZone, name: e.target.value })}
                      className="text-lg font-semibold"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-secondary-900">
                      {zone.name}
                    </h3>
                  )}
                  <div className="flex space-x-1">
                    {editingZone === zone.id ? (
                      <>
                        <Button
                          onClick={() => handleSaveEdit(zone.id)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                          title="Save changes"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => handleEditZone(zone)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          title="Edit zone"
                        >
                          <Edit className="h-4 w-4" />
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
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-secondary-500" />
                    <span className="text-sm text-secondary-600">
                      {zone.lat}, {zone.lng}
                    </span>
                  </div>
                  
                  {editingZone === zone.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editZone.description}
                        onChange={(e) => setEditZone({ ...editZone, description: e.target.value })}
                        placeholder="Zone description"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          value={editZone.lat}
                          onChange={(e) => setEditZone({ ...editZone, lat: e.target.value })}
                          placeholder="Latitude"
                        />
                        <Input
                          type="number"
                          value={editZone.lng}
                          onChange={(e) => setEditZone({ ...editZone, lng: e.target.value })}
                          placeholder="Longitude"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      {zone.description && (
                        <p className="text-sm text-secondary-600">
                          {zone.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-secondary-500" />
                        <span className="text-xs text-secondary-500">
                          Created {new Date(zone.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Zone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Add New Zone</h3>
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
                <label className="block text-sm font-medium text-secondary-700 mb-2">Description</label>
                <Input
                  value={newZone.description}
                  onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                  placeholder="e.g., Main tomato field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="flex gap-2 mt-6">
              <Button 
                onClick={handleAddZone}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Zone
              </Button>
              <Button 
                onClick={() => {
                  setShowAddModal(false);
                  setNewZone({ name: '', lat: '', lng: '', description: '' });
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneManagement;
