import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { getImageUrl } from '@/api/tmdb';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import React from 'react';

interface MediaCardProps {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  year: string;
  rating?: number;
}

export function MediaCard({ tmdbId, mediaType, title, posterPath, year, rating }: MediaCardProps) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push(`/details/${tmdbId}?mediaType=${mediaType}`)}
      testID="media-card"
    >
      <Image
        source={getImageUrl(posterPath, 'w92')}
        style={styles.poster}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.row}>
          <Text style={styles.year}>{year}</Text>
          <View style={[styles.badge, mediaType === 'tv' && styles.badgeTv]}>
            <Text style={styles.badgeText}>{mediaType === 'movie' ? 'Movie' : 'TV'}</Text>
          </View>
        </View>
      </View>
      {rating != null && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{rating}</Text>
          <Text style={styles.ratingLabel}>/10</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
  },
  poster: {
    width: 46,
    height: 69,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  year: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  badge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeTv: {
    backgroundColor: colors.primary + '33',
  },
  badgeText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: spacing.sm,
  },
  ratingText: {
    color: colors.accent,
    fontSize: fontSize.xl,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  ratingLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
  },
});
