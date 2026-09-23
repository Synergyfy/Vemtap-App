import React from 'react';
import { Image, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import type { NearbyBusiness } from '@features/home/data/homeFeed';
import { colors } from '@theme/colors';

cssInterop(View, { className: 'style' });

export function BusinessRow({ business }: { business: NearbyBusiness }) {
  return (
    <View className="flex-row items-center justify-between rounded-2xl border border-border bg-surface-canvas p-3.5 shadow-md">
      <View className="min-w-0 flex-1 flex-row items-center gap-3.5">
        <View className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-container">
          <Image source={business.image} className="h-full w-full" resizeMode="cover" />
        </View>
        <View className="min-w-0 flex-1 flex-col">
          <VemtapText
            variant="labelMd"
            className="truncate font-sans-semibold text-text"
            numberOfLines={1}
          >
            {business.name}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {business.category} • {business.distance}
          </VemtapText>
          <View className="flex-row items-center gap-1 pt-0.5">
            <Icon name="star" size={14} color={colors.warning} />
            <VemtapText className="font-sans-semibold text-caption text-text">
              {business.rating}
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary">
              {business.ratingCount}
            </VemtapText>
          </View>
        </View>
      </View>
      <View className="ml-2 shrink-0 rounded-lg bg-surface-tint-blue px-2.5 py-1">
        <VemtapText className="font-sans-semibold text-caption text-primary">
          {business.meta}
        </VemtapText>
      </View>
    </View>
  );
}
