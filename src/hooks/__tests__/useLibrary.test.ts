import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { ReactNode } from 'react';
import { LibraryProvider, useLibrary } from '../useLibrary';
import { watchlistItem } from '../../__fixtures__/mediaItems';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

function wrapper({ children }: { children: ReactNode }) {
  return React.createElement(LibraryProvider, null, children);
}

describe('useLibrary', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts with empty watchlist and watched', async () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });

    await act(async () => {});

    expect(result.current.watchlist).toEqual([]);
    expect(result.current.watched).toEqual([]);
  });

  it('addToWatchlist adds an item', async () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });
    await act(async () => {});

    const { addedAt, ...itemWithoutDate } = watchlistItem;

    await act(async () => {
      result.current.addToWatchlist(itemWithoutDate);
    });

    expect(result.current.watchlist).toHaveLength(1);
    expect(result.current.watchlist[0].tmdbId).toBe(550);
    expect(result.current.watchlist[0].addedAt).toBeDefined();
  });

  it('addToWatchlist prevents duplicates', async () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });
    await act(async () => {});

    const { addedAt, ...itemWithoutDate } = watchlistItem;

    await act(async () => {
      result.current.addToWatchlist(itemWithoutDate);
    });
    await act(async () => {
      result.current.addToWatchlist(itemWithoutDate);
    });

    expect(result.current.watchlist).toHaveLength(1);
  });

  it('removeFromWatchlist removes the correct item', async () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });
    await act(async () => {});

    const { addedAt, ...itemWithoutDate } = watchlistItem;

    await act(async () => {
      result.current.addToWatchlist(itemWithoutDate);
    });
    await act(async () => {
      result.current.removeFromWatchlist(550);
    });

    expect(result.current.watchlist).toHaveLength(0);
  });

  it('removeFromWatchlist is a no-op for non-existent item', async () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });
    await act(async () => {});

    await act(async () => {
      result.current.removeFromWatchlist(999);
    });

    expect(result.current.watchlist).toHaveLength(0);
  });

  it('markAsWatched moves item from watchlist to watched', async () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });
    await act(async () => {});

    const { addedAt, ...itemWithoutDate } = watchlistItem;

    await act(async () => {
      result.current.addToWatchlist(itemWithoutDate);
    });
    await act(async () => {
      result.current.markAsWatched(550, 9, 'Great movie');
    });

    expect(result.current.watchlist).toHaveLength(0);
    expect(result.current.watched).toHaveLength(1);
    expect(result.current.watched[0].myRating).toBe(9);
    expect(result.current.watched[0].myNote).toBe('Great movie');
  });

  it('markAsWatched is a no-op for items not in watchlist', async () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });
    await act(async () => {});

    await act(async () => {
      result.current.markAsWatched(999, 7);
    });

    expect(result.current.watched).toHaveLength(0);
  });

  it('removeFromWatched removes item', async () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });
    await act(async () => {});

    const { addedAt, ...itemWithoutDate } = watchlistItem;

    await act(async () => {
      result.current.addToWatchlist(itemWithoutDate);
    });
    await act(async () => {
      result.current.markAsWatched(550, 8);
    });
    await act(async () => {
      result.current.removeFromWatched(550);
    });

    expect(result.current.watched).toHaveLength(0);
  });

  it('updateRating updates rating and note on watched item', async () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });
    await act(async () => {});

    const { addedAt, ...itemWithoutDate } = watchlistItem;

    await act(async () => {
      result.current.addToWatchlist(itemWithoutDate);
    });
    await act(async () => {
      result.current.markAsWatched(550, 7);
    });
    await act(async () => {
      result.current.updateRating(550, 10, 'Changed my mind, perfect');
    });

    expect(result.current.watched[0].myRating).toBe(10);
    expect(result.current.watched[0].myNote).toBe('Changed my mind, perfect');
  });

  it('updateRating is a no-op for non-existent item', async () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });
    await act(async () => {});

    await act(async () => {
      result.current.updateRating(999, 5);
    });

    expect(result.current.watched).toHaveLength(0);
  });

  it('isInWatchlist returns correct boolean', async () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });
    await act(async () => {});

    expect(result.current.isInWatchlist(550)).toBe(false);

    const { addedAt, ...itemWithoutDate } = watchlistItem;

    await act(async () => {
      result.current.addToWatchlist(itemWithoutDate);
    });

    expect(result.current.isInWatchlist(550)).toBe(true);
  });

  it('isWatched returns correct boolean', async () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });
    await act(async () => {});

    const { addedAt, ...itemWithoutDate } = watchlistItem;

    expect(result.current.isWatched(550)).toBe(false);

    await act(async () => {
      result.current.addToWatchlist(itemWithoutDate);
    });
    await act(async () => {
      result.current.markAsWatched(550, 8);
    });

    expect(result.current.isWatched(550)).toBe(true);
  });

  it('restores state from AsyncStorage on mount', async () => {
    const storedWatchlist = [
      { ...watchlistItem, addedAt: '2024-01-15T10:00:00.000Z' },
    ];
    await AsyncStorage.setItem('@watchlist', JSON.stringify(storedWatchlist));

    const { result } = renderHook(() => useLibrary(), { wrapper });
    await act(async () => {});

    expect(result.current.watchlist).toHaveLength(1);
    expect(result.current.watchlist[0].tmdbId).toBe(550);
  });
});
