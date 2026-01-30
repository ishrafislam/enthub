<script setup lang="ts">
import Navbar from "./components/Navbar.vue";
import { useTheme } from "./composables/useTheme";

useTheme();
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300"
  >
    <Navbar />
    <main>
      <router-view />
    </main>
  </div>
</template>
