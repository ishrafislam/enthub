<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { tmdb } from '../services/tmdb';
import type { MediaItem, MovieItem, TVItem } from '../types/tmdb';
import { useRouter } from 'vue-router';
import Skeleton from '../components/Skeleton.vue';

const trending = ref<MediaItem[]>([]);
const loading = ref(true);
const router = useRouter();
const searchQuery = ref('');
// A nice fallback image for the hero if TMDB fails or just to look cool
const heroBackdrop = ref('https://image.tmdb.org/t/p/original/mC97c40xSMD062WpL3jfc1nC7c.jpg'); 

onMounted(async () => {
  try {
    const data = await tmdb.getTrending();
    trending.value = data.results;
    const firstWithBackdrop = data.results.find(item => item.media_type !== 'person' && item.backdrop_path);
    if (firstWithBackdrop && firstWithBackdrop.media_type !== 'person' && firstWithBackdrop.backdrop_path) {
        heroBackdrop.value = tmdb.getImageUrl(firstWithBackdrop.backdrop_path, 'original');
    }
  } catch (error) {
    console.error('Failed to load trending:', error);
  } finally {
    loading.value = false;
  }
});

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } });
  }
};

const getTitle = (item: MediaItem) => {
  if (item.media_type === 'person') return item.name;
  return item.media_type === 'movie' ? (item as MovieItem).title : (item as TVItem).name;
};

const getDate = (item: MediaItem) => {
  if (item.media_type === 'person') return '';
  const dateStr = item.media_type === 'movie' ? (item as MovieItem).release_date : (item as TVItem).first_air_date;
  return dateStr ? new Date(dateStr).getFullYear() : 'Unknown Year';
};

const getPoster = (item: MediaItem) => {
  if (item.media_type === 'person') return item.profile_path;
  return item.poster_path;
};
</script>

<template>
  <div class="pb-12">
    <!-- Hero / Search Section (Full Width) -->
    <div class="relative h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden mb-12">
      <!-- Dynamic Background -->
      <div class="absolute inset-0">
        <img :src="heroBackdrop" class="w-full h-full object-cover" alt="Hero Background" />
        <div class="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/60 to-transparent dark:from-black dark:via-black/70"></div>
      </div>

      <div class="relative z-10 text-center px-4 max-w-4xl mx-auto w-full">
        <h1 class="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight drop-shadow-sm">
          Explore the <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600 dark:from-teal-400 dark:to-blue-500">Universe</span> of Cinema.
        </h1>
        <p class="text-gray-700 dark:text-gray-200 text-xl md:text-2xl mb-10 font-medium drop-shadow-sm">
          Discover millions of movies, TV shows, and people. Track what you watch.
        </p>
        
        <form @submit.prevent="handleSearch" class="relative max-w-2xl mx-auto group">
          <div class="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <svg class="h-6 w-6 text-gray-400 group-focus-within:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search for movies, TV shows..." 
            class="block w-full pl-14 pr-32 py-5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-gray-200 dark:border-transparent focus:border-teal-500 focus:ring-0 shadow-2xl transition-all text-lg"
          />
          <button 
            type="submit"
            class="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white px-8 rounded-full font-bold hover:shadow-lg hover:scale-105 active:scale-95 transition duration-200"
          >
            Search
          </button>
        </form>
      </div>
    </div>

    <!-- Trending Section (Contained) -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <section>
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white border-l-4 border-teal-500 pl-4">
            Trending Today
          </h2>
        </div>
        
        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <div v-for="n in 10" :key="n" class="space-y-3">
            <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <div class="flex justify-between">
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <router-link 
            v-for="item in trending" 
            :key="item.id"
            :to="item.media_type === 'person' ? '#' : `/details/${item.media_type}/${item.id}`"
            class="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ring-1 ring-black/5 dark:ring-white/10"
          >
            <div class="aspect-[2/3] overflow-hidden relative">
              <img 
                :src="tmdb.getImageUrl(getPoster(item))" 
                :alt="getTitle(item)"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div v-if="item.media_type !== 'person'" class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <div class="absolute bottom-4 left-4 right-4 text-white">
                   <p class="font-bold text-sm line-clamp-2">{{ item.overview }}</p>
                 </div>
              </div>
            </div>
            
            <div class="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 class="font-bold text-gray-900 dark:text-white truncate text-base mb-1" :title="getTitle(item)">
                  {{ getTitle(item) }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {{ getDate(item) }}
                </p>
              </div>
              
              <div v-if="item.media_type !== 'person'" class="mt-3 flex items-center justify-between">
                 <div class="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                   <span class="text-amber-500 text-sm mr-1">★</span>
                   <span class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ item.vote_average?.toFixed(1) }}</span>
                 </div>
                 <span class="text-xs uppercase tracking-wider text-gray-400 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded">
                   {{ item.media_type }}
                 </span>
              </div>
            </div>
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>