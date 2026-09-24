import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import { formatNaira, type UrbanProduct } from '@features/discover/data/urbanGrillData';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

interface ProductGridCardProps {
  product: UrbanProduct;
  onAdd: (productId: string) => void;
  onOpen?: (productId: string) => void;
}

export function ProductGridCard({ product, onAdd, onOpen }: ProductGridCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onOpen?.(product.id)}
      className="self-start overflow-hidden rounded-2xl border border-border bg-surface-canvas shadow-md"
    >
      <View className="relative aspect-square w-full overflow-hidden bg-surface-muted">
        <Image
          source={{ uri: product.imageUri }}
          accessibilityLabel={product.imageAlt}
          className="h-full w-full"
          resizeMode="cover"
        />
        {product.discount ? (
          <View className="absolute left-2 top-2 rounded-md bg-badge-discount-bg px-1.5 py-0.5">
            <VemtapText className="font-sans-bold text-caption text-badge-discount-text">
              {product.discount}
            </VemtapText>
          </View>
        ) : null}
        {product.badge ? (
          <View className="absolute right-2 top-2 max-w-[55%] rounded-md bg-primary-container px-1.5 py-0.5">
            <VemtapText className="text-center font-sans-semibold text-micro text-primary-foreground">
              {product.badge}
            </VemtapText>
          </View>
        ) : null}
      </View>
      <View className="gap-1.5 p-2.5">
        <View className="flex-row items-center gap-1">
          <Icon name="star" size={13} color={colors.tertiary} />
          <VemtapText className="font-sans-bold text-micro text-text">
            {product.rating}
          </VemtapText>
          <VemtapText variant="caption" tone="tertiary" className="text-micro">
            ({product.reviewCount})
          </VemtapText>
        </View>
        <VemtapText
          variant="labelMd"
          className="min-h-10 font-sans-semibold text-text"
          numberOfLines={2}
        >
          {product.name}
        </VemtapText>
        <View className="mt-auto gap-1.5">
          <View className="flex-row flex-wrap items-baseline gap-1.5">
            <VemtapText variant="headingSm" className="text-text">
              {formatNaira(product.price)}
            </VemtapText>
            {product.originalPrice ? (
              <VemtapText variant="caption" tone="tertiary" className="line-through">
                {formatNaira(product.originalPrice)}
              </VemtapText>
            ) : null}
          </View>
          <Button
            label={strings.urbanProducts.add}
            size="sm"
            className="min-h-9 rounded-xl px-3"
            leftIcon={<Icon name="plus" size={17} color={colors.surface} />}
            onPress={() => onAdd(product.id)}
          />
        </View>
      </View>
    </Pressable>
  );
}
