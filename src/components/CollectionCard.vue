<script setup lang="ts">
import { tmdb } from "../services/tmdb";
import { useTheme } from "../composables/useTheme";

const { isCyberpunk } = useTheme();

defineProps<{
  id: number;
  name: string;
  posterPath: string | null;
  backdropPath: string | null;
}>();
</script>

<template>
  <router-link
    :to="`/collection/${id}`"
    :class="[
      'group block relative overflow-hidden border transition-all duration-300 hover:shadow-xl',
      isCyberpunk
        ? 'rounded-none border-cyber-chrome hover:border-cyber-cyan hover:shadow-[0_0_20px_rgba(85,234,212,0.2)]'
        : 'rounded-2xl border-gray-200 dark:border-gray-700 hover:border-teal-500',
    ]"
  >
    <!-- Background -->
    <div class="absolute inset-0">
      <img
        v-if="backdropPath"
        :src="tmdb.getImageUrl(backdropPath, 'original')"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div
        :class="[
          'absolute inset-0',
          isCyberpunk
            ? 'bg-gradient-to-r from-cyber-black/95 via-cyber-black/80 to-cyber-black/60'
            : 'bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60',
        ]"
      ></div>
    </div>

    <!-- Content -->
    <div class="relative flex items-center gap-6 p-6">
      <!-- Collection Poster -->
      <div
        :class="[
          'hidden sm:block w-24 h-36 flex-shrink-0 overflow-hidden shadow-lg',
          isCyberpunk
            ? 'rounded-none border border-cyber-cyan/30'
            : 'rounded-lg ring-1 ring-white/20',
        ]"
      >
        <img
          :src="tmdb.getImageUrl(posterPath)"
          class="w-full h-full object-cover"
        />
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <p
          :class="[
            'text-sm font-semibold uppercase tracking-wider mb-1',
            isCyberpunk ? 'text-cyber-cyan font-cyber-mono' : 'text-teal-400',
          ]"
        >
          Part of
        </p>
        <h4
          :class="[
            'text-white text-xl md:text-2xl font-bold mb-2 truncate',
            isCyberpunk ? 'font-display' : '',
          ]"
        >
          {{ name }}
        </h4>
        <p
          :class="[
            'text-sm',
            isCyberpunk ? 'text-cyber-gray' : 'text-gray-300',
          ]"
        >
          View all movies in this collection
        </p>
      </div>

      <!-- Arrow -->
      <div
        :class="[
          'flex-shrink-0 transition-colors',
          isCyberpunk
            ? 'text-cyber-cyan/60 group-hover:text-cyber-cyan'
            : 'text-white/60 group-hover:text-teal-400',
        ]"
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
          />
        </svg>
      </div>
    </div>
  </router-link>
</template>
