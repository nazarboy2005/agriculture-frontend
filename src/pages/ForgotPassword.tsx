import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, ArrowLeft, Loader } from 'lucide-react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    
    try {
      await authApi.forgotPassword(email);
      setIsEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Forgot Password
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            {isEmailSent ? 'Check your email for reset instructions' : 'Enter your email to reset your password'}
          </p>
        </div>

        {/* Reset Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {isEmailSent ? 'Email Sent!' : 'Reset Password'}
            </h3>
            <p className="text-gray-600">
              {isEmailSent 
                ? 'We\'ve sent you a password reset link' 
                : 'We\'ll send you a link to reset your password'
              }
            </p>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {!isEmailSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  leftIcon={<Mail className="h-4 w-4" />}
                  required
                />

                <Button
                  type="submit"
                  loading={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <Mail className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Check Your Email</h4>
                  <p className="text-gray-600 mt-2">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    The link will expire in 1 hour for security reasons.
                  </p>
                </div>
                <div className="pt-4">
                  <Button 
                    onClick={() => setIsEmailSent(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Try Different Email
                  </Button>
                </div>
              </div>
            )}

            {/* Back to Login */}
            <div className="text-center pt-4 border-t border-gray-200">
              <Link
                to="/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
