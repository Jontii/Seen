import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { getDetails, getImageUrl } from '@/api/tmdb';
import { getRatings } from '@/api/omdb';
import { MediaDetail, MediaType } from '@/api/types';
import { useLibrary } from '@/hooks/useLibrary';
import { RatingBadge } from '@/components/RatingBadge';
import { CastList } from '@/components/CastList';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import React from 'react';

export default function DetailScreen() {
  const { id, mediaType } = useLocalSearchParams<{ id: string; mediaType: MediaType }>();
  const router = useRouter();
  const { isInWatchlist, isWatched, addToWatchlist, removeFromWatchlist, watched } = useLibrary();

  const [detail, setDetail] = useState<MediaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  const tmdbId = Number(id);
  const inWatchlist = isInWatchlist(tmdbId);
  const alreadyWatched = isWatched(tmdbId);
  const watchedItem = watched.find((i) => i.tmdbId === tmdbId);

  useEffect(() => {
    if (!id || !mediaType) return;

    setLoading(true);
    getDetails(tmdbId, mediaType)
      .then(async (data) => {
        if (data.imdbId) {
          const ratings = await getRatings(data.imdbId).catch(() => null);
          data.externalRatings = ratings;
        }
        setDetail(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, mediaType]);

  if (loading || !detail) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  function handleAddToWatchlist() {
    if (!detail) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addToWatchlist({
      tmdbId: detail.tmdbId,
      imdbId: detail.imdbId,
      mediaType: detail.mediaType,
      title: detail.title,
      posterPath: detail.posterPath,
      year: detail.year,
    });
  }

  function handleMarkAsWatched() {
    router.push(
      `/rate/${tmdbId}?mediaType=${mediaType}&title=${encodeURIComponent(detail?.title ?? '')}`,
    );
  }

  const synopsisText = detail.overview;
  const isLongSynopsis = synopsisText.length > 200;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <Image
          source={getImageUrl(detail.backdropPath, 'w780')}
          style={styles.backdrop}
          contentFit="cover"
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Image
            source={getImageUrl(detail.posterPath, 'w342')}
            style={styles.poster}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.heroInfo}>
            <Text style={styles.title}>{detail.title}</Text>
            <Text style={styles.meta}>
              {detail.year}
              {detail.genres.length > 0 && ` \u2022 ${detail.genres.slice(0, 3).join(', ')}`}
            </Text>
            <Text style={styles.meta}>
              {detail.runtime ? `${detail.runtime} min` : ''}
              {detail.seasons ? `${detail.seasons} season${detail.seasons > 1 ? 's' : ''}` : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Ratings */}
      <View style={styles.ratingsRow}>
        <RatingBadge source="imdb" value={detail.externalRatings?.imdbScore ?? null} />
        <RatingBadge
          source="rt"
          value={detail.externalRatings?.rottenTomatoesScore ?? null}
          fresh={detail.externalRatings?.rottenTomatoesFresh}
        />
        {watchedItem && (
          <RatingBadge source="personal" value={String(watchedItem.myRating)} />
        )}
      </View>

      {/* Synopsis */}
      {synopsisText ? (
        <Pressable
          style={styles.section}
          onPress={() => isLongSynopsis && setSynopsisExpanded(!synopsisExpanded)}
        >
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <Text
            style={styles.synopsis}
            numberOfLines={synopsisExpanded || !isLongSynopsis ? undefined : 4}
          >
            {synopsisText}
          </Text>
          {isLongSynopsis && (
            <Text style={styles.expandText}>
              {synopsisExpanded ? 'Show less' : 'Read more'}
            </Text>
          )}
        </Pressable>
      ) : null}

      {/* Cast */}
      <View style={styles.castSection}>
        <CastList cast={detail.cast} />
      </View>

      {/* Watched note */}
      {watchedItem?.myNote ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Note</Text>
          <Text style={styles.note}>{watchedItem.myNote}</Text>
        </View>
      ) : null}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {!inWatchlist && !alreadyWatched && (
          <Pressable style={styles.primaryButton} onPress={handleAddToWatchlist}>
            <Text style={styles.primaryButtonText}>Add to Watchlist</Text>
          </Pressable>
        )}
        {inWatchlist && (
          <>
            <Pressable style={styles.primaryButton} onPress={handleMarkAsWatched}>
              <Text style={styles.primaryButtonText}>Mark as Watched</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => removeFromWatchlist(tmdbId)}
            >
              <Text style={styles.secondaryButtonText}>Remove from Watchlist</Text>
            </Pressable>
          </>
        )}
        {alreadyWatched && (
          <Pressable style={styles.secondaryButton} onPress={handleMarkAsWatched}>
            <Text style={styles.secondaryButtonText}>Update Rating</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  hero: {
    height: 300,
    position: 'relative',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceLight,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  heroContent: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
  },
  heroInfo: {
    flex: 1,
    marginLeft: spacing.lg,
    justifyContent: 'flex-end',
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  ratingsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  synopsis: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  expandText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  castSection: {
    paddingVertical: spacing.md,
  },
  note: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
});
