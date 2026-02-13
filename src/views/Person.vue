<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { tmdb } from "../services/tmdb";
import type { PersonDetails, PersonCrewCredit } from "../types/tmdb";
import { useConvexQuery } from "../composables/useConvex";
import { api } from "../../convex/_generated/api";
import { authStore } from "../store/auth";
import Skeleton from "../components/Skeleton.vue";
import MediaCard from "../components/MediaCard.vue";
import { useTheme } from "../composables/useTheme";
import { filterAdultContent } from "../utils/adultFilter";

const { isCyberpunk } = useTheme();

const route = useRoute();
const person = ref<PersonDetails | null>(null);
const loading = ref(true);
const showFullBio = ref(false);
const activeTab = ref<"acting" | "crew">("acting");
const sortBy = ref<"date" | "popularity">("date");

// Convex: get user's watchlist and watched lists to show status
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

// Format helpers
const formatDate = (date: string | null) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const getYear = (date?: string) => (date ? new Date(date).getFullYear() : null);

const calculateAge = (birthday: string | null, deathday: string | null) => {
  if (!birthday) return null;
  const birth = new Date(birthday);
  const end = deathday ? new Date(deathday) : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  const m = end.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const getGenderText = (gender: number) => {
  switch (gender) {
    case 1:
      return "Female";
    case 2:
      return "Male";
    case 3:
      return "Non-binary";
    default:
      return null;
  }
};

// Only include movie and TV media types
const isValidMediaType = (type: string) => type === "movie" || type === "tv";

// Get "Known For" - top 8 most popular credits
const knownFor = computed(() => {
  if (!person.value?.combined_credits) return [];

  const allCredits = filterAdultContent([
    ...person.value.combined_credits.cast,
    ...person.value.combined_credits.crew,
  ]).filter((credit) => isValidMediaType(credit.media_type));

  // Deduplicate by id and media_type
  const seen = new Set<string>();
  const unique = allCredits.filter((credit) => {
    const key = `${credit.media_type}-${credit.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.sort((a, b) => b.popularity - a.popularity).slice(0, 8);
});

// Sorted and filtered acting credits
const actingCredits = computed(() => {
  if (!person.value?.combined_credits?.cast) return [];

  const credits = filterAdultContent(
    person.value.combined_credits.cast.filter((credit) =>
      isValidMediaType(credit.media_type),
    ),
  );

  if (sortBy.value === "date") {
    return credits.sort((a, b) => {
      const dateA = a.release_date || a.first_air_date || "";
      const dateB = b.release_date || b.first_air_date || "";
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }

  return credits.sort((a, b) => b.popularity - a.popularity);
});

// Sorted and filtered crew credits (grouped by department)
const crewCredits = computed(() => {
  if (!person.value?.combined_credits?.crew) return [];

  const credits = filterAdultContent(
    person.value.combined_credits.crew.filter((credit) =>
      isValidMediaType(credit.media_type),
    ),
  );

  if (sortBy.value === "date") {
    return credits.sort((a, b) => {
      const dateA = a.release_date || a.first_air_date || "";
      const dateB = b.release_date || b.first_air_date || "";
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }

  return credits.sort((a, b) => b.popularity - a.popularity);
});

// Group crew by department for better organization
const crewByDepartment = computed(() => {
  const grouped: Record<string, PersonCrewCredit[]> = {};

  for (const credit of crewCredits.value) {
    const dept = credit.department;
    if (!grouped[dept]) {
      grouped[dept] = [];
    }
    grouped[dept]!.push(credit);
  }

  return grouped;
});

const fetchPerson = async () => {
  const id = Number(route.params.id);
  loading.value = true;

  try {
    person.value = await tmdb.getPersonDetails(id);
    if (person.value?.name) {
      document.title = `${person.value.name} - EntHub`;
    }
  } catch (err) {
    console.error("Failed to fetch person:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchPerson);

// Refetch if route changes
watch(() => route.params.id, fetchPerson);
</script>

<template>
  <div v-if="loading" class="animate-in fade-in duration-500">
    <!-- Hero Skeleton -->
    <div class="bg-gray-100 dark:bg-gray-900/50">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8"
      >
        <Skeleton
          class-name="w-64 h-96 rounded-2xl flex-shrink-0 mx-auto md:mx-0"
        />
        <div class="flex-1 space-y-4">
          <Skeleton class-name="h-10 w-2/3" />
          <Skeleton class-name="h-6 w-1/3" />
          <Skeleton class-name="h-4 w-1/4" />
          <Skeleton class-name="h-32 w-full mt-6" />
        </div>
      </div>
    </div>
    <!-- Known For Skeleton -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <Skeleton class-name="h-8 w-48 mb-6" />
      <div class="flex gap-4 overflow-hidden">
        <Skeleton
          v-for="i in 6"
          :key="i"
          class-name="w-32 h-48 rounded-xl flex-shrink-0"
        />
      </div>
    </div>
  </div>

  <div v-else-if="person" class="pb-20 overflow-x-hidden">
    <!-- Hero Section -->
    <div
      :class="[
        isCyberpunk
          ? 'bg-gradient-to-b from-cyber-black to-cyber-night'
          : 'bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950',
      ]"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col md:flex-row gap-8"
      >
        <!-- Profile Image -->
        <div class="flex-shrink-0 mx-auto md:mx-0">
          <div
            :class="[
              'w-48 md:w-64 aspect-[2/3] overflow-hidden shadow-2xl',
              isCyberpunk
                ? 'rounded-none border border-cyber-cyan/30 relative'
                : 'rounded-2xl ring-1 ring-black/10 dark:ring-white/10 bg-gray-200 dark:bg-gray-800',
            ]"
          >
            <!-- Cyberpunk corner accents -->
            <template v-if="isCyberpunk">
              <div
                class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-cyan z-10"
              ></div>
              <div
                class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-cyan z-10"
              ></div>
              <div
                class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-cyan z-10"
              ></div>
              <div
                class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-cyan z-10"
              ></div>
            </template>
            <img
              v-if="person.profile_path"
              :src="tmdb.getImageUrl(person.profile_path, 'w500')"
              :srcset="tmdb.getPosterSrcset(person.profile_path)"
              sizes="(max-width: 768px) 192px, 256px"
              :alt="person.name"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-gray-400"
            >
              <svg
                class="w-24 h-24"
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
        </div>

        <!-- Info -->
        <div class="flex-1 text-center md:text-left">
          <!-- Cyberpunk data prefix -->
          <div
            v-if="isCyberpunk"
            class="flex items-center justify-center md:justify-start gap-2 mb-3 text-cyber-cyan/60 font-cyber-mono text-xs tracking-widest"
          >
            <span class="w-6 h-px bg-cyber-cyan/40"></span>
            <span>PROFILE.DATA</span>
          </div>

          <h1
            :class="[
              'text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3',
              isCyberpunk
                ? 'text-white font-display uppercase tracking-wide'
                : 'text-gray-900 dark:text-white',
            ]"
          >
            {{ person.name }}
          </h1>

          <div
            class="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6"
          >
            <span
              v-if="person.known_for_department"
              :class="[
                'inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold',
                isCyberpunk
                  ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30 font-cyber-mono'
                  : 'bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-full',
              ]"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              {{ person.known_for_department }}
            </span>

            <span
              v-if="getGenderText(person.gender)"
              class="text-gray-500 dark:text-gray-400 text-sm"
            >
              {{ getGenderText(person.gender) }}
            </span>
          </div>

          <!-- Personal Details -->
          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 text-sm"
          >
            <div
              v-if="person.birthday"
              :class="[
                'p-4 shadow-sm',
                isCyberpunk
                  ? 'bg-cyber-night border border-cyber-chrome rounded-none'
                  : 'bg-white dark:bg-gray-800 rounded-xl',
              ]"
            >
              <p
                :class="[
                  'text-xs uppercase tracking-wider font-semibold mb-1',
                  isCyberpunk
                    ? 'text-cyber-muted font-cyber-mono'
                    : 'text-gray-500 dark:text-gray-400',
                ]"
              >
                {{ person.deathday ? "Born" : "Birthday" }}
              </p>
              <p
                :class="[
                  'font-medium',
                  isCyberpunk
                    ? 'text-white font-display'
                    : 'text-gray-900 dark:text-white',
                ]"
              >
                {{ formatDate(person.birthday) }}
                <span
                  v-if="!person.deathday && calculateAge(person.birthday, null)"
                  :class="
                    isCyberpunk
                      ? 'text-cyber-cyan font-data'
                      : 'text-gray-500 dark:text-gray-400'
                  "
                >
                  ({{ calculateAge(person.birthday, null) }} years old)
                </span>
              </p>
            </div>

            <div
              v-if="person.deathday"
              :class="[
                'p-4 shadow-sm',
                isCyberpunk
                  ? 'bg-cyber-night border border-cyber-chrome rounded-none'
                  : 'bg-white dark:bg-gray-800 rounded-xl',
              ]"
            >
              <p
                :class="[
                  'text-xs uppercase tracking-wider font-semibold mb-1',
                  isCyberpunk
                    ? 'text-cyber-muted font-cyber-mono'
                    : 'text-gray-500 dark:text-gray-400',
                ]"
              >
                Died
              </p>
              <p
                :class="[
                  'font-medium',
                  isCyberpunk
                    ? 'text-white font-display'
                    : 'text-gray-900 dark:text-white',
                ]"
              >
                {{ formatDate(person.deathday) }}
                <span
                  v-if="calculateAge(person.birthday, person.deathday)"
                  :class="
                    isCyberpunk
                      ? 'text-cyber-red'
                      : 'text-gray-500 dark:text-gray-400'
                  "
                >
                  ({{ calculateAge(person.birthday, person.deathday) }} years
                  old)
                </span>
              </p>
            </div>

            <div
              v-if="person.place_of_birth"
              :class="[
                'p-4 shadow-sm',
                isCyberpunk
                  ? 'bg-cyber-night border border-cyber-chrome rounded-none'
                  : 'bg-white dark:bg-gray-800 rounded-xl',
              ]"
            >
              <p
                :class="[
                  'text-xs uppercase tracking-wider font-semibold mb-1',
                  isCyberpunk
                    ? 'text-cyber-muted font-cyber-mono'
                    : 'text-gray-500 dark:text-gray-400',
                ]"
              >
                Birthplace
              </p>
              <p
                :class="[
                  'font-medium',
                  isCyberpunk
                    ? 'text-white font-display'
                    : 'text-gray-900 dark:text-white',
                ]"
              >
                {{ person.place_of_birth }}
              </p>
            </div>
          </div>

          <!-- Biography -->
          <div v-if="person.biography">
            <h3
              :class="[
                'text-lg font-bold mb-2',
                isCyberpunk
                  ? 'text-cyber-cyan font-display uppercase tracking-wider flex items-center gap-2'
                  : 'text-gray-900 dark:text-white',
              ]"
            >
              <span v-if="isCyberpunk" class="text-cyber-yellow">//</span>
              Biography
            </h3>
            <div class="relative">
              <p
                :class="[
                  'leading-relaxed',
                  isCyberpunk
                    ? 'text-cyber-gray font-display'
                    : 'text-gray-600 dark:text-gray-300',
                  !showFullBio && person.biography.length > 500
                    ? 'line-clamp-4'
                    : '',
                ]"
              >
                {{ person.biography }}
              </p>
              <button
                v-if="person.biography.length > 500"
                :class="[
                  'mt-2 font-medium text-sm',
                  isCyberpunk
                    ? 'text-cyber-cyan hover:text-cyber-yellow font-display uppercase tracking-wide'
                    : 'text-teal-500 hover:text-teal-600',
                ]"
                @click="showFullBio = !showFullBio"
              >
                {{ showFullBio ? "Show Less" : "Read More" }}
              </button>
            </div>
          </div>

          <!-- External Links -->
          <div
            v-if="person.imdb_id || person.homepage"
            class="mt-6 flex flex-wrap gap-3"
          >
            <a
              v-if="person.imdb_id"
              :href="`https://www.imdb.com/name/${person.imdb_id}`"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-amber-600 transition"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M14.31 9.588v.005c-.077-.048-.227-.07-.42-.07v4.815c.27 0 .44-.06.51-.18.07-.12.11-.473.11-1.058V10.93c0-.418-.01-.693-.03-.823-.02-.13-.08-.232-.17-.304v-.005zm-6.89 4.1v-3.93c0-.34.1-.575.3-.7.2-.125.467-.187.8-.187.267 0 .467.06.6.17.133.11.233.27.3.48.067.21.1.49.1.84v2.66c0 .51-.067.86-.2 1.05-.133.19-.367.29-.7.29-.467 0-.733-.17-.8-.51-.067-.34-.1-.87-.1-1.58v-.58zm-4.42-4.1h1.32l.64 4.32h.06l.63-4.32h1.33l-1.31 5.93h-1.44l-1.23-5.93zm9.2 0h2.2c.4 0 .693.113.88.34.187.227.28.567.28 1.02v3.17c0 .557-.107.94-.32 1.15-.213.21-.553.315-1.02.315h-2.02V9.588z"
                />
              </svg>
              IMDb
            </a>
            <a
              v-if="person.homepage"
              :href="person.homepage"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-gray-700 dark:hover:bg-gray-600 transition"
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
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              Website
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Known For Section -->
    <section
      v-if="knownFor.length"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12"
    >
      <h2
        :class="[
          'text-2xl md:text-3xl font-bold mb-6',
          isCyberpunk
            ? 'text-white font-display uppercase tracking-wider flex items-center gap-3'
            : 'text-gray-900 dark:text-white',
        ]"
      >
        <span v-if="isCyberpunk" class="text-cyber-cyan">&gt;</span>
        Known For
      </h2>

      <div
        class="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
      >
        <div
          v-for="credit in knownFor"
          :key="`${credit.media_type}-${credit.id}`"
          class="flex-shrink-0 w-32 snap-start"
        >
          <MediaCard
            :id="credit.id"
            :title="credit.title || credit.name || ''"
            :poster-path="credit.poster_path"
            :to="`/details/${credit.media_type}/${credit.id}`"
            :media-type="credit.media_type === 'movie' ? 'Movie' : 'TV'"
            :status-badge="
              isWatched(credit.id)
                ? 'watched'
                : isInWatchlist(credit.id)
                  ? 'watchlist'
                  : null
            "
          />
        </div>
      </div>
    </section>

    <!-- Filmography Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <h2
          :class="[
            'text-2xl md:text-3xl font-bold',
            isCyberpunk
              ? 'text-white font-display uppercase tracking-wider flex items-center gap-3'
              : 'text-gray-900 dark:text-white',
          ]"
        >
          <span v-if="isCyberpunk" class="text-cyber-cyan">&gt;</span>
          Filmography
        </h2>

        <div class="flex items-center gap-3">
          <!-- Sort Dropdown -->
          <select
            v-model="sortBy"
            class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="date">Newest First</option>
            <option value="popularity">Most Popular</option>
          </select>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 dark:border-gray-800 mb-6">
        <button
          :class="[
            'px-6 py-3 text-sm font-semibold border-b-2 transition-colors',
            activeTab === 'acting'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
          ]"
          @click="activeTab = 'acting'"
        >
          Acting
          <span
            class="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs"
          >
            {{ actingCredits.length }}
          </span>
        </button>
        <button
          :class="[
            'px-6 py-3 text-sm font-semibold border-b-2 transition-colors',
            activeTab === 'crew'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
          ]"
          @click="activeTab = 'crew'"
        >
          Crew
          <span
            class="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs"
          >
            {{ crewCredits.length }}
          </span>
        </button>
      </div>

      <!-- Acting Credits Grid -->
      <div v-if="activeTab === 'acting'">
        <div
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
        >
          <MediaCard
            v-for="credit in actingCredits"
            :id="credit.id"
            :key="`cast-${credit.media_type}-${credit.id}-${credit.character}`"
            :title="credit.title || credit.name || ''"
            :poster-path="credit.poster_path"
            :to="`/details/${credit.media_type}/${credit.id}`"
            :media-type="credit.media_type === 'movie' ? 'Movie' : 'TV'"
            :year="
              getYear(credit.release_date || credit.first_air_date) || 'TBA'
            "
            :rating="credit.vote_average || null"
            :overview="credit.character ? `as ${credit.character}` : null"
            :subtitle="credit.character"
            :status-badge="
              isWatched(credit.id)
                ? 'watched'
                : isInWatchlist(credit.id)
                  ? 'watchlist'
                  : null
            "
          />
        </div>

        <!-- Empty state -->
        <div
          v-if="!actingCredits.length"
          class="text-center py-12 text-gray-500 dark:text-gray-400"
        >
          <p>No acting credits found.</p>
        </div>
      </div>

      <!-- Crew Credits Grid -->
      <div v-if="activeTab === 'crew'" class="space-y-10">
        <div
          v-for="(credits, department) in crewByDepartment"
          :key="department"
        >
          <h3
            class="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2"
          >
            {{ department }}
          </h3>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
          >
            <MediaCard
              v-for="credit in credits"
              :id="credit.id"
              :key="`crew-${credit.media_type}-${credit.id}-${credit.job}`"
              :title="credit.title || credit.name || ''"
              :poster-path="credit.poster_path"
              :to="`/details/${credit.media_type}/${credit.id}`"
              :media-type="credit.media_type === 'movie' ? 'Movie' : 'TV'"
              :year="
                getYear(credit.release_date || credit.first_air_date) || 'TBA'
              "
              :rating="credit.vote_average || null"
              :overview="credit.job"
              :subtitle="credit.job"
              :status-badge="
                isWatched(credit.id)
                  ? 'watched'
                  : isInWatchlist(credit.id)
                    ? 'watchlist'
                    : null
              "
            />
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-if="!Object.keys(crewByDepartment).length"
          class="text-center py-12 text-gray-500 dark:text-gray-400"
        >
          <p>No crew credits found.</p>
        </div>
      </div>
    </section>
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
    <p class="text-lg">Person not found</p>
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
