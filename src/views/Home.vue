<script setup lang="ts">
import { ref, onMounted } from "vue";
import { tmdb } from "../services/tmdb";
import type { MovieItem, TVItem, PersonItem, SearchType } from "../types/tmdb";
import { useRouter } from "vue-router";
import Skeleton from "../components/Skeleton.vue";
import MediaCard from "../components/MediaCard.vue";
import PersonCard from "../components/PersonCard.vue";
import { useTheme } from "../composables/useTheme";
import SearchBar from "../components/SearchBar.vue";
import { filterAdultContent } from "../utils/adultFilter";

const router = useRouter();
const searchQuery = ref("");
const { isCyberpunk } = useTheme();
// A nice fallback image for the hero if TMDB fails or just to look cool
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
    const filteredResults = filterAdultContent(data.results);
    if (page === 1) {
      trendingMovies.value = filteredResults;
      // Set hero backdrop from first movie with backdrop
      const firstWithBackdrop = filteredResults.find(
        (item) => item.backdrop_path,
      );
      if (firstWithBackdrop?.backdrop_path) {
        heroBackdrop.value = tmdb.getImageUrl(
          firstWithBackdrop.backdrop_path,
          "original",
        );
      }
    } else {
      trendingMovies.value = [...trendingMovies.value, ...filteredResults];
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
    const filteredResults = filterAdultContent(data.results);
    if (page === 1) {
      trendingTV.value = filteredResults;
    } else {
      trendingTV.value = [...trendingTV.value, ...filteredResults];
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
      :class="[
        'relative h-[400px] md:h-[600px] flex items-center justify-center overflow-hidden mb-8 md:mb-12',
        isCyberpunk ? 'cyber-hero' : '',
      ]"
    >
      <!-- Dynamic Background -->
      <div
        :class="[
          'absolute inset-0',
          isCyberpunk ? 'bg-cyber-black' : 'bg-gray-300 dark:bg-gray-900',
        ]"
      >
        <img
          :src="heroBackdrop"
          style="opacity: 0"
          class="w-full h-full object-cover transition-opacity duration-500"
          alt=""
          @load="($event.target as HTMLImageElement).style.opacity = '1'"
        />
        <!-- Gradient overlay -->
        <div
          :class="[
            'absolute inset-0',
            isCyberpunk
              ? 'bg-gradient-to-t from-cyber-black via-cyber-black/80 to-cyber-black/40'
              : 'bg-gradient-to-t from-gray-50 via-gray-50/60 to-transparent dark:from-black dark:via-black/70',
          ]"
        ></div>
        <!-- Cyberpunk scan lines overlay -->
        <div
          v-if="isCyberpunk"
          class="absolute inset-0 cyber-scanlines pointer-events-none"
        ></div>
        <!-- Cyberpunk vignette -->
        <div
          v-if="isCyberpunk"
          class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)] pointer-events-none"
        ></div>
      </div>

      <div class="relative z-10 text-center px-4 max-w-4xl mx-auto w-full">
        <!-- Cyberpunk decorative element -->
        <div
          v-if="isCyberpunk"
          class="flex items-center justify-center gap-2 mb-4 text-cyber-cyan/60 font-cyber-mono text-xs tracking-widest"
        >
          <span class="w-8 h-px bg-cyber-cyan/40"></span>
          <span>SYS.INIT</span>
          <span class="w-8 h-px bg-cyber-cyan/40"></span>
        </div>

        <h1
          :class="[
            'text-3xl md:text-7xl font-extrabold mb-4 md:mb-6 tracking-tight',
            isCyberpunk
              ? 'text-white font-display uppercase'
              : 'text-gray-900 dark:text-white drop-shadow-sm',
          ]"
        >
          <template v-if="isCyberpunk">
            Explore the
            <span class="text-cyber-cyan cyber-text-glow-cyan">Universe</span>
            of Cinema<span class="text-cyber-yellow">.</span>
          </template>
          <template v-else>
            Explore the
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600 dark:from-teal-400 dark:to-blue-500"
              >Universe</span
            >
            of Cinema.
          </template>
        </h1>
        <p
          :class="[
            'text-base md:text-2xl mb-8 md:mb-10 font-medium',
            isCyberpunk
              ? 'text-cyber-gray font-display tracking-wide'
              : 'text-gray-700 dark:text-gray-200 drop-shadow-sm',
          ]"
        >
          Discover millions of movies, TV shows, and people. Track what you
          watch.
        </p>

        <!-- Search Form -->
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
        <!-- Section Header -->
        <div class="flex items-center justify-between mb-8">
          <h2
            v-if="isCyberpunk"
            class="text-3xl font-bold text-white font-display uppercase tracking-wider flex items-center gap-3"
          >
            <span class="text-cyber-cyan">&gt;</span>
            <span>Trending Today</span>
            <span
              class="text-sm font-cyber-mono text-cyber-yellow ml-2 font-normal"
              >[LIVE]</span
            >
          </h2>
          <h2
            v-else
            class="text-3xl font-bold text-gray-900 dark:text-white border-l-4 border-teal-500 pl-4"
          >
            Trending Movies
          </h2>
        </div>

        <!-- Loading Skeletons -->
        <div
          v-if="moviesLoading"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          <div v-for="n in 10" :key="n" class="space-y-3">
            <Skeleton
              :class-name="
                isCyberpunk
                  ? 'aspect-[2/3] w-full rounded-none'
                  : 'aspect-[2/3] w-full rounded-2xl'
              "
            />
            <Skeleton class-name="h-4 w-3/4" />
            <div class="flex justify-between">
              <Skeleton class-name="h-3 w-1/4" />
              <Skeleton class-name="h-3 w-1/4" />
            </div>
          </div>
        </div>

        <!-- Media Cards Grid -->
        <div v-else>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          >
            <MediaCard
              v-for="item in trendingMovies"
              :id="item.id"
              :key="item.id"
              :title="item.title"
              :poster-path="item.poster_path"
              :to="`/details/movie/${item.id}`"
              media-type="movie"
              :year="
                item.release_date
                  ? new Date(item.release_date).getFullYear()
                  : 'Unknown Year'
              "
              :rating="item.vote_average"
              :overview="item.overview"
            />
          </div>

          <!-- View More Button -->
          <div
            v-if="moviesPage < moviesTotalPages"
            class="mt-8 flex justify-center"
          >
            <button
              :disabled="moviesLoadingMore"
              :class="[
                'px-6 py-3 font-semibold transition-colors duration-200 flex items-center gap-2',
                isCyberpunk
                  ? 'bg-transparent border border-cyber-cyan text-cyber-cyan font-display uppercase tracking-wider hover:bg-cyber-cyan hover:text-cyber-black disabled:opacity-50'
                  : 'bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 text-white rounded-full',
              ]"
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
            v-if="isCyberpunk"
            class="text-3xl font-bold text-white font-display uppercase tracking-wider flex items-center gap-3"
          >
            <span class="text-cyber-cyan">&gt;</span>
            <span>Trending TV Shows</span>
          </h2>
          <h2
            v-else
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
            <Skeleton
              :class-name="
                isCyberpunk
                  ? 'aspect-[2/3] w-full rounded-none'
                  : 'aspect-[2/3] w-full rounded-2xl'
              "
            />
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
            <MediaCard
              v-for="item in trendingTV"
              :id="item.id"
              :key="item.id"
              :title="item.name"
              :poster-path="item.poster_path"
              :to="`/details/tv/${item.id}`"
              media-type="tv"
              :year="
                item.first_air_date
                  ? new Date(item.first_air_date).getFullYear()
                  : 'Unknown Year'
              "
              :rating="item.vote_average"
              :overview="item.overview"
            />
          </div>

          <!-- View More Button -->
          <div v-if="tvPage < tvTotalPages" class="mt-8 flex justify-center">
            <button
              :disabled="tvLoadingMore"
              :class="[
                'px-6 py-3 font-semibold transition-colors duration-200 flex items-center gap-2',
                isCyberpunk
                  ? 'bg-transparent border border-cyber-cyan text-cyber-cyan font-display uppercase tracking-wider hover:bg-cyber-cyan hover:text-cyber-black disabled:opacity-50'
                  : 'bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 text-white rounded-full',
              ]"
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
            v-if="isCyberpunk"
            class="text-3xl font-bold text-white font-display uppercase tracking-wider flex items-center gap-3"
          >
            <span class="text-cyber-cyan">&gt;</span>
            <span>Trending People</span>
          </h2>
          <h2
            v-else
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
            <Skeleton
              :class-name="
                isCyberpunk
                  ? 'aspect-[2/3] w-full rounded-none'
                  : 'aspect-[2/3] w-full rounded-2xl'
              "
            />
            <Skeleton class-name="h-4 w-3/4" />
          </div>
        </div>

        <div v-else>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          >
            <PersonCard
              v-for="person in trendingPeople"
              :id="person.id"
              :key="person.id"
              :name="person.name"
              :image-path="person.profile_path"
              :subtitle="person.known_for_department"
              variant="card"
            />
          </div>

          <!-- View More Button -->
          <div
            v-if="peoplePage < peopleTotalPages"
            class="mt-8 flex justify-center"
          >
            <button
              :disabled="peopleLoadingMore"
              :class="[
                'px-6 py-3 font-semibold transition-colors duration-200 flex items-center gap-2',
                isCyberpunk
                  ? 'bg-transparent border border-cyber-cyan text-cyber-cyan font-display uppercase tracking-wider hover:bg-cyber-cyan hover:text-cyber-black disabled:opacity-50'
                  : 'bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 text-white rounded-full',
              ]"
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

<style scoped>
/* Cyberpunk scan lines for hero and cards */
.cyber-scanlines {
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(85, 234, 212, 0.03) 2px,
    rgba(85, 234, 212, 0.03) 4px
  );
}

/* Cyberpunk card hover glow effect */
.cyber-card {
  position: relative;
}

.cyber-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(85, 234, 212, 0.05) 0%,
    transparent 50%,
    rgba(243, 230, 0, 0.02) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.cyber-card:hover::before {
  opacity: 1;
}
</style>
