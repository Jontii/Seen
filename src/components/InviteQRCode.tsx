import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

interface Props {
  inviteCode: string;
  size?: number;
}

export default function InviteQRCode({ inviteCode, size = 180 }: Props) {
  const deepLink = `have-you-seen://invite/${inviteCode}`;

  return (
    <View style={styles.container}>
      <View style={styles.qrWrapper}>
        <QRCode
          value={deepLink}
          size={size}
          backgroundColor={colors.surface}
          color="#FFFFFF"
        />
      </View>
      <Text style={styles.code}>{inviteCode}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  qrWrapper: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  code: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: spacing.sm,
  },
});
