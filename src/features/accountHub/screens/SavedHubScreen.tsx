import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  HubHeader,
  HubSearchField,
  SectionLink,
  StatusPillTabs,
} from '@features/accountHub/components/HubPrimitives';
import {
  SavedBusinessRow,
  SavedItemRow,
} from '@features/accountHub/components/SavedItemRows';
import { EmptyState } from '@components/shared/EmptyState';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import savedUrbanGrill from '../../../../assets/images/saved-urban-grill.jpg';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

const copy = strings.savedHub;
const images = {
  tasting:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB1W1sAE5sQZJQXULVgwIQkJeXkyg0dOrbggkVXcI8otBKG6pCtn3u742nxuJXVivJChULrwyUudDSHJezrKUVeLglWJGV86_j6A1rvNv2TuOgJGVVjVM9z-U_69xe0s5Evr7R33oYfTqrShZkURIjXwu2OrEWP0jnEHf0197OEYqHaZ_92acaRS_MUY4RSO5oOSF6PxeA44REixiAx3XBSvfWeDUtJF4gn9zX73FSVAe47xLGL92EVRw',
  tailoring:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB2NChh48OJFEEfceZ0T1SMH0WN8Z7g9wCYGejBwyzA1qZo5ax5OCtzTgrLakjtkxAtBbtogW8OUFXicMGDnzJbEcY-tp8BDI3RVt7hHzWOXxN98mz7ISUmseRx9ggklib4qZGCdQVL3BftoM-ebL-9l2DQzObnT52KdGOZrcFnH1Al-GBwESyeW5m7n-Mw9GAaOif0g8vKKk5C4oSIl5QOVgqi2E4ZF_ugeTDUj2wBCxl4zDRigH38Hw',
  gym: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBquk7YHLVuRq024QkpeKDgtgl6hGPl1i5DiYe1VoIiCqN6rPGgdsoP-_DvqP1i_8qCZdm1N6aNiTiOGaj3jIUa3db8bIwHC4D4_C4FxJuDgbuDgFr3CuZYjf3sPE46a3pzJumL5XwDMwtWGJTYg8b8b3MkSC-RYI4RKRi3RS19X80hRTIvOqtA4cwSlxyUuHUa5FD4DGQ5hbs-aOSXTcvuVxSDLEiN_boPuNnANnG0jOMv8989lHm7UA',
  coffee:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAtAFRkRGGgAgKe1e0zkb8v7JV0aGaVz7rpDU5OQIVvHvJ9rFF6aq1niKMZttYvhH_PTZbachjO5-tBYq5oWtJP0m_19BW8JZGSBFxTN9cnURBFz5Y4Qe1JyAxh3gaLJB8Qhdh5qh5IXYgmL2WeKRiR9SiKe_cbEWgg_vDjutuxuCYfCUmHYMOHfiP1Uj-xR7tXczDvPE9AVLLrUIJSN3lUNxz-Xha0MFfMRcnIQXf5LovfXb6QLVo20w',
  spa: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5k7s5G6LTPqWkK54hEeQtQsaADh0uOoPEwM13cElgaf95sN0eVVjox2o16KcLyCFnXKkeWOQDfymheo8zssObuutewN-W0dctSZ6rs3fR6UrFjzOdWDZibheJ92UqEcouez2iWa9Sv_pqWu3Qcz621sHVtWmvKhy0yR9PEfnoljOELyMAfHsHO1fgWfPgsRIqFFLJ1jmiVB3C0yDoKCmBn60h8dIg5LuTPrnHoiEb46CN6eV6vQYZ0g',
  boutique:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDOZYNmSWjsJoMjN0MS6GA6NGyoOj48MmV1YbQ75zAWqyaOTBanee6R8u4L6ZEWI5Bb34wct-aD2GEl9IlrKNlkAFGsupBw9KJxQI7FTmsa_P3fdJJPOlfpZJv1F3PktKyOft5Cghy3gboC1AgYQQGGRc65YEuXSghqx7CBMEPEaufTqsbcAWjqwC5rkM7KZ7WXixwyPnbUULxHmS6CkQYYazpw6bwlABnZhv_2fO8oMwPiIB7IdTKTXw',
};

const dealEntries = [
  {
    id: 'sky-tasting',
    image: images.tasting,
    business: 'THE SKY LOUNGE & GRILL',
    title: "Chef's 5-Course Tasting Menu",
    price: '₦24,500',
    oldPrice: '₦49,000',
    discount: '50% OFF',
    distance: copy.distanceOne,
    action: copy.claimDeal,
    actionLabel: copy.validSunday,
    layout: 'featured' as const,
  },
  {
    id: 'velvet-tailoring',
    image: images.tailoring,
    business: 'VELVET STITCH COUTURE',
    title: 'Special Tailoring & Styling Package',
    discount: '15% OFF',
    distance: copy.distanceTwo,
    description: copy.tailoringBody,
    action: copy.claimDeal,
    actionLabel: copy.tailoringSaving,
    layout: 'standard' as const,
  },
  {
    id: 'pulse-bundle',
    image: images.gym,
    business: copy.pulse,
    title: copy.pulseDeal,
    price: '',
    discount: '',
    action: copy.viewOptions,
    actionLabel: '',
    meta: copy.pulseMeta,
    layout: 'bundle' as const,
  },
  {
    id: 'cafe-cold-brew',
    image: images.coffee,
    business: copy.cafe,
    title: copy.coldBrew,
    price: copy.coldBrewPrice,
    discount: '15% OFF',
    action: copy.claim,
    actionLabel: '',
    layout: 'compact' as const,
  },
];

