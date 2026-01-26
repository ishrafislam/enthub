<script setup lang="ts">
import { ref, onMounted } from "vue";
import { tmdb } from "../services/tmdb";
import type { MediaItem, MovieItem, TVItem } from "../types/tmdb";
import { useRouter } from "vue-router";
import Skeleton from "../components/Skeleton.vue";
import { useTheme } from "../composables/useTheme";

const trending = ref<MediaItem[]>([]);
const loading = ref(true);
const router = useRouter();
const searchQuery = ref("");
const { isCyberpunk } = useTheme();
// A nice fallback image for the hero if TMDB fails or just to look cool
const heroBackdrop = ref(
  "https://image.tmdb.org/t/p/original/mC97c40xSMD062WpL3jfc1nC7c.jpg",
);

onMounted(async () => {
  try {
    const data = await tmdb.getTrending();
    trending.value = data.results;
    const firstWithBackdrop = data.results.find(
      (item) => item.media_type !== "person" && item.backdrop_path,
    );
    if (
      firstWithBackdrop &&
      firstWithBackdrop.media_type !== "person" &&
      firstWithBackdrop.backdrop_path
    ) {
      heroBackdrop.value = tmdb.getImageUrl(
        firstWithBackdrop.backdrop_path,
        "original",
      );
    }
  } catch (error) {
    console.error("Failed to load trending:", error);
  } finally {
    loading.value = false;
  }
});

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: "/search", query: { q: searchQuery.value } });
  }
};

const getTitle = (item: MediaItem) => {
  if (item.media_type === "person") return item.name;
  return item.media_type === "movie"
    ? (item as MovieItem).title
    : (item as TVItem).name;
};

const getDate = (item: MediaItem) => {
  if (item.media_type === "person") return "";
  const dateStr =
    item.media_type === "movie"
      ? (item as MovieItem).release_date
      : (item as TVItem).first_air_date;
  return dateStr ? new Date(dateStr).getFullYear() : "Unknown Year";
};

