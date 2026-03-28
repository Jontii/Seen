import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { colors, fontSize } from '@/constants/theme';

export default function AuthCallbackScreen() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Once auth state resolves, navigate away
    if (user) {
      router.replace('/(tabs)/search');
    } else {
      // Give it a moment — the deep link handler may still be processing
      const timer = setTimeout(() => {
        router.replace('/(tabs)/search');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Signing you in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: 16,
  },
  text: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
});
