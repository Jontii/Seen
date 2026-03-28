import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFriends } from '@/hooks/useFriends';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

export default function AddFriendScreen() {
  const [code, setCode] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { addFriendByCode } = useFriends();
  const router = useRouter();

  const handleAdd = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setIsAdding(true);
    try {
      const result = await addFriendByCode(trimmed);
      if (result.success) {
        Alert.alert('Friend Added!', 'You are now friends.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Could not add friend');
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Invite Code</Text>
      <Text style={styles.subtitle}>Ask your friend for their 6-character invite code.</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. ABC123"
        placeholderTextColor={colors.textTertiary}
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase())}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
        returnKeyType="done"
        onSubmitEditing={handleAdd}
      />

      <Pressable
        style={[styles.button, (!code.trim() || isAdding) && styles.buttonDisabled]}
        onPress={handleAdd}
        disabled={!code.trim() || isAdding}
      >
        {isAdding ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Add Friend</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginBottom: spacing.xxl,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    textAlign: 'center',
    letterSpacing: 6,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
