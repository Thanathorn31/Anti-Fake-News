<!-- src/views/NewsCommentsTab.vue -->
<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useNewsStore } from '@/stores/newsStore'
import type { NewsItem } from '@/types'

const props = defineProps<{ id: number }>()
const store = useNewsStore()

const news = computed<NewsItem | null>(() => store.getById(props.id) ?? null)
const loading = ref(false)

onMounted(async () => {
  if (!news.value) {
    loading.value = true
    await store.fetchOne(props.id).catch(() => {})
    loading.value = false
  }
  maybeScrollToComments()
})

watch(news, async (val, oldVal) => {
  if (val && !oldVal) {
    await nextTick()
    maybeScrollToComments()
  }
})

function maybeScrollToComments() {
  if (typeof window === 'undefined') return
  const el = document.getElementById('comments-section')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

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

// dd/MM/yyyy HH:mm
function formatDMYTime(input: string) {
  const d = new Date(input)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

/** Sorting + Pagination */
const sortMode = ref<'new' | 'old'>('new')
const page = ref(1)
const perPage = ref(5)
const perPageChoices = [5, 10, 15, 20]

/** Source of truth = combined comments (remote + local) */
const allComments = computed(() => {
  if (!news.value) return []
  const arr = store.getCombinedComments(news.value)
  const sorted = [...arr].sort((a, b) => {
    const da = +new Date(a.date)
    const db = +new Date(b.date)
    return sortMode.value === 'new' ? db - da : da - db
  })
  return sorted
})

/** Vote summary (from comments only) */
const voteSummary = computed(() => {
  const fake = allComments.value.filter(c => c.vote === 'fake').length
  const notFake = allComments.value.filter(c => c.vote === 'not-fake').length
  const total = fake + notFake
  const fakePct = total ? Math.round((fake / total) * 100) : 0
  const notFakePct = total ? 100 - fakePct : 0
  const status: 'fake' | 'not-fake' = fake >= notFake ? 'fake' : 'not-fake'
  return { fake, notFake, total, fakePct, notFakePct, status }
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
  <section id="comments-section" v-if="news" class="space-y-5">
    <!-- Top summary -->
    <div class="rounded-2xl border bg-white/80 backdrop-blur p-5 shadow-sm space-y-4" aria-live="polite">
      <div class="grid gap-3 sm:grid-cols-2 sm:items-center">
        <!-- Left: status + numbers -->
        <div class="min-w-0 flex flex-wrap items-center gap-2 sm:gap-3">
          <span
            class="text-xs font-semibold inline-flex items-center gap-1 px-3 py-1 rounded-full border shadow-sm shrink-0"
            :class="voteSummary.status === 'fake'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'">
            {{ voteSummary.status === 'fake' ? 'Fake' : 'Not Fake' }}
          </span>

          <p class="text-sm text-gray-700 flex flex-wrap items-center gap-2 min-w-0">
            <span class="shrink-0">Votes (from comments):</span>
            <span class="inline-flex items-center px-2 py-1 rounded-full border border-red-200 bg-red-50 text-red-700 font-semibold shadow-sm shrink-0">
              Fake {{ voteSummary.fake }}
            </span>
            <span class="opacity-40 shrink-0">/</span>
            <span class="inline-flex items-center px-2 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold shadow-sm shrink-0">
              Not Fake {{ voteSummary.notFake }}
            </span>
            <span class="text-gray-400 text-xs shrink-0">Total {{ voteSummary.total }}</span>
          </p>
        </div>

        <!-- Right: progress -->
        <div class="w-full sm:justify-self-end sm:max-w-xs">
          <div
            class="h-3 w-full bg-gray-200 rounded-full overflow-hidden flex shadow-inner"
            role="progressbar"
            :aria-valuenow="voteSummary.fakePct"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Fake vs Not Fake percentage"
          >
            <div class="h-full bg-red-500 transition-all duration-300" :style="{ width: voteSummary.fakePct + '%' }"></div>
            <div class="h-full bg-emerald-500 transition-all duration-300" :style="{ width: voteSummary.notFakePct + '%' }"></div>
          </div>
          <div class="flex justify-between text-[11px] text-gray-600 mt-1">
            <span>Fake {{ voteSummary.fakePct }}%</span>
            <span>Not Fake {{ voteSummary.notFakePct }}%</span>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="pt-2 border-t border-gray-100">
        <router-link
          :to="{ name: 'news-detail-vote', params: { id: news.id }, hash: '#vote-section' }"
          class="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full border bg-white hover:bg-gray-50 shadow-sm hover:shadow transition-all duration-200"
        >
          ➕ Add your vote & comment
        </router-link>
      </div>
    </div>

    <!-- Header controls -->
    <div class="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sticky top-2 z-10 bg-white/60 backdrop-blur rounded-xl p-2">
      <div>
        <h3 class="text-xl font-semibold tracking-tight">
          Comments <span class="text-gray-400">({{ total }})</span>
        </h3>
        <p class="text-xs text-gray-500">
          Showing <b>{{ items.length }}</b> of <b>{{ total }}</b>
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Sort group: scrollable on mobile -->
        <div class="inline-flex rounded-full bg-gray-100 p-1 shadow-inner overflow-x-auto max-w-[60vw] sm:max-w-none whitespace-nowrap">
          <button
            class="px-3 py-1 text-xs rounded-full transition"
            :class="sortMode==='new' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'"
            @click="sortMode='new'">
            Newest
          </button>
          <button
            class="px-3 py-1 text-xs rounded-full transition"
            :class="sortMode==='old' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'"
            @click="sortMode='old'">
            Oldest
          </button>
        </div>

        <!-- Per page group: scrollable on mobile -->
        <div class="flex items-center gap-2 overflow-x-auto max-w-[40vw] sm:max-w-none">
          <span class="text-sm text-gray-600 shrink-0">Per page</span>
          <div class="flex items-center gap-1 bg-white border rounded-full p-1 shadow-sm whitespace-nowrap">
            <button
              v-for="n in perPageChoices"
              :key="n"
              type="button"
              class="px-3 py-1 text-xs rounded-full transition"
              :class="perPage===n ? 'bg-[#42b983] text-white shadow' : 'text-gray-700 hover:bg-gray-100'"
              @click="perPage = n">
              {{ n }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3" aria-hidden="true">
      <div v-for="i in 3" :key="i" class="grid grid-cols-[auto,1fr] gap-3">
        <div class="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
        <div class="rounded-xl border p-4">
          <div class="h-3 w-40 bg-gray-200 rounded animate-pulse"></div>
          <div class="mt-2 h-3 w-full bg-gray-200 rounded animate-pulse"></div>
          <div class="mt-2 h-3 w-5/6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="total === 0" class="p-8 rounded-xl border bg-white/60 backdrop-blur text-center">
      <p class="text-gray-500">No comments yet.</p>
      <router-link
        :to="{ name: 'news-detail-vote', params: { id: news.id }, hash: '#vote-section' }"
        class="inline-block mt-2 text-sm text-[#42b983] underline">
        Go to Vote & Comment
      </router-link>
    </div>

    <!-- List -->
    <ul v-else class="space-y-4" aria-live="polite">
      <li v-for="c in items" :key="c.id" class="grid grid-cols-[40px,1fr] gap-3">
        <!-- avatar -->
        <div
          class="w-10 h-10 rounded-full grid place-items-center font-semibold text-sm shrink-0"
          :style="{ backgroundColor: colorHsl(c.user).bg, color: colorHsl(c.user).fg }"
          :title="c.user">
          {{ initials(c.user) }}
        </div>

        <!-- card -->
        <div class="rounded-xl border bg-white/70 backdrop-blur p-4 hover:shadow-sm transition min-w-0">
          <div class="flex items-start gap-2">
            <div class="text-xs text-gray-500 flex-1 min-w-0">
              <span class="whitespace-nowrap">{{ formatDMYTime(c.date) }}</span>
              <span class="opacity-50"> • </span>
              <b class="text-gray-700 break-words">{{ c.user }}</b>
            </div>
            <span
              class="text-[11px] px-2 py-0.5 rounded-full border font-medium shrink-0 self-start"
              :class="c.vote==='fake'
                ? 'border-red-200 text-red-700 bg-red-50'
                : 'border-emerald-200 text-emerald-700 bg-emerald-50'">
              {{ c.vote === 'fake' ? 'Fake' : 'Not Fake' }}
            </span>
          </div>

          <p class="mt-2 text-sm leading-relaxed text-gray-800 break-words whitespace-normal">
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
    <div v-if="!loading" class="mt-4 flex items-center justify-center gap-3 text-sm text-gray-800">
      <button class="px-3 py-1 rounded-full hover:bg-gray-100 disabled:opacity-40" :disabled="page<=1" @click="page--">
        ‹ Prev
      </button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button class="px-3 py-1 rounded-full hover:bg-gray-100 disabled:opacity-40" :disabled="page>=totalPages" @click="page++">
        Next ›
      </button>
    </div>
  </section>

  <div v-else class="p-6 rounded-xl border bg-white/60 text-sm text-gray-500">Loading comments…</div>
</template>
