<script setup lang="ts">
import { computed } from 'vue'
import TeamBadge from './TeamBadge.vue'
import LiveBadge from './LiveBadge.vue'
import { formatKickoffTime } from '@/lib/format'
import { isFinished, isLive, isOff } from '../status'
import type { Match } from '../types'

const props = defineProps<{ match: Match }>()

const live = computed(() => isLive(props.match))
const showScore = computed(() => live.value || isFinished(props.match))
const scoreLine = computed(() => {
  const current = props.match.score?.current
  if (!current) return props.match.score?.display ?? '-'
  return `${current.home ?? 0} - ${current.away ?? 0}`
})
const rightLabel = computed(() => {
  if (isOff(props.match)) return props.match.status_detail ?? props.match.status
  return formatKickoffTime(props.match.timestamp)
})
</script>

<template>
  <RouterLink
    :to="{ name: 'sports-match', params: { id: match.id } }"
    class="block rounded-xl border border-border-subtle bg-surface-raised p-4 transition hover:border-brand/40 hover:bg-surface-hover"
  >
    <div class="mb-3 flex items-center justify-between gap-2">
      <LiveBadge v-if="live" :label="match.status_detail" />
      <span v-else class="truncate text-xs text-content-muted">{{ match.round ?? '' }}</span>
      <span class="shrink-0 text-xs font-medium text-content-muted">{{ rightLabel }}</span>
    </div>

    <div class="space-y-2">
      <div
        v-for="side in ['home', 'away'] as const"
        :key="side"
        class="flex items-center gap-3"
      >
        <TeamBadge :team="match.teams[side]" />
        <span class="min-w-0 flex-1 truncate text-sm font-medium">{{ match.teams[side].name }}</span>
        <span v-if="showScore" class="text-sm font-bold tabular-nums">
          {{ match.score?.current?.[side] ?? 0 }}
        </span>
      </div>
    </div>

    <div v-if="showScore" class="sr-only">{{ scoreLine }}</div>
  </RouterLink>
</template>
