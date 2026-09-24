import React, { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import type { BusinessProfileSummary } from '@features/discover/data/discoverData';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface BusinessDiscoveryCardProps {
  business: BusinessProfileSummary;
  onOpen: (businessId: string) => void;
}

export function BusinessDiscoveryCard({ business, onOpen }: BusinessDiscoveryCardProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const StatusIcon = business.status.icon === 'exclusive' ? 'checkCircle' : 'verified';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={strings.discoverFeed.openBusiness(business.name)}
      onPress={() => onOpen(business.id)}
      className="w-full overflow-hidden rounded-2xl border border-border bg-surface-canvas shadow-md active:scale-[0.99]"
    >
      <View className="relative aspect-video w-full overflow-hidden bg-surface-container">
        <Image
          source={{ uri: business.imageUri }}
          accessibilityLabel={business.imageAlt}
          className="h-full w-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-surface-dark/60" />
        <View className="absolute left-3 top-3 flex-row items-center gap-1.5 rounded-full bg-surface-canvas/90 px-2.5 py-1 shadow-sm">
          <Icon name={StatusIcon} size={15} color={colors.primaryContainer} />
          <VemtapText className="font-sans-semibold text-caption text-text">
            {business.status.label}
          </VemtapText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.discoverFeed.bookmarkBusiness(business.name)}
          accessibilityState={{ selected: bookmarked }}
          hitSlop={6}
          onPress={() => setBookmarked(value => !value)}
          className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full bg-surface-dark/70 active:scale-90"
        >
          <Icon
            name="bookmark"
            size={18}
            color={bookmarked ? colors.primary : colors.surface}
          />
        </Pressable>
        <View className="absolute bottom-3 left-3 flex-row items-center gap-1">
          <Icon name="star" size={16} color={colors.warning} />
          <VemtapText className="font-sans-bold text-label-sm text-text-inverse">
            {business.rating}
          </VemtapText>
          <VemtapText className="text-caption text-text-inverse">
            {strings.discoverFeed.reviewCount(business.reviews)}
          </VemtapText>
        </View>
      </View>

      <View className="gap-1.5 p-4">
        <View className="flex-row items-start gap-2">
          <View className="min-w-0 flex-1">
            <VemtapText
              accessibilityRole="header"
              variant="headingSm"
              className="text-text"
              numberOfLines={1}
            >
              {business.name}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {business.category}
            </VemtapText>
          </View>
          <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted">
            <Icon name="arrowForward" size={18} color={colors.textSecondary} />
          </View>
        </View>

        <View className="flex-row items-center gap-1">
          <Icon name="nearMe" size={16} color={colors.primary} />
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {strings.discoverFeed.businessLocation(business.distance, business.location)}
          </VemtapText>
        </View>

        <View className="mt-0.5 flex-row items-center gap-1.5 rounded-xl bg-badge-discount-bg px-3 py-1.5 shadow-sm">
          <Icon name="localOffer" size={18} color={colors.badgeDiscountText} />
          <VemtapText
            className="min-w-0 flex-1 font-sans-semibold text-label-sm text-badge-discount-text"
            numberOfLines={1}
          >
            {business.activeDealLabel}
          </VemtapText>
          <Icon name="bolt" size={16} color={colors.badgeDiscountText} />
        </View>
      </View>
    </Pressable>
  );
}
