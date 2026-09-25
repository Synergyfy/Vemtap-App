import React, { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import {
  BusinessNumberInput,
  BusinessProductImage,
  BusinessStatusPill,
  SetupCard,
} from './BusinessPrimitives';

export interface ProductStatusSnapshotProps {
  image: React.ComponentProps<typeof BusinessProductImage>['source'];
  imageAlt: string;
  imageBadge?: string;
  name: string;
  price: ReactNode;
  statusLabel: string;
  statusTone?: 'brand' | 'success' | 'neutral' | 'warning';
  catalogId?: string;
  footer?: ReactNode;
  className?: string;
}

export function ProductStatusSnapshot({
  image,
  imageAlt,
  imageBadge,
  name,
  price,
  statusLabel,
  statusTone = 'success',
  catalogId,
  footer,
  className,
}: ProductStatusSnapshotProps) {
  return (
    <SetupCard className={cn('gap-3', className)}>
      <View className="flex-row items-start gap-3">
        <View className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-container">
          <BusinessProductImage source={image} alt={imageAlt} className="h-full w-full" />
          {imageBadge ? (
            <View className="absolute bottom-1 left-1 rounded bg-surface-dark/80 px-1.5 py-0.5">
              <VemtapText variant="caption" className="font-sans-semibold text-surface">
                {imageBadge}
              </VemtapText>
            </View>
          ) : null}
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <View className="flex-row flex-wrap items-center justify-between gap-1">
            <BusinessStatusPill label={statusLabel} tone={statusTone} />
            {catalogId ? (
              <VemtapText variant="caption" tone="tertiary">
                {catalogId}
              </VemtapText>
            ) : null}
          </View>
          <VemtapText variant="headingSm" numberOfLines={1}>
            {name}
          </VemtapText>
          <VemtapText variant="button" className="text-primary">
            {price}
          </VemtapText>
        </View>
      </View>
      {footer}
    </SetupCard>
  );
}

export interface BusinessVariant {
  id: string;
  name: string;
  price: string;
  inventory: number;
}

export function ProductVariantList({
  variants,
  readOnly = false,
  onPriceChange,
  onInventoryChange,
  onDelete,
}: {
  variants: BusinessVariant[];
  readOnly?: boolean;
  onPriceChange?: (id: string, value: string) => void;
  onInventoryChange?: (id: string, value: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <View className="gap-2">
      {variants.map(variant => (
        <View
          key={variant.id}
          className={cn(
            'gap-3 rounded-xl p-3',
            readOnly ? 'bg-surface-container-low' : 'bg-surface-subtle',
          )}
        >
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <View className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              <VemtapText
                variant="labelMd"
                className="min-w-0 font-sans-semibold"
                numberOfLines={2}
              >
                {variant.name}
              </VemtapText>
            </View>
            {onDelete ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Delete ${variant.name}`}
                hitSlop={8}
                className="h-8 w-8 shrink-0 items-center justify-center"
                onPress={() => onDelete(variant.id)}
              >
                <Icon name="delete" size={18} color={colors.textTertiary} />
              </Pressable>
            ) : null}
          </View>
          {readOnly ? (
            <View className="flex-row items-end justify-between gap-3">
              <VemtapText variant="caption" tone="secondary">
                {variant.inventory} units in stock
              </VemtapText>
              <VemtapText variant="labelMd" className="shrink-0 font-sans-bold text-text">
                ₦{variant.price}
              </VemtapText>
            </View>
          ) : (
            <View className="flex-row gap-2">
              <BusinessNumberInput
                label="Variant Price (₦)"
                value={variant.price}
                onChangeText={value => onPriceChange?.(variant.id, value)}
                accessibilityLabel={`${variant.name} price`}
                keyboardType="numbers-and-punctuation"
                className="min-h-10 flex-1 bg-surface px-3"
              />
              <View className="min-w-0 flex-1">
                <BusinessNumberInput
                  label="Inventory Qty"
                  value={String(variant.inventory)}
                  onChangeText={value => onInventoryChange?.(variant.id, value)}
                  accessibilityLabel={`${variant.name} inventory quantity`}
                  trailingText="units"
                  className="min-h-10"
                />
              </View>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

export function BusinessQrGraphic({
  sizeClassName = 'w-[72%] max-w-[224px]',
}: {
  sizeClassName?: string;
}) {
  return (
    <View
      className={cn(
        'aspect-square items-center justify-center rounded-xl bg-surface p-3 shadow-md',
        sizeClassName,
      )}
    >
      <View className="h-full w-full">
        <Svg viewBox="0 0 160 160" width="100%" height="100%">
          <Rect x="10" y="10" width="40" height="40" rx="6" fill={colors.surfaceDark} />
          <Rect x="16" y="16" width="28" height="28" rx="3" fill={colors.surface} />
          <Rect x="22" y="22" width="16" height="16" rx="2" fill={colors.surfaceDark} />
          <Rect x="110" y="10" width="40" height="40" rx="6" fill={colors.surfaceDark} />
          <Rect x="116" y="16" width="28" height="28" rx="3" fill={colors.surface} />
          <Rect x="122" y="22" width="16" height="16" rx="2" fill={colors.surfaceDark} />
          <Rect x="10" y="110" width="40" height="40" rx="6" fill={colors.surfaceDark} />
          <Rect x="16" y="116" width="28" height="28" rx="3" fill={colors.surface} />
          <Rect x="22" y="122" width="16" height="16" rx="2" fill={colors.surfaceDark} />
          {[
            [56, 12],
            [66, 12],
            [76, 12],
            [88, 12],
            [98, 12],
            [12, 56],
            [24, 56],
            [36, 56],
            [12, 68],
            [24, 68],
            [36, 68],
            [12, 80],
            [24, 80],
            [36, 80],
            [56, 24],
            [76, 24],
            [98, 24],
            [56, 36],
            [66, 36],
            [88, 36],
            [122, 56],
            [142, 56],
            [112, 68],
            [132, 68],
            [122, 80],
            [142, 80],
            [56, 112],
            [66, 112],
            [88, 112],
            [98, 112],
            [122, 112],
            [142, 112],
            [56, 124],
            [76, 124],
            [112, 124],
            [132, 124],
            [66, 136],
            [88, 136],
            [122, 136],
            [142, 136],
            [56, 144],
            [98, 144],
            [112, 144],
          ].map(([x, y]) => (
            <Rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="6"
              height="6"
              rx="1"
              fill={colors.surfaceDark}
            />
          ))}
        </Svg>
      </View>
      <View className="absolute h-12 w-12 items-center justify-center rounded-xl bg-surface p-1 shadow-lg">
        <View className="h-full w-full items-center justify-center rounded-lg bg-primary">
          <Icon name="electricBolt" size={24} color={colors.surface} />
        </View>
      </View>
    </View>
  );
}
