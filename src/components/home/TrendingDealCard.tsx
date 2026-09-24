import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import type { TrendingDeal } from '@features/home/data/homeFeed';
import { colors } from '@theme/colors';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export function TrendingDealCard({
  deal,
  onOpenDetail,
}: {
  deal: TrendingDeal;
  onOpenDetail?: (id: string) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${deal.title}`}
      onPress={() => onOpenDetail?.(deal.id)}
      className="w-[260px] shrink-0 overflow-hidden rounded-2xl border border-border bg-surface-canvas shadow-md"
    >
      <View className="relative h-32 w-full overflow-hidden bg-surface-container">
        <Image source={deal.image} className="h-full w-full" resizeMode="cover" />
        <View className="absolute left-2.5 top-2.5 rounded-full bg-badge-discount-bg px-2 py-0.5">
          <VemtapText className="font-sans-bold text-caption text-badge-discount-text">
            {deal.badge}
          </VemtapText>
        </View>
      </View>
      <View className="flex-col gap-2 p-3.5">
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {deal.merchant}
        </VemtapText>
        <VemtapText
          variant="labelMd"
          className="font-sans-semibold text-text"
          numberOfLines={1}
        >
          {deal.title}
        </VemtapText>
        <View className="flex-row items-baseline gap-2">
          <VemtapText variant="labelMd" className="font-sans-bold text-text">
            {deal.price}
          </VemtapText>
          <VemtapText className="font-sans text-caption text-text-tertiary line-through">
            {deal.priceWas}
          </VemtapText>
        </View>
        <View className="flex-row items-center justify-between pt-1">
          <VemtapText variant="caption" tone="secondary">
            {deal.distance}
          </VemtapText>
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-0.5">
              <Icon name="favorite" size={14} color={colors.textSecondary} />
              <VemtapText variant="caption" tone="secondary">
                {deal.likes}
              </VemtapText>
            </View>
            <View className="flex-row items-center gap-0.5">
              <Icon name="comment" size={14} color={colors.textSecondary} />
              <VemtapText variant="caption" tone="secondary">
                {deal.comments}
              </VemtapText>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
