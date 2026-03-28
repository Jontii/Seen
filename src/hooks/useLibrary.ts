import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WatchlistItem, WatchedItem } from '@/api/types';
import { useAuth } from './useAuth';
import { useLocalLibrary, LibraryActions, hasLocalData, getLocalData, clearLocalData } from './useLocalLibrary';
import { useSupabaseLibrary, importLocalData } from './useSupabaseLibrary';
import React from 'react';

const IMPORT_OFFERED_KEY = '@import_offered';

interface LibraryContextValue extends LibraryActions {}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user, isProfileComplete } = useAuth();
  const local = useLocalLibrary();
  const remote = useSupabaseLibrary(user?.id);

  const isAuthenticated = !!user;
  const active = isAuthenticated ? remote : local;

  // Offer to import local data only after profile is set up
  useEffect(() => {
    if (!user || !isProfileComplete) return;

    (async () => {
      const alreadyOffered = await AsyncStorage.getItem(IMPORT_OFFERED_KEY);
      if (alreadyOffered) return;

      const hasData = await hasLocalData();
      if (!hasData) {
        await AsyncStorage.setItem(IMPORT_OFFERED_KEY, 'true');
        return;
      }

      Alert.alert(
        'Import Local Data',
        'You have watchlist and watched items saved locally. Would you like to import them to your account?',
        [
          {
            text: 'No Thanks',
            style: 'cancel',
            onPress: () => AsyncStorage.setItem(IMPORT_OFFERED_KEY, 'true'),
          },
          {
            text: 'Import',
            onPress: async () => {
              try {
                const data = await getLocalData();
                await importLocalData(user.id, data);
                await clearLocalData();
                await AsyncStorage.setItem(IMPORT_OFFERED_KEY, 'true');
                // Refresh remote data
                // The useSupabaseLibrary hook will re-fetch on next render
              } catch (error: any) {
                Alert.alert('Import Failed', error.message || 'Could not import your data.');
              }
            },
          },
        ],
      );
    })();
  }, [user]);

  const value: LibraryContextValue = active;

  return React.createElement(LibraryContext.Provider, { value }, children);
}

export function useLibrary(): LibraryContextValue {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
