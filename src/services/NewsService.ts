import axios, {
  type AxiosResponse,
  type RawAxiosResponseHeaders,
  type AxiosRequestConfig,
} from 'axios'
import type { NewsItem } from '@/types'

const apiClient = axios.create({
  baseURL: 'https://my-json-server.typicode.com/Thanathorn31/anti-fake-news',
  withCredentials: false,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

type Filter = 'all' | 'fake' | 'not-fake'

// เปิดไว้ช่วง dev ให้ใช้ local ก่อน (กัน remote ล่ม/ชนลิมิต)
const LOCAL_FIRST = true

function makeAxiosResponse<T>(
  data: T,
  headers: RawAxiosResponseHeaders,
  url: string
): AxiosResponse<T> {
  const config: AxiosRequestConfig = { url, method: 'get' }
  return { data, status: 200, statusText: 'OK', headers, config } as AxiosResponse<T>
}

async function fetchLocalDB(): Promise<{ news: NewsItem[] }> {
  const url = `${import.meta.env.BASE_URL}db.json`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to load ${url}`)
  return res.json()
}

function applyClientQuery(
  list: NewsItem[],
  { perPage, page, filter, q }: { perPage: number; page: number; filter?: Filter; q?: string }
) {
  perPage = Math.max(1, Number(perPage) || 10)
  page = Math.max(1, Number(page) || 1)

  let arr = list.slice().sort((a, b) => +new Date(b.date) - +new Date(a.date))
  if (filter && filter !== 'all') arr = arr.filter(n => n.status === filter)

  if (q && q.trim()) {
    const term = q.trim().toLowerCase()
    arr = arr.filter(
      n =>
        n.title.toLowerCase().includes(term) ||
        n.summary.toLowerCase().includes(term) ||
        n.content.toLowerCase().includes(term)
    )
  }

  const total = arr.length
  const start = (page - 1) * perPage
  const data = arr.slice(start, start + perPage)
  return { data, total }
}

export default {
  async getNews(
    perPage: number,
    page: number,
    filter?: Filter,
    q?: string
  ): Promise<AxiosResponse<NewsItem[]>> {
    if (LOCAL_FIRST) {
      const db = await fetchLocalDB()
      const { data, total } = applyClientQuery(db.news, { perPage, page, filter, q })
      return makeAxiosResponse<NewsItem[]>(data, { 'x-total-count': String(total) }, `${import.meta.env.BASE_URL}db.json`)
    }

    const params: Record<string, unknown> = { _limit: perPage, _page: page }
    if (filter && filter !== 'all') params.status = filter
    if (q && q.trim()) params.q = q.trim()

    const res = await apiClient.get<NewsItem[]>('/news', { params })
    if (!Array.isArray(res.data) || res.data.length === 0) {
      const db = await fetchLocalDB()
      const { data, total } = applyClientQuery(db.news, { perPage, page, filter, q })
      return makeAxiosResponse<NewsItem[]>(data, { 'x-total-count': String(total) }, `${import.meta.env.BASE_URL}db.json`)
    }
    return res
  },

  async getNewsById(id: number): Promise<AxiosResponse<NewsItem>> {
    if (LOCAL_FIRST) {
      const db = await fetchLocalDB()
      const item = db.news.find(n => n.id === id)
      if (!item) throw new Error('News not found (local)')
      return makeAxiosResponse<NewsItem>(item, {}, `${import.meta.env.BASE_URL}db.json`)
    }

    try {
      const res = await apiClient.get<NewsItem>(`/news/${id}`)
      if (!res?.data) throw new Error('Empty remote item')
      return res
    } catch {
      const db = await fetchLocalDB()
      const item = db.news.find(n => n.id === id)
      if (!item) throw new Error('News not found (local)')
      return makeAxiosResponse<NewsItem>(item, {}, `${import.meta.env.BASE_URL}db.json`)
    }
  },
}
