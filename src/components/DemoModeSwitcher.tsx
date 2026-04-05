import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Avatar from './Avatar';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

// Demo users — create these in Supabase Dashboard → Authentication → Users → "Add User"
// Set email + password for each. Then run the seed SQL to create their profiles.
const DEMO_USERS = [
  { email: 'alice@demo.seen', password: 'demo1234', name: 'Alice' },
  { email: 'bob@demo.seen', password: 'demo1234', name: 'Bob' },
  { email: 'charlie@demo.seen', password: 'demo1234', name: 'Charlie' },
];

export default function DemoModeSwitcher() {
  const { user, profile } = useAuth();
  const [visible, setVisible] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  // Only show in development
  if (!__DEV__) return null;

  const handleSwitch = async (demoUser: typeof DEMO_USERS[0]) => {
    setSwitching(demoUser.email);
    try {
      // Sign out current user first
      if (user) {
        await supabase.auth.signOut();
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: demoUser.email,
        password: demoUser.password,
      });

      if (error) {
        Alert.alert('Switch Failed', error.message);
      } else {
        setVisible(false);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSwitching(null);
    }
  };

  const currentEmail = user?.email;

  return (
    <>
      <Pressable style={styles.fab} onPress={() => setVisible(true)}>
        <Text style={styles.fabText}>Demo</Text>
      </Pressable>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setVisible(false)}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Demo Mode</Text>
            <Pressable onPress={() => setVisible(false)}>
              <Text style={styles.close}>Done</Text>
            </Pressable>
          </View>

          <Text style={styles.subtitle}>
            Switch between demo users to test social features.
          </Text>

          {currentEmail && (
            <View style={styles.currentUser}>
              <Text style={styles.currentLabel}>Signed in as</Text>
              <Text style={styles.currentEmail}>{profile?.displayName || currentEmail}</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Switch to:</Text>

          {DEMO_USERS.map((demoUser) => {
            const isCurrent = currentEmail === demoUser.email;
            const isSwitching = switching === demoUser.email;

            return (
              <Pressable
                key={demoUser.email}
                style={[styles.userRow, isCurrent && styles.userRowActive]}
                onPress={() => !isCurrent && handleSwitch(demoUser)}
                disabled={isCurrent || !!switching}
              >
                <Avatar name={demoUser.name} size="md" />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{demoUser.name}</Text>
                  <Text style={styles.userEmail}>{demoUser.email}</Text>
                </View>
                {isSwitching && <ActivityIndicator color={colors.primary} />}
                {isCurrent && <Text style={styles.activeLabel}>Active</Text>}
              </Pressable>
            );
          })}

          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Setup (one time)</Text>
            <Text style={styles.instructionsText}>
              1. Supabase Dashboard → Authentication → Users{'\n'}
              2. Click "Add User" for each demo user above{'\n'}
              3. Use the emails/passwords shown above{'\n'}
              4. Run the seed SQL to create profiles + friendships
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 999,
  },
  fabText: {
    color: '#000',
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  modal: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  close: {
    color: colors.primary,
    fontSize: fontSize.md,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginBottom: spacing.xl,
  },
  currentUser: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  currentLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  currentEmail: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  userRowActive: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  userEmail: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  activeLabel: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  instructionsTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  instructionsText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
});
