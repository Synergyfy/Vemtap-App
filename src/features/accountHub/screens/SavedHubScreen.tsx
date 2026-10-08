import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccountHeader } from '@features/accountHub/components/AccountScreensPrimitives';
import { HubSearchField } from '@features/accountHub/components/HubPrimitives';
import { EmptyState } from '@components/shared/EmptyState';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { savedImages } from '@features/accountHub/data/accountHubImages';
import {
  useDealSaveStatus,
  useToggleDealSave,
} from '@features/accountHub/hooks/useSavedDeals';

cssInterop(Image, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

const copy = strings.savedHub;
type SavedCategory = 'all' | 'deals' | 'businesses' | 'services';

interface SavedItem {
  id: string;
  category: Exclude<SavedCategory, 'all'>;
  business: string;
  title: string;
  searchText: string;
}

const savedItems: readonly SavedItem[] = [
  {
    id: 'urban-grill',
    category: 'deals',
    business: copy.items.urbanGrill.title,
    title: copy.items.urbanGrill.subtitle,
    searchText: `${copy.items.urbanGrill.title} ${copy.items.urbanGrill.subtitle} ${copy.items.urbanGrill.discount} ${copy.items.urbanGrill.area}`,
  },
  {
    id: 'glow-serenity',
    category: 'businesses',
    business: copy.items.glow.title,
    title: copy.items.glow.deal,
    searchText: `${copy.items.glow.title} ${copy.items.glow.deal} ${copy.items.glow.badge}`,
  },
  {
    id: 'sole-district',
    category: 'deals',
    business: copy.items.soleDistrict.title,
    title: copy.items.soleDistrict.subtitle,
    searchText: `${copy.items.soleDistrict.title} ${copy.items.soleDistrict.subtitle} ${copy.items.soleDistrict.discount}`,
  },
  {
    id: 'cold-brew',
    category: 'services',
    business: copy.items.coldBrew.business,
    title: copy.items.coldBrew.title,
    searchText: `${copy.items.coldBrew.business} ${copy.items.coldBrew.title}`,
  },
];

function BookmarkButton({
  saved,
  label,
  onPress,
  onImage = false,
}: {
  saved: boolean;
  label: string;
  onPress: () => void;
  onImage?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: saved }}
      onPress={onPress}
      hitSlop={6}
      className={
        onImage
          ? 'absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest/90 shadow-md active:scale-90'
          : 'shrink-0 rounded-full p-1 active:scale-90'
      }
    >
      <Icon
        name="bookmark"
        size={onImage ? 20 : 18}
        color={saved ? colors.primary : colors.textTertiary}
      />
    </Pressable>
  );
}

function ImageBadge({
  icon,
  label,
  tone,
}: {
  icon: IconName;
  label: string;
  tone: 'success' | 'neutral';
}) {
  return (
    <View
      className={`absolute left-3 top-3 flex-row items-center gap-1.5 rounded-full px-2.5 py-1 shadow-sm ${
        tone === 'success' ? 'bg-badge-discount-bg' : 'bg-surface-container-lowest/90'
      }`}
    >
      <Icon
        name={icon}
        size={14}
        color={tone === 'success' ? colors.badgeDiscountText : colors.primary}
      />
      <VemtapText
        variant="labelSm"
        numberOfLines={1}
        className={tone === 'success' ? 'text-badge-discount-text' : 'text-text'}
      >
        {label}
      </VemtapText>
    </View>
  );
}

