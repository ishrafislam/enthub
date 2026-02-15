<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { tmdb } from "../services/tmdb";
import type { TMDBCollection } from "../types/tmdb";
import { useConvexQuery } from "../composables/useConvex";
import { api } from "../../convex/_generated/api";
import { authStore } from "../store/auth";
import Skeleton from "../components/Skeleton.vue";
import MediaCard from "../components/MediaCard.vue";
import ContentRestricted from "../components/ContentRestricted.vue";
import { useTheme } from "../composables/useTheme";
import { filterAdultContent, isAdultContent } from "../utils/adultFilter";

const { isCyberpunk } = useTheme();

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

// Sort movies by release date (chronological order) and filter adult content
const sortedMovies = computed(() => {
  if (!collection.value?.parts) return [];
  return filterAdultContent([...collection.value.parts]).sort((a, b) => {
    if (!a.release_date) return 1;
    if (!b.release_date) return -1;
    return (
      new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
    );
  });
});

// Check if all movies in the collection are adult content
const isAllAdultContent = computed(() => {
  if (!collection.value?.parts) return false;
  return (
    collection.value.parts.length > 0 &&
    collection.value.parts.every((part) => isAdultContent(part))
  );
});

const getYear = (date?: string) =>
  date ? new Date(date).getFullYear() : "TBA";

