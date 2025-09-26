import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://agriculture-backend-1077945709935.europe-west1.run.app/api';

export interface FarmerZone {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  farmerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateZoneRequest {
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
}

export interface UpdateZoneRequest {
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
}

class ZoneService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Get all zones for a farmer
  async getZonesByFarmerId(farmerId: number): Promise<FarmerZone[]> {
    if (!farmerId || farmerId === undefined || farmerId === null) {
      console.error('Invalid farmer ID provided:', farmerId);
      throw new Error('Invalid farmer ID');
    }
    
    try {
      const response = await this.api.get(`/v1/farmer-zones/farmer/${farmerId}`);
      return response.data.data; // Extract data from ApiResponse wrapper
    } catch (error) {
      console.error('Error fetching zones:', error);
      throw error;
    }
  }

  // Create a new zone
  async createZone(farmerId: number, zoneData: CreateZoneRequest): Promise<FarmerZone> {
    try {
      const response = await this.api.post(`/v1/farmer-zones/farmer/${farmerId}`, zoneData);
      return response.data.data; // Extract data from ApiResponse wrapper
    } catch (error) {
      console.error('Error creating zone:', error);
      throw error;
    }
  }

  // Update a zone
  async updateZone(farmerId: number, zoneId: number, zoneData: UpdateZoneRequest): Promise<FarmerZone> {
    try {
      const response = await this.api.put(`/v1/farmer-zones/${zoneId}/farmer/${farmerId}`, zoneData);
      return response.data.data; // Extract data from ApiResponse wrapper
    } catch (error) {
      console.error('Error updating zone:', error);
      throw error;
    }
  }

  // Delete a zone
  async deleteZone(farmerId: number, zoneId: number): Promise<void> {
    try {
      await this.api.delete(`/v1/farmer-zones/${zoneId}/farmer/${farmerId}`);
    } catch (error) {
      console.error('Error deleting zone:', error);
      throw error;
    }
  }

  // Get a specific zone
  async getZoneById(farmerId: number, zoneId: number): Promise<FarmerZone> {
    try {
      const response = await this.api.get(`/v1/farmer-zones/${zoneId}/farmer/${farmerId}`);
      return response.data.data; // Extract data from ApiResponse wrapper
    } catch (error) {
      console.error('Error fetching zone:', error);
      throw error;
    }
  }
}

export const zoneService = new ZoneService();

