<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStationsStore } from '../../stores/stations';
import { STATION_STATUS } from '../../config';
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue';
import StationMap from '../../components/map/StationMap.vue';

const route = useRoute();
const router = useRouter();
const stationsStore = useStationsStore();

const isLoading = ref(true);
const showDeleteModal = ref(false);
const isDeleting = ref(false);

onMounted(async () => {
  const stationId = route.params.id as string;
  
  try {
    await stationsStore.fetchStationById(stationId);
    if (!stationsStore.currentStation) {
      router.push('/stations');
    }
  } catch (error) {
    console.error('Failed to fetch station:', error);
  } finally {
    isLoading.value = false;
  }
});

const getStatusBadgeClass = (status: string) => {
  const statusObj = STATION_STATUS.find(s => s.value === status);
  return statusObj ? `${statusObj.color} text-white` : 'bg-neutral-500 text-white';
};

const getStatusLabel = (status: string) => {
  const statusObj = STATION_STATUS.find(s => s.value === status);
  return statusObj?.label || 'Unknown';
};

const navigateToEdit = () => {
  router.push(`/stations/${route.params.id}/edit`);
};

const confirmDelete = () => {
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  showDeleteModal.value = false;
};

const handleDelete = async () => {
  isDeleting.value = true;
  
  try {
    await stationsStore.deleteStation(route.params.id as string);
    router.push('/stations');
  } catch (error) {
    console.error('Failed to delete station:', error);
  } finally {
    isDeleting.value = false;
    showDeleteModal.value = false;
  }
};
</script>

<template>
  <div class="page-container">
    <div v-if="isLoading">
      <LoadingSpinner />
    </div>
    
    <template v-else-if="stationsStore.currentStation">
      <!-- Station details header -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div class="flex items-center mb-2">
            <router-link to="/stations" class="text-primary-600 hover:text-primary-800 mr-2">
              ← Back to stations
            </router-link>
            <span :class="`px-2 py-1 rounded-md text-xs font-medium ${getStatusBadgeClass(stationsStore.currentStation.status)}`">
              {{ getStatusLabel(stationsStore.currentStation.status) }}
            </span>
          </div>
          <h1 class="text-3xl font-bold text-neutral-800">{{ stationsStore.currentStation.name }}</h1>
        </div>
        <div class="mt-4 md:mt-0 flex space-x-3">
          <button @click="navigateToEdit" class="btn btn-primary">
            Edit Station
          </button>
          <button @click="confirmDelete" class="btn btn-danger">
            Delete
          </button>
        </div>
      </div>
      
      <!-- Station details content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <!-- Map -->
            <StationMap 
              :stations="[stationsStore.currentStation]" 
              height="400px"
              :clickable="false"
            />
            
            <!-- Station info cards -->
            <div class="p-6">
              <h2 class="text-xl font-semibold mb-4 text-neutral-800">Station Information</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 class="text-sm font-medium text-neutral-500 mb-1">Location</h3>
                  <p class="text-neutral-800">
                    {{ stationsStore.currentStation.location.address || 
                      `Lat: ${stationsStore.currentStation.location.latitude.toFixed(6)}, Lng: ${stationsStore.currentStation.location.longitude.toFixed(6)}` }}
                  </p>
                </div>
                
                <div>
                  <h3 class="text-sm font-medium text-neutral-500 mb-1">Status</h3>
                  <p class="text-neutral-800">{{ getStatusLabel(stationsStore.currentStation.status) }}</p>
                </div>
                
                <div>
                  <h3 class="text-sm font-medium text-neutral-500 mb-1">Power Output</h3>
                  <p class="text-neutral-800">{{ stationsStore.currentStation.powerOutput }} kW</p>
                </div>
                
                <div>
                  <h3 class="text-sm font-medium text-neutral-500 mb-1">Connector Type</h3>
                  <p class="text-neutral-800">{{ stationsStore.currentStation.connectorType }}</p>
                </div>
                
                <div>
                  <h3 class="text-sm font-medium text-neutral-500 mb-1">Added</h3>
                  <p class="text-neutral-800">
                    {{ new Date(stationsStore.currentStation.createdAt).toLocaleDateString() }}
                  </p>
                </div>
                
                <div>
                  <h3 class="text-sm font-medium text-neutral-500 mb-1">Last Updated</h3>
                  <p class="text-neutral-800">
                    {{ new Date(stationsStore.currentStation.updatedAt).toLocaleDateString() }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <!-- Station actions card -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4 text-neutral-800">Quick Actions</h2>
            
            <div class="space-y-3">
              <button @click="navigateToEdit" class="btn btn-primary w-full">
                Edit Station
              </button>
              
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-neutral-200"></div>
                </div>
                <div class="relative flex justify-center">
                  <span class="px-2 bg-white text-sm text-neutral-500">or</span>
                </div>
              </div>
              
              <button @click="confirmDelete" class="btn btn-danger w-full">
                Delete Station
              </button>
            </div>
          </div>
          
          <!-- Additional info card (can be expanded with more features) -->
          <div class="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 class="text-xl font-semibold mb-4 text-neutral-800">Station Analytics</h2>
            
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-neutral-500 mb-1">Status History</h3>
                <div class="h-2 bg-neutral-100 rounded overflow-hidden">
                  <div class="bg-secondary-500 h-full" style="width: 85%"></div>
                </div>
                <div class="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>85% Uptime</span>
                  <span>Last 30 days</span>
                </div>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-neutral-500 mb-1">Power Delivery</h3>
                <div class="flex items-center">
                  <div class="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xl font-bold">
                    98%
                  </div>
                  <div class="ml-4">
                    <div class="text-sm text-neutral-800">Efficiency Rating</div>
                    <div class="text-xs text-neutral-500">Based on output monitoring</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 overflow-y-auto z-50">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div class="fixed inset-0 bg-neutral-900 bg-opacity-50 transition-opacity"></div>
        
        <div class="relative bg-white rounded-lg max-w-lg w-full mx-auto p-6 shadow-xl">
          <h3 class="text-xl font-bold text-neutral-800 mb-4">Confirm Deletion</h3>
          
          <p class="text-neutral-600 mb-6">
            Are you sure you want to delete this charging station? This action cannot be undone.
          </p>
          
          <div class="flex justify-end space-x-3">
            <button 
              @click="cancelDelete" 
              class="btn btn-secondary"
              :disabled="isDeleting"
            >
              Cancel
            </button>
            <button 
              @click="handleDelete" 
              class="btn btn-danger"
              :disabled="isDeleting"
            >
              <span v-if="isDeleting" class="inline-block animate-spin mr-2">↻</span>
              <span v-if="isDeleting">Deleting...</span>
              <span v-else>Delete Station</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>