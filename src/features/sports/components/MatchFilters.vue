<script setup lang="ts">
import { STATUS_FILTERS } from '../status'
import type { StatusFilter } from '../types'

defineProps<{ status: StatusFilter; date: string; counts: Record<StatusFilter, number> }>()
defineEmits<{ 'update:status': [StatusFilter]; 'update:date': [string] }>()
</script>

<template>
  <div class="mb-6 flex flex-wrap items-center gap-3">
    <div class="flex rounded-lg border border-border-subtle bg-surface-raised p-1">
      <button
        v-for="filter in STATUS_FILTERS"
        :key="filter.value"
        type="button"
        class="rounded-md px-3 py-1.5 text-sm font-medium transition"
        :class="
          status === filter.value
            ? 'bg-brand text-surface'
            : 'text-content-muted hover:text-content'
        "
        @click="$emit('update:status', filter.value)"
      >
        {{ filter.label }}
        <span class="ml-1 tabular-nums opacity-70">{{ counts[filter.value] }}</span>
      </button>
    </div>

    <input
      type="date"
      :value="date"
      class="rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-content [color-scheme:dark]"
      @change="$emit('update:date', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
