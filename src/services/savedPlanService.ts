import axios from 'axios';

const API_BASE_URL = 'http://localhost:9090/api';

export interface SavedIrrigationPlan {
  id: number;
  farmerId: number;
  planName: string;
  locationLat: number;
  locationLng: number;
  cropType: string;
  area: number;
  irrigationType: string;
  irrigationRate?: string;
  emittersPerM2?: string;
  soilType: string;
  waterBudget?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavePlanRequest {
  farmerId: number;
  planName: string;
  locationLat: number;
  locationLng: number;
  cropType: string;
  area: number;
  irrigationType: string;
  irrigationRate?: string;
  emittersPerM2?: string;
  soilType: string;
  waterBudget?: string;
  isDefault?: boolean;
}

class SavedPlanService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Save a new irrigation plan
  async savePlan(planData: SavePlanRequest): Promise<SavedIrrigationPlan> {
    try {
      const response = await this.api.post('/v1/smart-irrigation/save-plan', planData);
      return response.data.data; // Extract data from ApiResponse wrapper
    } catch (error) {
      console.error('Error saving plan:', error);
      throw error;
    }
  }

  // Get all saved plans for a farmer
  async getPlansByFarmerId(farmerId: number): Promise<SavedIrrigationPlan[]> {
    if (!farmerId || farmerId === undefined || farmerId === null) {
      console.error('Invalid farmer ID provided:', farmerId);
      throw new Error('Invalid farmer ID');
    }
    
    try {
      const response = await this.api.get(`/v1/smart-irrigation/saved-plans/${farmerId}`);
      return response.data.data; // Extract data from ApiResponse wrapper
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  }

  // Get a specific saved plan
  async getPlanById(farmerId: number, planId: number): Promise<SavedIrrigationPlan> {
    try {
      const response = await this.api.get(`/v1/smart-irrigation/saved-plans/${farmerId}/${planId}`);
      return response.data.data; // Extract data from ApiResponse wrapper
    } catch (error) {
      console.error('Error fetching plan:', error);
      throw error;
    }
  }

  // Update a saved plan
  async updatePlan(farmerId: number, planId: number, planData: SavePlanRequest): Promise<SavedIrrigationPlan> {
    try {
      const response = await this.api.put(`/v1/smart-irrigation/saved-plans/${farmerId}/${planId}`, planData);
      return response.data.data; // Extract data from ApiResponse wrapper
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  }

  // Delete a saved plan
  async deletePlan(farmerId: number, planId: number): Promise<void> {
    try {
      await this.api.delete(`/v1/smart-irrigation/saved-plans/${farmerId}/${planId}`);
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }

  // Set a plan as default
  async setAsDefault(farmerId: number, planId: number): Promise<SavedIrrigationPlan> {
    try {
      const response = await this.api.post(`/v1/smart-irrigation/saved-plans/${farmerId}/${planId}/set-default`);
      return response.data.data; // Extract data from ApiResponse wrapper
    } catch (error) {
      console.error('Error setting plan as default:', error);
      throw error;
    }
  }
}

export const savedPlanService = new SavedPlanService();
