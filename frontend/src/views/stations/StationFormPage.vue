<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStationsStore } from '../../stores/stations';
import type { StationInput } from '../../stores/stations'; // Explicitly import StationInput
import { CONNECTOR_TYPES, STATION_STATUS } from '../../config';
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue';
import StationMap from '../../components/map/StationMap.vue';

const route = useRoute();
const router = useRouter();
const stationsStore = useStationsStore();

const isEditMode = computed(() => route.name === 'station-edit');
const pageTitle = computed(() => isEditMode.value ? 'Edit Charging Station' : 'Add New Charging Station');
const submitButtonText = computed(() => isEditMode.value ? 'Update Station' : 'Create Station');

const isLoading = ref(true); // Manages loading state for initial data fetch
const isSubmitting = ref(false); // Manages loading state for form submission
const formErrors = ref({
  name: '',
  latitude: '',
  longitude: '',
  powerOutput: '',
  connectorType: '',
  form: '' // General form error message
});

// Form data, explicitly typed as StationInput
const stationData = ref<StationInput>({
  name: '',
  location: {
    latitude: 0,
    longitude: 0,
    address: null // Initialize address as null to match interface
  },
  status: 'active', // Default status
  powerOutput: 0,
  connectorType: ''
});

// Computed property for the preview map, ensuring it returns an array of Station type
const previewMapStations = computed(() => {
  // Only show a marker if basic location data is present
  if (!stationData.value.name || !stationData.value.location.latitude || !stationData.value.location.longitude) {
    return [];
  }

  // Create a mock Station object for the map preview
  return [{
    _id: 'preview', // Mock ID for preview purposes
    name: stationData.value.name,
    location: {
      latitude: stationData.value.location.latitude,
      longitude: stationData.value.location.longitude,
      address: stationData.value.location.address // Use address as is, can be null
    },
    status: stationData.value.status,
    powerOutput: stationData.value.powerOutput,
    connectorType: stationData.value.connectorType,
    createdAt: new Date().toISOString(), // Mock creation date
    updatedAt: new Date().toISOString()  // Mock update date
  }];
});

onMounted(async () => {
  if (isEditMode.value) {
    const stationId = route.params.id as string;

    try {
      // Fetch existing station data for editing
      await stationsStore.fetchStationById(stationId);

      if (stationsStore.currentStation) {
        // Populate form fields with existing station data
        stationData.value = {
          name: stationsStore.currentStation.name,
          location: {
            latitude: stationsStore.currentStation.location.latitude,
            longitude: stationsStore.currentStation.location.longitude,
            address: stationsStore.currentStation.location.address || null // Ensure null for empty address
          },
          status: stationsStore.currentStation.status,
          powerOutput: stationsStore.currentStation.powerOutput,
          connectorType: stationsStore.currentStation.connectorType
        };
      } else {
        // If station not found in edit mode, redirect
        router.push('/stations');
      }
    } catch (error) {
      console.error('Failed to fetch station for editing:', error);
      // Optionally show a user-friendly error message
      formErrors.value.form = 'Failed to load station data. Please try again.';
    }
  }

  isLoading.value = false; // Set loading to false once data is fetched or initialized
});

/**
 * Validates the form input fields.
 * @returns {boolean} True if the form is valid, false otherwise.
 */
const validateForm = (): boolean => {
  let isValid = true;
  // Reset all form error messages
  formErrors.value = {
    name: '',
    latitude: '',
    longitude: '',
    powerOutput: '',
    connectorType: '',
    form: ''
  };

  // Name validation
  if (!stationData.value.name.trim()) {
    formErrors.value.name = 'Station name is required';
    isValid = false;
  }

  // Latitude validation
  if (stationData.value.location.latitude === 0 || isNaN(stationData.value.location.latitude)) {
    formErrors.value.latitude = 'Latitude is required and must be a number';
    isValid = false;
  } else if (stationData.value.location.latitude < -90 || stationData.value.location.latitude > 90) {
    formErrors.value.latitude = 'Latitude must be between -90 and 90';
    isValid = false;
  }

  // Longitude validation
  if (stationData.value.location.longitude === 0 || isNaN(stationData.value.location.longitude)) {
    formErrors.value.longitude = 'Longitude is required and must be a number';
    isValid = false;
  } else if (stationData.value.location.longitude < -180 || stationData.value.location.longitude > 180) {
    formErrors.value.longitude = 'Longitude must be between -180 and 180';
    isValid = false;
  }

  // Power Output validation
  if (stationData.value.powerOutput <= 0 || isNaN(stationData.value.powerOutput)) {
    formErrors.value.powerOutput = 'Power output is required and must be a positive number';
    isValid = false;
  }

  // Connector Type validation
  if (!stationData.value.connectorType.trim()) {
    formErrors.value.connectorType = 'Connector type is required';
    isValid = false;
  }

  return isValid;
};

