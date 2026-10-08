import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { DealEngagementRow } from '@components/shared/DealEngagementRow';
import { cn } from '@utils/cn';
import { strings } from '@constants/strings';
import type { NearbyDeal } from '@features/home/data/homeFeed';
import { colors } from '@theme/colors';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface NearbyDealListCardProps {
  deal: NearbyDeal;
  onToggleLike?: (id: string) => void;
  onOpenComments?: (id: string) => void;
  onShare?: (id: string) => void;
  onOpenDetail?: (id: string) => void;
}

export function NearbyDealListCard({
  deal,
  onToggleLike,
  onOpenComments,
  onShare,
  onOpenDetail,
}: NearbyDealListCardProps) {
  const liked = deal.liked === true;
  // Count comes from the engagement cache only — never +1 for `liked`, or a
  // like would show twice (cache already includes this user's reaction).
  const likeCount = deal.likes;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${deal.title}`}
      onPress={() => onOpenDetail?.(deal.id)}
      className="w-full overflow-hidden rounded-2xl border border-border bg-surface-canvas shadow-md"
    >
      <View className="relative aspect-video w-full overflow-hidden bg-surface-container">
        <Image source={deal.image} className="h-full w-full" resizeMode="cover" />
        <View className="absolute left-3 top-3 rounded-full bg-badge-discount-bg px-2.5 py-1 shadow-sm">
          <VemtapText className="font-sans-bold text-label-sm text-badge-discount-text">
            {deal.badge}
          </VemtapText>
        </View>
        {deal.metaBadge ? (
          deal.metaBadge.kind === 'schedule' ? (
            <View className="absolute right-3 top-3 flex-row items-center gap-1 rounded-full bg-surface-canvas/90 px-2.5 py-1 shadow-sm">
              <Icon name="schedule" size={15} color={colors.tertiary} />
              <VemtapText className="font-sans-medium text-label-sm text-text-tertiary">
                {deal.metaBadge.label}
              </VemtapText>
            </View>
          ) : (
            <View className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 shadow-sm">
              <VemtapText className="font-sans-semibold text-label-sm text-primary-foreground">
                {deal.metaBadge.label}
              </VemtapText>
            </View>
          )
        ) : null}
      </View>
      <View className="flex-col gap-2.5 p-4">
        <View className="flex-row items-center justify-between">
          <VemtapText
            variant="labelSm"
            tone="secondary"
            className="min-w-0 flex-1 font-sans-medium"
            numberOfLines={1}
          >
            {deal.merchant}
          </VemtapText>
          <View className="flex-row items-center gap-0.5">
            <Icon
              name={deal.status.kind === 'hot' ? 'fire' : 'verified'}
              size={14}
              color={colors.primary}
            />
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
          <DealEngagementRow
            liked={liked}
            likeCount={likeCount}
            commentCount={deal.comments}
            onToggleLike={onToggleLike ? () => onToggleLike(deal.id) : undefined}
            onOpenComments={onOpenComments ? () => onOpenComments(deal.id) : undefined}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.home.share}
            disabled={!onShare}
            onPress={() => onShare?.(deal.id)}
            className={cn('flex-row items-center gap-1', !onShare && 'opacity-60')}
          >
            <Icon name="share" size={18} color={colors.textSecondary} />
            <VemtapText variant="labelSm" tone="secondary">
              {strings.home.share}
            </VemtapText>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
