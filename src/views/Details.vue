<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { tmdb } from "../services/tmdb";
import type { MediaDetails, CrewMember, TVSeasonSummary } from "../types/tmdb";
import { useConvexQuery, useConvexMutation } from "../composables/useConvex";
import { api } from "../../convex/_generated/api";
import { authStore } from "../store/auth";
import Skeleton from "../components/Skeleton.vue";
import MediaCard from "../components/MediaCard.vue";
import PersonCard from "../components/PersonCard.vue";
import CollectionCard from "../components/CollectionCard.vue";
import ContentRestricted from "../components/ContentRestricted.vue";
import { useTheme } from "../composables/useTheme";
import { isAdultContent } from "../utils/adultFilter";

const { isCyberpunk } = useTheme();

const route = useRoute();
const router = useRouter();
const media = ref<MediaDetails | null>(null);
const loading = ref(true);
const showAllCast = ref(false);
const showAllVideos = ref(false);
const isRestricted = ref(false);

// Convex Logic
const userId = computed(() => authStore.userId);
const tmdbId = computed(() => Number(route.params.id));
const mediaType = computed(() => route.params.type as string);

const { data: status } = useConvexQuery(
  api.lists.getListsStatus,
  computed(() =>
    userId.value
      ? {
          userId: userId.value as any,
          tmdbId: tmdbId.value,
        }
      : null,
  ),
);

const { mutate: toggleWatchlist } = useConvexMutation(
  api.lists.toggleWatchlist,
);
const { mutate: markAsWatched } = useConvexMutation(api.lists.markAsWatched);

const handleToggleWatchlist = async () => {
  if (!authStore.isAuthenticated()) {
    router.push("/login");
    return;
  }
  if (!media.value) return;

  await toggleWatchlist({
    userId: userId.value as any,
    tmdbId: tmdbId.value,
    mediaType: mediaType.value,
    title: media.value.title || media.value.name || "",
    posterPath: media.value.poster_path || undefined,
  });
};

const handleMarkAsWatched = async () => {
  if (!authStore.isAuthenticated()) {
    router.push("/login");
    return;
  }
  if (!media.value) return;

  await markAsWatched({
    userId: userId.value as any,
    tmdbId: tmdbId.value,
    mediaType: mediaType.value,
    title: media.value.title || media.value.name || "",
    posterPath: media.value.poster_path || undefined,
  });
};

