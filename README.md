# EntHub

A personal media tracking web application for movies and TV shows. Discover trending content, search the TMDB database, manage watchlists, and track watched history with passwordless email authentication.

## Features

### Core Features
- **Discovery & Search:** Browse trending content and search movies, TV shows, and people
- **Detailed Views:** Movie/TV details with cast, crew, trailers, and ratings
- **Collections:** Browse movie franchises and collections
- **Person Pages:** View actor/director filmographies
- **TV Seasons:** Browse season and episode details
- **Watchlist:** Save items to watch later
- **Watched History:** Track what you've watched with optional ratings
- **Passwordless Auth:** Secure email OTP authentication

### Theme Options
| Theme | Description |
|-------|-------------|
| Light | Clean light theme |
| Dark | Dark theme for low-light environments |
| System | Auto-switches based on OS preference |
| Cyberpunk | Futuristic neon aesthetic inspired by Cyberpunk 2077 |

## Tech Stack

### Frontend
- **Framework:** Vue 3 (Composition API, `<script setup>`)
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript
- **Testing:** Vitest + Vue Test Utils

### Backend
- **Platform:** Convex (serverless database + functions)
- **Real-time:** Native Convex reactivity

### External Services
- **Media Data:** TMDB API v3
- **Email:** Resend

## Project Structure

```
enthub/
├── src/
│   ├── views/              # Page components
│   │   ├── Home.vue        # Trending content
│   │   ├── Search.vue      # Search results
│   │   ├── Details.vue     # Movie/TV details
│   │   ├── Collection.vue  # Movie collections
│   │   ├── Person.vue      # Actor/director pages
│   │   ├── Season.vue      # TV season details
│   │   ├── Watchlist.vue   # User watchlist
│   │   ├── Watched.vue     # Watch history
│   │   └── Login.vue       # Authentication
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.vue
│   │   ├── MediaCard.vue
│   │   ├── PersonCard.vue
│   │   ├── CollectionCard.vue
│   │   ├── SearchBar.vue
│   │   ├── Skeleton.vue
│   │   └── ThemeToggle.vue
│   ├── composables/        # Vue composables
│   │   ├── useConvex.ts    # Convex query/mutation hooks
│   │   └── useTheme.ts     # Theme management
│   ├── services/
│   │   └── tmdb.ts         # TMDB API client
│   ├── store/
│   │   └── auth.ts         # Auth state management
│   ├── types/
│   │   └── tmdb.ts         # TypeScript interfaces
│   ├── router/
│   │   └── index.ts        # Vue Router config
│   ├── assets/css/
│   │   └── cyberpunk.css   # Cyberpunk theme styles
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── convex/                 # Backend functions
│   ├── schema.ts           # Database schema
│   ├── auth.ts             # Authentication mutations
│   ├── lists.ts            # Watchlist/watched queries & mutations
│   ├── actions.ts          # Email sending via Resend
│   └── users.ts            # User queries
└── public/
```

## Database Schema

```typescript
// Users
users: {
  email: string
  name?: string
}

// Auth codes for OTP
authCodes: {
  email: string
  code: string
  attempts: number
  expiresAt: number
}

// Watchlist items
watchlist: {
  userId: Id<"users">
  tmdbId: number
  mediaType: "movie" | "tv"
  title: string
  posterPath?: string
  addedAt: number
}

// Watched history
watched: {
  userId: Id<"users">
  tmdbId: number
  mediaType: "movie" | "tv"
  title: string
  posterPath?: string
  watchedAt: number
  rating?: number  // 1-10
}
```

## Development

### Prerequisites
- Node.js 20+
- npm

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   VITE_CONVEX_URL=https://your-deployment.convex.cloud
   VITE_TMDB_READ_TOKEN=your_tmdb_read_access_token
   ```

4. Set Convex environment variables (via Convex Dashboard):
   - `RESEND_API_KEY`: Your Resend API key

### Commands

```bash
# Start development server
npm run dev

# Start Convex backend (run in separate terminal)
npx convex dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Deploy Convex to production
npx convex deploy
```

## Deployment

### Backend (Convex)

1. Deploy to production:
   ```bash
   npx convex deploy
   ```

2. Configure production secrets in Convex Dashboard:
   - `RESEND_API_KEY`: Your production Resend API key

### Frontend (Render or similar)

1. Build settings:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

2. Environment variables:
   - `VITE_CONVEX_URL`: Production Convex URL
   - `VITE_TMDB_READ_TOKEN`: TMDB API token

3. SPA routing (Render):
   - Add rewrite rule: `/*` → `/index.html`

## Architecture

### Frontend-Backend Communication
- `useConvexQuery()`: Real-time subscriptions via `ConvexClient.onUpdate()`
- `useConvexMutation()`: One-off mutations via `ConvexHttpClient.mutation()`
- Pass `computed()` args to `useConvexQuery()` for reactivity

### Auth Flow
1. User enters email on Login page
2. Backend generates 6-digit OTP, stores in `authCodes`, sends via Resend
3. User enters OTP
4. Backend validates code, creates/finds user, returns userId
5. Frontend stores userId in localStorage
6. Router guard protects authenticated routes

### TMDB Integration
- Centralized API client in `src/services/tmdb.ts`
- TypeScript interfaces in `src/types/tmdb.ts`
- Bearer token auth via `VITE_TMDB_READ_TOKEN`
- Responsive images with srcset helpers

## Styling

- Tailwind CSS with dark mode via `dark:` prefix
- Primary color: teal-500
- Cyberpunk theme: Neon cyan (#55ead4), yellow (#f3e600), red (#c5003c)
- Consistent spacing: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Media cards: 2/3 aspect ratio, rounded-2xl corners

### Cyberpunk Theme
- Futuristic typography (Rajdhani, Orbitron, Share Tech Mono)
- Neon glow effects and scan lines
- Glitch animations on hover
- Angular UI elements with corner accents
- Respects `prefers-reduced-motion`

## License

Private project.
