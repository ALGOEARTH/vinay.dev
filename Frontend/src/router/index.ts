import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { isAuthenticated } from '../admin/useAdminAuth'

const Home = () => import('../Home.vue')
const Certifications = () => import('../Certifications.vue')
const Business = () => import('../Business.vue')
const Guestbook = () => import('../Guestbook.vue')
const AdminLogin = () => import('../admin/AdminLogin.vue')
const AdminDashboard = () => import('../admin/AdminDashboard.vue')
const AdminUsers = () => import('../admin/AdminUsers.vue')
const AdminContent = () => import('../admin/AdminContent.vue')
const AdminGuestbook = () => import('../admin/AdminGuestbook.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/certifications',
    name: 'Certifications',
    component: Certifications
  },
  {
    path: '/business',
    name: 'Business',
    component: Business
  },
  {
    path: '/guestbook',
    name: 'Guestbook',
    component: Guestbook
  },
  {
    path: '/admin',
    redirect: '/admin/dashboard'
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/content',
    name: 'AdminContent',
    component: AdminContent,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/guestbook',
    name: 'AdminGuestbook',
    component: AdminGuestbook,
    meta: { requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  if (to.meta.requiresAdmin && !isAuthenticated.value) {
    return { path: '/admin/login' }
  }
  if (to.path === '/admin/login' && isAuthenticated.value) {
    return { path: '/admin/dashboard' }
  }
})

export default router 