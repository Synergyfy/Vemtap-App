import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessChipScroller,
  BusinessCountChip,
  BusinessSearchTrigger,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  catalogItems,
  catalogStockTone,
  posActiveOrder,
} from '@features/business/data/businessPosFlowData';

const copy = strings.posNewSaleCatalog;

export interface PosNewSaleCatalogScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onSearch?: () => void;
  onScan?: () => void;
  onDialpad?: () => void;
  onFilterCategory?: (categoryId: string) => void;
  onAddItem?: (itemId: string) => void;
  onAddCustomItem?: (amount: string) => void;
  onOpenCustomer?: () => void;
  onCharge?: () => void;
}

/** Register catalog: category chips, live menu items with stock, custom SKU entry and the running order. */
export function PosNewSaleCatalogScreen({
  onBack,
  onOpenProfile,
  onSearch,
  onScan,
  onDialpad,
  onFilterCategory,
  onAddItem,
  onAddCustomItem,
  onOpenCustomer,
  onCharge,
}: PosNewSaleCatalogScreenProps) {
  const [category, setCategory] = useState<string>('all');
  const [added, setAdded] = useState<string[]>([]);

  const visible = category === 'all' ? catalogItems : catalogItems;

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'accountCircle', label: copy.headerTitle, onPress: onOpenProfile },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <View className="flex-row items-center justify-between gap-3 rounded-field bg-surface px-3 py-2.5 shadow-sm">
            <View className="min-w-0 flex-1">
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {`${copy.orderPrefix} #${posActiveOrder.id}`}
              </VemtapText>
              <VemtapText
                variant="caption"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {`${posActiveOrder.items} ${copy.itemsLabel} • ${copy.saleActiveLabel}`}
              </VemtapText>
              <VemtapText variant="labelMd" className="font-sans-bold" numberOfLines={1}>
                {posActiveOrder.amount}
              </VemtapText>
            </View>
            <View className="shrink-0 items-end">
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {copy.chargeCta} (
              </VemtapText>
              <VemtapText
                variant="labelMd"
                className="font-sans-bold text-primary"
                numberOfLines={1}
              >
                {posActiveOrder.charge}
              </VemtapText>
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                )
              </VemtapText>
            </View>
          </View>
          <Button
            label={copy.chargeCta}
            labelVariant="labelMd"
            onPress={onCharge}
            rightIcon={<Icon name="arrowForward" size={17} color={colors.surface} />}
          />
        </BusinessActionDock>
      }
    >
      <View className="flex-row items-center justify-between gap-2">
        <VemtapText
          variant="caption"
          tone="secondary"
          className="min-w-0 flex-1"
          numberOfLines={1}
        >
          {copy.registerLabel}
        </VemtapText>
        <View className="shrink-0 flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Scan"
            onPress={onScan}
            className="h-9 w-9 items-center justify-center rounded-lg bg-surface-container"
          >
            <Icon name="barcodeScan" size={17} color={colors.text} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dialpad"
            onPress={onDialpad}
            className="h-9 w-9 items-center justify-center rounded-lg bg-surface-container"
          >
            <Icon name="dialpad" size={17} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <BusinessSearchTrigger
        className="mt-3"
        placeholder={copy.searchPlaceholder}
        onPress={onSearch}
      />

      <BusinessChipScroller className="mt-3">
        <BusinessCountChip
          label={copy.allItemsLabel}
          count={String(catalogItems.length)}
          selected={category === 'all'}
          onPress={() => {
            setCategory('all');
            onFilterCategory?.('all');
          }}
        />
        {copy.categories.map(item => (
          <BusinessCountChip
            key={item.id}
            label={item.label}
            selected={category === item.id}
            onPress={() => {
              setCategory(item.id);
              onFilterCategory?.(item.id);
            }}
          />
        ))}
      </BusinessChipScroller>

      <View className="mt-3 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <Icon name="catalog" size={16} color={colors.primary} />
          <VemtapText
            variant="labelMd"
            className="min-w-0 font-sans-semibold"
            numberOfLines={1}
          >
            {copy.catalogTitle}
          </VemtapText>
        </View>
        <BusinessStatusPill label={copy.catalogSub} tone="success" />
      </View>
      <VemtapText variant="micro" tone="tertiary" className="mt-0.5" numberOfLines={1}>
        {copy.sortLabel}
      </VemtapText>

      <View className="mt-2 gap-2">
        {visible.map(item => (
          <View key={item.id} className="gap-2 rounded-card bg-surface p-3 shadow-sm">
            <View className="flex-row items-start justify-between gap-2">
              <View className="min-w-0 flex-1">
                <View className="flex-row flex-wrap items-center gap-1.5">
                  <VemtapText
                    variant="labelMd"
                    className="min-w-0 font-sans-semibold"
                    numberOfLines={2}
                  >
                    {item.name}
                  </VemtapText>
                  {item.dealLabel ? (
                    <BusinessStatusPill label={item.dealLabel} tone="brand" />
                  ) : null}
                </View>
                <View className="mt-0.5 flex-row flex-wrap items-center gap-1.5">
                  <VemtapText
                    variant="caption"
                    tone="secondary"
                    className="min-w-0"
                    numberOfLines={1}
                  >
                    {item.detail}
                  </VemtapText>
                  {item.verified ? (
                    <Icon name="verified" size={13} color={colors.primary} />
                  ) : null}
                </View>
                <View className="mt-1 flex-row items-baseline gap-1.5">
                  {item.wasPrice ? (
                    <VemtapText
                      variant="labelSm"
                      tone="tertiary"
                      className="line-through"
                      numberOfLines={1}
                    >
                      {item.wasPrice}
                    </VemtapText>
                  ) : null}
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-bold"
                    numberOfLines={1}
                  >
                    {item.price}
                  </VemtapText>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${item.name} ${copy.addItemCta}`}
                onPress={() => {
                  setAdded(ids => (ids.includes(item.id) ? ids : [...ids, item.id]));
                  onAddItem?.(item.id);
                }}
                className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary active:scale-95"
              >
                <Icon name="plus" size={19} color={colors.surface} />
              </Pressable>
            </View>
            <View className="flex-row items-center gap-1.5">
              <BusinessStatusPill
                label={item.stock}
                tone={catalogStockTone[item.stockTone]}
              />
              {added.includes(item.id) ? (
                <View className="flex-row items-center gap-1">
                  <Icon name="checkCircle" size={14} color={colors.badgeDiscountText} />
                  <VemtapText
                    variant="micro"
                    className="text-badge-discount-text"
                    numberOfLines={1}
                  >
                    {copy.addedToast}
                  </VemtapText>
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      {visible.length === 0 ? (
        <EmptyState
          icon="catalog"
          variant="contained"
          title={copy.empty.title}
          description={copy.empty.body}
        />
      ) : null}

      <View className="mt-3 gap-2 rounded-card bg-surface p-3 shadow-sm">
        <View className="flex-row items-center gap-2">
          <Icon name="dialpad" size={17} color={colors.primary} />
          <VemtapText
            variant="labelMd"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {copy.customTitle}
          </VemtapText>
          <View className="rounded-full bg-surface-container px-2.5 py-1">
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {`${copy.customLabel}: ₦0`}
            </VemtapText>
          </View>
        </View>
        <View className="flex-row flex-wrap gap-1.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0'].map(key => (
            <View
              key={key}
              className="h-10 w-10 items-center justify-center rounded-lg bg-surface-subtle"
            >
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {key}
              </VemtapText>
            </View>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.addItemCta}
          onPress={() => onAddCustomItem?.('0')}
          className="min-h-10 flex-row items-center justify-center gap-1.5 rounded-field bg-primary active:scale-95"
        >
          <Icon name="plus" size={16} color={colors.surface} />
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-surface"
            numberOfLines={1}
          >
            {copy.addItemCta}
          </VemtapText>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.guestLabel}
        onPress={onOpenCustomer}
        className="mt-3 flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-3"
      >
        <Icon name="accountCircle" size={18} color={colors.primary} />
        <VemtapText
          variant="labelMd"
          className="min-w-0 flex-1 font-sans-semibold"
          numberOfLines={1}
        >
          {copy.guestLabel}
        </VemtapText>
        <Icon name="expandMore" size={18} color={colors.textTertiary} />
      </Pressable>

      <VemtapText variant="micro" tone="tertiary" className="mt-2" numberOfLines={1}>
        {copy.vatLabel}
      </VemtapText>
    </BusinessScreenLayout>
  );
}
