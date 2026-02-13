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
      meta: { title: "Home" },
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
      meta: { title: "Login" },
    },
    {
      path: "/search",
      name: "Search",
      component: Search,
      meta: { title: "Search" },
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
      meta: { title: "Watchlist", requiresAuth: true },
    },
    {
      path: "/watched",
      name: "Watched",
      component: Watched,
      meta: { title: "Watched", requiresAuth: true },
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

const DEFAULT_TITLE = "EntHub";

router.afterEach((to) => {
  const title = to.meta.title as string | undefined;
  document.title = title ? `${title} - ${DEFAULT_TITLE}` : DEFAULT_TITLE;
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
