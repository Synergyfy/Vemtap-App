import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import type { FeaturedListing } from '@features/home/data/featuredDeals';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

const copy = strings.featuredDeals;

export interface FeaturedDealsCardProps {
  listing: FeaturedListing;
  onOpen?: (id: string) => void;
  onToggleSave?: (id: string) => void;
  saved?: boolean;
  className?: string;
}

/**
 * Promoted/sponsored listing card for the Featured Deals screen.
 * `stitch_vemtap_mobile_app_design/featured_deals/code.html`
 *
 * Anatomy follows the design: a 176pt hero image carrying the discount /
 * promotion badges, the bookmark, and the distance + urgency pills as overlays,
 * then the body block (merchant · rating, title, one-line body) and a footer row
 * with the struck price beside an inline "View Deal" action.
 *
 * Distinct from the image-led `DealsListCard` / `FeaturedDealOfDayCard` feeds
 * because the badges, bookmark and both meta pills sit *on* the artwork — a
 * composition the discovery feed cards deliberately do not use.
 */
export function FeaturedDealsCard({
  listing,
  onOpen,
  onToggleSave,
  saved = false,
  className,
}: FeaturedDealsCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={copy.viewDeal}
      onPress={() => onOpen?.(listing.id)}
      className={cn(
        'w-full overflow-hidden rounded-2xl bg-surface shadow-sm active:opacity-95',
        className,
      )}
    >
      <View className="relative h-44 w-full overflow-hidden bg-surface-container">
        <Image
          source={listing.image}
          className="h-full w-full"
          resizeMode="cover"
          accessibilityLabel={listing.title}
        />

        <View className="absolute left-3 top-3 flex-row flex-wrap items-center gap-1.5">
          <View className="rounded-full bg-badge-discount-bg px-2.5 py-1 shadow-sm">
            <VemtapText
              variant="caption"
              className="font-sans-bold text-badge-discount-text"
              numberOfLines={1}
            >
              {listing.discount}
            </VemtapText>
          </View>
          <View className="rounded-full bg-inverse-surface/85 px-2 py-0.5">
            <VemtapText
              variant="caption"
              className="font-sans-medium text-inverse-on-surface"
              numberOfLines={1}
            >
              {listing.promotion}
            </VemtapText>
          </View>
          <View className="h-1.5 w-1.5 rounded-full bg-primary-fixed" />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: saved }}
          accessibilityLabel={copy.bookmark(listing.title)}
          onPress={() => onToggleSave?.(listing.id)}
          hitSlop={8}
          className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-surface/90"
        >
          <Icon
            name="bookmark"
            size={20}
            color={saved ? colors.primary : colors.textSecondary}
          />
        </Pressable>

        <View className="absolute bottom-3 left-3 flex-row items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1">
          <Icon name="nearMe" size={14} color={colors.primary} />
          <VemtapText variant="caption" className="font-sans-bold" numberOfLines={1}>
            {listing.distance}
          </VemtapText>
          <VemtapText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            className="min-w-0"
          >
            {listing.place}
          </VemtapText>
        </View>

        <View className="absolute bottom-3 right-3 flex-row items-center gap-1 rounded-full bg-surface/90 px-2 py-1">
          <Icon name={listing.urgencyIcon} size={13} color={colors.tertiary} />
          <VemtapText variant="caption" numberOfLines={1}>
            {listing.urgency}
          </VemtapText>
        </View>
      </View>

      <View className="gap-2 p-4">
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
            <VemtapText
              variant="labelMd"
              className="min-w-0 font-sans-bold"
              numberOfLines={1}
            >
              {listing.merchant}
            </VemtapText>
            <Icon name="verified" size={16} color={colors.primary} />
            <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
              {copy.verifiedPartner}
            </VemtapText>
          </View>
          <View className="shrink-0 flex-row items-center gap-0.5">
            <Icon name="star" size={15} color={colors.tertiary} />
            <VemtapText variant="caption" className="font-sans-bold" numberOfLines={1}>
              {listing.rating}
            </VemtapText>
          </View>
        </View>

        <VemtapText
          accessibilityRole="header"
          variant="headingSm"
          className="font-sans-bold leading-snug"
          numberOfLines={2}
        >
          {listing.title}
        </VemtapText>

        <VemtapText variant="bodyMd" tone="secondary" numberOfLines={1}>
          {listing.body}
        </VemtapText>

        <View className="mt-1 flex-row items-center justify-between gap-2 pt-1">
          <View className="min-w-0 flex-1 flex-col">
            <VemtapText
              variant="caption"
              tone="tertiary"
              className="line-through"
              numberOfLines={1}
            >
              {listing.priceWas}
            </VemtapText>
            <View className="flex-row items-baseline gap-1">
              <VemtapText
                variant="headingMd"
                className="font-sans-bold"
                numberOfLines={1}
              >
                {listing.price}
              </VemtapText>
              <VemtapText
                variant="caption"
                className="font-sans-semibold text-badge-discount-text"
                numberOfLines={1}
              >
                {listing.save}
              </VemtapText>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.viewDeal}
            onPress={() => onOpen?.(listing.id)}
            className="h-11 shrink-0 flex-row items-center gap-1.5 rounded-xl bg-primary px-5 active:opacity-90"
          >
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold text-primary-foreground"
              numberOfLines={1}
            >
              {copy.viewDeal}
            </VemtapText>
            <Icon name="arrowForward" size={18} color={colors.surface} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
