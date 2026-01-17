<script setup lang="ts">
import { computed } from 'vue';
import { useConvexQuery } from '../composables/useConvex';
import { api } from '../../convex/_generated/api';
import { authStore } from '../store/auth';
import { tmdb } from '../services/tmdb';

const { data: watched, loading } = useConvexQuery(
  api.lists.getWatched,
  computed(() => ({ userId: authStore.userId }))
);
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Watched History</h1>
      <span v-if="watched" class="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-bold">
        {{ watched.length }} items
      </span>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
    </div>

    <div v-else-if="!watched || watched.length === 0" class="text-center py-20">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
        <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">You haven't marked anything as watched</h2>
      <p class="text-gray-500 dark:text-gray-400">Keep track of the movies and shows you've seen.</p>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      <router-link 
        v-for="item in watched" 
        :key="item._id"
        :to="`/details/${item.mediaType}/${item.tmdbId}`"
        class="group relative flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden"
      >
        <div class="aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-gray-700">
           <img 
            v-if="item.posterPath"
            :src="tmdb.getImageUrl(item.posterPath)" 
            class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400 font-bold">
            No Image
          </div>
        </div>
        <div class="p-4 flex-1">
          <h3 class="font-bold text-gray-900 dark:text-white truncate text-sm mb-1">{{ item.title }}</h3>
          <div class="flex justify-between items-center">
            <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">{{ item.mediaType }}</p>
            <span class="text-[10px] text-teal-500 font-bold">WATCHED</span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>