const savedBusinesses = [
  {
    id: 'urban-grill',
    image: savedUrbanGrill,
    name: copy.businessEntries[0][0],
    meta: copy.businessEntries[0][1],
    rating: copy.businessEntries[0][2],
    deals: copy.businessEntries[0][3],
  },
  {
    id: 'glow-serenity',
    image: { uri: images.spa },
    name: copy.businessEntries[1][0],
    meta: copy.businessEntries[1][1],
    rating: copy.businessEntries[1][2],
    deals: copy.businessEntries[1][3],
  },
  {
    id: 'sole-district',
    image: { uri: images.boutique },
    name: copy.businessEntries[2][0],
    meta: copy.businessEntries[2][1],
    rating: copy.businessEntries[2][2],
    deals: copy.businessEntries[2][3],
  },
];

export interface SavedHubScreenProps {
  onNotifications?: () => void;
  onAccount?: () => void;
  onOpenDeal?: (dealId: string) => void;
  onOpenBusiness?: (businessId: string) => void;
}

export function SavedHubScreen({
  onNotifications,
  onAccount,
  onOpenDeal,
  onOpenBusiness,
}: SavedHubScreenProps) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState(0);
  const normalizedQuery = query.trim().toLowerCase();

  const filteredDeals = useMemo(() => {
    if (!normalizedQuery) return dealEntries;
    return dealEntries.filter(item =>
      `${item.business} ${item.title} ${item.description ?? ''} ${item.discount}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  const filteredBusinesses = useMemo(() => {
    if (!normalizedQuery) return savedBusinesses;
    return savedBusinesses.filter(item =>
      `${item.name} ${item.meta} ${item.deals}`.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  const clearSearch = useCallback(() => setQuery(''), []);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <HubHeader
        title={copy.title}
        leadingIcon="localActivity"
        titleVariant="headingSm"
        actionNames={['notifications']}
        actionLabels={[copy.notifications]}
        onActions={[onNotifications]}
        accountAction={onAccount}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 pb-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3 px-4">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <VemtapText variant="headingMd" className="text-heading-md">
                {copy.heading}
              </VemtapText>
              <View className="rounded-full bg-secondary-container px-2 py-0.5">
                <VemtapText variant="caption" className="text-on-secondary-container">
                  {copy.savedCount}
                </VemtapText>
              </View>
            </View>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-low">
              <Icon name="tune" size={20} color={colors.surfaceDark} />
            </View>
          </View>
          <HubSearchField
            value={query}
            onChangeText={setQuery}
            placeholder={copy.search}
            filterLabel={copy.filter}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-4"
        >
          <StatusPillTabs
            labels={copy.tabs}
            selected={tab}
            onSelect={setTab}
            variant="subtle"
          />
        </ScrollView>
        {tab !== 2 ? (
          <View className="gap-3 px-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-primary" />
                <VemtapText variant="headingSm">{copy.dealsTitle}</VemtapText>
              </View>
              <VemtapText variant="caption" tone="tertiary">
                {copy.available}
              </VemtapText>
            </View>
            {filteredDeals.length > 0 ? (
              filteredDeals.map(item => (
                <SavedItemRow
                  key={item.id}
                  {...item}
                  onOpen={() => onOpenDeal?.(item.id)}
                />
              ))
            ) : (
              <EmptyState
                title={copy.noDealsResultsTitle}
                description={copy.noResultsBody}
                actionLabel={normalizedQuery ? copy.clearSearch : undefined}
                onAction={normalizedQuery ? clearSearch : undefined}
                className="py-8"
              />
            )}
          </View>
        ) : null}
        {tab !== 1 ? (
          <SavedBusinesses
            businesses={filteredBusinesses}
            onOpenBusiness={onOpenBusiness}
            onClearSearch={clearSearch}
            hasQuery={Boolean(normalizedQuery)}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SavedBusinesses({
  businesses,
  onOpenBusiness,
  onClearSearch,
  hasQuery,
}: {
  businesses: typeof savedBusinesses;
  onOpenBusiness?: (id: string) => void;
  onClearSearch: () => void;
  hasQuery: boolean;
}) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between px-4">
        <View className="flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full bg-secondary" />
          <VemtapText variant="headingSm">{copy.businessesTitle}</VemtapText>
        </View>
        <SectionLink label={copy.seeAll} />
      </View>
      {businesses.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-4 px-4"
        >
          {businesses.map(item => (
            <SavedBusinessRow
              key={item.id}
              image={item.image}
              name={item.name}
              meta={item.meta}
              rating={item.rating}
              deals={item.deals}
              view={copy.viewProfile}
              onPress={() => onOpenBusiness?.(item.name)}
            />
          ))}
        </ScrollView>
      ) : (
        <EmptyState
          title={copy.noBusinessesResultsTitle}
          description={copy.noResultsBody}
          actionLabel={hasQuery ? copy.clearSearch : undefined}
          onAction={hasQuery ? onClearSearch : undefined}
          className="py-8"
        />
      )}
    </View>
  );
}
