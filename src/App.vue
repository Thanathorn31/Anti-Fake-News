<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <div id="app" class="font-sans antialiased text-gray-800 flex flex-col min-h-screen">
    <header class="bg-[#42b983] text-white p-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-bold">
          <RouterLink to="/" class="text-white no-underline">
            TruthFinder
          </RouterLink>
        </h1>
        <nav>
          <ul class="flex space-x-4">
            <li>
              <RouterLink to="/" class="text-white no-underline hover:underline">
                Home
              </RouterLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>

    <main class="container mx-auto mt-8 flex-grow">
      <RouterView />
    </main>

    <footer class="bg-gray-200 text-gray-600 p-4 mt-8 text-center">
      <div class="container mx-auto">
        <p>&copy; 2024 TruthFinder. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>