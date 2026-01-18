# Deployment Guide

This document provides instructions for deploying the **EntHub** application to production.

## 1. Backend Deployment (Convex)

Convex manages your backend functions, database, and schema.

### Step A: Deploy to Production
Run the following command from your terminal:
```bash
npx convex deploy
```
This command will:
*   Create a production deployment on Convex.
*   Push your schema and functions.
*   Provide you with a **Production Convex URL** (e.g., `https://happy-otter-123.convex.cloud`).

### Step B: Configure Production Secrets
You must set your API keys in the Convex Production Dashboard so your backend functions can access them:
1.  Go to your [Convex Dashboard](https://dashboard.convex.dev).
2.  Select your project and go to **Settings > Environment Variables**.
3.  Add the following key:
    *   `RESEND_API_KEY`: Your production Resend API key.

---

## 2. Frontend Deployment (Render)

Render will host your static Vue.js application.

### Step A: Prepare the Repository
Ensure your latest code is pushed to a Git provider (GitHub, GitLab, or Bitbucket).

### Step B: Create a New Static Site on Render
1.  Log in to [Render](https://dashboard.render.com).
2.  Click **New +** and select **Static Site**.
3.  Connect your Git repository.
4.  Configure the following build settings:
    *   **Name:** `enthub` (or your preferred name)
    *   **Build Command:** `npm install && npm run build`
    *   **Publish Directory:** `dist`

### Step C: Configure Environment Variables
In the Render dashboard for your site, go to **Environment** and add:
1.  `VITE_CONVEX_URL`: The **Production URL** provided by Convex in Step 1A.
2.  `VITE_TMDB_READ_TOKEN`: Your TMDB API Read Access Token.

### Step D: Routing (Single Page App)
Since this is a Vue.js app with `vue-router`, you need to redirect all requests to `index.html`:
1.  In the Render dashboard, go to **Redirects/Rewrites**.
2.  Add a new rule:
    *   **Source:** `/*`
    *   **Destination:** `/index.html`
    *   **Action:** `Rewrite`

---

## 3. Post-Deployment Checklist
*   [ ] Verify that the Login flow works (emails are sent via Resend).
*   [ ] Verify that Trending movies load (TMDB API is connected).
*   [ ] Verify that adding to Watchlist persists across refreshes (Convex DB is working).
*   [ ] Verify that the "Watched" toggle correctly moves items between lists.