const fetchData = async () => {
  const type = route.params.type as "movie" | "tv";
  const id = Number(route.params.id);
  loading.value = true;
  media.value = null;
  isRestricted.value = false;

  try {
    const data = await tmdb.getDetails(type, id);
    if (isAdultContent(data)) {
      isRestricted.value = true;
      media.value = null;
    } else {
      media.value = data;
      const name = data.title || data.name;
      if (name) document.title = `${name} - EntHub`;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

watch(
  () => [route.params.type, route.params.id],
  () => {
    if (route.params.type && route.params.id) {
      fetchData();
    }
  },
  { immediate: true },
);

const getYear = (date?: string) =>
  date ? new Date(date).getFullYear() : "N/A";
const formatRuntime = (mins?: number) =>
  mins ? `${Math.floor(mins / 60)}h ${mins % 60}m` : "";
const formatMoney = (amount?: number) =>
  amount ? `$${(amount / 1000000).toFixed(1)}M` : "-";

const directors = computed(
  () =>
    media.value?.credits.crew.filter((c: CrewMember) => c.job === "Director") ||
    [],
);

const writers = computed(
  () =>
    media.value?.credits.crew.filter((c: CrewMember) =>
      ["Screenplay", "Writer", "Story"].includes(c.job),
    ) || [],
);

const producers = computed(
  () =>
    media.value?.credits.crew.filter((c: CrewMember) =>
      ["Producer", "Executive Producer"].includes(c.job),
    ) || [],
);

const trailer = computed(
  () =>
    media.value?.videos.results.find(
      (v) => v.type === "Trailer" && v.site === "YouTube",
    ) ||
    media.value?.videos.results.find(
      (v) => v.type === "Teaser" && v.site === "YouTube",
    ),
);

// Grid has 8 columns on xl screens, so show 16 items (2 full rows)
const sortedCast = computed(() => {
  if (!media.value?.credits.cast) return [];
  return [...media.value.credits.cast].sort(
    (a: any, b: any) => (b.popularity || 0) - (a.popularity || 0),
  );
});

const displayedCast = computed(() => {
  if (showAllCast.value) return sortedCast.value;
  return sortedCast.value.slice(0, 16);
});

const displayedVideos = computed(() => {
  if (showAllVideos.value) return media.value?.videos.results || [];
  return media.value?.videos.results.slice(0, 8) || [];
});

const seasons = computed(() => {
  if (!media.value?.seasons) return [];
  const allSeasons = media.value.seasons;
  const regular = allSeasons.filter(
    (s: TVSeasonSummary) => s.season_number > 0,
  );
  return regular.length > 0 ? regular : allSeasons;
});
</script>

<template>
  <!-- Restricted Content -->
  <ContentRestricted v-if="isRestricted && !loading" />

  <div v-else-if="loading" class="animate-in fade-in duration-500">
    <!-- Hero Skeleton -->
    <div
      class="h-[600px] lg:h-[850px] bg-gray-100 dark:bg-gray-900/50 relative"
    >
      <div
        class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 h-full flex items-end pb-12 gap-10"
      >
        <Skeleton
          class-name="hidden md:block w-80 h-[480px] rounded-2xl transform translate-y-32 z-30"
        />
        <div class="flex-1 space-y-6 pb-16">
          <Skeleton class-name="h-12 w-2/3" />
          <Skeleton class-name="h-6 w-1/3" />
          <div class="flex gap-4">
            <Skeleton class-name="h-12 w-32 rounded-full" />
            <Skeleton class-name="h-12 w-32 rounded-full" />
          </div>
        </div>
      </div>
    </div>
    <!-- Content Skeleton -->
    <div
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-48 grid grid-cols-1 lg:grid-cols-4 gap-12"
    >
      <div class="lg:col-span-1 space-y-4">
        <Skeleton class-name="h-64 w-full rounded-2xl" />
      </div>
      <div class="lg:col-span-3 space-y-8">
        <Skeleton class-name="h-8 w-1/4" />
        <Skeleton class-name="h-32 w-full" />
        <div class="flex gap-6">
          <Skeleton
            v-for="i in 5"
            :key="i"
            class-name="w-24 h-24 rounded-full flex-shrink-0"
          />
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="media" class="pb-20 overflow-x-hidden">
    <!-- Backdrop Section (Full Width) -->
    <div class="relative h-[500px] lg:h-[850px] w-full">
      <div class="absolute inset-0">
        <img
          :src="tmdb.getImageUrl(media.backdrop_path, 'w1280')"
          :srcset="tmdb.getBackdropSrcset(media.backdrop_path)"
          :sizes="tmdb.backdropSizes"
          alt=""
          class="w-full h-full object-cover"
        />
        <!-- Gradient overlays -->
        <div
          :class="[
            'absolute inset-0',
            isCyberpunk
              ? 'bg-gradient-to-t from-cyber-black via-cyber-black/70 to-cyber-black/30'
              : 'bg-gradient-to-t from-gray-50 via-gray-50/40 to-transparent dark:from-gray-950 dark:via-gray-950/60 dark:to-transparent',
          ]"
        ></div>
        <div
          :class="[
            'absolute inset-0',
            isCyberpunk
              ? 'bg-gradient-to-r from-cyber-black/90 via-transparent to-transparent'
              : 'bg-gradient-to-r from-gray-50/80 via-transparent to-transparent dark:from-gray-950/80 dark:via-transparent dark:to-transparent',
          ]"
        ></div>
        <!-- Cyberpunk scan lines -->
        <div
          v-if="isCyberpunk"
          class="absolute inset-0 cyber-scanlines pointer-events-none"
        ></div>
        <!-- Cyberpunk vignette -->
        <div
          v-if="isCyberpunk"
          class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)] pointer-events-none"
        ></div>
      </div>

      <div class="absolute inset-0 flex flex-col justify-end">
        <div
          class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8 md:pb-12 flex flex-col md:flex-row gap-6 md:gap-10 items-end"
        >
          <!-- Poster -->
          <div
            :class="[
              'hidden md:block w-64 lg:w-80 flex-shrink-0 shadow-2xl overflow-hidden transform translate-y-20 lg:translate-y-32 z-30',
              isCyberpunk
                ? 'rounded-none border border-cyber-cyan/30 cyber-poster'
                : 'rounded-2xl ring-1 ring-white/20',
            ]"
          >
            <img
              :src="tmdb.getImageUrl(media.poster_path, 'w500')"
              :srcset="tmdb.getPosterSrcset(media.poster_path)"
              sizes="(max-width: 1024px) 256px, 320px"
              :alt="media.title || media.name"
              class="w-full h-auto block"
            />
            <!-- Cyberpunk poster corner accents -->
            <template v-if="isCyberpunk">
              <div
                class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-cyan"
              ></div>
              <div
                class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-cyan"
              ></div>
              <div
                class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-cyan"
              ></div>
              <div
                class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-cyan"
              ></div>
            </template>
          </div>

          <div
            :class="[
              'flex-1 z-10 w-full',
              isCyberpunk ? 'text-white' : 'text-gray-900 dark:text-white',
            ]"
          >
            <!-- Cyberpunk data prefix -->
            <div
              v-if="isCyberpunk"
              class="flex items-center gap-2 mb-3 text-cyber-cyan/60 font-cyber-mono text-xs tracking-widest"
            >
              <span class="w-6 h-px bg-cyber-cyan/40"></span>
              <span
                >DATA.{{
                  $route.params.type === "movie" ? "FILM" : "SERIES"
                }}</span
              >
            </div>

            <h1
              :class="[
                'text-3xl md:text-5xl lg:text-7xl font-extrabold mb-2 md:mb-4 leading-tight',
                isCyberpunk
                  ? 'font-display uppercase tracking-wide'
                  : 'drop-shadow-sm',
              ]"
            >
              {{ media.title || media.name }}
              <span
                :class="[
                  'text-xl md:text-3xl lg:text-5xl font-light block md:inline',
                  isCyberpunk ? 'text-cyber-yellow font-data' : 'opacity-70',
                ]"
              >
                ({{ getYear(media.release_date || media.first_air_date) }})
              </span>
            </h1>

            <p
              v-if="media.tagline"
              :class="[
                'text-lg md:text-xl lg:text-2xl italic mb-4 md:mb-6 font-light',
                isCyberpunk
                  ? 'text-cyber-gray not-italic font-display tracking-wide border-l-2 border-cyber-cyan/50 pl-4'
                  : 'text-gray-500 dark:text-gray-400',
              ]"
            >
              <span v-if="!isCyberpunk">"</span>{{ media.tagline
              }}<span v-if="!isCyberpunk">"</span>
            </p>

            <div
              :class="[
                'flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-lg font-medium mb-6 md:mb-8',
                isCyberpunk ? '' : 'opacity-90',
              ]"
            >
              <span
                :class="[
                  'backdrop-blur-md px-3 md:px-4 py-1 md:py-1.5',
                  isCyberpunk
                    ? 'bg-cyber-night/80 border border-cyber-cyan/50 text-cyber-cyan font-cyber-mono uppercase tracking-wider text-xs'
                    : 'bg-gray-200 dark:bg-gray-800/80 rounded-full border border-gray-300 dark:border-gray-700',
                ]"
              >
                {{ $route.params.type === "movie" ? "Movie" : "TV Series" }}
              </span>
              <span :class="isCyberpunk ? 'text-cyber-gray' : ''">{{
                media.genres.map((g) => g.name).join(", ")
              }}</span>
              <span
                v-if="media.runtime || media.episode_run_time?.length"
                :class="isCyberpunk ? 'text-cyber-muted' : ''"
              >
                <span :class="isCyberpunk ? 'text-cyber-cyan' : ''">•</span>
                {{
                  formatRuntime(media.runtime || media.episode_run_time?.[0])
                }}
              </span>
            </div>

            <div
              class="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 md:gap-6"
            >
              <!-- User Score -->
              <div
                :class="[
                  'flex items-center gap-3 md:gap-4 backdrop-blur-md px-4 md:px-6 py-2 md:py-3 shadow-sm',
                  isCyberpunk
                    ? 'bg-cyber-night/80 border border-cyber-chrome'
                    : 'bg-white/50 dark:bg-black/50 rounded-full border border-white/20 dark:border-white/10',
                ]"
              >
                <div
                  class="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center"
                >
                  <svg class="w-full h-full transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      stroke="currentColor"
                      stroke-width="4"
                      fill="transparent"
                      :class="
                        isCyberpunk
                          ? 'text-cyber-chrome'
                          : 'text-gray-300 dark:text-gray-700'
                      "
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      stroke="currentColor"
                      stroke-width="4"
                      fill="transparent"
                      :stroke-dasharray="125.6"
                      :stroke-dashoffset="
                        125.6 - (media.vote_average / 10) * 125.6
                      "
                      :class="isCyberpunk ? 'text-cyber-cyan' : 'text-teal-500'"
                    />
                  </svg>
                  <span
                    :class="[
                      'absolute text-xs md:text-sm font-bold',
                      isCyberpunk ? 'text-cyber-cyan font-data' : '',
                    ]"
                    >{{ Math.round(media.vote_average * 10) }}%</span
                  >
                </div>
                <span
                  :class="[
                    'font-bold text-xs md:text-base leading-tight',
                    isCyberpunk
                      ? 'text-cyber-gray font-display uppercase tracking-wide'
                      : '',
                  ]"
                  >User<br />Score</span
                >
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-wrap gap-2 md:gap-3 w-full sm:w-auto">
                <!-- Watchlist Button -->
                <button
                  :class="[
                    'flex-1 sm:flex-none justify-center px-6 md:px-8 py-3 md:py-4 font-bold transition flex items-center gap-2 md:gap-3 text-sm md:text-lg',
                    isCyberpunk
                      ? status?.inWatchlist
                        ? 'bg-cyber-yellow text-cyber-black font-display uppercase tracking-wider hover:shadow-[0_0_20px_rgba(243,230,0,0.4)]'
                        : 'bg-transparent border-2 border-cyber-cyan text-cyber-cyan font-display uppercase tracking-wider hover:bg-cyber-cyan hover:text-cyber-black hover:shadow-[0_0_20px_rgba(85,234,212,0.4)]'
                      : status?.inWatchlist
                        ? 'bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg hover:shadow-teal-500/30'
                        : 'bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg hover:shadow-teal-500/30',
                  ]"
                  :style="
                    isCyberpunk
                      ? 'clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
                      : ''
                  "
                  @click="handleToggleWatchlist"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 md:h-6 md:w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ status?.inWatchlist ? "In Watchlist" : "Watchlist" }}
                </button>

                <!-- Watched Button -->
                <button
                  :class="[
                    'p-3 md:p-4 transition shadow-md',
                    isCyberpunk
                      ? status?.inWatched
                        ? 'bg-cyber-cyan text-cyber-black border border-cyber-cyan'
                        : 'bg-cyber-night border border-cyber-chrome text-cyber-gray hover:border-cyber-cyan hover:text-cyber-cyan'
                      : status?.inWatched
                        ? 'bg-teal-500 text-white rounded-full'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700',
                  ]"
                  title="Mark as Watched"
                  @click="handleMarkAsWatched"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 md:h-6 md:w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>

                <!-- Trailer Button -->
                <a
                  v-if="trailer"
                  :href="`https://www.youtube.com/watch?v=${trailer.key}`"
                  target="_blank"
                  :class="[
                    'flex-1 sm:flex-none justify-center px-6 md:px-8 py-3 md:py-4 font-bold transition flex items-center gap-2 md:gap-3 text-sm md:text-lg',
                    isCyberpunk
                      ? 'bg-transparent border border-cyber-red text-cyber-red font-display uppercase tracking-wider hover:bg-cyber-red hover:text-white hover:shadow-[0_0_20px_rgba(197,0,60,0.4)]'
                      : 'bg-gray-900/80 dark:bg-white/10 text-white border border-gray-700 dark:border-white/20 rounded-full hover:bg-gray-800 dark:hover:bg-white/20',
                  ]"
                  :style="
                    isCyberpunk
                      ? 'clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
                      : ''
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 md:h-6 md:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Trailer
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content (Contained) -->
    <div
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-24 lg:mt-48 space-y-12 md:space-y-16"
    >
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <!-- Details Sidebar (Left) -->
        <div class="lg:col-span-1">
          <div
            :class="[
              'p-6 border',
              isCyberpunk
                ? 'bg-cyber-night border-cyber-chrome rounded-none'
                : 'bg-gray-100 dark:bg-gray-800/50 rounded-2xl border-gray-200 dark:border-gray-700/50',
            ]"
          >
            <h3
              :class="[
                'text-lg font-bold mb-4 pb-2 border-b',
                isCyberpunk
                  ? 'text-cyber-cyan font-display uppercase tracking-wider border-cyber-chrome'
                  : 'text-gray-900 dark:text-white border-gray-200 dark:border-gray-700',
              ]"
            >
              <span v-if="isCyberpunk" class="text-cyber-yellow mr-2">//</span
              >Details
            </h3>

            <div class="space-y-4">
              <div>
                <p
                  :class="[
                    'text-xs uppercase tracking-wider font-semibold',
                    isCyberpunk
                      ? 'text-cyber-muted font-cyber-mono'
                      : 'text-gray-500 dark:text-gray-400',
                  ]"
                >
                  Status
                </p>
                <p
                  :class="[
                    'font-medium',
                    isCyberpunk
                      ? 'text-white font-display'
                      : 'text-gray-900 dark:text-white',
                  ]"
                >
                  {{ media.status || "-" }}
                </p>
              </div>
              <div>
                <p
                  :class="[
                    'text-xs uppercase tracking-wider font-semibold',
                    isCyberpunk
                      ? 'text-cyber-muted font-cyber-mono'
                      : 'text-gray-500 dark:text-gray-400',
                  ]"
                >
                  Original Language
                </p>
                <p
                  :class="[
                    'font-medium uppercase',
                    isCyberpunk
                      ? 'text-white font-display'
                      : 'text-gray-900 dark:text-white',
                  ]"
                >
                  {{ media.original_language || "-" }}
                </p>
              </div>
              <div v-if="media.budget">
                <p
                  :class="[
                    'text-xs uppercase tracking-wider font-semibold',
                    isCyberpunk
                      ? 'text-cyber-muted font-cyber-mono'
                      : 'text-gray-500 dark:text-gray-400',
                  ]"
                >
                  Budget
                </p>
                <p
                  :class="[
                    'font-medium',
                    isCyberpunk
                      ? 'text-cyber-yellow font-data'
                      : 'text-gray-900 dark:text-white',
                  ]"
                >
                  {{ formatMoney(media.budget) }}
                </p>
              </div>
              <div v-if="media.revenue">
                <p
                  :class="[
                    'text-xs uppercase tracking-wider font-semibold',
                    isCyberpunk
                      ? 'text-cyber-muted font-cyber-mono'
                      : 'text-gray-500 dark:text-gray-400',
                  ]"
                >
                  Revenue
                </p>
                <p
                  :class="[
                    'font-medium',
                    isCyberpunk
                      ? 'text-cyber-cyan font-data'
                      : 'text-gray-900 dark:text-white',
                  ]"
                >
                  {{ formatMoney(media.revenue) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Overview & Crew (Right) -->
        <div class="lg:col-span-3 space-y-12">
          <section>
            <h3
              :class="[
                'text-2xl font-bold mb-4',
                isCyberpunk
                  ? 'text-white font-display uppercase tracking-wider flex items-center gap-2'
                  : 'text-gray-900 dark:text-white',
              ]"
            >
              <span v-if="isCyberpunk" class="text-cyber-cyan">&gt;</span>
              Overview
            </h3>
            <p
              :class="[
                'text-lg leading-relaxed',
                isCyberpunk
                  ? 'text-cyber-gray font-display'
                  : 'text-gray-600 dark:text-gray-300',
              ]"
            >
              {{ media.overview }}
            </p>
          </section>

          <!-- Collection Banner -->
          <section v-if="media.belongs_to_collection">
            <CollectionCard
              :id="media.belongs_to_collection.id"
              :name="media.belongs_to_collection.name"
              :poster-path="media.belongs_to_collection.poster_path"
              :backdrop-path="media.belongs_to_collection.backdrop_path"
            />
          </section>

          <!-- Seasons Section (TV only) -->
          <section v-if="seasons.length && $route.params.type === 'tv'">
            <h3
              :class="[
                'text-2xl font-bold mb-2',
                isCyberpunk
                  ? 'text-white font-display uppercase tracking-wider flex items-center gap-2'
                  : 'text-gray-900 dark:text-white',
              ]"
            >
              <span v-if="isCyberpunk" class="text-cyber-cyan">&gt;</span>
              Seasons
            </h3>
            <p
              :class="[
                'mb-6 text-sm',
                isCyberpunk
                  ? 'text-cyber-muted font-cyber-mono'
                  : 'text-gray-500 dark:text-gray-400',
              ]"
            >
              {{ media.number_of_seasons }}
              season{{ media.number_of_seasons !== 1 ? "s" : "" }},
              {{ media.number_of_episodes }} episodes
            </p>

            <div
              class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4"
            >
              <MediaCard
                v-for="season in seasons"
                :id="season.id"
                :key="season.id"
                :title="season.name"
                :poster-path="season.poster_path"
                :to="`/tv/${$route.params.id}/season/${season.season_number}`"
                :subtitle="`${season.episode_count} episodes`"
              />
            </div>
          </section>

          <!-- Key Crew with Pictures -->
          <section
            v-if="directors.length || writers.length || producers.length"
          >
            <h3
              :class="[
                'text-2xl font-bold mb-8',
                isCyberpunk
                  ? 'text-white font-display uppercase tracking-wider flex items-center gap-2'
                  : 'text-gray-900 dark:text-white',
              ]"
            >
              <span v-if="isCyberpunk" class="text-cyber-cyan">&gt;</span>
              Key Crew
            </h3>
            <div
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6"
            >
              <!-- Directors -->
              <PersonCard
                v-for="director in directors"
                :id="director.id"
                :key="director.id"
                :name="director.name"
                :image-path="director.profile_path"
                subtitle="Director"
                variant="card"
              />

              <!-- Writers -->
              <PersonCard
                v-for="writer in writers.slice(0, 5)"
                :id="writer.id"
                :key="writer.id"
                :name="writer.name"
                :image-path="writer.profile_path"
                subtitle="Writer"
                variant="card"
              />

              <!-- Producers -->
              <PersonCard
                v-for="producer in producers.slice(0, 5)"
                :id="producer.id"
                :key="producer.id"
                :name="producer.name"
                :image-path="producer.profile_path"
                :subtitle="producer.job"
                variant="card"
              />
            </div>
          </section>
        </div>
      </div>

      <!-- Cast Section (Full Width Grid) -->
      <section>
        <div
          :class="[
            'flex items-center justify-between mb-8 pb-4 border-b',
            isCyberpunk
              ? 'border-cyber-chrome'
              : 'border-gray-200 dark:border-gray-800',
          ]"
        >
          <h3
            :class="[
              'text-3xl font-bold',
              isCyberpunk
                ? 'text-white font-display uppercase tracking-wider flex items-center gap-3'
                : 'text-gray-900 dark:text-white',
            ]"
          >
            <span v-if="isCyberpunk" class="text-cyber-cyan">&gt;</span>
            Top Cast
          </h3>
        </div>

        <div
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6"
        >
          <PersonCard
            v-for="castMember in displayedCast"
            :id="castMember.id"
            :key="castMember.id"
            :name="castMember.name"
            :image-path="castMember.profile_path"
            :subtitle="castMember.character"
            variant="card"
          />
        </div>

        <div
          v-if="(media.credits.cast.length || 0) > 16"
          class="mt-10 text-center"
        >
          <button
            :class="[
              'inline-flex items-center gap-2 px-8 py-3 font-bold border transition shadow-sm',
              isCyberpunk
                ? 'bg-transparent border-cyber-cyan text-cyber-cyan font-display uppercase tracking-wider hover:bg-cyber-cyan hover:text-cyber-black rounded-none'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700',
            ]"
            @click="showAllCast = !showAllCast"
          >
            {{ showAllCast ? "Show Less" : "Show All Cast" }}
            <svg
              :class="{ 'rotate-180': showAllCast }"
              class="w-4 h-4 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>
        </div>
      </section>

      <!-- Videos Section (4 Columns) -->
      <section v-if="media.videos?.results?.length">
        <div
          :class="[
            'flex items-center justify-between mb-8 border-b pb-4',
            isCyberpunk
              ? 'border-cyber-chrome'
              : 'border-gray-200 dark:border-gray-800',
          ]"
        >
          <h3
            :class="[
              'text-3xl font-bold',
              isCyberpunk
                ? 'text-white font-display uppercase tracking-wider flex items-center gap-3'
                : 'text-gray-900 dark:text-white',
            ]"
          >
            <span v-if="isCyberpunk" class="text-cyber-cyan">&gt;</span>
            Videos
          </h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <a
            v-for="video in displayedVideos"
            :key="video.id"
            :href="`https://www.youtube.com/watch?v=${video.key}`"
            target="_blank"
            :class="[
              'group relative block aspect-video overflow-hidden shadow-lg border transition hover:shadow-2xl hover:-translate-y-1',
              isCyberpunk
                ? 'rounded-none border-cyber-chrome hover:border-cyber-cyan hover:shadow-[0_0_15px_rgba(85,234,212,0.2)]'
                : 'rounded-2xl border-gray-200 dark:border-gray-800',
            ]"
          >
            <img
              :src="`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`"
              class="w-full h-full object-cover transition duration-500 group-hover:scale-110"
              :alt="video.name"
            />
            <div
              class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center"
            >
              <div
                class="text-white transform group-hover:scale-125 transition duration-300 drop-shadow-2xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-16 h-16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div
              class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent"
            >
              <p class="text-white text-sm font-bold truncate">
                {{ video.name }}
              </p>
            </div>
          </a>
        </div>

        <div
          v-if="(media.videos.results.length || 0) > 8"
          class="mt-10 text-center"
        >
          <button
            :class="[
              'inline-flex items-center gap-2 px-8 py-3 font-bold border transition shadow-sm',
              isCyberpunk
                ? 'bg-transparent border-cyber-cyan text-cyber-cyan font-display uppercase tracking-wider hover:bg-cyber-cyan hover:text-cyber-black rounded-none'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700',
            ]"
            @click="showAllVideos = !showAllVideos"
          >
            {{ showAllVideos ? "Show Less" : "Show All Videos" }}
            <svg
              :class="{ 'rotate-180': showAllVideos }"
              class="w-4 h-4 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>
        </div>
      </section>

      <!-- Production Companies -->
      <section v-if="media.production_companies?.length">
        <h3
          :class="[
            'text-2xl font-bold mb-8 border-b pb-4',
            isCyberpunk
              ? 'text-white font-display uppercase tracking-wider border-cyber-chrome flex items-center gap-2'
              : 'text-gray-900 dark:text-white border-gray-200 dark:border-gray-800',
          ]"
        >
          <span v-if="isCyberpunk" class="text-cyber-cyan">&gt;</span>
          Production
        </h3>
        <div class="flex flex-wrap items-center gap-12">
          <div
            v-for="company in media.production_companies"
            :key="company.id"
            class="flex items-center gap-4 group"
          >
            <div
              v-if="company.logo_path"
              :class="[
                'h-12 md:h-16 p-3 shadow-sm border transition',
                isCyberpunk
                  ? 'bg-white/90 rounded-none border-cyber-chrome group-hover:border-cyber-cyan group-hover:shadow-[0_0_10px_rgba(85,234,212,0.15)]'
                  : 'bg-white rounded-xl border-gray-100 group-hover:shadow-md',
              ]"
            >
              <img
                :src="tmdb.getImageUrl(company.logo_path, 'original')"
                class="h-full object-contain mix-blend-multiply"
              />
            </div>
            <span
              :class="[
                'font-bold text-lg',
                isCyberpunk
                  ? 'text-cyber-gray font-display'
                  : 'text-gray-700 dark:text-gray-300',
              ]"
              >{{ company.name }}</span
            >
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Cyberpunk scan lines */
.cyber-scanlines {
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(85, 234, 212, 0.03) 2px,
    rgba(85, 234, 212, 0.03) 4px
  );
}

/* Cyberpunk poster styling */
.cyber-poster {
  position: relative;
}

.cyber-poster::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(85, 234, 212, 0.1) 0%,
    transparent 50%,
    rgba(243, 230, 0, 0.05) 100%
  );
  pointer-events: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
