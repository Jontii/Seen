import { FlatList, StyleSheet, Alert } from 'react-native';
import { useLibrary } from '@/hooks/useLibrary';
import { MediaCard } from '@/components/MediaCard';
import { EmptyState } from '@/components/EmptyState';
import { colors, spacing } from '@/constants/theme';
import React from 'react';

export default function WatchlistScreen() {
  const { watchlist, removeFromWatchlist } = useLibrary();

  if (watchlist.length === 0) {
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
});
