<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStationsStore } from '../../stores/stations';
import { CONNECTOR_TYPES, STATION_STATUS } from '../../config';
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue';
import StationMap from '../../components/map/StationMap.vue';

const route = useRoute();
const router = useRouter();
const stationsStore = useStationsStore();

const isEditMode = computed(() => route.name === 'station-edit');
const pageTitle = computed(() => isEditMode.value ? 'Edit Charging Station' : 'Add New Charging Station');
const submitButtonText = computed(() => isEditMode.value ? 'Update Station' : 'Create Station');

const isLoading = ref(true);
const isSubmitting = ref(false);
const formErrors = ref({
  name: '',
  latitude: '',
  longitude: '',
  powerOutput: '',
  connectorType: '',
  form: ''
});

// Form data
const stationData = ref({
  name: '',
  location: {
    latitude: 0,
    longitude: 0,
    address: ''
  },
  status: 'active',
  powerOutput: 0,
  connectorType: ''
});

// Preview map data
const previewMapStations = computed(() => {
  if (!stationData.value.name || !stationData.value.location.latitude || !stationData.value.location.longitude) {
    return [];
  }
  
  return [{
    _id: 'preview',
    name: stationData.value.name,
    location: {
      latitude: stationData.value.location.latitude,
      longitude: stationData.value.location.longitude,
      address: stationData.value.location.address
    },
    status: stationData.value.status,
    powerOutput: stationData.value.powerOutput,
    connectorType: stationData.value.connectorType,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }];
});

onMounted(async () => {
  if (isEditMode.value) {
    const stationId = route.params.id as string;
    
    try {
      await stationsStore.fetchStationById(stationId);
      
      if (stationsStore.currentStation) {
        stationData.value = {
          name: stationsStore.currentStation.name,
          location: {
            latitude: stationsStore.currentStation.location.latitude,
            longitude: stationsStore.currentStation.location.longitude,
            address: stationsStore.currentStation.location.address || ''
          },
          status: stationsStore.currentStation.status,
          powerOutput: stationsStore.currentStation.powerOutput,
          connectorType: stationsStore.currentStation.connectorType
        };
      } else {
        router.push('/stations');
      }
    } catch (error) {
      console.error('Failed to fetch station:', error);
    }
  }
  
  isLoading.value = false;
});

