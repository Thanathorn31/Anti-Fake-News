<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLoadingStore } from '@/stores/loadingStore'

const store = useLoadingStore()
const { active, message } = storeToRefs(store)
</script>

<template>
  <transition name="fade" appear>
    <div
      v-if="active"
      class="fixed inset-0 z-[9999] grid place-items-center bg-white/70 backdrop-blur-sm"
      role="status" aria-live="assertive"
    >
      <div class="flex flex-col items-center gap-4">
        <!-- วงกลม -->
        <div
          class="h-14 w-14 rounded-full border-8 border-red-200 border-t-transparent animate-spin"
          aria-hidden="true"
        />
        <!-- ข้อความ -->
        <p class="text-2xl font-extrabold text-red-600 tracking-wide">
          {{ message }}
        </p>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
