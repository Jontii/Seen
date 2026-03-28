import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRecommendations } from '@/hooks/useRecommendations';
import Avatar from '@/components/Avatar';
import React from 'react';

export default function TabLayout() {
  const { user, profile } = useAuth();
  const { unseenCount } = useRecommendations();
  const router = useRouter();

  const headerRight = () => (
    <Pressable
      onPress={() => {
        if (user) {
          router.push('/profile');
        } else {
          router.push('/auth/sign-in');
        }
      }}
      style={{ marginRight: 16 }}
    >
      {profile ? (
        <Avatar name={profile.displayName} imageUrl={profile.avatarUrl} size="sm" />
      ) : (
        <Ionicons name="person-circle-outline" size={28} color="#8E8E93" />
      )}
    </Pressable>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0A84FF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: { backgroundColor: '#1C1C1E', borderTopColor: '#38383A' },
        headerStyle: { backgroundColor: '#000' },
        headerTintColor: '#fff',
        headerRight,
      }}
    >
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: 'Watchlist',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark" size={size} color={color} />
          ),
          tabBarBadge: unseenCount > 0 ? unseenCount : undefined,
        }}
      />
      <Tabs.Screen
        name="watched"
        options={{
          title: 'Watched',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
