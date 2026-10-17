import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { CategoryChips } from '@components/home/CategoryChips';
import { HomeSearchBar } from '@components/home/HomeSearchBar';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import type { AppStackParamList } from '@navigation/types';
import {
  useBranchCatalogue,
  useBranchCatalogueCategories,
} from '@features/business/hooks/useBranchCatalogue';
import { toProductDetailView } from '@features/order/utils/productDetailMapper';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(Image, { className: 'style' });
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

type Props = NativeStackScreenProps<AppStackParamList, 'BusinessProducts'>;

const copy = strings.businessProducts;

/** Enough for a branch's whole shelf; the list is searched on the device. */
const PAGE_LIMIT = 100;

/**
 * A branch's active products (`GET /public/catalogue/items/branch/:branchId`,
 * pinned to `product`), searchable and filterable by the branch's categories.
 * Each row opens the product with the branch, so it shows the branch's price.
 */
export function BusinessProductsScreen({ navigation, route }: Props) {
  const { branchId, businessName, branchName } = route.params;
  const items = useBranchCatalogue(branchId, { itemType: 'product', limit: PAGE_LIMIT });
  const categories = useBranchCatalogueCategories(branchId);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>(copy.allCategories);

  const categoryNames = useMemo(
    () => [copy.allCategories, ...(categories.data ?? []).map(entry => entry.name)],
    [categories.data],
  );

  const products = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return (items.data?.data ?? [])
      .filter(item => item.itemType === 'product')
      .filter(item => category === copy.allCategories || item.category?.name === category)
      .filter(
        item =>
          !needle ||
          [item.name, item.shortDescription ?? '', item.description ?? ''].some(value =>
            value.toLocaleLowerCase().includes(needle),
          ),
      )
      .map(item => toProductDetailView(item));
  }, [category, items.data, query]);

  const hasAny = (items.data?.data ?? []).some(item => item.itemType === 'product');

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-surface-canvas">
      <RegistrationHeader
        title={businessName ?? copy.headerTitle}
        onBack={navigation.goBack}
      />
      <View className="gap-2 px-6 pb-3">
        {branchName ? (
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {branchName}
          </VemtapText>
        ) : null}
        <HomeSearchBar
          variant="outlined"
          value={query}
          onChangeText={setQuery}
          showFilter={false}
          placeholder={copy.search}
        />
        {categoryNames.length > 1 ? (
          <CategoryChips
            categories={categoryNames}
            activeCategory={category}
            onChangeCategory={setCategory}
          />
        ) : null}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2 px-6 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        {items.isLoading ? (
          <LoadingState label={copy.loading} />
        ) : items.isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={() => items.refetch()}
          />
        ) : !hasAny ? (
          <EmptyState
            icon="shoppingBag"
            title={copy.empty.title}
            description={copy.empty.body}
          />
        ) : products.length === 0 ? (
          <EmptyState
            icon="search"
            title={copy.noMatch.title}
            description={copy.noMatch.body}
          />
        ) : (
          <>
            <VemtapText variant="caption" tone="secondary">
              {copy.showing(products.length)}
            </VemtapText>
            {products.map(product => (
              <Pressable
                key={product.id}
                accessibilityRole="button"
                accessibilityLabel={product.name}
                onPress={() =>
                  navigation.navigate('ProductDetail', {
                    productId: product.id,
                    branchId,
                    businessName,
                    branchName,
                  })
                }
                className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-sm active:opacity-80"
              >
                <View className="h-16 w-16 overflow-hidden rounded-xl bg-surface-container-low">
                  {product.images[0] ? (
                    <Image
                      source={{ uri: product.images[0] }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="h-full w-full items-center justify-center">
                      <Icon name="shoppingBag" size={22} color={colors.textTertiary} />
                    </View>
                  )}
                </View>
                <View className="min-w-0 flex-1 gap-0.5">
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold text-text"
                    numberOfLines={1}
                  >
                    {product.name}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                    {[product.category, product.stock.label].filter(Boolean).join(' • ')}
                  </VemtapText>
                  <View className="flex-row items-baseline gap-1.5">
                    <VemtapText variant="labelMd" className="font-sans-bold text-primary">
                      {product.price}
                    </VemtapText>
                    {product.wasPrice ? (
                      <VemtapText
                        variant="caption"
                        tone="tertiary"
                        className="line-through"
                      >
                        {product.wasPrice}
                      </VemtapText>
                    ) : null}
                  </View>
                </View>
                <Icon name="arrowForward" size={18} color={colors.textSecondary} />
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
