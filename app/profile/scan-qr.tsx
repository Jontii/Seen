import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFriends } from '@/hooks/useFriends';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

function parseInviteCode(data: string): string | null {
  // Try deep link format: have-you-seen://invite/CODE
  const deepLinkMatch = data.match(/have-you-seen:\/\/invite\/(\w+)/);
  if (deepLinkMatch) return deepLinkMatch[1];

  // Try plain code (alphanumeric, 4-12 chars)
  const trimmed = data.trim();
  if (/^\w{4,12}$/.test(trimmed)) return trimmed;

  return null;
}

export default function ScanQRScreen() {
  const router = useRouter();
  const { addFriendByCode } = useFriends();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const processingRef = useRef(false);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setScanned(true);

    const code = parseInviteCode(data);
    if (!code) {
      Alert.alert('Invalid QR Code', 'This QR code doesn\'t contain a valid invite code.', [
        { text: 'Try Again', onPress: () => { setScanned(false); processingRef.current = false; } },
        { text: 'Cancel', onPress: () => router.back() },
      ]);
      return;
    }

    try {
      await addFriendByCode(code);
      Alert.alert('Friend Added!', 'You\'re now connected.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not add friend.', [
        { text: 'Try Again', onPress: () => { setScanned(false); processingRef.current = false; } },
        { text: 'Cancel', onPress: () => router.back() },
      ]);
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera access is needed to scan QR codes</Text>
        <Pressable style={styles.grantButton} onPress={requestPermission}>
          <Text style={styles.grantButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <Text style={styles.instructions}>Point at a friend's QR code</Text>
      </View>
      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeText}>Close</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructions: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  closeText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  permissionText: {
    color: colors.text,
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  grantButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  grantButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
