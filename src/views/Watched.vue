<script setup lang="ts">
import { computed } from "vue";
import { useConvexQuery } from "../composables/useConvex";
import { api } from "../../convex/_generated/api";
import { authStore } from "../store/auth";
import { tmdb } from "../services/tmdb";
import Skeleton from "../components/Skeleton.vue";
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
      <router-link
        v-for="item in watched"
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
          <!-- Completed badge -->
          <div
            v-if="isCyberpunk"
            class="absolute top-2 right-2 bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30 px-2 py-0.5 text-[10px] font-cyber-mono uppercase"
          >
            ✓ DONE
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
          <div class="flex justify-between items-center">
            <p
              :class="[
                'text-xs capitalize',
                isCyberpunk ? 'text-cyber-cyan font-cyber-mono uppercase' : 'text-gray-500 dark:text-gray-400',
              ]"
            >
              {{ item.mediaType }}
            </p>
            <span
              v-if="!isCyberpunk"
              class="text-[10px] text-teal-500 font-bold"
              >WATCHED</span
            >
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>
