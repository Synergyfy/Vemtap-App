import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { DetailActionDockBar } from '@components/discover/DetailActionDockBar';
import { ProductGridCard } from '@components/discover/ProductGridCard';
import { ProfilePageHeader } from '@components/discover/ProfilePageHeader';
import { CategoryChips } from '@components/home/CategoryChips';
import { HomeSearchBar } from '@components/home/HomeSearchBar';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { TwoColumnGrid } from '@components/shared/TwoColumnGrid';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  formatNaira,
  urbanProducts,
  type UrbanProduct,
} from '@features/discover/data/urbanGrillData';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

export interface UrbanGrillProductsCatalogueProps {
  onBack: () => void;
  onOpenProduct?: (productId: string) => void;
  onCheckout?: () => void;
}

const categoryMap: Record<number, UrbanProduct['category'] | 'none'> = {
  1: 'grill',
  2: 'burgers',
  3: 'fusion',
  4: 'drinks',
  5: 'none',
};

export function UrbanGrillProductsCatalogueScreen({
  onBack,
  onOpenProduct,
  onCheckout,
}: UrbanGrillProductsCatalogueProps) {
  const [query, setQuery] = useState('');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [, setCart] = useState<Record<string, number>>({});
  const [count, setCount] = useState(2);
  const [total, setTotal] = useState(20500);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return urbanProducts.filter(
      product =>
        (categoryMap[categoryIndex] === undefined ||
          categoryMap[categoryIndex] === 'none' ||
          product.category === categoryMap[categoryIndex]) &&
        (!normalized ||
          [product.name, product.description].some(value =>
            value.toLocaleLowerCase().includes(normalized),
          )),
    );
  }, [categoryIndex, query]);
  const add = (productId: string) => {
    const product = urbanProducts.find(item => item.id === productId);
    if (!product) return;
    setCart(current => ({ ...current, [productId]: (current[productId] ?? 0) + 1 }));
    setCount(current => current + 1);
    setTotal(current => current + product.price);
  };
  return (
    <SafeAreaView edges={[]} className="flex-1 bg-surface-canvas">
      <ProfilePageHeader
        title={strings.urbanProducts.merchantDetails}
        onBack={onBack}
        right={
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.urbanProducts.share}
              className="h-11 w-11 items-center justify-center"
            >
              <Icon name="share" size={21} color={colors.textSecondary} />
            </Pressable>
            <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Icon name="person" size={18} color={colors.surface} />
            </View>
          </>
        }
      />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="w-full max-w-screen flex-grow-0 self-center pb-3"
      >
        <View className="flex-row items-center justify-between gap-3 bg-surface-canvas px-6 py-2 shadow-sm">
          <View className="min-w-0">
            <View className="flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-badge-discount-text" />
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold text-badge-discount-text"
              >
                {strings.urbanProducts.kitchenOpen}
              </VemtapText>
            </View>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {strings.urbanProducts.fullCatalogue}
            </VemtapText>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.urbanProducts.toggleGrid}
              className="h-9 w-9 items-center justify-center rounded-full bg-surface-muted"
            >
              <Icon name="gridView" size={20} color={colors.textSecondary} />
            </Pressable>
            <View className="relative h-9 w-9 items-center justify-center rounded-full bg-surface-tint">
              <Icon name="shoppingBag" size={20} color={colors.primary} />
              <View className="absolute -right-1 -top-1 min-w-[18px] items-center justify-center rounded-full bg-primary px-1">
                <VemtapText className="font-sans-bold text-micro text-primary-foreground">
                  {count}
                </VemtapText>
              </View>
            </View>
          </View>
        </View>
        <View className="gap-2 bg-surface-canvas px-6 py-3 shadow-sm">
          <HomeSearchBar
            variant="outlined"
            value={query}
            onChangeText={setQuery}
            showFilter={false}
            placeholder={strings.urbanProducts.search}
          />
          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-row gap-2">
              <Pressable
                accessibilityRole="button"
                className="h-8 flex-row items-center gap-1.5 rounded-full bg-surface-muted px-3"
              >
                <Icon name="tune" size={16} color={colors.textSecondary} />
                <VemtapText variant="labelSm" className="font-sans-semibold text-text">
                  {strings.urbanProducts.filters}
                </VemtapText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                className="h-8 flex-row items-center gap-1 rounded-full bg-surface-muted px-3"
              >
                <VemtapText variant="labelSm" className="text-text">
                  {strings.urbanProducts.popular}
                </VemtapText>
                <Icon name="expandMore" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>
            <VemtapText variant="caption" tone="secondary">
              {strings.urbanProducts.showing(filtered.length)}
            </VemtapText>
          </View>
          <CategoryChips
            categories={strings.urbanProducts.categories}
            activeCategory={strings.urbanProducts.categories[categoryIndex]}
            onChangeCategory={value =>
              setCategoryIndex(
                strings.urbanProducts.categories.indexOf(
                  value as (typeof strings.urbanProducts.categories)[number],
                ),
              )
            }
          />
        </View>
        <View className="mt-3 gap-2 px-6">
          <View className="flex-row items-center justify-between gap-2 rounded-2xl border border-border bg-tertiary-container p-3 shadow-md">
            <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
              <View className="h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-canvas/20">
                <Icon name="fire" size={20} color={colors.surface} />
              </View>
              <View className="min-w-0">
                <View className="flex-row flex-wrap items-center gap-1.5">
                  <VemtapText variant="labelSm" className="font-sans-bold text-surface">
                    {strings.urbanProducts.voucherTitle}
                  </VemtapText>
                  <View className="rounded bg-surface-canvas px-1.5 py-0.5">
                    <VemtapText className="font-sans-bold text-micro text-tertiary-container">
                      {strings.urbanProducts.autoApply}
                    </VemtapText>
                  </View>
                </View>
                <VemtapText variant="caption" className="text-surface" numberOfLines={1}>
                  {strings.urbanProducts.voucherCopy}
                </VemtapText>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              className="shrink-0 rounded-xl bg-surface-canvas px-3 py-1.5 shadow-sm"
            >
              <VemtapText
                variant="labelSm"
                className="font-sans-bold text-tertiary-container"
              >
                {strings.urbanProducts.claimed}
              </VemtapText>
            </Pressable>
          </View>
          <View className="flex-row items-center justify-between gap-2 rounded-lg bg-surface-tint px-2.5 py-1">
            <View className="min-w-0 flex-row items-center gap-1.5">
              <Icon name="bolt" size={16} color={colors.primary} />
              <VemtapText
                variant="caption"
                tone="brand"
                className="truncate font-sans-medium"
              >
                {strings.urbanProducts.prepTime}
              </VemtapText>
            </View>
            <VemtapText variant="caption" tone="secondary">
              {strings.urbanProducts.expressDelivery}
            </VemtapText>
          </View>
        </View>
        <View className="mt-3 px-6">
          <TwoColumnGrid
            items={filtered}
            keyExtractor={item => item.id}
            renderItem={item => (
              <ProductGridCard product={item} onAdd={add} onOpen={onOpenProduct} />
            )}
          />
        </View>
        <View className="items-center gap-1 px-6 pb-4 pt-8">
          <View className="mb-1 h-10 w-10 items-center justify-center rounded-full bg-surface-muted">
            <Icon name="restaurant" size={22} color={colors.textTertiary} />
          </View>
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-text-secondary"
          >
            {strings.urbanProducts.endTitle}
          </VemtapText>
          <VemtapText variant="caption" tone="tertiary" className="text-center">
            {strings.urbanProducts.endCopy}
          </VemtapText>
        </View>
      </ScrollView>
      <DetailActionDockBar
        eyebrow={`${strings.urbanProducts.yourOrder} • ${strings.urbanProducts.itemCount(count)}`}
        value={formatNaira(total)}
        action={strings.urbanProducts.checkout}
        icon={<Icon name="shoppingBag" size={20} color={colors.surface} />}
        onAction={onCheckout ?? (() => undefined)}
      />
    </SafeAreaView>
  );
}
