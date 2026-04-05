import { View, Text, SectionList, StyleSheet } from 'react-native';
import { useLibrary } from '@/hooks/useLibrary';
import { useAuth } from '@/hooks/useAuth';
import { useRecommendations } from '@/hooks/useRecommendations';
import { MediaCard } from '@/components/MediaCard';
import RecommendationCard from '@/components/RecommendationCard';
import { EmptyState } from '@/components/EmptyState';
import { Recommendation, WatchlistItem } from '@/api/types';
import { colors, spacing, fontSize } from '@/constants/theme';
import React from 'react';

type SectionItem = { type: 'rec'; data: Recommendation } | { type: 'watchlist'; data: WatchlistItem };

export default function WatchlistScreen() {
  const { watchlist } = useLibrary();
  const { user } = useAuth();
  const { recommendations, markAsSeen } = useRecommendations();

  const unseenCount = recommendations.filter((r) => !r.seenAt).length;

  const sections: { title: string; data: SectionItem[] }[] = [];

  if (user && recommendations.length > 0) {
    sections.push({
      title: `Recommendations${unseenCount > 0 ? ` (${unseenCount} new)` : ''}`,
      data: recommendations.map((r) => ({ type: 'rec' as const, data: r })),
    });
  }

  if (watchlist.length > 0) {
    sections.push({
      title: 'My Watchlist',
      data: watchlist.map((w) => ({ type: 'watchlist' as const, data: w })),
    });
  }

  if (sections.length === 0) {
    return (
      <EmptyState
        title="Your watchlist is empty"
        message="Search for movies and TV shows to add them here"
      />
    );
  }

  return (
    <SectionList
      style={styles.container}
      sections={sections}
      keyExtractor={(item) =>
        item.type === 'rec' ? item.data.id : `wl-${item.data.tmdbId}`
      }
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionTitle}>{section.title}</Text>
      )}
      renderItem={({ item }) => {
        if (item.type === 'rec') {
          return (
            <View style={styles.recWrapper}>
              <RecommendationCard
                recommendation={item.data}
                onSeen={() => !item.data.seenAt && markAsSeen(item.data.id)}
              />
            </View>
          );
        }
        return (
          <MediaCard
            tmdbId={item.data.tmdbId}
            mediaType={item.data.mediaType}
            title={item.data.title}
            posterPath={item.data.posterPath}
            year={item.data.year}
            from="watchlist"
          />
        );
      }}
      contentContainerStyle={styles.list}
      stickySectionHeadersEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  recWrapper: {
    paddingHorizontal: spacing.lg,
  },
});
