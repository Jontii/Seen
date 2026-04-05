import React from 'react';
import { render } from '@testing-library/react-native';
import WatchProviders from '../WatchProviders';
import { WatchProviders as WatchProvidersType } from '@/api/types';

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: (props: any) => <View testID="provider-logo" {...props} />,
  };
});

const providers: WatchProvidersType = {
  link: 'https://www.themoviedb.org/movie/550/watch',
  flatrate: [
    { providerId: 8, providerName: 'Netflix', logoPath: '/netflix.jpg' },
    { providerId: 337, providerName: 'Disney Plus', logoPath: '/disney.jpg' },
  ],
  rent: [
    { providerId: 2, providerName: 'Apple TV', logoPath: '/apple.jpg' },
  ],
  buy: [
    { providerId: 3, providerName: 'Google Play Movies', logoPath: '/google.jpg' },
  ],
};

describe('WatchProviders', () => {
  it('renders nothing when providers is null', () => {
    const { toJSON } = render(<WatchProviders providers={null} />);
    expect(toJSON()).toBeNull();
  });

  it('renders nothing when providers is undefined', () => {
    const { toJSON } = render(<WatchProviders providers={undefined} />);
    expect(toJSON()).toBeNull();
  });

  it('renders nothing when all arrays are empty', () => {
    const empty: WatchProvidersType = { link: null, flatrate: [], rent: [], buy: [] };
    const { toJSON } = render(<WatchProviders providers={empty} />);
    expect(toJSON()).toBeNull();
  });

  it('renders Stream section with provider names', () => {
    const { getByText } = render(<WatchProviders providers={providers} />);
    expect(getByText('Stream')).toBeTruthy();
    expect(getByText('Netflix')).toBeTruthy();
    expect(getByText('Disney Plus')).toBeTruthy();
  });

  it('renders Rent section', () => {
    const { getByText } = render(<WatchProviders providers={providers} />);
    expect(getByText('Rent')).toBeTruthy();
    expect(getByText('Apple TV')).toBeTruthy();
  });

  it('renders Buy section', () => {
    const { getByText } = render(<WatchProviders providers={providers} />);
    expect(getByText('Buy')).toBeTruthy();
    expect(getByText('Google Play Movies')).toBeTruthy();
  });

  it('renders provider logos', () => {
    const { getAllByTestId } = render(<WatchProviders providers={providers} />);
    expect(getAllByTestId('provider-logo')).toHaveLength(4);
  });

  it('renders JustWatch attribution', () => {
    const { getByText } = render(<WatchProviders providers={providers} />);
    expect(getByText('Data provided by JustWatch')).toBeTruthy();
  });

  it('only renders sections that have providers', () => {
    const streamOnly: WatchProvidersType = {
      link: null,
      flatrate: [{ providerId: 8, providerName: 'Netflix', logoPath: '/netflix.jpg' }],
      rent: [],
      buy: [],
    };
    const { getByText, queryByText } = render(<WatchProviders providers={streamOnly} />);
    expect(getByText('Stream')).toBeTruthy();
    expect(queryByText('Rent')).toBeNull();
    expect(queryByText('Buy')).toBeNull();
  });
});
