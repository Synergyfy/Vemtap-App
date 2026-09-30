import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { BottomSheet } from '@components/shared/BottomSheet';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessChipScroller,
  BusinessCountChip,
  BusinessSearchTrigger,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessActionDock,
  BusinessNumberInput,
  BusinessScreenLayout,
  BusinessStatusPill,
  type BusinessPillTone,
} from '@features/business/components/BusinessPrimitives';
import {
  posInventoryItems,
  type PosInventoryItem,
} from '@features/business/data/businessPosCustomerData';

const copy = strings.posProductsInventory;

/** Stock pill tone per inventory state. */
const stockTone: Record<PosInventoryItem['state'], BusinessPillTone> = {
  active: 'success',
  low: 'warning',
  inactive: 'tertiary',
};

const stateLabel: Record<PosInventoryItem['state'], string> = {
  active: 'Active',
  low: 'Active',
  inactive: 'Inactive',
};

export interface PosProductsInventoryScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onOpenNotifications?: () => void;
  onSearch?: () => void;
  onScan?: () => void;
  onSelectFilter?: (filterId: string) => void;
  onAdjustStock?: (itemId: string, delta: number) => void;
  onOpenOverride?: (itemId: string) => void;
  onOpenDeal?: () => void;
  onOpenDealTerms?: () => void;
  onAddCustomItem?: () => void;
  onAuthorize?: (pin: string) => void;
}

/**
 * `pos_products_inventory` - the till catalogue. Branches price overrides need a
 * manager PIN, so that confirmation is the shared bottom sheet rather than an
 * inline dialog; the design's own tab bar is not rendered.
 */
