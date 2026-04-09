import { describe, it, expect, vi, beforeEach } from "vitest";
import { tmdb } from "../tmdb";

// Mock the convexClient module
const mockAction = vi.fn();
vi.mock("../convexClient", () => ({
  httpClient: {
    action: (...args: any[]) => mockAction(...args),
  },
}));

// Mock the Convex generated API
vi.mock("../../../convex/_generated/api", () => ({
  api: {
    tmdb: {
      getTrending: "tmdb:getTrending",
      getTrendingMovies: "tmdb:getTrendingMovies",
      getTrendingTV: "tmdb:getTrendingTV",
      getTrendingPeople: "tmdb:getTrendingPeople",
      search: "tmdb:search",
      searchMovies: "tmdb:searchMovies",
      searchTV: "tmdb:searchTV",
      searchPeople: "tmdb:searchPeople",
      searchCollections: "tmdb:searchCollections",
      getDetails: "tmdb:getDetails",
      getCollection: "tmdb:getCollection",
      getPersonDetails: "tmdb:getPersonDetails",
      getSeasonDetails: "tmdb:getSeasonDetails",
    },
  },
}));

describe("tmdb service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("getImageUrl", () => {
    it("should return placeholder when path is null", () => {
      const result = tmdb.getImageUrl(null);
      expect(result).toBe("/placeholder-poster.svg");
    });

    it("should return correct URL with default size (w500)", () => {
      const result = tmdb.getImageUrl("/abc123.jpg");
      expect(result).toBe("https://image.tmdb.org/t/p/w500/abc123.jpg");
    });

    it("should return correct URL with original size", () => {
      const result = tmdb.getImageUrl("/abc123.jpg", "original");
      expect(result).toBe("https://image.tmdb.org/t/p/original/abc123.jpg");
    });

    it("should handle empty string path", () => {
      const result = tmdb.getImageUrl("");
      expect(result).toBe("/placeholder-poster.svg");
    });
  });

  describe("getTrending", () => {
    const mockTrendingResponse = {
      page: 1,
      results: [
        { id: 1, title: "Movie 1", media_type: "movie" },
        { id: 2, name: "TV Show 1", media_type: "tv" },
      ],
      total_pages: 10,
      total_results: 200,
    };

    it("should call Convex action with default timeWindow (week)", async () => {
      mockAction.mockResolvedValueOnce(mockTrendingResponse);

      const result = await tmdb.getTrending();

      expect(mockAction).toHaveBeenCalledWith("tmdb:getTrending", {
        timeWindow: "week",
      });
      expect(result).toEqual(mockTrendingResponse);
    });

    it("should call Convex action with day timeWindow", async () => {
      mockAction.mockResolvedValueOnce(mockTrendingResponse);

      await tmdb.getTrending("day");

      expect(mockAction).toHaveBeenCalledWith("tmdb:getTrending", {
        timeWindow: "day",
      });
    });

    it("should throw error on action failure", async () => {
      mockAction.mockRejectedValueOnce(
        new Error("TMDB API Error: 401 Unauthorized - Invalid API key"),
      );

      await expect(tmdb.getTrending()).rejects.toThrow(
        "TMDB API Error: 401 Unauthorized - Invalid API key",
      );
    });

    it("should handle network errors", async () => {
      mockAction.mockRejectedValueOnce(new Error("Network error"));

      await expect(tmdb.getTrending()).rejects.toThrow("Network error");
    });
  });

  describe("search", () => {
    const mockSearchResponse = {
      page: 1,
      results: [{ id: 1, title: "Test Movie", media_type: "movie" }],
      total_pages: 1,
      total_results: 1,
    };

    it("should search with query and default page", async () => {
      mockAction.mockResolvedValueOnce(mockSearchResponse);

      const result = await tmdb.search("test movie");

      expect(mockAction).toHaveBeenCalledWith("tmdb:search", {
        query: "test movie",
        type: "multi",
        page: 1,
      });
      expect(result).toEqual(mockSearchResponse);
    });

    it("should search with specific page", async () => {
      mockAction.mockResolvedValueOnce(mockSearchResponse);

      await tmdb.search("test", "multi", 5);

      expect(mockAction).toHaveBeenCalledWith("tmdb:search", {
        query: "test",
        type: "multi",
        page: 5,
      });
    });

    it("should search with different search types", async () => {
      mockAction.mockResolvedValueOnce(mockSearchResponse);

      await tmdb.search("test", "movie", 1);

      expect(mockAction).toHaveBeenCalledWith("tmdb:search", {
        query: "test",
        type: "movie",
        page: 1,
      });
    });

    it("should handle empty results", async () => {
      const emptyResponse = {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      };

      mockAction.mockResolvedValueOnce(emptyResponse);

      const result = await tmdb.search("xyznonexistent");
      expect(result.results).toHaveLength(0);
    });
  });

  describe("getDetails", () => {
    const mockMovieDetails = {
      id: 550,
      title: "Fight Club",
      overview: "A ticking-Loss bomb...",
      release_date: "1999-10-15",
      runtime: 139,
      vote_average: 8.4,
      credits: {
        cast: [{ id: 1, name: "Brad Pitt" }],
        crew: [{ id: 2, name: "David Fincher" }],
      },
      videos: {
        results: [{ id: "abc", key: "xyz", type: "Trailer" }],
      },
    };

    it("should fetch movie details via Convex action", async () => {
      mockAction.mockResolvedValueOnce(mockMovieDetails);

      const result = await tmdb.getDetails("movie", 550);

      expect(mockAction).toHaveBeenCalledWith("tmdb:getDetails", {
        type: "movie",
        id: 550,
      });
      expect(result).toEqual(mockMovieDetails);
    });

    it("should fetch TV show details", async () => {
      const mockTVDetails = {
        id: 1399,
        name: "Game of Thrones",
        overview: "Seven noble families...",
        first_air_date: "2011-04-17",
        number_of_seasons: 8,
      };

      mockAction.mockResolvedValueOnce(mockTVDetails);

      const result = await tmdb.getDetails("tv", 1399);

      expect(mockAction).toHaveBeenCalledWith("tmdb:getDetails", {
        type: "tv",
        id: 1399,
      });
      expect(result.name).toBe("Game of Thrones");
    });

    it("should handle non-existent media", async () => {
      mockAction.mockRejectedValueOnce(
        new Error("TMDB API Error: 404 Not Found"),
      );

      await expect(tmdb.getDetails("movie", 99999999)).rejects.toThrow(
        "TMDB API Error: 404",
      );
    });
  });

  describe("getCollection", () => {
    const mockCollection = {
      id: 10,
      name: "Star Wars Collection",
      overview: "A long time ago in a galaxy far, far away...",
      poster_path: "/abc.jpg",
      backdrop_path: "/def.jpg",
      parts: [
        { id: 11, title: "A New Hope" },
        { id: 12, title: "The Empire Strikes Back" },
      ],
    };

    it("should fetch collection details via Convex action", async () => {
      mockAction.mockResolvedValueOnce(mockCollection);

      const result = await tmdb.getCollection(10);

      expect(mockAction).toHaveBeenCalledWith("tmdb:getCollection", {
        collectionId: 10,
      });
      expect(result.name).toBe("Star Wars Collection");
      expect(result.parts).toHaveLength(2);
    });
  });

  describe("getPersonDetails", () => {
    const mockPerson = {
      id: 287,
      name: "Brad Pitt",
      biography: "William Bradley Pitt is an American actor...",
      birthday: "1963-12-18",
      place_of_birth: "Shawnee, Oklahoma, USA",
      profile_path: "/xyz.jpg",
      combined_credits: {
        cast: [{ id: 550, title: "Fight Club" }],
        crew: [],
      },
    };

    it("should fetch person details via Convex action", async () => {
      mockAction.mockResolvedValueOnce(mockPerson);

      const result = await tmdb.getPersonDetails(287);

      expect(mockAction).toHaveBeenCalledWith("tmdb:getPersonDetails", {
        personId: 287,
      });
      expect(result.name).toBe("Brad Pitt");
      expect(result.combined_credits?.cast).toHaveLength(1);
    });
  });

  describe("error handling", () => {
    it("should propagate Convex action errors", async () => {
      mockAction.mockRejectedValueOnce(
        new Error("TMDB API Error: 500 Internal Server Error - Unknown error"),
      );

      await expect(tmdb.getTrending()).rejects.toThrow(
        "TMDB API Error: 500 Internal Server Error - Unknown error",
      );
    });

    it("should handle action timeout errors", async () => {
      mockAction.mockRejectedValueOnce(new Error("Action timed out"));

      await expect(tmdb.getTrending()).rejects.toThrow("Action timed out");
    });
  });
});
