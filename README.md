# EntHub

Entertainment hub for Movies/TV, Sports and Games. This build ships the **Sports**
vertical only (football): a match list and a match page with a stream player.

Stack: Vite + Vue 3 (`<script setup>`, TypeScript), vue-router, Tailwind CSS v4, bun.

## Setup

```bash
bun install
echo 'SPORTSRC_API_KEY=your_key_here' > .env.local
bun run dev
```

Open http://localhost:5173.

## API key handling

Sports data comes from the [SportSRC v2 API](https://sportsrc.org/v2/#docs).
The browser never talks to the API directly: it calls `/api/...`, and the Vite dev
server proxies to `https://api.sportsrc.org/v2/...` while attaching the
`X-API-KEY` header (see `vite.config.ts`). The key stays out of the client bundle.

**Production needs an equivalent server-side proxy** — a Vercel/Netlify function or a
Cloudflare Worker that forwards `/api/*` to the same target with the key header.
`bun run build` alone produces a static bundle with no proxy, so the deployed site
will get "Missing API Key" until that function exists.

The free plan allows 1,000 requests/day (resets midnight UTC). To stay well inside it,
the app fetches one `type=matches` response per date and filters Live/Upcoming/Finished
client-side, caches responses per date in memory, and only polls (every 30s) while the
Live tab is open and the browser tab is visible.

## Routes

| Route | Page |
| --- | --- |
| `/` | redirects to `/sports` |
| `/sports?status=live&date=YYYY-MM-DD` | football match list, grouped by league |
| `/sports/match/:id` | match detail + stream player and source list |

## Layout

```
src/
  lib/            apiClient (single fetch chokepoint), date formatting
  components/     app shell + shared UI states
  features/sports/
    api.ts        typed endpoint wrappers
    types.ts      API response shapes
    status.ts     raw status -> Live/Upcoming/Finished buckets
    composables/  useMatches, useMatchDetail
    components/   cards, filters, stream player, source list
    views/        SportsHomeView, MatchDetailView
```

Movies/TV and Games are nav placeholders; they get their own `src/features/*` folder
and routes when built.

## Notes

- The stream `<iframe>` deliberately has **no `sandbox` attribute** — the provider's docs
  state it breaks the player's scripts and anti-bot checks. Streams carry provider ads.
- Premium endpoints (lineups, stats, incidents, h2h, standings, odds, highlights) are not
  used on the free plan.
