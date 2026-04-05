import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useLibrary } from '@/hooks/useLibrary';
import { useRecommendations } from '@/hooks/useRecommendations';
import { MediaType } from '@/api/types';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import React from 'react';

export default function RateScreen() {
  const { id, title, recId } = useLocalSearchParams<{
    id: string;
    mediaType: MediaType;
    title: string;
    recId?: string;
  }>();
  const router = useRouter();
  const { isWatched, markAsWatched, updateRating, watched } = useLibrary();
  const { markAsSeen } = useRecommendations();

  const tmdbId = Number(id);
  const alreadyWatched = isWatched(tmdbId);
  const existingItem = watched.find((i) => i.tmdbId === tmdbId);

  const [rating, setRating] = useState<number>(existingItem?.myRating ?? 0);
  const [note, setNote] = useState<string>(existingItem?.myNote ?? '');

  function handleSelectRating(value: number) {
    Haptics.selectionAsync();
    setRating(value);
  }

  function handleSave() {
    if (rating === 0) return;

    if (alreadyWatched) {
      updateRating(tmdbId, rating, note || undefined);
    } else {
      markAsWatched(tmdbId, rating, note || undefined);
    }

    if (recId) {
      markAsSeen(recId);
    }

    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={2}>
        {title || 'Rate this title'}
      </Text>

      <Text style={styles.label}>Your Rating</Text>
      <View style={styles.ratingRow}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
          <Pressable
            key={value}
            style={[styles.ratingCircle, rating === value && styles.ratingCircleActive]}
            onPress={() => handleSelectRating(value)}
          >
            <Text style={[styles.ratingNumber, rating === value && styles.ratingNumberActive]}>
              {value}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Note (optional)</Text>
      <TextInput
        style={styles.noteInput}
        placeholder="Add your thoughts..."
        placeholderTextColor={colors.textTertiary}
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <Pressable
        style={[styles.saveButton, rating === 0 && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={rating === 0}
      >
        <Text style={styles.saveButtonText}>
          {alreadyWatched ? 'Update Rating' : 'Save'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.xl,
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  ratingCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingCircleActive: {
    backgroundColor: colors.accent,
  },
  ratingNumber: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  ratingNumberActive: {
    color: '#000',
  },
  noteInput: {
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    fontSize: fontSize.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: 100,
    marginBottom: spacing.xl,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
