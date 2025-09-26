import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import PerformanceMonitor from './components/PerformanceMonitor';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import ConfirmEmail from './pages/ConfirmEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Farmers from './pages/Farmers';
import FarmerDetails from './pages/FarmerDetails';
import Recommendations from './pages/Recommendations';
import Chat from './pages/Chat';
import Alerts from './pages/Alerts';
import SmartIrrigation from './pages/SmartIrrigation';
import HeatAlerts from './pages/HeatAlerts';
import ZoneManagement from './pages/ZoneManagement';
import DiseaseDetection from './pages/DiseaseDetection';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PerformanceMonitor />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
          <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback/google" element={<AuthCallback />} />
        <Route path="/oauth2/redirect" element={<AuthCallback />} />
        <Route path="/auth/confirm-email" element={<ConfirmEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/farmers" element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <Farmers />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/farmers/:id" element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <FarmerDetails />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/recommendations" element={
          <ProtectedRoute>
            <Layout>
              <Recommendations />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <Layout>
              <Chat />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/alerts" element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <Alerts />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/smart-irrigation" element={
          <ProtectedRoute>
            <Layout>
              <SmartIrrigation />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/heat-alerts" element={
          <ProtectedRoute>
            <Layout>
              <HeatAlerts />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/zone-management" element={
          <ProtectedRoute>
            <Layout>
              <ZoneManagement />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/disease-detection" element={
          <Layout>
            <DiseaseDetection />
          </Layout>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <Admin />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
