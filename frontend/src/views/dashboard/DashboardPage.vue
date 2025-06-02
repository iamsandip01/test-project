<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

import { useStationsStore } from '../../stores/stations';
import { useAuthStore } from '../../stores/auth';
import StationMap from '../../components/map/StationMap.vue';
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue';
import EmptyState from '../../components/ui/EmptyState.vue';

const router = useRouter();
const stationsStore = useStationsStore();
const authStore = useAuthStore();

const isLoading = ref(true);
const activeStationsCount = ref(0);
const inactiveStationsCount = ref(0);
const maintenanceStationsCount = ref(0);
interface Station {
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

const recentStations = ref<Station[]>([]);

//changes
onMounted(async () => {
  try {
    const authStore = useAuthStore();
    const token = authStore.token;

    //Redirect to login if not authenticated
    if (!token) {
      console.error("No authentication token found");
      return router.push('/login');
    }

    // Fetch dashboard data with authentication
    const response = await axios.get('/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Store dashboard data
    recentStations.value = response.data.recentStations || [];
    activeStationsCount.value = response.data.activeStationsCount || 0;
    inactiveStationsCount.value = response.data.inactiveStationsCount || 0;
    maintenanceStationsCount.value = response.data.maintenanceStationsCount || 0;

  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  } finally {
    isLoading.value = false;
  }
});
// Navigation functions
const navigateToStations = () => router.push('/stations');
const navigateToNewStation = () => router.push('/stations/new');
const navigateToStationDetail = (stationId: string) => router.push(`/stations/${stationId}`);
</script>

<template>
  <div class="page-container">
    <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-neutral-800">Dashboard</h1>
        <p class="text-neutral-600 mt-1">Welcome back, {{ authStore.user?.name }}</p>
      </div>
      <div class="mt-4 md:mt-0 flex space-x-3">
        <button @click="navigateToStations" class="btn btn-secondary">
          View All Stations
        </button>
        <button @click="navigateToNewStation" class="btn btn-primary">
          Add New Station
        </button>
      </div>
    </div>
    
    <LoadingSpinner v-if="isLoading" />
    <template v-else>
      <!-- Quick Stats -->
      <div class="section">
        <h2 class="section-title">Overview</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="card p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-primary-100 text-primary-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-neutral-800">Total Stations</h3>
                <p class="text-2xl font-semibold text-neutral-900">{{ stationsStore.stations.length }}</p>
              </div>
            </div>
          </div>
          
          <div class="card p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-secondary-100 text-secondary-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-neutral-800">Active Stations</h3>
                <p class="text-2xl font-semibold text-secondary-600">{{ activeStationsCount }}</p>
              </div>
            </div>
          </div>
          
          <div class="card p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-danger-100 text-danger-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-neutral-800">Inactive Stations</h3>
                <p class="text-2xl font-semibold text-danger-600">{{ inactiveStationsCount }}</p>
              </div>
            </div>
          </div>
          
          <div class="card p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-neutral-100 text-neutral-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-neutral-800">Maintenance</h3>
                <p class="text-2xl font-semibold text-neutral-600">{{ maintenanceStationsCount }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Map Section -->
      <div class="section">
        <h2 class="section-title">Station Map</h2>
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <StationMap 
            :stations="stationsStore.stations" 
            height="400px"
            :clickable="true"
            @station-click="station => navigateToStationDetail(station._id)"
          />
        </div>
      </div>
      
      <!-- Recent Stations -->
      <div class="section">
        <h2 class="section-title">Recently Added Stations</h2>
        
        <div v-if="recentStations.length === 0" class="bg-white rounded-lg shadow-md">
          <EmptyState
            title="No stations found"
            description="Get started by adding your first charging station"
            actionLabel="Add Station"
            actionLink="/stations/new"
          />
        </div>
        
        <div v-else class="overflow-x-auto bg-white rounded-lg shadow-md">
          <table class="min-w-full divide-y divide-neutral-200">
            <thead class="bg-neutral-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Power
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Connector
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Added
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-neutral-200">
              <tr v-for="station in recentStations" :key="station._id" class="hover:bg-neutral-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-medium text-neutral-800">{{ station.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-neutral-600 truncate max-w-[200px]">
                    {{ station.location.address || 
                      `${station.location.latitude.toFixed(4)}, ${station.location.longitude.toFixed(4)}` }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="station.status === 'active'" class="badge badge-success">Active</span>
                  <span v-else-if="station.status === 'inactive'" class="badge badge-danger">Inactive</span>
                  <span v-else class="badge bg-neutral-100 text-neutral-800">Maintenance</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                  {{ station.powerOutput }} kW
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                  {{ station.connectorType }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {{ new Date(station.createdAt).toLocaleDateString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <router-link :to="`/stations/${station._id}`" class="text-primary-600 hover:text-primary-800 mr-3">
                    View
                  </router-link>
                  <router-link :to="`/stations/${station._id}/edit`" class="text-primary-600 hover:text-primary-800">
                    Edit
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="recentStations.length > 0" class="mt-4 text-right">
          <router-link to="/stations" class="text-primary-600 hover:text-primary-800 font-medium">
            View all stations →
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>