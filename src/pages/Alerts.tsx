import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Bell, 
  Search, 
  Filter, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { farmerApi, alertApi } from '../services/api';
import { formatDateTime } from '../utils/format';
import { AlertLog } from '../types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Alerts: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const queryClient = useQueryClient();

  const { data: farmersData } = useQuery('farmers', () => farmerApi.getAll());
  const { isLoading } = useQuery(
    'alerts',
    () => alertApi.getByStatus('all'),
    { enabled: false } // Disabled for now since the endpoint needs implementation
  );

  const sendTestAlertMutation = useMutation(
    (farmerId: number) => alertApi.sendTest(farmerId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('alerts');
        toast.success('Test alert sent successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to send test alert');
      },
    }
  );

  const farmers = farmersData?.data?.data || [];
  
  // Mock data for demonstration - only for demo users
  const isDemoUser = user?.email === 'test@gmail.com';
  const mockAlerts: AlertLog[] = isDemoUser ? [
    {
      id: 1,
      farmerId: 1,
      alertType: 'Irrigation',
      message: 'High temperature detected - increase watering frequency',
      status: 'SENT',
      sentAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      farmerId: 2,
      alertType: 'Weather',
      message: 'Rain forecast for tomorrow - reduce irrigation',
      status: 'SENT',
      sentAt: '2024-01-15T09:15:00Z',
    },
    {
      id: 3,
      farmerId: 3,
      alertType: 'System',
      message: 'SMS delivery failed - please check phone number',
      status: 'FAILED',
      sentAt: '2024-01-15T08:45:00Z',
      errorDetails: 'Invalid phone number format',
    },
    {
      id: 4,
      farmerId: 1,
      alertType: 'Heat',
      message: 'Extreme heat warning - take immediate action',
      status: 'PENDING',
      sentAt: '2024-01-15T11:00:00Z',
    },
  ] : [];

  const filteredAlerts = mockAlerts.filter(alert => {
    const farmer = farmers.find(f => f.id === alert.farmerId);
    const matchesSearch = farmer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.alertType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || alert.status === filterStatus;
    const matchesType = !filterType || alert.alertType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSendTestAlert = (farmerId: number) => {
    sendTestAlertMutation.mutate(farmerId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircle className="h-4 w-4 text-success-600" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-error-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-warning-600" />;
      default:
        return <Bell className="h-4 w-4 text-secondary-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Irrigation':
        return <Bell className="h-4 w-4" />;
      case 'Weather':
        return <AlertTriangle className="h-4 w-4" />;
      case 'System':
        return <RefreshCw className="h-4 w-4" />;
      case 'Heat':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
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
          <h1 className="text-2xl font-bold text-secondary-900">Alerts</h1>
          <p className="text-secondary-600">Monitor and manage alert notifications</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Send Alert
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="">All Status</option>
              <option value="SENT">Sent</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input"
            >
              <option value="">All Types</option>
              <option value="Irrigation">Irrigation</option>
              <option value="Weather">Weather</option>
              <option value="System">System</option>
              <option value="Heat">Heat</option>
            </select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setFilterStatus('');
              setFilterType('');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-secondary-900">
              Alert History ({filteredAlerts.length})
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farmer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map((alert) => {
                const farmer = farmers.find(f => f.id === alert.farmerId);
                return (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-secondary-900">{farmer?.name || 'Unknown'}</p>
                        <p className="text-sm text-secondary-500">ID: {alert.farmerId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getTypeIcon(alert.alertType)}
                        <span className="ml-2 text-sm">{alert.alertType}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-secondary-900 truncate">{alert.message}</p>
                        {alert.errorDetails && (
                          <p className="text-xs text-error-600 mt-1">{alert.errorDetails}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(alert.status)}
                        <Badge variant={getStatusColor(alert.status) as any} className="ml-2">
                          {alert.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-secondary-400 mr-2" />
                        <span className="text-sm">{formatDateTime(alert.sentAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {alert.status === 'FAILED' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSendTestAlert(alert.farmerId)}
                            loading={sendTestAlertMutation.isLoading}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-success-100">
                <CheckCircle className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Sent Successfully</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {filteredAlerts.filter(alert => alert.status === 'SENT').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-error-100">
                <XCircle className="h-6 w-6 text-error-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Failed</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {filteredAlerts.filter(alert => alert.status === 'FAILED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-warning-100">
                <Clock className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Pending</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {filteredAlerts.filter(alert => alert.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-primary-100">
                <Bell className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Alerts</p>
                <p className="text-2xl font-bold text-secondary-900">{filteredAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-secondary-900">Quick Actions</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center p-4 border border-secondary-200 rounded-lg">
              <div className="p-2 rounded-lg bg-primary-100">
                <Send className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-900">Send Test Alert</p>
                <p className="text-xs text-secondary-500">Test SMS delivery</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 border border-secondary-200 rounded-lg">
              <div className="p-2 rounded-lg bg-warning-100">
                <AlertTriangle className="h-5 w-5 text-warning-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-900">Heat Alert</p>
                <p className="text-xs text-secondary-500">Send heat warning</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 border border-secondary-200 rounded-lg">
              <div className="p-2 rounded-lg bg-info-100">
                <Bell className="h-5 w-5 text-info-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-900">Bulk Alert</p>
                <p className="text-xs text-secondary-500">Send to all farmers</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Alerts;
