export interface Farmer {
  id: number;
  name: string;
  phone: string;
  locationName: string;
  latitude: number;
  longitude: number;
  preferredCrop: string;
  smsOptIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Recommendation {
  id: number;
  farmerId: number;
  date: string;
  cropType: string;
  locationName: string;
  tempC: number;
  humidity: number;
  rainfallMm: number;
  evapotranspiration: number;
  recommendation: 'LOW' | 'MODERATE' | 'HIGH';
  explanation: string;
  waterSavedLiters?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Weather {
  tempC: number;
  humidity: number;
  rainfallMm: number;
  forecastRainfallMm: number;
  heatAlert: boolean;
  weatherDescription: string;
  current?: CurrentWeather;
  daily?: DailyWeather[];
  alerts?: WeatherAlert[];
}

export interface CurrentWeather {
  temp: number;
  humidity: number;
  uvi: number;
  rain: number;
  snow: number;
  weather: WeatherInfo[];
}

export interface DailyWeather {
  dt: number;
  temp: Temp;
  humidity: number;
  rain: number;
  weather: WeatherInfo[];
}

export interface Temp {
  day: number;
  min: number;
  max: number;
}

export interface WeatherInfo {
  main: string;
  description: string;
  icon: string;
}

export interface WeatherAlert {
  senderName: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags: string[];
}

export interface AlertLog {
  id: number;
  farmerId: number;
  alertType: string;
  message: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
  sentAt: string;
  errorDetails?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

export interface AdminMetrics {
  totalFarmers: number;
  smsOptInCount: number;
  totalRecommendations: number;
  waterSaved: number;
  activeAlerts: number;
}

export interface WaterSavings {
  farmerId: number;
  totalWaterSaved: number;
  period: string;
  recommendations: number;
}

export interface DashboardStats {
  totalFarmers: number;
  activeRecommendations: number;
  waterSavedToday: number;
  alertsSent: number;
  weatherAlerts: number;
}

export interface CreateFarmerData {
  name: string;
  phone: string;
  locationName: string;
  latitude: number;
  longitude: number;
  preferredCrop: string;
  smsOptIn: boolean;
}

export interface UpdateFarmerData extends Partial<CreateFarmerData> {
  id: number;
}

export interface Chat {
  id: number;
  farmerId: number;
  userMessage: string;
  aiResponse: string;
  contextData?: string;
  messageType: 'GENERAL' | 'IRRIGATION_ADVICE' | 'CROP_MANAGEMENT' | 'WEATHER_QUERY' | 'PEST_DISEASE' | 'SOIL_HEALTH' | 'FERTILIZER_ADVICE' | 'HARVEST_PLANNING' | 'MARKET_INFO' | 'TECHNICAL_SUPPORT';
  isHelpful?: boolean;
  userFeedback?: string;
  tempId?: number; // Optional temporary ID for local state management
  createdAt: string;
  updatedAt: string;
}
