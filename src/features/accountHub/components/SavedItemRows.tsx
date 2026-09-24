import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';

const copy = strings.savedHub;

export interface SavedItemRowProps {
  image: string;
  business: string;
  title: string;
  price?: string;
  discount: string;
  action: string;
  distance?: string;
  description?: string;
  meta?: string;
  layout?: 'featured' | 'standard' | 'bundle' | 'compact';
  oldPrice?: string;
  actionLabel?: string;
  onOpen?: () => void;
  onRemove?: () => void;
}

export function SavedItemRow({
  image,
  business,
  title,
  price,
  discount,
  action,
  distance,
  description,
  meta,
  layout = 'standard',
  oldPrice,
  actionLabel,
  onOpen,
  onRemove,
}: SavedItemRowProps) {
  if (layout === 'bundle') {
    return (
      <View className="gap-3 rounded-card bg-surface p-4 shadow-sm">
        <View className="flex-row gap-3">
          <View className="relative h-20 w-20 shrink-0 overflow-hidden rounded-field">
            <Image source={{ uri: image }} className="h-full w-full" resizeMode="cover" />
            <View className="absolute left-1 top-1 rounded bg-tertiary px-1 py-0.5">
              <VemtapText variant="micro" className="text-primary-foreground">
                {copy.twoDeals}
              </VemtapText>
            </View>
          </View>
          <View className="min-w-0 flex-1">
            <View className="flex-row items-start justify-between gap-2">
              <VemtapText variant="caption" tone="tertiary" className="uppercase">
                {business}
              </VemtapText>
              <BookmarkButton onPress={onRemove} />
            </View>
            <VemtapText variant="headingSm" numberOfLines={1}>
              {title}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {meta}
            </VemtapText>
          </View>
        </View>
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-row gap-1">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-surface-tint-blue">
              <VemtapText variant="micro" tone="brand">
                1
              </VemtapText>
            </View>
            <View className="h-6 w-6 items-center justify-center rounded-full bg-secondary-fixed">
              <VemtapText variant="micro">2</VemtapText>
            </View>
          </View>
          <Button
            label={action}
            variant="secondary"
            size="sm"
            fullWidth={false}
            onPress={onOpen}
          />
        </View>
      </View>
    );
  }

  if (layout === 'compact') {
    return (
      <View className="flex-row items-center gap-3 rounded-card bg-surface p-4 shadow-sm">
        <Image
          source={{ uri: image }}
          className="h-16 w-16 shrink-0 rounded-field"
          resizeMode="cover"
        />
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-1">
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {business}
            </VemtapText>
            <View className="shrink-0 rounded bg-badge-discount-bg px-1.5 py-0.5">
              <VemtapText variant="micro" tone="success">
                {discount}
              </VemtapText>
            </View>
          </View>
          <VemtapText variant="headingSm" numberOfLines={1}>
            {title}
          </VemtapText>
          <VemtapText variant="labelMd" tone="brand">
            {price}
          </VemtapText>
        </View>
        <View className="shrink-0 items-end gap-1">
          <BookmarkButton onPress={onRemove} />
          <Button label={action} size="sm" fullWidth={false} onPress={onOpen} />
        </View>
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-card bg-surface shadow-sm">
      <View className={layout === 'featured' ? 'h-44' : 'h-40'}>
        <Image source={{ uri: image }} className="h-full w-full" resizeMode="cover" />
        <View className="absolute left-3 top-3 rounded-full bg-badge-discount-bg px-2.5 py-1 shadow-sm">
          <VemtapText variant="labelSm" tone="success">
            {discount}
          </VemtapText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="{copy.removeBookmark}"
          onPress={onRemove}
          className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-surface shadow-sm"
        >
          <Icon name="bookmark" size={20} color={colors.primary} />
        </Pressable>
        {distance ? (
          <View className="absolute bottom-3 left-3 flex-row items-center gap-1">
            <Icon name="nearMe" size={15} color={colors.surface} />
            <VemtapText variant="caption" className="text-surface">
              {distance}
            </VemtapText>
          </View>
        ) : null}
      </View>
      <View className="gap-3 p-4">
        <View>
          <VemtapText variant="caption" tone="tertiary" className="uppercase">
            {business}
          </VemtapText>
          <VemtapText variant="headingSm" numberOfLines={1}>
            {title}
          </VemtapText>
        </View>
        {description ? (
          <VemtapText tone="secondary" numberOfLines={1}>
            {description}
          </VemtapText>
        ) : null}
        {price ? (
          <View className="flex-row items-baseline gap-2">
            <VemtapText variant="headingSm" tone="brand">
              {price}
            </VemtapText>
            {oldPrice ? (
              <VemtapText variant="caption" tone="tertiary" className="line-through">
                {oldPrice}
              </VemtapText>
            ) : null}
          </View>
        ) : null}
        <View className="flex-row items-center justify-between gap-3">
          <VemtapText
            variant="caption"
            tone={layout === 'featured' ? 'success' : 'secondary'}
            numberOfLines={1}
          >
            {actionLabel}
          </VemtapText>
          <Button
            label={action}
            size="sm"
            fullWidth={false}
            rightIcon={<Icon name="arrowForward" size={16} color={colors.surface} />}
            onPress={onOpen}
          />
        </View>
      </View>
    </View>
  );
}

function BookmarkButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="{copy.removeBookmark}"
      onPress={onPress}
      className="h-8 w-8 shrink-0 items-center justify-center"
    >
      <Icon name="bookmark" size={20} color={colors.primary} />
    </Pressable>
  );
}

export function SavedBusinessRow({
  image,
  name,
  meta,
  rating,
  deals,
  view,
  onPress,
}: {
  image: string;
  name: string;
  meta: string;
  rating: string;
  deals: string;
  view: string;
  onPress?: () => void;
}) {
  return (
    <View className="w-60 justify-between rounded-card bg-surface p-4 shadow-sm">
      <View className="flex-row items-start justify-between gap-2">
        <Image
          source={{ uri: image }}
          className="h-12 w-12 rounded-field"
          resizeMode="cover"
        />
        <View className="flex-row items-center gap-1 rounded-full bg-surface-container-low px-2 py-0.5">
          <Icon name="star" size={14} color={colors.tertiaryContainer} />
          <VemtapText variant="caption" className="font-sans-bold">
            {rating}
          </VemtapText>
        </View>
      </View>
      <View className="mt-2">
        <VemtapText variant="headingSm" numberOfLines={1}>
          {name}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {meta}
        </VemtapText>
      </View>
      <View className="mt-4 flex-row items-center justify-between gap-2">
        <VemtapText variant="labelSm" tone="success" numberOfLines={1}>
          ● {deals}
        </VemtapText>
        <Pressable accessibilityRole="button" onPress={onPress}>
          <VemtapText variant="labelSm" tone="brand">
            {view} →
          </VemtapText>
        </Pressable>
      </View>
    </View>
  );
}
