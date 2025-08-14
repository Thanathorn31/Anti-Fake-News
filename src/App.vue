<!-- src/App.vue -->
<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import logoUrl from '@/assets/image/logo.png'
import BaseToast from '@/components/BaseToast.vue' // ⬅️ เพิ่ม
import { SpeedInsights } from "@vercel/speed-insights/vue"



const route = useRoute()
function navClass(name: string) {
  return route.name === name
    ? 'bg-white/90 text-[#2c3e50]'
    : 'text-white/90 hover:bg-white/15 hover:text-white'
}
</script>

<template>
  <SpeedInsights/>
  <div id="app" class="font-sans bg-gradient-to-b from-[#f6f6f6] via-rose-100 to-[#f9f5f2] antialiased text-gray-800 flex flex-col min-h-screen">


    <!-- NAVBAR -->
    <header class="bg-[#AF0000] text-white shadow-md">
      <div class="container mx-auto px-4">
        <nav class="h-14 flex items-center justify-between">
          <!-- Left: Brand -->
          <RouterLink :to="{ name: 'news-list-view' }" class="flex items-center gap-2 group">
            <img :src="logoUrl" alt="ABC News Logo" class="h-12 w-12" />
            <span class="text-xl font-extrabold tracking-tight">ABC News</span>
          </RouterLink>

          <!-- Right: Nav items -->
          <ul class="flex items-center gap-2">
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
        </nav>
      </div>
    </header>

    <!-- MAIN -->
    <main class="container mx-auto px-4 mt-8 flex-grow">
      <RouterView />
    </main>

    <!-- Toast -->
    <BaseToast /> <!-- ⬅️ วางไว้แค่จุดนี้ ครั้งเดียวทั้งโปรเจกต์ -->
    

    <!-- FOOTER -->
    <footer class="bg-gray-200 text-gray-600 p-4 mt-8 text-center">
      <div class="container mx-auto">
        <p>&copy; 2025 The Social Anti-Fake News System. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>
