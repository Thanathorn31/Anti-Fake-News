import { createRouter, createWebHistory } from 'vue-router'
import NewsListView from '@/views/NewsListView.vue'
import NewsDetailView from '@/views/NewsDetailView.vue'

type Filter = 'all' | 'fake' | 'not-fake'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'news-list-view',
      component: NewsListView,
      props: (route) => ({
        page: Math.max(1, parseInt((route.query.page as string) || '1')),
        pageSize: Math.max(1, parseInt((route.query.pageSize as string) || '10')),
        filter: ((route.query.filter as Filter) || 'all') as Filter,
        q: (route.query.q as string) || '',
      }),
    },
    {
      path: '/news/:id',
      name: 'news-detail-view',
      component: NewsDetailView,
      props: (route) => ({ id: Number(route.params.id) }),
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
