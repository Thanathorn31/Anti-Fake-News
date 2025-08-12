import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Comment, NewsItem, VoteKey } from '@/types'
import NewsService from '@/services/NewsService'

export const useNewsStore = defineStore('newsStore', () => {
  // state
  const itemsById = ref<Record<number, NewsItem>>({})
  const list = ref<NewsItem[]>([])
  const total = ref(0)
  const loading = ref(false)

  // getters
  const getById = (id: number) => itemsById.value[id] || null

  // actions
  async function fetchList(perPage: number, page: number, filter?: 'all'|'fake'|'not-fake', q?: string) {
    loading.value = true
    try {
      const res = await NewsService.getNews(perPage, page, filter, q)
      const data = res.data || []
      list.value = data
      total.value = Number(res.headers?.['x-total-count'] ?? data.length ?? 0)
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

  function addVote(newsId: number, vote: VoteKey) {
    const item = itemsById.value[newsId]
    if (!item) return
    if (vote === 'fake') item.votes.fake += 1
    else item.votes['not-fake'] += 1
    item.status = item.votes.fake >= item.votes['not-fake'] ? 'fake' : 'not-fake'
  }

  function addComment(newsId: number, payload: Omit<Comment, 'id'|'date'>) {
    const item = itemsById.value[newsId]
    if (!item) return
    const c: Comment = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...payload,
    }
    item.comments ??= []
    item.comments.unshift(c)
  }

  return { itemsById, list, total, loading, getById, fetchList, fetchOne, addVote, addComment }
})
