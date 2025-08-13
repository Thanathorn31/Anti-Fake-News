<!-- src/views/NewsDetailView.vue -->
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useNewsStore } from '@/stores/newsStore'
import type { NewsItem, Comment } from '@/types'
import { useRouter } from 'vue-router'

const props = defineProps<{ id: number }>()
const store = useNewsStore()
const router = useRouter()

const newsItem = computed<NewsItem | null>(() => store.getById(props.id) ?? null)

onMounted(async () => {
  if (!newsItem.value) await store.fetchOne(props.id)
})

/** dd/MM/yyyy HH:mm */
function formatDMYTime(input: string) {
  const d = new Date(input)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

/** นับคอมเมนต์สำหรับแท็บ Comments */
const combinedComments = computed<Comment[]>(() =>
  newsItem.value ? store.getCombinedComments(newsItem.value) : []
)
const commentsCount = computed(() => combinedComments.value.length)

/** สถานะจากคอมเมนต์ (ให้ตรงกับการ์ดรายการ) */
const statusFromComments = computed<'fake' | 'not-fake'>(() =>
  newsItem.value ? store.getStatusFromComments(newsItem.value) : 'not-fake'
)

/** กลับหน้า list */
function goBack() {
  router.push({ name: 'news-list-view' })
}
</script>

<template>
   <!-- Top bar -->
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm hover:bg-gray-50"
          @click="goBack"
        >
          ← Back
        </button>
      </div>
      
  <div v-if="newsItem" class="container mx-auto p-4">
    <article class="bg-white rounded-2xl shadow-lg p-6 md:p-8">
     

      <!-- Header -->
      <header class="flex items-start justify-between gap-4 border-b pb-4">
        <div class="min-w-0">
          <h1 class="text-3xl md:text-4xl font-bold leading-tight break-words">
            {{ newsItem.title }}
          </h1>

          <!-- ✅ ตามที่ขอ: แสดงเฉพาะ reporter • published DD/MM/YYYY HH:mm -->
          <p class="mt-2 text-sm text-gray-600">
            <span>Reporter: {{ newsItem.reporter }}</span> <br>
            <span>Published: {{ formatDMYTime(newsItem.date) }}</span>
          </p>
        </div>

        <!-- Status chip -->
        <span
          class="shrink-0 text-xs inline-flex items-center rounded-full px-3 py-1 border font-semibold tracking-wide"
          :class="statusFromComments === 'fake'
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'"
          :title="statusFromComments === 'fake' ? 'Community says: Fake' : 'Community says: Not Fake'"
        >
          {{ statusFromComments === 'fake' ? 'Fake' : 'Not Fake' }}
        </span>
      </header>

      <!-- Image (คลิกออกลิงก์) -->
      <div v-if="newsItem.imageUrl" class="mt-6">
        <a :href="newsItem.imageUrl" target="_blank" rel="noopener" class="block rounded-xl overflow-hidden ring-1 ring-gray-200">
          <img
            :src="newsItem.imageUrl"
            alt="News image"
            class="w-full h-auto object-cover"
          />
        </a>
      </div>

      <!-- Full content -->
      <section class="mt-6 rounded-2xl border bg-white p-4 md:p-5">
        <h2 class="sr-only">Full detail</h2>
        <p class="text-gray-800 leading-relaxed whitespace-pre-line">
          {{ newsItem.content }}
        </p>
      </section>

      <!-- Tabs -->
      <div class="mt-8 border-b">
        <nav class="flex gap-6 text-sm">
          <router-link
            :to="{ name: 'news-detail-comments', params: { id: newsItem.id }, hash: '#comments-section' }"
            class="py-3 border-b-2 -mb-px"
            :class="$route.name==='news-detail-comments'
              ? 'border-[#42b983] text-[#2c3e50] font-medium'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
          >
            Comments <span class="opacity-60">({{ commentsCount }})</span>
          </router-link>
          <router-link
            :to="{ name: 'news-detail-vote', params: { id: newsItem.id }, hash: '#vote-section' }"
            class="py-3 border-b-2 -mb-px"
            :class="$route.name==='news-detail-vote'
              ? 'border-[#42b983] text-[#2c3e50] font-medium'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
          >
            Vote
          </router-link>
        </nav>
      </div>

      <!-- Sub-route content -->
      <router-view class="mt-6" />
    </article>
  </div>

  <p v-else class="text-sm text-gray-500 p-4">News not found.</p>
</template>
