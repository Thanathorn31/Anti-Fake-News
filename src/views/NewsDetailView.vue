<!-- src/views/NewsDetailView.vue -->
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useNewsStore } from '@/stores/newsStore'
import { useRouter } from 'vue-router'

const props = defineProps<{ id: number }>()
const store = useNewsStore()
const router = useRouter()

const newsItem = computed(() => store.getById(props.id) ?? null)

onMounted(async () => {
  if (!newsItem.value) await store.fetchOne(props.id)
})

function goBack() {
  router.push({ name: 'news-list-view' })
}
</script>

<template>
<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
  <button
    type="button"
    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white bg-[#AF0000] hover:bg-[#af0000d8] shadow-sm transition-colors"
    @click="goBack"
  >
    ← Back
  </button>
</div>

  <div v-if="newsItem" class="container mx-auto p-4">
    <div class="bg-white rounded-lg shadow-lg p-6 md:p-8">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <h1 class="text-3xl md:text-4xl font-bold leading-tight">
          {{ newsItem.title }}
        </h1>
        <span
          class="shrink-0 text-xs inline-flex items-center rounded px-2 py-1 border"
          :class="newsItem.status === 'fake'
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-green-50 border-green-200 text-green-700'">
          {{ newsItem.status === 'fake' ? 'Fake' : 'Not Fake' }}
        </span>
      </div>

      <p class="text-sm text-gray-500 mt-2">
        by <span class="font-medium">{{ newsItem.reporter }}</span>
         {{ new Date(newsItem.date).toLocaleString() }}
      </p>

      <!-- Image (URL + เปิดลิงก์ได้) -->
      <div v-if="newsItem.imageUrl" class="mt-6">
        <a :href="newsItem.imageUrl" target="_blank" rel="noopener" class="block rounded-lg overflow-hidden">
          <img :src="newsItem.imageUrl" alt="News image" class="w-full h-auto object-cover" />
        </a>
      </div>

      <!-- Full content -->
      <div class="mt-6 rounded border bg-white p-4">
        <p class="text-gray-800 leading-relaxed whitespace-pre-line">
          {{ newsItem.content }}
        </p>
      </div>

      <!-- Tabs -->
      <div class="mt-8 border-b">
        <nav class="flex gap-6 text-sm">
          <router-link
            :to="{ name: 'news-detail-comments', params: { id: newsItem.id }, hash: '#comments-section' }"
            class="py-3 border-b-2 -mb-px"
            :class="$route.name==='news-detail-comments'
              ? 'border-[#42b983] text-[#2c3e50] font-medium'
              : 'border-transparent text-gray-500 hover:text-gray-700'">
            Comments
          </router-link>
          <router-link
            :to="{ name: 'news-detail-vote', params: { id: newsItem.id }, hash: '#vote-section' }"
            class="py-3 border-b-2 -mb-px"
            :class="$route.name==='news-detail-vote'
              ? 'border-[#42b983] text-[#2c3e50] font-medium'
              : 'border-transparent text-gray-500 hover:text-gray-700'">
            Vote
          </router-link>
        </nav>
      </div>

      <!-- Tab content -->
      <router-view class="mt-6" />
    </div>
  </div>

  <p v-else class="text-sm text-gray-500 p-4">News not found.</p>
</template>
