<script setup lang="ts">
import type { StreamSource } from '../types'

defineProps<{ source: StreamSource | null }>()
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-border-subtle bg-black">
    <!--
      No `sandbox` attribute: the provider's docs state it breaks the player's
      required scripts and anti-bot checks.
    -->
    <iframe
      v-if="source"
      :key="source.embedUrl"
      :src="source.embedUrl"
      class="aspect-video w-full"
      frameborder="0"
      scrolling="no"
      referrerpolicy="origin"
      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
      allowfullscreen
    />
    <div
      v-else
      class="flex aspect-video w-full items-center justify-center bg-surface-raised text-sm text-content-muted"
    >
      No stream available for this match.
    </div>
  </div>
</template>