const fetchCollection = async () => {
  const id = Number(route.params.id);
  loading.value = true;

  try {
    collection.value = await tmdb.getCollection(id);
    if (collection.value?.name) {
      document.title = `${collection.value.name} - EntHub`;
    }
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
  <!-- Restricted Content (all movies are adult) -->
  <ContentRestricted
    v-if="!loading && collection && isAllAdultContent"
    title="Collection Not Available"
    message="All movies in this collection are restricted and cannot be displayed."
  />

  <div v-else-if="loading" class="animate-in fade-in duration-500">
    <!-- Hero Skeleton -->
    <div
      class="h-[400px] lg:h-[500px] bg-gray-100 dark:bg-gray-900/50 relative"
    >
      <div
        class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 h-full flex items-end pb-12 gap-8"
      >
        <Skeleton
          class-name="hidden md:block w-48 h-72 rounded-2xl transform translate-y-20 z-30"
        />
        <div class="flex-1 space-y-4 pb-8">
          <Skeleton class-name="h-10 w-2/3" />
          <Skeleton class-name="h-6 w-1/2" />
          <Skeleton class-name="h-20 w-full" />
        </div>
      </div>
    </div>
    <!-- Grid Skeleton -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
      <Skeleton class-name="h-8 w-48 mb-8" />
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        <Skeleton
          v-for="i in 5"
          :key="i"
          class-name="aspect-[2/3] rounded-2xl"
        />
      </div>
    </div>
  </div>

  <div
    v-else-if="collection && !isAllAdultContent"
    class="pb-20 overflow-x-hidden"
  >
    <!-- Hero Section -->
    <div class="relative h-[400px] lg:h-[500px] w-full">
      <div class="absolute inset-0">
        <img
          v-if="collection.backdrop_path"
          :src="tmdb.getImageUrl(collection.backdrop_path, 'w1280')"
          :srcset="tmdb.getBackdropSrcset(collection.backdrop_path)"
          :sizes="tmdb.backdropSizes"
          alt=""
          class="w-full h-full object-cover"
        />
        <div
          v-else
          :class="[
            'w-full h-full',
            isCyberpunk
              ? 'bg-gradient-to-br from-cyber-black to-cyber-night'
              : 'bg-gradient-to-br from-gray-800 to-gray-900',
          ]"
        ></div>
        <div
          :class="[
            'absolute inset-0',
            isCyberpunk
              ? 'bg-gradient-to-t from-cyber-black via-cyber-black/70 to-cyber-black/30'
              : 'bg-gradient-to-t from-gray-50 via-gray-50/60 to-transparent dark:from-gray-950 dark:via-gray-950/70 dark:to-transparent',
          ]"
        ></div>
        <div
          :class="[
            'absolute inset-0',
            isCyberpunk
              ? 'bg-gradient-to-r from-cyber-black/90 via-transparent to-transparent'
              : 'bg-gradient-to-r from-gray-50/90 via-transparent to-transparent dark:from-gray-950/90 dark:via-transparent dark:to-transparent',
          ]"
        ></div>
        <!-- Cyberpunk scan lines -->
        <div
          v-if="isCyberpunk"
          class="absolute inset-0 pointer-events-none"
          style="
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(85, 234, 212, 0.03) 2px,
              rgba(85, 234, 212, 0.03) 4px
            );
          "
        ></div>
      </div>

      <div class="absolute inset-0 flex flex-col justify-end">
        <div
          class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8 md:pb-12 flex flex-col md:flex-row gap-6 md:gap-8 items-end"
        >
          <!-- Collection Poster -->
          <div
            :class="[
              'hidden md:block w-40 lg:w-48 flex-shrink-0 shadow-2xl overflow-hidden transform translate-y-16 lg:translate-y-20 z-30',
              isCyberpunk
                ? 'rounded-none border border-cyber-cyan/30'
                : 'rounded-2xl ring-1 ring-white/20',
            ]"
          >
            <img
              :src="tmdb.getImageUrl(collection.poster_path, 'w500')"
              :srcset="tmdb.getPosterSrcset(collection.poster_path)"
              sizes="(max-width: 1024px) 160px, 192px"
              :alt="collection.name"
              class="w-full h-auto block"
            />
          </div>

          <div
            :class="[
              'flex-1 z-10 w-full',
              isCyberpunk ? 'text-white' : 'text-gray-900 dark:text-white',
            ]"
          >
            <div
              :class="[
                'inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold mb-4',
                isCyberpunk
                  ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30 font-cyber-mono'
                  : 'bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-full',
              ]"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h-2v-2h2zm-2-2H7v4h6v-4zm2 0h2v4h-2v-4zm0-4h2v2h-2V7zm-8-2v2H5V5h2zm-2 4h2v2H5V9zm0 4h2v2H5v-2z"
                />
              </svg>
              Collection
            </div>

            <h1
              :class="[
                'text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight',
                isCyberpunk
                  ? 'font-display uppercase tracking-wide'
                  : 'drop-shadow-sm',
              ]"
            >
              {{ collection.name }}
            </h1>

            <p
              v-if="collection.overview"
              :class="[
                'text-base md:text-lg leading-relaxed max-w-3xl line-clamp-3 md:line-clamp-none',
                isCyberpunk
                  ? 'text-cyber-gray font-display'
                  : 'text-gray-600 dark:text-gray-300',
              ]"
            >
              {{ collection.overview }}
            </p>

            <div
              :class="[
                'mt-4 flex items-center gap-4 text-sm',
                isCyberpunk
                  ? 'text-cyber-muted'
                  : 'text-gray-500 dark:text-gray-400',
              ]"
            >
              <span
                :class="[
                  'font-semibold',
                  isCyberpunk ? 'text-cyber-yellow font-data' : '',
                ]"
                >{{ collection.parts.length }} movies</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Movies Grid -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 lg:mt-32">
      <h2
        :class="[
          'text-2xl md:text-3xl font-bold mb-8 pb-4 border-b',
          isCyberpunk
            ? 'text-white font-display uppercase tracking-wider border-cyber-chrome flex items-center gap-3'
            : 'text-gray-900 dark:text-white border-gray-200 dark:border-gray-800',
        ]"
      >
        <span v-if="isCyberpunk" class="text-cyber-cyan">&gt;</span>
        Movies in this Collection
      </h2>

      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        <MediaCard
          v-for="movie in sortedMovies"
          :id="movie.id"
          :key="movie.id"
          :title="movie.title"
          :poster-path="movie.poster_path"
          :to="`/details/movie/${movie.id}`"
          :year="getYear(movie.release_date)"
          :rating="movie.vote_average"
          :overview="movie.overview || 'No overview available.'"
          :status-badge="
            isWatched(movie.id)
              ? 'watched'
              : isInWatchlist(movie.id)
                ? 'watchlist'
                : null
          "
        />
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
