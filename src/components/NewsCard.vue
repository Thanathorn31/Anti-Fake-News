
<script setup lang="ts">
import { type NewsItem } from '@/types';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  news: NewsItem;
}>();

const router = useRouter();

const navigateToDetail = () => {
  router.push({ name: 'news-detail-view', params: { id: props.news.id } });
};

const statusClass = computed(() => {
  return props.news.status === 'fake' ? 'bg-red-500' : 'bg-green-500';
});
</script>

<template>
  <div
    class="w-full bg-white rounded-lg shadow-md p-6 mb-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
    @click="navigateToDetail"
  >
    <div class="flex justify-between items-start mb-2">
      <h2 class="text-xl font-bold">{{ news.topic }}</h2>
      <span :class="statusClass" class="text-white text-sm font-medium px-2 py-1 rounded-full">{{
        news.status.toUpperCase()
      }}</span>
    </div>
    <p class="text-gray-600 mb-4 line-clamp-2">{{ news.shortDetail }}</p>
    <div class="flex justify-between text-sm text-gray-500">
      <span>Reporter: {{ news.reporter }}</span>
      <span>{{ new Date(news.date).toLocaleDateString() }}</span>
    </div>
  </div>
</template>


