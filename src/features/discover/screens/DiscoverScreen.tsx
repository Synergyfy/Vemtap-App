import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BusinessDiscoveryCard } from '@components/discover/BusinessDiscoveryCard';
import { CategoryChips } from '@components/home/CategoryChips';
import { LocationTargetingControls } from '@components/home/LocationTargetingControls';
import { HomeSearchBar } from '@components/home/HomeSearchBar';
import { EmptyState } from '@components/shared/EmptyState';
import { Avatar } from '@components/ui/Avatar';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';
import { strings } from '@constants/strings';
import { useCurrentUserDisplay } from '@hooks/useCurrentUserDisplay';
import {
  mapDiscoverCategory,
  useDiscoverBusinesses,
} from '@features/discover/hooks/useDiscoverBusinesses';
import { useFilterCategories } from '@features/deals/hooks/useFilterCategories';
import { useSearch } from '@features/search/hooks/usePublicSearch';
import {
  discoverCategories,
  DiscoverCategory,
  type BusinessProfileSummary,
} from '@features/discover/data/discoverData';
import { useConsumerTargeting } from '@features/home/hooks/useConsumerTargeting';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

export interface DiscoverScreenProps {
  onOpenBusiness: (businessId: string, fallbackBusiness?: BusinessProfileSummary) => void;
  onOpenFilters: () => void;
  onToggleMap: () => void;
  onOpenNotifications: () => void;
  onOpenAccount: () => void;
  onOpenEnrollment: () => void;
  onOpenLocationSelect?: () => void;
  onUseCurrentLocation?: () => void;
}

