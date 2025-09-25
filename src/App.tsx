import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
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
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback/google" element={<AuthCallback />} />
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