/**
 * Handles the form submission (create or update station).
 */
const handleSubmit = async () => {
  if (!validateForm()) {
    return; // Stop if validation fails
  }

  isSubmitting.value = true;
  formErrors.value.form = ''; // Clear general form error

  let success = false;
  try {
    if (isEditMode.value) {
      // Update existing station
      const stationId = route.params.id as string;
      const updatedStation = await stationsStore.updateStation(stationId, stationData.value);
      if (updatedStation) {
        success = true;
      }
    } else {
      // Create new station
      const newStation = await stationsStore.createStation(stationData.value);
      if (newStation) {
        success = true;
      }
    }

    if (success) {
      router.push('/stations'); // Redirect to stations list on success
    } else {
      // If store action returns null (failure), display error from store
      formErrors.value.form = stationsStore.error || 'Operation failed. Please try again.';
    }
  } catch (error: any) {
    console.error('Submission error:', error);
    formErrors.value.form = error.message || 'An unexpected error occurred during submission.';
  } finally {
    isSubmitting.value = false;
  }
};

// Function to handle map click and update latitude/longitude
const handleMapClick = (latlng: { lat: number; lng: number }) => {
  stationData.value.location.latitude = latlng.lat;
  stationData.value.location.longitude = latlng.lng;
  // Optionally, you could try to reverse geocode the address here
};
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold text-neutral-800 mb-6">{{ pageTitle }}</h1>

    <LoadingSpinner v-if="isLoading" />

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="card p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="formErrors.form" class="bg-danger-50 text-danger-700 p-3 rounded-md text-sm">
            {{ formErrors.form }}
          </div>

          <div>
            <label for="name" class="form-label">Station Name</label>
            <input id="name" v-model="stationData.name" type="text" class="form-input"
              :class="{ 'border-danger-500': formErrors.name }" />
            <p v-if="formErrors.name" class="form-error">{{ formErrors.name }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="latitude" class="form-label">Latitude</label>
              <input id="latitude" v-model.number="stationData.location.latitude" type="number" step="any"
                class="form-input" :class="{ 'border-danger-500': formErrors.latitude }" />
              <p v-if="formErrors.latitude" class="form-error">{{ formErrors.latitude }}</p>
            </div>
            <div>
              <label for="longitude" class="form-label">Longitude</label>
              <input id="longitude" v-model.number="stationData.location.longitude" type="number" step="any"
                class="form-input" :class="{ 'border-danger-500': formErrors.longitude }" />
              <p v-if="formErrors.longitude" class="form-error">{{ formErrors.longitude }}</p>
            </div>
          </div>
          <div>
            <label for="address" class="form-label">Address (Optional)</label>
            <input id="address" v-model="stationData.location.address" type="text" class="form-input" />
          </div>

          <div>
            <label for="status" class="form-label">Status</label>
            <select id="status" v-model="stationData.status" class="form-select">
              <option v-for="statusOpt in STATION_STATUS" :key="statusOpt.value" :value="statusOpt.value">
                {{ statusOpt.label }}
              </option>
            </select>
          </div>

          <div>
            <label for="powerOutput" class="form-label">Power Output (kW)</label>
            <input id="powerOutput" v-model.number="stationData.powerOutput" type="number" step="0.1"
              class="form-input" :class="{ 'border-danger-500': formErrors.powerOutput }" />
            <p v-if="formErrors.powerOutput" class="form-error">{{ formErrors.powerOutput }}</p>
          </div>

          <div>
            <label for="connectorType" class="form-label">Connector Type</label>
            <select id="connectorType" v-model="stationData.connectorType" class="form-select"
              :class="{ 'border-danger-500': formErrors.connectorType }">
              <option value="" disabled>Select a connector type</option>
              <option v-for="type in CONNECTOR_TYPES" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
            <p v-if="formErrors.connectorType" class="form-error">{{ formErrors.connectorType }}</p>
          </div>

          <div>
            <button type="submit" class="btn btn-primary w-full" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="inline-block animate-spin mr-2">↻</span>
              {{ submitButtonText }}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 class="text-xl font-semibold text-neutral-800 mb-4">Location Preview</h2>
        <StationMap :stations="previewMapStations" height="400px" :clickable="true" @station-click="handleMapClick" />
        <p class="text-sm text-neutral-600 mt-2">Click on the map to set latitude and longitude.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles for form elements if needed, or rely on global CSS/Tailwind */
.form-label {
  @apply block text-sm font-medium text-neutral-700 mb-1;
}

.form-input,
.form-select {
  @apply mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm;
}

.form-error {
  @apply mt-1 text-sm text-danger-600;
}
</style>
