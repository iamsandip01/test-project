<script setup lang="ts">
// Define props for the EmptyState component
defineProps<{
  title: string;
  description?: string; // Optional description text
  actionLabel?: string; // Optional label for an action button/link
  actionLink?: string; // Optional link for the action button
}>();
</script>

<template>
  <div class="text-center py-12 px-4">
    <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
    <h3 class="mt-4 text-lg font-medium text-neutral-800">{{ title }}</h3>
    <p v-if="description" class="mt-2 text-neutral-600">{{ description }}</p>
    <div v-if="actionLabel && actionLink" class="mt-6">
      <router-link :to="actionLink" class="btn btn-primary">
        {{ actionLabel }}
      </router-link>
    </div>
  </div>
</template>
