<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { MAP_CONFIG, STATION_STATUS } from '../../config';
import type { Station } from '../../stores/stations'; // Ensure Station is imported as a type
import 'leaflet/dist/leaflet.css';

// Import Leaflet dynamically to prevent SSR issues
let L: any; // Leaflet library instance

interface Props {
  stations: Station[];
  height?: string;
  clickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  height: '500px',
  clickable: true
});

const emit = defineEmits(['station-click']);

const mapContainer = ref<HTMLElement | null>(null);
const mapInstance = ref<any>(null); // Leaflet map instance
const markers = ref<any[]>([]); // Array to store Leaflet marker instances

onMounted(async () => {
  // Dynamically import Leaflet to ensure it's loaded client-side
  L = await import('leaflet');
  initMap();
});

onUnmounted(() => {
  // Clean up map instance when component is unmounted
  if (mapInstance.value) {
    mapInstance.value.remove();
  }
});

// Watch for changes in the stations prop and update markers accordingly
watch(() => props.stations, () => {
  if (mapInstance.value) {
    updateMarkers();
  }
}, { deep: true }); // Deep watch is important for nested changes in station data

/**
 * Initializes the Leaflet map.
 */
const initMap = () => {
  if (!mapContainer.value) {
    console.error('Map container element not found.');
    return;
  }

  // Create map instance, setting default center and zoom
  mapInstance.value = L.map(mapContainer.value).setView(
    MAP_CONFIG.defaultCenter,
    MAP_CONFIG.defaultZoom
  );

  // Add OpenStreetMap tile layer
  L.tileLayer(MAP_CONFIG.tileLayer, {
    attribution: MAP_CONFIG.attribution
  }).addTo(mapInstance.value);

  // Initial marker update
  updateMarkers();

  // Add event listener for window resize to invalidate map size
  window.addEventListener('resize', () => {
    if (mapInstance.value) {
      mapInstance.value.invalidateSize(); // Recalculates map size and position
    }
  });
};

/**
 * Updates markers on the map based on the current stations prop.
 * Clears existing markers and adds new ones.
 */
const updateMarkers = () => {
  // Remove all existing markers from the map
  markers.value.forEach(marker => marker.remove());
  markers.value = []; // Clear the markers array

  if (!props.stations.length) return; // If no stations, do nothing

  const bounds = L.latLngBounds(); // Create a LatLngBounds object to fit map to markers

  // Iterate over each station to create and add a marker
  props.stations.forEach(station => {
    // Determine marker color based on station status
    const statusObj = STATION_STATUS.find(s => s.value === station.status);
    const statusColorClass = statusObj?.color.replace('bg-', '') || 'neutral-500'; // e.g., 'primary-500'

    let markerColor: string;
    if (statusColorClass.includes('primary')) markerColor = '#0066cc'; // Example primary color
    else if (statusColorClass.includes('secondary')) markerColor = '#00cc66'; // Example secondary color
    else if (statusColorClass.includes('danger')) markerColor = '#cc3300'; // Example danger color
    else markerColor = '#6c757d'; // Default neutral color

    // Create a custom DivIcon for the marker (using SVG for the pin, and a small circle for status)
    const markerIcon = L.divIcon({
      html: `
        <div class="relative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${markerColor}" width="30" height="30">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <div class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white" style="background-color: ${markerColor}"></div>
        </div>
      `,
      className: 'custom-div-icon', // Custom class for styling
      iconSize: [30, 42], // Size of the icon
      iconAnchor: [15, 42] // Point of the icon which corresponds to the marker's location
    });

    // Create and add the marker to the map
    const marker = L.marker([station.location.latitude, station.location.longitude], {
      icon: markerIcon,
      title: station.name // Title for accessibility/hover
    }).addTo(mapInstance.value);

    // Create popup content with station details
    const popupContent = `
      <div class="p-2">
        <h3 class="font-semibold">${station.name}</h3>
        <p class="text-sm">${station.powerOutput} kW · ${station.connectorType}</p>
        <p class="text-sm">${station.location.address || 'No address provided'}</p>
        ${props.clickable ? '<p class="text-sm text-primary-500 mt-1 cursor-pointer station-details">View Details</p>' : ''}
      </div>
    `;

    marker.bindPopup(popupContent); // Bind the popup to the marker

    // Add click handler for "View Details" link inside the popup
    if (props.clickable) {
      marker.on('popupopen', () => {
        // Use setTimeout to ensure the DOM element is rendered before querying
        setTimeout(() => {
          const detailsLink = document.querySelector('.station-details');
          if (detailsLink) {
            detailsLink.addEventListener('click', () => {
              emit('station-click', station); // Emit event with station data
            });
          }
        }, 10); // Small delay to allow popup DOM to render
      });
    }

    bounds.extend([station.location.latitude, station.location.longitude]); // Extend bounds to include this marker
    markers.value.push(marker); // Store marker instance
  });

  // Fit map bounds to show all markers if there are any
  if (markers.value.length > 0) {
    mapInstance.value.fitBounds(bounds, { padding: [50, 50] }); // Add padding around the bounds
  }
};
</script>

<template>
  <div class="relative rounded-lg overflow-hidden shadow-md" :style="{ height }">
    <div ref="mapContainer" class="w-full h-full"></div>
    <div v-if="stations.length === 0" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
      <div class="text-center p-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-neutral-700">No Stations Available</h3>
        <p class="mt-1 text-sm text-neutral-500">Add stations to see them on the map</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Deep selectors to style Leaflet's generated elements */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 0.5rem;
}

:deep(.leaflet-popup-content) {
  margin: 0;
  padding: 0;
}

:deep(.leaflet-popup-close-button) {
  top: 8px;
  right: 8px;
}

/* Custom icon styling */
:deep(.custom-div-icon) {
  background: none !important; /* Remove default Leaflet background */
  border: none !important; /* Remove default Leaflet border */
}
</style>
