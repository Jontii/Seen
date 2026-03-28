import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#000' },
        headerTintColor: '#fff',
        contentStyle: { backgroundColor: '#000' },
      }}
    >
      <Stack.Screen name="sign-in" options={{ title: 'Sign In' }} />
      <Stack.Screen name="check-email" options={{ title: 'Check Your Email' }} />
      <Stack.Screen name="setup-profile" options={{ title: 'Set Up Profile', headerBackVisible: false }} />
      <Stack.Screen name="callback" options={{ headerShown: false }} />
    </Stack>
  );
}
