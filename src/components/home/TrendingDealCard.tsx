import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { VemtapText } from '@components/ui/Text';
import { DealEngagementRow } from '@components/home/DealEngagementRow';
import type { TrendingDeal } from '@features/home/data/homeFeed';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export function TrendingDealCard({
  deal,
  onToggleLike,
  onOpenComments,
  onOpenDetail,
}: {
  deal: TrendingDeal;
  onToggleLike?: (id: string) => void;
  onOpenComments?: (id: string) => void;
  onOpenDetail?: (id: string) => void;
}) {
  const liked = deal.liked === true;
  const likeCount = deal.likes + (liked ? 1 : 0);

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
          <DealEngagementRow
            size="sm"
            liked={liked}
            likeCount={likeCount}
            commentCount={deal.comments}
            onToggleLike={onToggleLike ? () => onToggleLike(deal.id) : undefined}
            onOpenComments={onOpenComments ? () => onOpenComments(deal.id) : undefined}
          />
        </View>
      </View>
    </Pressable>
  );
}
