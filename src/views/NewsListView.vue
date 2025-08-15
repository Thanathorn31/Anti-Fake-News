<script setup lang="ts">
import NewsCard from '@/components/NewsCard.vue'
import type { NewsItem } from '@/types'
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useNewsStore } from '@/stores/newsStore'

type Filter = 'all' | 'fake' | 'not-fake'

const router = useRouter()
const store = useNewsStore()

const props = defineProps<{
  page: number
  pageSize: number
  filter?: Filter
  q?: string
}>()

const page = computed(() => Number(props.page) || 1)
const pageSize = computed(() => Number(props.pageSize) || 10)
const filter = computed(() => (props.filter ?? 'all') as Filter)
const searchTerm = ref(props.q ?? '')

// ------------------ loaders ------------------
let debounceId: ReturnType<typeof setTimeout> | null = null
let lastKey = ''

function keyFor(pp: number, p: number, f: Filter, q: string) {
  return `p=${p}&s=${pp}&f=${f}&q=${q}`
}

function load(pp = pageSize.value, p = page.value, f = filter.value, q = searchTerm.value.trim()) {
  const key = keyFor(pp, p, f, q)
  if (key === lastKey) return
  lastKey = key
  store.fetchList(pp, p, f, q)
}

// A) เปลี่ยนหน้า/จำนวนต่อหน้า/ฟิลเตอร์ => โหลดทันที (ไม่ debounce)
watch(
  () => [page.value, pageSize.value, filter.value],
  () => load(),
  { immediate: true }
)

// B) ค้นหา => debounce 300ms
watch(
  () => searchTerm.value,
  () => {
    if (debounceId) clearTimeout(debounceId)
    debounceId = setTimeout(() => load(), 300)
  }
)

onBeforeUnmount(() => {
  if (debounceId) clearTimeout(debounceId)
})

// SWR: แสดงของเก่าไว้ถ้า store ยังไม่เคยมีข้อมูล
const newsItems = computed<NewsItem[]>(() => store.list ?? [])
const hasData = computed(() => (newsItems.value?.length ?? 0) > 0)

const totalNews = computed(() => store.total)
const hasNextPage = computed(() => Math.ceil(totalNews.value / pageSize.value) > page.value)

const pageSizeOptions = [5, 10, 15, 20]
const filterOptions: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'fake', label: 'Fake' },
  { value: 'not-fake', label: 'Not Fake' },
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

/* segmented helpers */
function setFilter(v: Filter) {
  router.push({
    name: 'news-list-view',
    query: {
      page: 1,
      pageSize: pageSize.value,
      filter: v,
      q: searchTerm.value.trim(),
    },
  })
}
function setPageSize(v: number) {
  router.push({
    name: 'news-list-view',
    query: {
      page: 1,
      pageSize: v,
      filter: filter.value,
      q: searchTerm.value.trim(),
    },
  })
}
function filterBtnClass(v: Filter) {
  const base = 'px-4 py-1.5 rounded-full text-sm font-medium transition'
  const inactive = 'text-slate-600 hover:bg-white/90'
  if (filter.value !== v) return `${base} ${inactive}`
  if (v === 'fake') return `${base} bg-red-500 text-white shadow`
  if (v === 'not-fake') return `${base} bg-emerald-500 text-white shadow`
  return `${base} bg-slate-800 text-white shadow` // all
}
function pageBtnClass(n: number) {
  const base = 'px-3 sm:px-4 py-1.5 rounded-full text-sm font-semibold transition'
  return pageSize.value === n
    ? `${base} bg-[#AF0000] text-white shadow`
    : `${base} text-slate-700 hover:bg-white/90`
}
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-4xl font-bold text-center mt-8 mb-4 text-[#2c3e50]">
      The Social Anti-Fake News System
    </h1>
    <p class="text-center text-gray-600 mb-8">Community votes and comments decide the news status.</p>

    <!-- Controls bar (Search only) -->
    <div class="mb-3 rounded-2xl bg-gray-50 p-4 shadow-sm">
      <div class="flex gap-2">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search news by title or detail…"
          class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#AF0000]"
          @keyup.enter="handleSearch"
        />
        <button
          @click="handleSearch"
          class="px-5 py-2 rounded-lg bg-[#AF0000] text-white font-medium hover:bg-[#af0000d8] transition-colors"
        >
          Search
        </button>
      </div>
    </div>

    <!-- OUTSIDE bar: left Filter / right Per page -->
    <div class="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <!-- LEFT: Filter segmented -->
      <div class="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 shadow-inner">
        <button
          v-for="opt in filterOptions"
          :key="opt.value"
          type="button"
          :class="filterBtnClass(opt.value)"
          @click="setFilter(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>

      <!-- RIGHT: Per page segmented -->
      <div class="flex items-center gap-3 md:justify-end">
        <span class="text-slate-600">Per page</span>
        <div class="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 shadow-inner">
          <button
            v-for="n in pageSizeOptions"
            :key="n"
            type="button"
            :class="pageBtnClass(n)"
            @click="setPageSize(n)"
          >
            {{ n }}
          </button>
        </div>
      </div>
    </div>

    <!-- List -->
    <div v-if="hasData" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NewsCard v-for="n in newsItems" :key="n.id" :news="n" />
    </div>
    <div v-else-if="store.loading" class="text-center text-gray-500 text-lg mt-12">
      <p>Loading news...</p>
    </div>
    <div v-else class="text-center text-gray-500 text-lg mt-12">
      <p>No news found with the current filters.</p>
    </div>

    <!-- แถบแจ้งกำลังอัปเดต (ไม่บังรายการ) -->
    <div v-if="hasData && store.loading" class="mt-3 text-center text-xs text-slate-500">
      Updating…
    </div>

    <!-- Pagination -->
    <div class="flex flex-col items-center gap-6 mx-auto my-12 max-w-xl">
      <div class="flex justify-center items-center gap-8">
        <router-link
          id="page-prev"
          v-if="page > 1"
          :to="{ name: 'news-list-view', query: { page: page - 1, pageSize: pageSize, filter: filter, q: searchTerm.trim() } }"
          rel="prev"
          class="inline-flex items-center gap-2 py-[10px] px-4 bg-[#AF0000] text-white rounded-[999px] font-medium text-sm hover:bg-[#af0000d8] shadow-sm"
        >
          <span>Previous</span>
        </router-link>

        <div class="text-gray-600 text-sm font-medium px-4">
          <span>Page {{ page }} of {{ Math.ceil(totalNews / pageSize) }}</span>
        </div>

        <router-link
          id="page-next"
          v-if="hasNextPage"
          :to="{ name: 'news-list-view', query: { page: page + 1, pageSize: pageSize, filter: filter, q: searchTerm.trim() } }"
          rel="next"
          class="inline-flex items-center gap-2 py-[10px] px-4 bg-[#AF0000] text-white rounded-[999px] font-medium text-sm hover:bg-[#af0000d8] shadow-sm"
        >
          <span>Next</span>
        </router-link>
      </div>
    </div>
  </div>
</template>
