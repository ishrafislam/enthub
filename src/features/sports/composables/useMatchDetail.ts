import { ref, watch, type Ref } from 'vue'
import { getMatchDetail } from '../api'
import { ApiError } from '@/lib/apiClient'
import type { MatchDetail } from '../types'

export function useMatchDetail(id: Ref<string>) {
  const detail = ref<MatchDetail | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const notFound = ref(false)

  async function load() {
    const key = id.value
    loading.value = true
    error.value = null
    notFound.value = false
    try {
      const result = await getMatchDetail(key)
      if (id.value === key) detail.value = result
    } catch (err) {
      if (id.value !== key) return
      detail.value = null
      if (err instanceof ApiError && (err.status === 404 || err.status === 400)) {
        notFound.value = true
      } else {
        error.value = err instanceof ApiError ? err.message : 'Something went wrong loading this match.'
      }
    } finally {
      if (id.value === key) loading.value = false
    }
  }

  watch(id, load, { immediate: true })

  return { detail, loading, error, notFound, refresh: load }
}
