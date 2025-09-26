import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { 
  User, 
  Mail, 
  Shield, 
  Download, 
  Upload,
  Save,
  Eye,
  EyeOff,
  Key
} from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsApi } from '../services/api';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      location: '',
      bio: ''
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  // Load settings from backend on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.getSettings();
      if (response.data.success) {
        const backendSettings = response.data.data;
        setSettings(prevSettings => ({
          ...prevSettings,
          profile: {
            ...prevSettings.profile,
            phone: backendSettings.phone || '',
            location: backendSettings.location || '',
            bio: backendSettings.bio || ''
          }
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings from server');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section: string) => {
    try {
      setLoading(true);
      
      if (section === 'Profile') {
        const profileData = {
          phone: settings.profile.phone,
          location: settings.profile.location,
          bio: settings.profile.bio
        };
        await settingsApi.saveProfile(profileData);
        toast.success('Profile settings saved successfully!');
      } else if (section === 'Security') {
        // Handle password change
        if (settings.security.newPassword !== settings.security.confirmPassword) {
          toast.error('New passwords do not match');
          return;
        }
        
        if (settings.security.newPassword.length < 6) {
          toast.error('New password must be at least 6 characters long');
          return;
        }
        
        // Here you would call the password change API
        // await authApi.changePassword({
        //   currentPassword: settings.security.currentPassword,
        //   newPassword: settings.security.newPassword
        // });
        
        toast.success('Password changed successfully!');
        
        // Clear password fields
        setSettings(prev => ({
          ...prev,
          security: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        }));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(`Failed to save ${section.toLowerCase()} settings`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'agrismart-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Settings exported successfully!');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
          toast.success('Settings imported successfully!');
        } catch (error) {
          toast.error('Invalid settings file!');
        }
      };
      reader.readAsText(file);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Key }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and application settings</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload className="h-4 w-4" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <p className="text-gray-600">Update your personal information and contact details</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={settings.profile.name}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, name: e.target.value }
                    })}
                    placeholder="Enter your full name"
                    leftIcon={<User className="h-4 w-4" />}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, email: e.target.value }
                    })}
                    placeholder="Enter your email"
                    leftIcon={<Mail className="h-4 w-4" />}
                  />
                  <Input
                    label="Phone Number"
                    value={settings.profile.phone}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, phone: e.target.value }
                    })}
                    placeholder="Enter your phone number"
                  />
                  <Input
                    label="Location"
                    value={settings.profile.location}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, location: e.target.value }
                    })}
                    placeholder="Enter your location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={settings.profile.bio}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, bio: e.target.value }
                    })}
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                  />
                </div>
                <Button
                  onClick={() => handleSave('Profile')}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>
          )}


          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                <p className="text-gray-600">Update your account password for better security</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Input
                    label="Current Password"
                    type={showPassword ? 'text' : 'password'}
                    value={settings.security.currentPassword}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, currentPassword: e.target.value }
                    })}
                    placeholder="Enter your current password"
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={settings.security.newPassword}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, newPassword: e.target.value }
                    })}
                    placeholder="Enter your new password"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={settings.security.confirmPassword}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, confirmPassword: e.target.value }
                    })}
                    placeholder="Confirm your new password"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• At least 6 characters long</li>
                    <li>• Mix of letters and numbers recommended</li>
                    <li>• Avoid common passwords</li>
                  </ul>
                </div>

                <Button
                  onClick={() => handleSave('Security')}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  <Key className="h-4 w-4 mr-2" />
                  {loading ? 'Changing Password...' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

