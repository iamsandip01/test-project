import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import HomePage from '../views/HomePage.vue';
import LoginPage from '../views/auth/LoginPage.vue';
import RegisterPage from '../views/auth/RegisterPage.vue';
import DashboardPage from '../views/dashboard/DashboardPage.vue';
import StationListPage from '../views/stations/StationListPage.vue';
import StationDetailPage from '../views/stations/StationDetailPage.vue';
import StationFormPage from '../views/stations/StationFormPage.vue';
import MapPage from '../views/map/MapPage.vue';
import NotFoundPage from '../views/NotFoundPage.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/stations',
      name: 'stations',
      component: StationListPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/stations/new',
      name: 'station-new',
      component: StationFormPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/stations/:id',
      name: 'station-detail',
      component: StationDetailPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/stations/:id/edit',
      name: 'station-edit',
      component: StationFormPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/map',
      name: 'map',
      component: MapPage
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundPage
    }
  ]
});

//some changes 
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});

export default router;