<script setup lang="ts">
import { ref, onMounted } from "vue";
import { tmdb } from "../services/tmdb";
import type { MovieItem, TVItem, PersonItem, SearchType } from "../types/tmdb";
import { useRouter } from "vue-router";
import Skeleton from "../components/Skeleton.vue";
import SearchBar from "../components/SearchBar.vue";

const router = useRouter();
const searchQuery = ref("");
const searchType = ref<SearchType>("multi");

// Hero backdrop
const heroBackdrop = ref(
  "https://image.tmdb.org/t/p/original/mC97c40xSMD062WpL3jfc1nC7c.jpg",
);

// Trending Movies state
const trendingMovies = ref<MovieItem[]>([]);
const moviesPage = ref(1);
const moviesTotalPages = ref(1);
const moviesLoading = ref(true);
const moviesLoadingMore = ref(false);

// Trending TV state
const trendingTV = ref<TVItem[]>([]);
const tvPage = ref(1);
const tvTotalPages = ref(1);
const tvLoading = ref(true);
const tvLoadingMore = ref(false);

// Trending People state
const trendingPeople = ref<PersonItem[]>([]);
const peoplePage = ref(1);
const peopleTotalPages = ref(1);
const peopleLoading = ref(true);
const peopleLoadingMore = ref(false);

const loadTrendingMovies = async (page = 1) => {
  try {
    const data = await tmdb.getTrendingMovies("week", page);
    if (page === 1) {
      trendingMovies.value = data.results;
      // Set hero backdrop from first movie with backdrop
      const firstWithBackdrop = data.results.find((item) => item.backdrop_path);
      if (firstWithBackdrop?.backdrop_path) {
        heroBackdrop.value = tmdb.getImageUrl(
          firstWithBackdrop.backdrop_path,
          "original",
        );
      }
    } else {
      trendingMovies.value = [...trendingMovies.value, ...data.results];
    }
    moviesPage.value = data.page;
    moviesTotalPages.value = data.total_pages;
  } catch (error) {
    console.error("Failed to load trending movies:", error);
  }
};

const loadTrendingTV = async (page = 1) => {
  try {
    const data = await tmdb.getTrendingTV("week", page);
    if (page === 1) {
      trendingTV.value = data.results;
    } else {
      trendingTV.value = [...trendingTV.value, ...data.results];
    }
    tvPage.value = data.page;
    tvTotalPages.value = data.total_pages;
  } catch (error) {
    console.error("Failed to load trending TV:", error);
  }
};

const loadTrendingPeople = async (page = 1) => {
  try {
    const data = await tmdb.getTrendingPeople("week", page);
    if (page === 1) {
      trendingPeople.value = data.results;
    } else {
      trendingPeople.value = [...trendingPeople.value, ...data.results];
    }
    peoplePage.value = data.page;
    peopleTotalPages.value = data.total_pages;
  } catch (error) {
    console.error("Failed to load trending people:", error);
  }
};

const loadMoreMovies = async () => {
  if (moviesPage.value >= moviesTotalPages.value || moviesLoadingMore.value)
    return;
  moviesLoadingMore.value = true;
  await loadTrendingMovies(moviesPage.value + 1);
  moviesLoadingMore.value = false;
};

const loadMoreTV = async () => {
  if (tvPage.value >= tvTotalPages.value || tvLoadingMore.value) return;
  tvLoadingMore.value = true;
  await loadTrendingTV(tvPage.value + 1);
  tvLoadingMore.value = false;
};

const loadMorePeople = async () => {
  if (peoplePage.value >= peopleTotalPages.value || peopleLoadingMore.value)
    return;
  peopleLoadingMore.value = true;
  await loadTrendingPeople(peoplePage.value + 1);
  peopleLoadingMore.value = false;
};

onMounted(async () => {
  // Load all sections in parallel
  await Promise.all([
    loadTrendingMovies().finally(() => (moviesLoading.value = false)),
    loadTrendingTV().finally(() => (tvLoading.value = false)),
    loadTrendingPeople().finally(() => (peopleLoading.value = false)),
  ]);
});

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: "/search",
      query: { q: searchQuery.value, type: searchType.value },
    });
  }
};
</script>

