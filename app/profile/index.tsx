import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Share, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Avatar from '@/components/Avatar';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

export default function ProfileScreen() {
  const { user, profile, signOut, updateProfile, refreshProfile } = useAuth();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0] || !user) return;

    setIsUploading(true);
    try {
      const asset = result.assets[0];
      const ext = asset.uri.split('.').pop() || 'jpg';
      const filePath = `${user.id}/avatar.${ext}`;

      // Read the file as arraybuffer (blob doesn't work reliably on RN)
      const response = await fetch(asset.uri);
      const arrayBuffer = await response.arrayBuffer();

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          upsert: true,
          contentType: asset.mimeType || `image/${ext}`,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add cache-buster to force refresh
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: avatarUrl });
      await refreshProfile();
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message || 'Could not upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!profile?.inviteCode) return;
    await Clipboard.setStringAsync(profile.inviteCode);
    Alert.alert('Copied', 'Invite code copied to clipboard');
  };

  const handleShareCode = async () => {
    if (!profile?.inviteCode) return;
    await Share.share({
      message: `Add me on Seen? Use my invite code: ${profile.inviteCode}\n\nOr tap: have-you-seen://invite/${profile.inviteCode}`,
    });
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.dismissAll();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.rpc('delete_own_account');
            if (error) {
              Alert.alert('Error', error.message);
              return;
            }
            await signOut();
            router.dismissAll();
          },
        },
      ],
    );
  };

  if (!profile) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handlePickAvatar} style={styles.avatarWrapper}>
          <Avatar name={profile.displayName} imageUrl={profile.avatarUrl} size="xl" />
          {isUploading ? (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator color="#fff" size="small" />
            </View>
          ) : (
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          )}
        </Pressable>
        <Text style={styles.displayName}>{profile.displayName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.inviteSection}>
        <Text style={styles.sectionLabel}>Your Invite Code</Text>
        <View style={styles.codeRow}>
          <Text style={styles.code}>{profile.inviteCode}</Text>
          <Pressable onPress={handleCopyCode} style={styles.iconButton}>
            <Ionicons name="copy-outline" size={20} color={colors.primary} />
          </Pressable>
          <Pressable onPress={handleShareCode} style={styles.iconButton}>
            <Ionicons name="share-outline" size={20} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.row} onPress={() => router.push('/profile/friends')}>
        <Ionicons name="people-outline" size={22} color={colors.text} />
        <Text style={styles.rowText}>Friends</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </Pressable>

      <Pressable style={styles.row} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={22} color={colors.text} />
        <Text style={styles.rowText}>Sign Out</Text>
      </Pressable>

      <Pressable style={[styles.row, styles.destructiveRow]} onPress={handleDeleteAccount}>
        <Ionicons name="trash-outline" size={22} color={colors.destructive} />
        <Text style={[styles.rowText, { color: colors.destructive }]}>Delete Account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    paddingTop: spacing.lg,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayName: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  email: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  inviteSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  code: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    letterSpacing: 4,
    flex: 1,
  },
  iconButton: {
    padding: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  rowText: {
    color: colors.text,
    fontSize: fontSize.lg,
    flex: 1,
  },
  destructiveRow: {
    marginTop: spacing.xl,
  },
});
