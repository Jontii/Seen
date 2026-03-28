import { searchMulti, getTrending, getDetails, getImageUrl } from '../tmdb';
import {
  searchMultiResponse,
  emptySearchResponse,
  trendingResponse,
  detailMovieResponse,
  detailTvResponse,
} from '../../__fixtures__/tmdbResponses';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockFetchResponse(data: unknown, ok = true, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok,
    status,
    statusText: ok ? 'OK' : 'Not Found',
    json: () => Promise.resolve(data),
  });
}

describe('tmdb', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('searchMulti', () => {
    it('sends correct URL with encoded query', async () => {
      mockFetchResponse(searchMultiResponse);

      await searchMulti('fight club');

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('/search/multi');
      expect(calledUrl).toContain('query=fight+club');
    });

    it('maps raw TMDB response to clean MediaItem array', async () => {
      mockFetchResponse(searchMultiResponse);

      const results = await searchMulti('fight');

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        tmdbId: 550,
        imdbId: null,
        mediaType: 'movie',
        title: 'Fight Club',
        posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        year: '1999',
        overview: 'A ticking-Loss insomnia movie.',
      });
    });

    it('filters to movie and tv only, excludes person results', async () => {
      mockFetchResponse(searchMultiResponse);

      const results = await searchMulti('actor');

      const types = results.map((r) => r.mediaType);
      expect(types).not.toContain('person');
      expect(results).toHaveLength(2);
    });

    it('returns empty array for no results', async () => {
      mockFetchResponse(emptySearchResponse);

      const results = await searchMulti('xyznonexistent');

      expect(results).toEqual([]);
    });

    it('throws on non-200 status', async () => {
      mockFetchResponse(null, false, 401);

      await expect(searchMulti('test')).rejects.toThrow('TMDB API error');
    });

    it('throws on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(searchMulti('test')).rejects.toThrow('Network error');
    });
  });

  describe('getTrending', () => {
    it('hits the correct endpoint', async () => {
      mockFetchResponse(trendingResponse);

      await getTrending();

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('/trending/all/week');
    });

    it('maps response correctly', async () => {
      mockFetchResponse(trendingResponse);

      const results = await getTrending();

      expect(results).toHaveLength(1);
      expect(results[0].tmdbId).toBe(123);
      expect(results[0].title).toBe('Trending Movie');
    });
  });

  describe('getDetails', () => {
    it('includes mediaType in URL path for movies', async () => {
      mockFetchResponse(detailMovieResponse);

      await getDetails(550, 'movie');

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('/movie/550');
      expect(calledUrl).toContain('append_to_response=credits%2Cexternal_ids');
    });

    it('includes mediaType in URL path for TV', async () => {
      mockFetchResponse(detailTvResponse);

      await getDetails(1399, 'tv');

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('/tv/1399');
    });

    it('maps full movie detail response', async () => {
      mockFetchResponse(detailMovieResponse);

      const detail = await getDetails(550, 'movie');

      expect(detail.tmdbId).toBe(550);
      expect(detail.title).toBe('Fight Club');
      expect(detail.runtime).toBe(139);
      expect(detail.seasons).toBeNull();
      expect(detail.genres).toEqual(['Drama', 'Thriller']);
      expect(detail.imdbId).toBe('tt0137523');
      expect(detail.cast).toHaveLength(2);
      expect(detail.cast[0].name).toBe('Edward Norton');
      expect(detail.cast[0].character).toBe('The Narrator');
    });

    it('maps full TV detail response', async () => {
      mockFetchResponse(detailTvResponse);

      const detail = await getDetails(1399, 'tv');

      expect(detail.title).toBe('Game of Thrones');
      expect(detail.seasons).toBe(8);
      expect(detail.runtime).toBeNull();
    });
  });

  describe('getImageUrl', () => {
    it('returns null for null path', () => {
      expect(getImageUrl(null)).toBeNull();
    });

    it('constructs correct URL with default size', () => {
      expect(getImageUrl('/abc.jpg')).toBe('https://image.tmdb.org/t/p/w500/abc.jpg');
    });

    it('constructs correct URL with custom size', () => {
      expect(getImageUrl('/abc.jpg', 'w92')).toBe('https://image.tmdb.org/t/p/w92/abc.jpg');
    });
  });
});
