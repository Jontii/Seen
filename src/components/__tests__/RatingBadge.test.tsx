import React from 'react';
import { render } from '@testing-library/react-native';
import { RatingBadge } from '../RatingBadge';

describe('RatingBadge', () => {
  it('renders IMDB rating with /10 format', () => {
    const { getByText } = render(<RatingBadge source="imdb" value="8.5" />);
    expect(getByText('8.5/10')).toBeTruthy();
    expect(getByText('IMDb')).toBeTruthy();
  });

  it('renders RT rating with percent sign', () => {
    const { getByText } = render(<RatingBadge source="rt" value="95%" fresh={true} />);
    expect(getByText('95%')).toBeTruthy();
    expect(getByText('RT')).toBeTruthy();
  });

  it('renders personal rating', () => {
    const { getByText } = render(<RatingBadge source="personal" value="9" />);
    expect(getByText('9/10')).toBeTruthy();
    expect(getByText('You')).toBeTruthy();
  });

  it('returns null when value is null', () => {
    const { toJSON } = render(<RatingBadge source="imdb" value={null} />);
    expect(toJSON()).toBeNull();
  });
});