const getPoster = (item: MediaItem) => {
  if (item.media_type === "person") return item.profile_path;
  return item.poster_path;
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
        <form
          :class="[
            'relative max-w-2xl mx-auto group',
            isCyberpunk ? 'cyber-search-form' : '',
          ]"
          @submit.prevent="handleSearch"
        >
          <!-- Cyberpunk corner accents -->
          <div
            v-if="isCyberpunk"
            class="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyber-cyan/50 pointer-events-none"
          ></div>
          <div
            v-if="isCyberpunk"
            class="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyber-cyan/50 pointer-events-none"
          ></div>
          <div
            v-if="isCyberpunk"
            class="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyber-cyan/50 pointer-events-none"
          ></div>
          <div
            v-if="isCyberpunk"
            class="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyber-cyan/50 pointer-events-none"
          ></div>

          <div
            class="absolute inset-y-0 left-0 pl-4 md:pl-6 flex items-center pointer-events-none"
          >
            <svg
              :class="[
                'h-5 w-5 md:h-6 md:w-6 transition-colors',
                isCyberpunk
                  ? 'text-cyber-cyan/60 group-focus-within:text-cyber-cyan'
                  : 'text-gray-400 group-focus-within:text-teal-500',
              ]"
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
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for movies, TV shows..."
            :class="[
              'block w-full pl-10 md:pl-14 pr-24 md:pr-32 py-3 md:py-5 text-sm md:text-lg transition-all',
              isCyberpunk
                ? 'rounded-none bg-cyber-night/90 backdrop-blur-sm text-white placeholder-cyber-muted border border-cyber-chrome focus:border-cyber-cyan focus:ring-0 focus:shadow-[0_0_15px_rgba(85,234,212,0.3)] font-display'
                : 'rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-gray-200 dark:border-transparent focus:border-teal-500 focus:ring-0 shadow-xl md:shadow-2xl',
            ]"
          />
          <button
            type="submit"
            :class="[
              'absolute right-1.5 md:right-2 top-1.5 md:top-2 bottom-1.5 md:bottom-2 px-4 md:px-8 font-bold transition duration-200 text-sm md:text-base',
              isCyberpunk
                ? 'bg-cyber-cyan text-cyber-black rounded-none font-display uppercase tracking-wider hover:shadow-[0_0_20px_rgba(85,234,212,0.5)] hover:bg-cyber-yellow active:scale-95'
                : 'bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-full hover:shadow-lg hover:scale-105 active:scale-95',
            ]"
            :style="
              isCyberpunk
                ? 'clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                : ''
            "
          >
            Search
          </button>
        </form>
      </div>
    </div>

    <!-- Trending Section (Contained) -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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
            Trending Today
          </h2>
        </div>

        <!-- Loading Skeletons -->
        <div
          v-if="loading"
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
        <div
          v-else
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          <router-link
            v-for="item in trending"
            :key="item.id"
            :to="
              item.media_type === 'person'
                ? '#'
                : `/details/${item.media_type}/${item.id}`
            "
            :class="[
              'group relative flex flex-col transition-all duration-300 overflow-hidden',
              isCyberpunk
                ? 'bg-cyber-night border border-cyber-chrome rounded-none hover:border-cyber-cyan hover:shadow-[0_0_20px_rgba(85,234,212,0.2)] cyber-card'
                : 'bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 ring-1 ring-black/5 dark:ring-white/10',
            ]"
          >
            <!-- Cyberpunk corner accents -->
            <template v-if="isCyberpunk">
              <div
                class="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyber-cyan/0 group-hover:border-cyber-cyan transition-colors z-10 pointer-events-none"
              ></div>
              <div
                class="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyber-cyan/0 group-hover:border-cyber-cyan transition-colors z-10 pointer-events-none"
              ></div>
              <div
                class="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyber-cyan/0 group-hover:border-cyber-cyan transition-colors z-10 pointer-events-none"
              ></div>
              <div
                class="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyber-cyan/0 group-hover:border-cyber-cyan transition-colors z-10 pointer-events-none"
              ></div>
            </template>

            <!-- Poster Image -->
            <div class="aspect-[2/3] overflow-hidden relative">
              <img
                :src="tmdb.getImageUrl(getPoster(item))"
                :srcset="tmdb.getPosterSrcset(getPoster(item))"
                :sizes="tmdb.posterSizes"
                :alt="getTitle(item)"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <!-- Cyberpunk scan lines on poster -->
              <div
                v-if="isCyberpunk"
                class="absolute inset-0 cyber-scanlines opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              ></div>
              <!-- Hover overlay -->
              <div
                v-if="item.media_type !== 'person'"
                :class="[
                  'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                  isCyberpunk
                    ? 'bg-gradient-to-t from-cyber-black via-cyber-black/60 to-transparent'
                    : 'bg-gradient-to-t from-black/80 via-transparent to-transparent',
                ]"
              >
                <div class="absolute bottom-4 left-4 right-4 text-white">
                  <p
                    :class="[
                      'font-bold text-sm line-clamp-2',
                      isCyberpunk ? 'font-display' : '',
                    ]"
                  >
                    {{ item.overview }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Card Content -->
            <div class="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3
                  :class="[
                    'font-bold truncate text-base mb-1',
                    isCyberpunk
                      ? 'text-white font-display tracking-wide'
                      : 'text-gray-900 dark:text-white',
                  ]"
                  :title="getTitle(item)"
                >
                  {{ getTitle(item) }}
                </h3>
                <p
                  :class="[
                    'text-xs font-medium',
                    isCyberpunk
                      ? 'text-cyber-muted font-cyber-mono'
                      : 'text-gray-500 dark:text-gray-400',
                  ]"
                >
                  {{ getDate(item) }}
                </p>
              </div>

              <!-- Rating and Type -->
              <div
                v-if="item.media_type !== 'person'"
                class="mt-3 flex items-center justify-between"
              >
                <!-- Rating -->
                <div
                  :class="[
                    'flex items-center px-2 py-1',
                    isCyberpunk
                      ? 'bg-cyber-chrome/50 border border-cyber-chrome'
                      : 'bg-gray-100 dark:bg-gray-700 rounded-md',
                  ]"
                >
                  <span
                    :class="[
                      'text-sm mr-1',
                      isCyberpunk ? 'text-cyber-yellow' : 'text-amber-500',
                    ]"
                    >★</span
                  >
                  <span
                    :class="[
                      'text-xs font-bold',
                      isCyberpunk
                        ? 'text-cyber-yellow font-data'
                        : 'text-gray-700 dark:text-gray-200',
                    ]"
                    >{{ item.vote_average?.toFixed(1) }}</span
                  >
                </div>
                <!-- Media Type Badge -->
                <span
                  :class="[
                    'text-xs uppercase tracking-wider px-1.5 py-0.5',
                    isCyberpunk
                      ? 'text-cyber-cyan border border-cyber-cyan/50 font-cyber-mono'
                      : 'text-gray-400 border border-gray-200 dark:border-gray-700 rounded',
                  ]"
                >
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
