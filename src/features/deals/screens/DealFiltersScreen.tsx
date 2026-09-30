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
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';
import { strings } from '@constants/strings';
import type { AppStackParamList } from '@navigation/types';
import { dealsFilterCategories } from '@features/deals/data/dealsFeed';
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
  { key: 'near', label: strings.filters.nearMe, km: 5, check: true },
  { key: '1', label: strings.filters.oneKm, km: 1 },
  { key: '5', label: strings.filters.fiveKm, km: 5 },
  { key: '10', label: strings.filters.tenKm, km: 10 },
  { key: 'custom', label: strings.filters.custom, km: 8 },
];

const PRICE_CHIPS: { key: string; label: string }[] = [
  { key: 'any', label: strings.filters.anyPrice },
  { key: 'u5', label: strings.filters.under5k },
  { key: '5-20', label: strings.filters.range5to20 },
  { key: '20-50', label: strings.filters.range20to50 },
  { key: '50+', label: strings.filters.over50k },
  { key: 'custom', label: strings.filters.custom },
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

/** Full screen from vemtap_deal_filters/code.html (sticky footer + close = page, not sheet). */
export function DealFiltersScreen() {
  const navigation = useNavigation<Nav>();

  const [distanceKm, setDistanceKm] = useState(8);
  const [distanceKey, setDistanceKey] = useState<string>('near');
  const [priceKey, setPriceKey] = useState<string>('5-20');
  const [discountKey, setDiscountKey] = useState<string>('20');
  const [minPrice, setMinPrice] = useState('5,000');
  const [maxPrice, setMaxPrice] = useState('20,000');
  const [categories, setCategories] = useState<string[]>([
    strings.filters.foodDrinks,
    strings.filters.beautySpa,
  ]);
  const [availability, setAvailability] = useState<string[]>(['now']);

  const activeCount = useMemo(() => {
    let n = categories.length;
    if (priceKey !== 'any') n += 1;
    if (discountKey !== 'any') n += 1;
    n += availability.length;
    if (distanceKey !== 'near') n += 1;
    return n;
  }, [availability, categories, discountKey, distanceKey, priceKey]);

  const close = useCallback(() => navigation.goBack(), [navigation]);

  const onDistanceChip = useCallback((key: string, km: number) => {
    setDistanceKey(key);
    setDistanceKm(km);
  }, []);

  const toggleCategory = useCallback((label: string) => {
    setCategories(prev =>
      prev.includes(label) ? prev.filter(c => c !== label) : [...prev, label],
    );
  }, []);

  const toggleAvailability = useCallback((key: string) => {
    setAvailability(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    );
  }, []);

  const reset = useCallback(() => {
    setDistanceKey('near');
    setDistanceKm(8);
    setPriceKey('5-20');
    setDiscountKey('20');
    setMinPrice('5,000');
    setMaxPrice('20,000');
    setCategories([strings.filters.foodDrinks, strings.filters.beautySpa]);
    setAvailability(['now']);
  }, []);

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
                {strings.filters.matchingPromos(34)}
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
          value={strings.filters.withinKm(distanceKm)}
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
                selected={distanceKey === chip.key}
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
                  {strings.filters.withinKm(distanceKm)}
                </VemtapText>
              </View>
              <VemtapText variant="caption" tone="secondary">
                {strings.filters.maxKm(25)}
              </VemtapText>
            </View>
            <RangeSlider
              value={distanceKm}
              min={1}
              max={25}
              ticks={AREA_LABELS}
              formatTick={() => ''}
              accessibilityLabel={strings.filters.distance}
              onChange={km => {
                setDistanceKm(km);
                setDistanceKey('custom');
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
          meta={strings.filters.selectedCount(categories.length)}
        >
          <View className="flex-row flex-wrap gap-2">
            {dealsFilterCategories.map(cat => (
              <FilterChip
                key={cat.label}
                label={cat.label}
                size="md"
                selected={categories.includes(cat.label)}
                showCheck
                leadingIcon={
                  <Icon
                    name={cat.icon}
                    size={16}
                    color={
                      categories.includes(cat.label) ? '#FFFFFF' : colors.textTertiary
                    }
                  />
                }
                onPress={() => toggleCategory(cat.label)}
              />
            ))}
          </View>
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
                selected={priceKey === chip.key}
                onPress={() => setPriceKey(chip.key)}
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
                  value={minPrice}
                  onChangeText={setMinPrice}
                  keyboardType="numbers-and-punctuation"
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
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  keyboardType="numbers-and-punctuation"
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
                selected={discountKey === chip.key}
                showCheck={chip.check === true}
                tone={chip.hot === true && discountKey !== chip.key ? 'hot' : 'default'}
                onPress={() => setDiscountKey(chip.key)}
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
                selected={availability.includes(row.key)}
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
          label={strings.filters.showDeals(34)}
          rightIcon={<Icon name="arrowForward" size={20} color="#FFFFFF" />}
          className={cn('h-[54px] rounded-xl shadow-md')}
          onPress={close}
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
