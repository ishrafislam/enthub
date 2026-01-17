import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Search from '../views/Search.vue';
import Details from '../views/Details.vue';
import { authStore } from '../store/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/search',
      name: 'Search',
      component: Search
    },
    {
      path: '/details/:type/:id',
      name: 'Details',
      component: Details
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.name === 'Login' && authStore.isAuthenticated()) {
    next({ name: 'Home' });
  } else {
    next();
  }
});

export default router;