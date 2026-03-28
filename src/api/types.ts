export type MediaType = 'movie' | 'tv';

export interface MediaItem {
  tmdbId: number;
  imdbId: string | null;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  year: string;
  overview: string;
  voteAverage: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

export interface ExternalRatings {
  imdbScore: string | null;
  rottenTomatoesScore: string | null;
  rottenTomatoesFresh: boolean | null;
  metacriticScore: string | null;
}

export interface MediaDetail extends MediaItem {
  backdropPath: string | null;
  runtime: number | null;
  seasons: number | null;
  genres: string[];
  voteAverage: number;
  cast: CastMember[];
  externalRatings: ExternalRatings | null;
}

export interface WatchlistItem {
  tmdbId: number;
  imdbId: string | null;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  year: string;
  addedAt: string;
}

export interface WatchedItem extends WatchlistItem {
  watchedAt: string;
  myRating: number;
  myNote?: string;
}

// Social types (Phase 2)

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  inviteCode: string;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  fromUser: Profile;
  tmdbId: number;
  imdbId: string | null;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  year: string;
  message: string | null;
  createdAt: string;
  seenAt: string | null;
}

export interface FriendWatched {
  profile: Profile;
  rating: number;
  watchedAt: string;
  note?: string;
}
