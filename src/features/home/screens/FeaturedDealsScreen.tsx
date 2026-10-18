import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { Avatar } from '@components/ui/Avatar';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { useCurrentUserDisplay } from '@hooks/useCurrentUserDisplay';
import { EnrollmentPrompt } from '@components/home/EnrollmentPrompt';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';
import { FeaturedDealsCard } from '@features/home/components/FeaturedDealsCard';
import { type FeaturedListing } from '@features/home/types/featuredDeals';
import { mapOfferToFeaturedListing } from '@features/home/utils/homeOfferMapper';
import { usePublicOffersFeed } from '@features/deals/hooks/usePublicOffers';
import { useSponsoredOffers } from '@features/deals/hooks/useSponsoredOffers';
import { sponsoredTracker } from '@services/sponsoredTracker';
import { useSavedFeed, useToggleDealSave } from '@features/accountHub/hooks/useSavedHub';
import { discoveryOrigin } from '@utils/geo';
import { useLocationStore } from '@store/locationStore';
import { AREA_PILL_LABELS } from '@constants/locations';

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

/**
 * Metres when the origin is known. `null` (business without coordinates, or a
 * signed-out user with no location) sorts last rather than pretending to be
 * 0 km away.
 */
function distanceKm(listing: FeaturedListing): number {
  return listing.distanceMeters == null
    ? Number.MAX_SAFE_INTEGER
    : listing.distanceMeters / 1000;
}

