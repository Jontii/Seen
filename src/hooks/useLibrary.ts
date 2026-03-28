import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WatchlistItem, WatchedItem } from '@/api/types';
import React from 'react';

const WATCHLIST_KEY = '@watchlist';
const WATCHED_KEY = '@watched';

interface LibraryContextValue {
  watchlist: WatchlistItem[];
  watched: WatchedItem[];
  isLoading: boolean;
  isInWatchlist: (tmdbId: number) => boolean;
  isWatched: (tmdbId: number) => boolean;
  addToWatchlist: (item: Omit<WatchlistItem, 'addedAt'>) => void;
  removeFromWatchlist: (tmdbId: number) => void;
  markAsWatched: (tmdbId: number, rating: number, note?: string) => void;
  removeFromWatched: (tmdbId: number) => void;
  updateRating: (tmdbId: number, rating: number, note?: string) => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [watched, setWatched] = useState<WatchedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [watchlistData, watchedData] = await Promise.all([
        AsyncStorage.getItem(WATCHLIST_KEY),
        AsyncStorage.getItem(WATCHED_KEY),
      ]);
      if (watchlistData) setWatchlist(JSON.parse(watchlistData));
      if (watchedData) setWatched(JSON.parse(watchedData));
    } finally {
      setIsLoading(false);
    }
  }

  async function persistWatchlist(items: WatchlistItem[]) {
    setWatchlist(items);
    await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(items));
  }

  async function persistWatched(items: WatchedItem[]) {
    setWatched(items);
    await AsyncStorage.setItem(WATCHED_KEY, JSON.stringify(items));
  }

  const isInWatchlist = useCallback(
    (tmdbId: number) => watchlist.some((item) => item.tmdbId === tmdbId),
    [watchlist],
  );

  const isWatched_ = useCallback(
    (tmdbId: number) => watched.some((item) => item.tmdbId === tmdbId),
    [watched],
  );

  const addToWatchlist = useCallback(
    (item: Omit<WatchlistItem, 'addedAt'>) => {
      if (watchlist.some((i) => i.tmdbId === item.tmdbId)) return;
      const newItem: WatchlistItem = { ...item, addedAt: new Date().toISOString() };
      persistWatchlist([newItem, ...watchlist]);
    },
    [watchlist],
  );

  const removeFromWatchlist = useCallback(
    (tmdbId: number) => {
      persistWatchlist(watchlist.filter((i) => i.tmdbId !== tmdbId));
    },
    [watchlist],
  );

  const markAsWatched = useCallback(
    (tmdbId: number, rating: number, note?: string) => {
      const existing = watchlist.find((i) => i.tmdbId === tmdbId);
      if (!existing) return;

      const watchedItem: WatchedItem = {
        ...existing,
        watchedAt: new Date().toISOString(),
        myRating: rating,
        myNote: note,
      };

      persistWatchlist(watchlist.filter((i) => i.tmdbId !== tmdbId));
      persistWatched([watchedItem, ...watched]);
    },
    [watchlist, watched],
  );

  const removeFromWatched = useCallback(
    (tmdbId: number) => {
      persistWatched(watched.filter((i) => i.tmdbId !== tmdbId));
    },
    [watched],
  );

  const updateRating = useCallback(
    (tmdbId: number, rating: number, note?: string) => {
      const updated = watched.map((item) =>
        item.tmdbId === tmdbId ? { ...item, myRating: rating, myNote: note } : item,
      );
      persistWatched(updated);
    },
    [watched],
  );

  const value: LibraryContextValue = {
    watchlist,
    watched,
    isLoading,
    isInWatchlist,
    isWatched: isWatched_,
    addToWatchlist,
    removeFromWatchlist,
    markAsWatched,
    removeFromWatched,
    updateRating,
  };

  return React.createElement(LibraryContext.Provider, { value }, children);
}

export function useLibrary(): LibraryContextValue {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
