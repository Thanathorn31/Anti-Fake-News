import { createRouter, createWebHistory } from 'vue-router';
import NewsListView from '@/views/NewsListView.vue';
import NewsDetailView from '@/views/NewsDetailView.vue';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'news-list-view',
      component: NewsListView,
      props: (route) => ({
        page: parseInt(route.query.page as string || '1'),
        pageSize: parseInt(route.query.pageSize as string || '2'),
        filter: route.query.filter as string || 'all'
      })
    },
    {
      path: '/news/:id',
      name: 'news-detail-view',
      component: NewsDetailView,
      props: true
    },
  
  ],
});

export default router;

// import { createRouter, createWebHistory } from 'vue-router'
// import nProgress from 'nprogress'


// const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
//   routes: [
//     {
//       path: '/',
//       name: 'event-list-view',
//       component: EventListView,
//        props: (route) => ({
//         page: parseInt(route.query.page?.toString() || '1'),
//         pageSize: parseInt(route.query.pageSize?.toString() || '2'),
//       }),
//     },
//     {
//   path: '/event/:id',
//   name: 'event-layout-view',
//   component: EventLayoutView,
//   props: true, 
//   beforeEnter: (to) => {
//         const id = parseInt(to.params.id as string)
//         const eventStore = useEventStore()
//         return EventService.getEvent(id)
//         .then((response) => {
//         eventStore.setEvent(response.data) 
//         return true 
//         }).catch(error => {
//           if (error.response && error.response.status === 404) {
//             return { name: '404-resource-view',
//                params: { resource: 'event' } 
//               }
//           } else{
//             return { name: 'network-error-view'}
//           }
//         })
//       },
//   children: [
//         {
//           path: '',
//           name: 'event-detail-view',
//           component: EventDetailView,
//           props: true,
//         },

//         {
//           path: 'register',
//           name: 'event-register-view',
//           component: EventRegisterView,
//           props: true,
//         },
//         {
//           path: 'edit',
//           name: 'event-edit-view',
//           component: EventEditView,
//           props: true,
//         },
//       ],
// },

//     {
//       path: '/about',
//       name: 'about',
//       // route level code-splitting
//       // this generates a separate chunk (About.[hash].js) for this route
//       // which is lazy-loaded when the route is visited.
//       component: AboutView
//  },
//  {
//  path: '/404/:resource',
//       name: '404-resource-view',
//       component: NotFoundView,
//       props: true,
//     },
    
//     {
//       path: '/:catchAll(.*)',
//       name: 'not-found',
//       component: NotFoundView,
//     },
    
//   {
//       path: '/network-error',
//       name: 'network-error-view',
//       component: NetworkErrorView,
//     },
      
//    {   
//     path: '/students',
//     name: 'students',
//     component: StudentListView 
//   },

//   ],
//   scrollBehavior(to, from,savedPosition) {
//     if (savedPosition) {
//       return savedPosition
//     } else {
//       return { top: 0 }
//     }
//   }
// })

// router.beforeEach(( ) => {
//   nProgress.start()
// })
// router.afterEach(() => {
//   nProgress.done()
// })

// export default router
