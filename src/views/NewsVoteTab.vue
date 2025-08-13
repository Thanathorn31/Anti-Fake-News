<!-- src/views/NewsVoteTab.vue -->
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useNewsStore } from '@/stores/newsStore'
import type { NewsItem, VoteKey } from '@/types'

const props = defineProps<{ id: number }>()
const store = useNewsStore()

const newsItem = computed<NewsItem | null>(() => store.getById(props.id) ?? null)

onMounted(async () => {
  if (!newsItem.value) await store.fetchOne(props.id)
})

/** form state */
const vote = ref<VoteKey | null>(null)
const name = ref('')
const text = ref('')
const imageUrl = ref('')

/** live tallies */
const tally = computed(() => {
  const f = newsItem.value?.votes.fake ?? 0
  const nf = newsItem.value?.votes['not-fake'] ?? 0
  const total = Math.max(1, f + nf)
  return {
    fake: f,
    notFake: nf,
    pctFake: Math.round((f / total) * 100),
    pctNotFake: Math.round((nf / total) * 100),
  }
})

const canSubmit = computed(() => !!vote.value && text.value.trim().length > 0)

function submit() {
  const item = newsItem.value
  if (!item || !canSubmit.value) return

  store.addVote(item.id, vote.value as VoteKey)
  store.addComment(item.id, {
    user: name.value.trim() || 'Anonymous',
    comment: text.value.trim(),
    vote: vote.value as VoteKey,
    imageUrl: imageUrl.value.trim() || null,
  })

  // reset
  vote.value = null
  name.value = ''
  text.value = ''
  imageUrl.value = ''
}
</script>

<template>
  <section v-if="newsItem" class="grid lg:grid-cols-[1fr] gap-6">
    <!-- Card: vote & comment form -->
    <div class="border rounded-xl p-5 shadow-sm bg-white">
      <header class="mb-4">
        <h3 class="text-lg font-semibold">Cast your vote</h3>
      </header>

      <!-- Vote buttons -->
      <div class="flex items-center gap-3 mb-4">
        <button
          type="button"
          class="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition"
          :class="{ 'opacity-80 ring-2 ring-red-300': vote==='fake' }"
          @click="vote='fake'"
        >Fake</button>

        <button
          type="button"
          class="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 transition"
          :class="{ 'opacity-80 ring-2 ring-green-300': vote==='not-fake' }"
          @click="vote='not-fake'"
        >Not Fake</button>
      </div>

      <p class="text-xs text-gray-500 mb-4">
        Client-side only (no POST). Your vote & comment render instantly.
      </p>

      <!-- Form -->
      <form @submit.prevent="submit" class="space-y-3">
        <input
          v-model="name"
          type="text"
          placeholder="Your name (optional)"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#42b983]"
        />
        <textarea
          v-model="text"
          placeholder="Write a comment (required)"
          class="w-full h-28 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#42b983]"
        />
        <input
          v-model="imageUrl"
          type="url"
          placeholder="Image URL (optional)"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#42b983]"
        />
        <button
          type="submit"
          class="w-full px-4 py-2 bg-[#42b983] text-white rounded-md font-medium hover:bg-[#36a374] disabled:opacity-50"
          :disabled="!canSubmit"
        >
          Submit
        </button>
      </form>

      <!-- Mini live summary -->
      <div class="mt-6">
        <div class="h-3 w-full bg-gray-200 rounded overflow-hidden mb-2">
          <div class="h-full bg-red-500" :style="{ width: tally.pctFake + '%' }"></div>
        </div>
        <div class="flex justify-between text-xs text-gray-600">
          <span>Fake: {{ tally.pctFake }}% ({{ tally.fake }})</span>
          <span>Not Fake: {{ tally.pctNotFake }}% ({{ tally.notFake }})</span>
        </div>

        <p class="mt-3 text-xs text-gray-500">
          See your comment in
          <router-link
            :to="{ name: 'news-detail-comments', params: { id: newsItem.id } }"
            class="underline text-[#42b983]"
          >
            Comments
          </router-link>
          (paginated).
        </p>
      </div>
    </div>
  </section>

  <div v-else class="text-sm text-gray-500">Loading vote panel…</div>
</template>
