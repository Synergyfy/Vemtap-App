import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { RangeSlider } from '@components/ui/RangeSlider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FilterChip } from '@components/filters/FilterChip';
import { FilterSection } from '@components/filters/FilterSection';
import { AvailabilityRow } from '@components/filters/AvailabilityRow';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { LoadingState } from '@components/shared/LoadingState';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';
import { strings } from '@constants/strings';
import type { AppStackParamList } from '@navigation/types';
import { DEFAULT_RADIUS_KM, useLocationStore } from '@store/locationStore';
import { useDealsFilterStore } from '@store/dealsFilterStore';
import { useFilterCategories } from '@features/deals/hooks/useFilterCategories';
import { usePublicOffersFeed } from '@features/deals/hooks/usePublicOffers';
import { cn } from '@utils/cn';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(TextInput, { className: 'style' });

type Nav = NativeStackNavigationProp<AppStackParamList, 'DealFilters'>;

const DISTANCE_CHIPS: {
  key: string;
  label: string;
  km: number;
  check?: boolean;
}[] = [
  { key: 'near', label: strings.filters.nearMe, km: DEFAULT_RADIUS_KM, check: true },
  { key: '1', label: strings.filters.oneKm, km: 1 },
  { key: '5', label: strings.filters.fiveKm, km: 5 },
  { key: '10', label: strings.filters.tenKm, km: 10 },
  { key: 'custom', label: strings.filters.custom, km: 8 },
];

/** Chip key → the range it stands for. `custom` reads the two text inputs. */
const PRICE_RANGES: Record<string, { min: number | null; max: number | null }> = {
  any: { min: null, max: null },
  u5: { min: null, max: 5_000 },
  '5-20': { min: 5_000, max: 20_000 },
  '20-50': { min: 20_000, max: 50_000 },
  '50+': { min: 50_000, max: null },
  custom: { min: null, max: null },
};

/** Chip key → the minimum discount it stands for. */
const DISCOUNT_MIN: Record<string, number | null> = {
  any: null,
  '10': 10,
  '20': 20,
  '30': 30,
  '50': 50,
};

/** The design's own price labels, paired with the range each one applies. */
const PRICE_CHIPS: { key: string; label: string }[] = [
  { key: 'any', label: strings.filters.anyPrice },
  { key: 'u5', label: strings.filters.under5k },
  { key: '5-20', label: strings.filters.range5to20 },
  { key: '20-50', label: strings.filters.range20to50 },
  { key: '50+', label: strings.filters.over50k },
];

const DISCOUNT_CHIPS: {
  key: string;
  label: string;
  check?: boolean;
  hot?: boolean;
}[] = [
  { key: 'any', label: strings.filters.anyDiscount },
  { key: '10', label: strings.filters.off10 },
  { key: '20', label: strings.filters.off20, check: true },
  { key: '30', label: strings.filters.off30 },
  { key: '50', label: strings.filters.off50Hot, hot: true },
];

const AVAILABILITY = [
  {
    key: 'now',
    icon: 'bolt' as const,
    title: strings.filters.availableNow,
    subtitle: strings.filters.availableNowSub,
  },
  {
    key: 'ending',
    icon: 'hourglass' as const,
    title: strings.filters.endingSoon,
    subtitle: strings.filters.endingSoonSub,
  },
  {
    key: 'walkin',
    icon: 'storefront' as const,
    title: strings.filters.walkIns,
    subtitle: strings.filters.walkInsSub,
  },
  {
    key: 'weekend',
    icon: 'eventAvailable' as const,
    title: strings.filters.weekendOnly,
    subtitle: strings.filters.weekendOnlySub,
  },
];

const AREA_LABELS = [
  strings.filters.areaApo,
  strings.filters.areaCentral,
  strings.filters.areaGwarinpa,
];

/** "5000" → "5,000", for the two price inputs. */
function formatNaira(value: number): string {
  return value.toLocaleString('en-US');
}

/** "₦5,000" → 5000; null when the field holds no digits. */
function parseNaira(text: string): number | null {
  const digits = text.replace(/[^\d]/g, '');
  if (digits.length === 0) return null;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : null;
}

interface Draft {
  distanceKm: number;
  distanceKey: string;
  priceKey: string;
  minPriceText: string;
  maxPriceText: string;
  discountKey: string;
  categories: string[];
  availability: string[];
}

