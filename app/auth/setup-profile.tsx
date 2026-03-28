import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

export default function SetupProfileScreen() {
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { updateProfile } = useAuth();
  const router = useRouter();

  const handleSave = async () => {
    const trimmed = displayName.trim();
    if (!trimmed) return;

    setIsSaving(true);
    try {
      await updateProfile({ display_name: trimmed });
      router.replace('/(tabs)/search');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What should we call you?</Text>
      <Text style={styles.subtitle}>
        Choose a display name that your friends will see.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Display name"
        placeholderTextColor={colors.textTertiary}
        value={displayName}
        onChangeText={setDisplayName}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={handleSave}
        maxLength={30}
      />

      <Pressable
        style={[styles.button, (!displayName.trim() || isSaving) && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={!displayName.trim() || isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: fontSize.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
