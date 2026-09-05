import { afterEach, describe, expect, setSystemTime, test } from 'bun:test'
import { effectScope, nextTick, ref } from 'vue'
import { createMatchLoader, localDayRange, mergeMatchesForDay, overlappingUtcDates } from '../src/features/sports/matchDates'
import { useMatches } from '../src/features/sports/composables/useMatches'
import { useSelectedDate } from '../src/features/sports/composables/useSelectedDate'
import type { LeagueGroup, Match } from '../src/features/sports/types'

const originalTimezone = process.env.TZ
afterEach(() => {
  process.env.TZ = originalTimezone
  setSystemTime()
})
function group(id: string, timestamp: number, country = 'France'): LeagueGroup {
  return {
    league: { name: 'League', country, season: '2026', flag: null, logo: null },
    matches: [{ id, timestamp, status: 'notstarted' } as Match],
  }
}
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
const flush = async () => { for (let i = 0; i < 12; i++) await nextTick() }

describe('local date boundaries', () => {
  test('Bangladesh 1 AM belongs only to September 5; midnight boundaries are exact', () => {
    process.env.TZ = 'Asia/Dhaka'
    const { start, end } = localDayRange('2026-09-05')
    expect(new Date(start).toISOString()).toBe('2026-09-04T18:00:00.000Z')
    expect(overlappingUtcDates(start, end)).toEqual(['2026-09-04', '2026-09-05'])
    const responses = [[group('before', start - 1), group('midnight', start), group('one', Date.parse('2026-09-04T19:00:00Z')), group('last', end - 1), group('next', end)]]
    expect(mergeMatchesForDay(responses, start, end).flatMap(g => g.matches.map(m => m.id))).toEqual(['midnight', 'one', 'last'])
    const previous = localDayRange('2026-09-04')
    expect(mergeMatchesForDay(responses, previous.start, previous.end).flatMap(g => g.matches.map(m => m.id))).not.toContain('one')
  })
  test('UTC uses one day and negative offsets include the next UTC day', () => {
    process.env.TZ = 'UTC'
    let range = localDayRange('2026-12-31')
    expect(overlappingUtcDates(range.start, range.end)).toEqual(['2026-12-31'])
    process.env.TZ = 'America/New_York'
    range = localDayRange('2026-12-31')
    expect(overlappingUtcDates(range.start, range.end)).toEqual(['2026-12-31', '2027-01-01'])
    process.env.TZ = 'Asia/Dhaka'
    range = localDayRange('2026-03-01')
    expect(overlappingUtcDates(range.start, range.end)).toEqual(['2026-02-28', '2026-03-01'])
  })
  test('daylight-saving days have 23 or 25 hours', () => {
    process.env.TZ = 'America/New_York'
    const spring = localDayRange('2026-03-08')
    const autumn = localDayRange('2026-11-01')
    expect((spring.end - spring.start) / 3_600_000).toBe(23)
    expect((autumn.end - autumn.start) / 3_600_000).toBe(25)
  })
  test('merges leagues, deduplicates IDs, separates countries, and drops empty groups', () => {
    const first = group('one', 10)
    const responses = [[first, group('outside', 100)], [first, group('two', 20), group('three', 20, 'Spain')]]
    const result = mergeMatchesForDay(responses, 0, 50)
    expect(result.map(g => g.matches.map(m => m.id))).toEqual([['one', 'two'], ['three']])
    expect(first.matches).toHaveLength(1)
    expect(mergeMatchesForDay([[]], 0, 50)).toEqual([])
  })
})

describe('loading and cache', () => {
  test('reuses overlapping UTC dates, shares pending requests, and refreshes all dates', async () => {
    process.env.TZ = 'Asia/Dhaka'
    const calls: string[] = []
    const gate = deferred<LeagueGroup[]>()
    const load = createMatchLoader(async date => { calls.push(date); return gate.promise })
    const first = load('2026-09-05')
    const second = load('2026-09-05')
    await flush()
    expect(calls).toEqual(['2026-09-04', '2026-09-05'])
    gate.resolve([])
    await Promise.all([first, second])
    await load('2026-09-06')
    expect(calls).toEqual(['2026-09-04', '2026-09-05', '2026-09-06'])
    await load('2026-09-05', true)
    expect(calls.slice(3)).toEqual(['2026-09-04', '2026-09-05'])
  })
  test('failed UTC request rejects the whole day and can be retried', async () => {
    process.env.TZ = 'Asia/Dhaka'
    let fail = true
    const load = createMatchLoader(async date => {
      if (date === '2026-09-05' && fail) throw new Error('offline')
      return [group('one', Date.parse('2026-09-04T19:00:00Z'))]
    })
    await expect(load('2026-09-05')).rejects.toThrow('offline')
    fail = false
    expect((await load('2026-09-05')).flatMap(g => g.matches)).toHaveLength(1)
  })
  test('clears old matches and ignores stale successes and failures during A-B-A navigation', async () => {
    const pending: ReturnType<typeof deferred<LeagueGroup[]>>[] = []
    const scope = effectScope()
    const date = ref('2026-09-05')
    const state = scope.run(() => useMatches(date, () => {
      const request = deferred<LeagueGroup[]>()
      pending.push(request)
      return request.promise
    }))!
    try {
      pending[0]!.resolve([group('initial', 1)])
      await flush()
      const refresh = state.refresh()
      date.value = '2026-09-06'
      await flush()
      expect(state.groups.value).toEqual([])
      date.value = '2026-09-05'
      await flush()
      pending[1]!.resolve([group('stale', 1)])
      pending[2]!.reject(new Error('stale failure'))
      await flush()
      expect(state.groups.value).toEqual([])
      expect(state.error.value).toBeNull()
      expect(state.loading.value).toBe(true)
      pending[3]!.resolve([group('current', 1)])
      await flush()
      await refresh
      expect(state.groups.value[0]!.matches[0]!.id).toBe('current')
      expect(state.loading.value).toBe(false)
      const failedRefresh = state.refresh()
      pending[4]!.reject(new Error('offline'))
      await failedRefresh
      expect(state.error.value).not.toBeNull()
      expect(state.groups.value).toEqual([])
    } finally { scope.stop() }
  })
})

test('default date rolls over on clock update; explicit date stays fixed', () => {
  process.env.TZ = 'Asia/Dhaka'
  setSystemTime(new Date('2026-09-04T17:59:59Z'))
  const explicit = ref<string | undefined>()
  const selected = useSelectedDate(explicit)
  expect(selected.date.value).toBe('2026-09-04')
  setSystemTime(new Date('2026-09-04T18:00:00Z'))
  expect(selected.updateToday()).toBe(true)
  expect(selected.date.value).toBe('2026-09-05')
  explicit.value = '2026-09-01'
  setSystemTime(new Date('2026-09-05T18:00:00Z'))
  expect(selected.updateToday()).toBe(false)
  expect(selected.date.value).toBe('2026-09-01')
  explicit.value = undefined
  expect(selected.date.value).toBe('2026-09-06')
})
