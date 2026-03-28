import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FriendWatched } from '@/api/types';
import Avatar from './Avatar';
import { colors, spacing, fontSize } from '@/constants/theme';

interface Props {
  friendsWatched: FriendWatched[];
}

export default function FriendsWhoWatched({ friendsWatched }: Props) {
  if (friendsWatched.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friends Who Watched</Text>
      <View style={styles.row}>
        {friendsWatched.map((fw) => (
          <View key={fw.profile.id} style={styles.item}>
            <View style={styles.avatarWrapper}>
              <Avatar name={fw.profile.displayName} imageUrl={fw.profile.avatarUrl} size="md" />
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>{fw.rating}</Text>
              </View>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {fw.profile.displayName}
            </Text>
          </View>
        ))}
      </View>
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  item: {
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
  name: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
