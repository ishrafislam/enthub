import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/sports' },
  {
    path: '/sports',
    name: 'sports-home',
    component: () => import('@/features/sports/views/SportsHomeView.vue'),
    meta: { title: 'Sports' },
  },
  {
    path: '/sports/match/:id',
    name: 'sports-match',
    props: true,
    component: () => import('@/features/sports/views/MatchDetailView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Not found' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} — EntHub` : 'EntHub'
})

export default router
