<script setup lang="ts">
import { computed } from "vue";
import { tmdb } from "../services/tmdb";
import { useTheme } from "../composables/useTheme";

const { isCyberpunk } = useTheme();

const props = withDefaults(
  defineProps<{
    id: number;
    name: string;
    imagePath: string | null;
    subtitle?: string | null;
    to?: string;
    variant?: "card" | "circular";
  }>(),
  {
    subtitle: undefined,
    to: undefined,
    variant: "card",
  },
);

const link = computed(() => props.to ?? `/person/${props.id}`);
</script>

<template>
  <!-- Card variant (aspect-[2/3]) -->
  <router-link
    v-if="variant === 'card'"
    :to="link"
    class="group cursor-pointer"
  >
    <div
      :class="[
        'aspect-[2/3] overflow-hidden mb-3 shadow-md border transition-all duration-300 group-hover:-translate-y-1',
        isCyberpunk
          ? 'rounded-none bg-cyber-night border-cyber-chrome group-hover:border-cyber-cyan group-hover:shadow-[0_0_15px_rgba(85,234,212,0.2)]'
          : 'rounded-xl bg-gray-200 dark:bg-gray-800 border-gray-200 dark:border-gray-700 group-hover:border-teal-500',
      ]"
    >
      <img
        v-if="imagePath"
        :src="tmdb.getImageUrl(imagePath)"
        :srcset="tmdb.getProfileSrcset(imagePath)"
        :sizes="tmdb.profileSizes"
        :alt="name"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <div
        v-else
        :class="[
          'w-full h-full flex items-center justify-center',
          isCyberpunk ? 'text-cyber-muted' : 'text-gray-400',
        ]"
      >
        <svg
          class="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
    </div>
    <p
      :class="[
        'font-bold text-sm truncate transition-colors',
        isCyberpunk
          ? 'text-white font-display group-hover:text-cyber-cyan'
          : 'text-gray-900 dark:text-white group-hover:text-teal-500',
      ]"
    >
      {{ name }}
    </p>
    <p
      v-if="subtitle"
      :class="[
        'text-xs truncate',
        isCyberpunk ? 'text-cyber-muted' : 'text-gray-500 dark:text-gray-400',
      ]"
    >
      {{ subtitle }}
    </p>
  </router-link>

  <!-- Circular variant -->
  <router-link v-else :to="link" class="text-center group cursor-pointer">
    <div
      :class="[
        'w-24 h-24 mx-auto mb-3 overflow-hidden border-2 transition duration-300 shadow-md',
        isCyberpunk
          ? 'rounded-none border-cyber-chrome group-hover:border-cyber-cyan bg-cyber-night'
          : 'rounded-full border-transparent group-hover:border-teal-500 bg-gray-200 dark:bg-gray-800',
      ]"
    >
      <img
        v-if="imagePath"
        :src="tmdb.getImageUrl(imagePath, 'w185')"
        :srcset="tmdb.getProfileSrcset(imagePath)"
        sizes="96px"
        :alt="name"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <div
        v-else
        :class="[
          'w-full h-full flex items-center justify-center',
          isCyberpunk ? 'text-cyber-muted' : 'text-gray-400',
        ]"
      >
        <svg
          class="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
    </div>
    <h4
      :class="[
        'font-bold text-sm transition-colors',
        isCyberpunk
          ? 'text-white font-display group-hover:text-cyber-cyan'
          : 'text-gray-900 dark:text-white group-hover:text-teal-500',
      ]"
    >
      {{ name }}
    </h4>
    <p
      v-if="subtitle"
      :class="[
        'text-xs font-semibold uppercase',
        isCyberpunk ? 'text-cyber-muted font-cyber-mono' : 'text-gray-500',
      ]"
    >
      {{ subtitle }}
    </p>
  </router-link>
</template>
