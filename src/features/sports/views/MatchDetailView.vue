<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import MatchHeader from '../components/MatchHeader.vue'
import MatchInfoPanel from '../components/MatchInfoPanel.vue'
import StreamPlayer from '../components/StreamPlayer.vue'
import StreamSourceList from '../components/StreamSourceList.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import { useMatchDetail } from '../composables/useMatchDetail'
import type { StreamSource } from '../types'

const props = defineProps<{ id: string }>()

const { detail, loading, error, notFound, refresh } = useMatchDetail(toRef(props, 'id'))

const sources = computed<StreamSource[]>(() => detail.value?.sources ?? [])
const activeSource = ref<StreamSource | null>(null)

watch(sources, (value) => {
  activeSource.value = value[0] ?? null
})

watch(detail, (value) => {
  document.title = value ? `${value.match_info.title} — EntHub` : 'EntHub'
})
</script>

<template>
  <div>
    <RouterLink to="/sports" class="mb-4 inline-block text-sm text-content-muted hover:text-content">
      ← All matches
    </RouterLink>

    <div v-if="loading && !detail" class="flex justify-center py-24">
      <BaseSpinner />
    </div>

    <div v-else-if="notFound" class="py-20 text-center">
      <h1 class="text-xl font-bold">Match not found</h1>
      <p class="mt-2 text-sm text-content-muted">This match may have been removed.</p>
    </div>

    <ErrorState v-else-if="error" :message="error" @retry="refresh" />

    <div v-else-if="detail" class="space-y-6">
      <MatchHeader :detail="detail" />

      <section>
        <div class="grid gap-4 lg:grid-cols-[1fr_320px]">
          <StreamPlayer :source="activeSource" />
          <StreamSourceList
            :sources="sources"
            :active-id="activeSource?.id ?? null"
            @select="activeSource = $event"
          />
        </div>
      </section>

      <MatchInfoPanel :detail="detail" />
    </div>
  </div>
</template>
