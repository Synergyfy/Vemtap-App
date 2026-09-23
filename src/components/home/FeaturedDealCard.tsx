import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import type { FeaturedDeal } from '@features/home/data/homeFeed';
import { colors } from '@theme/colors';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface FeaturedDealCardProps {
  deal: FeaturedDeal;
  onToggleLike?: (id: string) => void;
}

export function FeaturedDealCard({ deal, onToggleLike }: FeaturedDealCardProps) {
  const liked = deal.liked === true;
  const likeCount = deal.likes + (liked ? 1 : 0);

  return (
    <View className="w-full overflow-hidden rounded-2xl border border-border bg-surface-canvas shadow-md">
      <View className="relative aspect-video w-full overflow-hidden bg-surface-container">
        <Image source={deal.image} className="h-full w-full" resizeMode="cover" />
        <View className="absolute left-3 top-3 rounded-full bg-badge-discount-bg px-2.5 py-1 shadow-sm">
          <VemtapText className="font-sans-bold text-label-sm text-badge-discount-text">
            {deal.badge}
          </VemtapText>
        </View>
        <View className="absolute right-3 top-3 flex-row items-center gap-1 rounded-full bg-surface-canvas/90 px-2.5 py-1 shadow-sm">
          <Icon name="schedule" size={15} color={colors.tertiary} />
          <VemtapText className="font-sans-medium text-label-sm text-text-tertiary">
            {deal.endsLabel}
          </VemtapText>
        </View>
      </View>
      <View className="flex-col gap-2.5 p-4">
        <View className="flex-row items-center justify-between">
          <VemtapText
            variant="labelSm"
            tone="secondary"
            className="flex-1 font-sans-medium"
            numberOfLines={1}
          >
            {deal.merchant}
          </VemtapText>
          <View className="flex-row items-center gap-0.5">
            <Icon name="verified" size={14} color={colors.primary} />
            <VemtapText className="font-sans-semibold text-caption text-primary">
              {deal.status.label}
            </VemtapText>
          </View>
        </View>
        <VemtapText variant="headingSm" className="leading-snug text-text">
          {deal.title}
        </VemtapText>
        <View className="flex-row items-baseline gap-2">
          <VemtapText variant="headingSm" className="font-sans-bold text-text">
            {deal.price}
          </VemtapText>
          <VemtapText variant="bodyMd" tone="tertiary" className="line-through">
            {deal.priceWas}
          </VemtapText>
        </View>
        <View className="flex-row items-center gap-1 pt-0.5">
          <Icon name="nearMe" size={16} color={colors.textTertiary} />
          <VemtapText variant="caption" tone="secondary">
            {deal.distance}
          </VemtapText>
        </View>
        <View className="flex-row items-center justify-between pt-3">
          <View className="flex-row items-center gap-4">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: liked }}
              onPress={() => onToggleLike?.(deal.id)}
              className="flex-row items-center gap-1.5"
            >
              <Icon
                name={liked ? 'favoriteFilled' : 'favorite'}
                size={18}
                color={liked ? '#BA1A1A' : '#4B5563'}
              />
              <VemtapText variant="labelSm" tone="secondary">
                {likeCount}
              </VemtapText>
            </Pressable>
            <View className="flex-row items-center gap-1.5">
              <Icon name="comment" size={18} color={colors.textSecondary} />
              <VemtapText variant="labelSm" tone="secondary">
                {deal.comments}
              </VemtapText>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.home.share}
            className="flex-row items-center gap-1"
          >
            <Icon name="share" size={18} color={colors.textSecondary} />
            <VemtapText variant="labelSm" tone="secondary">
              {strings.home.share}
            </VemtapText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
