export const fullRatingsResponse = {
  Response: 'True',
  Ratings: [
    { Source: 'Internet Movie Database', Value: '8.8/10' },
    { Source: 'Rotten Tomatoes', Value: '79%' },
    { Source: 'Metacritic', Value: '66/100' },
  ],
};

export const partialRatingsResponse = {
  Response: 'True',
  Ratings: [
    { Source: 'Internet Movie Database', Value: '7.5/10' },
  ],
};

export const freshRatingsResponse = {
  Response: 'True',
  Ratings: [
    { Source: 'Internet Movie Database', Value: '9.0/10' },
    { Source: 'Rotten Tomatoes', Value: '95%' },
  ],
};

export const rottenRatingsResponse = {
  Response: 'True',
  Ratings: [
    { Source: 'Rotten Tomatoes', Value: '30%' },
  ],
};

export const errorResponse = {
  Response: 'False',
  Error: 'Incorrect IMDb ID.',
};
