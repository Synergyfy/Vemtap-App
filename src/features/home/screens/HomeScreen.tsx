import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { HomeSearchBar } from '@components/home/HomeSearchBar';
import { CategoryChips } from '@components/home/CategoryChips';
import { SectionHeader } from '@components/home/SectionHeader';
import { FeaturedDealCard } from '@components/home/FeaturedDealCard';
import { NearbyDealListCard } from '@components/home/NearbyDealListCard';
import { NearbyDealGridCard } from '@components/home/NearbyDealGridCard';
import { TrendingDealCard } from '@components/home/TrendingDealCard';
import { BusinessRow } from '@components/home/BusinessRow';
import { PopularProductCard } from '@components/home/PopularProductCard';
import { EnrollmentPrompt } from '@components/home/EnrollmentPrompt';
import { TwoColumnGrid } from '@components/shared/TwoColumnGrid';
import { ViewToggle, type DealsViewMode } from '@components/home/ViewToggle';
import { DealCommentsSheet } from '@features/dealDetail/components/DealCommentsSheet';
import { DealShareSheet } from '@features/dealDetail/components/DealShareSheet';
import { strings } from '@constants/strings';
import type { IconName } from '@components/ui/Icon';
import { useConsumerTargeting } from '@features/home/hooks/useConsumerTargeting';
import { useHomeDeals } from '@features/home/hooks/useHomeDeals';
import { useNearbyBusinesses } from '@features/home/hooks/useNearbyBusinesses';
import { useNearbyProducts } from '@features/home/hooks/useNearbyProducts';
import { useDealEngagement } from '@features/deals/hooks/usePublicOffers';
import {
  useDealReaction,
  useDealSave,
} from '@features/deals/hooks/useDealEngagementActions';
import type {
  FeaturedDeal,
  NearbyDeal,
  TrendingDeal,
} from '@features/home/data/homeFeed';
import { LoadingState } from '@components/shared/LoadingState';
import { EmptyState } from '@components/shared/EmptyState';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

export interface HomeScreenProps {
  onOpenDiscover?: () => void;
  onOpenDeal?: (dealId: string) => void;
  onOpenBusinessSetup?: () => void;
  /** Deals tab — the full deal list behind the Featured and Trending sections. */
  onOpenDealsTab?: () => void;
  /** Discover tab — the browse surface behind the Businesses and Products sections. */
  onOpenDiscoverTab?: () => void;
  /** Featured Deals screen behind the Featured section's "See All" link. */
  onOpenFeaturedDeals?: () => void;
  /** Location-selection page behind the navbar district name. */
  onOpenLocationSelect?: () => void;
  /** Shared deals filter sheet behind the search bar's filter icon. */
  onOpenFilters?: () => void;
  /** Bell action on the shared navbar; owned by the tab shell. */
  onOpenNotifications?: () => void;
  /** Avatar action on the shared navbar. */
  onOpenAccount?: () => void;
  /** Manual district search behind the sheet's "Or Select / Search District" row. */
  onSearchArea?: () => void;
  /** Device-location request behind the sheet's auto-detect row. */
  onUseCurrentLocation?: () => void;
}

/**
 * The Home cards, wired to the real engagement endpoints.
 *
 * Like and save are authenticated and optimistic, and the counts come from the
 * per-offer engagement endpoint — the same wiring the Deals feed uses, so a
 * like tapped on Home is the same like as on the Deals tab rather than a second
 * opinion held in local state. Each wrapper is its own component because the
 * hooks are per-offer.
 */
function useEnriched<T extends { id: string; likes: number; comments: number }>(deal: T) {
  const { data } = useDealEngagement(deal.id);
  const reaction = useDealReaction(deal.id);
  const saved = useDealSave(deal.id);

  return {
    deal: useMemo(
      () =>
        data ? { ...deal, likes: data.likesCount, comments: data.reviewsCount } : deal,
      [data, deal],
    ),
    liked: reaction.liked,
    saved: saved.saved,
    toggleLike: reaction.toggle,
    toggleSave: saved.toggle,
  };
}

function LiveFeaturedCard({
  deal,
  onOpenComments,
  onShare,
  onOpenDetail,
}: {
  deal: FeaturedDeal;
  onOpenComments: (id: string) => void;
  onShare: (id: string) => void;
  onOpenDetail: (id: string) => void;
}) {
  const { deal: enriched, liked, toggleLike } = useEnriched(deal);

  return (
    <FeaturedDealCard
      deal={{ ...enriched, liked }}
      onToggleLike={toggleLike}
      onOpenComments={onOpenComments}
      onShare={onShare}
      onOpenDetail={onOpenDetail}
    />
  );
}

