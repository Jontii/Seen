import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Recommendation } from '@/api/types';
import { getImageUrl } from '@/api/tmdb';
import Avatar from './Avatar';
import { colors, spacing, fontSize, borderRadius, POSTER_ASPECT_RATIO } from '@/constants/theme';

interface Props {
  recommendation: Recommendation;
  onSeen?: () => void;
}

export default function RecommendationCard({ recommendation, onSeen }: Props) {
  const router = useRouter();
  const isNew = !recommendation.seenAt;

  const handlePress = () => {
    if (onSeen && isNew) onSeen();
    router.push(`/details/${recommendation.tmdbId}?mediaType=${recommendation.mediaType}`);
  };

  return (
    <Pressable style={[styles.container, isNew && styles.unseen]} onPress={handlePress}>
      <Image
        source={getImageUrl(recommendation.posterPath, 'w92')}
        style={styles.poster}
        contentFit="cover"
      />
      <View style={styles.info}>
        <View style={styles.senderRow}>
          <Avatar name={recommendation.fromUser.displayName} imageUrl={recommendation.fromUser.avatarUrl} size="sm" />
          <Text style={styles.senderName}>{recommendation.fromUser.displayName}</Text>
          {isNew && <View style={styles.dot} />}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {recommendation.title}
        </Text>
        <Text style={styles.meta}>
          {recommendation.year} · {recommendation.mediaType === 'movie' ? 'Movie' : 'TV'}
        </Text>
        {recommendation.message && (
          <Text style={styles.message} numberOfLines={2}>
            "{recommendation.message}"
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  unseen: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  poster: {
    width: 60,
    height: 60 / POSTER_ASPECT_RATIO,
    backgroundColor: colors.surfaceLight,
  },
  info: {
    flex: 1,
    padding: spacing.md,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  senderName: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  meta: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  message: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});
