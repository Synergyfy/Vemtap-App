import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { DetailActionDockBar } from '@components/discover/DetailActionDockBar';
import { ProfilePageHeader } from '@components/discover/ProfilePageHeader';
import { ServiceCard } from '@components/discover/ServiceCard';
import { CategoryChips } from '@components/home/CategoryChips';
import { HomeSearchBar } from '@components/home/HomeSearchBar';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  formatGlowDuration,
  formatGlowNaira,
  glowServices,
  type GlowServiceCategory,
} from '@features/discover/data/glowSerenityData';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

export interface GlowSerenityServicesProps {
  onBack: () => void;
  onOpenService?: (serviceId: string) => void;
  onContinueToBook?: (serviceId: string) => void;
}

const categoryMap: Record<string, GlowServiceCategory | undefined> = {
  [strings.glowServices.categories[1]]: 'Hair Styling & Grooming',
  [strings.glowServices.categories[2]]: 'Facials & Aesthetic Skin Care',
  [strings.glowServices.categories[3]]: 'Therapeutic Massage & Wellness',
  [strings.glowServices.categories[4]]: 'Nail Care & Spa Pedicure',
};

const sectionOrder: readonly GlowServiceCategory[] = [
  'Hair Styling & Grooming',
  'Facials & Aesthetic Skin Care',
  'Therapeutic Massage & Wellness',
  'Nail Care & Spa Pedicure',
];

const sectionServiceCounts: Record<GlowServiceCategory, number> = {
  'Hair Styling & Grooming': strings.glowServices.sectionServiceCounts.hair,
  'Facials & Aesthetic Skin Care': strings.glowServices.sectionServiceCounts.facials,
  'Therapeutic Massage & Wellness': strings.glowServices.sectionServiceCounts.massage,
  'Nail Care & Spa Pedicure': strings.glowServices.sectionServiceCounts.nails,
};

