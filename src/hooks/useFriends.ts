import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/api/types';
import { useAuth } from './useAuth';

function mapProfile(row: any): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    inviteCode: row.invite_code,
    createdAt: row.created_at,
  };
}

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!user) {
      setFriends([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data: friendIds } = await supabase.rpc('get_friend_ids', { uid: user.id });
      if (!friendIds || friendIds.length === 0) {
        setFriends([]);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', friendIds);

      if (profiles) {
        setFriends(profiles.map(mapProfile));
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const addFriendByCode = useCallback(
    async (code: string): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: 'Not authenticated' };

      // Look up profile by invite code
      const { data: friendProfile, error: lookupError } = await supabase
        .from('profiles')
        .select('*')
        .eq('invite_code', code.toUpperCase().trim())
        .single();

      if (lookupError || !friendProfile) {
        return { success: false, error: 'Invalid invite code' };
      }

      if (friendProfile.id === user.id) {
        return { success: false, error: "That's your own code!" };
      }

      // Check if already friends
      const ids = [user.id, friendProfile.id].sort();
      const { data: existing } = await supabase
        .from('friendships')
        .select('id')
        .eq('user_a', ids[0])
        .eq('user_b', ids[1])
        .single();

      if (existing) {
        return { success: false, error: 'Already friends!' };
      }

      // Create friendship
      const { error: insertError } = await supabase.from('friendships').insert({
        user_a: ids[0],
        user_b: ids[1],
      });

      if (insertError) {
        return { success: false, error: insertError.message };
      }

      // Refresh friends list
      await fetchFriends();
      return { success: true };
    },
    [user, fetchFriends],
  );

  const removeFriend = useCallback(
    async (friendId: string) => {
      if (!user) return;

      const ids = [user.id, friendId].sort();
      await supabase
        .from('friendships')
        .delete()
        .eq('user_a', ids[0])
        .eq('user_b', ids[1]);

      setFriends((prev) => prev.filter((f) => f.id !== friendId));
    },
    [user],
  );

  return { friends, isLoading, addFriendByCode, removeFriend, refreshFriends: fetchFriends };
}