function SavedDealCard({
  image,
  badge,
  badgeIcon,
  area,
  distance,
  discount,
  title,
  subtitle,
  price,
  oldPrice,
  saved,
  onToggleSave,
  onOpen,
}: {
  image: { uri: string; alt: string };
  badge: string;
  badgeIcon: IconName;
  area: string;
  distance: string;
  discount: string;
  title: string;
  subtitle: string;
  price: string;
  oldPrice: string;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
}) {
  return (
    <View className="overflow-hidden rounded-card bg-surface-canvas shadow-sm">
      <View className="relative h-44 w-full bg-surface-container-high">
        <Image
          source={{ uri: image.uri }}
          accessibilityLabel={image.alt}
          className="h-full w-full"
          resizeMode="cover"
        />
        <ImageBadge icon={badgeIcon} label={badge} tone="success" />
        <BookmarkButton
          saved={saved}
          label={`${copy.removeBookmark}: ${title}`}
          onPress={onToggleSave}
          onImage
        />
      </View>
      <View className="gap-1.5 p-4">
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
            <Icon name="locationOn" size={16} color={colors.primary} />
            <VemtapText variant="labelSm" numberOfLines={1}>
              {area}
            </VemtapText>
            <VemtapText variant="labelSm" tone="tertiary">
              •
            </VemtapText>
            <VemtapText variant="labelSm" tone="secondary" className="shrink-0">
              {distance}
            </VemtapText>
          </View>
          <View className="shrink-0 rounded-full bg-surface-container-high px-2 py-0.5">
            <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
              {discount}
            </VemtapText>
          </View>
        </View>
        <VemtapText variant="bodyMd" className="font-sans-semibold" numberOfLines={1}>
          {title}
        </VemtapText>
        <VemtapText variant="bodyMd" tone="secondary" numberOfLines={1}>
          {subtitle}
        </VemtapText>
        <View className="mt-1 flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-baseline gap-2">
            <VemtapText variant="labelMd" className="font-sans-bold">
              {price}
            </VemtapText>
            <VemtapText variant="labelSm" tone="tertiary" className="line-through">
              {oldPrice}
            </VemtapText>
          </View>
          <Button
            label={copy.viewDeal}
            size="sm"
            fullWidth={false}
            labelVariant="labelSm"
            labelClassName="text-primary-foreground"
            rightIcon={<Icon name="arrowForward" size={15} color={colors.surface} />}
            onPress={onOpen}
          />
        </View>
      </View>
    </View>
  );
}

function SavedBusinessCard({
  item,
  saved,
  onToggleSave,
  onOpen,
}: {
  item: SavedItem;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
}) {
  return (
    <View className="overflow-hidden rounded-card bg-surface-canvas shadow-sm">
      <View className="relative h-40 w-full bg-surface-container-high">
        <Image
          source={{ uri: savedImages.spaInterior.uri }}
          accessibilityLabel={savedImages.spaInterior.alt}
          className="h-full w-full"
          resizeMode="cover"
        />
        <ImageBadge icon="spa" label={copy.items.glow.badge} tone="neutral" />
        <BookmarkButton
          saved={saved}
          label={`${copy.removeBookmark}: ${item.business}`}
          onPress={onToggleSave}
          onImage
        />
      </View>
      <View className="gap-1.5 p-4">
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-1">
            <Icon name="star" size={18} color={colors.tertiaryContainer} />
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold text-tertiary-container"
            >
              {copy.items.glow.rating}
            </VemtapText>
            <VemtapText variant="labelSm" tone="tertiary" numberOfLines={1}>
              {copy.items.glow.reviews}
            </VemtapText>
          </View>
          <View className="min-w-0 flex-1 flex-row items-center gap-1">
            <Icon name="nearMe" size={16} color={colors.primary} />
            <VemtapText variant="labelSm" tone="secondary" numberOfLines={1}>
              {copy.items.glow.distance}
            </VemtapText>
          </View>
        </View>
        <VemtapText variant="bodyMd" className="font-sans-semibold" numberOfLines={1}>
          {item.business}
        </VemtapText>
        <View className="flex-row items-center gap-2 rounded-field bg-surface-tint-blue p-2.5">
          <Icon name="localOffer" size={18} color={colors.primary} />
          <VemtapText
            variant="labelSm"
            tone="brand"
            className="min-w-0 flex-1 font-sans-medium"
            numberOfLines={1}
          >
            {copy.items.glow.deal}
          </VemtapText>
        </View>
        <View className="mt-1 flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-1">
            <View className="h-2 w-2 shrink-0 rounded-full bg-badge-discount-text" />
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.items.glow.openToday}
            </VemtapText>
          </View>
          <Button
            label={copy.viewBusiness}
            size="sm"
            variant="secondary"
            fullWidth={false}
            labelVariant="labelSm"
            rightIcon={<Icon name="storefront" size={15} color={colors.text} />}
            onPress={onOpen}
          />
        </View>
      </View>
    </View>
  );
}

