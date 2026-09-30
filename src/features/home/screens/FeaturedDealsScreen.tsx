import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { EmptyState } from '@components/shared/EmptyState';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { EnrollmentPrompt } from '@components/home/EnrollmentPrompt';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';
import { FeaturedDealsCard } from '@features/home/components/FeaturedDealsCard';
import {
  featuredListings,
  type FeaturedListing,
} from '@features/home/data/featuredDeals';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, { className: 'style' });
cssInterop(SafeAreaView, { className: 'style' });

const copy = strings.featuredDeals;

type SortKey = 'closest' | 'discount' | 'ending' | 'popular';

const SORTS: readonly {
  key: SortKey;
  label: string;
  icon: 'nearMe' | 'percentBadge' | 'timer' | 'fire';
}[] = [
  { key: 'closest', label: copy.sortClosest, icon: 'nearMe' },
  { key: 'discount', label: copy.sortDiscount, icon: 'percentBadge' },
  { key: 'ending', label: copy.sortEnding, icon: 'timer' },
  { key: 'popular', label: copy.sortPopular, icon: 'fire' },
] as const;

function discountPercent(listing: FeaturedListing): number {
  const was = Number(listing.priceWas.replace(/[^0-9]/g, ''));
  const now = Number(listing.price.replace(/[^0-9]/g, ''));
  if (!was || !now) return 0;
  return Math.round(((was - now) / was) * 100);
}

function distanceKm(listing: FeaturedListing): number {
  return Number.parseFloat(listing.distance) || Number.MAX_SAFE_INTEGER;
}

export interface FeaturedDealsScreenProps {
  onBack: () => void;
  onOpenDeal?: (dealId: string) => void;
  onOpenFilters?: () => void;
  onOpenLocation?: () => void;
  onOpenRankingInfo?: () => void;
  onToggleSave?: (dealId: string) => void;
  onOpenBusinessSetup?: () => void;
  savedIds?: readonly string[];
  radiusKm?: number;
  maxDistanceKm?: number;
}

/**
 * Featured Deals — the "See All" target of the Home Featured Deals section.
 * stitch_vemtap_mobile_app_design/featured_deals
 *
 * A full page in the Home stack (it owns no bottom navigation — the consumer tab
 * bar does, per AGENTS rule 21), composed from the shared home header, filter
 * chips, empty state and business-setup prompt.
 */
