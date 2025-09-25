import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Mail, CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

const ConfirmEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('No confirmation token provided');
      setIsConfirming(false);
      return;
    }

    confirmEmail(token);
  }, [searchParams]);

  const confirmEmail = async (token: string) => {
    try {
      await authApi.confirmEmail(token);
      setIsSuccess(true);
      toast.success('Email confirmed successfully! You can now log in.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Email confirmation failed';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Check if it's a token expiry error
      if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        setError('This confirmation link has expired or is invalid. Please request a new confirmation email.');
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handleResendConfirmation = async () => {
    const email = searchParams.get('email');
    if (!email) {
      toast.error('Email not found');
      return;
    }

    try {
      await authApi.resendConfirmation(email);
      toast.success('Confirmation email sent!');
    } catch (error: any) {
      toast.error('Failed to resend confirmation email');
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
            Email Confirmation
          </h2>
        </div>

        {/* Confirmation Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            {isConfirming && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Loader className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Confirming your email...</h3>
                <p className="text-gray-600">Please wait while we verify your email address.</p>
              </div>
            )}

            {isSuccess && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Email Confirmed!</h3>
                <p className="text-gray-600">
                  Your email has been successfully verified. You can now log in to your account.
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
            )}

            {error && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Confirmation Failed</h3>
                <p className="text-gray-600">{error}</p>
                <div className="pt-4 space-y-3">
                  <Button 
                    onClick={handleResendConfirmation}
                    variant="outline"
                    className="w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Confirmation Email
                  </Button>
                  <Link to="/login">
                    <Button variant="ghost" className="w-full">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmEmail;
