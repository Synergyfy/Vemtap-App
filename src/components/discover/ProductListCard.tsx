import React from 'react';
import { Image, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import { formatNaira, type UrbanProduct } from '@features/discover/data/urbanGrillData';

cssInterop(View, { className: 'style' });

interface ProductListCardProps {
  product: UrbanProduct;
  badge?: string;
  onAdd: (productId: string) => void;
}

export function ProductListCard({ product, badge, onAdd }: ProductListCardProps) {
  return (
    <View className="min-h-28 w-full flex-row gap-3 overflow-hidden rounded-xl border border-border bg-surface-canvas p-3 shadow-md">
      <View className="min-w-0 flex-1 justify-between">
        <View className="min-w-0">
          {badge ? (
            <View className="mb-1 self-start rounded bg-badge-discount-bg px-2 py-0.5">
              <VemtapText className="font-sans-semibold text-micro text-badge-discount-text">
                {badge}
              </VemtapText>
            </View>
          ) : null}
          {product.rating ? (
            <View className="mb-1 flex-row items-center gap-1">
              <Icon name="star" size={14} color={colors.tertiary} />
              <VemtapText variant="caption" className="font-sans-semibold text-text">
                {product.rating} (
                {strings.urbanProducts.productReviewCount(product.reviewCount ?? 0)})
              </VemtapText>
            </View>
          ) : null}
          <VemtapText
            variant="headingSm"
            className="text-heading-sm text-text"
            numberOfLines={2}
          >
            {product.name}
          </VemtapText>
          <VemtapText
            variant="caption"
            tone="secondary"
            className="mt-1"
            numberOfLines={2}
          >
            {product.description}
          </VemtapText>
        </View>
        <View className="mt-2 w-full flex-row items-center gap-2">
          <View className="min-w-0 flex-1 flex-row flex-wrap items-baseline gap-1.5">
            <VemtapText className="font-sans-bold text-heading-sm text-text">
              {formatNaira(product.price)}
            </VemtapText>
            {product.originalPrice ? (
              <VemtapText variant="caption" tone="tertiary" className="line-through">
                {formatNaira(product.originalPrice)}
              </VemtapText>
            ) : null}
          </View>
          <View className="ml-auto shrink-0">
            <Button
              label={strings.urbanMenu.add}
              size="sm"
              fullWidth={false}
              className="min-h-9 rounded-full px-3"
              leftIcon={<Icon name="plus" size={17} color={colors.surface} />}
              onPress={() => onAdd(product.id)}
            />
          </View>
        </View>
      </View>
      <Image
        source={{ uri: product.imageUri }}
        accessibilityLabel={product.imageAlt}
        className="h-24 w-24 shrink-0 rounded-xl bg-surface-container"
        resizeMode="cover"
      />
    </View>
  );
}
