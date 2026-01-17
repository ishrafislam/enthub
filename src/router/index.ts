import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Search from '../views/Search.vue';
import Details from '../views/Details.vue';
import Watchlist from '../views/Watchlist.vue';
import Watched from '../views/Watched.vue';
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
    },
    {
      path: '/watchlist',
      name: 'Watchlist',
      component: Watchlist
    },
    {
      path: '/watched',
      name: 'Watched',
      component: Watched
    }
  ]
});

router.beforeEach((to, from, next) => {
  const publicPages = ['Home', 'Login', 'Search', 'Details'];
  const authRequired = !publicPages.includes(to.name as string);
  const isAuthenticated = authStore.isAuthenticated();

  if (to.name === 'Login' && isAuthenticated) {
    next({ name: 'Home' });
  } else if (authRequired && !isAuthenticated) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;