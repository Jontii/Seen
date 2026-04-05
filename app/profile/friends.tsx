import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFriends } from '@/hooks/useFriends';
import Avatar from '@/components/Avatar';
import { Profile } from '@/api/types';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

export default function FriendsScreen() {
  const { friends, isLoading, removeFriend } = useFriends();
  const router = useRouter();

  const handleRemove = (friend: Profile) => {
    Alert.alert('Remove Friend', `Remove ${friend.displayName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeFriend(friend.id),
      },
    ]);
  };

  const renderItem = ({ item }: { item: Profile }) => (
    <View style={styles.row}>
      <Avatar name={item.displayName} imageUrl={item.avatarUrl} size="md" />
      <Text style={styles.name}>{item.displayName}</Text>
      <Pressable onPress={() => handleRemove(item)} hitSlop={8}>
        <Ionicons name="close-circle" size={22} color={colors.textTertiary} />
      </Pressable>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <Pressable style={[styles.addButton, styles.buttonFlex]} onPress={() => router.push('/profile/add-friend')}>
          <Ionicons name="person-add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Friend</Text>
        </Pressable>
        <Pressable style={[styles.scanButton, styles.buttonFlex]} onPress={() => router.push('/profile/scan-qr')}>
          <Ionicons name="qr-code" size={20} color={colors.text} />
          <Text style={styles.scanButtonText}>Scan QR</Text>
        </Pressable>
      </View>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={friends.length === 0 ? styles.center : undefined}
        ListEmptyComponent={
          <Text style={styles.empty}>No friends yet. Share your invite code or add a friend by theirs.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  buttonFlex: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  addButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  scanButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.lg,
    flex: 1,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    padding: spacing.xxl,
  },
});
