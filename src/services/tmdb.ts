import type {
  TMDBResponse,
  MediaItem,
  MediaDetails,
  TMDBCollection,
  PersonDetails,
} from "../types/tmdb";

const BASE_URL = "https://api.themoviedb.org/3";
const TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;

// Validation constants
const MAX_SEARCH_QUERY_LENGTH = 100;
const MIN_PAGE = 1;
const MAX_PAGE = 500; // TMDB's maximum page limit

if (!TOKEN) {
  console.warn("Token is not defined. TMDB requests will fail.");
}

const headers = {
  accept: "application/json",
  Authorization: `Bearer ${TOKEN}`,
};

async function fetchTMDB<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.keys(params).forEach((key) => {
    const val = params[key];
    if (val !== undefined) url.searchParams.append(key, val);
  });

  try {
    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText} - ${errorData.status_message || "Unknown error"}`,
      );
    }

    return response.json();
  } catch (error) {
    console.error(`fetchTMDB failed at ${endpoint}:`, error);
    throw error;
  }
}

export const tmdb = {
  getTrending: (timeWindow: "day" | "week" = "week") =>
    fetchTMDB<TMDBResponse<MediaItem>>(`/trending/all/${timeWindow}`),

  search: (query: string, page = 1) => {
    const sanitizedQuery = query.trim().slice(0, MAX_SEARCH_QUERY_LENGTH);

    if (!sanitizedQuery) {
      throw new Error("Search query cannot be empty.");
    }

    const validPage = Math.max(MIN_PAGE, Math.min(Math.floor(page), MAX_PAGE));

    return fetchTMDB<TMDBResponse<MediaItem>>("/search/multi", {
      query: sanitizedQuery,
      page: validPage.toString(),
    });
  },

  getDetails: (type: "movie" | "tv", id: number) =>
    fetchTMDB<MediaDetails>(`/${type}/${id}`, {
      append_to_response: "credits,videos",
    }),

  getCollection: (collectionId: number) =>
    fetchTMDB<TMDBCollection>(`/collection/${collectionId}`),

  getPersonDetails: (personId: number) =>
    fetchTMDB<PersonDetails>(`/person/${personId}`, {
      append_to_response: "combined_credits",
    }),

  getImageUrl: (path: string | null, size: "w500" | "original" = "w500") =>
    path
      ? `https://image.tmdb.org/t/p/${size}${path}`
      : "/placeholder-poster.png", // We'll need a placeholder
};
