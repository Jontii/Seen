import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export function useSendFrequency() {
  const { user } = useAuth();
  const [frequentFriendIds, setFrequentFriendIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setFrequentFriendIds([]);
      return;
    }

    setIsLoading(true);
    supabase
      .from('recommendations')
      .select('to_user')
      .eq('from_user', user.id)
      .then(({ data }) => {
        if (!data || data.length === 0) {
          setFrequentFriendIds([]);
          setIsLoading(false);
          return;
        }

        const counts = new Map<string, number>();
        for (const row of data) {
          counts.set(row.to_user, (counts.get(row.to_user) ?? 0) + 1);
        }

        const sorted = [...counts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([id]) => id);

        setFrequentFriendIds(sorted);
        setIsLoading(false);
      });
  }, [user]);

  return { frequentFriendIds, isLoading };
}
