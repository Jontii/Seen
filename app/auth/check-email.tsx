import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

export default function CheckEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="mail-outline" size={64} color={colors.primary} style={styles.icon} />
      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.subtitle}>
        We sent a magic link to{'\n'}
        <Text style={styles.email}>{email}</Text>
      </Text>
      <Text style={styles.hint}>
        Tap the link in the email to sign in. The link will open the app automatically.
      </Text>

      <Pressable style={styles.button} onPress={() => router.dismissAll()}>
        <Text style={styles.buttonText}>Done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  email: {
    color: colors.text,
    fontWeight: '600',
  },
  hint: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xxl,
  },
  button: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  buttonText: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
