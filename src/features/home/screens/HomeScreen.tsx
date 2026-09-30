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
import { useConsumerTargeting } from '@features/home/hooks/useConsumerTargeting';
import {
  featuredDeal as featuredDealSeed,
  nearbyDeals as nearbyDealsSeed,
  nearbyBusinesses,
  popularProducts,
  trendingDeals,
} from '@features/home/data/homeFeed';

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
  /** Manual district search behind the sheet's "Or Select / Search District" row. */
  onSearchArea?: () => void;
  /** Device-location request behind the sheet's auto-detect row. */
  onUseCurrentLocation?: () => void;
}

export function HomeScreen({
  onOpenDiscover,
  onOpenDeal,
  onOpenBusinessSetup,
  onOpenDealsTab,
  onOpenDiscoverTab,
  onOpenFeaturedDeals,
  onOpenLocationSelect,
  onSearchArea,
  onUseCurrentLocation,
}: HomeScreenProps) {
  const [viewMode, setViewMode] = useState<DealsViewMode>('list');
  const [featured, setFeatured] = useState(featuredDealSeed);
  const [nearbyDeals, setNearbyDeals] = useState(nearbyDealsSeed);
  const [trending, setTrending] = useState(trendingDeals);
  const [commentsDealId, setCommentsDealId] = useState<string | null>(null);
  const [shareDealId, setShareDealId] = useState<string | null>(null);
  const toggleLike = useCallback((id: string) => {
    const flip = <T extends { id: string; liked?: boolean }>(deal: T) =>
      deal.id === id ? { ...deal, liked: !deal.liked } : deal;
    setFeatured(prev => flip(prev));
    setNearbyDeals(prev => prev.map(flip));
    setTrending(prev => prev.map(flip));
  }, []);

  const openDeal = useCallback((dealId: string) => onOpenDeal?.(dealId), [onOpenDeal]);

  const openComments = useCallback((dealId: string) => setCommentsDealId(dealId), []);

  const openShare = useCallback((dealId: string) => setShareDealId(dealId), []);

  const shareDeal = useMemo(
    () =>
      [featured, ...nearbyDeals, ...trending].find(deal => deal.id === shareDealId) ??
      null,
    [featured, nearbyDeals, trending, shareDealId],
  );

  // Same navbar + targeting behaviour as the Deals feed — one owner, so the two
  // bars can never disagree about the active district or radius.
  const targeting = useConsumerTargeting({
    onOpenLocationSelect: onOpenLocationSelect ?? (() => onSearchArea?.()),
    onUseCurrentLocation,
  });

  const commentsDeal = useMemo(
    () =>
      [featured, ...nearbyDeals, ...trending].find(deal => deal.id === commentsDealId) ??
      null,
    [featured, nearbyDeals, trending, commentsDealId],
  );

  return targeting.renderChrome(
    <>
      <ScrollView
        contentContainerClassName="px-6 pb-8 pt-4 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          <HomeSearchBar />
          <CategoryChips categories={strings.home.categories} horizontalGutter={false} />
        </View>

        <View className="flex-col gap-3.5">
          <SectionHeader
            title={strings.home.featured}
            badge={strings.home.promoted}
            seeAllLabel={strings.home.seeAll}
            onSeeAll={onOpenFeaturedDeals}
          />
          <FeaturedDealCard
            deal={featured}
            onToggleLike={toggleLike}
            onOpenComments={openComments}
            onShare={openShare}
            onOpenDetail={openDeal}
          />
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

          {viewMode === 'list' ? (
            <View className="flex-col gap-3.5">
              {nearbyDeals.map(deal => (
                <NearbyDealListCard
                  key={deal.id}
                  deal={deal}
                  onToggleLike={toggleLike}
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
                <NearbyDealGridCard
                  deal={deal}
                  onToggleLike={toggleLike}
                  onOpenDetail={openDeal}
                />
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-6"
            contentContainerClassName="px-6 gap-3.5 pb-2"
          >
            {trending.map(deal => (
              <TrendingDealCard
                key={deal.id}
                deal={deal}
                onToggleLike={toggleLike}
                onOpenComments={openComments}
                onOpenDetail={openDeal}
              />
            ))}
          </ScrollView>
        </View>

        <View className="flex-col gap-3.5">
          <SectionHeader
            title={strings.home.businessesAround}
            seeAllLabel={strings.home.seeAll}
            onSeeAll={onOpenDiscoverTab}
          />
          <View className="flex-col gap-3">
            {nearbyBusinesses.map(business => (
              <BusinessRow key={business.id} business={business} />
            ))}
          </View>
        </View>

        <View className="flex-col gap-3.5">
          <SectionHeader
            title={strings.home.popularNearYou}
            seeAllLabel={strings.home.seeAll}
            onSeeAll={onOpenDiscoverTab}
          />
          <TwoColumnGrid
            items={popularProducts}
            keyExtractor={product => product.id}
            renderItem={product => <PopularProductCard product={product} />}
          />
        </View>

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
