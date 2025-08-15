<script setup lang="ts">
import NewsCard from '@/components/NewsCard.vue';
import { type NewsItem } from '@/types';
import { ref, computed, watchEffect } from 'vue';
import NewsService from '@/services/NewsService';
import { useNewsStore } from '@/stores/newsStore';
import { RouterLink, useRouter } from 'vue-router';

const newsItems = ref<NewsItem[] | null>(null);
const totalNews = ref(0);
const newsStore = useNewsStore();
const router = useRouter();

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
});

const page = computed(() => props.page);
const pageSize = computed(() => props.pageSize);
const filter = computed(() => props.filter);
const searchTerm = ref('');

const pageSizeOption = [2, 3, 4, 6];
const filterOptions = [
  { value: 'all', label: 'All News' },
  { value: 'fake', label: 'Fake News' },
  { value: 'not-fake', label: 'Non-Fake News' },
];

const hasNextPage = computed(() => {
  const totalPages = Math.ceil(totalNews.value / pageSize.value);
  return totalPages > page.value;
});

watchEffect(() => {
  newsItems.value = null;
  const filterParam = filter.value === 'all' ? undefined : filter.value;
  NewsService.getNews(pageSize.value, page.value, filterParam)
    .then((response) => {
      newsItems.value = response.data;
      totalNews.value = Number(response.headers['x-total-count']);
    })
    .catch((error) => {
      console.error('There was an error fetching the news!', error);
    });
});

const handleSearch = () => {
  if (searchTerm.value) {
    // You can implement search logic here. For this example, we'll just log it.
    console.log(`Searching for: ${searchTerm.value}`);
    // You would typically call a service to fetch search results.
    // For now, we'll just reset the filter to all and search.
    router.push({
      name: 'news-list-view',
      query: { page: 1, pageSize: pageSize.value, filter: 'all', q: searchTerm.value },
    });
  }
};
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-4xl font-bold text-center mt-8 mb-4 text-[#2c3e50]">The Social Anti-Fake News System</h1>
    <p class="text-center text-gray-600 mb-8">
      <br>
      Your reliable source for accurate information.
    </p>

    <!-- Search and Filter Section -->
    <div class="flex flex-col md:flex-row items-center justify-between mb-8 p-4 bg-gray-50 rounded-lg shadow-sm space-y-4 md:space-y-0 md:space-x-4">
      <div class="flex-1 w-full md:w-auto">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search news by topic or detail..."
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#42b983] transition-colors duration-200"
        />
      </div>
      <div class="flex items-center gap-4 w-full md:w-auto">
        <select
          :value="filter"
          @change="
            $router.push({
              name: 'news-list-view',
              query: { page: 1, pageSize: pageSize, filter: $event.target.value },
            })
          "
          class="flex-shrink-0 px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#42b983] cursor-pointer"
        >
          <option v-for="option in filterOptions" :key="option.value" :value="option.value">
            {{ option.label }}
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

    <!-- News List -->
    <div v-if="newsItems && newsItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NewsCard v-for="news in newsItems" :key="news.id" :news="news" />
    </div>
    <div v-else-if="newsItems === null" class="text-center text-gray-500 text-lg mt-12">
      <p>Loading news...</p>
    </div>
    <div v-else class="text-center text-gray-500 text-lg mt-12">
      <p>No news found with the current filters.</p>
    </div>

    <!-- Pagination and Page Size Controls -->
    <div class="flex flex-col items-center gap-6 mx-auto my-12 max-w-xl">
      <div class="flex justify-center items-center gap-8">
        <router-link
          id="page-prev"
          :to="{ name: 'news-list-view', query: { page: page - 1, pageSize: pageSize, filter: filter } }"
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
          :to="{ name: 'news-list-view', query: { page: page + 1, pageSize: pageSize, filter: filter } }"
          rel="next"
          v-if="hasNextPage"
          class="inline-flex items-center gap-2 py-[10px] px-4 bg-[#42b983] text-white no-underline rounded-[6px] font-medium text-sm transition-colors duration-200 ease-in-out min-w-[90px] justify-center hover:bg-[#36a374]"
        >
          <span>Next</span>
        </router-link>
      </div>

      <div class="flex items-center gap-3 bg-[#f8f9fa] py-3 px-4 rounded-lg border border-[#e9ecef]">
        <span class="text-[#666] text-sm font-medium">Show:</span>
        <div class="flex gap-1">
          <router-link
            v-for="size in pageSizeOption"
            :key="size"
            :to="{ name: 'news-list-view', query: { page: 1, pageSize: size, filter: filter } }"
            :class="{
              'bg-[#42b983] text-white border-[#42b983]': pageSize === size,
              'bg-white text-[#666] border-[#ddd]': pageSize !== size,
            }"
            class="inline-flex items-center justify-center min-w-8 h-8 px-2 no-underline rounded text-[13px] font-medium transition-all duration-200 ease-in-out hover:bg-[#f0f0f0] hover:border-[#42b983] hover:text-[#42b983]"
          >
            {{ size }}
          </router-link>
        </div>
        <span class="text-[#666] text-sm font-medium">items</span>
      </div>
    </div>
  </div>
</template>
