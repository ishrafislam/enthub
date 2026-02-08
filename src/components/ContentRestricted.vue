<script setup lang="ts">
import { useTheme } from "../composables/useTheme";

const { isCyberpunk } = useTheme();

defineProps<{
  title?: string;
  message?: string;
}>();
</script>

<template>
  <div
    :class="[
      'min-h-[60vh] flex flex-col items-center justify-center px-4 text-center',
      isCyberpunk ? 'bg-cyber-black' : '',
    ]"
  >
    <div
      :class="[
        'w-20 h-20 mb-6 flex items-center justify-center',
        isCyberpunk
          ? 'border-2 border-cyber-red bg-cyber-night'
          : 'rounded-full bg-gray-100 dark:bg-gray-800',
      ]"
    >
      <svg
        :class="['w-10 h-10', isCyberpunk ? 'text-cyber-red' : 'text-gray-400']"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
        />
      </svg>
    </div>

    <h1
      :class="[
        'text-2xl md:text-3xl font-bold mb-3',
        isCyberpunk
          ? 'text-cyber-red font-display uppercase tracking-wider'
          : 'text-gray-900 dark:text-white',
      ]"
    >
      <span v-if="isCyberpunk" class="mr-2">[ACCESS_DENIED]</span>
      {{ title || "Content Not Available" }}
    </h1>

    <p
      :class="[
        'text-lg mb-8 max-w-md',
        isCyberpunk
          ? 'text-cyber-muted font-display'
          : 'text-gray-600 dark:text-gray-400',
      ]"
    >
      {{
        message ||
        "This content is restricted and cannot be displayed."
      }}
    </p>

    <router-link
      to="/"
      :class="[
        'inline-flex items-center gap-2 px-6 py-3 font-semibold transition',
        isCyberpunk
          ? 'bg-transparent border border-cyber-cyan text-cyber-cyan font-display uppercase tracking-wider hover:bg-cyber-cyan hover:text-cyber-black'
          : 'bg-teal-500 hover:bg-teal-600 text-white rounded-full',
      ]"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
      Go Home
    </router-link>
  </div>
</template>
