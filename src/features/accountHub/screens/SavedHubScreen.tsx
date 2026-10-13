import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccountHeader } from '@features/accountHub/components/AccountScreensPrimitives';
import { HubSearchField } from '@features/accountHub/components/HubPrimitives';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { savedImages } from '@features/accountHub/data/accountHubImages';
import { formatCurrency } from '@utils/formatters';
import { offerCountdown, toAmount } from '@features/deals/utils/offerMapper';
import {
  useSavedFeed,
  useSavedTotals,
  useToggleBusinessSave,
  useToggleDealSave,
  useToggleServiceSave,
} from '@features/accountHub/hooks/useSavedHub';
import type {
  SavedBusinessItem,
  SavedDealItem,
  SavedRow,
  SavedServiceItem,
} from '@api/savedApi';

cssInterop(Image, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

const copy = strings.savedHub;

type SavedFilter = 'ALL' | 'DEAL' | 'BUSINESS' | 'SERVICE';

/** Index-aligned with `copy.filters` so the design labels stay in the strings file. */
const FILTER_KEYS: readonly SavedFilter[] = ['ALL', 'DEAL', 'BUSINESS', 'SERVICE'];

function searchText(row: SavedRow): string {
  switch (row.type) {
    case 'DEAL':
      return `${row.item.name} ${row.item.businessName}`.toLowerCase();
    case 'BUSINESS':
      return `${row.item.name} ${row.item.categoryName ?? ''} ${
        row.item.city ?? ''
      }`.toLowerCase();
    case 'SERVICE':
      return `${row.item.name} ${row.item.businessName}`.toLowerCase();
  }
}

function BookmarkButton({
  label,
  onPress,
  onImage = false,
}: {
  label: string;
  onPress: () => void;
  onImage?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: true }}
      onPress={onPress}
      hitSlop={6}
      className={
        onImage
          ? 'absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest/90 shadow-md active:scale-90'
          : 'shrink-0 rounded-full p-1 active:scale-90'
      }
    >
      <Icon name="bookmark" size={onImage ? 20 : 18} color={colors.primary} />
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

function dealBadge(item: SavedDealItem): { label: string; tone: 'success' | 'neutral' } {
  if (item.isExpired) return { label: copy.expiredBadge, tone: 'neutral' };
  if ((item.discountPercent ?? 0) > 0) {
    return {
      label: strings.deals.percentOff(item.discountPercent as number),
      tone: 'success',
    };
  }
  return { label: copy.limitedVouchers, tone: 'neutral' };
}

function SavedDealCard({
  item,
  onToggleSave,
  onOpen,
}: {
  item: SavedDealItem;
  onToggleSave: () => void;
  onOpen: () => void;
}) {
  const price = toAmount(item.calculatedPrice);
  const original = toAmount(item.originalPrice);
  const showOld = price !== null && original !== null && original > price;
  const location = item.branchName ?? item.branchAddress ?? '';
  const discount =
    (item.discountPercent ?? 0) > 0
      ? strings.deals.percentOff(item.discountPercent as number)
      : (offerCountdown(item.endDate) ?? copy.expiredBadge);

  return (
    <View className="overflow-hidden rounded-card bg-surface-canvas shadow-sm">
      <View className="relative h-44 w-full bg-surface-container-high">
        <Image
          source={{ uri: item.mainImage ?? savedImages.burger.uri }}
          accessibilityLabel={item.name}
          className="h-full w-full"
          resizeMode="cover"
        />
        <ImageBadge icon="schedule" {...dealBadge(item)} />
        <BookmarkButton
          label={`${copy.removeBookmark}: ${item.name}`}
          onPress={onToggleSave}
          onImage
        />
      </View>
      <View className="gap-1.5 p-4">
        {location ? (
          <View className="flex-row items-center gap-1.5">
            <Icon name="locationOn" size={16} color={colors.primary} />
            <VemtapText variant="labelSm" numberOfLines={1} className="min-w-0 flex-1">
              {location}
            </VemtapText>
            <View className="shrink-0 rounded-full bg-surface-container-high px-2 py-0.5">
              <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
                {discount}
              </VemtapText>
            </View>
          </View>
        ) : null}
        <VemtapText variant="bodyMd" className="font-sans-semibold" numberOfLines={1}>
          {item.name}
        </VemtapText>
        <VemtapText variant="bodyMd" tone="secondary" numberOfLines={1}>
          {item.businessName}
        </VemtapText>
        <View className="mt-1 flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-baseline gap-2">
            <VemtapText variant="labelMd" className="font-sans-bold">
              {price === null ? '' : formatCurrency(price)}
            </VemtapText>
            {showOld ? (
              <VemtapText variant="labelSm" tone="tertiary" className="line-through">
                {formatCurrency(original as number)}
              </VemtapText>
            ) : null}
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
  onToggleSave,
  onOpen,
}: {
  item: SavedBusinessItem;
  onToggleSave: () => void;
  onOpen: () => void;
}) {
  const location = [item.city, item.address].filter(Boolean).join(' • ');
  return (
    <View className="overflow-hidden rounded-card bg-surface-canvas shadow-sm">
      <View className="relative h-40 w-full bg-surface-container-high">
        <Image
          source={{ uri: item.logoUrl ?? savedImages.spaInterior.uri }}
          accessibilityLabel={item.name}
          className="h-full w-full"
          resizeMode="cover"
        />
        <ImageBadge
          icon="storefront"
          label={item.categoryName ?? copy.businessBadgeFallback}
          tone="neutral"
        />
        <BookmarkButton
          label={`${copy.removeBookmark}: ${item.name}`}
          onPress={onToggleSave}
          onImage
        />
      </View>
      <View className="gap-1.5 p-4">
        <View className="flex-row items-center gap-2">
          {item.isVerified ? (
            <View className="flex-row items-center gap-1 rounded-full bg-surface-tint-blue px-2 py-0.5">
              <Icon name="verified" size={13} color={colors.primary} />
              <VemtapText variant="micro" tone="brand" className="font-sans-semibold">
                {strings.savedHub.verified}
              </VemtapText>
            </View>
          ) : null}
          {location ? (
            <View className="min-w-0 flex-1 flex-row items-center gap-1">
              <Icon name="nearMe" size={16} color={colors.primary} />
              <VemtapText variant="labelSm" tone="secondary" numberOfLines={1}>
                {location}
              </VemtapText>
            </View>
          ) : null}
        </View>
        <VemtapText variant="bodyMd" className="font-sans-semibold" numberOfLines={1}>
          {item.name}
        </VemtapText>
        <View className="mt-1 flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-1">
            <View className="h-2 w-2 shrink-0 rounded-full bg-badge-discount-text" />
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {item.branchCode ?? copy.businessBadgeFallback}
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
  onToggleSave,
  onOpen,
}: {
  item: SavedServiceItem;
  onToggleSave: () => void;
  onOpen: () => void;
}) {
  const min = toAmount(item.priceRangeMin);
  const max = toAmount(item.priceRangeMax);
  const fixed = toAmount(item.price);
  const priceLabel =
    item.priceType === 'range' && min !== null && max !== null
      ? `${formatCurrency(min)} – ${formatCurrency(max)}`
      : item.priceType === 'starting_from' && fixed !== null
        ? copy.fromPrice(formatCurrency(fixed))
        : item.priceType === 'contact'
          ? copy.contactForPrice
          : fixed === null
            ? ''
            : formatCurrency(fixed);

  return (
    <View className="flex-row items-center gap-4 rounded-card bg-surface-canvas p-4 shadow-sm">
      <View className="relative h-24 w-24 shrink-0 overflow-hidden rounded-field bg-surface-container-high">
        <Image
          source={{ uri: item.mainImage ?? savedImages.coldBrew.uri }}
          accessibilityLabel={item.name}
          className="h-full w-full"
          resizeMode="cover"
        />
        {item.duration ? (
          <View className="absolute bottom-1 right-1 rounded bg-surface-container-lowest/90 px-1.5 py-0.5">
            <VemtapText variant="caption" tone="secondary" className="font-sans-semibold">
              {item.duration}
            </VemtapText>
          </View>
        ) : null}
      </View>
      <View className="min-w-0 flex-1 justify-between py-0.5">
        <View className="flex-row items-start justify-between gap-1">
          <View className="min-w-0">
            <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
              {item.businessName}
            </VemtapText>
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {item.name}
            </VemtapText>
          </View>
          <BookmarkButton
            label={`${copy.removeBookmark}: ${item.name}`}
            onPress={onToggleSave}
          />
        </View>
        <View className="my-1 flex-row items-center gap-1.5">
          <Icon name="locationOn" size={14} color={colors.primary} />
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {item.branchName ?? item.businessName}
          </VemtapText>
        </View>
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText variant="labelMd" className="font-sans-bold">
            {priceLabel}
          </VemtapText>
          <Button
            label={copy.viewService}
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
  onOpenDeal?: (offerId: string) => void;
  /** Receives the business 9-character code for the public profile route. */
  onOpenBusiness?: (businessCode: string) => void;
  onOpenService?: (serviceId: string) => void;
}

export function SavedHubScreen({
  onBack,
  onNotifications,
  onOpenDeal,
  onOpenBusiness,
  onOpenService,
}: SavedHubScreenProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SavedFilter>('ALL');

  const feed = useSavedFeed(filter === 'ALL' ? undefined : filter);
  const totals = useSavedTotals();
  const toggleDealSave = useToggleDealSave();
  const toggleBusinessSave = useToggleBusinessSave();
  const toggleServiceSave = useToggleServiceSave();

  const normalizedQuery = query.trim().toLowerCase();
  const rows = useMemo(() => {
    const data = feed.data?.data ?? [];
    if (!normalizedQuery) return data;
    return data.filter(row => searchText(row).includes(normalizedQuery));
  }, [feed.data, normalizedQuery]);

  const counts: Record<SavedFilter, number | undefined> = {
    ALL: totals.all,
    DEAL: totals.deals,
    BUSINESS: totals.businesses,
    SERVICE: totals.services,
  };

  const resetFilters = useCallback(() => {
    setQuery('');
    setFilter('ALL');
  }, []);

  const toggleSave = useCallback(
    (row: SavedRow) => {
      if (row.type === 'DEAL') toggleDealSave.mutate(row.item.offerId);
      else if (row.type === 'BUSINESS') toggleBusinessSave.mutate(row.item.id);
      else toggleServiceSave.mutate(row.item.id);
    },
    [toggleBusinessSave, toggleDealSave, toggleServiceSave],
  );

  const filtered = normalizedQuery.length > 0 || filter !== 'ALL';

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
          {copy.filters.map((item, index) => {
            const key = FILTER_KEYS[index];
            const active = filter === key;
            const count = counts[key];
            return (
              <Pressable
                key={item.label}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => setFilter(key)}
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
                {count !== undefined ? (
                  <View
                    className={`rounded-full px-1.5 py-0.5 ${
                      active ? 'bg-surface-container-lowest/20' : 'bg-surface-container'
                    }`}
                  >
                    <VemtapText
                      variant="caption"
                      className={
                        active ? 'text-primary-foreground' : 'text-text-secondary'
                      }
                    >
                      {count}
                    </VemtapText>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>

        {feed.isLoading ? (
          <LoadingState label={strings.common.loading} />
        ) : feed.isError ? (
          <ErrorState onRetry={() => feed.refetch()} />
        ) : rows.length > 0 ? (
          rows.map(row => {
            switch (row.type) {
              case 'DEAL':
                return (
                  <SavedDealCard
                    key={row.id}
                    item={row.item}
                    onToggleSave={() => toggleSave(row)}
                    onOpen={() => onOpenDeal?.(row.item.offerId)}
                  />
                );
              case 'BUSINESS':
                return (
                  <SavedBusinessCard
                    key={row.id}
                    item={row.item}
                    onToggleSave={() => toggleSave(row)}
                    onOpen={() => onOpenBusiness?.(row.item.slug)}
                  />
                );
              case 'SERVICE':
                return (
                  <SavedServiceCard
                    key={row.id}
                    item={row.item}
                    onToggleSave={() => toggleSave(row)}
                    onOpen={() => onOpenService?.(row.item.id)}
                  />
                );
              default:
                return null;
            }
          })
        ) : (
          <EmptyState
            icon="bookmark"
            title={filtered ? copy.noMatchesTitle : copy.emptyTitle}
            description={filtered ? copy.noResultsBody : copy.emptyBody}
            actionLabel={filtered ? copy.resetFilters : undefined}
            onAction={filtered ? resetFilters : undefined}
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
