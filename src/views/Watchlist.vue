<script setup lang="ts">
import { computed } from "vue";
import { useConvexQuery } from "../composables/useConvex";
import { api } from "../../convex/_generated/api";
import { authStore } from "../store/auth";
import { tmdb } from "../services/tmdb";
import Skeleton from "../components/Skeleton.vue";
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
      <router-link
        v-for="item in watchlist"
        :key="item._id"
        :to="`/details/${item.mediaType}/${item.tmdbId}`"
        :class="[
          'group relative flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden',
          isCyberpunk
            ? 'bg-cyber-night border border-cyber-chrome rounded-none hover:border-cyber-cyan hover:shadow-[0_0_20px_rgba(85,234,212,0.2)]'
            : 'bg-white dark:bg-gray-800 rounded-xl',
        ]"
      >
        <div
          :class="[
            'aspect-[2/3] overflow-hidden relative',
            isCyberpunk ? 'bg-cyber-chrome' : 'bg-gray-200 dark:bg-gray-700',
          ]"
        >
          <img
            v-if="item.posterPath"
            :src="tmdb.getImageUrl(item.posterPath)"
            :srcset="tmdb.getPosterSrcset(item.posterPath)"
            :sizes="tmdb.posterSizes"
            :alt="item.title"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
          <div
            v-else
            :class="[
              'w-full h-full flex items-center justify-center font-bold',
              isCyberpunk ? 'text-cyber-muted font-cyber-mono text-xs' : 'text-gray-400',
            ]"
          >
            <span v-if="isCyberpunk">[NO_IMG]</span>
            <span v-else>No Image</span>
          </div>
          <!-- Cyberpunk corner accents -->
          <div
            v-if="isCyberpunk"
            class="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          >
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
          </div>
          <!-- Queued badge -->
          <div
            v-if="isCyberpunk"
            class="absolute top-2 right-2 bg-cyber-yellow/20 text-cyber-yellow border border-cyber-yellow/30 px-2 py-0.5 text-[10px] font-cyber-mono uppercase"
          >
            QUEUED
          </div>
        </div>
        <div class="p-4 flex-1">
          <h3
            :class="[
              'font-bold truncate text-sm mb-1',
              isCyberpunk ? 'text-white font-display' : 'text-gray-900 dark:text-white',
            ]"
          >
            {{ item.title }}
          </h3>
          <p
            :class="[
              'text-xs capitalize',
              isCyberpunk ? 'text-cyber-cyan font-cyber-mono uppercase' : 'text-gray-500 dark:text-gray-400',
            ]"
          >
            {{ item.mediaType }}
          </p>
        </div>
      </router-link>
    </div>
  </div>
</template>
