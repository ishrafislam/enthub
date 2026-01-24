import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { tmdb } from '../tmdb'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock console.warn and console.error
vi.spyOn(console, 'warn').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})

describe('tmdb service', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getImageUrl', () => {
    it('should return placeholder when path is null', () => {
      const result = tmdb.getImageUrl(null)
      expect(result).toBe('/placeholder-poster.png')
    })

    it('should return correct URL with default size (w500)', () => {
      const result = tmdb.getImageUrl('/abc123.jpg')
      expect(result).toBe('https://image.tmdb.org/t/p/w500/abc123.jpg')
    })

    it('should return correct URL with original size', () => {
      const result = tmdb.getImageUrl('/abc123.jpg', 'original')
      expect(result).toBe('https://image.tmdb.org/t/p/original/abc123.jpg')
    })

    it('should handle empty string path', () => {
      const result = tmdb.getImageUrl('')
      expect(result).toBe('/placeholder-poster.png')
    })
  })

  describe('getTrending', () => {
    const mockTrendingResponse = {
      page: 1,
      results: [
        { id: 1, title: 'Movie 1', media_type: 'movie' },
        { id: 2, name: 'TV Show 1', media_type: 'tv' },
      ],
      total_pages: 10,
      total_results: 200,
    }

    it('should fetch trending content with default timeWindow (week)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTrendingResponse),
      })

      const result = await tmdb.getTrending()

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/trending/all/week',
        expect.objectContaining({
          headers: expect.objectContaining({
            accept: 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockTrendingResponse)
    })

    it('should fetch trending content with day timeWindow', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTrendingResponse),
      })

      await tmdb.getTrending('day')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/trending/all/day',
        expect.any(Object)
      )
    })

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ status_message: 'Invalid API key' }),
      })

      await expect(tmdb.getTrending()).rejects.toThrow(
        'TMDB API Error: 401 Unauthorized - Invalid API key'
      )
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(tmdb.getTrending()).rejects.toThrow('Network error')
    })
  })

  describe('search', () => {
    const mockSearchResponse = {
      page: 1,
      results: [
        { id: 1, title: 'Test Movie', media_type: 'movie' },
      ],
      total_pages: 1,
      total_results: 1,
    }

    it('should search with query and default page', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSearchResponse),
      })

      const result = await tmdb.search('test movie')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/search/multi'),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('query=test+movie'),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        expect.any(Object)
      )
      expect(result).toEqual(mockSearchResponse)
    })

    it('should search with specific page', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSearchResponse),
      })

      await tmdb.search('test', 5)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=5'),
        expect.any(Object)
      )
    })

    it('should handle empty results', async () => {
      const emptyResponse = {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(emptyResponse),
      })

      const result = await tmdb.search('xyznonexistent')
      expect(result.results).toHaveLength(0)
    })
  })

  describe('getDetails', () => {
    const mockMovieDetails = {
      id: 550,
      title: 'Fight Club',
      overview: 'A ticking-Loss bomb...',
      release_date: '1999-10-15',
      runtime: 139,
      vote_average: 8.4,
      credits: {
        cast: [{ id: 1, name: 'Brad Pitt' }],
        crew: [{ id: 2, name: 'David Fincher' }],
      },
      videos: {
        results: [{ id: 'abc', key: 'xyz', type: 'Trailer' }],
      },
    }

    it('should fetch movie details with credits and videos', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMovieDetails),
      })

      const result = await tmdb.getDetails('movie', 550)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/movie/550'),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('append_to_response=credits%2Cvideos'),
        expect.any(Object)
      )
      expect(result).toEqual(mockMovieDetails)
    })

    it('should fetch TV show details', async () => {
      const mockTVDetails = {
        id: 1399,
        name: 'Game of Thrones',
        overview: 'Seven noble families...',
        first_air_date: '2011-04-17',
        number_of_seasons: 8,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTVDetails),
      })

      const result = await tmdb.getDetails('tv', 1399)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tv/1399'),
        expect.any(Object)
      )
      expect(result.name).toBe('Game of Thrones')
    })

    it('should handle non-existent media', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ status_message: 'The resource you requested could not be found.' }),
      })

      await expect(tmdb.getDetails('movie', 99999999)).rejects.toThrow('TMDB API Error: 404')
    })
  })

  describe('getCollection', () => {
    const mockCollection = {
      id: 10,
      name: 'Star Wars Collection',
      overview: 'A long time ago in a galaxy far, far away...',
      poster_path: '/abc.jpg',
      backdrop_path: '/def.jpg',
      parts: [
        { id: 11, title: 'A New Hope' },
        { id: 12, title: 'The Empire Strikes Back' },
      ],
    }

    it('should fetch collection details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCollection),
      })

      const result = await tmdb.getCollection(10)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/collection/10',
        expect.any(Object)
      )
      expect(result.name).toBe('Star Wars Collection')
      expect(result.parts).toHaveLength(2)
    })
  })

  describe('getPersonDetails', () => {
    const mockPerson = {
      id: 287,
      name: 'Brad Pitt',
      biography: 'William Bradley Pitt is an American actor...',
      birthday: '1963-12-18',
      place_of_birth: 'Shawnee, Oklahoma, USA',
      profile_path: '/xyz.jpg',
      combined_credits: {
        cast: [{ id: 550, title: 'Fight Club' }],
        crew: [],
      },
    }

    it('should fetch person details with combined credits', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPerson),
      })

      const result = await tmdb.getPersonDetails(287)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/person/287'),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('append_to_response=combined_credits'),
        expect.any(Object)
      )
      expect(result.name).toBe('Brad Pitt')
      expect(result.combined_credits?.cast).toHaveLength(1)
    })
  })

  describe('error handling', () => {
    it('should handle API returning error without status_message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({}),
      })

      await expect(tmdb.getTrending()).rejects.toThrow(
        'TMDB API Error: 500 Internal Server Error - Unknown error'
      )
    })

    it('should handle API returning non-JSON error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        json: () => Promise.reject(new Error('Invalid JSON')),
      })

      await expect(tmdb.getTrending()).rejects.toThrow(
        'TMDB API Error: 502 Bad Gateway - Unknown error'
      )
    })
  })
})
