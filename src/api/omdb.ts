import { ExternalRatings } from './types';

const OMDB_BASE_URL = 'https://www.omdbapi.com';
const API_KEY = process.env.EXPO_PUBLIC_OMDB_API_KEY;

interface OmdbRating {
  Source: string;
  Value: string;
}

interface OmdbResponse {
  Response: string;
  Ratings?: OmdbRating[];
  Error?: string;
}

export async function getRatings(imdbId: string): Promise<ExternalRatings | null> {
  const url = new URL(OMDB_BASE_URL);
  url.searchParams.set('apikey', API_KEY ?? '');
  url.searchParams.set('i', imdbId);

  const response = await fetch(url.toString());
  if (!response.ok) return null;

  const data: OmdbResponse = await response.json();
  if (data.Response === 'False') return null;

  const ratings = data.Ratings ?? [];

  const imdbRating = ratings.find((r) => r.Source === 'Internet Movie Database');
  const rtRating = ratings.find((r) => r.Source === 'Rotten Tomatoes');
  const metacriticRating = ratings.find((r) => r.Source === 'Metacritic');

  const rtScore = rtRating?.Value ?? null;
  let rtFresh: boolean | null = null;
  if (rtScore) {
    const percent = parseInt(rtScore, 10);
    rtFresh = !isNaN(percent) && percent >= 60;
  }

  return {
    imdbScore: imdbRating?.Value?.replace('/10', '') ?? null,
    rottenTomatoesScore: rtScore,
    rottenTomatoesFresh: rtFresh,
    metacriticScore: metacriticRating?.Value ?? null,
  };
}
