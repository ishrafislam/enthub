<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { tmdb } from "../services/tmdb";
import type { TVSeasonDetails, MediaDetails } from "../types/tmdb";
import Skeleton from "../components/Skeleton.vue";

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
    <div class="bg-gray-100 dark:bg-gray-900/50">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8"
      >
        <Skeleton
          class-name="w-48 h-72 rounded-2xl flex-shrink-0 mx-auto md:mx-0"
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
        class-name="h-28 w-full rounded-2xl"
      />
    </div>
  </div>

  <!-- Success State -->
  <div v-else-if="season" class="pb-20 overflow-x-hidden">
    <!-- Hero Section -->
    <div
      class="bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col md:flex-row gap-8"
      >
        <!-- Season Poster -->
        <div class="flex-shrink-0 mx-auto md:mx-0">
          <div
            class="w-40 md:w-48 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10 dark:ring-white/10 bg-gray-200 dark:bg-gray-800"
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
              class="w-full h-full flex items-center justify-center text-gray-400"
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
            class="inline-flex items-center gap-1.5 text-teal-500 hover:text-teal-600 text-sm font-semibold mb-3 transition-colors"
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

          <h1
            class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-3"
          >
            {{ season.name }}
          </h1>

          <div
            class="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-gray-500 dark:text-gray-400 mb-6"
          >
            <span v-if="season.air_date">
              {{ formatDate(season.air_date) }}
            </span>
            <span v-if="season.air_date && season.episodes.length">·</span>
            <span>
              {{ season.episodes.length }}
              episode{{ season.episodes.length !== 1 ? "s" : "" }}
            </span>
            <template v-if="season.vote_average">
              <span>·</span>
              <span class="flex items-center gap-1">
                <span class="text-amber-500">&#9733;</span>
                <span class="font-bold text-gray-900 dark:text-white">
                  {{ season.vote_average.toFixed(1) }}
                </span>
              </span>
            </template>
          </div>

          <!-- Season Selector Dropdown -->
          <div v-if="allSeasons.length > 1" class="mb-6">
            <select
              :value="seasonNumber"
              class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[200px]"
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
            class="text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl"
          >
            {{ season.overview }}
          </p>
        </div>
      </div>
    </div>

    <!-- Episodes List -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <h2
        class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-gray-800 pb-4"
      >
        Episodes
      </h2>

      <div class="space-y-4">
        <div
          v-for="episode in season.episodes"
          :key="episode.id"
          class="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden transition-all duration-300"
          :class="{
            'ring-2 ring-teal-500/50':
              expandedEpisode === episode.episode_number,
          }"
        >
          <!-- Episode Header (always visible, clickable) -->
          <button
            class="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            @click="toggleEpisode(episode.episode_number)"
          >
            <!-- Episode Still (thumbnail) -->
            <div
              class="hidden sm:block w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700"
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
                class="w-full h-full flex items-center justify-center text-gray-400"
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
                  class="text-xs font-bold text-teal-500 uppercase flex-shrink-0"
                >
                  E{{
                    String(episode.episode_number).padStart(2, "0")
                  }}
                </span>
                <h3
                  class="font-bold text-gray-900 dark:text-white truncate"
                >
                  {{ episode.name }}
                </h3>
              </div>
              <div
                class="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400"
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
                  <span class="text-amber-500">&#9733;</span>
                  {{ episode.vote_average.toFixed(1) }}
                </span>
              </div>
            </div>

            <!-- Expand/Collapse Arrow -->
            <svg
              :class="{
                'rotate-180':
                  expandedEpisode === episode.episode_number,
              }"
              class="w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0"
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
            class="px-4 pb-6 pt-4 border-t border-gray-100 dark:border-gray-700/50"
          >
            <!-- Overview -->
            <p
              v-if="episode.overview"
              class="text-gray-600 dark:text-gray-300 leading-relaxed mb-4"
            >
              {{ episode.overview }}
            </p>
            <p
              v-else
              class="text-gray-400 dark:text-gray-500 italic mb-4"
            >
              No overview available.
            </p>

            <!-- Guest Stars -->
            <div v-if="episode.guest_stars?.length" class="mt-4">
              <h4
                class="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider"
              >
                Guest Stars
              </h4>
              <div
                class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
              >
                <router-link
                  v-for="star in episode.guest_stars.slice(0, 10)"
                  :key="star.id"
                  :to="`/person/${star.id}`"
                  class="flex-shrink-0 text-center group w-20"
                >
                  <div
                    class="w-16 h-16 mx-auto mb-1.5 rounded-full overflow-hidden border-2 border-transparent group-hover:border-teal-500 transition bg-gray-200 dark:bg-gray-700"
                  >
                    <img
                      v-if="star.profile_path"
                      :src="
                        tmdb.getImageUrl(star.profile_path, 'w185')
                      "
                      :alt="star.name"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center text-gray-400"
                    >
                      <svg
                        class="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p
                    class="text-xs font-semibold text-gray-900 dark:text-white truncate group-hover:text-teal-500 transition-colors"
                  >
                    {{ star.name }}
                  </p>
                  <p
                    class="text-xs text-gray-500 dark:text-gray-400 truncate"
                  >
                    {{ star.character }}
                  </p>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state for episodes -->
      <div
        v-if="season.episodes.length === 0"
        class="text-center py-16 text-gray-500 dark:text-gray-400"
      >
        <p class="text-lg">No episodes found for this season.</p>
      </div>
    </div>
  </div>

  <!-- Error State -->
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
      />
    </svg>
    <p class="text-lg">Season not found</p>
    <router-link
      to="/"
      class="mt-4 text-teal-500 hover:text-teal-600 font-medium"
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
