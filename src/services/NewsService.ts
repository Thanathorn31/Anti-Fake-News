import type { NewsItem } from '@/types'

type Filter = 'all' | 'fake' | 'not-fake'

type SimpleResponse<T> = {
  data: T
  headers: Record<string, string>
}

// === แหล่งข้อมูลเดิม (MockAPI) ===
const API_BASE = 'https://689edafa3fed484cf8783578.mockapi.io/api/v1'
const NEWS_ENDPOINT = 'news' // เปลี่ยนให้ตรงกับ endpoint ของคุณได้

// ---------- Response Types (เลิกใช้ any) ----------
interface ApiPagination {
  total?: number
  totalRecords?: number
}
type ApiListResponse = NewsItem[] | { data: NewsItem[]; pagination?: ApiPagination }

// ---------- Utilities ----------
function normalizeStatus(v?: string) {
  if (!v) return v
  let s = String(v).trim().toLowerCase()
  s = s.replace(/[\s_]+/g, '-')     // 'Not Fake' / 'not_fake' -> 'not-fake'
  if (s === 'notfake') s = 'not-fake'
  return s
}
function normalizeFilter(filter?: Filter | string): Filter | 'all' | undefined {
  if (filter == null) return undefined
  const s = String(filter)
  if (s === 'all') return 'all'
  return normalizeStatus(s) as Filter
}
function clientSideFilterSearch(list: NewsItem[], filter?: Filter, q?: string) {
  const want = normalizeFilter(filter)
  let arr = list
  if (want && want !== 'all') arr = arr.filter(n => normalizeStatus(n.status) === want)
  if (q && q.trim()) {
    const term = q.trim().toLowerCase()
    arr = arr.filter(
      n =>
        n.title.toLowerCase().includes(term) ||
        n.summary.toLowerCase().includes(term) ||
        n.content.toLowerCase().includes(term)
    )
  }
  // เรียงวันที่ใหม่ก่อน (เผื่อ API ไม่การันตี)
  arr = arr.slice().sort((a, b) => +new Date(b.date) - +new Date(a.date))
  return arr
}

// ---------- ALL-IN-ONE FETCH (ครั้งเดียวพอ) ----------
let ALL_CACHE: NewsItem[] | null = null

async function fetchAllPages(limit = 100): Promise<NewsItem[]> {
  // ดึงทีละหน้าให้ครบ แล้วรวมเป็นชุดเดียวในหน่วยความจำ
  const all: NewsItem[] = []
  let page = 1
  for (;;) {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', String(limit))
    params.set('sortBy', 'date')
    params.set('order', 'desc')
    const url = `${API_BASE}/${NEWS_ENDPOINT}?${params.toString()}`

    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Failed to load ${url}`)

    const body: ApiListResponse = await res.json()
    const list: NewsItem[] = Array.isArray(body) ? body : (body.data ?? [])
    all.push(...list)

    if (list.length < limit) break // สุดหน้าแล้ว
    page += 1
  }
  return all
}

async function ensureAllCache(): Promise<NewsItem[]> {
  if (ALL_CACHE) return ALL_CACHE
  // ดึงชุดใหญ่ครั้งแรก (รวบทุกหน้า) → ครั้งต่อๆ ไปกรองจากแรมล้วนๆ เร็วปื้ด
  ALL_CACHE = await fetchAllPages(100) // ปรับ limit ได้ตามขนาดข้อมูล
  return ALL_CACHE
}

// ---------- Public API ----------
export default {
  // กรอง/ค้นหา/แบ่งหน้าในแรม → ตอบทันที
  async getNews(
    perPage: number,
    page: number,
    filter?: Filter,
    q?: string
  ): Promise<SimpleResponse<NewsItem[]>> {
    const _pp = Math.max(1, Number(perPage) || 10)
    const _page = Math.max(1, Number(page) || 1)

    const all = await ensureAllCache()
    const filtered = clientSideFilterSearch(all, filter, q)
    const total = filtered.length
    const start = (_page - 1) * _pp
    const data = filtered.slice(start, start + _pp)

    return { data, headers: { 'x-total-count': String(total) } }
  },

  // หาในแคชก่อน ถ้าไม่เจอค่อยยิงเดี่ยว (กันเคสเข้าหน้า detail ตรงๆ)
  async getNewsById(id: number): Promise<SimpleResponse<NewsItem>> {
    const all = await ensureAllCache()
    let item = all.find(n => String(n.id) === String(id))
    if (!item) {
      const url = `${API_BASE}/${NEWS_ENDPOINT}/${id}`
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error('News not found (remote)')
      item = (await res.json()) as NewsItem
      // เติมเข้าแคช (กันโหลดซ้ำ)
      ALL_CACHE = [item, ...all]
    }
    return { data: item, headers: {} }
  },

  // (ออปชัน) ให้เรียกรีเฟรชทั้งชุดเมื่อคุณกดปุ่มรีเฟรช/ตั้งเวลาเอง
  async refreshAll(): Promise<void> {
    ALL_CACHE = await fetchAllPages(100)
  },
}
