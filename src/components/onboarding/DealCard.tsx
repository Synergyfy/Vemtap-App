import React from 'react';
import { View, type ImageSourcePropType } from 'react-native';
import { cssInterop } from 'nativewind';
import { VemtapText } from '@components/ui/Text';
import { Icon } from '@components/ui/Icon';
import { LocalSvg } from '@components/ui/LocalSvg';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';

cssInterop(View, { className: 'style' });

export type DealBadgeKind = 'discount' | 'special';
export type DealTagKind = 'hot' | 'trending' | 'exclusive';

export interface Deal {
  id: string;
  category: string;
  categoryTone: 'primary' | 'muted';
  title: string;
  dealTitle: string;
  badgeLabel: string;
  badgeKind: DealBadgeKind;
  tag?: { kind: DealTagKind; label: string };
  distance: string;
  rating: number;
  ratingCount: number;
  imageSource: ImageSourcePropType;
}

export interface DealCardProps {
  deal: Deal;
  className?: string;
}

const tagStyles: Record<DealTagKind, { bg: string; text: string }> = {
  hot: { bg: 'bg-surface-container-high', text: 'text-tertiary-container' },
  trending: { bg: 'bg-surface-tint', text: 'text-primary' },
  exclusive: { bg: 'bg-surface-tint', text: 'text-primary' },
};

export function DealCard({ deal, className }: DealCardProps) {
  const tag = deal.tag ? tagStyles[deal.tag.kind] : null;

  return (
    <View
      className={cn('w-full rounded-xl bg-surface p-3.5 shadow-onboard-md', className)}
    >
      <View className="flex-row gap-3">
        <View className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-container">
          <LocalSvg source={deal.imageSource} />
          <View className="absolute left-1.5 top-1.5 rounded-full bg-badge-discount-bg px-1.5 py-0.5 shadow-onboard-sm">
            <VemtapText className="font-sans-bold text-caption text-badge-discount-text">
              {deal.badgeLabel}
            </VemtapText>
          </View>
        </View>

        <View className="min-w-0 flex-1 flex-col justify-between">
          <View>
            <View className="flex-row items-center justify-between gap-1">
              <VemtapText
                className={cn(
                  'font-sans-semibold text-caption uppercase tracking-wider',
                  deal.categoryTone === 'primary'
                    ? 'text-primary'
                    : 'text-text-secondary',
                )}
                numberOfLines={1}
              >
                {deal.category}
              </VemtapText>
              {tag ? (
                <View
                  className={cn(
                    'flex-row items-center gap-0.5 rounded-full px-1.5 py-0.5',
                    tag.bg,
                  )}
                >
                  <Icon
                    name={
                      deal.tag?.kind === 'hot'
                        ? 'fire'
                        : deal.tag?.kind === 'trending'
                          ? 'trendingUp'
                          : 'verified'
                    }
                    size={13}
                    color={tag.text === 'text-primary' ? colors.primary : '#C94A03'}
                  />
                  <VemtapText className={cn('text-caption', tag.text)} numberOfLines={1}>
                    {deal.tag?.label}
                  </VemtapText>
                </View>
              ) : null}
            </View>
            <VemtapText
              className="mt-0.5 truncate text-heading-sm text-text"
              numberOfLines={1}
            >
              {deal.title}
            </VemtapText>
            <VemtapText
              className="mt-0.5 font-sans-medium text-body-md text-text"
              numberOfLines={1}
            >
              {deal.dealTitle}
            </VemtapText>
          </View>

          <View className="-mx-3.5 -mb-3.5 mt-2 flex-row items-center justify-between rounded-b-xl bg-surface-subtle px-3.5 pb-2 pt-1.5">
            <View className="flex-row items-center gap-1">
              <Icon name="distance" size={15} color={colors.primary} />
              <VemtapText className="text-caption text-text-secondary">
                {deal.distance}
              </VemtapText>
            </View>
            <View className="flex-row items-center gap-1">
              <Icon name="star" size={14} color="#C94A03" />
              <VemtapText className="font-sans-semibold text-caption text-text">
                {deal.rating}
              </VemtapText>
              <VemtapText className="text-caption text-text-tertiary">
                ({deal.ratingCount})
              </VemtapText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
