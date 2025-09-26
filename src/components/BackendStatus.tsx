import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface BackendStatusProps {
  showDetails?: boolean;
}

const BackendStatus: React.FC<BackendStatusProps> = ({ showDetails = false }) => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline' | 'error'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkBackendStatus = async () => {
    setStatus('checking');
    setError(null);
    
    try {
      // Try to reach a simple endpoint
      const response = await api.get('/v1/auth/me', { timeout: 5000 });
      setStatus('online');
      setLastCheck(new Date());
    } catch (err: any) {
      console.error('Backend status check failed:', err);
      setStatus('error');
      setError(err.message || 'Unknown error');
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking...';
      case 'online':
        return 'Backend Online';
      case 'offline':
        return 'Backend Offline';
      case 'error':
        return 'Backend Error';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'text-blue-600';
      case 'online':
        return 'text-green-600';
      case 'offline':
        return 'text-red-600';
      case 'error':
        return 'text-yellow-600';
    }
  };

  if (!showDetails) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        {getStatusIcon()}
        <span className={getStatusColor()}>{getStatusText()}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`font-medium ${getStatusColor()}`}>{getStatusText()}</span>
        </div>
        <button
          onClick={checkBackendStatus}
          className="p-1 hover:bg-gray-100 rounded"
          disabled={status === 'checking'}
        >
          <RefreshCw className={`h-4 w-4 ${status === 'checking' ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {lastCheck && (
        <p className="text-xs text-gray-500 mb-2">
          Last checked: {lastCheck.toLocaleTimeString()}
        </p>
      )}
      
      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {status === 'error' && (
        <div className="mt-3 text-xs text-gray-600">
          <p><strong>Possible causes:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Backend server is down</li>
            <li>Network connectivity issues</li>
            <li>API endpoint not responding</li>
            <li>Authentication service unavailable</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default BackendStatus;

