<script setup lang="ts">
import NewsCard from '@/components/NewsCard.vue'
import type { NewsItem } from '@/types'
import { ref, computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useNewsStore } from '@/stores/newsStore'

const router = useRouter()
const store = useNewsStore()

const props = defineProps<{
  page: number
  pageSize: number
  filter?: 'all' | 'fake' | 'not-fake'
  q?: string
}>()

const page = computed(() => Number(props.page) || 1)
const pageSize = computed(() => Number(props.pageSize) || 10)
const filter = computed(() => (props.filter ?? 'all') as 'all' | 'fake' | 'not-fake')
const searchTerm = ref(props.q ?? '')

watchEffect(() => {
  store.fetchList(pageSize.value, page.value, filter.value, searchTerm.value.trim())
})

const newsItems = computed<NewsItem[] | null>(() => (store.loading ? null : store.list))
const totalNews = computed(() => store.total)
const hasNextPage = computed(() => Math.ceil(totalNews.value / pageSize.value) > page.value)

const pageSizeOptions = [5, 10, 15, 20]
const filterOptions = [
  { value: 'all', label: 'All News' },
  { value: 'fake', label: 'Fake News' },
  { value: 'not-fake', label: 'Not Fake News' },
]

function handleSearch() {
  router.push({
    name: 'news-list-view',
    query: {
      page: 1,
      pageSize: pageSize.value,
      filter: filter.value,
      q: searchTerm.value.trim(),
    },
  })
}
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-4xl font-bold text-center mt-8 mb-4 text-[#2c3e50]">
      The Social Anti-Fake News System
    </h1>
    <p class="text-center text-gray-600 mb-8">Community votes and comments decide the news status.</p>

    <!-- Controls -->
    <div class="flex flex-col md:flex-row items-center justify-between mb-8 p-4 bg-gray-50 rounded-lg shadow-sm gap-4">
      <div class="flex-1 w-full">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search news by title or detail..."
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#42b983]"
          @keyup.enter="handleSearch"
        />
      </div>

      <div class="flex items-center gap-4 w-full md:w-auto flex-wrap">
        <!-- Filter -->
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
          class="px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#42b983] cursor-pointer"
        >
          <option v-for="option in filterOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <!-- Per page -->
        <select
          :value="pageSize"
          @change="
            $router.push({
              name: 'news-list-view',
              query: {
                page: 1,
                pageSize: Number(($event.target as HTMLSelectElement).value),
                filter: filter,
                q: searchTerm,
              },
            })
          "
          class="px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#42b983] cursor-pointer"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            {{ size }} items
          </option>
        </select>

        <button
          @click="handleSearch"
          class="px-6 py-2 bg-[#42b983] text-white rounded-md font-medium hover:bg-[#36a374] transition-colors"
        >
          Search
        </button>
      </div>
    </div>

    <!-- List -->
    <div v-if="newsItems && newsItems.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NewsCard v-for="n in newsItems" :key="n.id" :news="n" />
    </div>
    <div v-else-if="newsItems === null" class="text-center text-gray-500 text-lg mt-12">
      <p>Loading news...</p>
    </div>
    <div v-else class="text-center text-gray-500 text-lg mt-12">
      <p>No news found with the current filters.</p>
    </div>

    <!-- Pagination -->
    <div class="flex flex-col items-center gap-6 mx-auto my-12 max-w-xl">
      <div class="flex justify-center items-center gap-8">
        <router-link
          id="page-prev"
          v-if="page > 1"
          :to="{ name: 'news-list-view', query: { page: page - 1, pageSize, filter, q: searchTerm } }"
          rel="prev"
          class="inline-flex items-center gap-2 py-[10px] px-4 bg-[#42b983] text-white rounded-[6px] font-medium text-sm hover:bg-[#36a374]"
        >
          <span>Previous</span>
        </router-link>

        <div class="text-gray-600 text-sm font-medium px-4">
          <span>Page {{ page }} of {{ Math.ceil(totalNews / pageSize) }}</span>
        </div>

        <router-link
          id="page-next"
          v-if="hasNextPage"
          :to="{ name: 'news-list-view', query: { page: page + 1, pageSize, filter, q: searchTerm } }"
          rel="next"
          class="inline-flex items-center gap-2 py-[10px] px-4 bg-[#42b983] text-white rounded-[6px] font-medium text-sm hover:bg-[#36a374]"
        >
          <span>Next</span>
        </router-link>
      </div>
    </div>
  </div>
</template>
