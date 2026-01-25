# EntHub Improvements Plan

**Document Version:** 1.2
**Created:** January 22, 2026
**Last Updated:** January 23, 2026
**Project Version:** 0.2.0 (MVP Complete)
**Status:** Production Ready with Enhancement Opportunities

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [New Features Plan](#new-features-plan)
4. [Code Enhancements](#code-enhancements)
5. [Security Enhancements](#security-enhancements)
6. [Performance Optimizations](#performance-optimizations)
7. [Infrastructure Improvements](#infrastructure-improvements)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Priority Matrix](#priority-matrix)

---

## Executive Summary

EntHub is a personal media tracking web application built with Vue 3, TypeScript, Convex, and TMDB API. The MVP is complete with all 5 milestones delivered. This document outlines strategic improvements across new features, code quality, security, and performance to transform EntHub from an MVP into a production-grade application.

**Key Metrics:**
- Current Files: ~29 source files
- Tech Stack: Vue 3 + TypeScript + Vite + Convex
- Authentication: Passwordless email OTP
- External Dependencies: TMDB API, Resend Email
- Target Improvements: 50+ enhancements categorized into 4 priority levels

---

## Project Overview

### Current Architecture

```
Frontend (Vue 3 SPA)
├── Views: Home, Search, Details, Watchlist, Watched, Login
├── Components: Navbar, ThemeToggle, Skeleton
├── Services: TMDB API wrapper
├── Composables: Convex hooks, Theme management
└── Router: Vue Router with auth guards

Backend (Convex Serverless)
├── Queries: List status, watchlist, watched
├── Mutations: Auth (sign in, verify), Lists (toggle, mark)
├── Actions: Email sending via Resend
└── Schema: Users, AuthCodes, Watchlist, Watched

External Services
├── TMDB: Movie/TV data and images
└── Resend: Transactional email delivery
```

### Current Features
- ✅ Trending content discovery
- ✅ Multi-search (movies, TV, people)
- ✅ Detailed media pages with cast/crew
- ✅ Watchlist management
- ✅ Watched history tracking
- ✅ Passwordless email authentication
- ✅ Light/Dark theme support
- ✅ Responsive mobile design

---

## New Features Plan

### Priority 1: Core Feature Extensions

#### 1.1 User Ratings & Reviews System
**Description:** Allow users to rate watched content and write reviews

**Implementation:**
- **Database Schema:**
  ```typescript
  Ratings Table:
  - userId: Id<"users">
  - tmdbId: number
  - mediaType: "movie" | "tv"
  - rating: number (1-10)
  - review?: string (optional text review)
  - createdAt: number
  - updatedAt: number
  - Indexes: by_user, by_user_media
  ```

- **UI Components:**
  - Star rating widget on Details page
  - Review textarea with character limit (500 chars)
  - Edit/delete rating functionality
  - Display user rating alongside TMDB rating

- **Backend Mutations:**
  - `saveRating(userId, tmdbId, rating, review?)`
  - `updateRating(ratingId, rating, review?)`
  - `deleteRating(ratingId)`

**Benefits:** Personalizes tracking, provides memory aids for content

**Estimated Effort:** Medium (3-5 files to modify/create)

---

#### 1.2 TMDB Collection Integration ✅ IMPLEMENTED
**Description:** Display movie collections (franchises) from TMDB and allow users to browse all movies in a collection

**Status:** Completed (January 2026)

**Background:**
TMDB provides collection data for movies that belong to a franchise (e.g., "The Lord of the Rings Collection", "Harry Potter Collection"). This data is already included in the movie details response via the `belongs_to_collection` field.

**TMDB API Reference:**
- **Endpoint:** `GET /collection/{collection_id}`
- **Documentation:** https://developer.themoviedb.org/reference/collection-details

**Response Schema:**
```typescript
interface TMDBCollection {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  parts: TMDBCollectionPart[];
}

interface TMDBCollectionPart {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
}
```

**Implementation:**

- **Movie Details Response (existing):**
  The `belongs_to_collection` field in movie details provides:
  ```typescript
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null
  ```

- **TMDB Service Extension:**
  ```typescript
  // src/services/tmdb.ts
  export const getCollection = (collectionId: number) =>
    fetchTMDB<TMDBCollection>(`/collection/${collectionId}`);
  ```

- **UI Components:**
  1. **Collection Banner on Details Page:**
     - Display collection info when `belongs_to_collection` is present
     - Show collection poster/backdrop as a banner
     - Display collection name (e.g., "Part of The Dark Knight Collection")
     - Clickable link to collection page

  2. **Collection Page (`/collection/:id`):**
     - Hero section with collection backdrop, poster, and overview
     - Grid of all movies in the collection (from `parts` array)
     - Sort by release date (chronological order)
     - Show release year and rating for each movie
     - Indicate which movies user has watched/in watchlist
     - Quick actions to add movies to watchlist

- **Router Configuration:**
  ```typescript
  {
    path: '/collection/:id',
    name: 'collection',
    component: () => import('../views/Collection.vue'),
    meta: { title: 'Collection' }
  }
  ```

- **Files to Create/Modify:**
  - `src/types/tmdb.ts` - Add collection types
  - `src/services/tmdb.ts` - Add getCollection function
  - `src/views/Collection.vue` - New collection page
  - `src/views/Details.vue` - Add collection banner section
  - `src/router/index.ts` - Add collection route

**UI Mockup (Details Page):**
```
┌─────────────────────────────────────────────┐
│ [Movie Details...]                          │
├─────────────────────────────────────────────┤
│ 🎬 Part of The Dark Knight Collection       │
│ ┌────────┐                                  │
│ │ Poster │  Explore all 3 movies →          │
│ └────────┘                                  │
└─────────────────────────────────────────────┘
```

**UI Mockup (Collection Page):**
```
┌─────────────────────────────────────────────┐
│ [Backdrop Image]                            │
│ ┌────────┐  The Dark Knight Collection      │
│ │ Poster │  A gripping trilogy following... │
│ └────────┘  3 movies                        │
├─────────────────────────────────────────────┤
│ ┌─────┐  ┌─────┐  ┌─────┐                   │
│ │ BB  │  │ TDK │  │TDKR │                   │
│ │2005 │  │2008 │  │2012 │                   │
│ │✓    │  │👁️   │  │+    │                   │
│ └─────┘  └─────┘  └─────┘                   │
│ ✓ = watched, 👁️ = in watchlist, + = add     │
└─────────────────────────────────────────────┘
```

**Benefits:**
- Helps users discover related movies in a franchise
- Provides context for movie sequels/prequels
- Easy watchlist management for entire collections
- No database required (data from TMDB)

**Estimated Effort:** Medium (4-5 files to create/modify)

---

#### 1.3 Person Details Page ✅ IMPLEMENTED
**Description:** Display person details (actors, directors, crew) from TMDB and show their filmography

**Status:** Completed (January 2026)

**Background:**
TMDB provides detailed person information including biography, birthday, place of birth, and combined credits (movies and TV shows they've worked on). This allows users to click on cast/crew members from movie/TV details pages and explore their filmography.

**TMDB API Reference:**
- **Person Details:** `GET /person/{person_id}` - https://developer.themoviedb.org/reference/person-details
- **Combined Credits:** `GET /person/{person_id}/combined_credits` - https://developer.themoviedb.org/reference/person-combined-credits

**Response Schema:**
```typescript
interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  gender: number; // 0: Not specified, 1: Female, 2: Male, 3: Non-binary
  known_for_department: string;
  profile_path: string | null;
  popularity: number;
  place_of_birth: string | null;
  also_known_as: string[];
  homepage: string | null;
  imdb_id: string | null;
}

interface PersonCombinedCredits {
  id: number;
  cast: PersonCastCredit[];
  crew: PersonCrewCredit[];
}

interface PersonCastCredit {
  id: number;
  title?: string;        // For movies
  name?: string;         // For TV shows
  media_type: 'movie' | 'tv';
  character: string;
  release_date?: string; // For movies
  first_air_date?: string; // For TV shows
  poster_path: string | null;
  vote_average: number;
  popularity: number;
}

interface PersonCrewCredit {
  id: number;
  title?: string;
  name?: string;
  media_type: 'movie' | 'tv';
  job: string;
  department: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  vote_average: number;
  popularity: number;
}
```

**Implementation:**

- **TMDB Service Extension:**
  ```typescript
  // src/services/tmdb.ts
  export const getPersonDetails = (personId: number) =>
    fetchTMDB<PersonDetails>(`/person/${personId}`, {
      append_to_response: 'combined_credits'
    });
  ```

- **UI Components:**
  1. **Person Page (`/person/:id`):**
     - Hero section with profile image and basic info
     - Biography with expandable "Read More"
     - Personal details sidebar (birthday, place of birth, known for)
     - Filmography section with Acting and Crew tabs
     - Sort by release date (newest first) or popularity
     - Click on any title to navigate to movie/TV details

  2. **Clickable Cast/Crew in Details Page:**
     - Wrap cast/crew cards with router-link to `/person/:id`
     - Add hover effect to indicate clickability

- **Router Configuration:**
  ```typescript
  {
    path: '/person/:id',
    name: 'Person',
    component: () => import('../views/Person.vue'),
    meta: { title: 'Person' }
  }
  ```

- **Files to Create/Modify:**
  - `src/types/tmdb.ts` - Add person-related types
  - `src/services/tmdb.ts` - Add getPersonDetails function
  - `src/views/Person.vue` - New person details page
  - `src/views/Details.vue` - Make cast/crew clickable
  - `src/router/index.ts` - Add person route

**UI Mockup (Person Page):**
```
┌─────────────────────────────────────────────────┐
│ [Profile Image]   Robert Downey Jr.             │
│                   Known for: Acting             │
│                   Born: April 4, 1965           │
│                   Birthplace: Manhattan, NYC    │
├─────────────────────────────────────────────────┤
│ Biography                                       │
│ Robert John Downey Jr. is an American actor...  │
│ [Read More]                                     │
├─────────────────────────────────────────────────┤
│ Known For                                       │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐               │
│ │Iron │ │Avng │ │Shrlk│ │Oppn │               │
│ │Man  │ │ EG  │ │Holms│ │heimr│               │
│ └─────┘ └─────┘ └─────┘ └─────┘               │
├─────────────────────────────────────────────────┤
│ Filmography                                     │
│ [Acting ▼] [Crew]     Sort: [Newest First ▼]   │
│ ─────────────────────────────────────────────── │
│ 2023  Oppenheimer          Lewis Strauss       │
│ 2019  Avengers: Endgame    Tony Stark / Iron..│
│ 2018  Avengers: Infinity   Tony Stark / Iron..│
│ ...                                             │
└─────────────────────────────────────────────────┘
```

**Benefits:**
- Deep exploration of cast/crew filmography
- Discover more content from favorite actors/directors
- Natural navigation flow from movie → person → more movies
- No database required (data from TMDB)

**Estimated Effort:** Medium (5 files to create/modify)

---

#### 1.4 Advanced Search & Filtering
**Description:** Enhanced search with filters (genre, year, rating, etc.)

**Implementation:**
- **Filter Options:**
  - Genre (multi-select)
  - Year range slider
  - Rating range (TMDB score)
  - Media type (movie/TV toggle)
  - Sort by: Popularity, Rating, Release Date, Alphabetical
  - Language filter
  - Content rating (G, PG, R, etc.)

- **UI Components:**
  - Collapsible filter sidebar on Search page
  - Filter chips showing active filters
  - Clear all filters button
  - Results count display

- **Backend Integration:**
  - Use TMDB Discover API endpoints
  - Client-side filtering for local lists
  - Cache filter results for performance

**Benefits:** Faster discovery, targeted browsing

**Estimated Effort:** Medium-High (5-7 files)

---

#### 1.5 Recommendations Engine
**Description:** Personalized recommendations based on watch history

**Implementation:**
- **Recommendation Sources:**
  1. TMDB "Similar Movies/TV" API
  2. Genre-based matching from watched content
  3. Cast/crew overlap analysis
  4. Trending within user's favorite genres

- **Algorithm:**
  ```typescript
  - Analyze user's top 5 genres from watched history
  - Fetch trending content in those genres
  - Fetch similar content to highest-rated watched items
  - Combine and deduplicate results
  - Filter out already watched/in watchlist
  - Score by relevance and present top 20
  ```

- **UI:**
  - "Recommended For You" section on Home page
  - Explanatory text ("Because you watched...")
  - Refresh recommendations button

**Benefits:** Increases engagement, helps users discover content

**Estimated Effort:** Medium (4-6 files)

---

### Priority 2: User Experience Enhancements

#### 2.1 User Profile Management
**Description:** Editable user profiles with preferences

**Implementation:**
- **Database Schema:**
  ```typescript
  Users Table (extend existing):
  - email: string (existing)
  - name?: string (existing)
  - username?: string (unique, for future social)
  - avatarUrl?: string
  - bio?: string
  - preferences: {
      defaultView: "grid" | "list"
      theme: "light" | "dark" | "system"
      emailNotifications: boolean
    }
  - createdAt: number
  - lastLoginAt: number
  ```

- **UI:**
  - Profile page with edit mode
  - Avatar upload (store in Convex storage)
  - Username availability check
  - Email preferences toggle
  - Account statistics (total watched, hours viewed, etc.)

**Benefits:** Personalization, user engagement

**Estimated Effort:** Medium (5-7 files)

---

#### 2.2 Notifications System
**Description:** Email notifications for releases and personalized alerts

**Implementation:**
- **Notification Types:**
  1. Watchlist item released (movie/TV season)
  2. Weekly digest of trending content
  3. Recommendations update
  4. Custom alerts (e.g., actor's new movie)

- **Database Schema:**
  ```typescript
  Notifications Table:
  - userId: Id<"users">
  - type: "release" | "digest" | "recommendation"
  - message: string
  - link?: string
  - isRead: boolean
  - createdAt: number
  - Indexes: by_user, by_user_unread
  ```

- **Backend:**
  - Scheduled Convex actions (cron jobs) to check TMDB for releases
  - Email service integration via Resend
  - In-app notification bell icon
  - Mark as read/unread functionality

**Benefits:** User retention, re-engagement

**Estimated Effort:** High (10-12 files, cron setup)

---

#### 2.3 Statistics & Analytics Dashboard
**Description:** Personal viewing statistics and insights

**Implementation:**
- **Metrics to Track:**
  - Total movies watched
  - Total TV shows watched
  - Total episodes (if available)
  - Estimated hours watched (runtime sum)
  - Top genres (pie chart)
  - Watch frequency over time (line chart)
  - Average rating given
  - Longest binge (consecutive days)

- **UI:**
  - Dashboard page with charts (use Chart.js or similar)
  - Year-in-review recap feature
  - Exportable stats (PDF/image for sharing)

- **Backend:**
  - Aggregation queries on watched data
  - Calculate derived metrics

**Benefits:** Gamification, shareability, user satisfaction

**Estimated Effort:** Medium-High (6-8 files, charting library)

---

#### 2.4 Export/Import Functionality
**Description:** Export watchlist/watched data and import from other platforms

**Implementation:**
- **Export Formats:**
  - CSV (compatible with Excel)
  - JSON (for backup)
  - Markdown (for blogging)

- **Import Sources:**
  - CSV from Letterboxd, IMDb, Trakt
  - JSON from EntHub backup
  - Field mapping UI for CSV imports

- **UI:**
  - Export/Import buttons on Watchlist/Watched pages
  - Import wizard with file upload and column mapping
  - Preview before import confirmation
  - Error handling for malformed data

**Benefits:** Data portability, migration from competitors, backups

**Estimated Effort:** Medium (4-6 files)

---

### Priority 3: Social & Sharing Features

#### 3.1 Social Following System
**Description:** Follow other users and see their activity

**Implementation:**
- **Database Schema:**
  ```typescript
  Follows Table:
  - followerId: Id<"users">
  - followingId: Id<"users">
  - createdAt: number
  - Indexes: by_follower, by_following

  Activity Feed Table:
  - userId: Id<"users">
  - action: "watched" | "rated" | "reviewed" | "added_to_watchlist"
  - tmdbId: number
  - mediaType: string
  - metadata: object (rating, review snippet, etc.)
  - createdAt: number
  - Indexes: by_user
  ```

- **UI:**
  - Follow/unfollow button on user profiles
  - Activity feed page showing followed users' actions
  - Public profile pages (opt-in via privacy settings)

- **Privacy:**
  - Profile visibility toggle (public/private)
  - Block user functionality

**Benefits:** Community building, discovery through friends

**Estimated Effort:** High (12-15 files, major feature)

---

#### 3.2 Share Functionality
**Description:** Share lists, reviews, and stats on social media

**Implementation:**
- **Share Options:**
  - Share individual review (Twitter, Facebook, copy link)
  - Share collection/custom list
  - Share year-in-review stats (as image)
  - Share watchlist publicly via unique URL

- **UI:**
  - Share button with dropdown menu
  - Copy link with "Copied!" feedback
  - Open Graph meta tags for rich previews
  - QR code generation for lists

**Benefits:** Viral marketing, user acquisition

**Estimated Effort:** Medium (3-5 files, meta tag setup)

---

### Priority 4: Mobile & PWA

#### 4.1 Progressive Web App (PWA)
**Description:** Make EntHub installable on mobile/desktop

**Implementation:**
- **PWA Components:**
  - Web App Manifest (name, icons, colors)
  - Service Worker for offline support
  - Cache strategy for static assets and TMDB images
  - Add to Home Screen prompt

- **Offline Features:**
  - Cache trending page for offline viewing
  - Queue watchlist changes when offline, sync on reconnect
  - Offline-first design for better performance

- **Files to Create:**
  - `public/manifest.json`
  - `src/service-worker.ts`
  - Update `index.html` with manifest link

**Benefits:** Mobile engagement, app-like experience, offline access

**Estimated Effort:** Medium-High (4-6 files, service worker complexity)

---

#### 4.2 Mobile Native App (Future Consideration)
**Description:** React Native or Flutter app for iOS/Android

**Scope:** Separate from this plan, noted for future roadmap

**Benefits:** Push notifications, better performance, app store visibility

**Estimated Effort:** Very High (new codebase)

---

## Code Enhancements

### Priority 1: Testing Infrastructure

#### 3.1 Unit Testing
**Description:** Add comprehensive unit tests for critical logic

**Implementation:**
- **Testing Framework:** Vitest (Vite-native, fast)
- **Coverage Targets:**
  - `services/tmdb.ts`: Mock fetch, test error handling
  - `store/auth.ts`: Test login/logout/persistence
  - `composables/useConvex.ts`: Test subscription logic
  - `convex/auth.ts`: Test OTP generation, rate limiting
  - `convex/lists.ts`: Test add/remove logic, edge cases

- **Setup:**
  ```bash
  npm install -D vitest @vitest/ui @vue/test-utils happy-dom
  ```

- **Configuration:**
  ```typescript
  // vitest.config.ts
  import { defineConfig } from 'vitest/config'
  import vue from '@vitejs/plugin-vue'

  export default defineConfig({
    plugins: [vue()],
    test: {
      environment: 'happy-dom',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        exclude: ['node_modules/', 'dist/']
      }
    }
  })
  ```

- **Test Files:**
  - `src/services/__tests__/tmdb.test.ts`
  - `src/store/__tests__/auth.test.ts`
  - `convex/__tests__/auth.test.ts`
  - `convex/__tests__/lists.test.ts`

**Benefits:** Catch regressions early, safer refactoring

**Estimated Effort:** High (1-2 weeks for comprehensive coverage)

---

#### 3.2 End-to-End Testing
**Description:** Automated E2E tests for critical user flows

**Implementation:**
- **Framework:** Playwright (cross-browser, fast, reliable)
- **Test Scenarios:**
  1. User registration and login flow
  2. Search and view details
  3. Add to watchlist → mark as watched → remove
  4. Theme toggle persistence
  5. Logout and session clearing

- **Setup:**
  ```bash
  npm install -D @playwright/test
  npx playwright install
  ```

- **Sample Test:**
  ```typescript
  // e2e/auth.spec.ts
  import { test, expect } from '@playwright/test';

  test('passwordless login flow', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:text("Send Code")');

    // Mock: retrieve code from test email service or console
    const code = '123456';
    await page.fill('input[name="code"]', code);
    await page.click('button:text("Verify")');

    await expect(page).toHaveURL('/');
    await expect(page.locator('nav')).toContainText('Logout');
  });
  ```

**Benefits:** Confidence in deployments, prevents critical bugs

**Estimated Effort:** Medium-High (1 week setup + ongoing maintenance)

---

### Priority 2: Code Quality

#### 3.3 ESLint & Prettier Configuration
**Description:** Enforce consistent code style and catch errors

**Implementation:**
- **ESLint:**
  ```bash
  npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-vue
  ```

- **Prettier:**
  ```bash
  npm install -D prettier eslint-config-prettier
  ```

- **Configuration:**
  ```javascript
  // .eslintrc.js
  module.exports = {
    extends: [
      'plugin:vue/vue3-recommended',
      '@vue/typescript/recommended',
      'prettier'
    ],
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  }
  ```

- **Scripts:**
  ```json
  "scripts": {
    "lint": "eslint src convex --ext .ts,.vue",
    "format": "prettier --write 'src/**/*.{ts,vue}' 'convex/**/*.ts'"
  }
  ```

**Benefits:** Consistency, fewer bugs, easier onboarding

**Estimated Effort:** Low (half-day setup)

---

#### 3.4 Improved TypeScript Strictness
**Description:** Eliminate all `any` types and improve type safety

**Current Issues:**
- `src/views/Details.vue`: Lines 28, 38, 48, 64 use `as any` for userId
- `src/composables/useConvex.ts`: Lines 10-11 use `any` for data and error

**Implementation:**
- **Create Proper Types:**
  ```typescript
  // src/types/convex.ts
  import type { Id } from "../../convex/_generated/dataModel";

  export type UserId = Id<"users">;
  export type ConvexQueryResult<T> = {
    data: Ref<T | null>;
    error: Ref<Error | null>;
    loading: Ref<boolean>;
  };
  ```

- **Update Composable:**
  ```typescript
  export function useConvexQuery<T>(query: any, args: any): ConvexQueryResult<T> {
    const data = ref<T | null>(null);
    const error = ref<Error | null>(null);
    // ...
  }
  ```

- **Enable Stricter Checks:**
  ```json
  // tsconfig.json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true
    }
  }
  ```

**Benefits:** Fewer runtime errors, better IDE autocomplete

**Estimated Effort:** Medium (3-5 files to refactor)

---

#### 3.5 Component Documentation
**Description:** Add JSDoc comments to complex components and functions

**Example:**
```typescript
/**
 * Fetches media details from TMDB API
 * @param type - Media type ("movie" or "tv")
 * @param id - TMDB ID of the media
 * @returns Promise resolving to MediaDetails with credits and videos
 * @throws Error if TMDB API request fails
 */
export const getDetails = (type: 'movie' | 'tv', id: number) =>
  fetchTMDB<MediaDetails>(`/${type}/${id}`, { append_to_response: 'credits,videos' });
```

**Benefits:** Easier onboarding, better maintainability

**Estimated Effort:** Low (ongoing with new code)

---

### Priority 3: Performance

#### 3.6 Code Splitting & Lazy Loading
**Description:** Split code into chunks for faster initial load

**Implementation:**
- **Route-Based Splitting:**
  ```typescript
  // src/router/index.ts
  const routes = [
    {
      path: '/',
      component: () => import('../views/Home.vue') // Lazy load
    },
    {
      path: '/details/:type/:id',
      component: () => import('../views/Details.vue')
    },
    // ... all routes lazy-loaded
  ];
  ```

- **Component-Based Splitting:**
  ```vue
  <!-- Use defineAsyncComponent for heavy components -->
  <script setup>
  import { defineAsyncComponent } from 'vue';
  const HeavyChart = defineAsyncComponent(() => import('./HeavyChart.vue'));
  </script>
  ```

- **Vite Configuration:**
  ```typescript
  // vite.config.ts
  export default defineConfig({
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'vue-router'],
            'convex': ['convex/browser'],
          }
        }
      }
    }
  });
  ```

**Benefits:** Faster Time to Interactive (TTI), better Lighthouse score

**Estimated Effort:** Low-Medium (1-2 days)

---

#### 3.7 Image Optimization
**Description:** Optimize TMDB images for faster loading

**Implementation:**
- **Responsive Images:**
  ```vue
  <img
    :srcset="`
      ${tmdb.getImageUrl(path, 'w300')} 300w,
      ${tmdb.getImageUrl(path, 'w500')} 500w,
      ${tmdb.getImageUrl(path, 'original')} 1000w
    `"
    sizes="(max-width: 640px) 300px, 500px"
    :src="tmdb.getImageUrl(path, 'w500')"
    loading="lazy"
  />
  ```

- **WebP Fallback:** (TMDB doesn't serve WebP, but cache on CDN could convert)

- **Placeholder Images:**
  - Create `/public/placeholder-poster.png` (lightweight, blurred)
  - Show skeleton while image loads

**Benefits:** Reduced bandwidth, faster page loads

**Estimated Effort:** Low (2-3 files)

---

#### 3.8 Caching Strategy
**Description:** Client-side caching for API responses

**Implementation:**
- **TMDB Response Cache:**
  ```typescript
  // src/services/tmdb.ts
  const cache = new Map<string, { data: any, timestamp: number }>();
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async function fetchTMDB<T>(endpoint: string, params = {}): Promise<T> {
    const cacheKey = `${endpoint}?${new URLSearchParams(params)}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const data = await fetch(/* ... */).then(r => r.json());
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }
  ```

- **Convex Auto-Caching:** Already handled by ConvexClient (reactive subscriptions)

- **HTTP Cache Headers:** Configure Vite preview server with proper headers

**Benefits:** Reduced API calls, faster navigation

**Estimated Effort:** Low (half-day)

---

### Priority 4: Accessibility

#### 3.9 ARIA Labels & Keyboard Navigation
**Description:** Make EntHub fully accessible to screen readers

**Implementation:**
- **Semantic HTML:**
  - Use `<nav>`, `<main>`, `<section>`, `<article>` appropriately
  - Ensure headings follow hierarchy (h1 → h2 → h3)

- **ARIA Labels:**
  ```vue
  <button @click="toggleWatchlist" aria-label="Add to watchlist">
    <svg><!-- icon --></svg>
  </button>

  <input
    type="text"
    aria-label="Search for movies and TV shows"
    placeholder="Search..."
  />
  ```

- **Keyboard Navigation:**
  - Ensure all interactive elements are focusable
  - Add visible focus indicators
  - Skip links for main content
  - Modal focus trapping

- **Testing:**
  - Use axe DevTools for automated checks
  - Manual testing with screen reader (NVDA/JAWS)

**Benefits:** Inclusive design, legal compliance (ADA), better SEO

**Estimated Effort:** Medium (3-5 days across all components)

---

#### 3.10 SEO Optimization
**Description:** Improve search engine visibility

**Implementation:**
- **Meta Tags:**
  ```html
  <!-- index.html -->
  <head>
    <title>EntHub - Track Movies & TV Shows</title>
    <meta name="description" content="Personal media tracker for movies and TV shows. Discover trending content, manage your watchlist, and track your viewing history.">
    <meta property="og:title" content="EntHub">
    <meta property="og:description" content="Track your favorite movies and TV shows">
    <meta property="og:image" content="/og-image.jpg">
    <meta name="twitter:card" content="summary_large_image">
  </head>
  ```

- **Dynamic Meta Tags (per page):**
  ```typescript
  // Use vue-meta or @vueuse/head
  import { useHead } from '@vueuse/head'

  useHead({
    title: `${media.title} - EntHub`,
    meta: [
      { name: 'description', content: media.overview },
      { property: 'og:image', content: tmdb.getImageUrl(media.poster_path) }
    ]
  })
  ```

- **Sitemap & robots.txt:**
  - Generate sitemap.xml for static routes
  - Allow all crawlers in robots.txt

- **Structured Data (JSON-LD):**
  ```json
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "EntHub",
    "description": "Personal media tracking app",
    "applicationCategory": "Entertainment"
  }
  ```

**Benefits:** Organic traffic, better social sharing previews

**Estimated Effort:** Medium (2-3 days)

---

## Security Enhancements

### Priority 1: Critical Security

#### 4.1 Rate Limiting on Frontend
**Description:** Prevent abuse of auth and search endpoints

**Implementation:**
- **Auth Rate Limiting (Backend - Convex):**
  Already implemented in `convex/auth.ts`:
  - 5 attempts max per code (Line 66-69)
  - 10-minute code expiration (Line 14, 60-63)

  **Enhancement:** Add IP-based rate limiting using Convex actions:
  ```typescript
  // convex/rateLimiting.ts
  export const checkRateLimit = mutation({
    args: { identifier: v.string(), action: v.string() },
    handler: async (ctx, args) => {
      const now = Date.now();
      const windowMs = 15 * 60 * 1000; // 15 minutes
      const maxAttempts = 5;

      const attempts = await ctx.db
        .query("rateLimits")
        .withIndex("by_identifier", q => q.eq("identifier", args.identifier))
        .filter(q => q.gt(q.field("timestamp"), now - windowMs))
        .collect();

      if (attempts.length >= maxAttempts) {
        throw new Error("Too many requests. Please try again later.");
      }

      await ctx.db.insert("rateLimits", {
        identifier: args.identifier,
        action: args.action,
        timestamp: now
      });
    }
  });
  ```

- **TMDB API Rate Limiting:**
  - TMDB has its own rate limits (40 requests/10 seconds)
  - Implement exponential backoff on 429 errors:
  ```typescript
  // src/services/tmdb.ts
  const fetchWithRetry = async (url: string, retries = 3, delay = 1000) => {
    try {
      const response = await fetch(url, { headers });
      if (response.status === 429 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, retries - 1, delay * 2);
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, retries - 1, delay * 2);
      }
      throw error;
    }
  };
  ```

**Benefits:** Prevents DoS attacks, protects API quota

**Estimated Effort:** Medium (2-3 files)

---

#### 4.2 Input Validation & Sanitization
**Description:** Validate all user inputs to prevent injection attacks

**Current State:**
- ✅ Email trimming and lowercasing (convex/auth.ts:8, 47)
- ✅ Code sanitization in email (convex/actions.ts:28 - regex to remove non-digits)

**Enhancements Needed:**

1. **Email Validation:**
   ```typescript
   // convex/auth.ts
   const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

   export const signIn = mutation({
     args: { email: v.string() },
     handler: async (ctx, args) => {
       const email = args.email.toLowerCase().trim();

       if (!EMAIL_REGEX.test(email)) {
         throw new Error("Invalid email format");
       }

       if (email.length > 254) { // RFC 5321
         throw new Error("Email too long");
       }

       // ... rest of logic
     }
   });
   ```

2. **Review Text Sanitization (Future):**
   ```bash
   npm install dompurify
   ```
   ```typescript
   import DOMPurify from 'dompurify';

   const sanitizeReview = (text: string) => {
     return DOMPurify.sanitize(text, {
       ALLOWED_TAGS: [], // Strip all HTML
       ALLOWED_ATTR: []
     });
   };
   ```

3. **Search Query Validation:**
   ```typescript
   // src/services/tmdb.ts
   export const search = (query: string, page = 1) => {
     const sanitized = query.trim().slice(0, 100); // Max 100 chars

     if (!sanitized) {
       throw new Error("Search query cannot be empty");
     }

     return fetchTMDB<TMDBResponse<MediaItem>>('/search/multi', {
       query: sanitized,
       page: Math.max(1, Math.min(page, 500)) // TMDB max page
     });
   };
   ```

**Benefits:** Prevents XSS, SQL injection (N/A for Convex), and data corruption

**Estimated Effort:** Low-Medium (3-4 files)

---

#### 4.3 Content Security Policy (CSP)
**Description:** Restrict resource loading to prevent XSS attacks

**Implementation:**
```html
<!-- index.html -->
<head>
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.convex.cloud;
    style-src 'self' 'unsafe-inline';
    img-src 'self' https://image.tmdb.org https://img.youtube.com data:;
    font-src 'self' data:;
    connect-src 'self' https://api.themoviedb.org https://*.convex.cloud wss://*.convex.cloud;
    frame-src https://www.youtube.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  ">
</head>
```

**Testing:**
- Use browser DevTools to check for CSP violations
- Gradually tighten policy by removing 'unsafe-inline' (requires nonce setup)

**Benefits:** Defense-in-depth against XSS

**Estimated Effort:** Low (1-2 hours, requires testing)

---

#### 4.4 Secure Session Management
**Description:** Improve auth token storage and expiration

**Current State:**
- User ID stored in localStorage (src/store/auth.ts:16)
- No expiration or token rotation

**Enhancements:**

1. **Add Session Expiration:**
   ```typescript
   // src/store/auth.ts
   interface Session {
     userId: string;
     expiresAt: number;
   }

   const getInitialUserId = () => {
     const stored = localStorage.getItem(STATE_KEY);
     if (!stored) return null;

     try {
       const session: Session = JSON.parse(stored);
       if (Date.now() > session.expiresAt) {
         localStorage.removeItem(STATE_KEY);
         return null;
       }
       return session.userId;
     } catch {
       return null;
     }
   };

   export const authStore = reactive({
     userId: getInitialUserId(),

     login(id: string) {
       const session: Session = {
         userId: id,
         expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
       };
       this.userId = id;
       localStorage.setItem(STATE_KEY, JSON.stringify(session));
     },

     // ... rest
   });
   ```

2. **Session Refresh (Advanced):**
   - Issue short-lived tokens (1 hour)
   - Refresh token on activity (Convex mutation)
   - Auto-logout on expiration

3. **Logout on Suspicious Activity:**
   - Detect multiple failed OTP attempts
   - Clear session on device change (fingerprinting)

**Benefits:** Reduces session hijacking risk, improves security posture

**Estimated Effort:** Medium (1-2 files, testing needed)

---

### Priority 2: Security Best Practices

#### 4.5 Environment Variable Protection
**Description:** Ensure secrets are not exposed to client

**Current State:**
- ✅ `VITE_TMDB_READ_TOKEN` is a read-only token (safe to expose)
- ✅ `RESEND_API_KEY` is only in Convex backend (process.env, not exposed)

**Enhancements:**

1. **Document Secret Management:**
   ```markdown
   # .env.example
   # Frontend (safe to expose - these are public keys)
   VITE_CONVEX_URL=https://your-deployment.convex.cloud
   VITE_TMDB_READ_TOKEN=your_tmdb_read_token_here

   # Backend (NEVER commit - set via Convex Dashboard)
   # RESEND_API_KEY - set in Convex production secrets
   ```

2. **Convex Secret Scanning:**
   - Ensure production secrets are set via Convex Dashboard, not .env files committed to git
   - Add `.env` to `.gitignore` (already done, verify)

3. **Runtime Checks:**
   ```typescript
   // src/services/tmdb.ts
   if (!TOKEN) {
     console.warn("Token is not defined. TMDB requests will fail.");
     // Already present at line 7-8
   }
   ```

**Benefits:** Prevents credential leaks, follows least privilege

**Estimated Effort:** Low (documentation only)

---

#### 4.6 Dependency Auditing
**Description:** Regular security audits of npm packages

**Implementation:**

1. **npm audit:**
   ```bash
   npm audit
   npm audit fix  # Auto-fix non-breaking vulnerabilities
   ```

2. **Automated Scanning:**
   - Set up GitHub Dependabot (if using GitHub)
   - Configure automatic PR creation for security updates

3. **Regular Updates:**
   ```bash
   npm outdated
   npm update  # Update within semver range
   ```

4. **Lock File Integrity:**
   - Commit `package-lock.json`
   - Use `npm ci` in CI/CD for reproducible builds

**Schedule:** Monthly audits, immediate for critical CVEs

**Benefits:** Prevents supply chain attacks, stays current

**Estimated Effort:** Low (automated, 1 hour/month)

---

#### 4.7 HTTPS Enforcement
**Description:** Ensure all connections are encrypted

**Implementation:**

1. **Production Deployment:**
   - ✅ Render provides automatic HTTPS with Let's Encrypt
   - ✅ Convex uses HTTPS by default

2. **Redirect HTTP to HTTPS:**
   ```html
   <!-- index.html -->
   <script>
     if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
       location.replace(`https:${location.href.substring(location.protocol.length)}`);
     }
   </script>
   ```

3. **HSTS Header (Render configuration):**
   ```
   Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   ```

**Benefits:** Prevents man-in-the-middle attacks

**Estimated Effort:** Low (already mostly implemented)

---

#### 4.8 CORS Configuration
**Description:** Restrict API access to authorized origins

**Current State:**
- Convex handles CORS automatically for deployed frontend
- TMDB API has its own CORS policy (allows all origins for read-only endpoints)

**Enhancements:**

1. **Convex Production Configuration:**
   - Ensure Convex deployment only accepts requests from production domain
   - Set allowed origins in Convex Dashboard settings

2. **Backend Validation (if needed):**
   ```typescript
   // convex/http.ts (if using HTTP endpoints)
   import { httpRouter } from "convex/server";

   const http = httpRouter();

   http.route({
     path: "/api/public",
     method: "GET",
     handler: async (request, { runQuery }) => {
       const origin = request.headers.get("origin");
       const allowedOrigins = ["https://enthub.com", "https://www.enthub.com"];

       if (!origin || !allowedOrigins.includes(origin)) {
         return new Response("Forbidden", { status: 403 });
       }

       // ... handler logic
     }
   });
   ```

**Benefits:** Prevents unauthorized API access from other domains

**Estimated Effort:** Low (configuration only)

---

### Priority 3: Advanced Security

#### 4.9 Two-Factor Authentication (2FA)
**Description:** Optional 2FA for enhanced account security

**Implementation:**

1. **Authenticator App (TOTP):**
   ```bash
   npm install otplib qrcode
   ```

2. **Database Schema:**
   ```typescript
   Users Table (extend):
   - twoFactorEnabled: boolean
   - twoFactorSecret?: string (encrypted)
   ```

3. **Setup Flow:**
   - User enables 2FA in settings
   - Generate TOTP secret
   - Display QR code for Google Authenticator
   - Verify setup with first code
   - Provide backup codes

4. **Login Flow Modification:**
   - After email OTP verification, if 2FA enabled, prompt for TOTP
   - Verify TOTP before issuing session

**Benefits:** Extra layer of account protection

**Estimated Effort:** High (6-8 files, complex flow)

---

#### 4.10 Activity Logging & Monitoring
**Description:** Log security-relevant events for audit trail

**Implementation:**

1. **Database Schema:**
   ```typescript
   AuditLogs Table:
   - userId?: Id<"users">
   - action: "login" | "logout" | "failed_login" | "password_reset" | "2fa_enabled"
   - ipAddress?: string (if available via Convex context)
   - userAgent?: string
   - timestamp: number
   - metadata?: object
   ```

2. **Logging Mutations:**
   ```typescript
   // convex/auth.ts
   export const verifyCode = mutation({
     handler: async (ctx, args) => {
       // ... existing logic

       // On success
       await ctx.db.insert("auditLogs", {
         userId: user._id,
         action: "login",
         timestamp: Date.now()
       });

       // On failure
       if (authCode.code !== code) {
         await ctx.db.insert("auditLogs", {
           action: "failed_login",
           metadata: { email: args.email },
           timestamp: Date.now()
         });
         // ... increment attempts
       }
     }
   });
   ```

3. **Admin Dashboard (Future):**
   - View recent logins
   - Detect suspicious patterns (multiple failed attempts)
   - Alert on anomalies

**Benefits:** Forensics, detect compromised accounts

**Estimated Effort:** Medium-High (5-7 files)

---

## Performance Optimizations

### Priority 1: Frontend Performance

#### 5.1 Virtual Scrolling for Long Lists
**Description:** Optimize Watchlist/Watched pages with 100+ items

**Implementation:**
```bash
npm install vue-virtual-scroller
```

```vue
<!-- src/views/Watchlist.vue -->
<template>
  <RecycleScroller
    :items="watchlist"
    :item-size="300"
    key-field="_id"
    v-slot="{ item }"
  >
    <MediaCard :item="item" />
  </RecycleScroller>
</template>
```

**Benefits:** Renders only visible items, handles 10,000+ items smoothly

**Estimated Effort:** Low (1-2 files)

---

#### 5.2 Debounced Search
**Description:** Reduce API calls during typing

**Implementation:**
```vue
<!-- src/views/Search.vue -->
<script setup>
import { ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';

const searchQuery = ref('');
const results = ref([]);

const performSearch = useDebounceFn(async (query: string) => {
  if (!query.trim()) return;
  const data = await tmdb.search(query);
  results.value = data.results;
}, 500); // 500ms delay

watch(searchQuery, (newQuery) => {
  performSearch(newQuery);
});
</script>
```

**Benefits:** Reduces TMDB API calls, better UX

**Estimated Effort:** Low (1 file)

---

#### 5.3 Preloading & Prefetching
**Description:** Load likely-needed resources ahead of time

**Implementation:**

1. **Preload Critical Resources:**
   ```html
   <!-- index.html -->
   <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
   <link rel="dns-prefetch" href="https://api.themoviedb.org">
   <link rel="dns-prefetch" href="https://image.tmdb.org">
   ```

2. **Route Prefetching:**
   ```vue
   <!-- Prefetch Details page on hover -->
   <router-link
     :to="`/details/movie/${item.id}`"
     @mouseenter="$router.prefetch(`/details/movie/${item.id}`)"
   >
   ```

3. **Image Preloading:**
   ```vue
   <link rel="preload" :href="tmdb.getImageUrl(heroBackdrop)" as="image">
   ```

**Benefits:** Faster perceived performance, instant navigation

**Estimated Effort:** Low (2-3 files)

---

### Priority 2: Backend Performance

#### 5.4 Database Indexing Optimization
**Description:** Ensure all queries use optimal indexes

**Current State (✅ Already Well-Indexed):**
- `users`: by_email
- `authCodes`: by_email, by_email_code
- `watchlist`: by_user, by_user_media
- `watched`: by_user, by_user_media

**Additional Indexes (Future Features):**
```typescript
// convex/schema.ts (when adding ratings)
ratings: defineTable({
  userId: v.id("users"),
  tmdbId: v.number(),
  rating: v.number(),
  review: v.optional(v.string()),
  createdAt: v.number()
})
.index("by_user", ["userId"])
.index("by_user_media", ["userId", "tmdbId"])
.index("by_tmdb", ["tmdbId"]) // For aggregating ratings per media
.index("by_rating", ["rating"]) // For "highest rated" queries
```

**Benefits:** Sub-millisecond query times, scales to millions of records

**Estimated Effort:** Low (add as new features are built)

---

#### 5.5 Pagination for Large Result Sets
**Description:** Paginate watchlist/watched if user has 100+ items

**Implementation:**
```typescript
// convex/lists.ts
export const getWatchlistPaginated = query({
  args: {
    userId: v.id("users"),
    paginationOpts: paginationOptsValidator
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

```vue
<!-- src/views/Watchlist.vue -->
<script setup>
const { results, status, loadMore } = usePaginatedQuery(
  api.lists.getWatchlistPaginated,
  { userId: authStore.userId },
  { initialNumItems: 50 }
);
</script>

<template>
  <!-- ... display results ... -->
  <button @click="loadMore(50)" v-if="status === 'CanLoadMore'">
    Load More
  </button>
</template>
```

**Benefits:** Faster initial page load, handles unlimited items

**Estimated Effort:** Medium (3-4 files)

---

## Infrastructure Improvements

### Priority 1: DevOps

#### 6.1 CI/CD Pipeline
**Description:** Automated testing and deployment

**Implementation (GitHub Actions):**

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test  # Vitest
      - run: npm run build

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

  deploy:
    needs: [test, e2e]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - run: npx convex deploy --prod
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
      # Render auto-deploys on push to main
```

**Benefits:** Catch bugs before production, consistent deployments

**Estimated Effort:** Medium (1-2 days setup)

---

#### 6.2 Environment Management
**Description:** Separate dev, staging, and production environments

**Implementation:**

1. **Convex Deployments:**
   - Development: `npx convex dev` (local)
   - Staging: Separate Convex project
   - Production: Main Convex project

2. **Environment Variables:**
   ```bash
   # .env.development
   VITE_CONVEX_URL=https://dev-project.convex.cloud
   VITE_TMDB_READ_TOKEN=same_for_all

   # .env.production
   VITE_CONVEX_URL=https://prod-project.convex.cloud
   VITE_TMDB_READ_TOKEN=same_for_all
   ```

3. **Branch Strategy:**
   - `main`: Production
   - `develop`: Staging
   - `feature/*`: Development branches

**Benefits:** Safe testing, prevents prod incidents

**Estimated Effort:** Low-Medium (1 day)

---

#### 6.3 Monitoring & Error Tracking
**Description:** Track errors and performance in production

**Implementation:**

1. **Error Tracking (Sentry):**
   ```bash
   npm install @sentry/vue
   ```

   ```typescript
   // src/main.ts
   import * as Sentry from "@sentry/vue";

   Sentry.init({
     app,
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.MODE,
     integrations: [
       Sentry.browserTracingIntegration(),
       Sentry.replayIntegration(),
     ],
     tracesSampleRate: 0.1,
     replaysSessionSampleRate: 0.1,
   });
   ```

2. **Performance Monitoring:**
   - Lighthouse CI in GitHub Actions
   - Web Vitals tracking (CLS, LCP, FID)
   - Custom metrics (API response times)

3. **User Analytics (Privacy-Friendly):**
   ```bash
   npm install @vercel/analytics  # or Plausible
   ```

**Benefits:** Proactive bug fixes, performance insights

**Estimated Effort:** Medium (2-3 days)

---

### Priority 2: Documentation

#### 6.4 API Documentation
**Description:** Document Convex functions for frontend consumers

**Implementation:**

```typescript
/**
 * Toggles a media item in the user's watchlist.
 * If the item is already in the watchlist, it will be removed.
 * If the item is in the watched list, it will be moved to watchlist.
 *
 * @param userId - The Convex ID of the user
 * @param tmdbId - The TMDB ID of the media item
 * @param mediaType - Type of media ("movie" or "tv")
 * @param title - Title of the media (cached for display)
 * @param posterPath - TMDB poster path (optional, cached for display)
 *
 * @returns Object with `added` boolean indicating if item was added (true) or removed (false)
 *
 * @example
 * ```typescript
 * await toggleWatchlist({
 *   userId: "j97dh3k2k8z9q1r5s6t7",
 *   tmdbId: 550,
 *   mediaType: "movie",
 *   title: "Fight Club",
 *   posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"
 * });
 * ```
 */
export const toggleWatchlist = mutation({
  // ... implementation
});
```

**Generate Docs:**
```bash
npm install -D typedoc
npx typedoc --out docs/api convex/
```

**Benefits:** Easier onboarding, self-documenting code

**Estimated Effort:** Low (ongoing with new code)

---

#### 6.5 User Documentation
**Description:** Help center and getting started guide

**Implementation:**

1. **In-App Onboarding:**
   - First-time user tour (use vue-tour or similar)
   - Tooltips explaining features
   - Empty state messages with actionable links

2. **Help Center Page:**
   - FAQ section
   - How-to guides (creating lists, sharing, exporting)
   - Troubleshooting common issues

3. **Changelog:**
   - `CHANGELOG.md` following Keep a Changelog format
   - Version history visible in app footer

**Benefits:** Reduces support burden, improves UX

**Estimated Effort:** Medium (3-5 days)

---

## Implementation Roadmap

### Phase 1: Foundation (Months 1-2)
**Focus:** Code quality, testing, security basics

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Unit Testing Setup | P1 | High | None |
| ESLint + Prettier | P2 | Low | None |
| Input Validation | P1 | Low-Med | None |
| CSP Implementation | P1 | Low | None |
| Session Expiration | P1 | Medium | None |
| CI/CD Pipeline | P1 | Medium | Testing setup |
| Code Splitting | P3 | Low-Med | None |
| Image Optimization | P3 | Low | None |

**Outcome:** Solid foundation for rapid feature development

---

### Phase 2: Feature Expansion (Months 3-4)
**Focus:** User-facing features that drive engagement

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| ~~Person Details Page~~ | ~~P1~~ | ~~Medium~~ | ✅ Done |
| Ratings & Reviews | P1 | Medium | None |
| Advanced Filtering | P1 | Med-High | None |
| User Profiles | P2 | Medium | None |
| Export/Import | P2 | Medium | None |
| Statistics Dashboard | P2 | Med-High | Charting library |
| E2E Testing | P1 | Med-High | Phase 1 complete |
| SEO Optimization | P4 | Medium | None |

**Outcome:** Feature parity with competitors (Letterboxd, Trakt)

---

### Phase 3: Social & Growth (Months 5-6)
**Focus:** Viral features and user acquisition

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| ~~TMDB Collection Integration~~ | ~~P1~~ | ~~Medium~~ | ✅ Done |
| Recommendations | P1 | Medium | Watched history data |
| Sharing Features | P3 | Medium | None |
| Following System | P3 | High | User profiles |
| PWA Implementation | P4 | Med-High | Service worker |
| Notifications | P2 | High | Email service ready |

**Outcome:** Network effects, organic growth

---

### Phase 4: Maturity (Months 7-9)
**Focus:** Polish, performance, advanced security

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Virtual Scrolling | P1 | Low | Long lists |
| Pagination | P2 | Medium | Large datasets |
| 2FA Implementation | P3 | High | None |
| Activity Logging | P3 | Med-High | None |
| Monitoring Setup | P1 | Medium | None |
| User Documentation | P2 | Medium | None |
| Accessibility Audit | P4 | Medium | None |

**Outcome:** Production-grade, scalable application

---

### Phase 5: Advanced Features (Months 10-12)
**Focus:** Differentiation and premium features

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| AI Recommendations | Future | Very High | ML infrastructure |
| Mobile Native App | Future | Very High | Separate project |
| Watch Parties | Future | Very High | Real-time sync |
| Merchandise Integration | Future | Medium | Affiliate APIs |
| Premium Tier (Ad-free, storage) | Future | High | Payment processing |

**Outcome:** Sustainable business model

---

## Priority Matrix

### High Impact, Low Effort (Do First)
1. ✅ Unit Testing Setup
2. ✅ Input Validation
3. ✅ ESLint + Prettier
4. ✅ Image Optimization
5. ✅ Code Splitting
6. ✅ Debounced Search
7. ✅ Session Expiration
8. ✅ Export/Import CSV

### High Impact, High Effort (Plan & Execute)
1. 🔥 Ratings & Reviews
2. 🔥 Advanced Filtering
3. 🔥 Recommendations Engine
4. 🔥 E2E Testing
5. 🔥 CI/CD Pipeline
6. 🔥 Notifications System
7. 🔥 Statistics Dashboard

### High Impact, Medium Effort
1. ✅ ~~TMDB Collection Integration~~ (Completed)
2. ✅ ~~Person Details Page~~ (Completed)

### Low Impact, Low Effort (Fill Gaps)
1. ⚡ CSP Headers
2. ⚡ HTTPS Enforcement
3. ⚡ Dependency Auditing
4. ⚡ User Documentation
5. ⚡ Changelog
6. ⚡ Preloading Resources

### Low Impact, High Effort (Defer)
1. ⏸️ 2FA Implementation
2. ⏸️ Activity Logging
3. ⏸️ Following System (wait for user base)
4. ⏸️ Mobile Native App
5. ⏸️ AI-Powered Recommendations

---

## Success Metrics

### Performance
- **Lighthouse Score:** 90+ across all categories
- **Time to Interactive (TTI):** < 3 seconds on 3G
- **First Contentful Paint (FCP):** < 1.5 seconds
- **Largest Contentful Paint (LCP):** < 2.5 seconds
- **Cumulative Layout Shift (CLS):** < 0.1

### Security
- **npm audit:** 0 high/critical vulnerabilities
- **CSP:** No violations in production
- **HTTPS:** 100% encrypted traffic
- **Session Security:** 30-day expiration, refresh on activity

### Code Quality
- **Test Coverage:** 80%+ for critical paths
- **TypeScript Strictness:** 0 `any` types (exceptions documented)
- **ESLint Errors:** 0 in CI/CD
- **Bundle Size:** < 200KB initial load (gzipped)

### User Engagement (Post-Launch)
- **Daily Active Users (DAU):** Track growth
- **Watchlist Additions:** Average per user
- **Retention:** 7-day, 30-day cohorts
- **Sharing:** Number of shared lists/reviews

---

## Recently Completed

| Feature | Completion Date | Files Modified/Created |
|---------|-----------------|------------------------|
| Person Details Page | January 2026 | `src/types/tmdb.ts`, `src/services/tmdb.ts`, `src/views/Person.vue`, `src/views/Details.vue`, `src/views/Search.vue`, `src/router/index.ts` |
| TMDB Collection Integration | January 2026 | `src/types/tmdb.ts`, `src/services/tmdb.ts`, `src/views/Details.vue`, `src/views/Collection.vue`, `src/router/index.ts` |

---

## Conclusion

This comprehensive improvements plan transforms EntHub from an MVP into a production-ready, scalable application. The phased approach prioritizes foundational improvements (testing, security, performance) before expanding features, ensuring a stable platform for growth.

**Immediate Next Steps:**
1. Review and approve this plan
2. Set up unit testing infrastructure (Vitest)
3. Implement input validation and CSP
4. Begin Phase 1 tasks in parallel
5. Establish weekly progress reviews

**Long-Term Vision:**
EntHub will evolve into the premier personal media tracking platform, offering personalized recommendations, social features, and comprehensive analytics—all while maintaining privacy, security, and performance excellence.

---

**Document Maintenance:**
- Update this plan quarterly
- Track completed items in `CHANGELOG.md`
- Adjust priorities based on user feedback
- Add new features to backlog section

**Contact:** For questions or suggestions about this plan, please open a GitHub issue.
