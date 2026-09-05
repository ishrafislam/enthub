import type { LeagueGroup } from './types'

export function localDayRange(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid date')
  const start = new Date(`${date}T00:00:00`)
  if (!Number.isFinite(start.getTime())) throw new Error('Invalid date')
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start: start.getTime(), end: end.getTime() }
}

export function overlappingUtcDates(start: number, end: number): string[] {
  const dates: string[] = []
  const cursor = new Date(start)
  cursor.setUTCHours(0, 0, 0, 0)
  while (cursor.getTime() < end) {
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return dates
}

export function mergeMatchesForDay(responses: LeagueGroup[][], start: number, end: number): LeagueGroup[] {
  const groups = new Map<string, LeagueGroup>()
  const seen = new Set<string>()
  for (const response of responses) {
    for (const group of response) {
      const key = JSON.stringify([group.league.country, group.league.name, group.league.season ?? null])
      for (const match of group.matches) {
        if (!(match.timestamp >= start && match.timestamp < end) || seen.has(match.id)) continue
        seen.add(match.id)
        let target = groups.get(key)
        if (!target) {
          target = { league: group.league, matches: [] }
          groups.set(key, target)
        }
        target.matches.push(match)
      }
    }
  }
  return [...groups.values()]
}

/** Cache UTC responses so adjacent local dates can reuse their overlapping data. */
export function createMatchLoader(fetchDate: (date: string) => Promise<LeagueGroup[]>) {
  const cache = new Map<string, LeagueGroup[]>()
  const pending = new Map<string, Promise<LeagueGroup[]>>()

  function loadUtcDate(date: string, force: boolean): Promise<LeagueGroup[]> {
    const active = pending.get(date)
    if (active) return active
    const cached = cache.get(date)
    if (!force && cached) return Promise.resolve(cached)
    const request = Promise.resolve().then(() => fetchDate(date)).then((result) => {
      cache.set(date, result)
      return result
    }).finally(() => pending.delete(date))
    pending.set(date, request)
    return request
  }

  return async (date: string, force = false): Promise<LeagueGroup[]> => {
    const { start, end } = localDayRange(date)
    const responses = await Promise.all(overlappingUtcDates(start, end).map((day) => loadUtcDate(day, force)))
    return mergeMatchesForDay(responses, start, end)
  }
}
