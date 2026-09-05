import { computed, ref, type Ref } from 'vue'
import { todayDateValue } from '../../../lib/format'

export function useSelectedDate(explicitDate: Ref<string | undefined>) {
  const today = ref(todayDateValue())
  const date = computed(() => explicitDate.value || today.value)
  function updateToday(): boolean {
    const previous = date.value
    today.value = todayDateValue()
    return date.value !== previous
  }
  return { date, updateToday }
}
