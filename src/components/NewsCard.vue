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

const aggVotes = computed(() => store.getAggregatedVotes(props.news))
const aggStatus = computed(() => store.getAggregatedStatus(props.news))

const statusClass = computed(() =>
  aggStatus.value === 'fake'
    ? 'bg-red-50 text-red-700 border border-red-200'
    : 'bg-green-50 text-green-700 border border-green-200'
)
</script>

<template>
  <article
    class="w-full bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
    @click="toDetail"
  >
    <!-- รูป -->
    <div v-if="news.imageUrl" class="mb-3 -mt-2 -mx-2">
      <img
        :src="news.imageUrl"
        alt=""
        loading="lazy"
        class="w-full h-40 object-cover rounded-md"
        @click.stop="toDetail"
      />
    </div>

    <div class="flex justify-between items-start gap-3 mb-2">
      <h2 class="text-xl font-bold leading-snug">{{ news.title }}</h2>
      <span :class="statusClass" class="text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
        {{ aggStatus === 'fake' ? 'Fake' : 'Not Fake' }}
      </span>
    </div>

    <p class="text-gray-700 mb-4 line-clamp-2">{{ news.summary }}</p>

    <div class="flex flex-wrap items-center justify-between text-sm text-gray-500 gap-2">
      <span>Reporter: {{ news.reporter }}</span>
      <span>{{ new Date(news.date).toLocaleString() }}</span>
    </div>

    <div class="mt-2 text-xs text-gray-600">
      votes: F {{ aggVotes.fake }} / NF {{ aggVotes['not-fake'] }}
    </div>
  </article>
</template>
