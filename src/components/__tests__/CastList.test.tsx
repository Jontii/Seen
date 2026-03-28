import React from 'react';
import { render } from '@testing-library/react-native';
import { CastList } from '../CastList';
import { castMembers } from '../../__fixtures__/mediaItems';

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: (props: any) => <View testID="image" {...props} />,
  };
});

describe('CastList', () => {
  it('renders cast member names and characters', () => {
    const { getByText } = render(<CastList cast={castMembers} />);
    expect(getByText('Edward Norton')).toBeTruthy();
    expect(getByText('The Narrator')).toBeTruthy();
    expect(getByText('Brad Pitt')).toBeTruthy();
    expect(getByText('Tyler Durden')).toBeTruthy();
  });

  it('renders the section title', () => {
    const { getByText } = render(<CastList cast={castMembers} />);
    expect(getByText('Cast')).toBeTruthy();
  });

  it('returns null for empty cast array', () => {
    const { toJSON } = render(<CastList cast={[]} />);
    expect(toJSON()).toBeNull();
  });
});
