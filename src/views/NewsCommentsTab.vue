<!-- src/views/NewsCommentsTab.vue (summary + clickable filters) -->
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
/** Date + time: dd/MM/yyyy HH:mm */
function formatDMYTime(input: string) {
  const d = new Date(input)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

/** Sorting + Pagination + Filtering */
const sortMode = ref<'new' | 'old'>('new')
const page = ref(1)
const perPage = ref(5)


type VoteFilter = 'all' | 'fake' | 'not-fake'
const filterVote = ref<VoteFilter>('all') // ← new: filter by vote type

/** All comments (sorted) */
const allComments = computed(() => {
  const arr = news.value?.comments ?? []
  const sorted = [...arr].sort((a, b) => {
    const da = +new Date(a.date)
    const db = +new Date(b.date)
    return sortMode.value === 'new' ? db - da : da - db
  })
  return sorted
})

/** NEW: counts based on ALL comments (for summary badges) */
const countsAll = computed(() => {
  const arr = allComments.value
  const fake = arr.filter(c => c.vote === 'fake').length
  const notFake = arr.filter(c => c.vote === 'not-fake').length
  const total = fake + notFake
  const pctFake = total ? Math.round((fake / total) * 100) : 0
  const pctNotFake = total ? Math.round((notFake / total) * 100) : 0
  const leading = fake === notFake ? 'tie' : fake > notFake ? 'fake' : 'not-fake'
  return { fake, notFake, total, pctFake, pctNotFake, leading }
})

/** NEW: list used by the UI after applying the Vote filter */
const filteredComments = computed(() => {
  if (filterVote.value === 'all') return allComments.value
  return allComments.value.filter(c => c.vote === filterVote.value)
})

const total = computed(() => filteredComments.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)))
const items = computed(() => {
  const start = (page.value - 1) * perPage.value
  return filteredComments.value.slice(start, start + perPage.value)
})

watch([perPage, sortMode, filterVote], () => { page.value = 1 })
</script>

<template>
  <section id="comments-section" v-if="news" class="space-y-5">
    <!-- Header controls -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h3 class="text-xl font-semibold tracking-tight">
          Comments <span class="text-gray-400">({{ total }})</span>
        </h3>
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
          >Newest</button>
          <button
            class="px-3 py-1 text-xs rounded-full"
            :class="sortMode==='old' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'"
            @click="sortMode='old'"
          >Oldest</button>
        </div>
      </div>
    </div>

    <!-- Summary + CLICKABLE vote filters -->
    <div class="rounded-xl border bg-white/70 backdrop-blur p-4 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">Based on comments</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border">
            {{ countsAll.total }} total
          </span>
        </div>

        <!-- Clickable chips act as filters -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="text-xs font-medium px-2 py-1 rounded-full border transition"
            :class="filterVote==='all'
              ? 'bg-slate-800 text-white border-slate-800 shadow'
              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'"
            @click="filterVote='all'"
            title="Show all comments"
          >
            All
          </button>

          <button
            type="button"
            class="text-xs font-medium px-2 py-1 rounded-full border transition"
            :class="filterVote==='fake'
              ? 'bg-red-50 text-red-700 border-red-200 shadow'
              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'"
            @click="filterVote='fake'"
            title="Show only Fake comments"
          >
            Fake: {{ countsAll.pctFake }}% ({{ countsAll.fake }})
          </button>

          <button
            type="button"
            class="text-xs font-medium px-2 py-1 rounded-full border transition"
            :class="filterVote==='not-fake'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow'
              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'"
            @click="filterVote='not-fake'"
            title="Show only Not Fake comments"
          >
            Not Fake: {{ countsAll.pctNotFake }}% ({{ countsAll.notFake }})
          </button>
        </div>
      </div>

      <!-- progress bar shows overall split (not filtered) -->
      <div class="mt-3 h-3 w-full bg-gray-200 rounded overflow-hidden relative">
        <div class="h-full bg-red-500" :style="{ width: countsAll.pctFake + '%' }"></div>
        <div class="h-full bg-emerald-500 absolute inset-y-0 right-0"
             :style="{ width: countsAll.pctNotFake + '%' }"></div>
      </div>

      <p class="mt-2 text-xs text-gray-600">
        <template v-if="countsAll.total === 0">
          No votes from comments yet.
        </template>
        <template v-else-if="countsAll.fake === countsAll.notFake">
          It’s a tie based on comments.
        </template>
        <template v-else>
          Majority:
          <b :class="countsAll.fake > countsAll.notFake ? 'text-red-700' : 'text-emerald-700'">
            {{ countsAll.fake > countsAll.notFake ? 'Fake' : 'Not Fake' }}
          </b>
        </template>
      </p>
    </div>

    <!-- Empty -->
    <div v-if="total === 0" class="p-8 rounded-xl border bg-white/60 backdrop-blur text-center">
      <p class="text-gray-500">No comments found for this filter.</p>
      <div class="mt-2">
        <button
          v-if="filterVote!=='all'"
          class="text-sm text-[#42b983] underline"
          @click="filterVote='all'"
        >Clear filter</button>
      </div>
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
              {{ formatDMYTime(c.date) }} • <b class="text-gray-700">{{ c.user }}</b>
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

<!-- Pagination -->
<div class="mt-4 flex items-center justify-center gap-3 text-sm text-gray-800">
  <button
    class="px-4 py-1 rounded-full bg-[#AF0000] text-white font-medium hover:bg-[#af0000d8] disabled:opacity-40 transition-colors"
    :disabled="page<=1"
    @click="page--"
  >
    ‹ Prev
  </button>
  
  <span>Page {{ page }} of {{ totalPages }}</span>
  
  <button 
    class="px-4 py-1 rounded-full bg-[#AF0000] text-white font-medium hover:bg-[#af0000d8] disabled:opacity-40 transition-colors"
    :disabled="page>=totalPages"
    @click="page++"
  >
    Next ›
  </button>
</div>

  </section>

  <div v-else class="p-6 rounded-xl border bg-white/60 text-sm text-gray-500">Loading comments…</div>
</template>
