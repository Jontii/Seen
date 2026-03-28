import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/api/types';
import { Session, User } from '@supabase/supabase-js';
import React from 'react';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isProfileComplete: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { display_name?: string; avatar_url?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapProfile(row: any): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    inviteCode: row.invite_code,
    createdAt: row.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      setProfile(mapProfile(data));
    } else {
      setProfile(null);
    }
  }, []);

  // Handle deep link with PKCE auth code from magic link callback
  useEffect(() => {
    const exchangeCodeFromUrl = async (url: string) => {
      // PKCE flow puts the code in query params: ?code=...
      const queryIndex = url.indexOf('?');
      if (queryIndex === -1) return;

      const params = new URLSearchParams(url.substring(queryIndex));
      const code = params.get('code');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) console.warn('Failed to exchange code for session:', error.message);
      }
    };

    // Check if app was opened via a deep link (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) exchangeCodeFromUrl(url);
    });

    // Listen for deep links while app is running (warm start)
    const subscription = Linking.addEventListener('url', ({ url }) => {
      exchangeCodeFromUrl(url);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signInWithEmail = useCallback(async (email: string) => {
    const redirectUrl = Linking.createURL('auth/callback');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (updates: { display_name?: string; avatar_url?: string }) => {
    if (!user) throw new Error('Not authenticated');

    // Check if profile exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    let data, error;
    if (existing) {
      // Update existing profile
      ({ data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single());
    } else {
      // Insert new profile (requires display_name)
      ({ data, error } = await supabase
        .from('profiles')
        .insert({ id: user.id, ...updates })
        .select()
        .single());
    }

    if (error) throw error;
    if (data) setProfile(mapProfile(data));
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const isProfileComplete = profile !== null && profile.displayName.length > 0;

  const value: AuthContextValue = {
    session,
    user,
    profile,
    isLoading,
    isProfileComplete,
    signInWithEmail,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
