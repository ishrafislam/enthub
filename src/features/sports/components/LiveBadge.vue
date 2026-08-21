<script setup lang="ts">
defineProps<{ label?: string | null }>()
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full bg-live/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-live"
  >
    <span class="size-1.5 animate-pulse rounded-full bg-live" />
    {{ label || 'Live' }}
  </span>
</template>
