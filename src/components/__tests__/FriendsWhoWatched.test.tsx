import React from 'react';
import { render } from '@testing-library/react-native';
import FriendsWhoWatched from '../FriendsWhoWatched';
import { FriendWatched, Recommendation } from '@/api/types';

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: (props: any) => <View testID="avatar-image" {...props} />,
  };
});

const friendsWatched: FriendWatched[] = [
  {
    profile: {
      id: 'user-1',
      displayName: 'Alice',
      avatarUrl: null,
      inviteCode: 'ABC123',
      createdAt: '2024-01-01T00:00:00Z',
    },
    rating: 9,
    watchedAt: '2024-01-15T00:00:00Z',
  },
  {
    profile: {
      id: 'user-2',
      displayName: 'Bob',
      avatarUrl: null,
      inviteCode: 'DEF456',
      createdAt: '2024-01-01T00:00:00Z',
    },
    rating: 7,
    watchedAt: '2024-01-16T00:00:00Z',
  },
];

const friendWithNote: FriendWatched = {
  profile: {
    id: 'user-1',
    displayName: 'Alice',
    avatarUrl: null,
    inviteCode: 'ABC123',
    createdAt: '2024-01-01T00:00:00Z',
  },
  rating: 9,
  watchedAt: '2024-01-15T00:00:00Z',
  note: 'Absolutely loved it',
};

const recommendation: Recommendation = {
  id: 'rec-1',
  fromUser: {
    id: 'user-3',
    displayName: 'Charlie',
    avatarUrl: null,
    inviteCode: 'GHI789',
    createdAt: '2024-01-01T00:00:00Z',
  },
  tmdbId: 155,
  imdbId: null,
  mediaType: 'movie',
  title: 'The Dark Knight',
  posterPath: null,
  year: '2008',
  message: 'You have to see this!',
  createdAt: '2024-01-10T00:00:00Z',
  seenAt: null,
};

describe('FriendsWhoWatched', () => {
  it('renders nothing when empty and no recommendations', () => {
    const { toJSON } = render(<FriendsWhoWatched friendsWatched={[]} recommendations={[]} />);
    expect(toJSON()).toBeNull();
  });

  it('renders section title', () => {
    const { getByText } = render(<FriendsWhoWatched friendsWatched={friendsWatched} />);
    expect(getByText('Friends Who Watched')).toBeTruthy();
  });

  it('renders friend names', () => {
    const { getByText } = render(<FriendsWhoWatched friendsWatched={friendsWatched} />);
    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
  });

  it('renders ratings', () => {
    const { getByText } = render(<FriendsWhoWatched friendsWatched={friendsWatched} />);
    expect(getByText('9')).toBeTruthy();
    expect(getByText('7')).toBeTruthy();
  });

  it('shows "What Friends Said" when a friend has a note', () => {
    const { getByText } = render(<FriendsWhoWatched friendsWatched={[friendWithNote]} />);
    expect(getByText('What Friends Said')).toBeTruthy();
    expect(getByText('"Absolutely loved it"')).toBeTruthy();
  });

  it('shows recommendation messages in comments', () => {
    const { getByText } = render(
      <FriendsWhoWatched friendsWatched={[]} recommendations={[recommendation]} />,
    );
    expect(getByText('What Friends Said')).toBeTruthy();
    expect(getByText('"You have to see this!"')).toBeTruthy();
    expect(getByText('Charlie')).toBeTruthy();
  });

  it('shows both watched notes and recommendation messages for same friend', () => {
    const recFromAlice: Recommendation = {
      ...recommendation,
      fromUser: friendWithNote.profile,
      message: 'Go watch it now!',
    };
    const { getByText } = render(
      <FriendsWhoWatched friendsWatched={[friendWithNote]} recommendations={[recFromAlice]} />,
    );
    expect(getByText('"Absolutely loved it"')).toBeTruthy();
    expect(getByText('"Go watch it now!"')).toBeTruthy();
  });

  it('does not show comments section when no notes or messages', () => {
    const { queryByText } = render(<FriendsWhoWatched friendsWatched={friendsWatched} />);
    expect(queryByText('What Friends Said')).toBeNull();
  });

  it('shows rating badge on comment when from watched note', () => {
    const { getByText } = render(<FriendsWhoWatched friendsWatched={[friendWithNote]} />);
    expect(getByText('9/10')).toBeTruthy();
  });

  it('skips recommendations with null message', () => {
    const noMsg = { ...recommendation, message: null };
    const { queryByText } = render(
      <FriendsWhoWatched friendsWatched={[]} recommendations={[noMsg]} />,
    );
    expect(queryByText('What Friends Said')).toBeNull();
  });
});
