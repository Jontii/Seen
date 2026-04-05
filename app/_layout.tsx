import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { LibraryProvider } from '@/hooks/useLibrary';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import DemoModeSwitcher from '@/components/DemoModeSwitcher';
import React from 'react';

function RootNavigator() {
  const { user, isLoading, isProfileComplete } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  usePushNotifications();

  // Redirect to profile setup if authenticated but profile incomplete
  useEffect(() => {
    if (isLoading) return;

    if (user && !isProfileComplete && segments[0] !== 'auth') {
      router.replace('/auth/setup-profile');
    }
  }, [user, isProfileComplete, isLoading, segments]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#000' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Back' }} />
        <Stack.Screen
          name="details/[id]"
          options={{
            title: '',
            headerTransparent: true,
            headerBackTitle: 'Back',
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
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen
          name="invite/[code]"
          options={{
            presentation: 'modal',
            title: 'Friend Invite',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <RootNavigator />
        <DemoModeSwitcher />
      </LibraryProvider>
    </AuthProvider>
  );
}
