import React, { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsOnline } from '@hooks/useNetworkStatus';
import { OfflineBanner } from '@components/shared/OfflineBanner';
import { HomeHeader } from '@components/home/HomeHeader';
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
import { strings } from '@constants/strings';
import {
  featuredDeal as featuredDealSeed,
  nearbyDeals as nearbyDealsSeed,
  nearbyBusinesses,
  popularProducts,
  trendingDeals,
} from '@features/home/data/homeFeed';

cssInterop(View, { className: 'style' });
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

export interface HomeScreenProps {
  onOpenDiscover?: () => void;
  onOpenDeal?: (dealId: string) => void;
  onOpenBusinessSetup?: () => void;
}

export function HomeScreen({
  onOpenDiscover,
  onOpenDeal,
  onOpenBusinessSetup,
}: HomeScreenProps) {
  const isOnline = useIsOnline();
  const [viewMode, setViewMode] = useState<DealsViewMode>('list');
  const [featured, setFeatured] = useState(featuredDealSeed);
  const [nearbyDeals, setNearbyDeals] = useState(nearbyDealsSeed);

  const toggleFeaturedLike = useCallback((id: string) => {
    setFeatured(prev => (prev.id === id ? { ...prev, liked: !prev.liked } : prev));
  }, []);

  const openDeal = useCallback((dealId: string) => onOpenDeal?.(dealId), [onOpenDeal]);

  const toggleNearbyLike = useCallback((id: string) => {
    setNearbyDeals(prev =>
      prev.map(deal => (deal.id === id ? { ...deal, liked: !deal.liked } : deal)),
    );
  }, []);

  return (
    <View className="flex-1 bg-background">
      {/* Status bar + navbar share solid white so the iPhone inset blends with the header. */}
      <SafeAreaView edges={['top']} className="bg-surface">
        {!isOnline ? <OfflineBanner /> : null}
        <HomeHeader />
      </SafeAreaView>

      <ScrollView
        contentContainerClassName="px-6 pb-8 pt-4 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          <HomeSearchBar />
          <CategoryChips categories={strings.home.categories} />
        </View>

        <View className="flex-col gap-3.5">
          <SectionHeader
            title={strings.home.featured}
            badge={strings.home.promoted}
            seeAllLabel={strings.home.seeAll}
          />
          <FeaturedDealCard
            deal={featured}
            onToggleLike={toggleFeaturedLike}
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
                  onToggleLike={toggleNearbyLike}
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
                  onToggleLike={toggleNearbyLike}
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
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-6"
            contentContainerClassName="px-6 gap-3.5 pb-2"
          >
            {trendingDeals.map(deal => (
              <TrendingDealCard key={deal.id} deal={deal} onOpenDetail={openDeal} />
            ))}
          </ScrollView>
        </View>

        <View className="flex-col gap-3.5">
          <SectionHeader
            title={strings.home.businessesAround}
            seeAllLabel={strings.home.seeAll}
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
          />
          <TwoColumnGrid
            items={popularProducts}
            keyExtractor={product => product.id}
            renderItem={product => <PopularProductCard product={product} />}
          />
        </View>

        <EnrollmentPrompt onOpenBusinessSetup={onOpenBusinessSetup} />
      </ScrollView>
    </View>
  );
}