function SavedServiceCard({
  item,
  saved,
  onToggleSave,
  onOpen,
}: {
  item: SavedItem;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
}) {
  return (
    <View className="flex-row items-center gap-4 rounded-card bg-surface-canvas p-4 shadow-sm">
      <View className="relative h-24 w-24 shrink-0 overflow-hidden rounded-field bg-surface-container-high">
        <Image
          source={{ uri: savedImages.coldBrew.uri }}
          accessibilityLabel={savedImages.coldBrew.alt}
          className="h-full w-full"
          resizeMode="cover"
        />
        <View className="absolute bottom-1 right-1 rounded bg-surface-container-lowest/90 px-1.5 py-0.5">
          <VemtapText variant="caption" tone="secondary" className="font-sans-semibold">
            {copy.items.coldBrew.size}
          </VemtapText>
        </View>
      </View>
      <View className="min-w-0 flex-1 justify-between py-0.5">
        <View className="flex-row items-start justify-between gap-1">
          <View className="min-w-0">
            <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
              {item.business}
            </VemtapText>
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {item.title}
            </VemtapText>
          </View>
          <BookmarkButton
            saved={saved}
            label={`${copy.removeBookmark}: ${item.title}`}
            onPress={onToggleSave}
          />
        </View>
        <View className="my-1 flex-row items-center gap-1.5">
          <Icon name="locationOn" size={14} color={colors.primary} />
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {copy.items.coldBrew.location}
          </VemtapText>
        </View>
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText variant="labelMd" className="font-sans-bold">
            {copy.items.coldBrew.price}
          </VemtapText>
          <Button
            label={copy.order}
            size="sm"
            variant="secondary"
            fullWidth={false}
            labelVariant="labelSm"
            leftIcon={<Icon name="shoppingBag" size={14} color={colors.primary} />}
            onPress={onOpen}
          />
        </View>
      </View>
    </View>
  );
}

export interface SavedHubScreenProps {
  onBack?: () => void;
  onNotifications?: () => void;
  onOpenDeal?: (dealId: string) => void;
  onOpenBusiness?: (businessId: string) => void;
  onOpenService?: (serviceId: string) => void;
}

const SAVED_ID_TO_OFFER_ID: Record<string, string> = {
  'urban-grill': 'urban-grill-lunch',
  'sole-district': 'sole-district-streetwear',
  // 'glow-serenity' and 'cold-brew' have no backend save endpoints yet
};

