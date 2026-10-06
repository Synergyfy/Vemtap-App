import React from 'react';
import { Image, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import type { NearbyBusiness } from '@features/home/data/homeFeed';
import { colors } from '@theme/colors';

cssInterop(View, { className: 'style' });

export function BusinessRow({ business }: { business: NearbyBusiness }) {
  /**
   * A real business from `GET /public/businesses` has a name, a category and a
   * logo, but no coordinates and no rating — the endpoint exposes neither. Those
   * rows are omitted rather than filled with a plausible distance or score, so
   * an empty field means "not reported", not "zero".
   */
  const hasDistance = business.distance !== '';
  const hasRating = business.rating !== '';

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
            {/* No trailing separator when there is no distance to show. */}
            {[business.category, hasDistance ? business.distance : '']
              .filter(Boolean)
              .join(' • ')}
          </VemtapText>
          {hasRating ? (
            <View className="flex-row items-center gap-1 pt-0.5">
              <Icon name="star" size={14} color={colors.warning} />
              <VemtapText className="font-sans-semibold text-caption text-text">
                {business.rating}
              </VemtapText>
              <VemtapText variant="caption" tone="tertiary">
                {business.ratingCount}
              </VemtapText>
            </View>
          ) : null}
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
