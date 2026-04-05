import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RecommendationCard from '../RecommendationCard';
import { Recommendation } from '@/api/types';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: (props: any) => <View testID="image" {...props} />,
  };
});

const baseRecommendation: Recommendation = {
  id: 'rec-1',
  fromUser: {
    id: 'user-1',
    displayName: 'Alice',
    avatarUrl: null,
    inviteCode: 'ABC123',
    createdAt: '2024-01-01T00:00:00Z',
  },
  tmdbId: 155,
  imdbId: 'tt0468569',
  mediaType: 'movie',
  title: 'The Dark Knight',
  posterPath: '/qJ2tW6WMUDux911BTUgMe1VF39.jpg',
  year: '2008',
  message: 'This is so good!',
  createdAt: '2024-01-15T10:00:00Z',
  seenAt: null,
};

describe('RecommendationCard', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders the movie title', () => {
    const { getByText } = render(<RecommendationCard recommendation={baseRecommendation} />);
    expect(getByText('The Dark Knight')).toBeTruthy();
  });

  it('renders the sender name', () => {
    const { getByText } = render(<RecommendationCard recommendation={baseRecommendation} />);
    expect(getByText('Alice')).toBeTruthy();
  });

  it('renders the message', () => {
    const { getByText } = render(<RecommendationCard recommendation={baseRecommendation} />);
    expect(getByText('"This is so good!"')).toBeTruthy();
  });

  it('renders year and media type', () => {
    const { getByText } = render(<RecommendationCard recommendation={baseRecommendation} />);
    expect(getByText('2008 · Movie')).toBeTruthy();
  });

  it('navigates to detail screen on press', () => {
    const { getByText } = render(<RecommendationCard recommendation={baseRecommendation} />);
    fireEvent.press(getByText('The Dark Knight'));
    expect(mockPush).toHaveBeenCalledWith('/details/155?mediaType=movie&from=recommendation&recId=rec-1');
  });

  it('calls onSeen when unseen recommendation is pressed', () => {
    const onSeen = jest.fn();
    const { getByText } = render(
      <RecommendationCard recommendation={baseRecommendation} onSeen={onSeen} />,
    );
    fireEvent.press(getByText('The Dark Knight'));
    expect(onSeen).toHaveBeenCalled();
  });

  it('does not call onSeen when already seen', () => {
    const onSeen = jest.fn();
    const seen = { ...baseRecommendation, seenAt: '2024-01-16T00:00:00Z' };
    const { getByText } = render(
      <RecommendationCard recommendation={seen} onSeen={onSeen} />,
    );
    fireEvent.press(getByText('The Dark Knight'));
    expect(onSeen).not.toHaveBeenCalled();
  });

  it('renders without message when message is null', () => {
    const noMsg = { ...baseRecommendation, message: null };
    const { queryByText } = render(<RecommendationCard recommendation={noMsg} />);
    expect(queryByText(/"/)).toBeNull();
  });
});
