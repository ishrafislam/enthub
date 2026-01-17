# Project Requirements & Technical Stack

## 1. Project Overview
**EntHub** is a personal media tracking application designed to replace IMDB for the user. It serves as a comprehensive database for Movies and TV Shows, allowing the user to browse details, manage a "Watchlist", and track "Watched" content.

## 2. Core Features (MVP)

### A. Discovery & Details
*   **Search:** Ability to search for Movies and TV Shows by title.
*   **Trending/Popular:** A home feed showing currently popular items (powered by TMDB).
*   **Detailed View:** A dedicated page for each entity displaying:
    *   Title, Year, Duration, Genre
    *   Plot Summary / Overview
    *   Cast & Crew
    *   Poster & Backdrop images
    *   Rating (TMDB score)

### B. Authentication
*   **Method:** Passwordless Email Login (Magic Link / OTP).
*   **Provider:** Custom implementation using **Resend** for email delivery and **Convex** for token management/session storage.

### C. List Management
*   **Watchlist:**
    *   Add movies/shows to a "Want to Watch" list.
    *   Remove items from the list.
*   **Watched List:**
    *   Mark items as "Watched" (moves them from Watchlist -> Watched).
    *   (Optional for MVP) Add a personal rating when marking as watched.
    *   View history of watched items.

## 3. Technical Stack

### Frontend
*   **Framework:** [Vue.js 3](https://vuejs.org/) (Composition API, Script Setup)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Icons:** Lucide-Vue or Heroicons
*   **State Management:** Pinia (if needed, though Convex provides reactive state).

### Backend & Database
*   **Platform:** [Convex](https://convex.dev/)
*   **Functions:** Convex Queries (read) and Mutations (write).
*   **Database:** Convex built-in document database.
*   **Real-time:** Native Convex reactivity.

### External APIs
*   **Media Data:** [TMDB (The Movie Database) API v3](https://developer.themoviedb.org/reference/intro/getting-started)
*   **Email Service:** [Resend](https://resend.com/)

## 4. Data Model Strategy (Convex Schema)

**`users`**
*   `email`: String (Index)
*   `tokenIdentifier`: String (for session handling)

**`watchlist`**
*   `userId`: Id<"users">
*   `tmdbId`: Number (The ID from TMDB)
*   `mediaType`: String ("movie" | "tv")
*   `title`: String (Cached for quick listing)
*   `posterPath`: String (Cached for quick listing)
*   `addedAt`: Number (Timestamp)

**`watched`**
*   `userId`: Id<"users">
*   `tmdbId`: Number
*   `mediaType`: String
*   `title`: String
*   `posterPath`: String
*   `watchedAt`: Number
*   `rating`: Number (Optional, 1-10)
