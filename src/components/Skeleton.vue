<script setup lang="ts">
defineProps<{
  className?: string;
}>();
</script>

<template>
  <div
    :class="[
      'animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg',
      className,
    ]"
  ></div>
</template>
