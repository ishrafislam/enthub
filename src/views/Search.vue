<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { tmdb } from '../services/tmdb';
import type { MediaItem, MovieItem, TVItem } from '../types/tmdb';
import Skeleton from '../components/Skeleton.vue';

const route = useRoute();
const results = ref<MediaItem[]>([]);
const loading = ref(true);
const query = ref('');

const search = async () => {
  const q = route.query.q as string;
  if (!q) return;
  
  query.value = q;
  loading.value = true;
  
  try {
    const data = await tmdb.search(q);
    results.value = data.results;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(search);
watch(() => route.query.q, search);

const getTitle = (item: MediaItem) => {
  if (item.media_type === 'person') return item.name;
  return item.media_type === 'movie' ? (item as MovieItem).title : (item as TVItem).name;
};

const getPoster = (item: MediaItem) => {
  if (item.media_type === 'person') return item.profile_path;
  return item.poster_path;
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <h2 class="text-3xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-4">
      Search Results for <span class="text-teal-500">"{{ query }}"</span>
    </h2>

    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      <div v-for="n in 10" :key="n" class="space-y-3">
        <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>

    <div v-else-if="results.length === 0" class="text-center py-20">
       <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
       </div>
       <p class="text-xl text-gray-500 dark:text-gray-400">No results found for "{{ query }}"</p>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      <router-link
        v-for="item in results"
        :key="item.id"
        :to="item.media_type === 'person' ? `/person/${item.id}` : `/details/${item.media_type}/${item.id}`"
        class="group relative flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden"
      >
        <div class="aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-gray-700">
           <img 
            v-if="getPoster(item)"
            :src="tmdb.getImageUrl(getPoster(item))" 
            class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        </div>
        <div class="p-4 flex-1">
          <h3 class="font-bold text-gray-900 dark:text-white truncate text-sm mb-1">{{ getTitle(item) }}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">{{ item.media_type }}</p>
        </div>
      </router-link>
    </div>
  </div>
</template>
