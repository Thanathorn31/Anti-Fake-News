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

/** 🔔 Toast types (reusable across app if imported from this store) */
export type ToastType = 'success' | 'error' | 'info'
export interface ToastItem {
  id: number
  type: ToastType
  message: string
  timeout: number
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

  // ---------- toast (global) ----------
  const toasts = ref<ToastItem[]>([])

  function removeToast(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }
  function pushToast(message: string, type: ToastType = 'info', timeout = 2500): number {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    const item: ToastItem = { id, type, message, timeout }
    toasts.value.push(item)
    if (timeout > 0 && typeof window !== 'undefined') {
      window.setTimeout(() => removeToast(id), timeout)
    }
    return id
  }
  function toastSuccess(message: string, timeout?: number) {
    return pushToast(message, 'success', timeout ?? 2500)
  }
  function toastError(message: string, timeout?: number) {
    return pushToast(message, 'error', timeout ?? 3000)
  }
  function toastInfo(message: string, timeout?: number) {
    return pushToast(message, 'info', timeout ?? 2500)
  }

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
      // ignore broken storage
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
      // quota/full
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

  // ---------- helpers: keep ONE shared reference ----------
  function upsertIntoStore(raw: NewsItem): NewsItem {
    const existing = itemsById.value[raw.id]
    if (existing) {
      Object.assign(existing, raw) // mutate to keep shared reference
      return existing
    } else {
      itemsById.value[raw.id] = raw
      return raw
    }
  }

  // ---------- getters ----------
  const getById = (id: number) => itemsById.value[id] || null

  /** Base + locally added comments (newest first) */
  function getCombinedComments(news: NewsItem): Comment[] {
    const extra = addedComments.value[news.id] || []
    return [...extra, ...(news.comments ?? [])]
  }

  /** Legacy aggregate (votes + addedVotes) — kept for compatibility */
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

  /** ✅ Truth from comments */
  function getVotesFromComments(news: NewsItem) {
    const arr = getCombinedComments(news)
    const fake = arr.filter(c => c.vote === 'fake').length
    const notFake = arr.filter(c => c.vote === 'not-fake').length
    return { fake, 'not-fake': notFake }
  }
  function getStatusFromComments(news: NewsItem): 'fake' | 'not-fake' {
    const v = getVotesFromComments(news)
    return v.fake > v['not-fake'] ? 'fake' : 'not-fake'
  }
  function getDisplayStatus(news: NewsItem): 'fake' | 'not-fake' {
    return getStatusFromComments(news)
  }

  // ---------- utils ----------
  function getHeaderTotal(headers: unknown, fallback: number): number {
    if (headers && typeof headers === 'object' && 'x-total-count' in (headers as Record<string, unknown>)) {
      const raw = (headers as Record<string, unknown>)['x-total-count']
      if (typeof raw === 'string') {
        const n = parseInt(raw, 10)
        if (Number.isFinite(n)) return n
      } else if (typeof raw === 'number') {
        return raw
      }
    }
    return fallback
  }

  // ---------- actions ----------
  async function fetchList(perPage: number, page: number, filter?: 'all' | 'fake' | 'not-fake', q?: string) {
    loading.value = true
    try {
      const res = await NewsService.getNews(perPage, page, filter, q)
      const data: NewsItem[] = res.data || []

      // Keep ONE shared object per id for list + detail
      list.value = data.map(raw => upsertIntoStore(raw))

      // ✅ type-safe: no any
      total.value = getHeaderTotal(res.headers, data.length)
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: number) {
    if (itemsById.value[id]) return itemsById.value[id]
    const res = await NewsService.getNewsById(id)
    const shared = upsertIntoStore(res.data)
    const idx = list.value.findIndex(n => n.id === id)
    if (idx !== -1) list.value[idx] = shared
    return shared
  }

  /** Optional cache bump; UI should read from comments anyway */
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

  /**
   * Add a comment (and vote) for a news item.
   * Returns the new comment id so caller can scroll/highlight.
   */
  function addComment(newsId: number, payload: Omit<Comment, 'id' | 'date'>): number {
    const item = itemsById.value[newsId]
    if (!item) return -1
    const c: Comment = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      date: new Date().toISOString(),
      ...payload,
    }
    item.comments ??= []
    item.comments.unshift(c)
    ;(addedComments.value[newsId] ||= []).unshift(c)

    // keep legacy votes roughly in sync
    if (c.vote === 'fake') item.votes.fake += 1
    else item.votes['not-fake'] += 1
    item.status = item.votes.fake >= item.votes['not-fake'] ? 'fake' : 'not-fake'

    if (persistEnabled.value) persist()
    return c.id
  }

  return {
    // base
    itemsById,
    list,
    total,
    loading,

    // persist state
    persistEnabled,
    addedVotes,
    addedComments,

    // getters/helpers
    getById,
    getCombinedComments,
    getAggregatedVotes,
    getAggregatedStatus,
    getVotesFromComments,
    getStatusFromComments,
    getDisplayStatus,

    // actions
    fetchList,
    fetchOne,
    addVote,
    addComment,
    togglePersist,
    clearPersist,

    // 🔔 toast api (global)
    toasts,
    toastSuccess,
    toastError,
    toastInfo,
    removeToast,
  }
})
