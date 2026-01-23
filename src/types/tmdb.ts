export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export type MediaItem = MovieItem | TVItem | PersonItem;

interface BaseMediaItem {
  id: number;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  genre_ids: number[];
  media_type: 'movie' | 'tv' | 'person';
}

export interface MovieItem extends BaseMediaItem {
  media_type: 'movie';
  title: string;
  release_date: string;
}

export interface TVItem extends BaseMediaItem {
  media_type: 'tv';
  name: string;
  first_air_date: string;
}

export interface PersonItem {
  media_type: 'person';
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface MediaDetails {
  id: number;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  genre_ids: number[];
  media_type?: 'movie' | 'tv';
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  original_language?: string;
  genres: { id: number; name: string }[];
  runtime?: number; // Movies
  episode_run_time?: number[]; // TV
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  production_companies?: ProductionCompany[];
  belongs_to_collection?: BelongsToCollection | null; // Movie collections
  credits: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  videos: {
    results: Video[];
  };
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  popularity?: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

// Collection types
export interface BelongsToCollection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface TMDBCollectionPart {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
}

export interface TMDBCollection {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  parts: TMDBCollectionPart[];
}

// Person types
export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  gender: number; // 0: Not specified, 1: Female, 2: Male, 3: Non-binary
  known_for_department: string;
  profile_path: string | null;
  popularity: number;
  place_of_birth: string | null;
  also_known_as: string[];
  homepage: string | null;
  imdb_id: string | null;
  combined_credits?: PersonCombinedCredits;
}

export interface PersonCombinedCredits {
  cast: PersonCastCredit[];
  crew: PersonCrewCredit[];
}

export interface PersonCastCredit {
  id: number;
  title?: string;
  name?: string;
  media_type: 'movie' | 'tv';
  character: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  episode_count?: number;
}

export interface PersonCrewCredit {
  id: number;
  title?: string;
  name?: string;
  media_type: 'movie' | 'tv';
  job: string;
  department: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
}
