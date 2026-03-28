import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name[0] || '?').toUpperCase();
}

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES = { sm: 28, md: 36, lg: 56, xl: 88 };
const FONT_SIZES = { sm: 11, md: 14, lg: 22, xl: 34 };

export default function Avatar({ name, imageUrl, size = 'md' }: AvatarProps) {
  const dimension = SIZES[size];
  const fSize = FONT_SIZES[size];

  if (imageUrl) {
    return (
      <Image
        source={imageUrl}
        style={{
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
        }}
        contentFit="cover"
        transition={150}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: getColor(name),
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: fSize }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '700',
  },
});
