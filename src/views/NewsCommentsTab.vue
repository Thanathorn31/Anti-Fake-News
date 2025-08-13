<!-- src/views/NewsCommentsTab.vue -->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useNewsStore } from '@/stores/newsStore'
import type { NewsItem } from '@/types'

const props = defineProps<{ id: number }>()
const store = useNewsStore()

const news = computed<NewsItem | null>(() => store.getById(props.id) ?? null)

onMounted(async () => {
  if (!news.value) await store.fetchOne(props.id)
})

/** UI helpers */
function initials(name: string) {
  const t = (name || 'A').trim()
  const parts = t.split(/\s+/).slice(0, 2)
  return parts.map(p => p[0]?.toUpperCase() || '').join('') || 'A'
}
function colorHsl(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360
  return { bg: `hsl(${h} 70% 90%)`, fg: `hsl(${h} 80% 25%)` }
}

/** Sorting + Pagination */
const sortMode = ref<'new' | 'old'>('new')
const page = ref(1)
const perPage = ref(5)
const perPageChoices = [5, 10, 15, 20]

const allComments = computed(() => {
  const arr = news.value?.comments ?? []
  const sorted = [...arr].sort((a, b) => {
    const da = +new Date(a.date)
    const db = +new Date(b.date)
    return sortMode.value === 'new' ? db - da : da - db
  })
  return sorted
})

const total = computed(() => allComments.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)))
const items = computed(() => {
  const start = (page.value - 1) * perPage.value
  return allComments.value.slice(start, start + perPage.value)
})

watch([perPage, sortMode], () => { page.value = 1 })
</script>

<template>
  <section v-if="news" class="space-y-5">
    <!-- Header controls -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h3 class="text-xl font-semibold tracking-tight">Comments</h3>
        <p class="text-xs text-gray-500">
          Showing <b>{{ items.length }}</b> of <b>{{ total }}</b>
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Sort pill group -->
        <div class="inline-flex rounded-full bg-gray-100 p-1">
          <button
            class="px-3 py-1 text-xs rounded-full"
            :class="sortMode==='new' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'"
            @click="sortMode='new'"
          >
            Newest
          </button>
          <button
            class="px-3 py-1 text-xs rounded-full"
            :class="sortMode==='old' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'"
            @click="sortMode='old'"
          >
            Oldest
          </button>
        </div>

        <!-- Per page segmented control -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">Per page</span>
          <div class="flex items-center gap-1 bg-white border rounded-full p-1 shadow-sm">
            <button
              v-for="n in perPageChoices"
              :key="n"
              type="button"
              class="px-3 py-1 text-xs rounded-full transition"
              :class="perPage===n
                ? 'bg-[#42b983] text-white shadow'
                : 'text-gray-700 hover:bg-gray-100'"
              @click="perPage = n"
            >
              {{ n }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-if="total === 0" class="p-8 rounded-xl border bg-white/60 backdrop-blur text-center">
      <p class="text-gray-500">No comments yet.</p>
      <router-link
        :to="{ name: 'news-detail-vote', params: { id: news.id } }"
        class="inline-block mt-2 text-sm text-[#42b983] underline"
      >
        Go to Vote & Comment
      </router-link>
    </div>

    <!-- List -->
    <ul v-else class="space-y-4">
      <li v-for="c in items" :key="c.id" class="grid grid-cols-[auto,1fr] gap-3">
        <!-- avatar -->
        <div
          class="w-10 h-10 rounded-full grid place-items-center font-semibold text-sm shrink-0"
          :style="{ backgroundColor: colorHsl(c.user).bg, color: colorHsl(c.user).fg }"
          :title="c.user"
        >
          {{ initials(c.user) }}
        </div>

        <!-- card -->
        <div class="rounded-xl border bg-white/70 backdrop-blur p-4 hover:shadow-sm transition">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="text-xs text-gray-500">
              {{ new Date(c.date).toLocaleString() }} • <b class="text-gray-700">{{ c.user }}</b>
            </div>
            <span
              class="text-[11px] px-2 py-0.5 rounded-full border font-medium"
              :class="c.vote==='fake'
                ? 'border-red-200 text-red-700 bg-red-50'
                : 'border-emerald-200 text-emerald-700 bg-emerald-50'"
            >
              {{ c.vote === 'fake' ? 'Fake' : 'Not Fake' }}
            </span>
          </div>

          <p class="mt-2 text-sm leading-relaxed text-gray-800">
            {{ c.comment }}
          </p>

          <div class="mt-2">
            <a
              v-if="c.imageUrl"
              :href="c.imageUrl"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
            >
              🔗 Evidence
            </a>
          </div>
        </div>
      </li>
    </ul>

    <!-- Pagination (only “Page X of Y ‹ Prev Next ›”) -->
    <div class="mt-4 flex items-center justify-center gap-3 text-sm text-gray-800">
      <button
        class="px-3 py-1 rounded-full hover:bg-gray-100 disabled:opacity-40"
        :disabled="page<=1"
        @click="page--"
      >
        ‹ Prev
      </button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button
        class="px-3 py-1 rounded-full hover:bg-gray-100 disabled:opacity-40"
        :disabled="page>=totalPages"
        @click="page++"
      >
        Next ›
      </button>
    </div>
  </section>

  <div v-else class="p-6 rounded-xl border bg-white/60 text-sm text-gray-500">Loading comments…</div>
</template>
