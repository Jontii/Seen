import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MediaCard } from '../MediaCard';

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

const mockHaptics = jest.fn();
jest.mock('expo-haptics', () => ({
  impactAsync: (...args: any[]) => mockHaptics(...args),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
}));

describe('MediaCard', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockHaptics.mockClear();
  });

  const defaultProps = {
    tmdbId: 550,
    mediaType: 'movie' as const,
    title: 'Fight Club',
    posterPath: '/poster.jpg',
    year: '1999',
  };

  it('renders title text', () => {
    const { getByText } = render(<MediaCard {...defaultProps} />);
    expect(getByText('Fight Club')).toBeTruthy();
  });

  it('renders year', () => {
    const { getByText } = render(<MediaCard {...defaultProps} />);
    expect(getByText('1999')).toBeTruthy();
  });

  it('renders Movie badge for movie type', () => {
    const { getByText } = render(<MediaCard {...defaultProps} />);
    expect(getByText('Movie')).toBeTruthy();
  });

  it('renders TV badge for tv type', () => {
    const { getByText } = render(<MediaCard {...defaultProps} mediaType="tv" />);
    expect(getByText('TV')).toBeTruthy();
  });

  it('navigates to detail screen on press', () => {
    const { getByTestId } = render(<MediaCard {...defaultProps} />);
    fireEvent.press(getByTestId('media-card'));
    expect(mockPush).toHaveBeenCalledWith('/details/550?mediaType=movie');
  });

  it('shows Listed indicator when inWatchlist is true', () => {
    const { getByText } = render(<MediaCard {...defaultProps} inWatchlist />);
    expect(getByText('✓')).toBeTruthy();
    expect(getByText('Listed')).toBeTruthy();
  });

  it('does not show Listed indicator when inWatchlist is false', () => {
    const { queryByText } = render(<MediaCard {...defaultProps} inWatchlist={false} />);
    expect(queryByText('Listed')).toBeNull();
  });

  it('passes from param in navigation URL', () => {
    const { getByTestId } = render(<MediaCard {...defaultProps} from="watchlist" />);
    fireEvent.press(getByTestId('media-card'));
    expect(mockPush).toHaveBeenCalledWith('/details/550?mediaType=movie&from=watchlist');
  });

  it('calls onLongPress callback when long-pressed', () => {
    const onLongPress = jest.fn();
    const { getByTestId } = render(<MediaCard {...defaultProps} onLongPress={onLongPress} />);
    fireEvent(getByTestId('media-card'), 'longPress');
    expect(onLongPress).toHaveBeenCalled();
  });

  it('triggers haptic feedback on long press', () => {
    const onLongPress = jest.fn();
    const { getByTestId } = render(<MediaCard {...defaultProps} onLongPress={onLongPress} />);
    fireEvent(getByTestId('media-card'), 'longPress');
    expect(mockHaptics).toHaveBeenCalledWith('Medium');
  });

  it('does not crash when onLongPress is not provided', () => {
    const { getByTestId } = render(<MediaCard {...defaultProps} />);
    fireEvent(getByTestId('media-card'), 'longPress');
    expect(mockHaptics).not.toHaveBeenCalled();
  });
});
