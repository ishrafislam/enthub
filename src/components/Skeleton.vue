<script setup lang="ts">
defineProps<{
  className?: string;
}>();
</script>

<template>
  <div
    :class="[
      'relative overflow-hidden bg-gray-200 dark:bg-gray-800 rounded-lg',
      className,
    ]"
  >
    <div
      class="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent"
    ></div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
</style>