function LiveNearbyListCard({
  deal,
  onOpenComments,
  onShare,
  onOpenDetail,
}: {
  deal: NearbyDeal;
  onOpenComments: (id: string) => void;
  onShare: (id: string) => void;
  onOpenDetail: (id: string) => void;
}) {
  const { deal: enriched, liked, toggleLike } = useEnriched(deal);

  return (
    <NearbyDealListCard
      deal={{ ...enriched, liked }}
      onToggleLike={toggleLike}
      onOpenComments={onOpenComments}
      onShare={onShare}
      onOpenDetail={onOpenDetail}
    />
  );
}

/**
 * One treatment for "this section has nothing yet", shared by every Home
 * section. Each of them used to render a bare header over no content when its
 * data was missing, which read as a broken screen rather than an empty one.
 */
function SectionEmpty({
  icon,
  title,
  description,
}: {
  icon: IconName;
  title: string;
  description: string;
}) {
  return (
    <EmptyState variant="contained" icon={icon} title={title} description={description} />
  );
}

function LiveNearbyGridCard({
  deal,
  onOpenDetail,
}: {
  deal: NearbyDeal;
  onOpenDetail: (id: string) => void;
}) {
  const { deal: enriched, liked, toggleLike } = useEnriched(deal);

  return (
    <NearbyDealGridCard
      deal={{ ...enriched, liked }}
      onToggleLike={toggleLike}
      onOpenDetail={onOpenDetail}
    />
  );
}

function LiveTrendingCard({
  deal,
  onOpenComments,
  onOpenDetail,
}: {
  deal: TrendingDeal;
  onOpenComments: (id: string) => void;
  onOpenDetail: (id: string) => void;
}) {
  const { deal: enriched, liked, toggleLike } = useEnriched(deal);

  return (
    <TrendingDealCard
      deal={{ ...enriched, liked }}
      onToggleLike={toggleLike}
      onOpenComments={onOpenComments}
      onOpenDetail={onOpenDetail}
    />
  );
}

