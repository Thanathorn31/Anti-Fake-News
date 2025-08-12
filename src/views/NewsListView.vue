<script setup lang="ts">
import NewsCard from '@/components/NewsCard.vue';
import { type NewsItem } from '@/types';
import { ref, computed, watchEffect } from 'vue';
import NewsService from '@/services/NewsService';
import { useNewsStore } from '@/stores/newsStore';
import { RouterLink, useRouter, useRoute } from 'vue-router';

const newsItems = ref<NewsItem[] | null>(null);
const totalNews = ref(0);
const newsStore = useNewsStore();
const router = useRouter();
const route = useRoute();

// Define props to sync with URL query parameters
const props = defineProps({
  page: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    required: true,
  },
  filter: {
    type: String,
    required: false,
    default: 'all',
  },
  q: {
    type: String,
    required: false,
    default: '',
  },
});

const page = computed(() => props.page);
const pageSize = computed(() => props.pageSize);
const filter = computed(() => props.filter);
const searchTerm = ref(props.q);

// Commonly used page size options
const pageSizeOption = [5, 10, 15];
const filterOptions = [
  { value: 'all', label: 'All News' },
  { value: 'fake', label: 'Fake News' },
  { value: 'not-fake', label: 'Non-Fake News' },
];

const hasNextPage = computed(() => {
  if (totalNews.value === 0) return false;
  const totalPages = Math.ceil(totalNews.value / pageSize.value);
  return totalPages > page.value;
});

// Fetch news data whenever the URL query parameters change
watchEffect(() => {
  newsItems.value = null;
  NewsService.getNews(pageSize.value, page.value, filter.value, searchTerm.value)
    .then((response) => {
      newsItems.value = response.data;
      totalNews.value = Number(response.headers['x-total-count']);
    })
    .catch((error) => {
      console.error('There was an error fetching the news!', error);
    });
});

// Update the URL with the new search term
const handleSearch = () => {
  router.push({
    name: 'news-list-view',
    query: {
      page: 1,
      pageSize: pageSize.value,
      filter: filter.value,
      q: searchTerm.value,
    },
  });
};
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-4xl font-bold text-center mt-8 mb-4 text-[#2c3e50]">The Social Anti-Fake News System</h1>
    <p class="text-center text-gray-600 mb-8">
      Your reliable source for accurate information.
    </p>

    <div
      class="flex flex-col md:flex-row items-center justify-between mb-8 p-4 bg-gray-50 rounded-lg shadow-sm space-y-4 md:space-y-0 md:space-x-4"
    >
      <div class="flex-1 w-full md:w-auto">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search news by topic or detail..."
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#42b983] transition-colors duration-200"
          @keyup.enter="handleSearch"
        />
      </div>

      <div class="flex items-center gap-4 w-full md:w-auto flex-wrap">
        <select
          :value="filter"
          @change="
            $router.push({
              name: 'news-list-view',
              query: {
                page: 1,
                pageSize: pageSize,
                filter: ($event.target as HTMLSelectElement).value,
                q: searchTerm,
              },
            })
          "
          class="flex-shrink-0 px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#42b983] cursor-pointer"
        >
          <option v-for="option in filterOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <select
          :value="pageSize"
          @change="
            $router.push({
              name: 'news-list-view',
              query: {
                page: 1,
                pageSize: ($event.target as HTMLSelectElement).value,
                filter: filter,
                q: searchTerm,
              },
            })
          "
          class="flex-shrink-0 px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#42b983] cursor-pointer"
        >
          
          <option v-for="size in pageSizeOption" :key="size" :value="size">
            {{ size }} items
          </option>
        </select>

        <button
          @click="handleSearch"
          class="flex-shrink-0 px-6 py-2 bg-[#42b983] text-white rounded-md font-medium hover:bg-[#36a374] transition-colors duration-200"
        >
          Search
        </button>
      </div>
    </div>

    <div v-if="newsItems && newsItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NewsCard v-for="news in newsItems" :key="news.id" :news="news" />
    </div>
    <div v-else-if="newsItems === null" class="text-center text-gray-500 text-lg mt-12">
      <p>Loading news...</p>
    </div>
    <div v-else class="text-center text-gray-500 text-lg mt-12">
      <p>No news found with the current filters.</p>
    </div>

    <div class="flex flex-col items-center gap-6 mx-auto my-12 max-w-xl">
      <div class="flex justify-center items-center gap-8">
        <router-link
          id="page-prev"
          :to="{
            name: 'news-list-view',
            query: { page: page - 1, pageSize: pageSize, filter: filter, q: searchTerm },
          }"
          rel="prev"
          v-if="page > 1"
          class="inline-flex items-center gap-2 py-[10px] px-4 bg-[#42b983] text-white no-underline rounded-[6px] font-medium text-sm transition-colors duration-200 ease-in-out min-w-[90px] justify-center hover:bg-[#36a374]"
        >
          <span>Previous</span>
        </router-link>

        <div class="text-gray-600 text-sm font-medium px-4">
          <span>Page {{ page }} of {{ Math.ceil(totalNews / pageSize) }}</span>
        </div>

        <router-link
          id="page-next"
          :to="{
            name: 'news-list-view',
            query: { page: page + 1, pageSize: pageSize, filter: filter, q: searchTerm },
          }"
          rel="next"
          v-if="hasNextPage"
          class="inline-flex items-center gap-2 py-[10px] px-4 bg-[#42b983] text-white no-underline rounded-[6px] font-medium text-sm transition-colors duration-200 ease-in-out min-w-[90px] justify-center hover:bg-[#36a374]"
        >
          <span>Next</span>
        </router-link>
      </div>
    </div>
  </div>
</template>