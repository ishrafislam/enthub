import type { TMDBResponse, MediaItem, MediaDetails } from '../types/tmdb';

const BASE_URL = 'https://api.themoviedb.org/3';
const TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;

const headers = {
  accept: 'application/json',
  Authorization: `Bearer ${TOKEN}`,
};

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    throw new Error(`TMDB Error: ${response.statusText}`);
  }

  return response.json();
}

export const tmdb = {
  getTrending: (timeWindow: 'day' | 'week' = 'week') => 
    fetchTMDB<TMDBResponse<MediaItem>>(`/trending/all/${timeWindow}`),

  search: (query: string, page = 1) =>
    fetchTMDB<TMDBResponse<MediaItem>>('/search/multi', { query, page: page.toString() }),

  getDetails: (type: 'movie' | 'tv', id: number) =>
    fetchTMDB<MediaDetails>(`/${type}/${id}`, { append_to_response: 'credits,videos' }),
    
  getImageUrl: (path: string | null, size: 'w500' | 'original' = 'w500') => 
    path ? `https://image.tmdb.org/t/p/${size}${path}` : '/placeholder-poster.png', // We'll need a placeholder
};