const validateForm = () => {
  let isValid = true;
  formErrors.value = {
    name: '',
    latitude: '',
    longitude: '',
    powerOutput: '',
    connectorType: '',
    form: ''
  };

  if (!stationData.value.name.trim()) {
    formErrors.value.name = 'Station name is required';
    isValid = false;
  }

  if (!stationData.value.location.latitude) {
    formErrors.value.latitude = 'Latitude is required';
    isValid = false;
  } else if (stationData.value.location.latitude < -90 || stationData.value.location.latitude > 90) {
    formErrors.value.latitude = 'Latitude must be between -90 and 90';
    isValid = false;
  }

  if (!stationData.value.location.longitude) {
    formErrors.value.longitude = 'Longitude is required';
    isValid = false;
  } else if (stationData.value.location.longitude < -180 || stationData.value.location.longitude > 180) {
    formErrors.value.longitude = 'Longitude must be between -180 and 180';
    isValid = false;
  }

  if (!stationData.value.powerOutput) {
    formErrors.value.powerOutput = 'Power output is required';
    isValid = false;
  } else if (stationData.value.powerOutput <= 0) {
    formErrors.value.powerOutput = 'Power output must be greater than 0';
    isValid = false;
  }

  if (!stationData.value.connectorType) {
    formErrors.value.connectorType = 'Connector type is required';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  isSubmitting.value = true;
  formErrors.value.form = '';
  
  try {
    if (isEditMode.value) {
      await stationsStore.updateStation(route.params.id as string, stationData.value);
      router.push(`/stations/${route.params.id}`);
    } else {
      const newStation = await stationsStore.createStation(stationData.value);
      router.push(`/stations/${newStation._id}`);
    }
  } catch (error: any) {
    formErrors.value.form = error.message || 'Failed to save station. Please try again.';
    console.error('Failed to save station:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const cancelForm = () => {
  if (isEditMode.value) {
    router.push(`/stations/${route.params.id}`);
  } else {
    router.push('/stations');
  }
};
</script>

<template>
  <div class="page-container">
    <div v-if="isLoading">
      <LoadingSpinner />
    </div>
    
    <template v-else>
      <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <router-link to="/stations" class="text-primary-600 hover:text-primary-800 mb-2 inline-block">
            ← Back to stations
          </router-link>
          <h1 class="text-3xl font-bold text-neutral-800">{{ pageTitle }}</h1>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow-md p-6">
            <div v-if="formErrors.form" class="mb-6 bg-danger-50 text-danger-700 p-4 rounded-md">
              {{ formErrors.form }}
            </div>
            
            <div class="space-y-6">
              <!-- Station Name -->
              <div>
                <label for="name" class="block text-sm font-medium text-neutral-700 mb-1">Station Name *</label>
                <input
                  id="name"
                  v-model="stationData.name"
                  type="text"
                  class="form-input"
                  :class="{ 'border-danger-500 focus:ring-danger-500 focus:border-danger-500': formErrors.name }"
                />
                <p v-if="formErrors.name" class="mt-1 text-sm text-danger-600">{{ formErrors.name }}</p>
              </div>
              
              <!-- Location -->
              <div>
                <h3 class="text-base font-medium text-neutral-800 mb-2">Location</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <!-- Latitude -->
                  <div>
                    <label for="latitude" class="block text-sm font-medium text-neutral-700 mb-1">Latitude *</label>
                    <input
                      id="latitude"
                      v-model.number="stationData.location.latitude"
                      type="number"
                      step="0.000001"
                      min="-90"
                      max="90"
                      class="form-input"
                      :class="{ 'border-danger-500 focus:ring-danger-500 focus:border-danger-500': formErrors.latitude }"
                    />
                    <p v-if="formErrors.latitude" class="mt-1 text-sm text-danger-600">{{ formErrors.latitude }}</p>
                  </div>
                  
                  <!-- Longitude -->
                  <div>
                    <label for="longitude" class="block text-sm font-medium text-neutral-700 mb-1">Longitude *</label>
                    <input
                      id="longitude"
                      v-model.number="stationData.location.longitude"
                      type="number"
                      step="0.000001"
                      min="-180"
                      max="180"
                      class="form-input"
                      :class="{ 'border-danger-500 focus:ring-danger-500 focus:border-danger-500': formErrors.longitude }"
                    />
                    <p v-if="formErrors.longitude" class="mt-1 text-sm text-danger-600">{{ formErrors.longitude }}</p>
                  </div>
                </div>
                
                <!-- Address -->
                <div>
                  <label for="address" class="block text-sm font-medium text-neutral-700 mb-1">Address (Optional)</label>
                  <input
                    id="address"
                    v-model="stationData.location.address"
                    type="text"
                    class="form-input"
                  />
                </div>
              </div>
              
              <!-- Status -->
              <div>
                <label for="status" class="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                <select id="status" v-model="stationData.status" class="form-input">
                  <option v-for="status in STATION_STATUS" :key="status.value" :value="status.value">
                    {{ status.label }}
                  </option>
                </select>
              </div>
              
              <!-- Power Output -->
              <div>
                <label for="powerOutput" class="block text-sm font-medium text-neutral-700 mb-1">Power Output (kW) *</label>
                <input
                  id="powerOutput"
                  v-model.number="stationData.powerOutput"
                  type="number"
                  min="0"
                  step="0.1"
                  class="form-input"
                  :class="{ 'border-danger-500 focus:ring-danger-500 focus:border-danger-500': formErrors.powerOutput }"
                />
                <p v-if="formErrors.powerOutput" class="mt-1 text-sm text-danger-600">{{ formErrors.powerOutput }}</p>
              </div>
              
              <!-- Connector Type -->
              <div>
                <label for="connectorType" class="block text-sm font-medium text-neutral-700 mb-1">Connector Type *</label>
                <select 
                  id="connectorType" 
                  v-model="stationData.connectorType" 
                  class="form-input"
                  :class="{ 'border-danger-500 focus:ring-danger-500 focus:border-danger-500': formErrors.connectorType }"
                >
                  <option value="" disabled>Select connector type</option>
                  <option v-for="type in CONNECTOR_TYPES" :key="type" :value="type">
                    {{ type }}
                  </option>
                </select>
                <p v-if="formErrors.connectorType" class="mt-1 text-sm text-danger-600">{{ formErrors.connectorType }}</p>
              </div>
              
              <!-- Submit Buttons -->
              <div class="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  @click="cancelForm" 
                  class="btn btn-secondary"
                  :disabled="isSubmitting"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="isSubmitting"
                >
                  <span v-if="isSubmitting" class="inline-block animate-spin mr-2">↻</span>
                  <span v-if="isSubmitting">Saving...</span>
                  <span v-else>{{ submitButtonText }}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
        
        <div>
          <!-- Map Preview -->
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 class="text-lg font-semibold p-4 border-b border-neutral-200">Location Preview</h2>
            
            <div class="p-4">
              <StationMap 
                :stations="previewMapStations" 
                height="300px"
                :clickable="false"
              />
              
              <div v-if="previewMapStations.length === 0" class="mt-4 text-center text-neutral-500 text-sm">
                Enter latitude and longitude to see a preview
              </div>
            </div>
          </div>
          
          <!-- Help Card -->
          <div class="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 class="text-lg font-semibold mb-4">Help & Tips</h2>
            
            <div class="space-y-4 text-sm text-neutral-600">
              <div>
                <h3 class="font-medium text-neutral-800">Station Name</h3>
                <p>Use a clear, descriptive name that identifies the location or purpose of the charging station.</p>
              </div>
              
              <div>
                <h3 class="font-medium text-neutral-800">Location</h3>
                <p>Enter precise latitude and longitude coordinates for accurate mapping. The address field is optional but helpful for users.</p>
              </div>
              
              <div>
                <h3 class="font-medium text-neutral-800">Power Output</h3>
                <p>Enter the maximum power output in kilowatts (kW) that the charging station can provide.</p>
              </div>
              
              <div>
                <h3 class="font-medium text-neutral-800">Status</h3>
                <ul class="list-disc list-inside">
                  <li><span class="text-secondary-600 font-medium">Active:</span> Station is operational and available for use</li>
                  <li><span class="text-danger-600 font-medium">Inactive:</span> Station is not operational</li>
                  <li><span class="text-neutral-600 font-medium">Maintenance:</span> Station is temporarily unavailable for maintenance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>