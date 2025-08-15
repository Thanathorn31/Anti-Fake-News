<script setup lang="ts">
import type { NewsItem } from '@/types';
import { RouterLink } from 'vue-router';

const props = defineProps<{
  news: NewsItem;
}>();
</script>

<template>
  <div class="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
    <RouterLink :to="{ name: 'news-detail', params: { id: news.id } }">
      <img
        :src="news.imageUrl"
        :alt="news.topic"
        class="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
      />
    </RouterLink>
    <div class="p-6">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-xl font-bold text-[#2c3e50] line-clamp-2">
          <RouterLink :to="{ name: 'news-detail', params: { id: news.id } }" class="hover:underline">
            {{ news.topic }}
          </RouterLink>
        </h3>
        <span
          :class="{
            'bg-red-500': news.status === 'fake',
            'bg-green-500': news.status === 'not-fake',
          }"
          class="text-white text-xs font-semibold px-2 py-1 rounded-full uppercase"
        >
          {{ news.status === 'fake' ? 'FAKE' : 'NOT FAKE' }}
        </span>
      </div>
      <p class="text-gray-600 text-sm line-clamp-3 mb-4">
        {{ news.shortDetail }}
      </p>
      <div class="flex items-center justify-between text-gray-500 text-xs">
        <div class="flex items-center space-x-2">
          <span>By: {{ news.reporter }}</span>
          <span>-</span>
          <span>{{ new Date(news.date).toLocaleDateString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
