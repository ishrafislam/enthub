import { ref, watch, type Ref } from 'vue'
import { getFootballMatches } from '../api'
import { ApiError } from '@/lib/apiClient'
import type { LeagueGroup } from '../types'

/** Keyed by date so switching filters or dates back and forth costs no requests. */
const cache = new Map<string, LeagueGroup[]>()

export function useMatches(date: Ref<string>) {
  const groups = ref<LeagueGroup[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load(force = false) {
    const key = date.value
    const cached = cache.get(key)

    if (cached && !force) {
      groups.value = cached
      error.value = null
      return
    }

    loading.value = true
    error.value = null
    try {
      const result = await getFootballMatches(key)
      cache.set(key, result)
      // Ignore responses for a date the user has already navigated away from.
      if (date.value === key) groups.value = result
    } catch (err) {
      if (date.value !== key) return
      error.value = err instanceof ApiError ? err.message : 'Something went wrong loading matches.'
      groups.value = []
    } finally {
      if (date.value === key) loading.value = false
    }
  }

  watch(date, () => load(), { immediate: true })

  return { groups, loading, error, refresh: () => load(true) }
}
