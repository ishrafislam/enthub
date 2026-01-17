# MVP Development Plan

## Milestone 1: Initialization & Infrastructure
*   [x] **Project Scaffold:** Initialize Vue + Vite project.
*   [x] **Tailwind Setup:** Configure Tailwind CSS and PostCSS.
*   [x] **Convex Setup:** Initialize Convex in the project.
*   [x] **Environment:** Set up `.env` files for TMDB and Resend keys.
*   [x] **Basic Layout:** Create the App Layout (Navbar, Main Content Area).

## Milestone 2: Authentication (The Gatekeeper)
*   [ ] **Schema:** Define the `users` schema in Convex.
*   [ ] **Backend Logic:** Create Convex actions/mutations to:
    *   Generate OTP/Magic Code.
    *   Send email via Resend API.
    *   Verify code and create session.
*   [ ] **Frontend UI:** Create Login page (Email input -> OTP input).
*   [ ] **Auth Guards:** Protect private routes (Watchlist/Watched) using Vue Router.

## Milestone 3: TMDB Integration & Discovery
*   [ ] **API Utility:** Create a wrapper for fetching data from TMDB (handling base URLs and headers).
*   [ ] **Home Page:** Display "Trending Now" movies and shows.
*   [ ] **Search:** Implement a search bar that queries TMDB and displays results.
*   [ ] **Details Page:** Create dynamic route `/title/:id` to show full metadata (Cast, Plot, etc.).

## Milestone 4: The Lists (Watchlist & Watched)
*   [ ] **Schema:** Define `watchlist` and `watched` tables in Convex.
*   [ ] **Backend Logic:**
    *   Mutation: `addToWatchlist`
    *   Mutation: `removeFromWatchlist`
    *   Mutation: `markAsWatched` (Transactional: Remove from Watchlist -> Add to Watched).
*   [ ] **Frontend UI:**
    *   Add "Bookmark" button on Movie Details cards.
    *   Create `/watchlist` page to grid view of saved items.
    *   Create `/watched` page for history.

## Milestone 5: Polish & Deployment
*   [ ] **UI Polish:** Better loading skeletons, error states (e.g., "Movie not found").
*   [ ] **Responsiveness:** Ensure mobile view looks good.
*   [ ] **Deployment:** Deploy frontend (Vercel/Netlify) and backend (Convex Production).
