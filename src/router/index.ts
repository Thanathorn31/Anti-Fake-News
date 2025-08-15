import { createRouter, createWebHistory } from 'vue-router';
import NewsListView from '../views/NewsListView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'news-list-view',
      component: NewsListView,
      props: (route) => ({
        page: parseInt((route.query?.page as string) || '1'),
        pageSize: parseInt((route.query?.pageSize as string) || '4'),
        filter: (route.query?.filter as string) || 'all',
      }),
    },
    {
      path: '/news/:id',
      name: 'news-detail',
      component: () => import('../views/NewsDetailView.vue'),
      props: true,
    },
    // Add other routes here, such as a create news page
  ],
});

export default router;