/**
 * Full screen from vemtap_deal_filters/code.html (sticky footer + close = page, not sheet).
 *
 * The page used to keep every selection in local state and its Apply button only
 * closed the screen, so nothing the user chose reached the feed — the "34" in
 * its summary was a constant. Selections now live in `dealsFilterStore`, which
 * `usePublicOffersFeed` reads, so Apply changes what Home and Deals show and the
 * counts are the feed's own answer.
 *
 * Radius is the one exception: it is written to `locationStore`, because the
 * navbar pill and the feed already read it from there.
 */
export function DealFiltersScreen() {
  const navigation = useNavigation<Nav>();
  const filters = useDealsFilterStore();
  const radiusKm = useLocationStore(state => state.radiusKm);
  const { options: categoryOptions, isLoading: categoriesLoading } =
    useFilterCategories();
  // The same query Home runs, so the count is cached rather than re-requested.
  const { offers } = usePublicOffersFeed();

  const [draft, setDraft] = useState<Draft>(() => ({
    distanceKm: radiusKm,
    distanceKey: 'near',
    priceKey: filters.minPrice === null && filters.maxPrice === null ? 'any' : 'custom',
    minPriceText: filters.minPrice === null ? '' : formatNaira(filters.minPrice),
    maxPriceText: filters.maxPrice === null ? '' : formatNaira(filters.maxPrice),
    discountKey:
      filters.minDiscountPercent === null ? 'any' : String(filters.minDiscountPercent),
    categories: filters.categoryNames,
    availability: filters.availability,
  }));

  const close = useCallback(() => navigation.goBack(), [navigation]);

  const onDistanceChip = useCallback((key: string, km: number) => {
    setDraft(prev => ({ ...prev, distanceKey: key, distanceKm: km }));
  }, []);

  const onPriceChip = useCallback((key: string) => {
    const range = PRICE_RANGES[key];
    setDraft(prev => ({
      ...prev,
      priceKey: key,
      minPriceText: range.min === null ? prev.minPriceText : formatNaira(range.min),
      maxPriceText: range.max === null ? prev.maxPriceText : formatNaira(range.max),
    }));
  }, []);

  const onPriceText = useCallback(
    (field: 'minPriceText' | 'maxPriceText') => (text: string) => {
      setDraft(prev => ({ ...prev, priceKey: 'custom', [field]: text }));
    },
    [],
  );

  const toggleCategory = useCallback((name: string) => {
    setDraft(prev => ({
      ...prev,
      categories: prev.categories.includes(name)
        ? prev.categories.filter(category => category !== name)
        : [...prev.categories, name],
    }));
  }, []);

  const toggleAvailability = useCallback((key: string) => {
    setDraft(prev => ({
      ...prev,
      availability: prev.availability.includes(key)
        ? prev.availability.filter(item => item !== key)
        : [...prev.availability, key],
    }));
  }, []);

  const activeCount = useMemo(() => {
    let n = draft.categories.length;
    if (draft.priceKey !== 'any') n += 1;
    if (draft.discountKey !== 'any') n += 1;
    n += draft.availability.length;
    if (draft.distanceKey !== 'near') n += 1;
    return n;
  }, [draft]);

  const apply = useCallback(() => {
    const range = PRICE_RANGES[draft.priceKey];
    filters.setCategories(draft.categories);
    filters.setPriceRange(
      draft.priceKey === 'custom' ? parseNaira(draft.minPriceText) : range.min,
      draft.priceKey === 'custom' ? parseNaira(draft.maxPriceText) : range.max,
    );
    filters.setMinDiscount(DISCOUNT_MIN[draft.discountKey] ?? null);
    filters.setAvailability(draft.availability);
    useLocationStore.getState().setRadiusKm(draft.distanceKm);
    navigation.goBack();
  }, [draft, filters, navigation]);

  const reset = useCallback(() => {
    filters.reset();
    useLocationStore.getState().setRadiusKm(DEFAULT_RADIUS_KM);
    setDraft({
      distanceKm: DEFAULT_RADIUS_KM,
      distanceKey: 'near',
      priceKey: 'any',
      minPriceText: '',
      maxPriceText: '',
      discountKey: 'any',
      categories: [],
      availability: [],
    });
  }, [filters]);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
      <View
        style={navbarBottomShadow}
        className="h-14 flex-row items-center justify-between bg-surface px-4"
      >
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.common.cancel}
            hitSlop={8}
            className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-container-high"
            onPress={close}
          >
            <Icon name="close" size={24} color={colors.surfaceDark} />
          </Pressable>
          <VemtapText
            accessibilityRole="header"
            variant="headingSm"
            className="tracking-tight text-on-surface"
          >
            {strings.filters.title}
          </VemtapText>
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.filters.reset}
            hitSlop={8}
            className="h-11 items-center justify-center px-3 active:opacity-80"
            onPress={reset}
          >
            <VemtapText className="font-sans-semibold text-button-md text-primary">
              {strings.filters.reset}
            </VemtapText>
          </Pressable>
          <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Icon name="person" size={18} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerClassName="gap-5 px-6 pb-36 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between rounded-xl bg-surface-tint-blue p-3 shadow-sm">
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-primary-container/15">
              <Icon name="tune" size={18} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText className="text-text-primary font-sans-semibold text-label-md">
                {strings.filters.activeSummary(activeCount)}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {strings.filters.matchingPromos(offers.length)}
              </VemtapText>
            </View>
          </View>
          <View className="shrink-0 rounded-full bg-badge-discount-bg px-2 py-0.5">
            <VemtapText className="font-sans-semibold text-label-sm text-badge-discount-text">
              {strings.filters.active}
            </VemtapText>
          </View>
        </View>

        <FilterSection
          title={strings.filters.distance}
          subtitle={strings.filters.distanceSubtitle}
          value={strings.filters.withinKm(draft.distanceKm)}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-6"
            contentContainerClassName="gap-2 px-6"
          >
            {DISTANCE_CHIPS.map(chip => (
              <FilterChip
                key={chip.key}
                label={chip.label}
                selected={draft.distanceKey === chip.key}
                showCheck={chip.check === true}
                onPress={() => onDistanceChip(chip.key, chip.km)}
              />
            ))}
          </ScrollView>

          <View className="mt-1 flex-col gap-2 rounded-xl bg-surface-canvas p-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <VemtapText variant="caption" tone="secondary">
                {strings.filters.minKm(1)}
              </VemtapText>
              <View className="flex-row items-center gap-1 rounded-full bg-primary-container px-2 py-0.5 shadow-sm">
                <Icon name="nearMe" size={14} color="#FFFFFF" />
                <VemtapText className="font-sans-semibold text-label-sm text-primary-foreground">
                  {strings.filters.withinKm(draft.distanceKm)}
                </VemtapText>
              </View>
              <VemtapText variant="caption" tone="secondary">
                {strings.filters.maxKm(25)}
              </VemtapText>
            </View>
            <RangeSlider
              value={draft.distanceKm}
              min={1}
              max={25}
              ticks={AREA_LABELS}
              formatTick={() => ''}
              accessibilityLabel={strings.filters.distance}
              onChange={km => {
                setDraft(prev => ({ ...prev, distanceKm: km, distanceKey: 'custom' }));
              }}
            />
            <View className="flex-row items-center justify-between">
              {AREA_LABELS.map(area => (
                <VemtapText
                  key={area}
                  className="font-sans text-caption text-text-tertiary"
                >
                  {area}
                </VemtapText>
              ))}
            </View>
          </View>
        </FilterSection>

        <FilterSection
          title={strings.filters.category}
          subtitle={strings.filters.categorySubtitle}
          meta={strings.filters.selectedCount(draft.categories.length)}
        >
          {categoriesLoading ? (
            <LoadingState label={strings.common.loading} />
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {categoryOptions.map(option => {
                const selected = draft.categories.includes(option.name);
                return (
                  <FilterChip
                    key={option.name}
                    label={option.name}
                    size="md"
                    selected={selected}
                    showCheck
                    leadingIcon={
                      <Icon
                        name={option.icon}
                        size={16}
                        color={selected ? '#FFFFFF' : colors.textTertiary}
                      />
                    }
                    onPress={() => toggleCategory(option.name)}
                  />
                );
              })}
            </View>
          )}
        </FilterSection>

        <FilterSection
          title={strings.filters.priceRange}
          subtitle={strings.filters.priceSubtitle}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-6"
            contentContainerClassName="gap-2 px-6"
          >
            {PRICE_CHIPS.map(chip => (
              <FilterChip
                key={chip.key}
                label={chip.label}
                selected={draft.priceKey === chip.key}
                onPress={() => onPriceChip(chip.key)}
              />
            ))}
          </ScrollView>
          <View className="mt-1 flex-row gap-3">
            <View className="min-w-0 flex-1 flex-col gap-1 rounded-xl bg-surface-canvas p-3 shadow-sm">
              <VemtapText variant="caption" tone="tertiary" className="font-sans-medium">
                {strings.filters.minimum}
              </VemtapText>
              <View className="flex-row items-center gap-1">
                <VemtapText className="font-sans-semibold text-label-md text-text-tertiary">
                  ₦
                </VemtapText>
                <TextInput
                  accessibilityLabel={strings.filters.minimum}
                  value={draft.minPriceText}
                  onChangeText={onPriceText('minPriceText')}
                  keyboardType="numbers-and-punctuation"
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                  className="text-text-primary min-w-0 flex-1 bg-transparent p-0 font-sans-semibold text-label-md"
                />
              </View>
            </View>
            <View className="min-w-0 flex-1 flex-col gap-1 rounded-xl bg-surface-canvas p-3 shadow-sm">
              <VemtapText variant="caption" tone="tertiary" className="font-sans-medium">
                {strings.filters.maximum}
              </VemtapText>
              <View className="flex-row items-center gap-1">
                <VemtapText className="font-sans-semibold text-label-md text-text-tertiary">
                  ₦
                </VemtapText>
                <TextInput
                  accessibilityLabel={strings.filters.maximum}
                  value={draft.maxPriceText}
                  onChangeText={onPriceText('maxPriceText')}
                  keyboardType="numbers-and-punctuation"
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                  className="text-text-primary min-w-0 flex-1 bg-transparent p-0 font-sans-semibold text-label-md"
                />
              </View>
            </View>
          </View>
        </FilterSection>

        <FilterSection
          title={strings.filters.discount}
          subtitle={strings.filters.discountSubtitle}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-6"
            contentContainerClassName="gap-2 px-6"
          >
            {DISCOUNT_CHIPS.map(chip => (
              <FilterChip
                key={chip.key}
                label={chip.label}
                selected={draft.discountKey === chip.key}
                showCheck={chip.check === true}
                tone={
                  chip.hot === true && draft.discountKey !== chip.key ? 'hot' : 'default'
                }
                onPress={() => setDraft(prev => ({ ...prev, discountKey: chip.key }))}
              />
            ))}
          </ScrollView>
        </FilterSection>

        <FilterSection
          title={strings.filters.availability}
          subtitle={strings.filters.availabilitySubtitle}
        >
          <View className="flex-col gap-2">
            {AVAILABILITY.map(row => (
              <AvailabilityRow
                key={row.key}
                icon={row.icon}
                title={row.title}
                subtitle={row.subtitle}
                selected={draft.availability.includes(row.key)}
                onToggle={() => toggleAvailability(row.key)}
              />
            ))}
          </View>
        </FilterSection>

        <View className="flex-row items-center gap-3 rounded-xl bg-surface-container-low p-4">
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container">
            <Icon name="verifiedUser" size={20} color="#FFFFFF" />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText className="text-text-primary font-sans-semibold text-label-md">
              {strings.filters.redeemTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary">
              {strings.filters.redeemBody}
            </VemtapText>
          </View>
        </View>
      </ScrollView>

      <View className="absolute inset-x-0 bottom-0 flex-col items-center gap-1 bg-surface-canvas/95 px-6 pb-6 pt-4">
        <Button
          label={strings.filters.showDeals(offers.length)}
          rightIcon={<Icon name="arrowForward" size={20} color="#FFFFFF" />}
          className={cn('h-[54px] rounded-xl shadow-md')}
          onPress={apply}
        />
        <View className="flex-row items-center gap-1 pt-1">
          <Icon name="locationOn" size={14} color={colors.textTertiary} />
          <VemtapText className="font-sans text-caption text-text-tertiary">
            {strings.filters.showingNear(strings.deals.location)}
          </VemtapText>
        </View>
      </View>
    </SafeAreaView>
  );
}
