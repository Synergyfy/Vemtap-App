import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import type { NearbyDeal } from '@features/home/data/homeFeed';
import { colors } from '@theme/colors';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface NearbyDealGridCardProps {
  deal: NearbyDeal;
  onToggleLike?: (id: string) => void;
  onOpenDetail?: (id: string) => void;
}

export function NearbyDealGridCard({
  deal,
  onToggleLike,
  onOpenDetail,
}: NearbyDealGridCardProps) {
  const liked = deal.liked === true;
  const likeCount = deal.likes;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${deal.title}`}
      onPress={() => onOpenDetail?.(deal.id)}
      className="w-full overflow-hidden rounded-2xl border border-border bg-surface-canvas shadow-md"
    >
      <View className="relative aspect-square w-full overflow-hidden bg-surface-container">
        <Image source={deal.image} className="h-full w-full" resizeMode="cover" />
        <View className="absolute left-2 top-2 rounded-full bg-badge-discount-bg px-2 py-0.5 shadow-sm">
          <VemtapText className="font-sans-bold text-caption text-badge-discount-text">
            {deal.badge}
          </VemtapText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: liked }}
          accessibilityLabel={deal.titleShort}
          onPress={() => onToggleLike?.(deal.id)}
          className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full bg-surface-canvas/90 shadow-sm"
        >
          <Icon
            name={liked ? 'favoriteFilled' : 'favorite'}
            size={16}
            color={liked ? '#BA1A1A' : '#4B5563'}
          />
        </Pressable>
      </View>
      <View className="flex-col justify-between gap-1.5 p-3">
        <View>
          <View className="flex-row items-center gap-1">
            <VemtapText
              variant="caption"
              tone="secondary"
              className="min-w-0 flex-1 truncate"
              numberOfLines={1}
            >
              {deal.merchantShort}
            </VemtapText>
            <Icon
              name={deal.status.kind === 'hot' ? 'fire' : 'verified'}
              size={12}
              color={colors.primary}
            />
          </View>
          <VemtapText
            variant="labelMd"
            className="font-sans-semibold text-text"
            numberOfLines={1}
          >
            {deal.titleShort}
          </VemtapText>
        </View>
        <View className="pt-0.5">
          <View className="flex-row items-baseline gap-1.5">
            <VemtapText variant="labelMd" className="font-sans-bold text-text">
              {deal.price}
            </VemtapText>
            <VemtapText className="font-sans text-caption text-text-tertiary line-through">
              {deal.priceWas}
            </VemtapText>
          </View>
          <View className="flex-row items-center justify-between pt-1">
            <View className="flex-row items-center gap-0.5">
              <Icon name="nearMe" size={13} color={colors.textTertiary} />
              <VemtapText className="font-sans text-caption text-text-secondary">
                {deal.distanceShort}
              </VemtapText>
            </View>
            <View className="flex-row items-center gap-0.5">
              <Icon name="thumbUp" size={13} color={colors.textSecondary} />
              <VemtapText className="font-sans text-caption text-text-secondary">
                {likeCount}
              </VemtapText>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
