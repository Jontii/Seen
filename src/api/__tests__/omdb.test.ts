import { getRatings } from '../omdb';
import {
  fullRatingsResponse,
  partialRatingsResponse,
  freshRatingsResponse,
  rottenRatingsResponse,
  errorResponse,
} from '../../__fixtures__/omdbResponses';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockFetchResponse(data: unknown, ok = true) {
  mockFetch.mockResolvedValueOnce({
    ok,
    json: () => Promise.resolve(data),
  });
}

describe('omdb', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('sends correct URL with IMDB ID', async () => {
    mockFetchResponse(fullRatingsResponse);

    await getRatings('tt0137523');

    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain('i=tt0137523');
  });

  it('maps OMDB Ratings array to ExternalRatings', async () => {
    mockFetchResponse(fullRatingsResponse);

    const ratings = await getRatings('tt0137523');

    expect(ratings).toEqual({
      imdbScore: '8.8',
      rottenTomatoesScore: '79%',
      rottenTomatoesFresh: true,
      metacriticScore: '66/100',
    });
  });

  it('handles missing rating sources', async () => {
    mockFetchResponse(partialRatingsResponse);

    const ratings = await getRatings('tt0000001');

    expect(ratings).toEqual({
      imdbScore: '7.5',
      rottenTomatoesScore: null,
      rottenTomatoesFresh: null,
      metacriticScore: null,
    });
  });

  it('returns null for OMDB error response', async () => {
    mockFetchResponse(errorResponse);

    const ratings = await getRatings('tt9999999');

    expect(ratings).toBeNull();
  });

  it('returns null on network failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    const ratings = await getRatings('tt0137523');

    expect(ratings).toBeNull();
  });
});
