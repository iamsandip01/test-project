<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const isMenuOpen = ref(false);

const isLoggedIn = computed(() => authStore.isLoggedIn());
const user = computed(() => authStore.user);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const handleLogout = async () => {
  await authStore.logout(); // Clears user/token and redirects
  closeMenu(); // Close mobile menu if open
};
</script>

<template>
  <nav class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="text-primary-600 font-bold text-xl">
              EV Station Manager
            </router-link>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <router-link to="/" class="inline-flex items-center px-1 pt-1 border-b-2" 
              :class="$route.path === '/' ? 'border-primary-500 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'">
              Home
            </router-link>
            <router-link to="/map" class="inline-flex items-center px-1 pt-1 border-b-2" 
              :class="$route.path === '/map' ? 'border-primary-500 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'">
              Map
            </router-link>
            <template v-if="isLoggedIn">
              <router-link to="/dashboard" class="inline-flex items-center px-1 pt-1 border-b-2" 
                :class="$route.path === '/dashboard' ? 'border-primary-500 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'">
                Dashboard
              </router-link>
              <router-link to="/stations" class="inline-flex items-center px-1 pt-1 border-b-2" 
                :class="$route.path.startsWith('/stations') ? 'border-primary-500 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'">
                Stations
              </router-link>
            </template>
          </div>
        </div>
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <template v-if="isLoggedIn">
            <span class="text-neutral-700 mr-4">{{ user?.name }}</span>
            <button @click="handleLogout" class="btn btn-secondary">
              Logout
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="btn btn-secondary mr-2">
              Login
            </router-link>
            <router-link to="/register" class="btn btn-primary">
              Register
            </router-link>
          </template>
        </div>
        <div class="-mr-2 flex items-center sm:hidden">
          <button @click="toggleMenu" class="inline-flex items-center justify-center p-2 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
            <span class="sr-only">Open main menu</span>
            <svg v-if="!isMenuOpen" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="isMenuOpen" class="sm:hidden">
      <div class="pt-2 pb-3 space-y-1">
        <router-link to="/" @click="closeMenu" class="block pl-3 pr-4 py-2 border-l-4" 
          :class="$route.path === '/' ? 'border-primary-500 text-primary-600 bg-primary-50' : 'border-transparent text-neutral-500 hover:bg-neutral-50'">
          Home
        </router-link>
        <router-link to="/map" @click="closeMenu" class="block pl-3 pr-4 py-2 border-l-4" 
          :class="$route.path === '/map' ? 'border-primary-500 text-primary-600 bg-primary-50' : 'border-transparent text-neutral-500 hover:bg-neutral-50'">
          Map
        </router-link>
        <template v-if="isLoggedIn">
          <router-link to="/dashboard" @click="closeMenu" class="block pl-3 pr-4 py-2 border-l-4" 
            :class="$route.path === '/dashboard' ? 'border-primary-500 text-primary-600 bg-primary-50' : 'border-transparent text-neutral-500 hover:bg-neutral-50'">
            Dashboard
          </router-link>
          <router-link to="/stations" @click="closeMenu" class="block pl-3 pr-4 py-2 border-l-4" 
            :class="$route.path.startsWith('/stations') ? 'border-primary-500 text-primary-600 bg-primary-50' : 'border-transparent text-neutral-500 hover:bg-neutral-50'">
            Stations
          </router-link>
        </template>
      </div>
      <div class="pt-4 pb-3 border-t border-neutral-200">
        <template v-if="isLoggedIn">
          <div class="flex items-center px-4">
            <div class="flex-shrink-0">
              <div class="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                {{ user?.name?.charAt(0) }}
              </div>
            </div>
            <div class="ml-3">
              <div class="text-base font-medium text-neutral-800">{{ user?.name }}</div>
              <div class="text-sm font-medium text-neutral-500">{{ user?.email }}</div>
            </div>
          </div>
          <div class="mt-3 space-y-1">
            <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100">
              Logout
            </button>
          </div>
        </template>
        <template v-else>
          <div class="px-4 flex flex-col space-y-2">
            <router-link to="/login" @click="closeMenu" class="btn btn-secondary">
              Login
            </router-link>
            <router-link to="/register" @click="closeMenu" class="btn btn-primary">
              Register
            </router-link>
          </div>
        </template>
      </div>
    </div>
  </nav>
</template>
