<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { tmdb } from "../services/tmdb";
import type { TVSeasonDetails, MediaDetails } from "../types/tmdb";
import Skeleton from "../components/Skeleton.vue";
import PersonCard from "../components/PersonCard.vue";
import { useTheme } from "../composables/useTheme";

const { isCyberpunk } = useTheme();

const route = useRoute();
const router = useRouter();

const season = ref<TVSeasonDetails | null>(null);
const series = ref<MediaDetails | null>(null);
const loading = ref(true);
const expandedEpisode = ref<number | null>(null);

const seriesId = computed(() => Number(route.params.seriesId));
const seasonNumber = computed(() => Number(route.params.seasonNumber));

const seriesTitle = computed(() => series.value?.name || "");

const allSeasons = computed(() => {
  if (!series.value?.seasons) return [];
  const regular = series.value.seasons.filter((s) => s.season_number > 0);
  return regular.length > 0 ? regular : series.value.seasons;
});

const toggleEpisode = (episodeNumber: number) => {
  expandedEpisode.value =
    expandedEpisode.value === episodeNumber ? null : episodeNumber;
};

const onSeasonChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const newSeasonNumber = Number(target.value);
  router.push(`/tv/${seriesId.value}/season/${newSeasonNumber}`);
};

const formatDate = (date: string | null) => {
  if (!date) return "TBA";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatRuntime = (mins: number | null) => {
  if (!mins) return "";
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const fetchData = async () => {
  loading.value = true;
  expandedEpisode.value = null;

  try {
    const [seasonData, seriesData] = await Promise.all([
      tmdb.getSeasonDetails(seriesId.value, seasonNumber.value),
      tmdb.getDetails("tv", seriesId.value),
    ]);
    season.value = seasonData;
    series.value = seriesData;
  } catch (err) {
    console.error("Failed to fetch season details:", err);
  } finally {
    loading.value = false;
  }
};

watch(
  () => [route.params.seriesId, route.params.seasonNumber],
  () => {
    if (route.params.seriesId && route.params.seasonNumber) {
      fetchData();
    }
  },
  { immediate: true },
);
</script>

<template>
  <!-- Loading State -->
  <div v-if="loading" class="animate-in fade-in duration-500">
    <div
      :class="
        isCyberpunk ? 'bg-cyber-black' : 'bg-gray-100 dark:bg-gray-900/50'
      "
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8"
      >
        <Skeleton
          :class-name="
            isCyberpunk
              ? 'w-48 h-72 rounded-none flex-shrink-0 mx-auto md:mx-0'
              : 'w-48 h-72 rounded-2xl flex-shrink-0 mx-auto md:mx-0'
          "
        />
        <div class="flex-1 space-y-4">
          <Skeleton class-name="h-6 w-1/3" />
          <Skeleton class-name="h-10 w-2/3" />
          <Skeleton class-name="h-6 w-1/4" />
          <Skeleton class-name="h-24 w-full" />
        </div>
      </div>
    </div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-4">
      <Skeleton
        v-for="i in 5"
        :key="i"
        :class-name="
          isCyberpunk ? 'h-28 w-full rounded-none' : 'h-28 w-full rounded-2xl'
        "
      />
    </div>
  </div>

  <!-- Success State -->
  <div v-else-if="season" class="pb-20 overflow-x-hidden">
    <!-- Hero Section -->
    <div
      :class="
        isCyberpunk
          ? 'bg-cyber-black border-b border-cyber-chrome'
          : 'bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950'
      "
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col md:flex-row gap-8"
      >
        <!-- Season Poster -->
        <div class="flex-shrink-0 mx-auto md:mx-0">
          <div
            :class="[
              'w-40 md:w-48 aspect-[2/3] overflow-hidden shadow-2xl',
              isCyberpunk
                ? 'rounded-none border border-cyber-cyan/30'
                : 'rounded-2xl ring-1 ring-black/10 dark:ring-white/10 bg-gray-200 dark:bg-gray-800',
            ]"
          >
            <img
              v-if="season.poster_path"
              :src="tmdb.getImageUrl(season.poster_path, 'w500')"
              :srcset="tmdb.getPosterSrcset(season.poster_path)"
              sizes="(max-width: 768px) 160px, 192px"
              :alt="season.name"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              :class="[
                'w-full h-full flex items-center justify-center',
                isCyberpunk
                  ? 'bg-cyber-night text-cyber-muted'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-400',
              ]"
            >
              <svg
                class="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Season Info -->
        <div class="flex-1 text-center md:text-left">
          <!-- Breadcrumb back to series -->
          <router-link
            :to="`/details/tv/${seriesId}`"
            :class="[
              'inline-flex items-center gap-1.5 text-sm font-semibold mb-3 transition-colors',
              isCyberpunk
                ? 'text-cyber-cyan hover:text-cyber-yellow font-cyber-mono uppercase tracking-wider'
                : 'text-teal-500 hover:text-teal-600',
            ]"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {{ seriesTitle }}
          </router-link>

          <!-- Cyberpunk data prefix -->
          <div
            v-if="isCyberpunk"
            class="flex items-center justify-center md:justify-start gap-2 mb-3 text-cyber-cyan/60 font-cyber-mono text-xs tracking-widest"
          >
            <span class="w-6 h-px bg-cyber-cyan/40"></span>
            <span>DATA.SEASON</span>
          </div>

          <h1
            :class="[
              'text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3',
              isCyberpunk
                ? 'text-white font-display uppercase tracking-wide'
                : 'text-gray-900 dark:text-white',
            ]"
          >
            {{ season.name }}
          </h1>

          <div
            :class="[
              'flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm mb-6',
              isCyberpunk
                ? 'text-cyber-gray font-cyber-mono'
                : 'text-gray-500 dark:text-gray-400',
            ]"
          >
            <span v-if="season.air_date">
              {{ formatDate(season.air_date) }}
            </span>
            <span
              v-if="season.air_date && season.episodes.length"
              :class="isCyberpunk ? 'text-cyber-cyan' : ''"
              >·</span
            >
            <span>
              {{ season.episodes.length }}
              episode{{ season.episodes.length !== 1 ? "s" : "" }}
            </span>
            <template v-if="season.vote_average">
              <span :class="isCyberpunk ? 'text-cyber-cyan' : ''">·</span>
              <span class="flex items-center gap-1">
                <span
                  :class="isCyberpunk ? 'text-cyber-yellow' : 'text-amber-500'"
                  >&#9733;</span
                >
                <span
                  :class="[
                    'font-bold',
                    isCyberpunk
                      ? 'text-cyber-yellow font-data'
                      : 'text-gray-900 dark:text-white',
                  ]"
                >
                  {{ season.vote_average.toFixed(1) }}
                </span>
              </span>
            </template>
          </div>

          <!-- Season Selector Dropdown -->
          <div v-if="allSeasons.length > 1" class="mb-6">
            <select
              :value="seasonNumber"
              :class="[
                'border px-4 py-2.5 text-sm font-medium focus:outline-none min-w-[200px]',
                isCyberpunk
                  ? 'bg-cyber-night border-cyber-chrome text-white font-display rounded-none focus:border-cyber-cyan focus:shadow-[0_0_10px_rgba(85,234,212,0.2)]'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500',
              ]"
              @change="onSeasonChange"
            >
              <option
                v-for="s in allSeasons"
                :key="s.id"
                :value="s.season_number"
              >
                {{ s.name }} ({{ s.episode_count }} ep.)
              </option>
            </select>
          </div>

          <p
            v-if="season.overview"
            :class="[
              'leading-relaxed max-w-3xl',
              isCyberpunk
                ? 'text-cyber-gray font-display'
                : 'text-gray-600 dark:text-gray-300',
            ]"
          >
            {{ season.overview }}
          </p>
        </div>
      </div>
    </div>

    <!-- Episodes List -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <h2
        :class="[
          'text-2xl md:text-3xl font-bold mb-8 pb-4 border-b',
          isCyberpunk
            ? 'text-white font-display uppercase tracking-wider border-cyber-chrome flex items-center gap-3'
            : 'text-gray-900 dark:text-white border-gray-200 dark:border-gray-800',
        ]"
      >
        <span v-if="isCyberpunk" class="text-cyber-cyan">&gt;</span>
        Episodes
      </h2>

      <div class="space-y-4">
        <div
          v-for="episode in season.episodes"
          :key="episode.id"
          :class="[
            'overflow-hidden transition-all duration-300',
            isCyberpunk
              ? 'bg-cyber-night border border-cyber-chrome rounded-none'
              : 'bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50',
            isCyberpunk
              ? expandedEpisode === episode.episode_number
                ? 'border-cyber-cyan shadow-[0_0_15px_rgba(85,234,212,0.15)]'
                : ''
              : expandedEpisode === episode.episode_number
                ? 'ring-2 ring-teal-500/50'
                : '',
          ]"
        >
          <!-- Episode Header (always visible, clickable) -->
          <button
            :class="[
              'w-full flex items-center gap-4 p-4 text-left transition-colors',
              isCyberpunk
                ? 'hover:bg-cyber-chrome/50'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800',
            ]"
            @click="toggleEpisode(episode.episode_number)"
          >
            <!-- Episode Still (thumbnail) -->
            <div
              :class="[
                'hidden sm:block w-40 h-24 flex-shrink-0 overflow-hidden',
                isCyberpunk
                  ? 'rounded-none bg-cyber-chrome border border-cyber-chrome'
                  : 'rounded-lg bg-gray-200 dark:bg-gray-700',
              ]"
            >
              <img
                v-if="episode.still_path"
                :src="tmdb.getImageUrl(episode.still_path, 'w300')"
                :alt="episode.name"
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <div
                v-else
                :class="[
                  'w-full h-full flex items-center justify-center',
                  isCyberpunk ? 'text-cyber-muted' : 'text-gray-400',
                ]"
              >
                <svg
                  class="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <!-- Episode Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span
                  :class="[
                    'text-xs font-bold uppercase flex-shrink-0',
                    isCyberpunk
                      ? 'text-cyber-cyan font-cyber-mono'
                      : 'text-teal-500',
                  ]"
                >
                  E{{ String(episode.episode_number).padStart(2, "0") }}
                </span>
                <h3
                  :class="[
                    'font-bold truncate',
                    isCyberpunk
                      ? 'text-white font-display'
                      : 'text-gray-900 dark:text-white',
                  ]"
                >
                  {{ episode.name }}
                </h3>
              </div>
              <div
                :class="[
                  'flex flex-wrap items-center gap-3 text-xs',
                  isCyberpunk
                    ? 'text-cyber-muted font-cyber-mono'
                    : 'text-gray-500 dark:text-gray-400',
                ]"
              >
                <span v-if="episode.air_date">{{
                  formatDate(episode.air_date)
                }}</span>
                <span v-if="episode.runtime">{{
                  formatRuntime(episode.runtime)
                }}</span>
                <span
                  v-if="episode.vote_average"
                  class="flex items-center gap-1"
                >
                  <span
                    :class="
                      isCyberpunk ? 'text-cyber-yellow' : 'text-amber-500'
                    "
                    >&#9733;</span
                  >
                  {{ episode.vote_average.toFixed(1) }}
                </span>
              </div>
            </div>

            <!-- Expand/Collapse Arrow -->
            <svg
              :class="[
                'w-5 h-5 transition-transform duration-200 flex-shrink-0',
                isCyberpunk ? 'text-cyber-cyan/60' : 'text-gray-400',
                {
                  'rotate-180': expandedEpisode === episode.episode_number,
                },
              ]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <!-- Episode Expanded Content -->
          <div
            v-if="expandedEpisode === episode.episode_number"
            :class="[
              'px-4 pb-6 pt-4 border-t',
              isCyberpunk
                ? 'border-cyber-chrome'
                : 'border-gray-100 dark:border-gray-700/50',
            ]"
          >
            <!-- Overview -->
            <p
              v-if="episode.overview"
              :class="[
                'leading-relaxed mb-4',
                isCyberpunk
                  ? 'text-cyber-gray font-display'
                  : 'text-gray-600 dark:text-gray-300',
              ]"
            >
              {{ episode.overview }}
            </p>
            <p
              v-else
              :class="[
                'italic mb-4',
                isCyberpunk
                  ? 'text-cyber-muted font-display not-italic'
                  : 'text-gray-400 dark:text-gray-500',
              ]"
            >
              <template v-if="isCyberpunk">[NO_DATA]</template>
              <template v-else>No overview available.</template>
            </p>

            <!-- Guest Stars -->
            <div v-if="episode.guest_stars?.length" class="mt-4">
              <h4
                :class="[
                  'text-sm font-bold mb-3 uppercase tracking-wider',
                  isCyberpunk
                    ? 'text-cyber-cyan font-cyber-mono'
                    : 'text-gray-900 dark:text-white',
                ]"
              >
                Guest Stars
              </h4>
              <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <PersonCard
                  v-for="star in episode.guest_stars.slice(0, 10)"
                  :id="star.id"
                  :key="star.id"
                  :name="star.name"
                  :image-path="star.profile_path"
                  :subtitle="star.character"
                  variant="circular"
                  class="flex-shrink-0 w-20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state for episodes -->
      <div
        v-if="season.episodes.length === 0"
        :class="[
          'text-center py-16',
          isCyberpunk
            ? 'text-cyber-muted font-display'
            : 'text-gray-500 dark:text-gray-400',
        ]"
      >
        <p class="text-lg">
          <template v-if="isCyberpunk">[NO_EPISODES_FOUND]</template>
          <template v-else>No episodes found for this season.</template>
        </p>
      </div>
    </div>
  </div>

  <!-- Error State -->
  <div
    v-else
    :class="[
      'min-h-[50vh] flex flex-col items-center justify-center',
      isCyberpunk ? 'text-cyber-muted' : 'text-gray-500 dark:text-gray-400',
    ]"
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
      />
    </svg>
    <p :class="['text-lg', isCyberpunk ? 'font-display uppercase' : '']">
      <template v-if="isCyberpunk">[SEASON_NOT_FOUND]</template>
      <template v-else>Season not found</template>
    </p>
    <router-link
      to="/"
      :class="[
        'mt-4 font-medium',
        isCyberpunk
          ? 'text-cyber-cyan hover:text-cyber-yellow font-display uppercase tracking-wider'
          : 'text-teal-500 hover:text-teal-600',
      ]"
    >
      Go back home
    </router-link>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
