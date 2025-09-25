import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Phone,
  MapPin,
  Crop
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { farmerApi } from '../services/api';
import { formatDate, formatPhoneNumber } from '../utils/format';
import { Farmer, CreateFarmerData } from '../types';
import toast from 'react-hot-toast';

const Farmers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCrop, setFilterCrop] = useState('');

  const queryClient = useQueryClient();

  const { data: farmersData, isLoading } = useQuery('farmers', () => farmerApi.getAll());
  const { data: locationsData } = useQuery('locations', () => 
    farmerApi.getByLocation('all').catch(() => ({ data: { data: [] } }))
  );
  const { data: cropsData } = useQuery('crops', () => 
    farmerApi.getByCrop('all').catch(() => ({ data: { data: [] } }))
  );

  const createMutation = useMutation(farmerApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('farmers');
      setShowCreateModal(false);
      toast.success('Farmer created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create farmer');
    },
  });

  const deleteMutation = useMutation(farmerApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('farmers');
      setShowDeleteModal(false);
      setSelectedFarmer(null);
      toast.success('Farmer deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete farmer');
    },
  });

  const farmers = farmersData?.data?.data || [];
  
  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farmer.phone.includes(searchTerm) ||
                         farmer.locationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !filterLocation || farmer.locationName === filterLocation;
    const matchesCrop = !filterCrop || farmer.preferredCrop === filterCrop;
    
    return matchesSearch && matchesLocation && matchesCrop;
  });

  const handleCreateFarmer = (data: CreateFarmerData) => {
    createMutation.mutate(data);
  };

  const handleDeleteFarmer = () => {
    if (selectedFarmer) {
      deleteMutation.mutate(selectedFarmer.id);
    }
  };

  const uniqueLocations = Array.from(new Set(farmers.map(f => f.locationName)));
  const uniqueCrops = Array.from(new Set(farmers.map(f => f.preferredCrop)));

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
          <h1 className="text-2xl font-bold text-secondary-900">Farmers</h1>
          <p className="text-secondary-600">Manage your registered farmers</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Farmer
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder="Search farmers..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="input"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            <select
              value={filterCrop}
              onChange={(e) => setFilterCrop(e.target.value)}
              className="input"
            >
              <option value="">All Crops</option>
              {uniqueCrops.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setFilterLocation('');
              setFilterCrop('');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Farmers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-secondary-900">
              Farmers ({filteredFarmers.length})
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Crop</TableHead>
                <TableHead>SMS Opt-in</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFarmers.map((farmer) => (
                <TableRow key={farmer.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-secondary-900">{farmer.name}</p>
                      <p className="text-sm text-secondary-500">ID: {farmer.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-secondary-400 mr-2" />
                      <span className="text-sm">{formatPhoneNumber(farmer.phone)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-secondary-400 mr-2" />
                      <span className="text-sm">{farmer.locationName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Crop className="h-4 w-4 text-secondary-400 mr-2" />
                      <span className="text-sm">{farmer.preferredCrop}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={farmer.smsOptIn ? 'success' : 'default'}>
                      {farmer.smsOptIn ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Link to={`/farmers/${farmer.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedFarmer(farmer);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Farmer Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Farmer"
        size="md"
      >
        <CreateFarmerForm
          onSubmit={handleCreateFarmer}
          onCancel={() => setShowCreateModal(false)}
          loading={createMutation.isLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Farmer"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            Are you sure you want to delete <strong>{selectedFarmer?.name}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteFarmer}
              loading={deleteMutation.isLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Create Farmer Form Component
interface CreateFarmerFormProps {
  onSubmit: (data: CreateFarmerData) => void;
  onCancel: () => void;
  loading: boolean;
}

const CreateFarmerForm: React.FC<CreateFarmerFormProps> = ({ onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState<CreateFarmerData>({
    name: '',
    phone: '',
    locationName: '',
    latitude: 0,
    longitude: 0,
    preferredCrop: '',
    smsOptIn: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Name"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+1234567890"
          required
        />
        <Input
          label="Location"
          value={formData.locationName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, locationName: e.target.value })}
          required
        />
        <Input
          label="Preferred Crop"
          value={formData.preferredCrop}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, preferredCrop: e.target.value })}
          required
        />
        <Input
          label="Latitude"
          type="number"
          step="any"
          value={formData.latitude}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
          required
        />
        <Input
          label="Longitude"
          type="number"
          step="any"
          value={formData.longitude}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
          required
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="smsOptIn"
          checked={formData.smsOptIn}
          onChange={(e) => setFormData({ ...formData, smsOptIn: e.target.checked })}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
        />
        <label htmlFor="smsOptIn" className="ml-2 text-sm text-secondary-700">
          SMS notifications enabled
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Create Farmer
        </Button>
      </div>
    </form>
  );
};

export default Farmers;
