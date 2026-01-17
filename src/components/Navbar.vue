<script setup lang="ts">
import { authStore } from '../store/auth';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <nav class="bg-gray-900 text-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <router-link to="/" class="flex-shrink-0 flex items-center gap-2">
            <span class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
              EntHub
            </span>
          </router-link>
        </div>
        <div class="flex items-center gap-4">
          <router-link to="/" class="hover:text-teal-400 transition">Discover</router-link>
          
          <div v-if="authStore.isAuthenticated()" class="flex items-center gap-4">
            <router-link to="/watchlist" class="hover:text-teal-400 transition">Watchlist</router-link>
            <router-link to="/watched" class="hover:text-teal-400 transition">Watched</router-link>
            <button 
              @click="handleLogout"
              class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
          
          <div v-else>
            <router-link 
              to="/login"
              class="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-md text-sm font-medium transition"
            >
              Login
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>