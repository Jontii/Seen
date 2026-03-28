import { useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useLibrary } from '@/hooks/useLibrary';
import { MediaCard } from '@/components/MediaCard';
import { EmptyState } from '@/components/EmptyState';
import { WatchedItem } from '@/api/types';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import React from 'react';

type SortOption = 'date' | 'rating' | 'title';

const SORT_LABELS: Record<SortOption, string> = {
  date: 'Recent',
  rating: 'Rating',
  title: 'Title',
};

function sortItems(items: WatchedItem[], sort: SortOption): WatchedItem[] {
  const sorted = [...items];
  switch (sort) {
    case 'date':
      return sorted.sort((a, b) => b.watchedAt.localeCompare(a.watchedAt));
    case 'rating':
      return sorted.sort((a, b) => b.myRating - a.myRating);
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
  }
}

export default function WatchedScreen() {
  const { watched } = useLibrary();
  const [sortBy, setSortBy] = useState<SortOption>('date');

  const sortedItems = useMemo(() => sortItems(watched, sortBy), [watched, sortBy]);

  if (watched.length === 0) {
    return (
      <EmptyState
        title="Nothing watched yet"
        message="Mark items as watched from your watchlist"
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sortBar}>
        {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
          <Pressable
            key={option}
            style={[styles.sortButton, sortBy === option && styles.sortButtonActive]}
            onPress={() => setSortBy(option)}
          >
            <Text style={[styles.sortText, sortBy === option && styles.sortTextActive]}>
              {SORT_LABELS[option]}
            </Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={sortedItems}
        keyExtractor={(item) => `${item.tmdbId}`}
        renderItem={({ item }) => (
          <MediaCard
            tmdbId={item.tmdbId}
            mediaType={item.mediaType}
            title={item.title}
            posterPath={item.posterPath}
            year={item.year}
            rating={item.myRating}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sortBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  sortButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceLight,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
  },
  sortText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  sortTextActive: {
    color: colors.text,
  },
  list: {
    paddingVertical: spacing.sm,
  },
});
