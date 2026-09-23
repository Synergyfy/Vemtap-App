import React, { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsOnline } from '@hooks/useNetworkStatus';
import { OfflineBanner } from '@components/shared/OfflineBanner';
import { DealsHeader } from '@components/deals/DealsHeader';
import { DealsGridCard } from '@components/deals/DealsGridCard';
import { DealsListCard } from '@components/deals/DealsListCard';
import { FeaturedDealOfDayCard } from '@components/deals/FeaturedDealOfDayCard';
import { DealsResultsRow } from '@components/deals/DealsResultsRow';
import { HomeHeader } from '@components/home/HomeHeader';
import { HomeSearchBar } from '@components/home/HomeSearchBar';
import { TwoColumnGrid } from '@components/shared/TwoColumnGrid';
import type { DealsViewMode } from '@components/home/ViewToggle';
import { VemtapText } from '@components/ui/Text';
import { Icon } from '@components/ui/Icon';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import { dealsGrid, dealsList, featuredDealOfDay } from '@features/deals/data/dealsFeed';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

export interface DealsDiscoveryScreenProps {
  variant?: 'featured' | 'standard';
  onOpenFilters: () => void;
  onOpenDeal: (dealId: string) => void;
}

/**
 * Featured variant: vemtap_deals_discovery_grid_view_featured_deal_location_header
 * Standard variant:  vemtap_deals_discovery_grid_view_location_header_filter_icon
 */
export function DealsDiscoveryScreen({
  variant = 'featured',
  onOpenFilters,
  onOpenDeal,
}: DealsDiscoveryScreenProps) {
  const isOnline = useIsOnline();
  const [viewMode, setViewMode] = useState<DealsViewMode>('grid');

  const openFilters = useCallback(() => {
    onOpenFilters();
  }, [onOpenFilters]);

  const isFeatured = variant === 'featured';
  const feedCount = viewMode === 'list' ? dealsList.length : dealsGrid.length;

  return (
    <View className="flex-1 bg-background">
      {/* Status bar + navbar share solid white so the iPhone inset blends with the header. */}
      <SafeAreaView edges={['top']} className="bg-surface">
        {!isOnline ? <OfflineBanner /> : null}
        {isFeatured ? <DealsHeader /> : <HomeHeader />}
      </SafeAreaView>

      <ScrollView
        contentContainerClassName="px-6 pb-16 pt-4 gap-4"
        showsVerticalScrollIndicator={false}
      >
        <HomeSearchBar
          variant={isFeatured ? 'outlined' : 'default'}
          placeholder={
            isFeatured
              ? strings.deals.searchPlaceholderDots
              : strings.home.searchPlaceholder
          }
          filterLabel={isFeatured ? strings.deals.filters : strings.home.filter}
          onFilterPress={openFilters}
        />

        {isFeatured ? (
          <View className="flex-col gap-2">
            <View className="flex-row items-center justify-between">
              <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                <Icon name="fire" size={18} color={colors.primary} />
                <VemtapText className="font-sans-bold text-label-sm uppercase tracking-wider text-text-secondary">
                  {strings.deals.featuredEyebrow}
                </VemtapText>
              </View>
              <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
                <VemtapText className="font-sans-bold text-caption text-badge-discount-text">
                  {strings.deals.featuredPercentOff}
                </VemtapText>
              </View>
            </View>
            <FeaturedDealOfDayCard deal={featuredDealOfDay} onOpenDetail={onOpenDeal} />
          </View>
        ) : null}

        <View className="flex-col gap-3">
          <DealsResultsRow
            mode={viewMode}
            onChangeMode={setViewMode}
            variant={variant}
            count={feedCount}
            countLabel={
              isFeatured && viewMode === 'list'
                ? strings.deals.dealsInFound(18)
                : undefined
            }
          />

          {viewMode === 'list' ? (
            <View className="flex-col gap-4">
              {dealsList.map(deal => (
                <DealsListCard key={deal.id} deal={deal} onOpenDetail={onOpenDeal} />
              ))}
            </View>
          ) : (
            <TwoColumnGrid
              items={dealsGrid}
              keyExtractor={deal => deal.id}
              renderItem={deal => <DealsGridCard deal={deal} onOpenDetail={onOpenDeal} />}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
