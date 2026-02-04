<script setup lang="ts">
import { useTheme } from "../composables/useTheme";

const { theme } = useTheme();
</script>

<template>
  <div
    class="flex items-center rounded-full p-1"
    :class="
      theme === 'cyberpunk'
        ? 'bg-cyber-night border border-cyber-cyan/30'
        : 'bg-gray-200 dark:bg-gray-800'
    "
  >
    <!-- Light Mode -->
    <button
      :class="{
        'bg-white text-yellow-500 shadow-sm': theme === 'light',
        'text-gray-500 dark:text-gray-400': theme !== 'light',
      }"
      class="p-1.5 rounded-full transition-all duration-200"
      title="Light Mode"
      @click="theme = 'light'"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
    </button>

    <!-- System Preference -->
    <button
      :class="{
        'bg-white text-blue-500 shadow-sm': theme === 'system',
        'text-gray-500 dark:text-gray-400': theme !== 'system',
      }"
      class="p-1.5 rounded-full transition-all duration-200"
      title="System Preference"
      @click="theme = 'system'"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
      </svg>
    </button>

    <!-- Dark Mode -->
    <button
      :class="{
        'bg-gray-600 text-white shadow-sm': theme === 'dark',
        'text-gray-500 dark:text-gray-400': theme !== 'dark',
      }"
      class="p-1.5 rounded-full transition-all duration-200"
      title="Dark Mode"
      @click="theme = 'dark'"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    </button>

    <!-- Cyberpunk Mode -->
    <button
      :class="{
        'bg-cyber-cyan text-cyber-black shadow-sm shadow-cyber-cyan/50':
          theme === 'cyberpunk',
        'text-gray-500 dark:text-gray-400': theme !== 'cyberpunk',
      }"
      class="p-1.5 rounded-full transition-all duration-200"
      title="Cyberpunk Mode"
      @click="theme = 'cyberpunk'"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    </button>
  </div>
</template>
