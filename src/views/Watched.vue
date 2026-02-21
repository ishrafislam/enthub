<script setup lang="ts">
import { computed } from "vue";
import { useConvexQuery } from "../composables/useConvex";
import { api } from "../../convex/_generated/api";
import { authStore } from "../store/auth";
import Skeleton from "../components/Skeleton.vue";
import MediaCard from "../components/MediaCard.vue";
import { useTheme } from "../composables/useTheme";
import { useListFilters } from "../composables/useListFilters";

const { isCyberpunk } = useTheme();

const { data: watched, loading } = useConvexQuery(
  api.lists.getWatched,
  computed(() => ({ userId: authStore.userId })),
);

const {
  sortBy,
  typeFilter,
  genreFilter,
  languageFilter,
  statusFilter,
  availableGenres,
  availableLanguages,
  availableStatuses,
  filteredAndSorted,
  hasActiveFilters,
  clearFilters,
} = useListFilters(watched, "watchedAt");
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div
      :class="[
        'flex items-center justify-between mb-8 pb-4 border-b',
        isCyberpunk
          ? 'border-cyber-chrome'
          : 'border-gray-200 dark:border-gray-800',
      ]"
    >
      <h1
        :class="[
          'text-3xl font-bold flex items-center gap-3',
          isCyberpunk
            ? 'text-white font-display uppercase tracking-wider'
            : 'text-gray-900 dark:text-white',
        ]"
      >
        <span v-if="isCyberpunk" class="text-cyber-cyan">&gt;</span>
        <span v-if="isCyberpunk">WATCH_HISTORY</span>
        <span v-else>Watched History</span>
      </h1>
      <span
        v-if="watched"
        :class="[
          'px-3 py-1 text-sm font-bold',
          isCyberpunk
            ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30 font-data'
            : 'bg-teal-500 text-white rounded-full',
        ]"
      >
        <span v-if="hasActiveFilters">
          {{ filteredAndSorted.length }} / {{ watched.length }} items
        </span>
        <span v-else>{{ watched.length }} items</span>
      </span>
    </div>

    <!-- Controls bar -->
    <div v-if="watched && watched.length > 0" class="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
      <!-- Type filter buttons -->
      <div
        :class="[
          'flex shrink-0',
          isCyberpunk ? 'gap-1' : 'border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
        ]"
      >
        <button
          v-for="opt in [
            { value: 'all', label: isCyberpunk ? 'ALL' : 'All' },
            { value: 'movie', label: isCyberpunk ? 'MOVIES' : 'Movies' },
            { value: 'tv', label: isCyberpunk ? 'TV_SERIES' : 'TV Series' },
          ]"
          :key="opt.value"
          :class="[
            'flex-1 sm:flex-none px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap',
            isCyberpunk
              ? [
                  'border font-display uppercase tracking-wider',
                  typeFilter === opt.value
                    ? 'bg-cyber-cyan text-cyber-black border-cyber-cyan'
                    : 'bg-transparent text-cyber-muted border-cyber-chrome hover:text-cyber-cyan hover:border-cyber-cyan',
                ]
              : [
                  typeFilter === opt.value
                    ? 'bg-teal-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                ],
          ]"
          @click="typeFilter = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>

      <!-- Sort + secondary filters -->
      <div class="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:ml-auto">
        <!-- Sort select -->
        <select
          v-model="sortBy"
          :class="[
            'w-full sm:w-auto px-3 py-2 text-sm',
            isCyberpunk
              ? 'font-display uppercase tracking-wider'
              : 'rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500',
          ]"
        >
          <option value="date-desc">Date Watched: Newest</option>
          <option value="date-asc">Date Watched: Oldest</option>
          <option value="title-asc">Title: A–Z</option>
          <option value="title-desc">Title: Z–A</option>
          <option value="rating-desc">TMDB Rating: High to Low</option>
          <option value="popularity-desc">Popularity: High to Low</option>
          <option value="year-desc">Year: Newest</option>
          <option value="year-asc">Year: Oldest</option>
        </select>

        <!-- Genre select -->
        <select
          v-if="availableGenres.length > 0"
          v-model="genreFilter"
          :class="[
            'w-full sm:w-auto px-3 py-2 text-sm',
            isCyberpunk
              ? 'font-display uppercase tracking-wider'
              : 'rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500',
          ]"
        >
          <option value="">All Genres</option>
          <option v-for="genre in availableGenres" :key="genre" :value="genre">
            {{ genre }}
          </option>
        </select>

        <!-- Status select -->
        <select
          v-if="availableStatuses.length > 0"
          v-model="statusFilter"
          :class="[
            'w-full sm:w-auto px-3 py-2 text-sm',
            isCyberpunk
              ? 'font-display uppercase tracking-wider'
              : 'rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500',
          ]"
        >
          <option value="">All Statuses</option>
          <option
            v-for="status in availableStatuses"
            :key="status"
            :value="status"
          >
            {{ status }}
          </option>
        </select>

        <!-- Language select -->
        <select
          v-if="availableLanguages.length > 1"
          v-model="languageFilter"
          :class="[
            'w-full sm:w-auto px-3 py-2 text-sm',
            isCyberpunk
              ? 'font-display uppercase tracking-wider'
              : 'rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500',
          ]"
        >
          <option value="">All Languages</option>
          <option
            v-for="lang in availableLanguages"
            :key="lang"
            :value="lang"
          >
            {{ lang.toUpperCase() }}
          </option>
        </select>

        <!-- Clear button -->
        <button
          v-if="hasActiveFilters"
          :class="[
            'w-full sm:w-auto px-3 py-2 text-sm font-semibold transition-colors',
            isCyberpunk
              ? 'border border-cyber-red text-cyber-red hover:bg-cyber-red/20 font-display uppercase tracking-wider'
              : 'border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400',
          ]"
          @click="clearFilters"
        >
          <span v-if="isCyberpunk">× CLEAR</span>
          <span v-else>× Clear</span>
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
    >
      <div v-for="n in 6" :key="n" class="space-y-3">
        <Skeleton class-name="aspect-[2/3] w-full rounded-2xl" />
        <Skeleton class-name="h-4 w-3/4" />
      </div>
    </div>

    <div v-else-if="!watched || watched.length === 0" class="text-center py-20">
      <div
        :class="[
          'inline-flex items-center justify-center w-20 h-20 mb-6',
          isCyberpunk
            ? 'border border-cyber-chrome bg-cyber-night'
            : 'rounded-full bg-gray-100 dark:bg-gray-800',
        ]"
      >
        <svg
          :class="[
            'w-10 h-10',
            isCyberpunk ? 'text-cyber-muted' : 'text-gray-400',
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </div>
      <h2
        :class="[
          'text-2xl font-bold mb-2',
          isCyberpunk
            ? 'text-white font-display uppercase tracking-wider'
            : 'text-gray-900 dark:text-white',
        ]"
      >
        <span v-if="isCyberpunk" class="text-cyber-yellow">[NO_RECORDS]</span>
        <span v-else>You haven't marked anything as watched</span>
      </h2>
      <p
        :class="[
          isCyberpunk
            ? 'text-cyber-muted font-display'
            : 'text-gray-500 dark:text-gray-400',
        ]"
      >
        <span v-if="isCyberpunk">No viewing history logged</span>
        <span v-else>Keep track of the movies and shows you've seen.</span>
      </p>
    </div>

    <!-- No results from filters -->
    <div
      v-else-if="filteredAndSorted.length === 0"
      class="text-center py-16"
    >
      <p
        :class="[
          'text-lg mb-4',
          isCyberpunk
            ? 'text-cyber-muted font-display uppercase tracking-wider'
            : 'text-gray-500 dark:text-gray-400',
        ]"
      >
        <span v-if="isCyberpunk">[NO_MATCH] No results match your filters.</span>
        <span v-else>No results match your filters.</span>
      </p>
      <button
        :class="[
          'px-6 py-2 font-bold transition',
          isCyberpunk
            ? 'border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/20 font-display uppercase tracking-wider'
            : 'bg-teal-500 text-white rounded-full hover:bg-teal-600',
        ]"
        @click="clearFilters"
      >
        <span v-if="isCyberpunk">&gt; CLEAR_FILTERS</span>
        <span v-else>Clear Filters</span>
      </button>
    </div>

    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
    >
      <MediaCard
        v-for="item in filteredAndSorted"
        :id="item.tmdbId"
        :key="item._id"
        :title="item.title"
        :poster-path="item.posterPath ?? null"
        :to="`/details/${item.mediaType}/${item.tmdbId}`"
        :media-type="item.mediaType"
        status-badge="watched"
      />
    </div>
  </div>
</template>
