import { createRouter, createWebHistory } from 'vue-router'
import NewsListView from '@/views/NewsListView.vue'
import NewsDetailView from '@/views/NewsDetailView.vue'
import AboutView from '@/views/AboutView.vue'

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
      path: '/about',
      name: 'about',
      component: AboutView,                 
    },
    {
      path: '/news/:id',
      name: 'news-detail-view', // 👈 ใส่ชื่อให้ตรงกับที่ navigation เรียกใช้
      component: NewsDetailView,
      props: (route) => ({ id: Number(route.params.id) }),
      children: [
        {
          path: '',
          redirect: (to) => ({
            name: 'news-detail-comments',
            params: to.params,
            query: to.query,
            hash: to.hash,
          }),
        },
        {
          path: 'comments',
          name: 'news-detail-comments',
          component: () => import('@/views/NewsCommentsTab.vue'),
          props: (r) => ({ id: Number(r.params.id) }),
        },
        {
          path: 'vote',
          name: 'news-detail-vote',
          component: () => import('@/views/NewsVoteTab.vue'),
          props: (r) => ({ id: Number(r.params.id) }),
        },
      ],
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
