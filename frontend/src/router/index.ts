import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const HomeView = () => import('@/views/HomeView.vue');
const RegisterView = () => import('@/views/auth/RegisterView.vue');
const LoginView = () => import('@/views/auth/LoginView.vue');
const VerifyEmailView = () => import('@/views/auth/VerifyEmailView.vue');

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'ChhatStore - Home', guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { title: 'ChhatStore - Home', guestOnly: true },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: 'ChhatStore - Home', guestOnly: true },
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: VerifyEmailView,
    meta: { title: 'ChhatStore - Home', guestOnly: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0, behavior: 'smooth' };
  },
});

export default router;
