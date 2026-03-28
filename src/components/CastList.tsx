import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { CastMember } from '@/api/types';
import { getImageUrl } from '@/api/tmdb';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import React from 'react';

interface CastListProps {
  cast: CastMember[];
}

function CastCard({ member }: { member: CastMember }) {
  return (
    <View style={styles.card}>
      <Image
        source={getImageUrl(member.profilePath, 'w185')}
        style={styles.avatar}
        contentFit="cover"
        transition={200}
      />
      <Text style={styles.name} numberOfLines={1}>
        {member.name}
      </Text>
      <Text style={styles.character} numberOfLines={1}>
        {member.character}
      </Text>
    </View>
  );
}

export function CastList({ cast }: CastListProps) {
  if (cast.length === 0) return null;

  return (
    <View>
      <Text style={styles.sectionTitle}>Cast</Text>
      <FlatList
        data={cast}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CastCard member={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    width: 100,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surfaceLight,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  character: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
});
