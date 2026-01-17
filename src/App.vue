<script setup lang="ts">
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans">
    <Navbar />
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center py-20">
        <h1 class="text-4xl font-bold mb-4">Welcome to EntHub</h1>
        <p class="text-gray-600 text-lg">Your personal media tracker.</p>
      </div>
    </main>
  </div>
</template>

<style>
/* Global styles if needed, but Tailwind handles most */
</style>