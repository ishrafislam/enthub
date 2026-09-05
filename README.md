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

In production, `server.js` does the same job: it serves the built SPA from `dist/`
and proxies `/api` upstream with the key header, so the client contract is identical
in both environments. Deploy it as a web service, not a static site — a static bundle
has no proxy and would get "Missing API Key".

The free plan allows 1,000 requests/day (resets midnight UTC). To stay well inside it,
the app fetches each UTC date overlapping the visitor's selected local day (usually
two requests), merges and filters matches by local kickoff date, then filters
Live/Upcoming/Finished client-side. It caches raw responses per UTC date in memory,
shares pending requests, and only polls (every 30s) while the
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

## Deploying to Render

The repo ships a `render.yaml` blueprint: one **web service** running `server.js`,
which serves `dist/` and proxies `/api`.

1. Render dashboard → **New → Blueprint** → connect this repo. Render reads `render.yaml`.
2. When prompted, paste `SPORTSRC_API_KEY` (declared `sync: false`, so it is never committed).
3. Deploy. Build runs `npm install && npm run build`, start runs `node server.js`.

Render uses the Node runtime and `package-lock.json`; bun is for local development only.
Both lockfiles are committed and kept in sync when dependencies change.

Verify after deploy:

```bash
curl https://<your-service>.onrender.com/api/?type=sports   # JSON, not "Missing API Key"
curl -o /dev/null -w '%{http_code}\n' https://<your-service>.onrender.com/sports/match/x  # 200 via SPA fallback
```

Free-tier caveats: the service spins down after ~15 minutes idle (first request then
takes ~50s), and the 1,000 requests/day quota is shared across all visitors — each open
Live tab polls 120 times/hour, usually making up to 240 requests/hour per visitor
(plus initial loads, date changes, and visibility refreshes). Raise the poll interval
in `SportsHomeView.vue` if that bites. Dates and kickoff times follow the visitor's
timezone; the default date rolls over at local midnight on the next timer tick or
when the page becomes visible. Explicitly selected dates stay fixed.
If the stream iframe shows `ACCESS DENIED` in production but works locally, that is the
stream provider gating Render's egress IP, not this app.
