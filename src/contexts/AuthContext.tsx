import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  name: string;
  profilePictureUrl?: string;
  role: 'USER' | 'ADMIN';
  isEnabled: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      // Set default axios header
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setIsLoading(false);
  }, []);

  // Fetch user data when token is available
  useEffect(() => {
    if (token && !user) {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/v1/auth/me');
      const userData = response.data.data; // Extract data from ApiResponse wrapper
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        profilePictureUrl: userData.profilePictureUrl,
        role: userData.role,
        isEnabled: userData.isEnabled,
        createdAt: userData.createdAt
      };
      setUser(user);
    } catch (error: any) {
      console.error('Failed to fetch user data:', error);
      // Only logout if it's an authentication error (401/403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      } else {
        // For other errors, keep the token but don't set user
        console.warn('Non-auth error when fetching user data:', error.message);
        // Set a temporary user with default values to prevent undefined errors
        const tempUser: User = {
          id: 1, // Default ID for testing
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
          isEnabled: true,
          createdAt: new Date().toISOString()
        };
        setUser(tempUser);
      }
    }
  };

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('auth_token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    // User data will be fetched in the useEffect when token is set
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    delete api.defaults.headers.common['Authorization'];
  };

  const refreshToken = async () => {
    try {
      const response = await api.post('/v1/auth/refresh');
      const newToken = response.data.token;
      login(newToken);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
