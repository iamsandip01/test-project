<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStationsStore } from '../stores/stations';
import { useAuthStore } from '../stores/auth';
import StationMap from '../components/map/StationMap.vue';

const router = useRouter();
const stationsStore = useStationsStore();
const authStore = useAuthStore();

const isLoggedIn = ref(false);
const activeStationsCount = ref(0);
const inactiveStationsCount = ref(0);

onMounted(async () => {
  isLoggedIn.value = authStore.isLoggedIn();
  
  // Fetch some stations to display on the map
  await stationsStore.fetchStations();
  
  // Calculate counts
  activeStationsCount.value = stationsStore.stations.filter(s => s.status === 'active').length;
  inactiveStationsCount.value = stationsStore.stations.filter(s => s.status === 'inactive').length;
});

const handleStationClick = (station:any) => {
  if (isLoggedIn.value) {
    router.push(`/stations/${station._id}`);
  } else {
    router.push('/login');
  }
};

const navigateToLogin = () => {
  router.push('/login');
};

const navigateToRegister = () => {
  router.push('/register');
};

const navigateToDashboard = () => {
  router.push('/dashboard');
};

const navigateToMap = () => {
  router.push('/map');
};
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative bg-primary-600 text-white py-20">
      <div class="absolute inset-0 z-0 opacity-20">
        <div class="absolute inset-0 bg-gradient-to-r from-primary-900 to-primary-700"></div>
        <div class="w-full h-full bg-[url('https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center"></div>
      </div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="max-w-3xl">
          <h1 class="text-4xl font-bold tracking-tight sm:text-5xl mb-6 leading-tight">
            Manage Your EV Charging Infrastructure with Ease
          </h1>
          <p class="text-lg opacity-90 mb-8">
            Our platform helps you monitor, maintain, and optimize your charging station network for maximum efficiency and reliability.
          </p>
          <div class="flex flex-wrap gap-4">
            <button v-if="!isLoggedIn" @click="navigateToRegister" class="btn btn-success font-medium">
              Get Started
            </button>
            <button v-else @click="navigateToDashboard" class="btn btn-success font-medium">
              Go to Dashboard
            </button>
            <button @click="navigateToMap" class="btn bg-white text-primary-700 hover:bg-neutral-100 font-medium">
              View Charging Map
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-neutral-50 rounded-lg p-6 text-center shadow-sm border border-neutral-100">
            <div class="text-4xl font-bold text-primary-600 mb-2">{{ stationsStore.stations.length }}</div>
            <div class="text-neutral-600">Total Stations</div>
          </div>
          <div class="bg-neutral-50 rounded-lg p-6 text-center shadow-sm border border-neutral-100">
            <div class="text-4xl font-bold text-secondary-500 mb-2">{{ activeStationsCount }}</div>
            <div class="text-neutral-600">Active Stations</div>
          </div>
          <div class="bg-neutral-50 rounded-lg p-6 text-center shadow-sm border border-neutral-100">
            <div class="text-4xl font-bold text-danger-500 mb-2">{{ inactiveStationsCount }}</div>
            <div class="text-neutral-600">Inactive Stations</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Map Preview -->
    <section class="py-16 bg-neutral-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-neutral-800 mb-4">Discover Charging Stations</h2>
          <p class="text-neutral-600 max-w-2xl mx-auto">
            View all available charging stations on our interactive map. Easily find stations by location, connector type, and availability.
          </p>
        </div>
        
        <div class="rounded-lg overflow-hidden shadow-lg">
          <StationMap 
            :stations="stationsStore.stations" 
            height="500px"
            :clickable="true"
            @station-click="handleStationClick"
          />
        </div>
        
        <div class="mt-8 text-center">
          <button @click="navigateToMap" class="btn btn-primary">
            View Full Map
          </button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-neutral-800 mb-4">Platform Features</h2>
          <p class="text-neutral-600 max-w-2xl mx-auto">
            Our comprehensive management system provides everything you need to operate your charging network efficiently.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="card p-6">
            <div class="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-neutral-800">Real-time Monitoring</h3>
            <p class="text-neutral-600">
              Keep track of your charging stations' status, usage, and performance metrics in real-time.
            </p>
          </div>
          
          <div class="card p-6">
            <div class="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-neutral-800">Location Management</h3>
            <p class="text-neutral-600">
              Easily add, update, and manage charging station locations with interactive mapping tools.
            </p>
          </div>
          
          <div class="card p-6">
            <div class="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-neutral-800">Secure Access Control</h3>
            <p class="text-neutral-600">
              Manage user permissions and roles to ensure secure access to your charging network data.
            </p>
          </div>
          
          <div class="card p-6">
            <div class="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-neutral-800">Analytics & Reporting</h3>
            <p class="text-neutral-600">
              Generate comprehensive reports and insights to optimize your charging infrastructure.
            </p>
          </div>
          
          <div class="card p-6">
            <div class="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-neutral-800">Power Management</h3>
            <p class="text-neutral-600">
              Monitor power output, energy consumption, and load balancing across your network.
            </p>
          </div>
          
          <div class="card p-6">
            <div class="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-neutral-800">Alerts & Notifications</h3>
            <p class="text-neutral-600">
              Receive instant alerts about station status changes, maintenance needs, and critical events.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-primary-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold mb-4">Ready to Optimize Your Charging Network?</h2>
        <p class="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
          Join today and take control of your EV charging infrastructure with our comprehensive management platform.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <button v-if="!isLoggedIn" @click="navigateToRegister" class="btn btn-success font-medium">
            Create an Account
          </button>
          <button v-else @click="navigateToDashboard" class="btn btn-success font-medium">
            Go to Dashboard
          </button>
          <button v-if="!isLoggedIn" @click="navigateToLogin" class="btn bg-white text-primary-700 hover:bg-neutral-100 font-medium">
            Sign In
          </button>
        </div>
      </div>
    </section>
  </div>
</template>