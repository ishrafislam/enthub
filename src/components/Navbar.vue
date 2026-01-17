<script setup lang="ts">
import { authStore } from '../store/auth';
import { useRouter } from 'vue-router';
import ThemeToggle from './ThemeToggle.vue';
import { ref } from 'vue';

const router = useRouter();
const isMenuOpen = ref(false);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <router-link to="/" class="flex-shrink-0 flex items-center gap-2 group">
            <div class="w-8 h-8 bg-gradient-to-tr from-teal-400 to-blue-500 rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition duration-300">
               <span class="text-white font-bold text-lg">E</span>
            </div>
            <span class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-600 dark:from-teal-400 dark:to-blue-500">
              EntHub
            </span>
          </router-link>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center gap-6">
          <router-link to="/" class="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 font-medium transition">
            Discover
          </router-link>
          
          <div v-if="authStore.isAuthenticated()" class="flex items-center gap-6">
            <router-link to="/watchlist" class="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 font-medium transition">
              Watchlist
            </router-link>
            <router-link to="/watched" class="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 font-medium transition">
              Watched
            </router-link>
            
            <div class="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>

            <ThemeToggle />

            <button 
              @click="handleLogout"
              class="text-sm font-medium text-red-500 hover:text-red-600 transition"
            >
              Logout
            </button>
          </div>
          
          <div v-else class="flex items-center gap-4">
            <ThemeToggle />
            <router-link 
              to="/login"
              class="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 transition shadow-lg shadow-teal-500/20"
            >
              Login
            </router-link>
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <div class="flex items-center md:hidden gap-4">
          <ThemeToggle />
          <button @click="isMenuOpen = !isMenuOpen" class="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isMenuOpen" class="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <router-link to="/" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Discover</router-link>
        <div v-if="authStore.isAuthenticated()">
           <router-link to="/watchlist" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Watchlist</router-link>
           <router-link to="/watched" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Watched</router-link>
           <button @click="handleLogout" class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800">Logout</button>
        </div>
        <div v-else>
           <router-link to="/login" class="block px-3 py-2 rounded-md text-base font-medium text-teal-500 hover:bg-gray-100 dark:hover:bg-gray-800">Login</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>
