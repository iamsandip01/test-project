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
      meta: { requiresAuth: true } // Requires authentication to access
    },
    {
      path: '/stations',
      name: 'stations',
      component: StationListPage,
      meta: { requiresAuth: true } // Requires authentication
    },
    {
      path: '/stations/new',
      name: 'station-new',
      component: StationFormPage,
      meta: { requiresAuth: true } // Requires authentication
    },
    {
      path: '/stations/:id',
      name: 'station-detail',
      component: StationDetailPage,
      meta: { requiresAuth: true } // Requires authentication
    },
    {
      path: '/stations/:id/edit',
      name: 'station-edit',
      component: StationFormPage,
      meta: { requiresAuth: true } // Requires authentication
    },
    {
      path: '/map',
      name: 'map',
      component: MapPage
    },
    {
      path: '/:pathMatch(.*)*', // Catch-all route for 404
      name: 'not-found',
      component: NotFoundPage
    }
  ]
});

// Navigation guard to check authentication status before routing
router.beforeEach((to, from, next) => { // 'from' is now used or can be removed if truly not needed
  const authStore = useAuthStore();
  // Check if the route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isLoggedIn()) { // Use .isLoggedIn() as it's a function
    next('/login');
  } else {
    next();
  }
});

export default router;
