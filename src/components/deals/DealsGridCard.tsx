import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import type { DealGridItem } from '@features/deals/data/dealsFeed';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface DealsGridCardProps {
  deal: DealGridItem;
  onClaim?: (id: string) => void;
  onOpenDetail?: (id: string) => void;
}

export function DealsGridCard({ deal, onClaim, onOpenDetail }: DealsGridCardProps) {
  const isPromoLeft = deal.leftBadge.tone === 'promo';
  const right = deal.rightBadge;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${deal.title}`}
      onPress={() => onOpenDetail?.(deal.id)}
      className="w-full overflow-hidden rounded-2xl bg-surface-canvas shadow-md"
    >
      <View className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container">
        <Image source={deal.image} className="h-full w-full" resizeMode="cover" />
        <View
          className={cn(
            'absolute left-2 top-2 rounded-full px-1.5 py-0.5 shadow-xs',
            isPromoLeft ? 'bg-secondary-container' : 'bg-badge-discount-bg',
          )}
        >
          <VemtapText
            className={cn(
              'font-sans-bold text-caption',
              isPromoLeft ? 'text-on-secondary-container' : 'text-badge-discount-text',
            )}
          >
            {deal.leftBadge.label}
          </VemtapText>
        </View>
        {right.kind === 'timer' ? (
          <View className="absolute right-2 top-2 flex-row items-center gap-0.5 rounded-full bg-inverse-surface/85 px-1.5 py-0.5">
            <Icon name="hourglass" size={12} color={colors.tertiaryFixed} />
            <VemtapText className="font-sans-medium text-caption text-inverse-on-surface">
              {right.label}
            </VemtapText>
          </View>
        ) : right.tone === 'primary' ? (
          <View className="absolute right-2 top-2 rounded-full bg-surface-canvas/90 px-1.5 py-0.5">
            <VemtapText className="font-sans-semibold text-caption text-primary">
              {right.label}
            </VemtapText>
          </View>
        ) : (
          <View className="absolute right-2 top-2 flex-row items-center gap-0.5 rounded-full bg-inverse-surface/85 px-1.5 py-0.5">
            {right.icon === 'bolt' ? (
              <Icon name="bolt" size={12} color={colors.tertiaryFixed} />
            ) : null}
            <VemtapText className="font-sans-medium text-caption text-inverse-on-surface">
              {right.label}
            </VemtapText>
          </View>
        )}
      </View>
      <View className="flex-col justify-between gap-1.5 p-3">
        <View>
          <View className="mb-1 flex-row items-center gap-1">
            <VemtapText
              variant="caption"
              tone="secondary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {deal.merchant}
            </VemtapText>
            {deal.statusIcon === 'verified' ? (
              <Icon name="verified" size={14} color={colors.primary} />
            ) : deal.statusIcon === 'hot' ? (
              <Icon name="fire" size={14} color={colors.tertiaryContainer} />
            ) : null}
          </View>
          <VemtapText
            variant="labelMd"
            className="mb-1.5 font-sans-semibold text-text"
            numberOfLines={2}
          >
            {deal.title}
          </VemtapText>
          <View className="mb-1 flex-row items-baseline gap-1.5">
            <VemtapText className="font-sans-bold text-button-md text-text">
              {deal.price}
            </VemtapText>
            <VemtapText className="font-sans text-caption text-text-tertiary line-through">
              {deal.priceWas}
            </VemtapText>
          </View>
          <View className="mb-2 self-start rounded bg-badge-discount-bg px-1.5 py-0.5">
            <VemtapText className="font-sans-semibold text-caption text-badge-discount-text">
              {deal.save}
            </VemtapText>
          </View>
        </View>
        <View className="mt-1 w-full flex-row items-center gap-2 border-t border-border pt-1">
          <View className="min-w-0 flex-1 flex-row items-center gap-0.5">
            <Icon name="locationOn" size={13} color={colors.textTertiary} />
            <VemtapText
              className="font-sans text-caption text-text-secondary"
              numberOfLines={1}
            >
              {deal.distance}
            </VemtapText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={deal.claimLabel}
            onPress={() => onClaim?.(deal.id)}
            className="ml-auto h-7 shrink-0 items-center justify-center rounded-lg bg-primary px-2 shadow-xs active:scale-95"
          >
            <VemtapText className="font-sans-semibold text-caption text-primary-foreground">
              {deal.claimLabel}
            </VemtapText>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
