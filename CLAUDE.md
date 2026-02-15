# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EntHub is a personal media tracking web application for movies and TV shows. Users can discover trending content, search the TMDB database, manage watchlists, and track watched history with passwordless email authentication.

## Development Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Type-check with vue-tsc, then build for production
npm run preview      # Preview production build locally
npx convex dev       # Start Convex backend in development mode (required for backend)
npx convex deploy    # Deploy Convex backend to production
```

**Note:** Run `npx convex dev` in a separate terminal alongside `npm run dev` for full-stack development.

### Testing

```bash
npm run test             # Run vitest in watch mode
npm run test:run         # Run tests once (CI-friendly)
npm run test:ui          # Run tests with browser UI
npm run test:coverage    # Run tests with V8 coverage report
npx vitest run src/services/__tests__/tmdb.test.ts   # Run a single test file
```

Tests use happy-dom environment with globals enabled. Test files live in `__tests__/` directories alongside source (e.g., `src/composables/__tests__/useConvex.test.ts`).

### Linting & Formatting

```bash
npm run lint         # ESLint on src/ and convex/ (.ts, .vue files)
npm run format       # Prettier format src/**/*.{ts,vue}
```

## Architecture

### Tech Stack
- **Frontend:** Vue 3 (Composition API, `<script setup>`), Vite, Tailwind CSS 4, TypeScript
- **Backend:** Convex (serverless database + functions)
- **External APIs:** TMDB (movie/TV data), Resend (transactional email)
- **Auth:** Passwordless email OTP (codes stored in Convex, sent via Resend)
- **Testing:** Vitest + Vue Test Utils + happy-dom

### Key Architectural Patterns

**Frontend-Backend Communication:**
- `src/composables/useConvex.ts` provides `useConvexQuery()` and `useConvexMutation()` hooks
- Queries use real-time subscriptions via `ConvexClient.onUpdate()`
- Mutations use `ConvexHttpClient.mutation()` for one-off calls
- Always pass `computed()` args to `useConvexQuery()` for reactivity

**Auth Flow:**
- `src/store/auth.ts` - Reactive store holding userId in localStorage
- `convex/auth.ts` - `signIn` generates OTP, schedules email; `verifyCode` validates and returns userId
- Router guard in `src/router/index.ts` protects routes with `meta.requiresAuth`

**TMDB Integration:**
- `src/services/tmdb.ts` - Centralized API client with typed methods
- `src/types/tmdb.ts` - TypeScript interfaces for all TMDB responses
- Bearer token auth via `VITE_TMDB_READ_TOKEN` environment variable

### Directory Structure

```
src/
├── views/           # Page components (Home, Search, Details, Collection, Person, Season, Watchlist, Watched, Login)
├── components/      # Reusable UI (Navbar, MediaCard, PersonCard, CollectionCard, SearchBar, Skeleton, ThemeToggle)
├── composables/     # Vue composables (useConvex, useTheme)
├── services/        # External API clients (tmdb.ts)
├── store/           # Reactive state (auth.ts)
├── types/           # TypeScript interfaces (tmdb.ts)
├── router/          # Vue Router config
├── assets/css/      # Theme styles (cyberpunk.css)
└── test/            # Test setup (setup.ts)

convex/
├── schema.ts        # Database schema (users, authCodes, watchlist, watched)
├── auth.ts          # Authentication mutations (signIn, verifyCode)
├── lists.ts         # Watchlist/watched queries and mutations
├── users.ts         # User queries
├── actions.ts       # Convex actions (sendAuthEmail via Resend)
└── _generated/      # Auto-generated API types (don't edit)
```

### Database Schema (Convex)

- **users:** email, name (optional)
- **authCodes:** email, code, attempts, expiresAt (for OTP validation)
- **watchlist:** userId, tmdbId, mediaType, title, posterPath, addedAt
- **watched:** userId, tmdbId, mediaType, title, posterPath, watchedAt, rating (optional, 1-10)

All tables use indexes for efficient queries (e.g., `by_user`, `by_user_media`).

## Environment Variables

```bash
# Frontend (.env)
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_TMDB_READ_TOKEN=your_tmdb_read_access_token

# Backend (set via Convex Dashboard, not in .env)
RESEND_API_KEY=your_resend_api_key
```

## Styling Conventions

- Tailwind CSS with dark mode via `dark:` prefix
- Primary color: teal-500
- Cyberpunk theme available: neon cyan (#55ead4), yellow (#f3e600), red (#c5003c) with custom fonts (Rajdhani, Orbitron, Share Tech Mono)
- Card hover effects: `-translate-y-1`, `scale-110` on images, shadow enhancement
- Consistent spacing: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Media cards use 2/3 aspect ratio with rounded-2xl corners
