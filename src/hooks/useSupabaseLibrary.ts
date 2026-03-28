import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { WatchlistItem, WatchedItem } from '@/api/types';
import { LibraryActions } from './useLocalLibrary';

function mapWatchlistRow(row: any): WatchlistItem {
  return {
    tmdbId: row.tmdb_id,
    imdbId: row.imdb_id,
    mediaType: row.media_type,
    title: row.title,
    posterPath: row.poster_path,
    year: row.year,
    addedAt: row.added_at,
  };
}

function mapWatchedRow(row: any): WatchedItem {
  return {
    tmdbId: row.tmdb_id,
    imdbId: row.imdb_id,
    mediaType: row.media_type,
    title: row.title,
    posterPath: row.poster_path,
    year: row.year,
    addedAt: row.watched_at, // use watched_at as addedAt
    watchedAt: row.watched_at,
    myRating: row.rating,
    myNote: row.note,
  };
}

export function useSupabaseLibrary(userId: string | undefined): LibraryActions {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [watched, setWatched] = useState<WatchedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    loadData(userId);
  }, [userId]);

  async function loadData(uid: string) {
    setIsLoading(true);
    try {
      const [watchlistRes, watchedRes] = await Promise.all([
        supabase
          .from('watchlist')
          .select('*')
          .eq('user_id', uid)
          .order('added_at', { ascending: false }),
        supabase
          .from('watched')
          .select('*')
          .eq('user_id', uid)
          .order('watched_at', { ascending: false }),
      ]);

      if (watchlistRes.data) setWatchlist(watchlistRes.data.map(mapWatchlistRow));
      if (watchedRes.data) setWatched(watchedRes.data.map(mapWatchedRow));
    } finally {
      setIsLoading(false);
    }
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
      if (!userId) return;
      if (watchlist.some((i) => i.tmdbId === item.tmdbId)) return;

      // Optimistic update
      const newItem: WatchlistItem = { ...item, addedAt: new Date().toISOString() };
      setWatchlist((prev) => [newItem, ...prev]);

      supabase
        .from('watchlist')
        .insert({
          user_id: userId,
          tmdb_id: item.tmdbId,
          imdb_id: item.imdbId,
          media_type: item.mediaType,
          title: item.title,
          poster_path: item.posterPath,
          year: item.year,
        })
        .then(({ error }) => {
          if (error) {
            // Rollback
            setWatchlist((prev) => prev.filter((i) => i.tmdbId !== item.tmdbId));
            console.warn('Failed to add to watchlist:', error.message);
          }
        });
    },
    [userId, watchlist],
  );

  const removeFromWatchlist = useCallback(
    (tmdbId: number) => {
      if (!userId) return;

      const removed = watchlist.find((i) => i.tmdbId === tmdbId);
      setWatchlist((prev) => prev.filter((i) => i.tmdbId !== tmdbId));

      supabase
        .from('watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('tmdb_id', tmdbId)
        .then(({ error }) => {
          if (error && removed) {
            setWatchlist((prev) => [removed, ...prev]);
            console.warn('Failed to remove from watchlist:', error.message);
          }
        });
    },
    [userId, watchlist],
  );

  const markAsWatched = useCallback(
    (tmdbId: number, rating: number, note?: string) => {
      if (!userId) return;
      const existing = watchlist.find((i) => i.tmdbId === tmdbId);
      if (!existing) return;

      const watchedItem: WatchedItem = {
        ...existing,
        watchedAt: new Date().toISOString(),
        myRating: rating,
        myNote: note,
      };

      // Optimistic update
      setWatchlist((prev) => prev.filter((i) => i.tmdbId !== tmdbId));
      setWatched((prev) => [watchedItem, ...prev]);

      Promise.all([
        supabase.from('watchlist').delete().eq('user_id', userId).eq('tmdb_id', tmdbId),
        supabase.from('watched').insert({
          user_id: userId,
          tmdb_id: existing.tmdbId,
          imdb_id: existing.imdbId,
          media_type: existing.mediaType,
          title: existing.title,
          poster_path: existing.posterPath,
          year: existing.year,
          rating,
          note: note || null,
        }),
      ]).then(([deleteRes, insertRes]) => {
        if (deleteRes.error || insertRes.error) {
          // Rollback
          setWatchlist((prev) => [existing, ...prev]);
          setWatched((prev) => prev.filter((i) => i.tmdbId !== tmdbId));
          console.warn('Failed to mark as watched:', deleteRes.error?.message || insertRes.error?.message);
        }
      });
    },
    [userId, watchlist],
  );

  const removeFromWatched = useCallback(
    (tmdbId: number) => {
      if (!userId) return;

      const removed = watched.find((i) => i.tmdbId === tmdbId);
      setWatched((prev) => prev.filter((i) => i.tmdbId !== tmdbId));

      supabase
        .from('watched')
        .delete()
        .eq('user_id', userId)
        .eq('tmdb_id', tmdbId)
        .then(({ error }) => {
          if (error && removed) {
            setWatched((prev) => [removed, ...prev]);
            console.warn('Failed to remove from watched:', error.message);
          }
        });
    },
    [userId, watched],
  );

  const updateRating = useCallback(
    (tmdbId: number, rating: number, note?: string) => {
      if (!userId) return;

      const original = watched.find((i) => i.tmdbId === tmdbId);
      setWatched((prev) =>
        prev.map((item) =>
          item.tmdbId === tmdbId ? { ...item, myRating: rating, myNote: note } : item,
        ),
      );

      supabase
        .from('watched')
        .update({ rating, note: note || null })
        .eq('user_id', userId)
        .eq('tmdb_id', tmdbId)
        .then(({ error }) => {
          if (error && original) {
            setWatched((prev) =>
              prev.map((item) =>
                item.tmdbId === tmdbId ? original : item,
              ),
            );
            console.warn('Failed to update rating:', error.message);
          }
        });
    },
    [userId, watched],
  );

  return {
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
}

/** Import local data into Supabase */
export async function importLocalData(
  userId: string,
  data: { watchlist: WatchlistItem[]; watched: WatchedItem[] },
): Promise<void> {
  const watchlistRows = data.watchlist.map((item) => ({
    user_id: userId,
    tmdb_id: item.tmdbId,
    imdb_id: item.imdbId,
    media_type: item.mediaType,
    title: item.title,
    poster_path: item.posterPath,
    year: item.year,
  }));

  const watchedRows = data.watched.map((item) => ({
    user_id: userId,
    tmdb_id: item.tmdbId,
    imdb_id: item.imdbId,
    media_type: item.mediaType,
    title: item.title,
    poster_path: item.posterPath,
    year: item.year,
    rating: item.myRating,
    note: item.myNote || null,
  }));

  const promises: Promise<any>[] = [];
  if (watchlistRows.length > 0) {
    promises.push(supabase.from('watchlist').upsert(watchlistRows, { onConflict: 'user_id,tmdb_id' }));
  }
  if (watchedRows.length > 0) {
    promises.push(supabase.from('watched').upsert(watchedRows, { onConflict: 'user_id,tmdb_id' }));
  }

  const results = await Promise.all(promises);
  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    throw new Error('Failed to import some data: ' + errors.map((e) => e.error.message).join(', '));
  }
}