export function PosProductsInventoryScreen({
  onBack,
  onOpenProfile,
  onOpenNotifications,
  onSearch,
  onScan,
  onSelectFilter,
  onAdjustStock,
  onOpenOverride,
  onOpenDeal,
  onOpenDealTerms,
  onAddCustomItem,
  onAuthorize,
}: PosProductsInventoryScreenProps) {
  const [pendingOverride, setPendingOverride] = useState<PosInventoryItem | null>(null);
  const [pin, setPin] = useState('');

  return (
    <>
      {/* The design nests a second bar under the app header; the shared header
          renders the same identity, so only the catalogue bar is drawn. */}
      <BusinessScreenLayout
        header={{
          title: copy.headerTitleLabel,
          subtitle: copy.headerSubtitleLabel,
          onBack,
          titleVariant: 'labelMd',
          showAvatar: false,
          leading: (
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Icon name="pointOfSale" size={18} color={colors.surface} />
            </View>
          ),
          actions: [
            {
              icon: 'notifications',
              label: copy.bellActionLabel,
              onPress: onOpenNotifications,
            },
            {
              icon: 'accountCircle',
              label: copy.profileActionLabel,
              onPress: onOpenProfile,
            },
          ],
        }}
        contentContainerClassName="pb-8"
        footer={
          <BusinessActionDock>
            <Button
              label={copy.addCustomCta}
              labelVariant="labelMd"
              onPress={onAddCustomItem}
              leftIcon={<Icon name="plusCircle" size={17} color={colors.surface} />}
            />
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="mt-2 text-center"
              numberOfLines={2}
            >
              {copy.addCustomBody}
            </VemtapText>
          </BusinessActionDock>
        }
      >
        {/* The design stacks a second bar under the app header. A screen may not
            own two navbars, so the catalogue title lives in the content flow. */}
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="headingLg"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.headerTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.headerSubtitle}
            </VemtapText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.scanCta}
            onPress={onScan}
            className="min-h-10 shrink-0 flex-row items-center gap-1.5 rounded-field bg-surface-container-low px-3 active:scale-95"
          >
            <Icon name="barcodeScan" size={17} color={colors.primary} />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-primary"
              numberOfLines={1}
            >
              {copy.scanCta}
            </VemtapText>
          </Pressable>
        </View>

        <View className="mt-3">
          <BusinessSearchTrigger
            placeholder={copy.searchPlaceholder}
            onPress={onSearch}
            surface="bordered"
          />
        </View>

        <View className="mt-3 flex-row flex-wrap items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
            <Icon name="store" size={16} color={colors.primary} />
            <VemtapText
              variant="caption"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.branchAvailable}
            </VemtapText>
          </View>
          <View className="shrink-0 flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-success" />
            <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
              {copy.syncedLabel}
            </VemtapText>
          </View>
        </View>

        <View className="mt-3">
          <BusinessChipScroller>
            <BusinessCountChip
              label={copy.filterAll}
              count="142"
              selected
              onPress={() => onSelectFilter?.('all')}
            />
            <BusinessCountChip
              label={copy.filterLow}
              icon="alert"
              count="4"
              selected={false}
              onPress={() => onSelectFilter?.('low')}
            />
            <BusinessCountChip
              label={copy.filterOut}
              icon="block"
              count="1"
              selected={false}
              onPress={() => onSelectFilter?.('out')}
            />
            <BusinessCountChip
              label={copy.filterDeals}
              icon="localOffer"
              count="6"
              selected={false}
              onPress={() => onSelectFilter?.('deals')}
            />
            <BusinessCountChip
              label={copy.filterCategories}
              icon="expandMore"
              selected={false}
              onPress={() => onSelectFilter?.('categories')}
            />
          </BusinessChipScroller>
        </View>

        <View className="mt-3 gap-2.5">
          {posInventoryItems.map(item => (
            <View key={item.id} className="rounded-card bg-surface p-3 shadow-sm">
              <View className="flex-row items-start gap-3">
                <View className="h-14 w-14 shrink-0 items-center justify-center rounded-field bg-surface-container">
                  <Icon name="food" size={22} color={colors.textSecondary} />
                </View>
                <View className="min-w-0 flex-1">
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                    {`${item.sku} \u00b7 ${item.station}`}
                  </VemtapText>
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {item.name}
                  </VemtapText>
                  <VemtapText
                    variant="bodyMd"
                    className="font-sans-bold text-primary"
                    numberOfLines={1}
                  >
                    {item.price}
                  </VemtapText>
                </View>
                <View className="shrink-0 items-end gap-1">
                  <BusinessStatusPill
                    label={item.stockLabel}
                    tone={stockTone[item.state]}
                  />
                  <BusinessStatusPill
                    label={stateLabel[item.state]}
                    tone={item.state === 'inactive' ? 'neutral' : 'success'}
                    icon={item.state === 'inactive' ? 'block' : 'checkCircle'}
                  />
                </View>
              </View>

              <View className="mt-2.5 flex-row items-center gap-2 rounded-field bg-surface-tint px-2 py-1.5">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name} decrease`}
                  onPress={() => onAdjustStock?.(item.id, -1)}
                  className="h-9 w-9 items-center justify-center rounded-field bg-surface active:scale-95"
                >
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {'\u2212'}
                  </VemtapText>
                </Pressable>
                <View className="min-w-0 flex-1 items-center">
                  <VemtapText
                    variant="labelSm"
                    className={`font-sans-semibold ${item.note ? 'text-error' : ''}`}
                    numberOfLines={1}
                  >
                    {item.note || item.stockValue}
                  </VemtapText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name} increase`}
                  onPress={() => onAdjustStock?.(item.id, 1)}
                  className="h-9 w-9 items-center justify-center rounded-field bg-surface active:scale-95"
                >
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    +
                  </VemtapText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${copy.overrideCta} ${item.name}`}
                  onPress={() => {
                    setPin('');
                    onOpenOverride?.(item.id);
                    setPendingOverride(item);
                  }}
                  className="min-h-9 shrink-0 flex-row items-center gap-1 rounded-field bg-surface px-2.5 active:scale-95"
                >
                  <Icon name="lock" size={14} color={colors.textSecondary} />
                  <VemtapText variant="caption" numberOfLines={1}>
                    {copy.overrideCta}
                  </VemtapText>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.dealTag}
          onPress={onOpenDeal}
          className="mt-3 rounded-card bg-surface p-3 shadow-sm active:scale-[0.99]"
        >
          <View className="flex-row items-start gap-3">
            <View className="h-14 w-14 shrink-0 items-center justify-center rounded-field bg-primary">
              <Icon name="star" size={24} color={colors.surface} />
            </View>
            <View className="min-w-0 flex-1">
              <View className="flex-row flex-wrap items-center gap-1.5">
                <BusinessStatusPill label={copy.dealBadge} tone="brand" />
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {copy.dealTag}
                </VemtapText>
              </View>
              <VemtapText
                variant="labelMd"
                className="mt-1 font-sans-semibold"
                numberOfLines={1}
              >
                Prime Lunch Combo Deal
              </VemtapText>
              <View className="mt-0.5 flex-row items-center gap-1.5">
                <VemtapText
                  variant="bodyMd"
                  className="font-sans-bold text-primary"
                  numberOfLines={1}
                >
                  {'\u20a69,600'}
                </VemtapText>
                <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                  {'\u20a612,500'}
                </VemtapText>
              </View>
              <View className="mt-1 flex-row flex-wrap items-center gap-1.5">
                <VemtapText variant="caption" tone="success" numberOfLines={1}>
                  21 / 30 left today
                </VemtapText>
                <BusinessStatusPill
                  label={copy.dealLiveBadge}
                  tone="success"
                  icon="checkCircle"
                />
              </View>
            </View>
          </View>
          <View className="mt-2 flex-row items-center justify-between gap-2 rounded-field bg-surface-tint px-2.5 py-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              <Icon name="verified" size={15} color={colors.primary} />
              <VemtapText variant="caption" className="min-w-0 flex-1" numberOfLines={2}>
                {copy.dealBody}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.dealTermsCta}
              onPress={onOpenDealTerms}
              className="min-h-9 shrink-0 flex-row items-center gap-1 rounded-field bg-surface px-2.5 active:scale-95"
            >
              <Icon name="lock" size={14} color={colors.textSecondary} />
              <VemtapText variant="caption" numberOfLines={1}>
                {copy.dealTermsCta}
              </VemtapText>
            </Pressable>
          </View>
        </Pressable>
      </BusinessScreenLayout>

      <BottomSheet
        visible={pendingOverride !== null}
        onClose={() => setPendingOverride(null)}
        title={copy.authTitle}
        titleVariant="headingXl"
        titleClassName="text-heading-xl"
      >
        <View className="gap-3">
          <VemtapText variant="bodyMd" tone="secondary" numberOfLines={3}>
            {copy.authBody}
          </VemtapText>
          <BusinessNumberInput
            label={copy.authTitle}
            value={pin}
            onChangeText={setPin}
            placeholder="0000"
            keyboardType="number-pad"
            maxLength={4}
          />
          <View className="flex-row gap-2">
            <View className="min-w-0 flex-1">
              <Button
                label={copy.authCancelCta}
                labelVariant="labelMd"
                variant="secondary"
                onPress={() => setPendingOverride(null)}
              />
            </View>
            <View className="min-w-0 flex-1">
              <Button
                label={copy.authCta}
                labelVariant="labelMd"
                onPress={() => {
                  onAuthorize?.(pin);
                  setPendingOverride(null);
                }}
              />
            </View>
          </View>
        </View>
      </BottomSheet>
    </>
  );
}
