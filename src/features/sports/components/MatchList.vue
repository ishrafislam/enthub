<script setup lang="ts">
import MatchCard from './MatchCard.vue'
import type { LeagueGroup } from '../types'

defineProps<{ groups: LeagueGroup[] }>()
</script>

<template>
  <div class="space-y-8">
    <section v-for="group in groups" :key="group.league.name">
      <header class="mb-3 flex items-center gap-2">
        <img
          v-if="group.league.logo"
          :src="group.league.logo"
          :alt="group.league.name"
          loading="lazy"
          class="size-5 object-contain"
        />
        <h2 class="text-sm font-semibold">{{ group.league.name }}</h2>
        <span v-if="group.league.country" class="text-xs text-content-muted">
          {{ group.league.country }}
        </span>
      </header>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MatchCard v-for="match in group.matches" :key="match.id" :match="match" />
      </div>
    </section>
  </div>
</template>