<template>
  <div class="pb-12">
    <!-- Hero / Search Section (Full Width) -->
    <div
      class="relative h-[400px] md:h-[600px] flex items-center justify-center overflow-hidden mb-8 md:mb-12"
    >
      <!-- Dynamic Background -->
      <div class="absolute inset-0 bg-gray-300 dark:bg-gray-900">
        <img
          :src="heroBackdrop"
          style="opacity: 0"
          class="w-full h-full object-cover transition-opacity duration-500"
          alt=""
          @load="($event.target as HTMLImageElement).style.opacity = '1'"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/60 to-transparent dark:from-black dark:via-black/70"
        ></div>
      </div>

      <div class="relative z-10 text-center px-4 max-w-4xl mx-auto w-full">
        <h1
          class="text-3xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-4 md:mb-6 tracking-tight drop-shadow-sm"
        >
          Explore the
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600 dark:from-teal-400 dark:to-blue-500"
            >Universe</span
          >
          of Cinema.
        </h1>
        <p
          class="text-gray-700 dark:text-gray-200 text-base md:text-2xl mb-8 md:mb-10 font-medium drop-shadow-sm"
        >
          Discover millions of movies, TV shows, and people. Track what you
          watch.
        </p>

        <SearchBar
          v-model="searchQuery"
          v-model:search-type="searchType"
          variant="hero"
          placeholder="Search for movies, TV shows..."
          class="max-w-2xl mx-auto"
          @submit="handleSearch"
        />
      </div>
    </div>

    <!-- Trending Sections (Contained) -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <!-- Trending Movies Section -->
      <section>
        <div class="flex items-center justify-between mb-8">
          <h2
            class="text-3xl font-bold text-gray-900 dark:text-white border-l-4 border-teal-500 pl-4"
          >
            Trending Movies
          </h2>
        </div>

        <div
          v-if="moviesLoading"
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

        <div v-else>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          >
            <router-link
              v-for="item in trendingMovies"
              :key="item.id"
              :to="`/details/movie/${item.id}`"
              class="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ring-1 ring-black/5 dark:ring-white/10"
            >
              <div class="aspect-[2/3] overflow-hidden relative">
                <img
                  :src="tmdb.getImageUrl(item.poster_path)"
                  :srcset="tmdb.getPosterSrcset(item.poster_path)"
                  :sizes="tmdb.posterSizes"
                  :alt="item.title"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div class="absolute bottom-4 left-4 right-4 text-white">
                    <p class="font-bold text-sm line-clamp-2">
                      {{ item.overview }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    class="font-bold text-gray-900 dark:text-white truncate text-base mb-1"
                    :title="item.title"
                  >
                    {{ item.title }}
                  </h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {{
                      item.release_date
                        ? new Date(item.release_date).getFullYear()
                        : "Unknown Year"
                    }}
                  </p>
                </div>

                <div class="mt-3 flex items-center justify-between">
                  <div
                    class="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md"
                  >
                    <span class="text-amber-500 text-sm mr-1">★</span>
                    <span
                      class="text-xs font-bold text-gray-700 dark:text-gray-200"
                      >{{ item.vote_average?.toFixed(1) }}</span
                    >
                  </div>
                  <span
                    class="text-xs uppercase tracking-wider text-gray-400 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded"
                  >
                    movie
                  </span>
                </div>
              </div>
            </router-link>
          </div>

          <!-- View More Button -->
          <div
            v-if="moviesPage < moviesTotalPages"
            class="mt-8 flex justify-center"
          >
            <button
              :disabled="moviesLoadingMore"
              class="px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 text-white font-semibold rounded-full transition-colors duration-200 flex items-center gap-2"
              @click="loadMoreMovies"
            >
              <svg
                v-if="moviesLoadingMore"
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
              {{ moviesLoadingMore ? "Loading..." : "View More Movies" }}
            </button>
          </div>
        </div>
      </section>

      <!-- Trending TV Shows Section -->
      <section>
        <div class="flex items-center justify-between mb-8">
          <h2
            class="text-3xl font-bold text-gray-900 dark:text-white border-l-4 border-teal-500 pl-4"
          >
            Trending TV Shows
          </h2>
        </div>

        <div
          v-if="tvLoading"
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

        <div v-else>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          >
            <router-link
              v-for="item in trendingTV"
              :key="item.id"
              :to="`/details/tv/${item.id}`"
              class="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ring-1 ring-black/5 dark:ring-white/10"
            >
              <div class="aspect-[2/3] overflow-hidden relative">
                <img
                  :src="tmdb.getImageUrl(item.poster_path)"
                  :srcset="tmdb.getPosterSrcset(item.poster_path)"
                  :sizes="tmdb.posterSizes"
                  :alt="item.name"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div class="absolute bottom-4 left-4 right-4 text-white">
                    <p class="font-bold text-sm line-clamp-2">
                      {{ item.overview }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    class="font-bold text-gray-900 dark:text-white truncate text-base mb-1"
                    :title="item.name"
                  >
                    {{ item.name }}
                  </h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {{
                      item.first_air_date
                        ? new Date(item.first_air_date).getFullYear()
                        : "Unknown Year"
                    }}
                  </p>
                </div>

                <div class="mt-3 flex items-center justify-between">
                  <div
                    class="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md"
                  >
                    <span class="text-amber-500 text-sm mr-1">★</span>
                    <span
                      class="text-xs font-bold text-gray-700 dark:text-gray-200"
                      >{{ item.vote_average?.toFixed(1) }}</span
                    >
                  </div>
                  <span
                    class="text-xs uppercase tracking-wider text-gray-400 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded"
                  >
                    tv
                  </span>
                </div>
              </div>
            </router-link>
          </div>

          <!-- View More Button -->
          <div v-if="tvPage < tvTotalPages" class="mt-8 flex justify-center">
            <button
              :disabled="tvLoadingMore"
              class="px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 text-white font-semibold rounded-full transition-colors duration-200 flex items-center gap-2"
              @click="loadMoreTV"
            >
              <svg
                v-if="tvLoadingMore"
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
              {{ tvLoadingMore ? "Loading..." : "View More TV Shows" }}
            </button>
          </div>
        </div>
      </section>

      <!-- Trending People Section -->
      <section>
        <div class="flex items-center justify-between mb-8">
          <h2
            class="text-3xl font-bold text-gray-900 dark:text-white border-l-4 border-teal-500 pl-4"
          >
            Trending People
          </h2>
        </div>

        <div
          v-if="peopleLoading"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          <div v-for="n in 10" :key="n" class="space-y-3">
            <Skeleton class-name="aspect-[2/3] w-full rounded-2xl" />
            <Skeleton class-name="h-4 w-3/4" />
          </div>
        </div>

        <div v-else>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          >
            <router-link
              v-for="person in trendingPeople"
              :key="person.id"
              :to="`/person/${person.id}`"
              class="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ring-1 ring-black/5 dark:ring-white/10"
            >
              <div class="aspect-[2/3] overflow-hidden relative">
                <img
                  :src="tmdb.getImageUrl(person.profile_path)"
                  :srcset="tmdb.getPosterSrcset(person.profile_path)"
                  :sizes="tmdb.posterSizes"
                  :alt="person.name"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>

              <div class="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    class="font-bold text-gray-900 dark:text-white truncate text-base mb-1"
                    :title="person.name"
                  >
                    {{ person.name }}
                  </h3>
                  <p
                    v-if="person.known_for_department"
                    class="text-xs text-gray-500 dark:text-gray-400 font-medium"
                  >
                    {{ person.known_for_department }}
                  </p>
                </div>
              </div>
            </router-link>
          </div>

          <!-- View More Button -->
          <div
            v-if="peoplePage < peopleTotalPages"
            class="mt-8 flex justify-center"
          >
            <button
              :disabled="peopleLoadingMore"
              class="px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 text-white font-semibold rounded-full transition-colors duration-200 flex items-center gap-2"
              @click="loadMorePeople"
            >
              <svg
                v-if="peopleLoadingMore"
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
              {{ peopleLoadingMore ? "Loading..." : "View More People" }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