export function SavedHubScreen({
  onBack,
  onNotifications,
  onOpenDeal,
  onOpenBusiness,
  onOpenService,
}: SavedHubScreenProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SavedCategory>('all');
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});

  // Real API hooks for deal save status (only works for deals with real offer IDs)
  const urbanGrillOfferId = SAVED_ID_TO_OFFER_ID['urban-grill'];
  const soleDistrictOfferId = SAVED_ID_TO_OFFER_ID['sole-district'];

  const urbanGrillSaveStatus = useDealSaveStatus(urbanGrillOfferId);
  const soleDistrictSaveStatus = useDealSaveStatus(soleDistrictOfferId);
  const toggleDealSave = useToggleDealSave();

  const normalizedQuery = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      savedItems.filter(
        item =>
          (filter === 'all' || item.category === filter) &&
          (!normalizedQuery || item.searchText.toLowerCase().includes(normalizedQuery)),
      ),
    [filter, normalizedQuery],
  );

  const resetFilters = useCallback(() => {
    setQuery('');
    setFilter('all');
  }, []);

  const toggleSave = useCallback(
    (id: string) => {
      const offerId = SAVED_ID_TO_OFFER_ID[id];
      if (offerId) {
        // Real API call for deals
        toggleDealSave.mutate(offerId);
      } else {
        // Local state fallback for businesses/services (no backend yet)
        setBookmarks(current => ({ ...current, [id]: !current[id] }));
      }
    },
    [toggleDealSave],
  );

  // Get saved state: use API for deals with real offer IDs, local state for others
  const getSavedState = useCallback(
    (id: string) => {
      const offerId = SAVED_ID_TO_OFFER_ID[id];
      if (offerId === 'urban-grill-lunch')
        return urbanGrillSaveStatus.data?.saved ?? false;
      if (offerId === 'sole-district-streetwear')
        return soleDistrictSaveStatus.data?.saved ?? false;
      return bookmarks[id] !== false;
    },
    [urbanGrillSaveStatus.data, soleDistrictSaveStatus.data, bookmarks],
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-surface">
      <AccountHeader
        title={copy.title}
        onBack={onBack}
        onAction={onNotifications}
        actionIcon="notifications"
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 pb-8 pt-1"
        showsVerticalScrollIndicator={false}
      >
        <HubSearchField
          value={query}
          onChangeText={setQuery}
          placeholder={copy.searchPlaceholder}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="flex-row gap-1.5"
        >
          {copy.filters.map(item => {
            const active = filter === item.label.toLowerCase().split(' ')[0];
            return (
              <Pressable
                key={item.label}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() =>
                  setFilter(item.label.toLowerCase().split(' ')[0] as SavedCategory)
                }
                className={`h-9 shrink-0 flex-row items-center gap-1.5 rounded-full px-4 shadow-sm active:scale-95 ${
                  active ? 'bg-primary' : 'bg-surface-canvas'
                }`}
              >
                <VemtapText
                  variant="labelMd"
                  className={active ? 'text-primary-foreground' : 'text-text-secondary'}
                >
                  {item.label}
                </VemtapText>
                <View
                  className={`rounded-full px-1.5 py-0.5 ${
                    active ? 'bg-surface-container-lowest/20' : 'bg-surface-container'
                  }`}
                >
                  <VemtapText
                    variant="caption"
                    className={active ? 'text-primary-foreground' : 'text-text-secondary'}
                  >
                    {item.count}
                  </VemtapText>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {visible.length > 0 ? (
          visible.map(item => {
            const saved = getSavedState(item.id);
            if (item.id === 'urban-grill') {
              return (
                <SavedDealCard
                  key={item.id}
                  image={savedImages.burger}
                  badge={copy.items.urbanGrill.badge}
                  badgeIcon="schedule"
                  area={copy.items.urbanGrill.area}
                  distance={copy.items.urbanGrill.distance}
                  discount={copy.items.urbanGrill.discount}
                  title={copy.items.urbanGrill.title}
                  subtitle={copy.items.urbanGrill.subtitle}
                  price={copy.items.urbanGrill.price}
                  oldPrice={copy.items.urbanGrill.oldPrice}
                  saved={saved}
                  onToggleSave={() => toggleSave(item.id)}
                  onOpen={() => onOpenDeal?.(item.id)}
                />
              );
            }
            if (item.id === 'sole-district') {
              return (
                <SavedDealCard
                  key={item.id}
                  image={savedImages.sneakers}
                  badge={copy.items.soleDistrict.badge}
                  badgeIcon="bolt"
                  area={copy.items.soleDistrict.area}
                  distance={copy.items.soleDistrict.distance}
                  discount={copy.items.soleDistrict.discount}
                  title={copy.items.soleDistrict.title}
                  subtitle={copy.items.soleDistrict.subtitle}
                  price={copy.items.soleDistrict.price}
                  oldPrice={copy.items.soleDistrict.oldPrice}
                  saved={saved}
                  onToggleSave={() => toggleSave(item.id)}
                  onOpen={() => onOpenDeal?.(item.id)}
                />
              );
            }
            if (item.id === 'glow-serenity') {
              return (
                <SavedBusinessCard
                  key={item.id}
                  item={item}
                  saved={saved}
                  onToggleSave={() => toggleSave(item.id)}
                  onOpen={() => onOpenBusiness?.(item.id)}
                />
              );
            }
            return (
              <SavedServiceCard
                key={item.id}
                item={item}
                saved={saved}
                onToggleSave={() => toggleSave(item.id)}
                onOpen={() => onOpenService?.(item.id)}
              />
            );
          })
        ) : (
          <EmptyState
            title={copy.emptyTitle}
            description={copy.emptyBody}
            actionLabel={copy.resetFilters}
            onAction={resetFilters}
            className="py-12"
          />
        )}

        <View className="flex-row items-start gap-2 rounded-card bg-surface-container-low p-4">
          <Icon name="cloudDone" size={20} color={colors.primary} />
          <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
            {copy.syncNote}
          </VemtapText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
