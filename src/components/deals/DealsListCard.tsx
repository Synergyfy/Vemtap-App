import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import type { DealListItem } from '@features/deals/data/dealsFeed';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface DealsListCardProps {
  deal: DealListItem;
  onClaim?: (id: string) => void;
  onOpenDetail?: (id: string) => void;
  onToggleLike?: (id: string) => void;
  liked?: boolean;
}

/** List feed card — vemtap_deals_discovery_unfiltered_featured/code.html */
export function DealsListCard({
  deal,
  onClaim,
  onOpenDetail,
  onToggleLike,
  liked = false,
}: DealsListCardProps) {
  const isPromoLeft = deal.leftBadge.tone === 'promo';
  const right = deal.rightBadge;
  const likeCount = deal.likes + (liked ? 1 : 0);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${deal.title}`}
      onPress={() => onOpenDetail?.(deal.id)}
      className="w-full overflow-hidden rounded-xl bg-surface-canvas shadow-md"
    >
      <View className="relative h-48 w-full overflow-hidden bg-surface-container">
        <Image source={deal.image} className="h-full w-full" resizeMode="cover" />
        <View
          className={cn(
            'absolute left-3 top-3 rounded-full px-2.5 py-1 shadow-sm',
            isPromoLeft ? 'bg-secondary-container' : 'bg-badge-discount-bg',
          )}
        >
          <VemtapText
            className={cn(
              'font-sans-bold text-label-sm',
              isPromoLeft ? 'text-on-secondary-container' : 'text-badge-discount-text',
            )}
          >
            {deal.leftBadge.label}
          </VemtapText>
        </View>
        {right.kind === 'timer' ? (
          <View className="absolute right-3 top-3 flex-row items-center gap-1 rounded-full bg-inverse-surface/85 px-2.5 py-1">
            <Icon name="hourglass" size={13} color={colors.tertiaryFixed} />
            <VemtapText className="font-sans-medium text-caption text-inverse-on-surface">
              {right.label}
            </VemtapText>
          </View>
        ) : right.tone === 'primary' ? (
          <View className="absolute right-3 top-3 rounded-full bg-surface-canvas/90 px-2.5 py-1">
            <VemtapText className="font-sans-semibold text-caption text-primary">
              {right.label}
            </VemtapText>
          </View>
        ) : right.tone === 'discount' ? (
          <View className="absolute right-3 top-3 rounded-full bg-badge-discount-bg px-2.5 py-1">
            <VemtapText className="font-sans-semibold text-caption text-badge-discount-text">
              {right.label}
            </VemtapText>
          </View>
        ) : (
          <View className="absolute right-3 top-3 rounded-full bg-surface-canvas/90 px-2.5 py-1">
            <VemtapText className="font-sans-semibold text-caption text-text">
              {right.label}
            </VemtapText>
          </View>
        )}
      </View>

      <View className="flex-col p-4">
        <View className="mb-1 flex-row items-center gap-1">
          <VemtapText
            variant="labelSm"
            tone="secondary"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {deal.merchant}
          </VemtapText>
          {deal.statusIcon === 'verified' ? (
            <Icon name="verified" size={16} color={colors.primary} />
          ) : deal.statusIcon === 'hot' ? (
            <Icon name="fire" size={16} color={colors.tertiaryContainer} />
          ) : null}
        </View>

        <VemtapText
          accessibilityRole="header"
          variant="headingSm"
          className="mb-2 leading-tight text-text"
        >
          {deal.title}
        </VemtapText>

        <View className="mb-2 flex-row flex-wrap items-center gap-2">
          <VemtapText className="font-sans-bold text-heading-md text-text">
            {deal.price}
          </VemtapText>
          <VemtapText className="font-sans text-body-md text-text-tertiary line-through">
            {deal.priceWas}
          </VemtapText>
          <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
            <VemtapText className="font-sans-semibold text-caption text-badge-discount-text">
              {deal.save}
            </VemtapText>
          </View>
        </View>

        <View className="mb-4 flex-row flex-wrap items-center justify-between gap-1">
          <View className="flex-row items-center gap-1">
            <Icon name="locationOn" size={14} color={colors.textSecondary} />
            <VemtapText className="font-sans text-caption text-text-secondary">
              {deal.location}
            </VemtapText>
          </View>
          <VemtapText
            className={cn(
              'font-sans-medium text-caption',
              deal.metaTone === 'tertiary' ? 'text-tertiary' : 'text-text-secondary',
            )}
          >
            {deal.meta}
          </VemtapText>
        </View>

        <View className="flex-row items-center justify-between border-t border-border pt-3">
          <View className="flex-row items-center gap-4">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${likeCount} likes`}
              accessibilityState={{ selected: liked }}
              onPress={() => onToggleLike?.(deal.id)}
              className="flex-row items-center gap-1"
            >
              <Icon
                name={liked ? 'favoriteFilled' : 'favorite'}
                size={18}
                color={liked ? colors.error : colors.textSecondary}
              />
              <VemtapText className="font-sans text-caption text-text-secondary">
                {likeCount}
              </VemtapText>
            </Pressable>
            <View className="flex-row items-center gap-1">
              <Icon name="comment" size={18} color={colors.textSecondary} />
              <VemtapText className="font-sans text-caption text-text-secondary">
                {deal.comments}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share deal"
              className="flex-row items-center"
            >
              <Icon name="share" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={deal.claimLabel}
            onPress={() => onClaim?.(deal.id)}
            className="h-10 items-center justify-center rounded-xl bg-primary px-4 shadow-sm active:scale-95"
          >
            <VemtapText className="font-sans-semibold text-label-md text-primary-foreground">
              {deal.claimLabel}
            </VemtapText>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
