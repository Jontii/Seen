import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFriends } from '@/hooks/useFriends';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useSendFrequency } from '@/hooks/useSendFrequency';
import { MediaType, Profile } from '@/api/types';
import Avatar from './Avatar';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  tmdbId: number;
  imdbId: string | null;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  year: string;
}

export default function SendToFriendSheet({
  visible,
  onClose,
  tmdbId,
  imdbId,
  mediaType,
  title,
  posterPath,
  year,
}: Props) {
  const { friends } = useFriends();
  const { sendRecommendation } = useRecommendations();
  const { frequentFriendIds } = useSendFrequency();

  const sortedFriends = useMemo(() => {
    if (frequentFriendIds.length === 0) return friends;
    const frequentSet = new Set(frequentFriendIds);
    return [...friends].sort((a, b) => {
      const aFreq = frequentSet.has(a.id) ? 0 : 1;
      const bFreq = frequentSet.has(b.id) ? 0 : 1;
      return aFreq - bFreq;
    });
  }, [friends, frequentFriendIds]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
    if (selected.size === 0) return;
    setIsSending(true);
    try {
      await sendRecommendation({
        toUserIds: Array.from(selected),
        tmdbId,
        imdbId,
        mediaType,
        title,
        posterPath,
        year,
        message: message.trim() || null,
      });
      Alert.alert('Sent!', `Recommendation sent to ${selected.size} friend${selected.size > 1 ? 's' : ''}`);
      setSelected(new Set());
      setMessage('');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send');
    } finally {
      setIsSending(false);
    }
  };

  const frequentSet = useMemo(() => new Set(frequentFriendIds), [frequentFriendIds]);

  const renderFriend = ({ item }: { item: Profile }) => {
    const isSelected = selected.has(item.id);
    const isFrequent = frequentSet.has(item.id);
    return (
      <Pressable style={[styles.friendRow, isSelected && styles.friendRowSelected]} onPress={() => toggle(item.id)}>
        <Avatar name={item.displayName} imageUrl={item.avatarUrl} size="md" />
        <Text style={styles.friendName}>{item.displayName}</Text>
        {isFrequent && <Text style={styles.recentLabel}>Recent</Text>}
        <Ionicons
          name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={isSelected ? colors.primary : colors.textTertiary}
        />
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Send to Friends</Text>
          <Pressable onPress={handleSend} disabled={selected.size === 0 || isSending}>
            {isSending ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={[styles.sendText, selected.size === 0 && styles.sendTextDisabled]}>
                Send
              </Text>
            )}
          </Pressable>
        </View>

        <TextInput
          style={styles.messageInput}
          placeholder="Add a message (optional)"
          placeholderTextColor={colors.textTertiary}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={200}
        />

        <FlatList
          data={sortedFriends}
          keyExtractor={(item) => item.id}
          renderItem={renderFriend}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No friends yet. Add friends to send recommendations.</Text>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  sendText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  sendTextDisabled: {
    opacity: 0.4,
  },
  messageInput: {
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: fontSize.md,
    padding: spacing.lg,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    minHeight: 60,
    maxHeight: 100,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  friendRowSelected: {
    backgroundColor: colors.surface,
  },
  friendName: {
    color: colors.text,
    fontSize: fontSize.md,
    flex: 1,
  },
  recentLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    padding: spacing.xxl,
  },
});
