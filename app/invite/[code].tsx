import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { colors, spacing, fontSize } from '@/constants/theme';

const PENDING_INVITE_KEY = '@pending_invite';

export default function InviteScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { user } = useAuth();
  const { addFriendByCode } = useFriends();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    handleInvite();
  }, []);

  async function handleInvite() {
    if (!code) {
      setStatus('error');
      setMessage('Invalid invite link');
      return;
    }

    if (!user) {
      // Store pending invite and redirect to sign in
      await AsyncStorage.setItem(PENDING_INVITE_KEY, code);
      Alert.alert(
        'Sign In Required',
        'You need to sign in to add a friend. The invite will be saved.',
        [{ text: 'OK', onPress: () => router.replace('/auth/sign-in') }],
      );
      return;
    }

    const result = await addFriendByCode(code);
    if (result.success) {
      setStatus('success');
      setMessage('Friend added!');
      setTimeout(() => router.dismissAll(), 1500);
    } else {
      setStatus('error');
      setMessage(result.error || 'Could not add friend');
    }
  }

  return (
    <View style={styles.container}>
      {status === 'loading' && <ActivityIndicator size="large" color={colors.primary} />}
      {status !== 'loading' && (
        <Text style={[styles.message, status === 'error' && styles.error]}>{message}</Text>
      )}
    </View>
  );
}

/** Call this after sign-in to process any pending invite */
export async function processPendingInvite(
  addFriendByCode: (code: string) => Promise<{ success: boolean; error?: string }>,
): Promise<void> {
  const code = await AsyncStorage.getItem(PENDING_INVITE_KEY);
  if (!code) return;

  await AsyncStorage.removeItem(PENDING_INVITE_KEY);
  const result = await addFriendByCode(code);
  if (result.success) {
    Alert.alert('Friend Added!', 'The pending invite was processed.');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  message: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '600',
    textAlign: 'center',
  },
  error: {
    color: colors.destructive,
  },
});
