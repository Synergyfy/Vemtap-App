import React from 'react';
import { Image, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { VemtapText } from '@components/ui/Text';
import type { PopularProduct } from '@features/home/data/homeFeed';

cssInterop(View, { className: 'style' });

export function PopularProductCard({ product }: { product: PopularProduct }) {
  return (
    <View className="w-full flex-1 overflow-hidden rounded-2xl border border-border bg-surface-canvas shadow-md">
      <View className="relative aspect-square w-full overflow-hidden bg-surface-container">
        <Image source={product.image} className="h-full w-full" resizeMode="cover" />
        {product.badge ? (
          <View
            className={
              product.badge.tone === 'discount'
                ? 'absolute bottom-2 left-2 rounded-full bg-badge-discount-bg px-2 py-0.5'
                : 'absolute bottom-2 left-2 rounded-full bg-surface-canvas/90 px-2 py-0.5'
            }
          >
            <VemtapText
              className={
                product.badge.tone === 'discount'
                  ? 'font-sans-bold text-caption text-badge-discount-text'
                  : 'font-sans-bold text-caption text-primary'
              }
            >
              {product.badge.label}
            </VemtapText>
          </View>
        ) : null}
      </View>
      <View className="flex-col gap-1 p-3">
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {product.merchant}
        </VemtapText>
        <VemtapText variant="labelSm" className="text-text" numberOfLines={1}>
          {product.title}
        </VemtapText>
        <View className="flex-row items-baseline gap-1.5">
          <VemtapText variant="labelMd" className="font-sans-bold text-text">
            {product.price}
          </VemtapText>
          {product.priceWas ? (
            <VemtapText className="font-sans text-caption text-text-tertiary line-through">
              {product.priceWas}
            </VemtapText>
          ) : null}
        </View>
      </View>
    </View>
  );
}
