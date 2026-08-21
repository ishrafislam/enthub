<script setup lang="ts">
defineProps<{ message: string }>()
</script>

<template>
  <div class="rounded-xl border border-dashed border-border-subtle px-6 py-12 text-center text-sm text-content-muted">
    {{ message }}
  </div>
</template>
