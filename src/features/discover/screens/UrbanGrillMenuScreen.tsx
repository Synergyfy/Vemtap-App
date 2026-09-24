import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { DetailActionDockBar } from '@components/discover/DetailActionDockBar';
import { ProductListCard } from '@components/discover/ProductListCard';
import { ProfilePageHeader } from '@components/discover/ProfilePageHeader';
import { CategoryChips } from '@components/home/CategoryChips';
import { HomeSearchBar } from '@components/home/HomeSearchBar';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  formatNaira,
  urbanProducts,
  type UrbanCategory,
} from '@features/discover/data/urbanGrillData';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

export interface UrbanGrillMenuProps {
  onBack: () => void;
  onOpenAllDeals: () => void;
}

const categories: readonly (UrbanCategory | 'all')[] = [
  'all',
  'grill',
  'burgers',
  'fusion',
  'drinks',
];
const sectionCategories: UrbanCategory[] = ['grill', 'burgers', 'fusion', 'drinks'];
const badgeByProduct: Record<string, string> = {
  ribeye: strings.urbanMenu.badges[0],
  'wagyu-burger': strings.urbanMenu.badges[3],
  suya: strings.urbanMenu.badges[2],
  jollof: strings.urbanMenu.badges[4],
  zobo: strings.urbanMenu.badges[5],
};

