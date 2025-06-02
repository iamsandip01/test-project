<script setup lang="ts">
import { STATION_STATUS } from '../../config';
import type { Station } from '../../stores/stations';

interface Props {
  station: Station;
}

defineProps<Props>();

const getStatusClass = (status: string) => {
  const statusObj = STATION_STATUS.find(s => s.value === status);
  return statusObj?.color || 'bg-neutral-500';
};

const getStatusLabel = (status: string) => {
  const statusObj = STATION_STATUS.find(s => s.value === status);
  return statusObj?.label || 'Unknown';
};
</script>

<template>
  <div class="card hover:transform hover:scale-[1.02] transition-all duration-300">
    <div class="p-4">
      <div class="flex justify-between items-start">
        <h3 class="text-lg font-semibold text-neutral-800">{{ station.name }}</h3>
        <div :class="`${getStatusClass(station.status)} text-white px-2 py-1 rounded-md text-xs font-medium`">
          {{ getStatusLabel(station.status) }}
        </div>
      </div>
      
      <div class="mt-3 space-y-2">
        <div class="flex items-center text-sm text-neutral-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="truncate">
            {{ station.location.address || 
               `${station.location.latitude.toFixed(4)}, ${station.location.longitude.toFixed(4)}` }}
          </span>
        </div>
        
        <div class="flex items-center text-sm text-neutral-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>{{ station.powerOutput }} kW</span>
        </div>
        
        <div class="flex items-center text-sm text-neutral-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>{{ station.connectorType }}</span>
        </div>
      </div>
      
      <div class="mt-4 flex justify-end space-x-2">
        <router-link :to="`/stations/${station._id}`" class="btn btn-secondary text-xs py-1">
          View Details
        </router-link>
        <router-link :to="`/stations/${station._id}/edit`" class="btn btn-primary text-xs py-1">
          Edit
        </router-link>
      </div>
    </div>
  </div>
</template>