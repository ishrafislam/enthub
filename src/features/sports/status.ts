import type { Match, MatchStatus, StatusFilter } from './types'

const LIVE_STATUSES = new Set<MatchStatus>(['inprogress', 'live', 'halftime'])
const FINISHED_STATUSES = new Set<MatchStatus>(['finished', 'ended', 'aet', 'ap'])

export function bucketOf(status: MatchStatus): StatusFilter {
  if (LIVE_STATUSES.has(status)) return 'live'
  if (FINISHED_STATUSES.has(status)) return 'finished'
  return 'upcoming'
}

export function isLive(match: Match): boolean {
  return bucketOf(match.status) === 'live'
}

export function isFinished(match: Match): boolean {
  return bucketOf(match.status) === 'finished'
}

/** Postponed and canceled matches keep their own label instead of a kickoff time. */
export function isOff(match: Match): boolean {
  return match.status === 'postponed' || match.status === 'canceled'
}

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'live', label: 'Live' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'finished', label: 'Finished' },
]
