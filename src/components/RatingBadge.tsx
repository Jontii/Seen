import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import React from 'react';

type RatingSource = 'imdb' | 'rt' | 'metacritic' | 'tmdb' | 'personal';

interface RatingBadgeProps {
  source: RatingSource;
  value: string | null;
  fresh?: boolean | null;
}

const SOURCE_CONFIG: Record<RatingSource, { label: string; color: string }> = {
  imdb: { label: 'IMDb', color: colors.imdb },
  rt: { label: 'RT', color: colors.rottenTomatoes },
  metacritic: { label: 'MC', color: '#FFCC34' },
  tmdb: { label: 'TMDB', color: '#01D277' },
  personal: { label: 'You', color: colors.accent },
};

export function RatingBadge({ source, value, fresh }: RatingBadgeProps) {
  if (!value) return null;

  const config = SOURCE_CONFIG[source];

  const displayValue =
    source === 'imdb' || source === 'tmdb' || source === 'personal'
      ? `${value}/10`
      : value;

  return (
    <View style={styles.container} testID={`rating-badge-${source}`}>
      <View style={[styles.labelContainer, { backgroundColor: config.color }]}>
        <Text style={styles.label}>{config.label}</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{displayValue}</Text>
        {source === 'rt' && fresh != null && (
          <Text style={styles.freshIndicator}>{fresh ? ' Fresh' : ' Rotten'}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  labelContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: {
    color: '#000',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  value: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  freshIndicator: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
});
