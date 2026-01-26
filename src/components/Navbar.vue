<script setup lang="ts">
import { authStore } from "../store/auth";
import { useRouter } from "vue-router";
import ThemeToggle from "./ThemeToggle.vue";
import { useTheme } from "../composables/useTheme";
import { ref } from "vue";

const router = useRouter();
const isMenuOpen = ref(false);
const { isCyberpunk } = useTheme();

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};
</script>

<template>
  <nav
    :class="[
      'sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300',
      isCyberpunk
        ? 'bg-cyber-black/90 border-cyber-chrome cyber-nav'
        : 'bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-800',
    ]"
  >
    <!-- Cyberpunk animated border -->
    <div
      v-if="isCyberpunk"
      class="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyber-cyan via-cyber-yellow to-cyber-red bg-[length:200%_100%] animate-border-flow"
    ></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <router-link
            to="/"
            class="flex-shrink-0 flex items-center gap-2 group"
          >
            <!-- Logo -->
            <div
              :class="[
                'w-8 h-8 flex items-center justify-center transform group-hover:rotate-6 transition duration-300',
                isCyberpunk
                  ? 'bg-cyber-cyan cyber-glow-cyan'
                  : 'bg-gradient-to-tr from-teal-400 to-blue-500 rounded-lg',
              ]"
              :style="
                isCyberpunk
                  ? 'clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                  : ''
              "
            >
              <span
                :class="[
                  'font-bold text-lg',
                  isCyberpunk ? 'text-cyber-black font-display' : 'text-white',
                ]"
                >E</span
              >
            </div>
            <!-- Brand Name -->
            <span
              :class="[
                'text-2xl font-bold',
                isCyberpunk
                  ? 'text-cyber-cyan font-display tracking-wider cyber-text-glow-cyan'
                  : 'bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-600 dark:from-teal-400 dark:to-blue-500',
              ]"
            >
              <template v-if="isCyberpunk">
                <span class="text-cyber-yellow">&lt;</span>ENT<span
                  class="text-cyber-yellow"
                  >/</span
                >HUB<span class="text-cyber-yellow">&gt;</span>
              </template>
              <template v-else>EntHub</template>
            </span>
          </router-link>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center gap-6">
          <router-link
            to="/"
            :class="[
              'font-medium transition',
              isCyberpunk
                ? 'text-cyber-gray hover:text-cyber-cyan font-display tracking-wide uppercase text-sm cyber-nav-link'
                : 'text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400',
            ]"
          >
            Discover
          </router-link>

          <div
            v-if="authStore.isAuthenticated()"
            class="flex items-center gap-6"
          >
            <router-link
              to="/watchlist"
              :class="[
                'font-medium transition',
                isCyberpunk
                  ? 'text-cyber-gray hover:text-cyber-cyan font-display tracking-wide uppercase text-sm cyber-nav-link'
                  : 'text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400',
              ]"
            >
              Watchlist
            </router-link>
            <router-link
              to="/watched"
              :class="[
                'font-medium transition',
                isCyberpunk
                  ? 'text-cyber-gray hover:text-cyber-cyan font-display tracking-wide uppercase text-sm cyber-nav-link'
                  : 'text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400',
              ]"
            >
              Watched
            </router-link>

            <div
              :class="[
                'h-4 w-px',
                isCyberpunk ? 'bg-cyber-chrome' : 'bg-gray-300 dark:bg-gray-700',
              ]"
            ></div>

            <ThemeToggle />

            <button
              :class="[
                'text-sm font-medium transition',
                isCyberpunk
                  ? 'text-cyber-red hover:text-cyber-red font-display tracking-wide uppercase hover:cyber-text-glow-red'
                  : 'text-red-500 hover:text-red-600',
              ]"
              @click="handleLogout"
            >
              Logout
            </button>
          </div>

          <div v-else class="flex items-center gap-4">
            <ThemeToggle />
            <router-link
              to="/login"
              :class="[
                'px-5 py-2 text-sm font-bold transition',
                isCyberpunk
                  ? 'bg-transparent border border-cyber-cyan text-cyber-cyan font-display tracking-wider uppercase hover:bg-cyber-cyan hover:text-cyber-black hover:shadow-neon-cyan'
                  : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full hover:opacity-90 shadow-lg shadow-teal-500/20',
              ]"
              :style="
                isCyberpunk
                  ? 'clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                  : ''
              "
            >
              Login
            </router-link>
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <div class="flex items-center md:hidden gap-4">
          <ThemeToggle />
          <button
            :class="[
              isCyberpunk
                ? 'text-cyber-cyan hover:text-cyber-yellow'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
            ]"
            @click="isMenuOpen = !isMenuOpen"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div
      v-if="isMenuOpen"
      :class="[
        'md:hidden border-t',
        isCyberpunk
          ? 'bg-cyber-black border-cyber-chrome'
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800',
      ]"
    >
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <router-link
          to="/"
          :class="[
            'block px-3 py-2 rounded-md text-base font-medium',
            isCyberpunk
              ? 'text-cyber-gray hover:text-cyber-cyan hover:bg-cyber-night font-display tracking-wide'
              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
          >Discover</router-link
        >
        <div v-if="authStore.isAuthenticated()">
          <router-link
            to="/watchlist"
            :class="[
              'block px-3 py-2 rounded-md text-base font-medium',
              isCyberpunk
                ? 'text-cyber-gray hover:text-cyber-cyan hover:bg-cyber-night font-display tracking-wide'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
            ]"
            >Watchlist</router-link
          >
          <router-link
            to="/watched"
            :class="[
              'block px-3 py-2 rounded-md text-base font-medium',
              isCyberpunk
                ? 'text-cyber-gray hover:text-cyber-cyan hover:bg-cyber-night font-display tracking-wide'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
            ]"
            >Watched</router-link
          >
          <button
            :class="[
              'block w-full text-left px-3 py-2 rounded-md text-base font-medium',
              isCyberpunk
                ? 'text-cyber-red hover:bg-cyber-night font-display tracking-wide'
                : 'text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800',
            ]"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
        <div v-else>
          <router-link
            to="/login"
            :class="[
              'block px-3 py-2 rounded-md text-base font-medium',
              isCyberpunk
                ? 'text-cyber-cyan hover:bg-cyber-night font-display tracking-wide'
                : 'text-teal-500 hover:bg-gray-100 dark:hover:bg-gray-800',
            ]"
            >Login</router-link
          >
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Cyberpunk border flow animation */
@keyframes border-flow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

.animate-border-flow {
  animation: border-flow 3s linear infinite;
}

/* Cyberpunk nav link hover effect */
.cyber-nav-link {
  position: relative;
}

.cyber-nav-link::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #55ead4, #f3e600);
  transition: width 0.3s ease;
}

.cyber-nav-link:hover::after {
  width: 100%;
}

/* Cyberpunk nav active state */
.cyber-nav-link.router-link-active {
  color: #55ead4;
}

.cyber-nav-link.router-link-active::after {
  width: 100%;
  background: #55ead4;
}
</style>
