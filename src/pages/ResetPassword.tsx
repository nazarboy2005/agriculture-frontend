import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isResetting, setIsResetting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    label: string;
    color: string;
  }>({ score: 0, label: '', color: '' });

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
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

    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
      return;
    }

    setIsResetting(true);
    
    try {
      await authApi.resetPassword({
        token,
        password: formData.password
      });
      
      setIsSuccess(true);
      toast.success('Password reset successfully! You can now log in with your new password.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Check for specific error types
      if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        setError('This reset link has expired or is invalid. Please request a new password reset.');
      } else if (errorMessage.includes('weak') || errorMessage.includes('password')) {
        setError('Please choose a stronger password with at least 8 characters.');
      }
    } finally {
      setIsResetting(false);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    let label = '';
    let color = '';

    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) {
      label = 'Very Weak';
      color = 'text-red-600';
    } else if (score === 2) {
      label = 'Weak';
      color = 'text-red-500';
    } else if (score === 3) {
      label = 'Fair';
      color = 'text-yellow-500';
    } else if (score === 4) {
      label = 'Good';
      color = 'text-blue-500';
    } else {
      label = 'Strong';
      color = 'text-green-600';
    }

    return { score, label, color };
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Calculate password strength for password field
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
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
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Reset Password
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            {isSuccess ? 'Password reset successfully!' : 'Enter your new password'}
          </p>
        </div>

        {/* Reset Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {error && !isSuccess ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Reset Failed</h3>
                <p className="text-gray-600">{error}</p>
                <div className="pt-4">
                  <Link to="/forgot-password">
                    <Button variant="outline" className="w-full">
                      Try Again
                    </Button>
                  </Link>
                </div>
              </div>
            ) : isSuccess ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Password Reset!</h3>
                <p className="text-gray-600">
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
                <div className="pt-4">
                  <Link to="/login">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                      Continue to Login
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange('password', e.target.value)
                    }
                    placeholder="Enter your new password"
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
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Password strength:</span>
                        <span className={`font-medium ${passwordStrength.color}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.score <= 1 ? 'bg-red-500' :
                            passwordStrength.score === 2 ? 'bg-red-400' :
                            passwordStrength.score === 3 ? 'bg-yellow-400' :
                            passwordStrength.score === 4 ? 'bg-blue-400' : 'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Input
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange('confirmPassword', e.target.value)
                    }
                    placeholder="Confirm your new password"
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
                  loading={isResetting}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {isResetting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Back to Login */}
            <div className="text-center pt-4 border-t border-gray-200">
              <Link
                to="/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