export function HomeScreen({
  onOpenDiscover,
  onOpenDeal,
  onOpenBusinessSetup,
  onOpenFilters,
  onOpenDealsTab,
  onOpenDiscoverTab,
  onOpenFeaturedDeals,
  onOpenLocationSelect,
  onOpenNotifications,
  onOpenAccount,
  onSearchArea,
  onUseCurrentLocation,
}: HomeScreenProps) {
  const [viewMode, setViewMode] = useState<DealsViewMode>('list');
  const [commentsDealId, setCommentsDealId] = useState<string | null>(null);
  const [shareDealId, setShareDealId] = useState<string | null>(null);

  // Real offers, filtered to the active district. The previous version of this
  // screen kept its own copy of the seed data and flipped `liked` in local
  // state, so every card on Home pointed at an id the API has never heard of:
  // likes could not reach the server and tapping a card opened whatever
  // `resolveDeal` fell back to.
  const {
    featured,
    nearby: nearbyDeals,
    trending,
    isLoading,
    isError,
    refetch,
  } = useHomeDeals();

  // Real businesses from the public discovery list. This section used to render
  // the bundled Discover businesses under a "Businesses Around You" heading,
  // which read as live data but was the same fiction as the old deal rows.
  const { data: nearbyBusinesses } = useNearbyBusinesses();
  const { data: nearbyProducts } = useNearbyProducts();

  const openDeal = useCallback((dealId: string) => onOpenDeal?.(dealId), [onOpenDeal]);

  const openComments = useCallback((dealId: string) => setCommentsDealId(dealId), []);

  const openShare = useCallback((dealId: string) => setShareDealId(dealId), []);

  const allDeals = useMemo(
    () => (featured ? [featured, ...nearbyDeals] : nearbyDeals),
    [featured, nearbyDeals],
  );

  const shareDeal = useMemo(
    () => [...allDeals, ...trending].find(deal => deal.id === shareDealId) ?? null,
    [allDeals, trending, shareDealId],
  );

  // Same navbar + targeting behaviour as the Deals feed — one owner, so the two
  // bars can never disagree about the active district or radius.
  const targeting = useConsumerTargeting({
    onOpenLocationSelect: onOpenLocationSelect ?? (() => onSearchArea?.()),
    onUseCurrentLocation,
    onPressNotifications: onOpenNotifications,
    onPressAvatar: onOpenAccount,
  });

  const commentsDeal = useMemo(
    () => [...allDeals, ...trending].find(deal => deal.id === commentsDealId) ?? null,
    [allDeals, trending, commentsDealId],
  );

  return targeting.renderChrome(
    <>
      <ScrollView
        contentContainerClassName="px-6 pb-8 pt-4 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          {/* Same shared filter page the Deals feed opens, so the two feeds
              cannot drift into separate filtering behaviour. */}
          <HomeSearchBar
            filterLabel={strings.home.filter}
            onFilterPress={onOpenFilters}
          />
          <CategoryChips categories={strings.home.categories} horizontalGutter={false} />
        </View>

        <View className="flex-col gap-3.5">
          <SectionHeader
            title={strings.home.featured}
            badge={strings.home.promoted}
            seeAllLabel={strings.home.seeAll}
            onSeeAll={onOpenFeaturedDeals}
          />
          {isLoading && !featured ? (
            <LoadingState label={strings.common.loading} />
          ) : null}
          {featured ? (
            <LiveFeaturedCard
              deal={featured}
              onOpenComments={openComments}
              onShare={openShare}
              onOpenDetail={openDeal}
            />
          ) : !isLoading ? (
            <SectionEmpty
              icon="localOffer"
              title={strings.home.emptyFeaturedTitle}
              description={strings.home.emptyFeaturedBody}
            />
          ) : null}
        </View>

        <View className="flex-col gap-3.5">
          <SectionHeader
            title={strings.home.dealsNearYou}
            seeAllLabel={strings.home.seeAll}
            onSeeAll={onOpenDiscover}
          >
            <ViewToggle
              mode={viewMode}
              onChange={setViewMode}
              listLabel={strings.home.listView}
              gridLabel={strings.home.gridView}
            />
          </SectionHeader>

          {nearbyDeals.length === 0 ? (
            <SectionEmpty
              icon="nearMe"
              title={strings.featuredDeals.emptyTitle}
              description={strings.featuredDeals.emptyBody}
            />
          ) : viewMode === 'list' ? (
            <View className="flex-col gap-3.5">
              {nearbyDeals.map(deal => (
                <LiveNearbyListCard
                  key={deal.id}
                  deal={deal}
                  onOpenComments={openComments}
                  onShare={openShare}
                  onOpenDetail={openDeal}
                />
              ))}
            </View>
          ) : (
            <TwoColumnGrid
              items={nearbyDeals}
              keyExtractor={deal => deal.id}
              renderItem={deal => (
                <LiveNearbyGridCard deal={deal} onOpenDetail={openDeal} />
              )}
            />
          )}
        </View>

        <View className="flex-col gap-3.5">
          <SectionHeader
            title={strings.home.trending}
            emoji="🔥"
            seeAllLabel={strings.home.seeAll}
            onSeeAll={onOpenDealsTab}
          />
          {trending.length === 0 ? (
            <SectionEmpty
              icon="fire"
              title={strings.home.emptyTrendingTitle}
              description={strings.home.emptyTrendingBody}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-6"
              contentContainerClassName="px-6 gap-3.5 pb-2"
            >
              {trending.map(deal => (
                <LiveTrendingCard
                  key={deal.id}
                  deal={deal}
                  onOpenComments={openComments}
                  onOpenDetail={openDeal}
                />
              ))}
            </ScrollView>
          )}
        </View>

        <View className="flex-col gap-3.5">
          <SectionHeader
            title={strings.home.businessesAround}
            seeAllLabel={strings.home.seeAll}
            onSeeAll={onOpenDiscoverTab}
          />
          {nearbyBusinesses?.length ? (
            <View className="flex-col gap-3">
              {nearbyBusinesses.map(business => (
                <BusinessRow key={business.id} business={business} />
              ))}
            </View>
          ) : (
            <SectionEmpty
              icon="storefront"
              title={strings.home.noBusinessesTitle}
              description={strings.home.noBusinessesBody}
            />
          )}
        </View>

        <View className="flex-col gap-3.5">
          <SectionHeader
            title={strings.home.popularNearYou}
            seeAllLabel={strings.home.seeAll}
            onSeeAll={onOpenDiscoverTab}
          />
          {nearbyProducts?.length ? (
            <TwoColumnGrid
              items={nearbyProducts}
              keyExtractor={product => product.id}
              renderItem={product => <PopularProductCard product={product} />}
            />
          ) : (
            <SectionEmpty
              icon="shoppingBag"
              title={strings.home.emptyProductsTitle}
              description={strings.home.emptyProductsBody}
            />
          )}
        </View>

        {isError ? (
          <EmptyState
            variant="contained"
            icon="cloudOff"
            title={strings.common.error}
            actionLabel={strings.common.retry}
            onAction={refetch}
          />
        ) : null}

        <EnrollmentPrompt onOpenBusinessSetup={onOpenBusinessSetup} />
      </ScrollView>
      <DealCommentsSheet
        visible={commentsDeal !== null}
        onClose={() => setCommentsDealId(null)}
        dealTitle={commentsDeal?.title ?? ''}
        merchant={commentsDeal?.merchant ?? ''}
        commentCount={commentsDeal?.comments ?? 0}
      />
      {shareDeal ? (
        <DealShareSheet
          visible
          onClose={() => setShareDealId(null)}
          deal={{
            id: shareDeal.id,
            image: shareDeal.image,
            merchant: shareDeal.merchant,
            title: shareDeal.title,
            price: shareDeal.price,
            priceWas: shareDeal.priceWas,
            save: `Save ${shareDeal.priceWas}`,
            badge: shareDeal.badge,
          }}
          shareUrl={`https://vemtap.com/deals/${shareDeal.id}`}
        />
      ) : null}
    </>,
  );
}
