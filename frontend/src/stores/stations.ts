import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import { API_URL } from '../config';

export interface Station {
  _id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: 'active' | 'inactive' | 'maintenance';
  powerOutput: number;
  connectorType: string;
  createdAt: string;
  updatedAt: string;
}

interface StationInput {
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: 'active' | 'inactive' | 'maintenance';
  powerOutput: number;
  connectorType: string;
}

export const useStationsStore = defineStore('stations', () => {
  const stations = ref<Station[]>([]);
  const currentStation = ref<Station | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchStations = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.get(`${API_URL}/stations`);
      stations.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch stations';
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchStationById = async (id: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.get(`${API_URL}/stations/${id}`);
      currentStation.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch station';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const createStation = async (stationData: StationInput) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post(`${API_URL}/stations`, stationData);
      // Update the stations list
      await fetchStations();
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create station';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateStation = async (id: string, stationData: StationInput) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.put(`${API_URL}/stations/${id}`, stationData);
      // Update the stations list
      await fetchStations();
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update station';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deleteStation = async (id: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      await axios.delete(`${API_URL}/stations/${id}`);
      // Update the stations list
      stations.value = stations.value.filter(station => station._id !== id);
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete station';
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    stations,
    currentStation,
    loading,
    error,
    fetchStations,
    fetchStationById,
    createStation,
    updateStation,
    deleteStation
  };
});