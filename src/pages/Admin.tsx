import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Users, 
  Bell, 
  Droplets, 
  TrendingUp, 
  Download, 
  Settings,
  BarChart3,
  FileText,
  Calendar,
  MapPin,
  Crop
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { farmerApi, adminApi } from '../services/api';
import { formatDate, formatNumber, formatWaterVolume } from '../utils/format';

const Admin: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    from: '2024-01-01',
    to: '2024-01-31'
  });
  const [exportFormat, setExportFormat] = useState('json');

  const { data: farmersData } = useQuery('farmers', () => farmerApi.getAll());
  const { data: totalFarmersData } = useQuery('total-farmers', () => farmerApi.getStats.total());
  const { data: smsOptInData } = useQuery('sms-opt-in', () => farmerApi.getStats.smsOptIn());

  const farmers = farmersData?.data?.data || [];
  const totalFarmers = totalFarmersData?.data?.data || 0;
  const smsOptInCount = smsOptInData?.data?.data || 0;

  // Mock data for demonstration
  const mockMetrics = {
    totalFarmers: totalFarmers,
    smsOptInCount: smsOptInCount,
    totalRecommendations: 156,
    waterSaved: 12500,
    activeAlerts: 8,
    successRate: 94.5,
    avgTemperature: 28.5,
    totalLocations: 12,
    topCrop: 'Wheat'
  };

  const mockWaterSavings = [
    { farmerId: 1, farmerName: 'John Doe', totalWaterSaved: 2500, period: 'Last 30 days', recommendations: 15 },
    { farmerId: 2, farmerName: 'Jane Smith', totalWaterSaved: 1800, period: 'Last 30 days', recommendations: 12 },
    { farmerId: 3, farmerName: 'Mike Johnson', totalWaterSaved: 3200, period: 'Last 30 days', recommendations: 18 },
  ];

  const handleExportData = () => {
    // This would trigger the actual export
    console.log('Exporting data...', { dateRange, exportFormat });
  };

  const getLocationStats = () => {
    const locationCounts = farmers.reduce((acc, farmer) => {
      acc[farmer.locationName] = (acc[farmer.locationName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(locationCounts).map(([location, count]) => ({
      location,
      count,
      percentage: (count / farmers.length) * 100
    }));
  };

  const getCropStats = () => {
    const cropCounts = farmers.reduce((acc, farmer) => {
      acc[farmer.preferredCrop] = (acc[farmer.preferredCrop] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(cropCounts).map(([crop, count]) => ({
      crop,
      count,
      percentage: (count / farmers.length) * 100
    }));
  };

  const locationStats = getLocationStats();
  const cropStats = getCropStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Admin Dashboard</h1>
          <p className="text-secondary-600">System overview and administrative controls</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-primary-100">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Farmers</p>
                <p className="text-2xl font-bold text-secondary-900">{mockMetrics.totalFarmers}</p>
                <p className="text-xs text-success-600">+12% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-success-100">
                <Bell className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">SMS Opt-in</p>
                <p className="text-2xl font-bold text-secondary-900">{mockMetrics.smsOptInCount}</p>
                <p className="text-xs text-success-600">{((mockMetrics.smsOptInCount / mockMetrics.totalFarmers) * 100).toFixed(1)}% of farmers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-info-100">
                <Droplets className="h-6 w-6 text-info-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Water Saved</p>
                <p className="text-2xl font-bold text-secondary-900">{formatWaterVolume(mockMetrics.waterSaved)}</p>
                <p className="text-xs text-success-600">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-warning-100">
                <TrendingUp className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Success Rate</p>
                <p className="text-2xl font-bold text-secondary-900">{mockMetrics.successRate}%</p>
                <p className="text-xs text-success-600">Alert delivery</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Water Savings */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-secondary-900">Top Water Savers</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockWaterSavings.map((farmer, index) => (
                <div key={farmer.farmerId} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">{farmer.farmerName}</p>
                      <p className="text-sm text-secondary-600">{farmer.recommendations} recommendations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success-600">{formatWaterVolume(farmer.totalWaterSaved)}</p>
                    <p className="text-xs text-secondary-500">{farmer.period}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location Distribution */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-secondary-900">Location Distribution</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locationStats.map((stat) => (
                <div key={stat.location} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-secondary-400 mr-2" />
                      <span className="text-sm font-medium text-secondary-900">{stat.location}</span>
                    </div>
                    <span className="text-sm text-secondary-600">{stat.count} farmers</span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-secondary-500">{stat.percentage.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Crop Distribution */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-secondary-900">Crop Distribution</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cropStats.map((stat) => (
                <div key={stat.crop} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Crop className="h-4 w-4 text-secondary-400 mr-2" />
                      <span className="text-sm font-medium text-secondary-900">{stat.crop}</span>
                    </div>
                    <span className="text-sm text-secondary-600">{stat.count} farmers</span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2">
                    <div 
                      className="bg-success-600 h-2 rounded-full" 
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-secondary-500">{stat.percentage.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-secondary-900">System Health</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-success-500 rounded-full mr-3" />
                  <span className="text-sm font-medium text-secondary-900">API Status</span>
                </div>
                <Badge variant="success">Online</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-success-500 rounded-full mr-3" />
                  <span className="text-sm font-medium text-secondary-900">Weather Service</span>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-success-500 rounded-full mr-3" />
                  <span className="text-sm font-medium text-secondary-900">SMS Gateway</span>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-warning-500 rounded-full mr-3" />
                  <span className="text-sm font-medium text-secondary-900">Database</span>
                </div>
                <Badge variant="warning">Maintenance</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-secondary-900">Data Export</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label">From Date</label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>
            <div>
              <label className="label">To Date</label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="input"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xlsx">Excel</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleExportData} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-secondary-900">Recent Activity</h3>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{formatDate(new Date().toISOString())}</TableCell>
                <TableCell>Data export initiated</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell><Badge variant="success">Completed</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{formatDate(new Date().toISOString())}</TableCell>
                <TableCell>Bulk SMS sent</TableCell>
                <TableCell>System</TableCell>
                <TableCell><Badge variant="success">Completed</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{formatDate(new Date().toISOString())}</TableCell>
                <TableCell>Weather data updated</TableCell>
                <TableCell>System</TableCell>
                <TableCell><Badge variant="success">Completed</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
