import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Recommendation, FriendWatched, MediaType } from '@/api/types';
import { useAuth } from './useAuth';

function mapProfile(row: any) {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    inviteCode: row.invite_code,
    createdAt: row.created_at,
  };
}

function mapRecommendation(row: any): Recommendation {
  return {
    id: row.id,
    fromUser: mapProfile(row.from_profile),
    tmdbId: row.tmdb_id,
    imdbId: row.imdb_id,
    mediaType: row.media_type,
    title: row.title,
    posterPath: row.poster_path,
    year: row.year,
    message: row.message,
    createdAt: row.created_at,
    seenAt: row.seen_at,
  };
}

export function useRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecommendations = useCallback(async () => {
    if (!user) {
      setRecommendations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*, from_profile:from_user(id, display_name, avatar_url, invite_code, created_at)')
        .eq('to_user', user.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setRecommendations(data.map(mapRecommendation));
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const unseenCount = recommendations.filter((r) => !r.seenAt).length;

  const markAsSeen = useCallback(
    async (recommendationId: string) => {
      if (!user) return;

      setRecommendations((prev) =>
        prev.map((r) =>
          r.id === recommendationId ? { ...r, seenAt: new Date().toISOString() } : r,
        ),
      );

      await supabase
        .from('recommendations')
        .update({ seen_at: new Date().toISOString() })
        .eq('id', recommendationId);
    },
    [user],
  );

  const sendRecommendation = useCallback(
    async (params: {
      toUserIds: string[];
      tmdbId: number;
      imdbId: string | null;
      mediaType: MediaType;
      title: string;
      posterPath: string | null;
      year: string;
      message: string | null;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const rows = params.toUserIds.map((toUserId) => ({
        from_user: user.id,
        to_user: toUserId,
        tmdb_id: params.tmdbId,
        imdb_id: params.imdbId,
        media_type: params.mediaType,
        title: params.title,
        poster_path: params.posterPath,
        year: params.year,
        message: params.message,
      }));

      const { error } = await supabase.from('recommendations').insert(rows);
      if (error) throw error;
    },
    [user],
  );

  const getFriendsWhoWatched = useCallback(
    async (tmdbId: number): Promise<FriendWatched[]> => {
      if (!user) return [];

      const { data: friendIds } = await supabase.rpc('get_friend_ids', { uid: user.id });
      if (!friendIds || friendIds.length === 0) return [];

      const { data } = await supabase
        .from('watched')
        .select('rating, watched_at, note, user_id, profiles:user_id(id, display_name, avatar_url, invite_code, created_at)')
        .eq('tmdb_id', tmdbId)
        .in('user_id', friendIds);

      if (!data) return [];

      return data.map((row: any) => ({
        profile: mapProfile(row.profiles),
        rating: row.rating,
        watchedAt: row.watched_at,
        note: row.note,
      }));
    },
    [user],
  );

  const dismissRecommendation = useCallback(
    async (recommendationId: string) => {
      if (!user) return;

      setRecommendations((prev) => prev.filter((r) => r.id !== recommendationId));

      await supabase.from('recommendations').delete().eq('id', recommendationId).eq('to_user', user.id);
    },
    [user],
  );

  return {
    recommendations,
    unseenCount,
    isLoading,
    sendRecommendation,
    markAsSeen,
    dismissRecommendation,
    getFriendsWhoWatched,
    refreshRecommendations: fetchRecommendations,
  };
}
