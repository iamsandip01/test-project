<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStationsStore } from '../../stores/stations';
import { useAuthStore } from '../../stores/auth';
import StationMap from '../../components/map/StationMap.vue';
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue';

const router = useRouter();
const stationsStore = useStationsStore();
const authStore = useAuthStore();

const isLoading = ref(true);
const isLoggedIn = ref(false);

onMounted(async () => {
  isLoggedIn.value = authStore.isLoggedIn();
  
  try {
    await stationsStore.fetchStations();
  } catch (error) {
    console.error('Failed to fetch stations:', error);
  } finally {
    isLoading.value = false;
  }
});

const handleStationClick = (station:any) => {
  if (isLoggedIn.value) {
    router.push(`/stations/${station._id}`);
  } else {
    router.push('/login');
  }
};

const navigateToStations = () => {
  router.push('/stations');
};

const navigateToLogin = () => {
  router.push('/login');
};
</script>

<template>
  <div class="page-container">
    <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-neutral-800">Charging Station Map</h1>
        <p class="text-neutral-600 mt-1">Explore charging stations across the network</p>
      </div>
      <div class="mt-4 md:mt-0 flex space-x-3">
        <button v-if="isLoggedIn" @click="navigateToStations" class="btn btn-primary">
          Manage Stations
        </button>
        <button v-else @click="navigateToLogin" class="btn btn-primary">
          Sign In to Manage Stations
        </button>
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-4 mb-8">
      <div class="text-neutral-600 text-sm mb-3">
        {{ stationsStore.stations.length }} {{ stationsStore.stations.length === 1 ? 'station' : 'stations' }} available
      </div>
      
      <div class="relative bg-white rounded-lg overflow-hidden shadow-inner">
        <LoadingSpinner v-if="isLoading" />
        
        <StationMap 
          v-else
          :stations="stationsStore.stations" 
          height="600px"
          :clickable="true"
          @station-click="handleStationClick"
        />
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">Map Legend</h2>
      
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="flex items-center">
          <div class="w-4 h-4 rounded-full bg-secondary-500 mr-2"></div>
          <span>Active Stations</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 rounded-full bg-danger-500 mr-2"></div>
          <span>Inactive Stations</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 rounded-full bg-neutral-500 mr-2"></div>
          <span>Maintenance</span>
        </div>
      </div>
      
      <div class="mt-6 text-neutral-600">
        <p>Click on a station marker to view more details. Sign in to access full station management capabilities.</p>
      </div>
    </div>
  </div>
</template>