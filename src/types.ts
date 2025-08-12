export type VoteKey = 'fake' | 'not-fake'

export interface Comment {
  id: number
  user: string
  comment: string
  vote: VoteKey
  imageUrl: string | null
  date: string // ISO
}

export interface NewsItem {
  id: number
  title: string
  summary: string
  content: string
  status: VoteKey
  reporter: string
  date: string // ISO
  imageUrl?: string
  votes: {
    fake: number
    'not-fake': number
  }
  comments: Comment[]
}

export interface Vote {
  id: number
  newsId: number
  vote: VoteKey
  user: string
}