export function UrbanGrillMenuScreen({ onBack, onOpenAllDeals }: UrbanGrillMenuProps) {
  const [query, setQuery] = useState('');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [count, setCount] = useState(2);
  const [total, setTotal] = useState(20500);
  const activeCategory = categories[categoryIndex];
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return urbanProducts.filter(
      product =>
        (activeCategory === 'all' || product.category === activeCategory) &&
        (!normalized ||
          [product.name, product.menuName, product.description].some(value =>
            value?.toLocaleLowerCase().includes(normalized),
          )),
    );
  }, [activeCategory, query]);
  const add = (productId: string) => {
    const product = urbanProducts.find(item => item.id === productId);
    if (!product) return;
    setCount(current => current + 1);
    setTotal(current => current + product.price);
  };
  return (
    <SafeAreaView edges={[]} className="flex-1 bg-surface">
      <ProfilePageHeader
        title={strings.urbanMenu.title}
        onBack={onBack}
        right={
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.urbanMenu.bookmark}
              className="h-10 w-10 items-center justify-center"
            >
              <Icon name="bookmark" size={21} color={colors.text} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.urbanMenu.bag}
              className="h-10 w-10 items-center justify-center"
            >
              <Icon name="shoppingBag" size={21} color={colors.text} />
            </Pressable>
            <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Icon name="person" size={18} color={colors.surface} />
            </View>
          </>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="w-full max-w-screen self-center pb-3"
      >
        <View className="gap-2 px-6 py-3">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-row items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5">
              <View className="h-2 w-2 shrink-0 rounded-full bg-badge-discount-text" />
              <VemtapText variant="labelSm" tone="secondary" className="truncate">
                {strings.urbanMenu.location}
              </VemtapText>
              <VemtapText variant="caption" tone="tertiary">
                •
              </VemtapText>
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold text-badge-discount-text"
              >
                {strings.urbanMenu.openNow}
              </VemtapText>
            </View>
            <View className="shrink-0 flex-row items-center gap-1 rounded-full bg-surface-container-highest px-3 py-1.5">
              <Icon name="star" size={15} color={colors.tertiary} />
              <VemtapText variant="labelSm" className="font-sans-semibold text-text">
                {strings.urbanMenu.rating}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {strings.urbanMenu.reviews}
              </VemtapText>
            </View>
          </View>
          <HomeSearchBar
            value={query}
            onChangeText={setQuery}
            filterLabel={strings.urbanMenu.filter}
            placeholder={strings.urbanMenu.searchPlaceholder}
          />
        </View>
        <View className="flex-row items-center justify-between px-6 py-1">
          <VemtapText variant="labelSm" tone="secondary" className="font-sans-medium">
            {strings.urbanMenu.browseLayout}
          </VemtapText>
          <View className="flex-row items-center gap-1 rounded-lg border border-border bg-surface-container-low p-0.5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.urbanMenu.listView}
              className="h-8 w-8 items-center justify-center rounded-md bg-surface-canvas shadow-sm"
            >
              <Icon name="listView" size={18} color={colors.primary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.urbanMenu.gridView}
              className="h-8 w-8 items-center justify-center rounded-md"
            >
              <Icon name="gridView" size={18} color={colors.textTertiary} />
            </Pressable>
          </View>
        </View>
        <CategoryChips
          categories={[strings.urbanMenu.all(28), ...strings.urbanMenu.categories]}
          activeCategory={strings.urbanMenu.all(28)}
          onChangeCategory={value =>
            setCategoryIndex(
              value === strings.urbanMenu.all(28)
                ? 0
                : strings.urbanMenu.categories.indexOf(
                    value as (typeof strings.urbanMenu.categories)[number],
                  ) + 1,
            )
          }
        />
        <View className="mx-6 mt-2 flex-row items-center justify-between gap-2 rounded-xl border border-border bg-primary-fixed p-3 shadow-md">
          <View className="min-w-0 flex-row items-center gap-2">
            <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary">
              <Icon name="localActivity" size={20} color={colors.surface} />
            </View>
            <View className="min-w-0">
              <VemtapText variant="headingSm" className="text-on-primary-fixed truncate">
                {strings.urbanMenu.activeDeals}
              </VemtapText>
              <VemtapText variant="caption" className="truncate text-secondary">
                {strings.urbanMenu.activeDealsCopy}
              </VemtapText>
            </View>
          </View>
          <Button
            label={strings.urbanMenu.viewDeals}
            variant="secondary"
            size="sm"
            fullWidth={false}
            className="min-h-9 max-w-[120px] shrink-0 rounded-lg px-2.5"
            labelClassName="text-label-sm"
            rightIcon={<Icon name="arrowForward" size={16} color={colors.primary} />}
            onPress={onOpenAllDeals}
          />
        </View>
        <View className="gap-6 px-6 pt-3">
          {sectionCategories.map(category => {
            const items = filtered.filter(product => product.category === category);
            if (items.length === 0) return null;
            return (
              <View key={category} className="gap-3">
                <View className="flex-row items-center justify-between gap-2">
                  <View className="min-w-0 flex-1 flex-row items-center gap-2">
                    <VemtapText
                      accessibilityRole="header"
                      variant="headingSm"
                      className="min-w-0 flex-1 text-heading-sm text-text"
                      numberOfLines={2}
                    >
                      {strings.urbanMenu.sections[sectionCategories.indexOf(category)]}
                    </VemtapText>
                    {category === 'grill' ? (
                      <View className="shrink-0 rounded-full bg-primary-fixed px-2 py-0.5">
                        <VemtapText
                          variant="caption"
                          tone="brand"
                          className="font-sans-semibold"
                        >
                          {strings.urbanMenu.popular}
                        </VemtapText>
                      </View>
                    ) : null}
                  </View>
                  <VemtapText variant="labelSm" tone="tertiary">
                    {strings.urbanMenu.items(items.length)}
                  </VemtapText>
                </View>
                {items.map(item => (
                  <ProductListCard
                    key={item.id}
                    product={{ ...item, name: item.menuName ?? item.name }}
                    badge={badgeByProduct[item.id]}
                    onAdd={add}
                  />
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
      <DetailActionDockBar
        eyebrow={`${strings.urbanMenu.yourOrder} • ${strings.urbanMenu.items(count)}`}
        value={formatNaira(total)}
        action={strings.urbanMenu.viewOrder}
        onAction={() => undefined}
      />
    </SafeAreaView>
  );
}
