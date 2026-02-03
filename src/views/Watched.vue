<script setup lang="ts">
import { computed } from "vue";
import { useConvexQuery } from "../composables/useConvex";
import { api } from "../../convex/_generated/api";
import { authStore } from "../store/auth";
import Skeleton from "../components/Skeleton.vue";
import MediaCard from "../components/MediaCard.vue";
import { useTheme } from "../composables/useTheme";

const { isCyberpunk } = useTheme();

const { data: watched, loading } = useConvexQuery(
  api.lists.getWatched,
  computed(() => ({ userId: authStore.userId })),
);
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div
      :class="[
        'flex items-center justify-between mb-8 pb-4 border-b',
        isCyberpunk ? 'border-cyber-chrome' : 'border-gray-200 dark:border-gray-800',
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
        {{ watched.length }} items
      </span>
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
          :class="['w-10 h-10', isCyberpunk ? 'text-cyber-muted' : 'text-gray-400']"
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
          isCyberpunk ? 'text-cyber-muted font-display' : 'text-gray-500 dark:text-gray-400',
        ]"
      >
        <span v-if="isCyberpunk">No viewing history logged</span>
        <span v-else>Keep track of the movies and shows you've seen.</span>
      </p>
    </div>

    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
    >
      <MediaCard
        v-for="item in watched"
        :key="item._id"
        :id="item.tmdbId"
        :title="item.title"
        :poster-path="item.posterPath ?? null"
        :to="`/details/${item.mediaType}/${item.tmdbId}`"
        :media-type="item.mediaType"
        status-badge="watched"
      />
    </div>
  </div>
</template>
