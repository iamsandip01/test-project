<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStationsStore } from '../../stores/stations';
import StationCard from '../../components/ui/StationCard.vue';
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue';
import EmptyState from '../../components/ui/EmptyState.vue';

const router = useRouter();
const stationsStore = useStationsStore();

const isLoading = ref(true);
const searchQuery = ref('');
const statusFilter = ref('all');
const connectorFilter = ref('all');

// Get unique connector types from stations
const connectorTypes = computed(() => {
  const types = new Set(stationsStore.stations.map(station => station.connectorType));
  return ['all', ...Array.from(types)];
});

// Filtered stations based on search and filters
const filteredStations = computed(() => {
  return stationsStore.stations.filter(station => {
    // Search filter
    const matchesSearch = searchQuery.value === '' || 
      station.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (station.location.address && station.location.address.toLowerCase().includes(searchQuery.value.toLowerCase()));
    
    // Status filter
    const matchesStatus = statusFilter.value === 'all' || station.status === statusFilter.value;
    
    // Connector filter
    const matchesConnector = connectorFilter.value === 'all' || station.connectorType === connectorFilter.value;
    
    return matchesSearch && matchesStatus && matchesConnector;
  });
});

onMounted(async () => {
  try {
    await stationsStore.fetchStations();
  } catch (error) {
    console.error('Failed to fetch stations:', error);
  } finally {
    isLoading.value = false;
  }
});

const navigateToNewStation = () => {
  router.push('/stations/new');
};

const handleSearch = (event: Event) => {
  event.preventDefault();
  // Search is reactive, so no additional action needed
};

const clearFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
  connectorFilter.value = 'all';
};
</script>

<template>
  <div class="page-container">
    <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-neutral-800">Charging Stations</h1>
        <p class="text-neutral-600 mt-1">Manage your charging station network</p>
      </div>
      <div class="mt-4 md:mt-0">
        <button @click="navigateToNewStation" class="btn btn-primary">
          <span class="mr-2">+</span> Add New Station
        </button>
      </div>
    </div>
    
    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-8">
      <form @submit="handleSearch" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label for="search" class="block text-sm font-medium text-neutral-700 mb-1">Search</label>
          <input
            id="search"
            v-model="searchQuery"
            type="text"
            placeholder="Search by name or location"
            class="form-input"
          />
        </div>
        
        <div>
          <label for="status" class="block text-sm font-medium text-neutral-700 mb-1">Status</label>
          <select id="status" v-model="statusFilter" class="form-input">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        
        <div>
          <label for="connector" class="block text-sm font-medium text-neutral-700 mb-1">Connector Type</label>
          <select id="connector" v-model="connectorFilter" class="form-input">
            <option v-for="type in connectorTypes" :key="type" :value="type">
              {{ type === 'all' ? 'All Connectors' : type }}
            </option>
          </select>
        </div>
        
        <div class="flex items-end">
          <button 
            type="button" 
            @click="clearFilters" 
            class="btn btn-secondary w-full"
            :disabled="searchQuery === '' && statusFilter === 'all' && connectorFilter === 'all'"
          >
            Clear Filters
          </button>
        </div>
      </form>
    </div>
    
    <LoadingSpinner v-if="isLoading" />
    
    <template v-else>
      <!-- Results count -->
      <div class="mb-4 text-neutral-600">
        {{ filteredStations.length }} {{ filteredStations.length === 1 ? 'station' : 'stations' }} found
      </div>
      
      <!-- Empty state -->
      <div v-if="filteredStations.length === 0" class="bg-white rounded-lg shadow-md">
        <EmptyState
          :title="stationsStore.stations.length === 0 ? 'No stations found' : 'No stations match your filters'"
          :description="stationsStore.stations.length === 0 ? 'Get started by adding your first charging station' : 'Try adjusting your search criteria'"
          :actionLabel="stationsStore.stations.length === 0 ? 'Add Station' : ''"
          :actionLink="stationsStore.stations.length === 0 ? '/stations/new' : ''"
        />
      </div>
      
      <!-- Station grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StationCard 
          v-for="station in filteredStations" 
          :key="station._id" 
          :station="station" 
        />
      </div>
    </template>
  </div>
</template>