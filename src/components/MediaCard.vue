<script setup lang="ts">
import { tmdb } from "../services/tmdb";
import { useTheme } from "../composables/useTheme";

const { isCyberpunk } = useTheme();

defineProps<{
  id: number;
  title: string;
  posterPath: string | null;
  to: string;
  mediaType?: string;
  year?: string | number | null;
  rating?: number | null;
  overview?: string | null;
  subtitle?: string | number | null;
  statusBadge?: "watchlist" | "watched" | null;
}>();

defineSlots<{
  badge?(props: {}): any;
  footer?(props: {}): any;
}>();
</script>

<template>
  <router-link
    :to="to"
    :class="[
      'group relative flex flex-col shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden',
      isCyberpunk
        ? 'bg-cyber-night border border-cyber-chrome rounded-none hover:border-cyber-cyan hover:shadow-[0_0_20px_rgba(85,234,212,0.2)]'
        : 'bg-white dark:bg-gray-800 rounded-2xl ring-1 ring-black/5 dark:ring-white/10',
    ]"
  >
    <!-- Poster -->
    <div class="aspect-[2/3] overflow-hidden relative">
      <img
        v-if="posterPath"
        :src="tmdb.getImageUrl(posterPath)"
        :srcset="tmdb.getPosterSrcset(posterPath)"
        :sizes="tmdb.posterSizes"
        :alt="title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      <div
        v-else
        :class="[
          'w-full h-full flex items-center justify-center',
          isCyberpunk
            ? 'bg-cyber-chrome text-cyber-muted font-cyber-mono text-xs'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400',
        ]"
      >
        <span v-if="isCyberpunk">[NO_IMG]</span>
        <span v-else>No Image</span>
      </div>

      <!-- Hover overlay with overview -->
      <div
        v-if="overview"
        class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <div class="absolute bottom-4 left-4 right-4 text-white">
          <p class="font-bold text-sm line-clamp-2">{{ overview }}</p>
        </div>
      </div>

      <!-- Status Badge (default) -->
      <slot name="badge">
        <div
          v-if="statusBadge"
          class="absolute top-2 right-2"
        >
          <div
            v-if="statusBadge === 'watched'"
            :class="[
              isCyberpunk
                ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30 px-2 py-0.5 text-[10px] font-cyber-mono uppercase'
                : 'bg-teal-500 text-white p-1.5 rounded-full shadow-lg',
            ]"
            title="Watched"
          >
            <template v-if="isCyberpunk">&#10003; DONE</template>
            <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div
            v-else-if="statusBadge === 'watchlist'"
            :class="[
              isCyberpunk
                ? 'bg-cyber-yellow/20 text-cyber-yellow border border-cyber-yellow/30 px-2 py-0.5 text-[10px] font-cyber-mono uppercase'
                : 'bg-amber-500 text-white p-1.5 rounded-full shadow-lg',
            ]"
            title="In Watchlist"
          >
            <template v-if="isCyberpunk">QUEUED</template>
            <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fill-rule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
      </slot>

      <!-- Cyberpunk corner accents -->
      <div
        v-if="isCyberpunk"
        class="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-cyan"></div>
        <div class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-cyan"></div>
        <div class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-cyan"></div>
        <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-cyan"></div>
      </div>
    </div>

    <!-- Info -->
    <div class="p-4 flex-1 flex flex-col justify-between">
      <div>
        <h3
          :class="[
            'font-bold truncate text-base mb-1',
            isCyberpunk
              ? 'text-white font-display'
              : 'text-gray-900 dark:text-white',
          ]"
          :title="title"
        >
          {{ title }}
        </h3>
        <p
          v-if="subtitle !== undefined ? subtitle : year"
          :class="[
            'text-xs font-medium',
            isCyberpunk
              ? 'text-cyber-muted font-cyber-mono'
              : 'text-gray-500 dark:text-gray-400',
          ]"
        >
          {{ subtitle !== undefined && subtitle !== null ? subtitle : year }}
        </p>
      </div>

      <div v-if="rating != null || mediaType" class="mt-3 flex items-center justify-between">
        <div
          v-if="rating != null"
          :class="[
            'flex items-center px-2 py-1',
            isCyberpunk
              ? 'bg-cyber-chrome rounded-none'
              : 'bg-gray-100 dark:bg-gray-700 rounded-md',
          ]"
        >
          <span
            :class="[
              'text-sm mr-1',
              isCyberpunk ? 'text-cyber-yellow' : 'text-amber-500',
            ]"
          >&#9733;</span>
          <span
            :class="[
              'text-xs font-bold',
              isCyberpunk
                ? 'text-white font-data'
                : 'text-gray-700 dark:text-gray-200',
            ]"
          >{{ typeof rating === 'number' ? rating.toFixed(1) : rating }}</span>
        </div>
        <span
          v-if="mediaType"
          :class="[
            'text-xs uppercase tracking-wider px-1.5 py-0.5',
            isCyberpunk
              ? 'text-cyber-cyan font-cyber-mono border border-cyber-chrome'
              : 'text-gray-400 border border-gray-200 dark:border-gray-700 rounded',
          ]"
        >
          {{ mediaType }}
        </span>
      </div>

      <!-- Footer slot -->
      <slot name="footer" />
    </div>
  </router-link>
</template>
