import { Stack, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default function ProfileLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#000' },
        headerTintColor: '#fff',
        contentStyle: { backgroundColor: '#000' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Profile',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="friends" options={{ title: 'Friends' }} />
      <Stack.Screen name="add-friend" options={{ title: 'Add Friend' }} />
    </Stack>
  );
}