export function GlowSerenityServicesScreen({
  onBack,
  onOpenService,
  onContinueToBook,
}: GlowSerenityServicesProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>(strings.glowServices.categories[0]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(['silk-press', 'gel-manicure']),
  );

  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const selectedCategory = categoryMap[category];
    return glowServices.filter(
      service =>
        (!selectedCategory || service.category === selectedCategory) &&
        (!normalizedQuery ||
          [service.name, service.description].some(value =>
            value.toLocaleLowerCase().includes(normalizedQuery),
          )),
    );
  }, [category, query]);

  const sections = useMemo(
    () =>
      sectionOrder
        .map(name => ({
          name,
          services: filteredServices.filter(service => service.category === name),
        }))
        .filter(section => section.services.length > 0),
    [filteredServices],
  );

  const selectedServices = glowServices.filter(service => selectedIds.has(service.id));
  const selectedTotal = selectedServices.reduce(
    (total, service) => total + service.price,
    0,
  );
  const selectedDuration = selectedServices.reduce(
    (total, service) => total + service.duration,
    0,
  );

  const toggleSelected = (serviceId: string) => {
    setSelectedIds(current => {
      const next = new Set(current);
      if (next.has(serviceId)) next.delete(serviceId);
      else next.add(serviceId);
      return next;
    });
  };

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-surface-canvas">
      <ProfilePageHeader
        title={strings.glowServices.screenTitle}
        onBack={onBack}
        right={
          <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Icon name="person" size={18} color={colors.surface} />
          </View>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="w-full max-w-screen self-center pb-40"
      >
        <View className="flex-row items-center justify-between gap-3 bg-surface-canvas px-6 py-3 shadow-sm">
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold text-text"
              numberOfLines={1}
            >
              {strings.glowServices.merchantName} • {strings.glowServices.area}
            </VemtapText>
            <View className="mt-1 flex-row items-center gap-2">
              <View className="flex-row items-center gap-1 rounded-full bg-badge-discount-bg px-2 py-0.5">
                <View className="h-1.5 w-1.5 rounded-full bg-badge-discount-text" />
                <VemtapText variant="labelSm" className="text-badge-discount-text">
                  {strings.glowServices.openNow}
                </VemtapText>
              </View>
              <View className="flex-row items-center gap-1">
                <Icon name="star" size={15} color={colors.tertiary} />
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold text-tertiary-container"
                >
                  {strings.glowServices.rating}
                </VemtapText>
                <VemtapText variant="labelSm" tone="tertiary">
                  {strings.glowServices.reviewCount}
                </VemtapText>
              </View>
            </View>
          </View>
          <View className="shrink-0 flex-row items-center gap-1 rounded-full bg-surface-tint px-3 py-1.5 shadow-sm">
            <Icon name="spa" size={18} color={colors.primary} />
            <VemtapText variant="labelMd" tone="brand" className="font-sans-semibold">
              {strings.glowServices.selectedCount(selectedIds.size)}
            </VemtapText>
          </View>
        </View>

        <View className="gap-3 bg-surface-canvas px-6 py-3 shadow-sm">
          <View className="flex-row items-center gap-2">
            <View className="min-w-0 flex-1">
              <HomeSearchBar
                value={query}
                onChangeText={setQuery}
                showFilter
                filterLabel={strings.glowServices.filterCatalogue}
                placeholder={strings.glowServices.searchPlaceholder}
              />
            </View>
            <View className="shrink-0 flex-row items-center rounded-xl bg-surface-container-low p-1 shadow-sm">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={strings.glowServices.listView}
                className="h-9 w-9 items-center justify-center rounded-lg bg-surface-canvas shadow-sm"
              >
                <Icon name="listView" size={20} color={colors.primary} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={strings.glowServices.gridView}
                className="h-9 w-9 items-center justify-center rounded-lg"
              >
                <Icon name="gridView" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>
          <CategoryChips
            categories={strings.glowServices.categories}
            activeCategory={category}
            onChangeCategory={setCategory}
          />
        </View>

        <View className="px-6 pt-5">
          <View className="flex-row items-center justify-between gap-3 rounded-2xl border border-border bg-surface-tint p-3 shadow-md">
            <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
              <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-canvas">
                <Icon name="localOffer" size={22} color={colors.primary} />
              </View>
              <View className="min-w-0">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold text-text"
                  numberOfLines={1}
                >
                  {strings.glowServices.activeDeals}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {strings.glowServices.activeDealsCopy}
                </VemtapText>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              className="shrink-0 rounded-lg px-2 py-1.5"
            >
              <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
                {strings.glowServices.viewDeals}
              </VemtapText>
            </Pressable>
          </View>
        </View>

        <View className="gap-7 px-6 pt-5">
          {sections.map(section => (
            <View key={section.name} className="gap-3">
              <View className="flex-row items-center justify-between gap-2">
                <VemtapText
                  variant="headingSm"
                  className="min-w-0 flex-1 text-heading-sm text-text"
                >
                  {section.name}
                </VemtapText>
                <VemtapText variant="caption" tone="tertiary">
                  {strings.glowServices.sectionCount(sectionServiceCounts[section.name])}
                </VemtapText>
              </View>
              {section.services.map(service => (
                <View key={service.id} className="flex-row items-start gap-3">
                  <View className="min-w-0 flex-1">
                    <ServiceCard
                      service={service}
                      selected={selectedIds.has(service.id)}
                      onPress={() => onOpenService?.(service.id)}
                      onAction={() => toggleSelected(service.id)}
                    />
                  </View>
                </View>
              ))}
            </View>
          ))}
          {sections.length === 0 ? (
            <View className="items-center gap-2 py-12">
              <Icon name="search" size={24} color={colors.textTertiary} />
              <VemtapText variant="bodyMd" tone="secondary" className="text-center">
                {strings.glowServices.noResults}
              </VemtapText>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <DetailActionDockBar
        eyebrow={strings.glowServices.servicesSelected(selectedIds.size)}
        value={strings.glowServices.selectionMeta(
          formatGlowNaira(selectedTotal),
          formatGlowDuration(selectedDuration),
        )}
        action={strings.glowServices.continueToBook}
        icon={<Icon name="shoppingBag" size={20} color={colors.surface} />}
        onAction={() => {
          const firstSelected = selectedServices[0];
          if (firstSelected) onContinueToBook?.(firstSelected.id);
        }}
      />
    </SafeAreaView>
  );
}
