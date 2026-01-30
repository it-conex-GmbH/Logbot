import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { public: true } },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    children: [
      { path: '', name: 'Dashboard', component: () => import('../views/Dashboard.vue') },
      { path: 'logs', name: 'Logs', component: () => import('../views/Logs.vue') },
      { path: 'agents', name: 'Agents', component: () => import('../views/Agents.vue') },
      { path: 'users', name: 'Users', component: () => import('../views/Users.vue') },
      { path: 'webhooks', name: 'Webhooks', component: () => import('../views/Webhooks.vue') },
      { path: 'settings', name: 'Settings', component: () => import('../views/Settings.vue') },
      { path: 'health', name: 'Health', component: () => import('../views/Health.vue') }
    ]
  }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.public) return next()
  if (!auth.token) return next('/login')
  if (!auth.user) {
    try { await auth.fetchUser() } catch { return next('/login') }
  }
  next()
})

export default router
