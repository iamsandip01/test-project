<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const errors = ref({
  email: '',
  password: '',
  form: '' // General form error message
});

const isLoading = computed(() => authStore.loading);
const errorMessage = computed(() => authStore.error);

/**
 * Validates the login form fields.
 * @returns {boolean} True if the form is valid, false otherwise.
 */
const validateForm = (): boolean => {
  let isValid = true;
  // Reset all error messages
  errors.value = {
    email: '',
    password: '',
    form: ''
  };

  // Email validation
  if (!email.value) {
    errors.value.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Please enter a valid email address';
    isValid = false;
  }

  // Password validation
  if (!password.value) {
    errors.value.password = 'Password is required';
    isValid = false;
  }

  return isValid;
};

/**
 * Handles the form submission for login.
 */
const handleSubmit = async () => {
  if (!validateForm()) {
    // If validation fails, stop submission
    return;
  }

  // Attempt to log in using the auth store
  const success = await authStore.login({
    email: email.value,
    password: password.value
  });

  if (success) {
    // If login is successful, redirect to dashboard
    router.push('/dashboard');
  } else {
    // If login fails, display the error message from the store
    errors.value.form = errorMessage.value || 'Login failed. Please try again.';
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-neutral-800">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-neutral-600">
          Or
          <router-link to="/register" class="font-medium text-primary-600 hover:text-primary-500">
            create a new account
          </router-link>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div v-if="errors.form" class="bg-danger-50 text-danger-700 p-3 rounded-md text-sm">
          {{ errors.form }}
        </div>

        <div class="rounded-md shadow-sm -space-y-px">
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-neutral-700 mb-1">Email address</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              class="form-input"
              :class="{ 'border-danger-500 focus:ring-danger-500 focus:border-danger-500': errors.email }"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-danger-600">{{ errors.email }}</p>
          </div>
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-neutral-700 mb-1">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              class="form-input"
              :class="{ 'border-danger-500 focus:ring-danger-500 focus:border-danger-500': errors.password }"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-danger-600">{{ errors.password }}</p>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-neutral-700">
              Remember me
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-primary-600 hover:text-primary-500">
              Forgot your password?
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="btn btn-primary w-full py-3"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="inline-block animate-spin mr-2">↻</span>
            <span v-if="isLoading">Signing in...</span>
            <span v-else>Sign in</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
