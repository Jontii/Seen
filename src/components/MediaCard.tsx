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
  voteAverage?: number;
  rating?: number;
  from?: string;
  inWatchlist?: boolean;
}

export function MediaCard({ tmdbId, mediaType, title, posterPath, year, voteAverage, rating, from, inWatchlist }: MediaCardProps) {
  const router = useRouter();
  const fromParam = from ? `&from=${from}` : '';

  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push(`/details/${tmdbId}?mediaType=${mediaType}${fromParam}`)}
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
      <View style={styles.ratingsColumn}>
        {inWatchlist && (
          <View style={styles.ratingContainer}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.checkText}>Listed</Text>
          </View>
        )}
        {voteAverage != null && voteAverage > 0 && (
          <View style={styles.ratingContainer}>
            <Text style={styles.tmdbIcon}>★</Text>
            <Text style={styles.tmdbRating}>{voteAverage.toFixed(1)}</Text>
          </View>
        )}
        {rating != null && (
          <View style={styles.ratingContainer}>
            <Text style={styles.personalIcon}>♥</Text>
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        )}
      </View>
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
  ratingsColumn: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
    gap: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  checkIcon: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  checkText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  tmdbIcon: {
    color: '#01D277',
    fontSize: fontSize.sm,
  },
  tmdbRating: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  personalIcon: {
    color: colors.accent,
    fontSize: fontSize.sm,
  },
  ratingText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
