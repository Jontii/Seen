import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLibrary } from '@/hooks/useLibrary';
import { useAuth } from '@/hooks/useAuth';
import { useRecommendations } from '@/hooks/useRecommendations';
import { MediaCard } from '@/components/MediaCard';
import RecommendationCard from '@/components/RecommendationCard';
import { EmptyState } from '@/components/EmptyState';
import { colors, spacing, fontSize } from '@/constants/theme';
import React from 'react';

export default function WatchlistScreen() {
  const { watchlist } = useLibrary();
  const { user } = useAuth();
  const { recommendations, markAsSeen } = useRecommendations();

  const unseenRecs = recommendations.filter((r) => !r.seenAt);

  const ListHeader = () => {
    if (!user || unseenRecs.length === 0) return null;
    return (
      <View style={styles.recsSection}>
        <Text style={styles.recsTitle}>Recommendations ({unseenRecs.length})</Text>
        {unseenRecs.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onSeen={() => markAsSeen(rec.id)}
          />
        ))}
      </View>
    );
  };

  if (watchlist.length === 0 && unseenRecs.length === 0) {
    return (
      <EmptyState
        title="Your watchlist is empty"
        message="Search for movies and TV shows to add them here"
      />
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={watchlist}
      keyExtractor={(item) => `${item.tmdbId}`}
      ListHeaderComponent={<ListHeader />}
      renderItem={({ item }) => (
        <MediaCard
          tmdbId={item.tmdbId}
          mediaType={item.mediaType}
          title={item.title}
          posterPath={item.posterPath}
          year={item.year}
        />
      )}
      contentContainerStyle={styles.list}
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
  recsSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  recsTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
});
