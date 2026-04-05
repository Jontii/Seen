import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { WatchProviders as WatchProvidersType, WatchProviderInfo } from '@/api/types';
import { getImageUrl } from '@/api/tmdb';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

interface Props {
  providers: WatchProvidersType | null | undefined;
}

function ProviderRow({ label, items }: { label: string; items: WatchProviderInfo[] }) {
  if (items.length === 0) return null;

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.logos}>
        {items.map((p) => (
          <View key={p.providerId} style={styles.providerItem}>
            <Image
              source={getImageUrl(p.logoPath, 'w45')}
              style={styles.logo}
              contentFit="cover"
            />
            <Text style={styles.providerName} numberOfLines={1}>{p.providerName}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function WatchProviders({ providers }: Props) {
  if (!providers) return null;

  const hasAny = providers.flatrate.length > 0 || providers.rent.length > 0 || providers.buy.length > 0;
  if (!hasAny) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where to Watch</Text>
      <ProviderRow label="Stream" items={providers.flatrate} />
      <ProviderRow label="Rent" items={providers.rent} />
      <ProviderRow label="Buy" items={providers.buy} />
      <Text style={styles.attribution}>Data provided by JustWatch</Text>
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
    marginBottom: spacing.md,
  },
  rowLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  logos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  providerItem: {
    alignItems: 'center',
    width: 52,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
  },
  providerName: {
    color: colors.textTertiary,
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
  attribution: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});
