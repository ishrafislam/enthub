<script setup lang="ts">
import { computed } from 'vue'
import { formatKickoffDateTime } from '@/lib/format'
import type { MatchDetail } from '../types'

const props = defineProps<{ detail: MatchDetail }>()

const match = computed(() => props.detail.match_info)
const info = computed(() => props.detail.info)

/**
 * Whitelisted rows only, so extra or missing API fields degrade quietly
 * instead of breaking the layout.
 */
const rows = computed(() => {
  const score = match.value.score
  const entries: [string, string | null | undefined][] = [
    ['Kick-off', formatKickoffDateTime(match.value.timestamp)],
    ['Status', match.value.status_detail ?? match.value.status],
    ['Competition', match.value.league.name],
    ['Country', match.value.league.country],
    ['Season', match.value.league.season],
    ['Round', match.value.league.round ?? match.value.round],
    ['Venue', info.value?.venue],
    ['Referee', info.value?.referee],
    ['Home manager', info.value?.managers?.home?.name],
    ['Away manager', info.value?.managers?.away?.name],
    ['1st half', score?.period_1],
    ['2nd half', score?.period_2],
    ['Full time', score?.normal_time],
  ]
  return entries.filter(([, value]) => Boolean(value)) as [string, string][]
})
</script>

<template>
  <section class="rounded-xl border border-border-subtle bg-surface-raised p-5">
    <h2 class="mb-4 text-sm font-semibold">Match info</h2>
    <dl class="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      <div v-for="[label, value] in rows" :key="label" class="flex justify-between gap-4 border-b border-border-subtle pb-2">
        <dt class="text-xs text-content-muted">{{ label }}</dt>
        <dd class="text-right text-xs font-medium">{{ value }}</dd>
      </div>
    </dl>
  </section>
</template>
