import type {
  TMDBResponse,
  MediaItem,
  MovieItem,
  TVItem,
  PersonItem,
  MediaDetails,
  TMDBCollection,
  PersonDetails,
  CollectionSearchItem,
  SearchType,
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

// Utility functions for validation
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

// TMDB image size options
// Poster sizes: w92, w154, w185, w342, w500, w780, original
// Backdrop sizes: w300, w780, w1280, original
// Profile sizes: w45, w185, h632, original
type ImageSize =
  | "w92"
  | "w154"
  | "w185"
  | "w300"
  | "w342"
  | "w500"
  | "w780"
  | "w1280"
  | "original";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const PLACEHOLDER_IMAGE = "/placeholder-poster.svg";

export const tmdb = {
  getTrending: (timeWindow: "day" | "week" = "week") =>
    fetchTMDB<TMDBResponse<MediaItem>>(`/trending/all/${timeWindow}`),

  getTrendingMovies: (timeWindow: "day" | "week" = "week", page = 1) =>
    fetchTMDB<TMDBResponse<MovieItem>>(`/trending/movie/${timeWindow}`, {
      page: validatePage(page).toString(),
    }),

  getTrendingTV: (timeWindow: "day" | "week" = "week", page = 1) =>
    fetchTMDB<TMDBResponse<TVItem>>(`/trending/tv/${timeWindow}`, {
      page: validatePage(page).toString(),
    }),

  getTrendingPeople: (timeWindow: "day" | "week" = "week", page = 1) =>
    fetchTMDB<TMDBResponse<PersonItem>>(`/trending/person/${timeWindow}`, {
      page: validatePage(page).toString(),
    }),

  search: (query: string, type: SearchType = "multi", page = 1) =>
    fetchTMDB<TMDBResponse<MediaItem>>(
      `/search/${type}`,
      sanitizeSearchParams(query, page),
    ),

  searchMovies: (query: string, page = 1) =>
    fetchTMDB<TMDBResponse<MovieItem>>(
      "/search/movie",
      sanitizeSearchParams(query, page),
    ),

  searchTV: (query: string, page = 1) =>
    fetchTMDB<TMDBResponse<TVItem>>(
      "/search/tv",
      sanitizeSearchParams(query, page),
    ),

  searchPeople: (query: string, page = 1) =>
    fetchTMDB<TMDBResponse<PersonItem>>(
      "/search/person",
      sanitizeSearchParams(query, page),
    ),

  searchCollections: (query: string, page = 1) =>
    fetchTMDB<TMDBResponse<CollectionSearchItem>>(
      "/search/collection",
      sanitizeSearchParams(query, page),
    ),

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

  /**
   * Get a single image URL for a given path and size
   * @param path - TMDB image path (e.g., /abc123.jpg)
   * @param size - Image size (default: w500)
   * @returns Full image URL or placeholder if path is null
   */
  getImageUrl: (path: string | null, size: ImageSize = "w500") =>
    path ? `${IMAGE_BASE_URL}/${size}${path}` : PLACEHOLDER_IMAGE,

  /**
   * Generate srcset attribute for responsive poster images
   * @param path - TMDB image path
   * @returns srcset string for poster images (w300, w500, w780), or empty string if path is null
   */
  getPosterSrcset: (path: string | null): string =>
    path
      ? `${IMAGE_BASE_URL}/w300${path} 300w, ${IMAGE_BASE_URL}/w500${path} 500w, ${IMAGE_BASE_URL}/w780${path} 780w`
      : "",

  /**
   * Generate srcset attribute for responsive backdrop images
   * @param path - TMDB backdrop path
   * @returns srcset string for backdrop images (w780, w1280, original), or empty string if path is null
   */
  getBackdropSrcset: (path: string | null): string =>
    path
      ? `${IMAGE_BASE_URL}/w780${path} 780w, ${IMAGE_BASE_URL}/w1280${path} 1280w, ${IMAGE_BASE_URL}/original${path} 1920w`
      : "",

  /**
   * Generate srcset attribute for responsive profile images
   * @param path - TMDB profile path
   * @returns srcset string for profile images (w185, w500), or empty string if path is null
   */
  getProfileSrcset: (path: string | null): string =>
    path
      ? `${IMAGE_BASE_URL}/w185${path} 185w, ${IMAGE_BASE_URL}/w500${path} 500w`
      : "",

  /**
   * Default sizes attribute for poster images in a responsive grid
   * Matches common grid breakpoints: 2 cols (mobile), 3 cols (sm), 4 cols (md), 5 cols (lg)
   */
  posterSizes: "(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw",

  /**
   * Default sizes attribute for backdrop images (full-width heroes)
   */
  backdropSizes: "100vw",

  /**
   * Default sizes attribute for profile images in grids
   */
  profileSizes: "(max-width: 640px) 96px, 185px",
};
