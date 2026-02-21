import { ref, computed } from "vue";
import type { Ref } from "vue";

type ListItem = {
  tmdbId: number;
  mediaType: string;
  title: string;
  addedAt?: number;
  watchedAt?: number;
  voteAverage?: number;
  popularity?: number;
  releaseDate?: string;
  genres?: string[];
  originalLanguage?: string;
  status?: string;
};

export function useListFilters<T extends ListItem>(
  items: Ref<T[] | null>,
  dateField: "addedAt" | "watchedAt",
) {
  const sortBy = ref<string>("date-desc");
  const typeFilter = ref<string>("all");
  const genreFilter = ref<string>("");
  const languageFilter = ref<string>("");
  const statusFilter = ref<string>("");

  const availableGenres = computed<string[]>(() => {
    if (!items.value) return [];
    const all = items.value.flatMap((item) => item.genres ?? []);
    return [...new Set(all)].sort();
  });

  const availableLanguages = computed<string[]>(() => {
    if (!items.value) return [];
    const all = items.value
      .map((item) => item.originalLanguage)
      .filter((lang): lang is string => Boolean(lang));
    return [...new Set(all)].sort();
  });

  const availableStatuses = computed<string[]>(() => {
    if (!items.value) return [];
    const all = items.value
      .map((item) => item.status)
      .filter((s): s is string => Boolean(s));
    return [...new Set(all)].sort();
  });

  const filteredAndSorted = computed<T[]>(() => {
    if (!items.value) return [];

    let filtered = items.value;

    if (typeFilter.value !== "all") {
      filtered = filtered.filter((item) => item.mediaType === typeFilter.value);
    }

    if (genreFilter.value) {
      filtered = filtered.filter((item) =>
        (item.genres ?? []).includes(genreFilter.value),
      );
    }

    if (languageFilter.value) {
      filtered = filtered.filter(
        (item) => item.originalLanguage === languageFilter.value,
      );
    }

    if (statusFilter.value) {
      filtered = filtered.filter((item) => item.status === statusFilter.value);
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy.value) {
        case "date-desc":
          return (b[dateField] ?? 0) - (a[dateField] ?? 0);
        case "date-asc":
          return (a[dateField] ?? 0) - (b[dateField] ?? 0);
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "rating-desc":
          return (b.voteAverage ?? 0) - (a.voteAverage ?? 0);
        case "popularity-desc":
          return (b.popularity ?? 0) - (a.popularity ?? 0);
        case "year-desc": {
          const yearA = parseInt(a.releaseDate?.slice(0, 4) ?? "0", 10);
          const yearB = parseInt(b.releaseDate?.slice(0, 4) ?? "0", 10);
          return yearB - yearA;
        }
        case "year-asc": {
          const yearA = parseInt(a.releaseDate?.slice(0, 4) ?? "0", 10);
          const yearB = parseInt(b.releaseDate?.slice(0, 4) ?? "0", 10);
          return yearA - yearB;
        }
        default:
          return 0;
      }
    });
  });

  const hasActiveFilters = computed(
    () =>
      sortBy.value !== "date-desc" ||
      typeFilter.value !== "all" ||
      genreFilter.value !== "" ||
      languageFilter.value !== "" ||
      statusFilter.value !== "",
  );

  function clearFilters() {
    sortBy.value = "date-desc";
    typeFilter.value = "all";
    genreFilter.value = "";
    languageFilter.value = "";
    statusFilter.value = "";
  }

  return {
    sortBy,
    typeFilter,
    genreFilter,
    languageFilter,
    statusFilter,
    availableGenres,
    availableLanguages,
    availableStatuses,
    filteredAndSorted,
    hasActiveFilters,
    clearFilters,
  };
}
