<script setup lang="ts">
import type { StreamSource } from '../types'

defineProps<{ sources: StreamSource[]; activeId: string | null }>()
defineEmits<{ select: [StreamSource] }>()
</script>

<template>
  <aside class="rounded-xl border border-border-subtle bg-surface-raised p-3">
    <h2 class="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-content-muted">
      Sources
      <span class="tabular-nums">({{ sources.length }})</span>
    </h2>

    <p v-if="sources.length === 0" class="px-1 pb-2 text-sm text-content-muted">
      No sources listed.
    </p>

    <ul v-else class="max-h-[60vh] space-y-1 overflow-y-auto lg:max-h-[calc(100vh-16rem)]">
      <li v-for="source in sources" :key="source.id">
        <button
          type="button"
          class="w-full rounded-lg border px-3 py-2 text-left transition"
          :class="
            source.id === activeId
              ? 'border-brand/60 bg-brand/10'
              : 'border-transparent hover:bg-surface-hover'
          "
          @click="$emit('select', source)"
        >
          <span class="flex items-center justify-between gap-2">
            <span class="truncate text-sm font-medium capitalize">
              {{ source.source }} {{ source.streamNo }}
            </span>
            <span
              v-if="source.hd"
              class="shrink-0 rounded bg-surface-hover px-1.5 py-0.5 text-[10px] font-bold text-brand"
            >
              HD
            </span>
          </span>
          <span
            v-if="source.language && source.language !== 'Unknown'"
            class="mt-0.5 block text-xs text-content-muted"
          >
            {{ source.language }}
          </span>
        </button>
      </li>
    </ul>
  </aside>
</template>
