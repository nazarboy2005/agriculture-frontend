import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const AuthCallback: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the token from URL parameters
        const token = searchParams.get('token');
        const success = searchParams.get('success');
        const error = searchParams.get('error');

        if (error) {
          toast.error(`Authentication failed: ${error}`);
          navigate('/login');
          return;
        }

        if (token && success === 'true') {
          login(token);
          toast.success('Login successful!');
          navigate('/');
        } else if (success === 'false') {
          toast.error('Login failed. Please try again.');
          navigate('/login');
        } else {
          // If no parameters, wait a bit and then redirect to login
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [login, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Loader className="h-8 w-8 text-white animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Authenticating...
        </h2>
        <p className="text-gray-600">
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
