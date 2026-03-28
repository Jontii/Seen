import { MediaItem, WatchlistItem, WatchedItem, CastMember } from '@/api/types';

export const movieItem: MediaItem = {
  tmdbId: 550,
  imdbId: 'tt0137523',
  mediaType: 'movie',
  title: 'Fight Club',
  posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  year: '1999',
  overview: 'A ticking-loss insomnia movie.',
  voteAverage: 8.433,
};

export const tvItem: MediaItem = {
  tmdbId: 1399,
  imdbId: 'tt0944947',
  mediaType: 'tv',
  title: 'Game of Thrones',
  posterPath: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
  year: '2011',
  overview: 'Seven noble families fight for control.',
  voteAverage: 8.438,
};

export const watchlistItem: WatchlistItem = {
  tmdbId: 550,
  imdbId: 'tt0137523',
  mediaType: 'movie',
  title: 'Fight Club',
  posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  year: '1999',
  addedAt: '2024-01-15T10:00:00.000Z',
};

export const watchedItem: WatchedItem = {
  tmdbId: 1399,
  imdbId: 'tt0944947',
  mediaType: 'tv',
  title: 'Game of Thrones',
  posterPath: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
  year: '2011',
  addedAt: '2024-01-10T10:00:00.000Z',
  watchedAt: '2024-01-20T10:00:00.000Z',
  myRating: 8,
  myNote: 'Great show',
};

export const castMembers: CastMember[] = [
  {
    id: 819,
    name: 'Edward Norton',
    character: 'The Narrator',
    profilePath: '/eIkFHNlfretLS1spAcIoihKUS62.jpg',
  },
  {
    id: 287,
    name: 'Brad Pitt',
    character: 'Tyler Durden',
    profilePath: '/cckcYc2v0yh1tc9QjRelptcOBko.jpg',
  },
];
