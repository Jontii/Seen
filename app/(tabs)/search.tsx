import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useDebounce } from '@/hooks/useDebounce';
import { searchMulti, getTrending } from '@/api/tmdb';
import { MediaItem } from '@/api/types';
import { MediaCard } from '@/components/MediaCard';
import { EmptyState } from '@/components/EmptyState';
import SendToFriendSheet from '@/components/SendToFriendSheet';
import { useLibrary } from '@/hooks/useLibrary';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import React from 'react';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendTarget, setSendTarget] = useState<MediaItem | null>(null);
  const { isInWatchlist } = useLibrary();
  const { user } = useAuth();

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    getTrending()
      .then(setTrending)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    searchMulti(debouncedQuery.trim())
      .then(setResults)
      .catch(() => setError('Search failed. Please try again.'))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const displayData = query.trim() ? results : trending;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search movies & TV shows..."
        placeholderTextColor={colors.textTertiary}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} size="large" />
      ) : error ? (
        <EmptyState title="Oops" message={error} />
      ) : displayData.length === 0 && query.trim() ? (
        <EmptyState title="No results" message="Try a different search term" />
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={(item) => `${item.tmdbId}-${item.mediaType}`}
          ListHeaderComponent={user ? (
            <Text style={styles.tip}>Hold down to send to a friend</Text>
          ) : null}
          renderItem={({ item }) => (
            <MediaCard
              tmdbId={item.tmdbId}
              mediaType={item.mediaType}
              title={item.title}
              posterPath={item.posterPath}
              year={item.year}
              voteAverage={item.voteAverage}
              inWatchlist={isInWatchlist(item.tmdbId)}
              onLongPress={user ? () => setSendTarget(item) : undefined}
            />
          )}
          contentContainerStyle={styles.list}
          keyboardDismissMode="on-drag"
        />
      )}
      {sendTarget && (
        <SendToFriendSheet
          visible={!!sendTarget}
          onClose={() => setSendTarget(null)}
          tmdbId={sendTarget.tmdbId}
          imdbId={sendTarget.imdbId}
          mediaType={sendTarget.mediaType}
          title={sendTarget.title}
          posterPath={sendTarget.posterPath}
          year={sendTarget.year}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchInput: {
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    fontSize: fontSize.md,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  tip: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  list: {
    paddingVertical: spacing.sm,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
});
