<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { tmdb } from "../services/tmdb";
import type {
  MediaItem,
  MovieItem,
  TVItem,
  PersonItem,
  CollectionSearchItem,
  SearchType,
} from "../types/tmdb";
import Skeleton from "../components/Skeleton.vue";
import SearchBar from "../components/SearchBar.vue";

const route = useRoute();
const router = useRouter();

// Search form state
const searchQuery = ref("");
const searchType = ref<SearchType>("multi");

const searchOptions = [
  { value: "multi", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV Shows" },
  { value: "person", label: "People" },
  { value: "collection", label: "Collections" },
] as const;

// Results state
const results = ref<(MediaItem | CollectionSearchItem)[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const error = ref("");
const page = ref(1);
const totalPages = ref(1);

const currentSearchLabel = computed(() => {
  const option = searchOptions.find((o) => o.value === searchType.value);
  return option?.label || "All";
});

const search = async (newSearch = true) => {
  const q = searchQuery.value.trim();
  if (!q) {
    error.value = "";
    results.value = [];
    loading.value = false;
    return;
  }

  if (newSearch) {
    loading.value = true;
    page.value = 1;
    results.value = [];
  }
  error.value = "";

  try {
    let data;
    switch (searchType.value) {
      case "movie":
        data = await tmdb.searchMovies(q, page.value);
        // Add media_type to movie results for consistent handling
        data.results = data.results.map((item) => ({
          ...item,
          media_type: "movie" as const,
        }));
        break;
      case "tv":
        data = await tmdb.searchTV(q, page.value);
        // Add media_type to TV results for consistent handling
        data.results = data.results.map((item) => ({
          ...item,
          media_type: "tv" as const,
        }));
        break;
      case "person":
        data = await tmdb.searchPeople(q, page.value);
        // Add media_type to person results for consistent handling
        data.results = data.results.map((item) => ({
          ...item,
          media_type: "person" as const,
        }));
        break;
      case "collection":
        data = await tmdb.searchCollections(q, page.value);
        break;
      default:
        data = await tmdb.search(q, "multi", page.value);
    }

    if (newSearch) {
      results.value = data.results;
    } else {
      results.value = [...results.value, ...data.results];
    }
    totalPages.value = data.total_pages;
  } catch (err) {
    console.error(err);
    error.value =
      err instanceof Error ? err.message : "Search failed. Please try again.";
    if (newSearch) {
      results.value = [];
    }
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = async () => {
  if (page.value >= totalPages.value || loadingMore.value) return;
  loadingMore.value = true;
  page.value++;
  await search(false);
};

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: "/search",
      query: { q: searchQuery.value, type: searchType.value },
    });
  }
};

// Initialize from route query
const initFromRoute = () => {
  searchQuery.value = (route.query.q as string) || "";
  searchType.value = (route.query.type as SearchType) || "multi";
  if (searchQuery.value) {
    search(true);
  } else {
    loading.value = false;
  }
};

onMounted(initFromRoute);

// Watch for route changes
watch(
  () => [route.query.q, route.query.type],
  () => {
    searchQuery.value = (route.query.q as string) || "";
    searchType.value = (route.query.type as SearchType) || "multi";
    if (searchQuery.value) {
      search(true);
    }
  },
);

// Helper functions for different item types
const isMediaItem = (
  item: MediaItem | CollectionSearchItem,
): item is MediaItem => {
  return "media_type" in item;
};

const isCollectionItem = (
  item: MediaItem | CollectionSearchItem,
): item is CollectionSearchItem => {
  return !("media_type" in item) && "name" in item;
};

const getTitle = (item: MediaItem | CollectionSearchItem) => {
  if (isCollectionItem(item)) return item.name;
  if (item.media_type === "person") return item.name;
  return item.media_type === "movie"
    ? (item as MovieItem).title
    : (item as TVItem).name;
};

const getDate = (item: MediaItem | CollectionSearchItem) => {
  if (isCollectionItem(item)) return "";
  if (item.media_type === "person") return "";
  const dateStr =
    item.media_type === "movie"
      ? (item as MovieItem).release_date
      : (item as TVItem).first_air_date;
  return dateStr ? new Date(dateStr).getFullYear() : "Unknown Year";
};

const getPoster = (item: MediaItem | CollectionSearchItem) => {
  if (isCollectionItem(item)) return item.poster_path;
  if (item.media_type === "person") return item.profile_path;
  return item.poster_path;
};

const getLink = (item: MediaItem | CollectionSearchItem) => {
  if (isCollectionItem(item)) return `/collection/${item.id}`;
  if (item.media_type === "person") return `/person/${item.id}`;
  return `/details/${item.media_type}/${item.id}`;
};

const getSubtitle = (item: MediaItem | CollectionSearchItem) => {
  if (isCollectionItem(item)) return "Collection";
  if (item.media_type === "person") {
    return (item as PersonItem).known_for_department || "Person";
  }
  return getDate(item);
};

