<!-- src/views/NewsVoteTab.vue -->
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNewsStore } from '@/stores/newsStore'
import { useMessageStore } from '@/stores/messageStore'   // ⬅️ ใช้ toast
import type { NewsItem, VoteKey } from '@/types'

const props = defineProps<{ id: number }>()
const store = useNewsStore()
const msg = useMessageStore() // ⬅️ toast store
const router = useRouter()

const newsItem = computed<NewsItem | null>(() => store.getById(props.id) ?? null)

onMounted(async () => {
  if (!newsItem.value) await store.fetchOne(props.id)
})

/** form state */
const vote = ref<VoteKey | null>(null)
const name = ref('')
const text = ref('')
const imageUrl = ref('')

/** live tallies — computed from comments to avoid mismatch */
const tally = computed(() => {
  const arr = newsItem.value?.comments ?? []
  const f = arr.filter(c => c.vote === 'fake').length
  const nf = arr.filter(c => c.vote === 'not-fake').length
  const total = Math.max(1, f + nf)
  return {
    fake: f,
    notFake: nf,
    pctFake: Math.round((f / total) * 100),
    pctNotFake: Math.round((nf / total) * 100),
  }
})

const canSubmit = computed(() => !!vote.value && text.value.trim().length > 0)

/** Button visual states */
function voteBtnClass(kind: VoteKey) {
  const base = 'px-4 py-2 rounded-md font-medium transition focus:outline-none'
  const isSelected = vote.value === kind
  const hasOtherSelected = vote.value !== null && vote.value !== kind

  if (isSelected) {
    return kind === 'fake'
      ? `${base} bg-red-600 text-white hover:bg-red-700 ring-2 ring-red-300 shadow`
      : `${base} bg-green-600 text-white hover:bg-green-700 ring-2 ring-green-300 shadow`
  }
  if (hasOtherSelected) {
    return `${base} bg-gray-100 text-gray-400 border border-gray-200 cursor-default`
  }
  return kind === 'fake'
    ? `${base} text-red-700 border border-red-200 bg-red-50/40 hover:bg-red-50`
    : `${base} text-green-700 border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50`
}

async function submit() {
  const item = newsItem.value
  if (!item || !canSubmit.value) return

  // บันทึกคอมเมนต์ (ฝั่ง local/persist ตาม store)
  store.addComment(item.id, {
    user: name.value.trim() || 'Anonymous',
    comment: text.value.trim(),
    vote: vote.value as VoteKey,
    imageUrl: imageUrl.value.trim() || null,
  })

  // ✅ แสดง toast ก่อนเปลี่ยนหน้า
  msg.updateMessages('Your vote has been submitted!', 'success', 2500)

  // ไปหน้า Comments (toast ยังลอยอยู่แล้วค่อยหายเอง)
  await router.push({
    name: 'news-detail-comments',
    params: { id: item.id },
    hash: '#comments-section',
  })

  // reset form
  vote.value = null
  name.value = ''
  text.value = ''
  imageUrl.value = ''
}
</script>

<template>
  <section id="vote-section" v-if="newsItem" class="grid lg:grid-cols-[1fr] gap-6">
    <!-- Card: vote & comment form -->
    <div class="border rounded-xl p-5 shadow-sm bg-white">
      <header class="mb-4">
        <h3 class="text-lg font-semibold">Cast your vote</h3>
      </header>

      <!-- Vote buttons -->
      <div class="flex items-center gap-3 mb-4">
        <button
          type="button"
          :class="voteBtnClass('fake')"
          :aria-pressed="vote==='fake'"
          @click="vote='fake'"
        >
          Fake
        </button>

        <button
          type="button"
          :class="voteBtnClass('not-fake')"
          :aria-pressed="vote==='not-fake'"
          @click="vote='not-fake'"
        >
          Not Fake
        </button>
      </div>

      <p class="text-xs text-gray-500 mb-4">
        Client-side only (no POST). Your vote &amp; comment render instantly.
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
          class="w-full px-4 py-2 bg-[#5874DC] text-white rounded-md font-medium hover:bg-[#5874DC] disabled:opacity-50"
          :disabled="!canSubmit"
        >
          Submit
        </button>
      </form>

      <!-- Mini live summary (based on comments) -->
      <div class="mt-6">
        <div class="h-3 w-full bg-gray-200 rounded overflow-hidden mb-2">
          <div class="h-full bg-red-500" :style="{ width: tally.pctFake + '%' }"></div>
        </div>
        <div class="flex justify-between text-xs text-gray-600">
          <span>Fake: {{ tally.pctFake }}% ({{ tally.fake }})</span>
          <span>Not Fake: {{ tally.pctNotFake }}% ({{ tally.notFake }})</span>
        </div>
      </div>
    </div>
  </section>

  <div v-else class="text-sm text-gray-500">Loading vote panel…</div>
</template>