export function DiscoverScreen(props: DiscoverScreenProps): React.JSX.Element;
export function DiscoverScreen(): React.JSX.Element;
export function DiscoverScreen(props: Partial<DiscoverScreenProps> = {}) {
  const display = useCurrentUserDisplay();
  const search = useSearch();
  const targeting = useConsumerTargeting({
    onOpenLocationSelect: props.onOpenLocationSelect ?? (() => undefined),
    onUseCurrentLocation: props.onUseCurrentLocation,
  });
  const [activeCategory, setActiveCategory] = useState<DiscoverCategory>('All');
  const [mapIcon, setMapIcon] = useState<'map' | 'agenda'>('map');
  const { options: categoryOptions } = useFilterCategories();

  /**
   * The server filters this list by taxonomy UUID; Discover's chips are local
   * display categories. Map the active chip onto a taxonomy entry with the same
   * name→display-category rule the card mapping uses, and send its id.
   * A chip with no taxonomy match (if one ever exists) returns `undefined` and
   * keeps the client-side category filter below.
   */
  const activeCategoryId = useMemo(() => {
    if (activeCategory === 'All') return undefined;
    return categoryOptions.find(
      option => mapDiscoverCategory(option.name) === activeCategory,
    )?.id;
  }, [activeCategory, categoryOptions]);

  const {
    data: businesses,
    isLoading,
    isError,
  } = useDiscoverBusinesses(
    { search: search.debounced, categoryId: activeCategoryId },
    8,
  );

  const filteredBusinesses = useMemo(() => {
    if (!businesses) return [];
    // A mapped category was already applied server-side; only unmapped chips
    // still need the client-side category check. Search is server-side now.
    if (activeCategory === 'All' || activeCategoryId) return businesses;
    return businesses.filter(business => business.categoryFilter === activeCategory);
  }, [activeCategory, activeCategoryId, businesses]);

  const toggleMap = () => {
    setMapIcon(value => (value === 'map' ? 'agenda' : 'map'));
    props.onToggleMap?.();
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-surface">
        <View className="my-8 text-center">
          <VemtapText variant="labelMd">{strings.common.loading}</VemtapText>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-surface">
        <View accessibilityRole="alert" className="mt-4 items-center">
          <Icon name="cloudOff" size={48} color={colors.outline} />
          <VemtapText variant="headingSm" className="mt-2 text-center">
            {strings.common.error}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" className="text-center">
            {strings.common.retry}
          </VemtapText>
        </View>
      </SafeAreaView>
    );
  }

  // While a search is active the query may legitimately return nothing; the
  // screen stays up (with the search field) and the list area shows the shared
  // empty state, so the term can still be cleared.
  if ((!businesses || businesses.length === 0) && !search.active) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-surface">
        <View accessibilityRole="alert" className="mt-4 items-center">
          <Icon name="storefront" size={48} color={colors.outline} />
          <VemtapText variant="headingSm" className="mt-2 text-center">
            {strings.discoverFeed.noBusinessesTitle}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" className="text-center">
            {strings.discoverFeed.noBusinessesBody}
          </VemtapText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-surface">
      <View
        style={navbarBottomShadow}
        className="h-14 w-full flex-row items-center justify-between bg-surface px-6"
      >
        <VemtapText variant="headingSm" className="text-text">
          {strings.discoverFeed.headerTitle}
        </VemtapText>
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.discoverFeed.notifications}
            hitSlop={6}
            onPress={props.onOpenNotifications}
            className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-container"
          >
            <Icon name="notifications" size={22} color={colors.text} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.discoverFeed.account}
            onPress={props.onOpenAccount}
            className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary active:opacity-80"
          >
            <Avatar name={display.fullName} size="sm" tone="brand" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="w-full max-w-screen self-center pb-8"
      >
        <View className="gap-3 bg-surface-canvas px-6 pb-3 pt-2 shadow-sm">
          <View className="flex-row items-center justify-between gap-3">
            <VemtapText
              accessibilityRole="header"
              variant="headingXl"
              className="min-w-0 flex-1 text-heading-xl text-text"
              numberOfLines={1}
            >
              {strings.discoverFeed.title}
            </VemtapText>
            <View className="shrink-0 flex-row items-center gap-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={strings.discoverFeed.toggleMap}
                accessibilityState={{ selected: mapIcon === 'agenda' }}
                onPress={toggleMap}
                className="h-10 w-10 items-center justify-center rounded-xl bg-surface-muted shadow-sm active:scale-95"
              >
                <Icon
                  name={mapIcon === 'map' ? 'explore' : 'listView'}
                  size={20}
                  color={colors.primaryContainer}
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={strings.discoverFeed.filterBusinesses}
                onPress={props.onOpenFilters}
                className="h-10 w-10 items-center justify-center rounded-xl bg-surface-muted shadow-sm active:scale-95"
              >
                <Icon name="tune" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          <View className="flex-row items-center justify-between gap-2">
            <LocationTargetingControls {...targeting.controlsProps} />
          </View>

          <HomeSearchBar
            variant="outlined"
            value={search.query}
            onChangeText={search.setQuery}
            showFilter={false}
            placeholder={strings.discoverFeed.searchPlaceholder}
          />
        </View>

        <View className="w-full bg-surface-canvas py-3">
          <CategoryChips
            categories={discoverCategories}
            activeCategory={activeCategory}
            onChangeCategory={category => setActiveCategory(category as DiscoverCategory)}
          />
        </View>

        <View className="w-full max-w-screen gap-4 self-center px-6 pb-6 pt-1">
          <View className="flex-row items-center justify-between gap-3 pt-1">
            <VemtapText className="min-w-0 flex-1 font-sans-semibold text-label-sm uppercase tracking-wider text-text-secondary">
              {strings.discoverFeed.spotlightDiscoveries(businesses?.length ?? 0)}
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary">
              {strings.discoverFeed.realTimePerks}
            </VemtapText>
          </View>

          {filteredBusinesses.length === 0 ? (
            <EmptyState
              variant="contained"
              icon="search"
              title={strings.search.emptyTitle}
              description={strings.search.emptyBody}
            />
          ) : (
            filteredBusinesses.map(business => (
              <BusinessDiscoveryCard
                key={business.id}
                business={business}
                onOpen={businessId =>
                  props.onOpenBusiness?.(business.branchCode ?? businessId, business)
                }
              />
            ))
          )}

          <Pressable
            accessibilityRole="link"
            accessibilityLabel={strings.discoverFeed.enrollmentLink}
            onPress={props.onOpenEnrollment}
            className="items-center pb-2 pt-4 active:opacity-70"
          >
            <VemtapText
              variant="caption"
              tone="secondary"
              className="text-center text-text"
            >
              {strings.discoverFeed.enrollmentPrompt}
            </VemtapText>
            <View className="mt-1 flex-row items-center gap-1">
              <VemtapText className="font-sans-semibold text-label-md text-primary">
                {strings.discoverFeed.enrollmentLink}
              </VemtapText>
              <Icon name="arrowForward" size={16} color={colors.primary} />
            </View>
          </Pressable>
        </View>
      </ScrollView>
      {targeting.renderRadiusSheet()}
    </SafeAreaView>
  );
}
