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
  TVSeasonDetails,
} from "../types/tmdb";
import { httpClient } from "./convexClient";
import { api } from "../../convex/_generated/api";

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
    httpClient.action(api.tmdb.getTrending, { timeWindow }) as Promise<
      TMDBResponse<MediaItem>
    >,

  getTrendingMovies: (timeWindow: "day" | "week" = "week", page = 1) =>
    httpClient.action(api.tmdb.getTrendingMovies, {
      timeWindow,
      page,
    }) as Promise<TMDBResponse<MovieItem>>,

  getTrendingTV: (timeWindow: "day" | "week" = "week", page = 1) =>
    httpClient.action(api.tmdb.getTrendingTV, {
      timeWindow,
      page,
    }) as Promise<TMDBResponse<TVItem>>,

  getTrendingPeople: (timeWindow: "day" | "week" = "week", page = 1) =>
    httpClient.action(api.tmdb.getTrendingPeople, {
      timeWindow,
      page,
    }) as Promise<TMDBResponse<PersonItem>>,

  search: (query: string, type: SearchType = "multi", page = 1) =>
    httpClient.action(api.tmdb.search, {
      query,
      type,
      page,
    }) as Promise<TMDBResponse<MediaItem>>,

  searchMovies: (query: string, page = 1) =>
    httpClient.action(api.tmdb.searchMovies, {
      query,
      page,
    }) as Promise<TMDBResponse<MovieItem>>,

  searchTV: (query: string, page = 1) =>
    httpClient.action(api.tmdb.searchTV, {
      query,
      page,
    }) as Promise<TMDBResponse<TVItem>>,

  searchPeople: (query: string, page = 1) =>
    httpClient.action(api.tmdb.searchPeople, {
      query,
      page,
    }) as Promise<TMDBResponse<PersonItem>>,

  searchCollections: (query: string, page = 1) =>
    httpClient.action(api.tmdb.searchCollections, {
      query,
      page,
    }) as Promise<TMDBResponse<CollectionSearchItem>>,

  getDetails: (type: "movie" | "tv", id: number) =>
    httpClient.action(api.tmdb.getDetails, {
      type,
      id,
    }) as Promise<MediaDetails>,

  getCollection: (collectionId: number) =>
    httpClient.action(api.tmdb.getCollection, {
      collectionId,
    }) as Promise<TMDBCollection>,

  getPersonDetails: (personId: number) =>
    httpClient.action(api.tmdb.getPersonDetails, {
      personId,
    }) as Promise<PersonDetails>,

  getSeasonDetails: (seriesId: number, seasonNumber: number) =>
    httpClient.action(api.tmdb.getSeasonDetails, {
      seriesId,
      seasonNumber,
    }) as Promise<TVSeasonDetails>,

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
   * Generate srcset attribute for responsive episode still images
   * @param path - TMDB still image path
   * @returns srcset string for still images (w300, w780, original), or empty string if path is null
   */
  getStillSrcset: (path: string | null): string =>
    path
      ? `${IMAGE_BASE_URL}/w300${path} 300w, ${IMAGE_BASE_URL}/w780${path} 780w, ${IMAGE_BASE_URL}/original${path} 1920w`
      : "",

  /**
   * Default sizes attribute for episode still images
   */
  stillSizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",

  /**
   * Default sizes attribute for poster images in a responsive grid
   * Matches common grid breakpoints: 2 cols (mobile), 3 cols (sm), 4 cols (md), 5 cols (lg)
   */
  posterSizes:
    "(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw",

  /**
   * Default sizes attribute for backdrop images (full-width heroes)
   */
  backdropSizes: "100vw",

  /**
   * Default sizes attribute for profile images in grids
   */
  profileSizes: "(max-width: 640px) 96px, 185px",
};
