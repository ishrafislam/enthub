<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { tmdb } from "../services/tmdb";
import type { MediaItem, MovieItem, TVItem } from "../types/tmdb";
import Skeleton from "../components/Skeleton.vue";
import { useTheme } from "../composables/useTheme";

const { isCyberpunk } = useTheme();

const route = useRoute();
const results = ref<MediaItem[]>([]);
const loading = ref(true);
const query = ref("");
const error = ref("");

const search = async () => {
  const q = route.query.q as string;
  if (!q) {
    error.value = "";
    results.value = [];
    loading.value = false;
    return;
  }

  query.value = q;
  loading.value = true;
  error.value = "";

  try {
    const data = await tmdb.search(q);
    results.value = data.results;
  } catch (err) {
    console.error(err);
    error.value =
      err instanceof Error ? err.message : "Search failed. Please try again.";
    results.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(search);
watch(() => route.query.q, search);

const getTitle = (item: MediaItem) => {
  if (item.media_type === "person") return item.name;
  return item.media_type === "movie"
    ? (item as MovieItem).title
    : (item as TVItem).name;
};

const getPoster = (item: MediaItem) => {
  if (item.media_type === "person") return item.profile_path;
  return item.poster_path;
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <h2
      :class="[
        'text-3xl font-bold pb-4 border-b',
        isCyberpunk
          ? 'text-white font-display uppercase tracking-wider border-cyber-chrome flex items-center gap-3'
          : 'text-gray-900 dark:text-white border-gray-200 dark:border-gray-800',
      ]"
    >
      <span v-if="isCyberpunk" class="text-cyber-cyan">&gt;</span>
      Search Results for
      <span :class="isCyberpunk ? 'text-cyber-yellow' : 'text-teal-500'"
        >"{{ query }}"</span
      >
    </h2>

    <div
      v-if="error"
      :class="[
        'p-4 text-sm flex items-center gap-2',
        isCyberpunk
          ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/30 font-cyber-mono'
          : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg',
      ]"
    >
      <svg
        class="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      {{ error }}
    </div>

    <div
      v-if="loading"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
    >
      <div v-for="n in 10" :key="n" class="space-y-3">
        <Skeleton class-name="aspect-[2/3] w-full rounded-2xl" />
        <Skeleton class-name="h-4 w-3/4" />
      </div>
    </div>

    <div v-else-if="results.length === 0" class="text-center py-20">
      <div
        :class="[
          'inline-flex items-center justify-center w-16 h-16 mb-4',
          isCyberpunk
            ? 'border border-cyber-chrome bg-cyber-night'
            : 'rounded-full bg-gray-100 dark:bg-gray-800',
        ]"
      >
        <svg
          :class="[
            'w-8 h-8',
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      <p
        :class="[
          'text-xl',
          isCyberpunk
            ? 'text-cyber-muted font-display uppercase tracking-wider'
            : 'text-gray-500 dark:text-gray-400',
        ]"
      >
        <span v-if="isCyberpunk" class="text-cyber-red">[NO_MATCH]</span>
        <span v-else>No results found for "{{ query }}"</span>
      </p>
    </div>

    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
    >
      <router-link
        v-for="item in results"
        :key="item.id"
        :to="
          item.media_type === 'person'
            ? `/person/${item.id}`
            : `/details/${item.media_type}/${item.id}`
        "
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
            v-if="getPoster(item)"
            :src="tmdb.getImageUrl(getPoster(item))"
            :srcset="tmdb.getPosterSrcset(getPoster(item))"
            :sizes="tmdb.posterSizes"
            :alt="getTitle(item)"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
          <div
            v-else
            :class="[
              'w-full h-full flex items-center justify-center',
              isCyberpunk
                ? 'text-cyber-muted font-cyber-mono text-xs'
                : 'text-gray-400',
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
        </div>
        <div class="p-4 flex-1">
          <h3
            :class="[
              'font-bold truncate text-sm mb-1',
              isCyberpunk
                ? 'text-white font-display'
                : 'text-gray-900 dark:text-white',
            ]"
          >
            {{ getTitle(item) }}
          </h3>
          <p
            :class="[
              'text-xs capitalize',
              isCyberpunk
                ? 'text-cyber-cyan font-cyber-mono uppercase'
                : 'text-gray-500 dark:text-gray-400',
            ]"
          >
            {{ item.media_type }}
          </p>
        </div>
      </router-link>
    </div>
  </div>
</template>
