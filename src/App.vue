<!-- App.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import logoUrl from '@/assets/image/logo.png'
import BaseToast from '@/components/BaseToast.vue'


const route = useRoute()
const mobileOpen = ref(false)

function navClass(name: string) {
  return route.name === name
    ? 'bg-white/90 text-[#2c3e50]'
    : 'text-white/90 hover:bg-white/15 hover:text-white'
}

watch(() => route.fullPath, () => {
  mobileOpen.value = false
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gradient-to-b from-[#f6f6f6] via-rose-100 to-[#f9f5f2]">
    <!-- Navbar -->
    <header class="bg-[#AF0000] text-white shadow-md sticky top-0 z-50">
      <div class="container mx-auto px-4 flex items-center justify-between h-14">
        
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2">
          <img :src="logoUrl" alt="Logo" class="h-10 w-10" />
          <span class="text-lg font-bold">ABC News</span>
        </RouterLink>

        <!-- Desktop Menu <ul class="hidden flex items-center gap-4"></ul> -->
        <ul class="hidden md:flex items-center gap-2">
            <li>
              <RouterLink
                :to="{ name: 'news-list-view' }"
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition"
                :class="navClass('news-list-view')"
              >
                Home
              </RouterLink>
            </li>
            <li>
              <RouterLink
                :to="{ name: 'about' }"
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition"
                :class="navClass('about')"
              >
                About
              </RouterLink>
            </li>
          </ul>
          

        <!-- Mobile Hamburger -->
        <button class="md:hidden p-2 rounded-lg hover:bg-white/10" @click="mobileOpen = !mobileOpen">
          <svg v-if="!mobileOpen" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"
               viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"
               viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <transition enter-active-class="transition duration-200 ease-out"
                  enter-from-class="opacity-0 -translate-y-2"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition duration-150 ease-in"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 -translate-y-2">
        <div v-if="mobileOpen" class="md:hidden bg-[#C70F0F]">
          <ul class="flex flex-col p-4 space-y-2">
            <li><RouterLink :to="{ name: 'news-list-view' }" class="block py-2 px-3 rounded hover:bg-white/10">Home</RouterLink></li>
            <li><RouterLink :to="{ name: 'about' }" class="block py-2 px-3 rounded hover:bg-white/10">About</RouterLink></li>
          </ul>
        </div>
      </transition>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 mt-6 flex-grow">
      <RouterView />
    </main>

    <!-- Toast -->
    <BaseToast />


    <!-- Footer -->
    <footer class="bg-gray-200 text-gray-600 p-4 text-center">
      <p>&copy; 2025 The Social Anti-Fake News System. All rights reserved.</p>
    </footer>
  </div>
</template>
