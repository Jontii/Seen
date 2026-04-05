import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalLibrary, hasLocalData, getLocalData, clearLocalData } from '../useLocalLibrary';
import { watchlistItem } from '../../__fixtures__/mediaItems';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('useLocalLibrary', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts with empty state', async () => {
    const { result } = renderHook(() => useLocalLibrary());
    await act(async () => {});

    expect(result.current.watchlist).toEqual([]);
    expect(result.current.watched).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('adds to watchlist', async () => {
    const { result } = renderHook(() => useLocalLibrary());
    await act(async () => {});

    const { addedAt, ...item } = watchlistItem;
    await act(async () => {
      result.current.addToWatchlist(item);
    });

    expect(result.current.watchlist).toHaveLength(1);
    expect(result.current.isInWatchlist(550)).toBe(true);
  });

  it('marks as watched', async () => {
    const { result } = renderHook(() => useLocalLibrary());
    await act(async () => {});

    const { addedAt, ...item } = watchlistItem;
    await act(async () => {
      result.current.addToWatchlist(item);
    });
    await act(async () => {
      result.current.markAsWatched(550, 9);
    });

    expect(result.current.watchlist).toHaveLength(0);
    expect(result.current.watched).toHaveLength(1);
    expect(result.current.isWatched(550)).toBe(true);
  });
});

describe('hasLocalData', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns false when no data', async () => {
    expect(await hasLocalData()).toBe(false);
  });

  it('returns true when watchlist has data', async () => {
    await AsyncStorage.setItem('@watchlist', JSON.stringify([watchlistItem]));
    expect(await hasLocalData()).toBe(true);
  });
});

describe('getLocalData', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns empty arrays when no data', async () => {
    const data = await getLocalData();
    expect(data.watchlist).toEqual([]);
    expect(data.watched).toEqual([]);
  });
});

describe('clearLocalData', () => {
  it('removes data from AsyncStorage', async () => {
    await AsyncStorage.setItem('@watchlist', JSON.stringify([watchlistItem]));
    await clearLocalData();
    expect(await AsyncStorage.getItem('@watchlist')).toBeNull();
    expect(await AsyncStorage.getItem('@watched')).toBeNull();
  });
});
