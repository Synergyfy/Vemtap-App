import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { DealEngagementRow } from '@components/shared/DealEngagementRow';
import { colors } from '@theme/colors';
import type { FeaturedDealOfDay } from '@features/deals/data/dealsFeed';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface FeaturedDealOfDayCardProps {
  deal: FeaturedDealOfDay;
  liked?: boolean;
  onClaim?: (id: string) => void;
  onToggleLike?: (id: string) => void;
  onOpenComments?: (id: string) => void;
  onOpenDetail?: (id: string) => void;
}

export function FeaturedDealOfDayCard({
  deal,
  liked = false,
  onClaim,
  onToggleLike,
  onOpenComments,
  onOpenDetail,
}: FeaturedDealOfDayCardProps) {
  const likeCount = deal.likes + (liked ? 1 : 0);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${deal.title}`}
      onPress={() => onOpenDetail?.(deal.id)}
      className="w-full overflow-hidden rounded-xl bg-surface-canvas shadow-md"
    >
      <View className="relative aspect-video w-full overflow-hidden bg-surface-container">
        <Image source={deal.image} className="h-full w-full" resizeMode="cover" />
        <View className="absolute left-2.5 top-2.5 flex-row items-center gap-1.5">
          <View className="flex-row items-center gap-1 rounded-full bg-primary px-2 py-0.5 shadow-xs">
            <Icon name="star" size={13} color="#FFFFFF" />
            <VemtapText className="font-sans-bold text-caption text-primary-foreground">
              {deal.topPick}
            </VemtapText>
          </View>
          <View className="rounded-full bg-inverse-surface/85 px-2 py-0.5">
            <VemtapText className="font-sans-medium text-caption text-inverse-on-surface">
              {deal.specialPromo}
            </VemtapText>
          </View>
        </View>
        <View className="absolute right-2.5 top-2.5 flex-row items-center gap-1 rounded-full bg-inverse-surface/85 px-2 py-0.5">
          <Icon name="hourglass" size={13} color={colors.tertiaryFixed} />
          <VemtapText className="font-sans-medium text-caption text-inverse-on-surface">
            {deal.endsLabel}
          </VemtapText>
        </View>
      </View>
      <View className="flex-col p-4">
        <View className="mb-1 flex-row items-center justify-between">
          <View className="min-w-0 flex-1 flex-row items-center gap-1">
            <VemtapText
              variant="caption"
              tone="secondary"
              className="font-sans-medium"
              numberOfLines={1}
            >
              {deal.merchant}
            </VemtapText>
            <Icon name="verified" size={14} color={colors.primary} />
          </View>
          <View className="flex-row items-center gap-0.5">
            <Icon name="locationOn" size={13} color={colors.textSecondary} />
            <VemtapText className="font-sans text-caption text-text-secondary">
              {deal.distance}
            </VemtapText>
          </View>
        </View>
        <VemtapText
          accessibilityRole="header"
          className="mb-2 font-sans-bold text-body-lg text-text"
          numberOfLines={2}
        >
          {deal.title}
        </VemtapText>
        <View className="mb-2.5 flex-row items-baseline justify-between">
          <View className="min-w-0 flex-1 flex-row flex-wrap items-baseline gap-2">
            <VemtapText className="font-sans-bold text-heading-md text-text">
              {deal.price}
            </VemtapText>
            <VemtapText className="font-sans text-body-md text-text-tertiary line-through">
              {deal.priceWas}
            </VemtapText>
            <View className="rounded bg-badge-discount-bg px-1.5 py-0.5">
              <VemtapText className="font-sans-semibold text-caption text-badge-discount-text">
                {deal.save}
              </VemtapText>
            </View>
          </View>
          <VemtapText
            className="shrink-0 font-sans-medium text-caption text-error"
            numberOfLines={1}
          >
            {deal.stockLabel}
          </VemtapText>
        </View>
        <View className="flex-row items-center justify-between border-t border-border pt-2.5">
          <DealEngagementRow
            size="sm"
            liked={liked}
            likeCount={likeCount}
            commentCount={deal.comments}
            onToggleLike={onToggleLike ? () => onToggleLike(deal.id) : undefined}
            onOpenComments={onOpenComments ? () => onOpenComments(deal.id) : undefined}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={deal.claimLabel}
            onPress={() => onClaim?.(deal.id)}
            className="h-9 flex-row items-center gap-1.5 rounded-xl bg-primary px-4 shadow-xs active:scale-95"
          >
            <VemtapText className="font-sans-semibold text-label-md text-primary-foreground">
              {deal.claimLabel}
            </VemtapText>
            <Icon name="arrowForward" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
