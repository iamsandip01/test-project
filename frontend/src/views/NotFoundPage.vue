<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
    <div class="max-w-md w-full text-center">
      <h1 class="text-9xl font-extrabold text-primary-600">404</h1>
      <h2 class="mt-4 text-3xl font-bold text-neutral-800">Page Not Found</h2>
      <p class="mt-2 text-neutral-600">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <div class="mt-6">
        <button @click="goHome" class="btn btn-primary">
          Go to Home Page
        </button>
      </div>
    </div>
  </div>
</template>