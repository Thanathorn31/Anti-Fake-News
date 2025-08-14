<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNewsStore } from '@/stores/newsStore'
import type { NewsItem } from '@/types'

const props = defineProps<{ news: NewsItem }>()
const router = useRouter()
const store = useNewsStore()

function toDetail() {
  router.push({ name: 'news-detail-view', params: { id: props.news.id } })
}

/**
 * IMPORTANT:
 * Even if the prop comes from the list, we re-fetch the reactive object
 * from the store by id to ensure we always use the SAME reference that
 * Detail uses (after fetchOne/upsert).
 */
const newsRef = computed<NewsItem>(() => store.getById(props.news.id) ?? props.news)

// Use the same truth as Detail: comments-based status & votes
const votes = computed(() => store.getVotesFromComments(newsRef.value))
const status = computed<'fake' | 'not-fake'>(() => store.getStatusFromComments(newsRef.value))

const statusClass = computed(() =>
  status.value === 'fake'
    ? 'bg-red-50 text-red-700 border border-red-200'
    : 'bg-green-50 text-green-700 border border-green-200'
)
</script>

<template>
  <article
    class="w-full bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
    @click="toDetail"
  >
    <!-- Image -->
    <div v-if="newsRef.imageUrl" class="mb-3 -mt-2 -mx-2">
      <img
        :src="newsRef.imageUrl"
        alt=""
        loading="lazy"
        class="w-full h-40 object-cover rounded-md"
        @click.stop="toDetail"
      />
    </div>

    <div class="flex justify-between items-start gap-3 mb-2">
      <h2 class="text-xl font-bold leading-snug">{{ newsRef.title }}</h2>
      <span :class="statusClass" class="text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
        {{ status === 'fake' ? 'Fake' : 'Not Fake' }}
      </span>
    </div>

    <p class="text-gray-700 mb-4 line-clamp-2">{{ newsRef.summary }}</p>

    <div class="flex flex-wrap items-center justify-between text-sm text-gray-500 gap-2">
      <span>Reporter: {{ newsRef.reporter }}</span>
      <span>{{ new Date(newsRef.date).toLocaleString() }}</span>
    </div>

    <div class="mt-2 text-xs text-gray-600">
      votes: F {{ votes.fake }} / NF {{ votes['not-fake'] }}
    </div>
  </article>
</template>
