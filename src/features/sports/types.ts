/** Shapes returned by the SportSRC v2 API, mirrored as observed from live responses. */

export interface Team {
  name: string
  code: string | null
  color: string | null
  badge: string | null
}

export interface Score {
  current: { home: number | null; away: number | null } | null
  period_1: string | null
  period_2: string | null
  normal_time: string | null
  display: string | null
}

/** Raw status strings the API uses. */
export type MatchStatus =
  | 'inprogress'
  | 'notstarted'
  | 'finished'
  | 'postponed'
  | 'canceled'
  | (string & {})

/** The three buckets the UI groups statuses into. */
export type StatusFilter = 'live' | 'upcoming' | 'finished'

export interface League {
  name: string
  country: string | null
  flag: string | null
  logo: string | null
  season?: string | null
  round?: string | null
}

export interface Match {
  id: string
  title: string
  timestamp: number
  status: MatchStatus
  status_detail: string | null
  round: string | null
  has_highlights: boolean
  teams: { home: Team; away: Team }
  score: Score | null
}

/** A league plus its matches, as returned by `type=matches`. */
export interface LeagueGroup {
  league: League
  matches: Match[]
}

export interface StreamSource {
  id: string
  streamNo: number
  embedUrl: string
  source: string
  hd: boolean
  language: string | null
}

export interface Manager {
  name: string
  country: string | null
  photo: string | null
}

export interface MatchInfo {
  venue: string | null
  referee: string | null
  managers: { home: Manager | null; away: Manager | null } | null
}

export interface MatchDetail {
  match_info: Match & {
    league: League
    time_info?: {
      injury_time_1: number | null
      injury_time_2: number | null
      period_start: number | null
    } | null
  }
  sources: StreamSource[] | null
  info: MatchInfo | null
}
