<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const errors = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  form: '' // General form error message
});

const isLoading = computed(() => authStore.loading);
const errorMessage = computed(() => authStore.error);

/**
 * Validates the registration form fields.
 * @returns {boolean} True if the form is valid, false otherwise.
 */
const validateForm = (): boolean => {
  let isValid = true;
  // Reset all error messages
  errors.value = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    form: ''
  };

  // Name validation
  if (!name.value.trim()) { // Use .trim() to check for empty or just whitespace
    errors.value.name = 'Name is required';
    isValid = false;
  }

  // Email validation
  if (!email.value.trim()) {
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
  } else if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters';
    isValid = false;
  }

  // Confirm Password validation
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match';
    isValid = false;
  }

  return isValid;
};

/**
 * Handles the form submission for registration.
 */
const handleSubmit = async () => {
  if (!validateForm()) {
    // If validation fails, stop submission
    return;
  }

  // Attempt to register using the auth store
  const success = await authStore.register({
    name: name.value,
    email: email.value,
    password: password.value
  });

  if (success) {
    // If registration is successful, redirect to dashboard
    router.push('/dashboard');
  } else {
    // If registration fails, display the error message from the store
    errors.value.form = errorMessage.value || 'Registration failed. Please try again.';
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-neutral-800">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-neutral-600">
          Or
          <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500">
            sign in to your existing account
          </router-link>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div v-if="errors.form" class="bg-danger-50 text-danger-700 p-3 rounded-md text-sm">
          {{ errors.form }}
        </div>

        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-neutral-700 mb-1">Full name</label>
            <input
              id="name"
              v-model="name"
              name="name"
              type="text"
              autocomplete="name"
              class="form-input"
              :class="{ 'border-danger-500 focus:ring-danger-500 focus:border-danger-500': errors.name }"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-danger-600">{{ errors.name }}</p>
          </div>

          <div>
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

          <div>
            <label for="password" class="block text-sm font-medium text-neutral-700 mb-1">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="new-password"
              class="form-input"
              :class="{ 'border-danger-500 focus:ring-danger-500 focus:border-danger-500': errors.password }"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-danger-600">{{ errors.password }}</p>
          </div>

          <div>
            <label for="confirm-password" class="block text-sm font-medium text-neutral-700 mb-1">Confirm Password</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              name="confirm-password"
              type="password"
              autocomplete="new-password"
              class="form-input"
              :class="{ 'border-danger-500 focus:ring-danger-500 focus:border-danger-500': errors.confirmPassword }"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-danger-600">{{ errors.confirmPassword }}</p>
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="btn btn-primary w-full py-3"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="inline-block animate-spin mr-2">↻</span>
            <span v-if="isLoading">Creating account...</span>
            <span v-else>Create account</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
