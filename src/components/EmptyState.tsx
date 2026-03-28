import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '@/constants/theme';
import React from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
});
