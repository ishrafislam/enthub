<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { tmdb } from "../services/tmdb";
import type { TMDBCollection } from "../types/tmdb";
import { useConvexQuery } from "../composables/useConvex";
import { api } from "../../convex/_generated/api";
import { authStore } from "../store/auth";
import Skeleton from "../components/Skeleton.vue";

const route = useRoute();
const collection = ref<TMDBCollection | null>(null);
const loading = ref(true);

// Convex: get user's watchlist and watched lists to show status on each movie
const userId = computed(() => authStore.userId);

const { data: watchlist } = useConvexQuery(
  api.lists.getWatchlist,
  computed(() => (userId.value ? { userId: userId.value as any } : null)),
);

const { data: watched } = useConvexQuery(
  api.lists.getWatched,
  computed(() => (userId.value ? { userId: userId.value as any } : null)),
);

// Create lookup sets for quick status check
const watchlistIds = computed(() => {
  if (!watchlist.value) return new Set<number>();
  return new Set(watchlist.value.map((item: any) => item.tmdbId));
});

const watchedIds = computed(() => {
  if (!watched.value) return new Set<number>();
  return new Set(watched.value.map((item: any) => item.tmdbId));
});

const isInWatchlist = (tmdbId: number) => watchlistIds.value.has(tmdbId);
const isWatched = (tmdbId: number) => watchedIds.value.has(tmdbId);

// Sort movies by release date (chronological order)
const sortedMovies = computed(() => {
  if (!collection.value?.parts) return [];
  return [...collection.value.parts].sort((a, b) => {
    if (!a.release_date) return 1;
    if (!b.release_date) return -1;
    return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
  });
});

const getYear = (date?: string) =>
  date ? new Date(date).getFullYear() : "TBA";

const fetchCollection = async () => {
  const id = Number(route.params.id);
  loading.value = true;

  try {
    collection.value = await tmdb.getCollection(id);
  } catch (err) {
    console.error("Failed to fetch collection:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCollection);

// Refetch if route changes
watch(() => route.params.id, fetchCollection);
</script>

<template>
  <div v-if="loading" class="animate-in fade-in duration-500">
    <!-- Hero Skeleton -->
    <div class="h-[400px] lg:h-[500px] bg-gray-100 dark:bg-gray-900/50 relative">
      <div
        class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 h-full flex items-end pb-12 gap-8"
      >
        <Skeleton
          className="hidden md:block w-48 h-72 rounded-2xl transform translate-y-20 z-30"
        />
        <div class="flex-1 space-y-4 pb-8">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
    <!-- Grid Skeleton -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
      <Skeleton className="h-8 w-48 mb-8" />
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <Skeleton v-for="i in 5" :key="i" className="aspect-[2/3] rounded-2xl" />
      </div>
    </div>
  </div>

  <div v-else-if="collection" class="pb-20 overflow-x-hidden">
    <!-- Hero Section -->
    <div class="relative h-[400px] lg:h-[500px] w-full">
      <div class="absolute inset-0">
        <img
          v-if="collection.backdrop_path"
          :src="tmdb.getImageUrl(collection.backdrop_path, 'original')"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900"
        ></div>
        <div
          class="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/60 to-transparent dark:from-gray-950 dark:via-gray-950/70 dark:to-transparent"
        ></div>
        <div
          class="absolute inset-0 bg-gradient-to-r from-gray-50/90 via-transparent to-transparent dark:from-gray-950/90 dark:via-transparent dark:to-transparent"
        ></div>
      </div>

      <div class="absolute inset-0 flex flex-col justify-end">
        <div
          class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8 md:pb-12 flex flex-col md:flex-row gap-6 md:gap-8 items-end"
        >
          <!-- Collection Poster -->
          <div
            class="hidden md:block w-40 lg:w-48 flex-shrink-0 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/20 transform translate-y-16 lg:translate-y-20 z-30"
          >
            <img
              :src="tmdb.getImageUrl(collection.poster_path, 'original')"
              class="w-full h-auto block"
            />
          </div>

          <div class="flex-1 text-gray-900 dark:text-white z-10 w-full">
            <div
              class="inline-flex items-center gap-2 bg-teal-500/20 text-teal-600 dark:text-teal-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h-2v-2h2zm-2-2H7v4h6v-4zm2 0h2v4h-2v-4zm0-4h2v2h-2V7zm-8-2v2H5V5h2zm-2 4h2v2H5V9zm0 4h2v2H5v-2z"
                />
              </svg>
              Collection
            </div>

            <h1
              class="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 drop-shadow-sm leading-tight"
            >
              {{ collection.name }}
            </h1>

            <p
              v-if="collection.overview"
              class="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed max-w-3xl line-clamp-3 md:line-clamp-none"
            >
              {{ collection.overview }}
            </p>

            <div class="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span class="font-semibold">{{ collection.parts.length }} movies</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Movies Grid -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 lg:mt-32">
      <h2
        class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-gray-800 pb-4"
      >
        Movies in this Collection
      </h2>

      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        <router-link
          v-for="movie in sortedMovies"
          :key="movie.id"
          :to="`/details/movie/${movie.id}`"
          class="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ring-1 ring-black/5 dark:ring-white/10 hover:ring-teal-500"
        >
          <!-- Poster -->
          <div class="aspect-[2/3] overflow-hidden relative">
            <img
              :src="tmdb.getImageUrl(movie.poster_path)"
              :alt="movie.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />

            <!-- Status Badge -->
            <div
              v-if="isWatched(movie.id) || isInWatchlist(movie.id)"
              class="absolute top-2 right-2"
            >
              <div
                v-if="isWatched(movie.id)"
                class="bg-teal-500 text-white p-1.5 rounded-full shadow-lg"
                title="Watched"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div
                v-else-if="isInWatchlist(movie.id)"
                class="bg-amber-500 text-white p-1.5 rounded-full shadow-lg"
                title="In Watchlist"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fill-rule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <!-- Hover overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4"
            >
              <p class="text-white text-sm line-clamp-3">
                {{ movie.overview || "No overview available." }}
              </p>
            </div>
          </div>

          <!-- Info -->
          <div class="p-4 flex-1 flex flex-col justify-between">
            <h3
              class="font-bold text-gray-900 dark:text-white truncate text-base"
            >
              {{ movie.title }}
            </h3>
            <div class="mt-3 flex items-center justify-between">
              <div
                class="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
              >
                <span class="text-amber-500 text-sm mr-1">★</span>
                <span class="text-xs font-bold text-gray-900 dark:text-white">
                  {{ movie.vote_average?.toFixed(1) || "N/A" }}
                </span>
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {{ getYear(movie.release_date) }}
              </span>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Empty state -->
      <div
        v-if="sortedMovies.length === 0"
        class="text-center py-16 text-gray-500 dark:text-gray-400"
      >
        <p class="text-lg">No movies found in this collection.</p>
      </div>
    </div>
  </div>

  <!-- Error state -->
  <div
    v-else
    class="min-h-[50vh] flex flex-col items-center justify-center text-gray-500 dark:text-gray-400"
  >
    <svg
      class="w-16 h-16 mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
    </svg>
    <p class="text-lg">Collection not found</p>
    <router-link
      to="/"
      class="mt-4 text-teal-500 hover:text-teal-600 font-medium"
    >
      Go back home
    </router-link>
  </div>
</template>
