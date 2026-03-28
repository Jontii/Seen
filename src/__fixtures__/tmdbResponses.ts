export const searchMultiResponse = {
  results: [
    {
      id: 550,
      media_type: 'movie',
      title: 'Fight Club',
      poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      release_date: '1999-10-15',
      overview: 'A ticking-Loss insomnia movie.',
    },
    {
      id: 1399,
      media_type: 'tv',
      name: 'Game of Thrones',
      poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
      first_air_date: '2011-04-17',
      overview: 'Seven noble families fight for control.',
    },
    {
      id: 99999,
      media_type: 'person',
      name: 'Some Actor',
      poster_path: null,
      overview: '',
    },
  ],
  total_results: 3,
};

export const emptySearchResponse = {
  results: [],
  total_results: 0,
};

export const trendingResponse = {
  results: [
    {
      id: 123,
      media_type: 'movie',
      title: 'Trending Movie',
      poster_path: '/trending.jpg',
      release_date: '2024-01-01',
      overview: 'A trending movie.',
    },
  ],
};

export const detailMovieResponse = {
  id: 550,
  title: 'Fight Club',
  poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  backdrop_path: '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
  release_date: '1999-10-15',
  overview: 'A ticking-loss insomnia movie about fighting.',
  runtime: 139,
  genres: [
    { id: 18, name: 'Drama' },
    { id: 53, name: 'Thriller' },
  ],
  vote_average: 8.433,
  external_ids: {
    imdb_id: 'tt0137523',
  },
  credits: {
    cast: [
      {
        id: 819,
        name: 'Edward Norton',
        character: 'The Narrator',
        profile_path: '/eIkFHNlfretLS1spAcIoihKUS62.jpg',
      },
      {
        id: 287,
        name: 'Brad Pitt',
        character: 'Tyler Durden',
        profile_path: '/cckcYc2v0yh1tc9QjRelptcOBko.jpg',
      },
    ],
  },
};

export const detailTvResponse = {
  id: 1399,
  name: 'Game of Thrones',
  poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
  backdrop_path: '/suopoADq0k8YZr4dQXcU6pToj6s.jpg',
  first_air_date: '2011-04-17',
  overview: 'Seven noble families fight for control of Westeros.',
  number_of_seasons: 8,
  runtime: null,
  genres: [
    { id: 10765, name: 'Sci-Fi & Fantasy' },
    { id: 18, name: 'Drama' },
  ],
  vote_average: 8.438,
  external_ids: {
    imdb_id: 'tt0944947',
  },
  credits: {
    cast: [
      {
        id: 22970,
        name: 'Peter Dinklage',
        character: 'Tyrion Lannister',
        profile_path: '/lRsRgnksAhBRXwAB68MFjmTtLrk.jpg',
      },
    ],
  },
};
