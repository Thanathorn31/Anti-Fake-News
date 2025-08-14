<!-- src/components/BaseToast.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useMessageStore } from '@/stores/messageStore'

const store = useMessageStore()
const color = computed(() => {
  switch (store.type) {
    case 'success': return 'bg-emerald-600'
    case 'error':   return 'bg-red-600'
    case 'info':    return 'bg-sky-600'
    case 'warning': return 'bg-amber-600'
    default:        return 'bg-emerald-600'
  }
})
</script>

<template>
  <transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="store.visible"
      class="fixed inset-x-0 top-4 z-[1000] flex justify-center px-4"
      role="status" aria-live="polite"
    >
      <div
        class="max-w-md w-full text-white shadow-lg rounded-xl px-4 py-3 flex items-center gap-2"
        :class="color"
      >
        <!-- icon -->
        <svg v-if="store.type==='success'" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 13 4 4L19 7"/>
        </svg>
        <svg v-else-if="store.type==='error'" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 18 12-12M6 6l12 12"/>
        </svg>
        <svg v-else-if="store.type==='info'" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"/>
        </svg>
        <svg v-else class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z"/>
        </svg>

        <h4 class="text-sm font-medium leading-snug">
          {{ store.message }}
        </h4>

        <button
          class="ml-auto text-white/90 hover:text-white focus:outline-none"
          @click="store.hide()"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* ไม่มีสไตล์เพิ่ม — ใช้ Tailwind ล้วน ๆ */
</style>
