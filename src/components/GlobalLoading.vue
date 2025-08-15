<!-- src/components/GlobalLoading.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLoadingStore } from '@/stores/loadingStore'

const loading = useLoadingStore()
const { active, message } = storeToRefs(loading)
</script>

<template>
  <div
    v-if="active"
    class="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center"
    role="alert"
    aria-live="polite"
  >
    <div class="h-12 w-12 mb-4 rounded-full border-4 border-red-600 border-t-transparent animate-spin"></div>
    <p class="text-red-600 font-bold text-lg">{{ message }}</p>
  </div>
</template>

<style scoped>
@keyframes spin { to { transform: rotate(360deg) } }
.animate-spin { animation: spin 1s linear infinite; }
</style>
