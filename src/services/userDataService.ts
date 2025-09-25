import { useAuth } from '../contexts/AuthContext';

export interface IrrigationData {
  id?: string;
  location: {
    lat: string;
    lng: string;
  };
  crop: string;
  area: string;
  irrigationType: string;
  irrigationRate: string;
  emittersPerM2: string;
  soilType: string;
  waterBudget: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SavedIrrigationData {
  id: string;
  name: string;
  data: IrrigationData;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

class UserDataService {
  private getStorageKey(userId: number): string {
    return `irrigation_data_${userId}`;
  }

  // Save irrigation data for a user
  saveIrrigationData(userId: number, data: IrrigationData, name?: string): SavedIrrigationData {
    const storageKey = this.getStorageKey(userId);
    const existingData = this.getUserIrrigationData(userId);
    
    const newData: SavedIrrigationData = {
      id: data.id || Date.now().toString(),
      name: name || `Irrigation Plan ${new Date().toLocaleDateString()}`,
      data: {
        ...data,
        updatedAt: new Date().toISOString()
      },
      isDefault: existingData.length === 0, // First saved data becomes default
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedData = [...existingData.filter(item => item.id !== newData.id), newData];
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
    
    return newData;
  }

  // Get all irrigation data for a user
  getUserIrrigationData(userId: number): SavedIrrigationData[] {
    const storageKey = this.getStorageKey(userId);
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : [];
  }

  // Get default irrigation data for a user
  getDefaultIrrigationData(userId: number): SavedIrrigationData | null {
    const data = this.getUserIrrigationData(userId);
    return data.find(item => item.isDefault) || data[0] || null;
  }

  // Get specific irrigation data by ID
  getIrrigationDataById(userId: number, id: string): SavedIrrigationData | null {
    const data = this.getUserIrrigationData(userId);
    return data.find(item => item.id === id) || null;
  }

  // Delete irrigation data
  deleteIrrigationData(userId: number, id: string): boolean {
    const storageKey = this.getStorageKey(userId);
    const existingData = this.getUserIrrigationData(userId);
    const updatedData = existingData.filter(item => item.id !== id);
    
    if (updatedData.length !== existingData.length) {
      localStorage.setItem(storageKey, JSON.stringify(updatedData));
      return true;
    }
    return false;
  }

  // Set default irrigation data
  setDefaultIrrigationData(userId: number, id: string): boolean {
    const storageKey = this.getStorageKey(userId);
    const existingData = this.getUserIrrigationData(userId);
    
    const updatedData = existingData.map(item => ({
      ...item,
      isDefault: item.id === id
    }));
    
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
    return true;
  }

  // Check if user is demo user (test@gmail.com)
  isDemoUser(userEmail: string): boolean {
    return userEmail === 'test@gmail.com';
  }

  // Get demo data for test@gmail.com
  getDemoData(): SavedIrrigationData[] {
    return [
      {
        id: 'demo-1',
        name: 'Demo Farm - North Field',
        isDefault: true,
        data: {
          location: { lat: '25.2854', lng: '51.5310' },
          crop: 'Cucumber',
          area: '2000',
          irrigationType: 'Sprinkler',
          irrigationRate: '6',
          emittersPerM2: '10',
          soilType: 'Sandy',
          waterBudget: '1000',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'demo-2',
        name: 'Demo Farm - South Field',
        isDefault: false,
        data: {
          location: { lat: '25.2919', lng: '51.4244' },
          crop: 'Tomato',
          area: '1500',
          irrigationType: 'Drip',
          irrigationRate: '4',
          emittersPerM2: '8',
          soilType: 'Loam',
          waterBudget: '800',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
}

export const userDataService = new UserDataService();
