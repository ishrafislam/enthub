<script setup lang="ts">
import { computed } from 'vue'
import TeamBadge from './TeamBadge.vue'
import LiveBadge from './LiveBadge.vue'
import { formatKickoffDateTime } from '@/lib/format'
import { isFinished, isLive } from '../status'
import type { MatchDetail } from '../types'

const props = defineProps<{ detail: MatchDetail }>()

const match = computed(() => props.detail.match_info)
const live = computed(() => isLive(match.value))
const showScore = computed(() => live.value || isFinished(match.value))
</script>

<template>
  <section class="rounded-xl border border-border-subtle bg-surface-raised p-5">
    <div class="mb-4 flex flex-wrap items-center justify-center gap-2 text-xs text-content-muted">
      <img
        v-if="match.league.logo"
        :src="match.league.logo"
        :alt="match.league.name"
        loading="lazy"
        class="size-4 object-contain"
      />
      <span class="font-medium text-content">{{ match.league.name }}</span>
      <span v-if="match.league.round">· {{ match.league.round }}</span>
      <span v-if="match.league.season">· {{ match.league.season }}</span>
    </div>

    <div class="grid grid-cols-3 items-center gap-3">
      <div v-for="side in ['home'] as const" :key="side" class="flex flex-col items-center gap-2 text-center">
        <TeamBadge :team="match.teams.home" size="lg" />
        <span class="text-sm font-semibold">{{ match.teams.home.name }}</span>
      </div>

      <div class="flex flex-col items-center gap-2">
        <LiveBadge v-if="live" :label="match.status_detail" />
        <span v-if="showScore" class="text-3xl font-bold tabular-nums">
          {{ match.score?.current?.home ?? 0 }} - {{ match.score?.current?.away ?? 0 }}
        </span>
        <span v-else class="text-center text-sm font-medium text-content-muted">
          {{ formatKickoffDateTime(match.timestamp) }}
        </span>
        <span v-if="!live && match.status_detail" class="text-xs text-content-muted">
          {{ match.status_detail }}
        </span>
      </div>

      <div class="flex flex-col items-center gap-2 text-center">
        <TeamBadge :team="match.teams.away" size="lg" />
        <span class="text-sm font-semibold">{{ match.teams.away.name }}</span>
      </div>
    </div>
  </section>
</template>
