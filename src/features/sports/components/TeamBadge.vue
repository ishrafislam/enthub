<script setup lang="ts">
import { ref } from 'vue'
import type { Team } from '../types'

withDefaults(defineProps<{ team: Team; size?: 'sm' | 'lg' }>(), { size: 'sm' })

const failed = ref(false)
</script>

<template>
  <div
    class="flex shrink-0 items-center justify-center rounded-full bg-surface-hover"
    :class="size === 'lg' ? 'size-16' : 'size-8'"
  >
    <img
      v-if="team.badge && !failed"
      :src="team.badge"
      :alt="team.name"
      loading="lazy"
      class="size-full object-contain p-1"
      @error="failed = true"
    />
    <span v-else class="text-[10px] font-semibold text-content-muted">
      {{ team.code ?? team.name.slice(0, 3).toUpperCase() }}
    </span>
  </div>
</template>
