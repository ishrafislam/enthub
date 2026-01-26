<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { tmdb } from "../services/tmdb";
import type { MediaDetails, CrewMember } from "../types/tmdb";
import { useConvexQuery, useConvexMutation } from "../composables/useConvex";
import { api } from "../../convex/_generated/api";
import { authStore } from "../store/auth";
import Skeleton from "../components/Skeleton.vue";

const route = useRoute();
const router = useRouter();
const media = ref<MediaDetails | null>(null);
const loading = ref(true);
const showAllCast = ref(false);
const showAllVideos = ref(false);

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

onMounted(async () => {
  const type = route.params.type as "movie" | "tv";
  const id = Number(route.params.id);

  try {
    media.value = await tmdb.getDetails(type, id);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});

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
</script>

<template>
  <div v-if="loading" class="animate-in fade-in duration-500">
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
          :src="tmdb.getImageUrl(media.backdrop_path, 'original')"
          class="w-full h-full object-cover"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/40 to-transparent dark:from-gray-950 dark:via-gray-950/60 dark:to-transparent"
        ></div>
        <div
          class="absolute inset-0 bg-gradient-to-r from-gray-50/80 via-transparent to-transparent dark:from-gray-950/80 dark:via-transparent dark:to-transparent"
        ></div>
      </div>

      <div class="absolute inset-0 flex flex-col justify-end">
        <div
          class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8 md:pb-12 flex flex-col md:flex-row gap-6 md:gap-10 items-end"
        >
          <!-- Poster -->
          <div
            class="hidden md:block w-64 lg:w-80 flex-shrink-0 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/20 transform translate-y-20 lg:translate-y-32 z-30"
          >
            <img
              :src="tmdb.getImageUrl(media.poster_path, 'original')"
              class="w-full h-auto block"
            />
          </div>

          <div class="flex-1 text-gray-900 dark:text-white z-10 w-full">
            <h1
              class="text-3xl md:text-5xl lg:text-7xl font-extrabold mb-2 md:mb-4 drop-shadow-sm leading-tight"
            >
              {{ media.title || media.name }}
              <span
                class="text-xl md:text-3xl lg:text-5xl font-light opacity-70 block md:inline"
              >
                ({{ getYear(media.release_date || media.first_air_date) }})
              </span>
            </h1>

            <p
              v-if="media.tagline"
              class="text-lg md:text-xl lg:text-2xl text-gray-500 dark:text-gray-400 italic mb-4 md:mb-6 font-light"
            >
              "{{ media.tagline }}"
            </p>

            <div
              class="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-lg font-medium opacity-90 mb-6 md:mb-8"
            >
              <span
                class="bg-gray-200 dark:bg-gray-800/80 backdrop-blur-md px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-gray-300 dark:border-gray-700"
              >
                {{ $route.params.type === "movie" ? "Movie" : "TV Series" }}
              </span>
              <span>{{ media.genres.map((g) => g.name).join(", ") }}</span>
              <span v-if="media.runtime || media.episode_run_time?.length">
                •
                {{
                  formatRuntime(media.runtime || media.episode_run_time?.[0])
                }}
              </span>
            </div>

            <div
              class="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 md:gap-6"
            >
              <div
                class="flex items-center gap-3 md:gap-4 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full px-4 md:px-6 py-2 md:py-3 border border-white/20 dark:border-white/10 shadow-sm"
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
                      class="text-gray-300 dark:text-gray-700"
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
                      class="text-teal-500"
                    />
                  </svg>
                  <span class="absolute text-xs md:text-sm font-bold"
                    >{{ Math.round(media.vote_average * 10) }}%</span
                  >
                </div>
                <span class="font-bold text-xs md:text-base leading-tight"
                  >User<br />Score</span
                >
              </div>

              <div class="flex flex-wrap gap-2 md:gap-3 w-full sm:w-auto">
                <button
                  :class="
                    status?.inWatchlist
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-teal-500 hover:bg-teal-600'
                  "
                  class="flex-1 sm:flex-none justify-center text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold transition flex items-center gap-2 md:gap-3 shadow-lg hover:shadow-teal-500/30 text-sm md:text-lg"
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
                <button
                  :class="
                    status?.inWatched
                      ? 'bg-teal-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  "
                  class="border border-gray-200 dark:border-gray-700 p-3 md:p-4 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow-md"
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

                <a
                  v-if="trailer"
                  :href="`https://www.youtube.com/watch?v=${trailer.key}`"
                  target="_blank"
                  class="flex-1 sm:flex-none justify-center bg-gray-900/80 dark:bg-white/10 text-white border border-gray-700 dark:border-white/20 px-6 md:px-8 py-3 md:py-4 rounded-full font-bold transition hover:bg-gray-800 dark:hover:bg-white/20 flex items-center gap-2 md:gap-3 text-sm md:text-lg"
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
            class="bg-gray-100 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700/50"
          >
            <h3
              class="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2"
            >
              Details
            </h3>

            <div class="space-y-4">
              <div>
                <p
                  class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold"
                >
                  Status
                </p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ media.status || "-" }}
                </p>
              </div>
              <div>
                <p
                  class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold"
                >
                  Original Language
                </p>
                <p class="font-medium text-gray-900 dark:text-white uppercase">
                  {{ media.original_language || "-" }}
                </p>
              </div>
              <div v-if="media.budget">
                <p
                  class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold"
                >
                  Budget
                </p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ formatMoney(media.budget) }}
                </p>
              </div>
              <div v-if="media.revenue">
                <p
                  class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold"
                >
                  Revenue
                </p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ formatMoney(media.revenue) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Overview & Crew (Right) -->
        <div class="lg:col-span-3 space-y-12">
          <section>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Overview
            </h3>
            <p class="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              {{ media.overview }}
            </p>
          </section>

          <!-- Collection Banner -->
          <section v-if="media.belongs_to_collection">
            <router-link
              :to="`/collection/${media.belongs_to_collection.id}`"
              class="group block relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-teal-500 transition-all duration-300 hover:shadow-xl"
            >
              <!-- Background -->
              <div class="absolute inset-0">
                <img
                  v-if="media.belongs_to_collection.backdrop_path"
                  :src="
                    tmdb.getImageUrl(
                      media.belongs_to_collection.backdrop_path,
                      'original',
                    )
                  "
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60"
                ></div>
              </div>

              <!-- Content -->
              <div class="relative flex items-center gap-6 p-6">
                <!-- Collection Poster -->
                <div
                  class="hidden sm:block w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden shadow-lg ring-1 ring-white/20"
                >
                  <img
                    :src="
                      tmdb.getImageUrl(media.belongs_to_collection.poster_path)
                    "
                    class="w-full h-full object-cover"
                  />
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <p
                    class="text-teal-400 text-sm font-semibold uppercase tracking-wider mb-1"
                  >
                    Part of
                  </p>
                  <h4
                    class="text-white text-xl md:text-2xl font-bold mb-2 truncate"
                  >
                    {{ media.belongs_to_collection.name }}
                  </h4>
                  <p class="text-gray-300 text-sm">
                    View all movies in this collection
                  </p>
                </div>

                <!-- Arrow -->
                <div
                  class="flex-shrink-0 text-white/60 group-hover:text-teal-400 transition-colors"
                >
                  <svg
                    class="w-8 h-8 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </div>
              </div>
            </router-link>
          </section>

          <!-- Key Crew with Pictures -->
          <section
            v-if="directors.length || writers.length || producers.length"
          >
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Key Crew
            </h3>
            <div
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8"
            >
              <!-- Directors -->
              <router-link
                v-for="director in directors"
                :key="director.id"
                :to="`/person/${director.id}`"
                class="text-center group cursor-pointer"
              >
                <div
                  class="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-2 border-transparent group-hover:border-teal-500 transition duration-300 shadow-md bg-gray-200 dark:bg-gray-800"
                >
                  <img
                    v-if="director.profile_path"
                    :src="tmdb.getImageUrl(director.profile_path)"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-gray-400"
                  >
                    <svg
                      class="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      ></path>
                    </svg>
                  </div>
                </div>
                <h4
                  class="font-bold text-gray-900 dark:text-white text-sm group-hover:text-teal-500 transition-colors"
                >
                  {{ director.name }}
                </h4>
                <p class="text-xs text-teal-500 font-semibold uppercase">
                  Director
                </p>
              </router-link>

              <!-- Writers -->
              <router-link
                v-for="writer in writers.slice(0, 5)"
                :key="writer.id"
                :to="`/person/${writer.id}`"
                class="text-center group cursor-pointer"
              >
                <div
                  class="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-2 border-transparent group-hover:border-teal-500 transition duration-300 shadow-md bg-gray-200 dark:bg-gray-800"
                >
                  <img
                    v-if="writer.profile_path"
                    :src="tmdb.getImageUrl(writer.profile_path)"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-gray-400"
                  >
                    <svg
                      class="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      ></path>
                    </svg>
                  </div>
                </div>
                <h4
                  class="font-bold text-gray-900 dark:text-white text-sm group-hover:text-teal-500 transition-colors"
                >
                  {{ writer.name }}
                </h4>
                <p class="text-xs text-blue-500 font-semibold uppercase">
                  Writer
                </p>
              </router-link>

              <!-- Producers -->
              <router-link
                v-for="producer in producers.slice(0, 5)"
                :key="producer.id"
                :to="`/person/${producer.id}`"
                class="text-center group cursor-pointer"
              >
                <div
                  class="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-2 border-transparent group-hover:border-teal-500 transition duration-300 shadow-md bg-gray-200 dark:bg-gray-800"
                >
                  <img
                    v-if="producer.profile_path"
                    :src="tmdb.getImageUrl(producer.profile_path)"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-gray-400"
                  >
                    <svg
                      class="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      ></path>
                    </svg>
                  </div>
                </div>
                <h4
                  class="font-bold text-gray-900 dark:text-white text-sm group-hover:text-teal-500 transition-colors"
                >
                  {{ producer.name }}
                </h4>
                <p class="text-xs text-gray-500 font-semibold uppercase">
                  {{ producer.job }}
                </p>
              </router-link>
            </div>
          </section>
        </div>
      </div>

      <!-- Cast Section (Full Width Grid) -->
      <section>
        <div
          class="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-800 pb-4"
        >
          <h3 class="text-3xl font-bold text-gray-900 dark:text-white">
            Top Cast
          </h3>
        </div>

        <div
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6"
        >
          <router-link
            v-for="castMember in displayedCast"
            :key="castMember.id"
            :to="`/person/${castMember.id}`"
            class="group cursor-pointer"
          >
            <div
              class="aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-gray-200 dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 group-hover:border-teal-500 group-hover:-translate-y-1"
            >
              <img
                v-if="castMember.profile_path"
                :src="tmdb.getImageUrl(castMember.profile_path)"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-gray-400"
              >
                <svg
                  class="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              </div>
            </div>
            <p
              class="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-teal-500 transition-colors"
            >
              {{ castMember.name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ castMember.character }}
            </p>
          </router-link>
        </div>

        <div
          v-if="(media.credits.cast.length || 0) > 16"
          class="mt-10 text-center"
        >
          <button
            class="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-3 rounded-full font-bold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
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
          class="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-800 pb-4"
        >
          <h3 class="text-3xl font-bold text-gray-900 dark:text-white">
            Videos
          </h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <a
            v-for="video in displayedVideos"
            :key="video.id"
            :href="`https://www.youtube.com/watch?v=${video.key}`"
            target="_blank"
            class="group relative block aspect-video rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 transition hover:shadow-2xl hover:-translate-y-1"
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
            class="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-3 rounded-full font-bold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
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
          class="text-2xl font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-gray-800 pb-4"
        >
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
              class="h-12 md:h-16 bg-white p-3 rounded-xl shadow-sm border border-gray-100 group-hover:shadow-md transition"
            >
              <img
                :src="tmdb.getImageUrl(company.logo_path, 'original')"
                class="h-full object-contain mix-blend-multiply"
              />
            </div>
            <span class="font-bold text-gray-700 dark:text-gray-300 text-lg">{{
              company.name
            }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
