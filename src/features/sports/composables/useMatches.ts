import { onScopeDispose, ref, watch, type Ref } from 'vue'
import { getFootballMatches } from '../api'
import { ApiError } from '../../../lib/apiClient'
import type { LeagueGroup } from '../types'
import { createMatchLoader } from '../matchDates'

const loadMatches = createMatchLoader(getFootballMatches)

export function useMatches(date: Ref<string>, loader = loadMatches) {
  const groups = ref<LeagueGroup[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let generation = 0
  let displayedDate: string | undefined
  onScopeDispose(() => { generation++ })

  async function load(force = false) {
    const key = date.value
    const requestGeneration = ++generation
    if (displayedDate !== key) groups.value = []
    displayedDate = key
    const isCurrent = () => generation === requestGeneration && date.value === key

    loading.value = true
    error.value = null
    try {
      const result = await loader(key, force)
      if (isCurrent()) groups.value = result
    } catch (err) {
      if (!isCurrent()) return
      error.value = err instanceof ApiError ? err.message : 'Something went wrong loading matches.'
      groups.value = []
    } finally {
      if (isCurrent()) loading.value = false
    }
  }

  watch(date, () => load(), { immediate: true })

  return { groups, loading, error, refresh: () => load(true) }
}