const getMediaType = (item: MediaItem | CollectionSearchItem) => {
  if (isCollectionItem(item)) return "collection";
  return item.media_type;
};

const hasRating = (item: MediaItem | CollectionSearchItem) => {
  if (isCollectionItem(item)) return false;
  return item.media_type !== "person";
};

const getRating = (item: MediaItem | CollectionSearchItem) => {
  if (isCollectionItem(item) || !isMediaItem(item)) return 0;
  if (item.media_type === "person") return 0;
  return item.vote_average;
};

const getOverview = (item: MediaItem | CollectionSearchItem) => {
  if (isCollectionItem(item)) return item.overview;
  if (item.media_type === "person") return "";
  return item.overview;
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Search Form -->
    <SearchBar
      v-model="searchQuery"
      v-model:search-type="searchType"
      variant="page"
      placeholder="Search for movies, TV shows, people..."
      @submit="handleSearch"
    />

    <!-- Results Header -->
    <div
      v-if="searchQuery"
      class="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm"
    >
      <span>Showing {{ currentSearchLabel }} results for</span>
      <span class="font-semibold text-gray-900 dark:text-white"
        >"{{ searchQuery }}"</span
      >
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm flex items-center gap-2"
    >
      <svg
        class="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      {{ error }}
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
    >
      <div v-for="n in 10" :key="n" class="space-y-3">
        <Skeleton class-name="aspect-[2/3] w-full rounded-2xl" />
        <Skeleton class-name="h-4 w-3/4" />
        <div class="flex justify-between">
          <Skeleton class-name="h-3 w-1/4" />
          <Skeleton class-name="h-3 w-1/4" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="searchQuery && results.length === 0"
      class="text-center py-20"
    >
      <div
        class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4"
      >
        <svg
          class="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      <p class="text-xl text-gray-500 dark:text-gray-400">
        No {{ currentSearchLabel.toLowerCase() }} found for "{{ searchQuery }}"
      </p>
    </div>

    <!-- Initial State (no search) -->
    <div
      v-else-if="!searchQuery && !loading"
      class="text-center py-20"
    >
      <div
        class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4"
      >
        <svg
          class="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      <p class="text-xl text-gray-500 dark:text-gray-400">
        Enter a search term to find movies, TV shows, people, or collections
      </p>
    </div>

    <!-- Results Grid -->
    <div v-else-if="results.length > 0">
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        <router-link
          v-for="item in results"
          :key="'id' in item ? item.id : Math.random()"
          :to="getLink(item)"
          class="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ring-1 ring-black/5 dark:ring-white/10"
        >
          <div class="aspect-[2/3] overflow-hidden relative">
            <img
              v-if="getPoster(item)"
              :src="tmdb.getImageUrl(getPoster(item))"
              :srcset="tmdb.getPosterSrcset(getPoster(item))"
              :sizes="tmdb.posterSizes"
              :alt="getTitle(item)"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400"
            >
              No Image
            </div>
            <!-- Hover overlay with overview -->
            <div
              v-if="getOverview(item)"
              class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <div class="absolute bottom-4 left-4 right-4 text-white">
                <p class="font-bold text-sm line-clamp-2">
                  {{ getOverview(item) }}
                </p>
              </div>
            </div>
          </div>

          <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3
                class="font-bold text-gray-900 dark:text-white truncate text-base mb-1"
                :title="getTitle(item)"
              >
                {{ getTitle(item) }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {{ getSubtitle(item) }}
              </p>
            </div>

            <div
              v-if="hasRating(item)"
              class="mt-3 flex items-center justify-between"
            >
              <div
                class="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md"
              >
                <span class="text-amber-500 text-sm mr-1">★</span>
                <span class="text-xs font-bold text-gray-700 dark:text-gray-200">
                  {{ getRating(item)?.toFixed(1) }}
                </span>
              </div>
              <span
                class="text-xs uppercase tracking-wider text-gray-400 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded"
              >
                {{ getMediaType(item) }}
              </span>
            </div>
            <div v-else class="mt-3 flex items-center justify-end">
              <span
                class="text-xs uppercase tracking-wider text-gray-400 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded"
              >
                {{ getMediaType(item) }}
              </span>
            </div>
          </div>
        </router-link>
      </div>

      <!-- View More Button -->
      <div v-if="page < totalPages" class="mt-8 flex justify-center">
        <button
          :disabled="loadingMore"
          class="px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 text-white font-semibold rounded-full transition-colors duration-200 flex items-center gap-2"
          @click="loadMore"
        >
          <svg
            v-if="loadingMore"
            class="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ loadingMore ? "Loading..." : "View More Results" }}
        </button>
      </div>
    </div>
  </div>
</template>
