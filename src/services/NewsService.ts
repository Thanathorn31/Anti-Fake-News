import type { NewsItem } from '@/types'

type Filter = 'all' | 'fake' | 'not-fake'

// รูปแบบรีสปอนส์ง่าย ๆ ให้ใช้แทน AxiosResponse ในโปรเจกต์นี้
type SimpleResponse<T> = {
  data: T
  headers: Record<string, string>
}

async function fetchLocalDB(): Promise<{ news: NewsItem[] }> {
  // public/db.json => เสิร์ฟเป็น /db.json เสมอ
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
  ): Promise<SimpleResponse<NewsItem[]>> {
    const db = await fetchLocalDB()
    const { data, total } = applyClientQuery(db.news, { perPage, page, filter, q })
    return { data, headers: { 'x-total-count': String(total) } }
  },

  async getNewsById(id: number): Promise<SimpleResponse<NewsItem>> {
    const db = await fetchLocalDB()
    const item = db.news.find(n => n.id === id)
    if (!item) throw new Error('News not found (local)')
    return { data: item, headers: {} }
  },
}
