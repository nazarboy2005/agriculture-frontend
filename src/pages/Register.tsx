import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Droplets, Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';

const Register: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationMethod, setRegistrationMethod] = useState<'email' | 'google'>('email');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsRegistering(true);
    
    try {
      await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // Redirect to email confirmation page with email parameter
      window.location.href = `/auth/confirm-email?email=${encodeURIComponent(formData.email)}&pending=true`;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Droplets className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Smart Agriculture
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Create your account to get started
          </p>
        </div>

        {/* Registration Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <h3 className="text-2xl font-bold text-gray-900">
              Create Account
            </h3>
            <p className="text-gray-600">
              Choose your preferred registration method
            </p>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Registration Method Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setRegistrationMethod('email')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  registrationMethod === 'email'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Email & Password
              </button>
              <button
                onClick={() => setRegistrationMethod('google')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  registrationMethod === 'google'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Google
              </button>
            </div>

            {/* Email Registration Form */}
            {registrationMethod === 'email' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  type="text"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('name', e.target.value)
                  }
                  placeholder="Enter your full name"
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.name}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('email', e.target.value)
                  }
                  placeholder="Enter your email"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email}
                  required
                />

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange('password', e.target.value)
                    }
                    placeholder="Create a password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    error={errors.password}
                    required
                  />
                </div>

                <div className="relative">
                  <Input
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange('confirmPassword', e.target.value)
                    }
                    placeholder="Confirm your password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    error={errors.confirmPassword}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  loading={isRegistering}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {isRegistering ? 'Creating Account...' : (
                    <>
                      Create Account
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Google Registration */}
            {registrationMethod === 'google' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-800">Google OAuth Registration</h4>
                      <p className="text-sm text-blue-600">
                        Create your account using Google for secure authentication.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => {
                    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://agriculture-backend-1077945709935.europe-west1.run.app/api';
                    window.location.href = `${apiBaseUrl}/oauth2/authorization/google`;
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
              >
                Sign in to your account
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {/* Terms */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{' '}
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Privacy Policy
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="text-center group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <Droplets className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Smart Irrigation</h3>
            <p className="text-xs text-gray-600 mt-1">AI-powered water management</p>
          </div>
          <div className="text-center group">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Analytics</h3>
            <p className="text-xs text-gray-600 mt-1">Data-driven insights</p>
          </div>
          <div className="text-center group">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 0115 0v5z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Alerts</h3>
            <p className="text-xs text-gray-600 mt-1">Real-time notifications</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
