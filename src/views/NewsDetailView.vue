<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNewsStore } from '@/stores/newsStore'
import type { NewsItem, VoteKey } from '@/types'

const route = useRoute()
const store = useNewsStore()
const id = Number(route.params.id)

const newsItem = computed<NewsItem | null>(() => store.getById(id) ?? null)

const newVote = ref<VoteKey | null>(null)
const newCommentText = ref('')
const newCommentImage = ref('')

onMounted(async () => {
  if (!newsItem.value) await store.fetchOne(id)
})

const voteCount = computed(() => {
  const f = newsItem.value?.votes.fake ?? 0
  const nf = newsItem.value?.votes['not-fake'] ?? 0
  return { fake: f, 'not-fake': nf }
})

const cPage = ref(1)
const cPerPage = 5
const totalC = computed(() => newsItem.value?.comments.length ?? 0)
const totalCPages = computed(() => Math.max(1, Math.ceil(totalC.value / cPerPage)))
const pagedComments = computed(() => {
  const all = newsItem.value?.comments ?? []
  const start = (cPage.value - 1) * cPerPage
  return all.slice(start, start + cPerPage)
})

function submitVoteAndComment() {
  const item = newsItem.value
  if (!item) return
  if (!newVote.value || !newCommentText.value.trim()) return

  store.addVote(item.id, newVote.value)
  store.addComment(item.id, {
    user: 'Anonymous',
    comment: newCommentText.value.trim(),
    vote: newVote.value,
    imageUrl: newCommentImage.value.trim() || null,
  })

  newVote.value = null
  newCommentText.value = ''
  newCommentImage.value = ''
  cPage.value = 1
}
</script>

<template>
  <div v-if="newsItem" class="container mx-auto p-4">
    <div class="bg-white rounded-lg shadow-lg p-8">
      <div class="flex items-start justify-between gap-4 mb-2">
        <h1 class="text-3xl md:text-4xl font-bold">{{ newsItem.title }}</h1>
        <span
          class="shrink-0 text-xs inline-flex items-center rounded px-2 py-1 border"
          :class="newsItem.status === 'fake'
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-green-50 border-green-200 text-green-700'"
        >
          {{ newsItem.status === 'fake' ? 'Fake' : 'Not Fake' }}
        </span>
      </div>

      <p class="text-sm text-gray-500 mb-6">
        by {{ newsItem.reporter }} • {{ new Date(newsItem.date).toLocaleString() }}
      </p>

      <div v-if="newsItem.imageUrl" class="mb-6 rounded-lg overflow-hidden">
        <a :href="newsItem.imageUrl" target="_blank" rel="noopener">
          <img :src="newsItem.imageUrl" alt="News Image" class="w-full h-auto object-cover" />
        </a>
      </div>

      <div class="rounded border bg-white p-4 mb-8">
        <p class="text-gray-800 leading-relaxed whitespace-pre-line">{{ newsItem.content }}</p>
      </div>

      <div class="border-t pt-8">
        <h2 class="text-2xl font-bold mb-4">Community Feedback</h2>
        <div class="flex items-center gap-6 mb-6">
          <div class="flex items-center gap-2">
            <span class="text-green-600 font-bold text-lg">NOT FAKE:</span>
            <span class="text-lg">{{ voteCount['not-fake'] }} votes</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-red-600 font-bold text-lg">FAKE:</span>
            <span class="text-lg">{{ voteCount.fake }} votes</span>
          </div>
        </div>

        <div class="bg-gray-50 p-6 rounded-lg mb-8">
          <h3 class="text-xl font-bold mb-4">Add your vote and comment</h3>
          <form @submit.prevent="submitVoteAndComment">
            <div class="flex items-center gap-6 mb-4">
              <label class="flex items-center">
                <input type="radio" v-model="newVote" value="fake" class="mr-2" />
                <span class="text-red-600 font-medium">Fake</span>
              </label>
              <label class="flex items-center">
                <input type="radio" v-model="newVote" value="not-fake" class="mr-2" />
                <span class="text-green-600 font-medium">Not Fake</span>
              </label>
            </div>
            <textarea
              v-model="newCommentText"
              placeholder="Your comment (required)"
              class="w-full h-24 px-3 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#42b983]"
            />
            <input
              v-model="newCommentImage"
              type="url"
              placeholder="Optional: Evidence image URL"
              class="w-full px-3 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#42b983]"
            />
            <button
              type="submit"
              class="w-full px-4 py-2 bg-[#42b983] text-white rounded-md font-medium hover:bg-[#36a374] disabled:opacity-50"
              :disabled="!newVote || !newCommentText.trim()"
            >
              Submit
            </button>
        
          </form>
        </div>

        <div class="rounded border bg-white p-4">
          <h3 class="text-xl font-bold mb-4">Comments ({{ totalC }})</h3>

          <ul class="space-y-3">
            <li v-for="c in pagedComments" :key="c.id" class="border rounded p-3">
              <div class="text-xs text-gray-500 mb-1">
                {{ new Date(c.date).toLocaleString() }} • by {{ c.user }} • voted:
                <span :class="c.vote === 'fake' ? 'text-red-600' : 'text-green-600'">{{ c.vote.toUpperCase() }}</span>
              </div>
              <p class="text-sm text-gray-800">{{ c.comment }}</p>
              <a
                v-if="c.imageUrl"
                :href="c.imageUrl"
                target="_blank"
                rel="noopener"
                class="text-xs underline mt-1 inline-block"
              >
                Evidence
              </a>
            </li>
          </ul>

          <div class="mt-4 flex items-center justify-center gap-2">
            <button class="px-3 py-1 border rounded disabled:opacity-50" :disabled="cPage<=1" @click="cPage--">Prev</button>
            <span class="text-sm">Page {{ cPage }} / {{ totalCPages }}</span>
            <button class="px-3 py-1 border rounded disabled:opacity-50" :disabled="cPage>=totalCPages" @click="cPage++">Next</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <p v-else class="text-sm text-gray-500 p-4">News not found.</p>
</template>
