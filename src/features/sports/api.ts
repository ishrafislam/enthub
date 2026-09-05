import { request } from '../../lib/apiClient'
import type { LeagueGroup, MatchDetail } from './types'

export const FOOTBALL = 'football'

export function getFootballMatches(date?: string): Promise<LeagueGroup[]> {
  const params: Record<string, string> = { type: 'matches', sport: FOOTBALL }
  if (date) params.date = date
  return request<LeagueGroup[]>(params)
}

export function getMatchDetail(id: string): Promise<MatchDetail> {
  return request<MatchDetail>({ type: 'detail', id })
}
