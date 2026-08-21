<script setup lang="ts">
defineProps<{ message: string }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="rounded-xl border border-border-subtle bg-surface-raised px-6 py-10 text-center">
    <p class="text-sm text-content">{{ message }}</p>
    <button
      type="button"
      class="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-surface transition hover:bg-brand-strong"
      @click="$emit('retry')"
    >
      Try again
    </button>
  </div>
</template>
