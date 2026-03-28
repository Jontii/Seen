import { MediaItem, MediaDetail, MediaType, CastMember } from './types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

class TmdbError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'TmdbError';
  }
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const token = process.env.EXPO_PUBLIC_TMDB_BEARER_TOKEN ?? '';
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new TmdbError(`TMDB API error: ${response.statusText}`, response.status);
  }
  return response.json();
}

function extractYear(dateString: string | undefined | null): string {
  if (!dateString) return '';
  return dateString.substring(0, 4);
}

interface TmdbSearchResult {
  id: number;
  media_type: string;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  vote_average: number;
}

interface TmdbSearchResponse {
  results: TmdbSearchResult[];
  total_results: number;
}

interface TmdbTrendingResponse {
  results: TmdbSearchResult[];
}

interface TmdbDetailResponse {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  runtime?: number | null;
  number_of_seasons?: number | null;
  genres: Array<{ id: number; name: string }>;
  vote_average: number;
  external_ids?: {
    imdb_id: string | null;
  };
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
  };
}

function mapSearchResult(item: TmdbSearchResult): MediaItem | null {
  const mediaType = item.media_type as MediaType;
  if (mediaType !== 'movie' && mediaType !== 'tv') return null;

  return {
    tmdbId: item.id,
    imdbId: null,
    mediaType,
    title: item.title ?? item.name ?? '',
    posterPath: item.poster_path,
    year: extractYear(item.release_date ?? item.first_air_date),
    overview: item.overview,
    voteAverage: item.vote_average ?? 0,
  };
}

export async function searchMulti(query: string): Promise<MediaItem[]> {
  const data = await tmdbFetch<TmdbSearchResponse>('/search/multi', {
    query,
    include_adult: 'false',
  });

  return data.results
    .map(mapSearchResult)
    .filter((item): item is MediaItem => item !== null);
}

export async function getTrending(): Promise<MediaItem[]> {
  const data = await tmdbFetch<TmdbTrendingResponse>('/trending/all/week');

  return data.results
    .map(mapSearchResult)
    .filter((item): item is MediaItem => item !== null);
}

export async function getDetails(tmdbId: number, mediaType: MediaType): Promise<MediaDetail> {
  const data = await tmdbFetch<TmdbDetailResponse>(`/${mediaType}/${tmdbId}`, {
    append_to_response: 'credits,external_ids',
  });

  const cast: CastMember[] = (data.credits?.cast ?? []).slice(0, 20).map((member) => ({
    id: member.id,
    name: member.name,
    character: member.character,
    profilePath: member.profile_path,
  }));

  return {
    tmdbId: data.id,
    imdbId: data.external_ids?.imdb_id ?? null,
    mediaType,
    title: data.title ?? data.name ?? '',
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,
    year: extractYear(data.release_date ?? data.first_air_date),
    overview: data.overview,
    runtime: data.runtime ?? null,
    seasons: data.number_of_seasons ?? null,
    genres: data.genres.map((g) => g.name),
    voteAverage: data.vote_average,
    cast,
    externalRatings: null,
  };
}

export function getImageUrl(path: string | null, size: string = 'w500'): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
