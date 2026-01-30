import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Search from "../views/Search.vue";
import Details from "../views/Details.vue";
import Collection from "../views/Collection.vue";
import Person from "../views/Person.vue";
import Season from "../views/Season.vue";
import Watchlist from "../views/Watchlist.vue";
import Watched from "../views/Watched.vue";
import { authStore } from "../store/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home,
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
    },
    {
      path: "/search",
      name: "Search",
      component: Search,
    },
    {
      path: "/details/:type/:id",
      name: "Details",
      component: Details,
    },
    {
      path: "/collection/:id",
      name: "Collection",
      component: Collection,
    },
    {
      path: "/person/:id",
      name: "Person",
      component: Person,
    },
    {
      path: "/tv/:seriesId/season/:seasonNumber",
      name: "Season",
      component: Season,
    },
    {
      path: "/watchlist",
      name: "Watchlist",
      component: Watchlist,
      meta: { requiresAuth: true },
    },
    {
      path: "/watched",
      name: "Watched",
      component: Watched,
      meta: { requiresAuth: true },
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

router.beforeEach((to, _from, next) => {
  const isAuthenticated = authStore.isAuthenticated();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (to.name === "Login" && isAuthenticated) {
    next({ name: "Home" });
  } else if (requiresAuth && !isAuthenticated) {
    next({ name: "Login" });
  } else {
    next();
  }
});

export default router;