export function FeaturedDealsScreen({
  onBack,
  onOpenDeal,
  onOpenFilters,
  onOpenLocation,
  onOpenRankingInfo,
  onToggleSave,
  onOpenBusinessSetup,
  savedIds = [],
  radiusKm = 10,
  maxDistanceKm = 10,
}: FeaturedDealsScreenProps) {
  const [sort, setSort] = useState<SortKey>('closest');
  const [maxDistance, setMaxDistance] = useState<number>(maxDistanceKm);

  const listings = useMemo(() => {
    const withinRange = featuredListings.filter(
      listing => distanceKm(listing) <= maxDistance,
    );
    const sorted = [...withinRange];
    if (sort === 'closest') {
      sorted.sort((a, b) => distanceKm(a) - distanceKm(b));
    }
    if (sort === 'discount') {
      sorted.sort((a, b) => discountPercent(b) - discountPercent(a));
    }
    if (sort === 'popular') {
      sorted.sort((a, b) => discountPercent(b) - discountPercent(a));
    }
    if (sort === 'ending') {
      sorted.sort((a, b) => a.id.localeCompare(b.id));
    }
    return sorted;
  }, [maxDistance, sort]);

  const openListing = useCallback((id: string) => onOpenDeal?.(id), [onOpenDeal]);

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="bg-surface" style={navbarBottomShadow}>
        <View className="h-16 w-full flex-row items-center justify-between gap-2 px-6">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.common.goBack}
            onPress={onBack}
            className="-ml-1 h-11 w-11 shrink-0 items-center justify-center rounded-full active:scale-95"
          >
            <Icon name="back" size={24} color={colors.text} />
          </Pressable>
          <View className="min-w-0 flex-1 flex-col">
            <View className="flex-row items-center gap-1.5">
              <VemtapText
                accessibilityRole="header"
                variant="headingSm"
                className="text-heading-sm"
                numberOfLines={1}
              >
                {copy.title}
              </VemtapText>
              <View className="rounded-full bg-surface-tint px-1.5 py-0.5">
                <VemtapText
                  variant="caption"
                  className="font-sans-semibold text-primary"
                  numberOfLines={1}
                >
                  {copy.promoted}
                </VemtapText>
              </View>
            </View>
            <View className="flex-row items-center gap-1">
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {copy.locationLabel}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {`\u00b7 ${copy.withinLabel(radiusKm)}`}
              </VemtapText>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.filters}
            onPress={onOpenFilters}
            className="h-11 w-11 shrink-0 items-center justify-center rounded-full active:scale-95"
          >
            <Icon name="tune" size={22} color={colors.textSecondary} />
          </Pressable>
          <View
            accessibilityRole="image"
            accessibilityLabel={copy.avatar}
            className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary shadow-sm"
          >
            <Icon name="person" size={18} color={colors.surface} />
          </View>
        </View>
      </SafeAreaView>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2 bg-surface px-6 pb-2 pt-4 shadow-sm">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-row items-center gap-1 rounded-full bg-surface-container px-2.5 py-1">
              <Icon name="locationOn" size={18} color={colors.primary} />
              <VemtapText
                variant="labelMd"
                className="min-w-0 font-sans-semibold"
                numberOfLines={1}
                onPress={onOpenLocation}
              >
                {copy.locationLabel}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {copy.within}
              </VemtapText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.withinLabel(radiusKm)}
                onPress={onOpenLocation}
                className="flex-row items-center gap-0.5 active:scale-95"
              >
                <VemtapText
                  variant="labelMd"
                  className="font-sans-bold text-primary"
                  numberOfLines={1}
                >
                  {copy.withinLabel(radiusKm)}
                </VemtapText>
                <Icon name="expandMore" size={16} color={colors.primary} />
              </Pressable>
            </View>
            <View className="shrink-0 flex-row items-center gap-1 rounded-full bg-secondary-fixed px-2 py-1">
              <View className="h-1.5 w-1.5 rounded-full bg-primary" />
              <VemtapText
                variant="caption"
                className="text-on-secondary-fixed font-sans-semibold"
                numberOfLines={1}
              >
                {copy.liveDeals(listings.length)}
              </VemtapText>
            </View>
          </View>

          <View className="flex-row items-center justify-between gap-2 rounded-xl bg-surface-container p-2">
            <VemtapText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              className="pl-1"
            >
              {copy.maxDistance}
            </VemtapText>
            <View className="flex-row items-center gap-1">
              {copy.maxDistanceOptions.map(km => {
                const selected = km === maxDistance;
                return (
                  <Pressable
                    key={km}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${copy.maxDistance} ${km} km`}
                    onPress={() => setMaxDistance(km)}
                    className={
                      selected
                        ? 'rounded-full bg-primary px-2.5 py-1 shadow-sm'
                        : 'rounded-full bg-surface px-2.5 py-1'
                    }
                  >
                    <VemtapText
                      variant="caption"
                      className={
                        selected
                          ? 'font-sans-semibold text-surface'
                          : 'font-sans-semibold text-text-secondary'
                      }
                      numberOfLines={1}
                    >
                      {`${km} km`}
                    </VemtapText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="-mx-6 overflow-hidden">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="flex-row items-center gap-2 px-6 py-1"
            >
              {SORTS.map(option => {
                const active = option.key === sort;
                return (
                  <Pressable
                    key={option.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={option.label}
                    onPress={() => setSort(option.key)}
                    className={
                      active
                        ? 'h-9 shrink-0 flex-row items-center gap-1 rounded-full bg-surface-tint px-2.5'
                        : 'h-9 shrink-0 flex-row items-center gap-1 rounded-full bg-surface-container px-2.5'
                    }
                  >
                    <Icon
                      name={option.icon}
                      size={16}
                      color={active ? colors.primary : colors.textSecondary}
                    />
                    <VemtapText
                      variant="labelSm"
                      className={
                        active ? 'font-sans-semibold text-primary' : 'text-text-secondary'
                      }
                      numberOfLines={1}
                    >
                      {option.label}
                    </VemtapText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View className="mb-1 flex-row items-start gap-1.5 rounded-xl bg-surface-container p-2">
            <Icon name="verifiedUser" size={17} color={colors.primary} />
            <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
              {copy.bannerTitle}
            </VemtapText>
          </View>
        </View>

        <View className="gap-4 px-6 py-4">
          {listings.length === 0 ? (
            <EmptyState
              variant="contained"
              title={copy.emptyTitle}
              description={copy.emptyBody}
              actionLabel={copy.emptyCta}
              onAction={onOpenLocation}
            />
          ) : (
            listings.map(listing => (
              <FeaturedDealsCard
                key={listing.id}
                listing={listing}
                saved={savedIds.includes(listing.id)}
                onOpen={openListing}
                onToggleSave={onToggleSave}
              />
            ))
          )}
        </View>

        <View className="items-center px-6 pb-8">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.aboutTitle}
            onPress={onOpenRankingInfo}
            className="w-full gap-1 rounded-2xl bg-surface-container p-4"
          >
            <View className="mb-1 h-8 w-8 items-center justify-center rounded-full bg-surface-tint">
              <Icon name="info" size={20} color={colors.primary} />
            </View>
            <VemtapText variant="labelMd" className="font-sans-bold" numberOfLines={2}>
              {copy.aboutTitle}
            </VemtapText>
            <VemtapText
              variant="caption"
              tone="secondary"
              className="max-w-xs self-center"
            >
              {copy.aboutBody}
            </VemtapText>
            <View className="mt-1 flex-row items-center gap-0.5">
              <VemtapText
                variant="caption"
                className="font-sans-semibold text-primary"
                numberOfLines={1}
              >
                {copy.aboutLink}
              </VemtapText>
              <Icon name="arrowForward" size={14} color={colors.primary} />
            </View>
          </Pressable>

          <View className="mt-6">
            <EnrollmentPrompt
              variant="inline"
              onOpenBusinessSetup={onOpenBusinessSetup}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
