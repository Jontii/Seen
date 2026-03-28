import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { signInWithEmail } = useAuth();
  const router = useRouter();

  const handleSendLink = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;

    setIsSending(true);
    try {
      await signInWithEmail(trimmed);
      router.push({ pathname: '/auth/check-email', params: { email: trimmed } });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send magic link');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Seen?</Text>
      <Text style={styles.subtitle}>
        Sign in to share recommendations with friends and sync your library across devices.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email address"
        placeholderTextColor={colors.textTertiary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        returnKeyType="send"
        onSubmitEditing={handleSendLink}
      />

      <Pressable
        style={[styles.button, (!email.trim() || isSending) && styles.buttonDisabled]}
        onPress={handleSendLink}
        disabled={!email.trim() || isSending}
      >
        {isSending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send Magic Link</Text>
        )}
      </Pressable>

      <Pressable style={styles.skipButton} onPress={() => router.back()}>
        <Text style={styles.skipText}>Continue without account</Text>
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
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: fontSize.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
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
  skipButton: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
});
