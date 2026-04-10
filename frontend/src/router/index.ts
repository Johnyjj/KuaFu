import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/LoginView.vue'),
      meta: { layout: 'auth', public: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      children: [
        { path: '', redirect: '/dashboard' },
        {
          path: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'projects/:id/board',
          component: () => import('@/views/ProjectBoardView.vue'),
        },
        {
          path: 'projects/:id/stats',
          component: () => import('@/views/ProjectStatsView.vue'),
          meta: { adminOnly: true },
        },
        {
          path: 'projects/:id/members',
          component: () => import('@/views/ProjectMembersView.vue'),
          meta: { adminOnly: true },
        },
        {
          path: 'admin/users',
          component: () => import('@/views/AdminUsersView.vue'),
          meta: { adminOnly: true },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (to.meta.public) return true

  if (!auth.isLoggedIn) return '/login'

  if (!auth.user) {
    try { await auth.fetchMe() } catch { return '/login' }
  }

  if (to.meta.adminOnly && !auth.isAdmin) return '/dashboard'

  return true
})

export default router
