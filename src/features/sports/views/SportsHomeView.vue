<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MatchFilters from '../components/MatchFilters.vue'
import MatchList from '../components/MatchList.vue'
import MatchCardSkeleton from '../components/MatchCardSkeleton.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useMatches } from '../composables/useMatches'
import { bucketOf } from '../status'
import { todayDateValue } from '@/lib/format'
import type { LeagueGroup, StatusFilter } from '../types'

const route = useRoute()
const router = useRouter()

const VALID_STATUSES: StatusFilter[] = ['live', 'upcoming', 'finished']

const date = computed(() => (route.query.date as string) || todayDateValue())
const status = computed<StatusFilter>(() => {
  const value = route.query.status as StatusFilter
  return VALID_STATUSES.includes(value) ? value : autoStatus.value
})

const { groups, loading, error, refresh } = useMatches(date)

/** Default tab: Live when something is live, otherwise Upcoming. */
const autoStatus = ref<StatusFilter>('upcoming')
watch(groups, (value) => {
  if (route.query.status) return
  autoStatus.value = countFor(value, 'live') > 0 ? 'live' : 'upcoming'
})

function countFor(source: LeagueGroup[], bucket: StatusFilter): number {
  return source.reduce(
    (total, group) => total + group.matches.filter((m) => bucketOf(m.status) === bucket).length,
    0,
  )
}

const counts = computed<Record<StatusFilter, number>>(() => ({
  live: countFor(groups.value, 'live'),
  upcoming: countFor(groups.value, 'upcoming'),
  finished: countFor(groups.value, 'finished'),
}))

const filteredGroups = computed<LeagueGroup[]>(() =>
  groups.value
    .map((group) => ({
      ...group,
      matches: group.matches
        .filter((match) => bucketOf(match.status) === status.value)
        .sort((a, b) => a.timestamp - b.timestamp),
    }))
    .filter((group) => group.matches.length > 0),
)

function updateQuery(patch: Record<string, string>) {
  router.push({ query: { ...route.query, ...patch } })
}

// Live scores go stale fast; refresh while the Live tab is open and visible.
let timer: number | undefined
function tick() {
  if (status.value === 'live' && document.visibilityState === 'visible') refresh()
}
onMounted(() => {
  timer = window.setInterval(tick, 30_000)
})
onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  <div>
    <h1 class="mb-1 text-2xl font-bold tracking-tight">Football</h1>
    <p class="mb-6 text-sm text-content-muted">Live scores, fixtures and streams.</p>

    <MatchFilters
      :status="status"
      :date="date"
      :counts="counts"
      @update:status="updateQuery({ status: $event })"
      @update:date="updateQuery({ date: $event })"
    />

    <MatchCardSkeleton v-if="loading && groups.length === 0" />
    <ErrorState v-else-if="error" :message="error" @retry="refresh" />
    <EmptyState
      v-else-if="filteredGroups.length === 0"
      :message="`No ${status} matches for this date.`"
    />
    <MatchList v-else :groups="filteredGroups" />
  </div>
</template>
