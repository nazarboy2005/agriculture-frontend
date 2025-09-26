import axios, { AxiosResponse } from 'axios';
import { 
  Farmer, 
  Recommendation, 
  AlertLog, 
  AdminMetrics, 
  WaterSavings, 
  ApiResponse,
  CreateFarmerData,
  UpdateFarmerData,
  Chat
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://agriculture-backend-1077945709935.europe-west1.run.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout for chat API calls
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    console.log('Request config:', config);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`Response received: ${response.status} for ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle 401 errors (unauthorized) - but not for disease detection
    if (error.response?.status === 401) {
      // Don't redirect for disease detection endpoints
      const isDiseaseDetection = error.config?.url?.includes('/disease/');
      
      if (!isDiseaseDetection) {
        // Clear auth token and redirect to login
        localStorage.removeItem('auth_token');
        delete api.defaults.headers.common['Authorization'];
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Farmer API
export const farmerApi = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Farmer[]>>> =>
    api.get('/v1/farmers'),
  
  getById: (id: number): Promise<AxiosResponse<ApiResponse<Farmer>>> =>
    api.get(`/v1/farmers/${id}`),
  
  getByPhone: (phone: string): Promise<AxiosResponse<ApiResponse<Farmer>>> =>
    api.get(`/v1/farmers/phone/${phone}`),
  
  getByLocation: (location: string): Promise<AxiosResponse<ApiResponse<Farmer[]>>> =>
    api.get(`/v1/farmers/location/${location}`),
  
  getByCrop: (crop: string): Promise<AxiosResponse<ApiResponse<Farmer[]>>> =>
    api.get(`/v1/farmers/crop/${crop}`),
  
  getSmsOptIn: (): Promise<AxiosResponse<ApiResponse<Farmer[]>>> =>
    api.get('/v1/farmers/sms-opt-in'),
  
  create: (data: CreateFarmerData): Promise<AxiosResponse<ApiResponse<Farmer>>> =>
    api.post('/v1/farmers', data),
  
  update: (id: number, data: UpdateFarmerData): Promise<AxiosResponse<ApiResponse<Farmer>>> =>
    api.put(`/v1/farmers/${id}`, data),
  
  delete: (id: number): Promise<AxiosResponse<ApiResponse<void>>> =>
    api.delete(`/v1/farmers/${id}`),
  
  getStats: {
    total: (): Promise<AxiosResponse<ApiResponse<number>>> =>
      api.get('/v1/farmers/stats/total'),
    
    smsOptIn: (): Promise<AxiosResponse<ApiResponse<number>>> =>
      api.get('/v1/farmers/stats/sms-opt-in'),
  },
};

// Recommendation API
export const recommendationApi = {
  getAdHoc: (farmerId: number, date?: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post('/v1/recommendations/ad-hoc', null, {
      params: { farmerId, date }
    }),
  
  schedule: (farmerId: number, date?: string): Promise<AxiosResponse<ApiResponse<string>>> =>
    api.post('/v1/recommendations/schedule', null, {
      params: { farmerId, date }
    }),
  
  getByFarmer: (farmerId: number, fromDate?: string, toDate?: string): Promise<AxiosResponse<ApiResponse<Recommendation[]>>> =>
    api.get(`/v1/recommendations/farmers/${farmerId}`, {
      params: { fromDate, toDate }
    }),
  
  getLatest: (farmerId: number): Promise<AxiosResponse<ApiResponse<Recommendation>>> =>
    api.get(`/v1/recommendations/farmers/${farmerId}/latest`),
};

// Alert API
export const alertApi = {
  sendTest: (farmerId: number): Promise<AxiosResponse<ApiResponse<string>>> =>
    api.post('/v1/alerts/test', null, {
      params: { farmerId }
    }),
  
  getByFarmer: (farmerId: number): Promise<AxiosResponse<ApiResponse<AlertLog[]>>> =>
    api.get(`/v1/alerts/farmers/${farmerId}`),
  
  getByStatus: (status: string): Promise<AxiosResponse<ApiResponse<AlertLog[]>>> =>
    api.get(`/v1/alerts/status/${status}`),
  
  getByType: (type: string): Promise<AxiosResponse<ApiResponse<AlertLog[]>>> =>
    api.get(`/v1/alerts/type/${type}`),
  
  getStats: {
    successful: (farmerId: number, startTime?: string, endTime?: string): Promise<AxiosResponse<ApiResponse<number>>> =>
      api.get('/v1/alerts/stats/successful', {
        params: { farmerId, startTime, endTime }
      }),
    
    failed: (startTime?: string, endTime?: string): Promise<AxiosResponse<ApiResponse<number>>> =>
      api.get('/v1/alerts/stats/failed', {
        params: { startTime, endTime }
      }),
  },
};

// Admin API
export const adminApi = {
  getMetrics: (): Promise<AxiosResponse<ApiResponse<AdminMetrics>>> =>
    api.get('/v1/admin/metrics'),
  
  getWaterSavings: (farmerId: number, from: string, to: string): Promise<AxiosResponse<ApiResponse<WaterSavings>>> =>
    api.get(`/v1/admin/farmers/${farmerId}/water-savings`, {
      params: { from, to }
    }),
  
  exportData: (from: string, to: string, format: string = 'json'): Promise<AxiosResponse<ApiResponse<string>>> =>
    api.get('/v1/admin/data/export', {
      params: { from, to, format }
    }),
  
  getStats: {
    farmers: (): Promise<AxiosResponse<ApiResponse<number>>> =>
      api.get('/v1/admin/stats/farmers'),
    
    smsOptIn: (): Promise<AxiosResponse<ApiResponse<number>>> =>
      api.get('/v1/admin/stats/sms-opt-in'),
  },
};

// Auth API
export const authApi = {
  getCurrentUser: (): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/v1/auth/me'),
  
  register: (data: { name: string; email: string; password: string }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post('/v1/auth/register', data),
  
  login: (data: { email: string; password: string }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post('/v1/auth/login', data),
  
  confirmEmail: (token: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post('/v1/auth/confirm-email', { token }),
  
  resendConfirmation: (email: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post('/v1/auth/resend-confirmation', { email }),
  
  forgotPassword: (email: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post('/v1/auth/forgot-password', { email }),
  
  resetPassword: (data: { token: string; password: string }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post('/v1/auth/reset-password', data),
  
  refreshToken: (): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post('/v1/auth/refresh'),
  
  logout: (): Promise<AxiosResponse<ApiResponse<string>>> =>
    api.post('/v1/auth/logout'),
  
  getGoogleLoginUrl: (): Promise<AxiosResponse<ApiResponse<string>>> =>
    api.get('/v1/auth/login/google'),
};

// Chat API
export const chatApi = {
  sendMessage: (farmerId: number, message: string, messageType: string = 'GENERAL'): Promise<AxiosResponse<ApiResponse<Chat>>> =>
    api.post('/v1/chat/send', null, {
      params: { farmerId, message, messageType },
      timeout: 60000 // 60 seconds timeout for chat messages
    }),
  
  getChatHistory: (farmerId: number): Promise<AxiosResponse<ApiResponse<Chat[]>>> =>
    api.get(`/v1/chat/history/${farmerId}`),
  
  getChatHistoryPaged: (farmerId: number, page: number = 0, size: number = 20): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get(`/v1/chat/history/${farmerId}/paged`, {
      params: { page, size }
    }),
  
  getChatHistoryByType: (farmerId: number, messageType: string): Promise<AxiosResponse<ApiResponse<Chat[]>>> =>
    api.get(`/v1/chat/history/${farmerId}/type/${messageType}`),
  
  searchChatHistory: (farmerId: number, query: string): Promise<AxiosResponse<ApiResponse<Chat[]>>> =>
    api.get(`/v1/chat/search/${farmerId}`, {
      params: { query }
    }),
  
  getRecentChats: (farmerId: number, limit: number = 10): Promise<AxiosResponse<ApiResponse<Chat[]>>> =>
    api.get(`/v1/chat/recent/${farmerId}`, {
      params: { limit }
    }),
  
  updateFeedback: (chatId: number, isHelpful: boolean, feedback?: string): Promise<AxiosResponse<ApiResponse<Chat>>> =>
    api.put(`/v1/chat/feedback/${chatId}`, null, {
      params: { isHelpful, feedback }
    }),
  
  getChatStats: (farmerId: number): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get(`/v1/chat/stats/${farmerId}`),
  
  getMessageTypes: (): Promise<AxiosResponse<ApiResponse<string[]>>> =>
    api.get('/v1/chat/types'),
};

export default api;
