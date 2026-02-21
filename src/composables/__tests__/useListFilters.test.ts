import { describe, it, expect } from "vitest";
import { ref, defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { useListFilters } from "../useListFilters";

function withSetup<T>(composable: () => T): { result: T; unmount: () => void } {
  let result!: T;
  const TestComponent = defineComponent({
    setup() {
      result = composable();
      return () => h("div");
    },
  });
  const wrapper = mount(TestComponent);
  return { result, unmount: () => wrapper.unmount() };
}

const fixtures = [
  {
    tmdbId: 1,
    mediaType: "movie",
    title: "Action Movie",
    addedAt: 1000,
    watchedAt: 1000,
    voteAverage: 8.5,
    popularity: 500,
    releaseDate: "2022-06-15",
    genres: ["Action", "Thriller"],
    originalLanguage: "en",
    status: "Released",
  },
  {
    tmdbId: 2,
    mediaType: "tv",
    title: "Drama Series",
    addedAt: 2000,
    watchedAt: 2000,
    voteAverage: 7.2,
    popularity: 300,
    releaseDate: "2020-01-10",
    genres: ["Drama", "Crime"],
    originalLanguage: "en",
    status: "Ended",
  },
  {
    tmdbId: 3,
    mediaType: "movie",
    title: "Comedy Film",
    addedAt: 3000,
    watchedAt: 3000,
    voteAverage: 6.0,
    popularity: 200,
    releaseDate: "2018-03-20",
    genres: ["Action", "Comedy"],
    originalLanguage: "fr",
    status: "Released",
  },
  {
    tmdbId: 4,
    mediaType: "tv",
    title: "Anime Show",
    addedAt: 500,
    watchedAt: 500,
    voteAverage: 9.0,
    popularity: 800,
    releaseDate: "2021-04-01",
    genres: ["Animation"],
    originalLanguage: "ja",
    status: "Returning Series",
  },
  {
    // Pre-schema item — no optional fields
    tmdbId: 5,
    mediaType: "movie",
    title: "Old Film",
    addedAt: 100,
    watchedAt: 100,
  },
  {
    tmdbId: 6,
    mediaType: "movie",
    title: "Blockbuster",
    addedAt: 4000,
    watchedAt: 4000,
    voteAverage: 7.8,
    popularity: 1200,
    // No releaseDate
    genres: ["Action", "Drama"],
    originalLanguage: "en",
    status: "Released",
  },
];

describe("useListFilters", () => {
  it("default state — hasActiveFilters is false, sortBy is date-desc", () => {
    const items = ref([...fixtures]);
    const { result } = withSetup(() => useListFilters(items, "addedAt"));

    expect(result.hasActiveFilters.value).toBe(false);
    expect(result.sortBy.value).toBe("date-desc");
    expect(result.typeFilter.value).toBe("all");
    expect(result.genreFilter.value).toBe("");
    expect(result.languageFilter.value).toBe("");
    expect(result.statusFilter.value).toBe("");
  });

  it("availableGenres — sorted, deduplicated, missing-field items skipped", () => {
    const items = ref([...fixtures]);
    const { result } = withSetup(() => useListFilters(items, "addedAt"));

    expect(result.availableGenres.value).toEqual([
      "Action",
      "Animation",
      "Comedy",
      "Crime",
      "Drama",
      "Thriller",
    ]);
  });

  it("availableLanguages — sorted, deduplicated", () => {
    const items = ref([...fixtures]);
    const { result } = withSetup(() => useListFilters(items, "addedAt"));

    expect(result.availableLanguages.value).toEqual(["en", "fr", "ja"]);
  });

  it("availableStatuses — sorted, deduplicated", () => {
    const items = ref([...fixtures]);
    const { result } = withSetup(() => useListFilters(items, "addedAt"));

    expect(result.availableStatuses.value).toEqual([
      "Ended",
      "Released",
      "Returning Series",
    ]);
  });

  it("type filter 'movie' — only movies in result", () => {
    const items = ref([...fixtures]);
    const { result } = withSetup(() => useListFilters(items, "addedAt"));

    result.typeFilter.value = "movie";

    const types = result.filteredAndSorted.value.map((i) => i.mediaType);
    expect(types.every((t) => t === "movie")).toBe(true);
    expect(result.filteredAndSorted.value.length).toBe(4);
  });

  it("genre filter — only matching items in result", () => {
    const items = ref([...fixtures]);
    const { result } = withSetup(() => useListFilters(items, "addedAt"));

    result.genreFilter.value = "Drama";

    const titles = result.filteredAndSorted.value.map((i) => i.title);
    expect(titles).toContain("Drama Series");
    expect(titles).toContain("Blockbuster");
    expect(titles).not.toContain("Action Movie");
    expect(titles).not.toContain("Comedy Film");
  });

  it("combined type + genre filter", () => {
    const items = ref([...fixtures]);
    const { result } = withSetup(() => useListFilters(items, "addedAt"));

    result.typeFilter.value = "movie";
    result.genreFilter.value = "Action";

    const results = result.filteredAndSorted.value;
    expect(results.every((i) => i.mediaType === "movie")).toBe(true);
    expect(results.every((i) => (i.genres ?? []).includes("Action"))).toBe(
      true,
    );
    expect(results.map((i) => i.title)).toContain("Action Movie");
    expect(results.map((i) => i.title)).not.toContain("Drama Series");
  });

  it("sort title-asc — alphabetical order", () => {
    const items = ref([...fixtures]);
    const { result } = withSetup(() => useListFilters(items, "addedAt"));

    result.sortBy.value = "title-asc";

    const titles = result.filteredAndSorted.value.map((i) => i.title);
    const sorted = [...titles].sort((a, b) => a.localeCompare(b));
    expect(titles).toEqual(sorted);
  });

  it("sort title-desc — reverse alphabetical order", () => {
    const items = ref([...fixtures]);
    const { result } = withSetup(() => useListFilters(items, "addedAt"));

    result.sortBy.value = "title-desc";

    const titles = result.filteredAndSorted.value.map((i) => i.title);
    const sorted = [...titles].sort((a, b) => b.localeCompare(a));
    expect(titles).toEqual(sorted);
  });

  it("sort date-desc using addedAt", () => {
    const items = ref([...fixtures]);
    const { result } = withSetup(() => useListFilters(items, "addedAt"));

    result.sortBy.value = "date-desc";

    const timestamps = result.filteredAndSorted.value.map(
      (i) => i.addedAt ?? 0,
    );
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i - 1]).toBeGreaterThanOrEqual(timestamps[i]!);
    }
  });

  it("sort date-asc using addedAt", () => {
    const items = ref([...fixtures]);
    const { result } = withSetup(() => useListFilters(items, "addedAt"));

    result.sortBy.value = "date-asc";

    const timestamps = result.filteredAndSorted.value.map(
      (i) => i.addedAt ?? 0,
    );
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i - 1]).toBeLessThanOrEqual(timestamps[i]!);
    }
  });

  it("sort date-desc using watchedAt", () => {
    const items = ref([...fixtures]);
    const { result } = withSetup(() => useListFilters(items, "watchedAt"));

    result.sortBy.value = "date-desc";

    const timestamps = result.filteredAndSorted.value.map(
      (i) => i.watchedAt ?? 0,
    );
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i - 1]).toBeGreaterThanOrEqual(timestamps[i]!);
    }
  });

  it("sort year-desc — items without releaseDate sort last", () => {
    const items = ref([...fixtures]);
    const { result } = withSetup(() => useListFilters(items, "addedAt"));

    result.sortBy.value = "year-desc";

    const sorted = result.filteredAndSorted.value;
    // Items without releaseDate (tmdbId 5 and 6) should be at the end
    // tmdbId 5 has no releaseDate, tmdbId 6 has no releaseDate
    const withoutDate = sorted.filter((i) => !i.releaseDate);
    const withDate = sorted.filter((i) => i.releaseDate);

    // All items without a date should appear after all items with a date
    if (withDate.length > 0 && withoutDate.length > 0) {
      const lastWithDateIdx = sorted.indexOf(withDate[withDate.length - 1]!);
      const firstWithoutDateIdx = sorted.indexOf(withoutDate[0]!);
      expect(firstWithoutDateIdx).toBeGreaterThan(lastWithDateIdx);
    }
  });

  it("sort year-asc — items without releaseDate sort first (year 0)", () => {
    const items = ref([...fixtures]);
    const { result } = withSetup(() => useListFilters(items, "addedAt"));

    result.sortBy.value = "year-asc";

    const sorted = result.filteredAndSorted.value;
    const withoutDate = sorted.filter((i) => !i.releaseDate);
    const withDate = sorted.filter((i) => i.releaseDate);

    // Items without releaseDate map to year 0, so they sort first in asc
    if (withDate.length > 0 && withoutDate.length > 0) {
      const lastWithoutDateIdx = sorted.indexOf(
        withoutDate[withoutDate.length - 1]!,
      );
      const firstWithDateIdx = sorted.indexOf(withDate[0]!);
      expect(firstWithDateIdx).toBeGreaterThan(lastWithoutDateIdx);
    }
  });

  it("sort rating-desc — items without voteAverage sort last", () => {
    const items = ref([...fixtures]);
    const { result } = withSetup(() => useListFilters(items, "addedAt"));

    result.sortBy.value = "rating-desc";

    const sorted = result.filteredAndSorted.value;
    const withRating = sorted.filter((i) => i.voteAverage !== undefined);
    const withoutRating = sorted.filter((i) => i.voteAverage === undefined);

    if (withRating.length > 0 && withoutRating.length > 0) {
      const lastWithRatingIdx = sorted.indexOf(
        withRating[withRating.length - 1]!,
      );
      const firstWithoutRatingIdx = sorted.indexOf(withoutRating[0]!);
      expect(firstWithoutRatingIdx).toBeGreaterThan(lastWithRatingIdx);
    }

    // Verify descending order among rated items
    const ratings = withRating.map((i) => i.voteAverage ?? 0);
    for (let i = 1; i < ratings.length; i++) {
      expect(ratings[i - 1]).toBeGreaterThanOrEqual(ratings[i]!);
    }
  });

  it("clearFilters — all state resets, hasActiveFilters becomes false", () => {
    const items = ref([...fixtures]);
    const { result } = withSetup(() => useListFilters(items, "addedAt"));

    result.sortBy.value = "title-asc";
    result.typeFilter.value = "movie";
    result.genreFilter.value = "Action";
    result.languageFilter.value = "en";
    result.statusFilter.value = "Released";

    expect(result.hasActiveFilters.value).toBe(true);

    result.clearFilters();

    expect(result.sortBy.value).toBe("date-desc");
    expect(result.typeFilter.value).toBe("all");
    expect(result.genreFilter.value).toBe("");
    expect(result.languageFilter.value).toBe("");
    expect(result.statusFilter.value).toBe("");
    expect(result.hasActiveFilters.value).toBe(false);
  });

  it("null items input — all computeds return [], no error thrown", () => {
    const items = ref<typeof fixtures | null>(null);
    const { result } = withSetup(() => useListFilters(items, "addedAt"));

    expect(result.availableGenres.value).toEqual([]);
    expect(result.availableLanguages.value).toEqual([]);
    expect(result.availableStatuses.value).toEqual([]);
    expect(result.filteredAndSorted.value).toEqual([]);
  });
});
