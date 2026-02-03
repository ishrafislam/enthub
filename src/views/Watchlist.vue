<script setup lang="ts">
import { computed } from "vue";
import { useConvexQuery } from "../composables/useConvex";
import { api } from "../../convex/_generated/api";
import { authStore } from "../store/auth";
import Skeleton from "../components/Skeleton.vue";
import MediaCard from "../components/MediaCard.vue";
import { useTheme } from "../composables/useTheme";

const { isCyberpunk } = useTheme();

const { data: watchlist, loading } = useConvexQuery(
  api.lists.getWatchlist,
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
        <span v-if="isCyberpunk">WATCHLIST</span>
        <span v-else>Your Watchlist</span>
      </h1>
      <span
        v-if="watchlist"
        :class="[
          'px-3 py-1 text-sm font-bold',
          isCyberpunk
            ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30 font-data'
            : 'bg-teal-500 text-white rounded-full',
        ]"
      >
        {{ watchlist.length }} items
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

    <div
      v-else-if="!watchlist || watchlist.length === 0"
      class="text-center py-20"
    >
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
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
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
        <span v-if="isCyberpunk" class="text-cyber-yellow">[EMPTY]</span>
        <span v-else>Your watchlist is empty</span>
      </h2>
      <p
        :class="[
          isCyberpunk ? 'text-cyber-muted font-display' : 'text-gray-500 dark:text-gray-400',
        ]"
      >
        <span v-if="isCyberpunk">No items queued for viewing</span>
        <span v-else>Start adding movies and shows you want to watch!</span>
      </p>
      <router-link
        to="/"
        :class="[
          'mt-6 inline-block px-6 py-2 font-bold transition',
          isCyberpunk
            ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan hover:bg-cyber-cyan/30 font-display uppercase tracking-wider'
            : 'bg-teal-500 text-white rounded-full hover:bg-teal-600',
        ]"
      >
        <span v-if="isCyberpunk">&gt; DISCOVER_CONTENT</span>
        <span v-else>Discover Content</span>
      </router-link>
    </div>

    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
    >
      <MediaCard
        v-for="item in watchlist"
        :key="item._id"
        :id="item.tmdbId"
        :title="item.title"
        :poster-path="item.posterPath ?? null"
        :to="`/details/${item.mediaType}/${item.tmdbId}`"
        :media-type="item.mediaType"
        status-badge="watchlist"
      />
    </div>
  </div>
</template>
