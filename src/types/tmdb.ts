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

export interface MediaDetails extends BaseMediaItem {
  media_type?: 'movie' | 'tv';
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  genres: { id: number; name: string }[];
  runtime?: number; // Movies
  episode_run_time?: number[]; // TV
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  production_companies?: ProductionCompany[];
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
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}