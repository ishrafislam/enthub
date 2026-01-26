<script setup lang="ts">
import { computed } from "vue";
import { useConvexQuery } from "../composables/useConvex";
import { api } from "../../convex/_generated/api";
import { authStore } from "../store/auth";
import { tmdb } from "../services/tmdb";
import Skeleton from "../components/Skeleton.vue";

const { data: watchlist, loading } = useConvexQuery(
  api.lists.getWatchlist,
  computed(() => ({ userId: authStore.userId })),
);
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div
      class="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-800 pb-4"
    >
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Your Watchlist
      </h1>
      <span
        v-if="watchlist"
        class="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-bold"
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
        class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6"
      >
        <svg
          class="w-10 h-10 text-gray-400"
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
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Your watchlist is empty
      </h2>
      <p class="text-gray-500 dark:text-gray-400">
        Start adding movies and shows you want to watch!
      </p>
      <router-link
        to="/"
        class="mt-6 inline-block bg-teal-500 text-white px-6 py-2 rounded-full font-bold hover:bg-teal-600 transition"
      >
        Discover Content
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
        class="group relative flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden"
      >
        <div class="aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-gray-700">
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
            class="w-full h-full flex items-center justify-center text-gray-400 font-bold"
          >
            No Image
          </div>
        </div>
        <div class="p-4 flex-1">
          <h3
            class="font-bold text-gray-900 dark:text-white truncate text-sm mb-1"
          >
            {{ item.title }}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {{ item.mediaType }}
          </p>
        </div>
      </router-link>
    </div>
  </div>
</template>
