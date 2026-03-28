import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LibraryProvider } from '@/hooks/useLibrary';
import React from 'react';

export default function RootLayout() {
  return (
    <LibraryProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#000' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="details/[id]"
          options={{
            title: '',
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="rate/[id]"
          options={{
            presentation: 'modal',
            title: 'Rate',
            headerStyle: { backgroundColor: '#1C1C1E' },
          }}
        />
      </Stack>
    </LibraryProvider>
  );
}
