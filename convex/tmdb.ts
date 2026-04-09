"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

const BASE_URL = "https://api.themoviedb.org/3";
const MAX_SEARCH_QUERY_LENGTH = 100;
const MIN_PAGE = 1;
const MAX_PAGE = 500;

function validatePage(page: number): number {
  return Math.max(MIN_PAGE, Math.min(Math.floor(page), MAX_PAGE));
}

function sanitizeSearchParams(query: string, page: number) {
  const sanitizedQuery = query.trim().slice(0, MAX_SEARCH_QUERY_LENGTH);
  if (!sanitizedQuery) {
    throw new Error("Search query cannot be empty.");
  }
  return { query: sanitizedQuery, page: validatePage(page).toString() };
}

async function fetchTMDB<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  const token = process.env.TMDB_READ_TOKEN;
  if (!token) {
    throw new Error("TMDB_READ_TOKEN environment variable is not set.");
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.keys(params).forEach((key) => {
    const val = params[key];
    if (val !== undefined) url.searchParams.append(key, val);
  });

  const response = await fetch(url.toString(), {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `TMDB API Error: ${response.status} ${response.statusText} - ${errorData.status_message || "Unknown error"}`,
    );
  }

  return response.json();
}

const timeWindowValidator = v.union(v.literal("day"), v.literal("week"));

export const getTrending = action({
  args: { timeWindow: timeWindowValidator },
  handler: async (_ctx, args) => {
    return await fetchTMDB(`/trending/all/${args.timeWindow}`);
  },
});

export const getTrendingMovies = action({
  args: { timeWindow: timeWindowValidator, page: v.number() },
  handler: async (_ctx, args) => {
    return await fetchTMDB(`/trending/movie/${args.timeWindow}`, {
      page: validatePage(args.page).toString(),
    });
  },
});

export const getTrendingTV = action({
  args: { timeWindow: timeWindowValidator, page: v.number() },
  handler: async (_ctx, args) => {
    return await fetchTMDB(`/trending/tv/${args.timeWindow}`, {
      page: validatePage(args.page).toString(),
    });
  },
});

export const getTrendingPeople = action({
  args: { timeWindow: timeWindowValidator, page: v.number() },
  handler: async (_ctx, args) => {
    return await fetchTMDB(`/trending/person/${args.timeWindow}`, {
      page: validatePage(args.page).toString(),
    });
  },
});

export const search = action({
  args: { query: v.string(), type: v.string(), page: v.number() },
  handler: async (_ctx, args) => {
    const params = sanitizeSearchParams(args.query, args.page);
    return await fetchTMDB(`/search/${args.type}`, params);
  },
});

export const searchMovies = action({
  args: { query: v.string(), page: v.number() },
  handler: async (_ctx, args) => {
    const params = sanitizeSearchParams(args.query, args.page);
    return await fetchTMDB("/search/movie", params);
  },
});

export const searchTV = action({
  args: { query: v.string(), page: v.number() },
  handler: async (_ctx, args) => {
    const params = sanitizeSearchParams(args.query, args.page);
    return await fetchTMDB("/search/tv", params);
  },
});

export const searchPeople = action({
  args: { query: v.string(), page: v.number() },
  handler: async (_ctx, args) => {
    const params = sanitizeSearchParams(args.query, args.page);
    return await fetchTMDB("/search/person", params);
  },
});

export const searchCollections = action({
  args: { query: v.string(), page: v.number() },
  handler: async (_ctx, args) => {
    const params = sanitizeSearchParams(args.query, args.page);
    return await fetchTMDB("/search/collection", params);
  },
});

export const getDetails = action({
  args: {
    type: v.union(v.literal("movie"), v.literal("tv")),
    id: v.number(),
  },
  handler: async (_ctx, args) => {
    return await fetchTMDB(`/${args.type}/${args.id}`, {
      append_to_response: "credits,videos",
    });
  },
});

export const getCollection = action({
  args: { collectionId: v.number() },
  handler: async (_ctx, args) => {
    return await fetchTMDB(`/collection/${args.collectionId}`);
  },
});

export const getPersonDetails = action({
  args: { personId: v.number() },
  handler: async (_ctx, args) => {
    return await fetchTMDB(`/person/${args.personId}`, {
      append_to_response: "combined_credits",
    });
  },
});

export const getSeasonDetails = action({
  args: { seriesId: v.number(), seasonNumber: v.number() },
  handler: async (_ctx, args) => {
    return await fetchTMDB(`/tv/${args.seriesId}/season/${args.seasonNumber}`);
  },
});
