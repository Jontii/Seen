import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FriendWatched, Recommendation } from '@/api/types';
import Avatar from './Avatar';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

interface FriendComment {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  message: string;
  rating?: number;
}

interface Props {
  friendsWatched: FriendWatched[];
  recommendations?: Recommendation[];
}

export default function FriendsWhoWatched({ friendsWatched, recommendations = [] }: Props) {
  // Build list of friend comments from both watched notes and recommendation messages
  const comments: FriendComment[] = [];

  for (const fw of friendsWatched) {
    if (fw.note) {
      comments.push({
        id: `watched-${fw.profile.id}`,
        displayName: fw.profile.displayName,
        avatarUrl: fw.profile.avatarUrl,
        message: fw.note,
        rating: fw.rating,
      });
    }
  }

  for (const rec of recommendations) {
    if (rec.message) {
      comments.push({
        id: `rec-${rec.id}`,
        displayName: rec.fromUser.displayName,
        avatarUrl: rec.fromUser.avatarUrl,
        message: rec.message,
      });
    }
  }

  if (friendsWatched.length === 0 && comments.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Avatar row for friends who watched */}
      {friendsWatched.length > 0 && (
        <>
          <Text style={styles.title}>Friends Who Watched</Text>
          <View style={styles.avatarRow}>
            {friendsWatched.map((fw) => (
              <View key={fw.profile.id} style={styles.avatarItem}>
                <View style={styles.avatarWrapper}>
                  <Avatar name={fw.profile.displayName} imageUrl={fw.profile.avatarUrl} size="md" />
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>{fw.rating}</Text>
                  </View>
                </View>
                <Text style={styles.avatarName} numberOfLines={1}>
                  {fw.profile.displayName}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Comments from friends */}
      {comments.length > 0 && (
        <View style={friendsWatched.length > 0 ? styles.commentsWithGap : undefined}>
          <Text style={styles.title}>What Friends Said</Text>
          <View style={styles.comments}>
            {comments.map((c) => (
              <View key={c.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <Avatar name={c.displayName} imageUrl={c.avatarUrl} size="sm" />
                  <Text style={styles.commentName}>{c.displayName}</Text>
                  {c.rating != null && (
                    <View style={styles.commentRating}>
                      <Text style={styles.commentRatingText}>{c.rating}/10</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.commentText}>"{c.message}"</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  avatarItem: {
    alignItems: 'center',
    width: 56,
  },
  avatarWrapper: {
    position: 'relative',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  avatarName: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  commentsWithGap: {
    marginTop: spacing.lg,
  },
  comments: {
    gap: spacing.sm,
  },
  commentCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  commentName: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
  commentRating: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  commentRatingText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  commentText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontStyle: 'italic',
    lineHeight: 22,
  },
});
