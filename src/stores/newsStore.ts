import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Comment, NewsItem, VoteKey } from '@/types'
import NewsService from '@/services/NewsService'

const LS_KEY = 'afn:persist:v1'

type AddedVotes = Record<number, { fake: number; 'not-fake': number }>
type AddedComments = Record<number, Comment[]>
interface PersistPayload {
  enabled: boolean
  votes: AddedVotes
  comments: AddedComments
}

export const useNewsStore = defineStore('newsStore', () => {
  // ---------- remote/base ----------
  const itemsById = ref<Record<number, NewsItem>>({})
  const list = ref<NewsItem[]>([])
  const total = ref(0)
  const loading = ref(false)

  // ---------- local/persist ----------
  const persistEnabled = ref(true)
  const addedVotes = ref<AddedVotes>({})
  const addedComments = ref<AddedComments>({})

  // hydrate (client only)
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as PersistPayload
        persistEnabled.value = Boolean(parsed.enabled)
        addedVotes.value = parsed.votes || {}
        addedComments.value = parsed.comments || {}
      }
    } catch {
      /* ignore */
    }
  }

  function persist() {
    if (typeof window === 'undefined') return
    const payload: PersistPayload = {
      enabled: persistEnabled.value,
      votes: addedVotes.value,
      comments: addedComments.value,
    }
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(payload))
    } catch {
      /* quota/full */
    }
  }

  function togglePersist(on: boolean) {
    persistEnabled.value = on
    persist()
  }

  function clearPersist() {
    addedVotes.value = {}
    addedComments.value = {}
    persist()
  }

  // ---------- getters / helpers ----------
  const getById = (id: number) => itemsById.value[id] || null

  // รวมคอมเมนต์จาก local + mock และ "กันซ้ำ" ด้วย id
  function getCombinedComments(news: NewsItem): Comment[] {
    const base = news.comments ?? []
    const extra = addedComments.value[news.id] ?? []
    const seen = new Set<number>()
    const merged: Comment[] = []
    for (const c of [...extra, ...base]) {
      if (seen.has(c.id)) continue
      seen.add(c.id)
      merged.push(c)
    }
    return merged
  }

  // (ยังเก็บไว้ใช้ได้) รวมจากฟิลด์ votes + addedVotes
  function getAggregatedVotes(news: NewsItem) {
    const extra = addedVotes.value[news.id]
    return {
      fake: (news.votes.fake || 0) + (extra?.fake || 0),
      'not-fake': (news.votes['not-fake'] || 0) + (extra?.['not-fake'] || 0),
    }
  }

  function getAggregatedStatus(news: NewsItem): 'fake' | 'not-fake' {
    const v = getAggregatedVotes(news)
    return v.fake >= v['not-fake'] ? 'fake' : 'not-fake'
  }

  // ✅ แนะนำให้ใช้ชุดนี้ใน UI: นับคะแนนจากคอมเมนต์ที่รวมแล้ว
  function getVotesFromComments(news: NewsItem) {
    const combined = getCombinedComments(news)
    const fake = combined.filter(c => c.vote === 'fake').length
    const notFake = combined.filter(c => c.vote === 'not-fake').length
    return { fake, 'not-fake': notFake }
  }

  function getStatusFromComments(news: NewsItem): 'fake' | 'not-fake' {
    const v = getVotesFromComments(news)
    return v.fake >= v['not-fake'] ? 'fake' : 'not-fake'
  }

  // ---------- actions ----------
  async function fetchList(perPage: number, page: number, filter?: 'all' | 'fake' | 'not-fake', q?: string) {
    loading.value = true
    try {
      const res = await NewsService.getNews(perPage, page, filter, q)
      const data = res.data || []
      list.value = data
      total.value = Number((res.headers as any)?.['x-total-count'] ?? data.length ?? 0)
      for (const n of data) itemsById.value[n.id] = n
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: number) {
    if (itemsById.value[id]) return itemsById.value[id]
    const res = await NewsService.getNewsById(id)
    itemsById.value[id] = res.data
    return res.data
  }

  // (ยังคงไว้ได้) เพิ่มสต็อกโหวต (UI ใหม่ไม่พึ่งค่านี้แล้ว)
  function addVote(newsId: number, vote: VoteKey) {
    const item = itemsById.value[newsId]
    if (!item) return

    if (vote === 'fake') item.votes.fake += 1
    else item.votes['not-fake'] += 1
    item.status = item.votes.fake >= item.votes['not-fake'] ? 'fake' : 'not-fake'

    const v = (addedVotes.value[newsId] ||= { fake: 0, 'not-fake': 0 })
    if (vote === 'fake') v.fake += 1
    else v['not-fake'] += 1
    if (persistEnabled.value) persist()
  }

  // ❗️แก้หลัก: เพิ่มคอมเมนต์ "เฉพาะ" ฝั่ง addedComments (ไม่แตะ item.comments)
  function addComment(newsId: number, payload: Omit<Comment, 'id' | 'date'>) {
    const item = itemsById.value[newsId]
    if (!item) return
    const c: Comment = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      date: new Date().toISOString(),
      ...payload,
    }
    ;(addedComments.value[newsId] ||= []).unshift(c)
    if (persistEnabled.value) persist()
  }

  return {
    // base
    itemsById, list, total, loading,

    // persist state
    persistEnabled, addedVotes, addedComments,

    // getters/helpers
    getById,
    getCombinedComments,
    getAggregatedVotes,
    getAggregatedStatus,
    getVotesFromComments,
    getStatusFromComments,

    // actions
    fetchList, fetchOne, addVote, addComment, togglePersist, clearPersist,
  }
})