export interface FeaturedDealsScreenProps {
  onBack: () => void;
  onOpenDeal?: (dealId: string) => void;
  onOpenFilters?: () => void;
  onOpenLocation?: () => void;
  onOpenRankingInfo?: () => void;
  onOpenBusinessSetup?: () => void;
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
  onOpenBusinessSetup,
  radiusKm = 10,
  maxDistanceKm = 10,
}: FeaturedDealsScreenProps) {
  const display = useCurrentUserDisplay();
  const [sort, setSort] = useState<SortKey>('closest');
  const [maxDistance, setMaxDistance] = useState<number>(maxDistanceKm);

  const feed = usePublicOffersFeed(30);
  // Saved state comes from the saved feed rather than a per-card status call:
  // one request covers every card, and `useDealSave`'s client-only flag would
  // show an already-saved deal as unsaved (and invert it on the next tap).
  const savedDeals = useSavedFeed('DEAL');
  const toggleDealSave = useToggleDealSave();
  const savedIds = useMemo(
    () =>
      new Set(
        (savedDeals.data?.data ?? [])
          .filter(row => row.type === 'DEAL')
          .map(row => row.item.offerId),
      ),
    [savedDeals.data],
  );
  const area = useLocationStore(state => state.area);
  const coords = useLocationStore(state => state.coords);
  const origin = useMemo(() => discoveryOrigin(area, coords), [area, coords]);
  // Promoted listings (live boosts and campaigns for the `feed` placement) lead
  // the page with the "Promoted" badge. Only the API sets it, so organic cards
  // stay unbadged.
  const sponsored = useSponsoredOffers('feed');
  const promotedListings = useMemo(
    () =>
      sponsored.map(entry => ({
        ...mapOfferToFeaturedListing(entry.offer, origin),
        promotion: copy.promoted,
        campaignId: entry.campaignId,
      })),
    [sponsored, origin],
  );
  const liveListings = useMemo(() => {
    const promotedIds = new Set(promotedListings.map(listing => listing.id));
    return (feed.offers ?? [])
      .filter(offer => !promotedIds.has(offer.id))
      .map(offer => mapOfferToFeaturedListing(offer, origin));
  }, [feed.offers, origin, promotedListings]);

  const listings = useMemo(() => {
    // A listing whose business has no coordinates has an unknown distance, not
    // an infinite one — dropping those would empty the page for exactly the
    // merchants we know least about. Sorting still puts them last.
    const inRange = (listing: FeaturedListing) =>
      listing.distanceMeters == null || distanceKm(listing) <= maxDistance;
    const withinRange = liveListings.filter(inRange);
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
    // Promoted listings stay on top whatever the sort, but still respect the
    // viewer's distance cap.
    return [...promotedListings.filter(inRange), ...sorted];
    // `liveListings` was added when this page moved off its static array; without
    // it here the list would stay frozen at its first (empty) render.
  }, [liveListings, promotedListings, maxDistance, sort]);

  const openListing = useCallback(
    (id: string) => {
      const listing = listings.find(entry => entry.id === id);
      if (listing?.campaignId) {
        sponsoredTracker.track({
          campaignId: listing.campaignId,
          offerId: id,
          type: 'tap',
        });
      }
      onOpenDeal?.(id);
    },
    [listings, onOpenDeal],
  );

  // A promoted card counts as viewed once any part of it is inside the scroll
  // viewport. Cards report their offset within the list, the list its offset
  // within the scroll content; the tracker drops repeats within the hour.
  // `listY` stays null until the list reports: children can lay out before
  // their parent, and a 0 offset would count below-the-fold cards as seen.
  const viewport = useRef<{ top: number; height: number; listY: number | null }>({
    top: 0,
    height: 0,
    listY: null,
  });
  const cardLayouts = useRef(new Map<string, { y: number; height: number }>());
  const trackVisiblePromoted = useCallback(() => {
    const { top, height, listY } = viewport.current;
    if (!height || listY == null) return;
    listings.forEach(listing => {
      const layout = cardLayouts.current.get(listing.id);
      if (!listing.campaignId || !layout) return;
      const cardTop = listY + layout.y;
      if (cardTop < top + height && cardTop + layout.height > top) {
        sponsoredTracker.track({
          campaignId: listing.campaignId,
          offerId: listing.id,
          type: 'impression',
        });
      }
    });
  }, [listings]);
  const onViewportLayout = useCallback(
    (event: LayoutChangeEvent) => {
      viewport.current.height = event.nativeEvent.layout.height;
      trackVisiblePromoted();
    },
    [trackVisiblePromoted],
  );
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      viewport.current.top = event.nativeEvent.contentOffset.y;
      trackVisiblePromoted();
    },
    [trackVisiblePromoted],
  );
  const onListLayout = useCallback(
    (event: LayoutChangeEvent) => {
      viewport.current.listY = event.nativeEvent.layout.y;
      trackVisiblePromoted();
    },
    [trackVisiblePromoted],
  );
  const onCardLayout = useCallback(
    (id: string, event: LayoutChangeEvent) => {
      const { y, height } = event.nativeEvent.layout;
      cardLayouts.current.set(id, { y, height });
      trackVisiblePromoted();
    },
    [trackVisiblePromoted],
  );

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
              {/* No page-level "Promoted" pill: the page mixes promoted and
                  organic listings, so only the promoted cards carry the badge. */}
            </View>
            <View className="flex-row items-center gap-1">
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {copy.locationLabel(AREA_PILL_LABELS[area] ?? area)}
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
          <Avatar
            name={display.fullName}
            size="sm"
            tone="brand"
            className="shadow-sm"
            accessibilityLabel={copy.avatar}
          />
        </View>
      </SafeAreaView>
      <ScrollView
        testID="featured-deals-scroll"
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
        onLayout={onViewportLayout}
        onScroll={onScroll}
        scrollEventThrottle={250}
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
                {copy.locationLabel(AREA_PILL_LABELS[area] ?? area)}
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

        <View
          testID="featured-deals-list"
          className="gap-4 px-6 py-4"
          onLayout={onListLayout}
        >
          {/* Live feed now, so the page needs honest pending/failed states —
              before this it rendered a hardcoded array that could never fail. */}
          {feed.isLoading && listings.length === 0 ? (
            <LoadingState label={strings.common.loading} />
          ) : feed.isError && listings.length === 0 ? (
            <ErrorState title={strings.common.error} onRetry={feed.refetch} />
          ) : listings.length === 0 ? (
            <EmptyState
              variant="contained"
              title={copy.emptyTitle}
              description={copy.emptyBody}
              actionLabel={copy.emptyCta}
              onAction={onOpenLocation}
            />
          ) : (
            listings.map(listing => (
              <View
                key={listing.id}
                testID={`featured-listing-${listing.id}`}
                onLayout={event => onCardLayout(listing.id, event)}
              >
                <FeaturedDealsCard
                  listing={listing}
                  saved={savedIds.has(listing.id)}
                  onOpen={openListing}
                  onToggleSave={dealId => toggleDealSave.mutate(dealId)}
                />
              </View>
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
