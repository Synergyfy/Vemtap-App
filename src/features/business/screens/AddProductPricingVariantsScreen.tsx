import React, { useMemo, useState } from 'react';
import { Switch, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessInlineAction,
  BusinessNumberInput,
  BusinessProgress,
  BusinessScreenLayout,
  BusinessSectionHeading,
  BusinessStatusPill,
  BusinessSwitchRow,
  SetupCard,
} from '@features/business/components/BusinessPrimitives';
import {
  ProductVariantList,
  type BusinessVariant,
} from '@features/business/components/BusinessProductContent';
import { productVariants } from '@features/business/data/businessSetupData';

export type ProductPricingValue = {
  regularPrice: string;
  compareAtPrice: string;
  costPerItem: string;
  variants: BusinessVariant[];
  sku: string;
  lowStockThreshold: string;
  continueWhenOutOfStock: boolean;
};

export interface AddProductPricingVariantsScreenProps {
  onBack: () => void;
  onContinue?: (value: ProductPricingValue) => void;
  onSaveDraft?: (value: ProductPricingValue) => void;
  onAddVariant?: () => void;
}

export function AddProductPricingVariantsScreen({
  onBack,
  onContinue,
  onSaveDraft,
  onAddVariant,
}: AddProductPricingVariantsScreenProps) {
  const [variantsEnabled, setVariantsEnabled] = useState(true);
  const [regularPrice, setRegularPrice] = useState('14,000');
  const [compareAtPrice, setCompareAtPrice] = useState('16,000');
  const [costPerItem, setCostPerItem] = useState('8,500');
  const [variants, setVariants] = useState<BusinessVariant[]>(
    productVariants.map(item => ({ ...item })),
  );
  const [sku, setSku] = useState('UG-RB-042');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [backorder, setBackorder] = useState(false);
  const totalStock = useMemo(
    () => variants.reduce((total, variant) => total + variant.inventory, 0),
    [variants],
  );
  const value = useMemo(
    () => ({
      regularPrice,
      compareAtPrice,
      costPerItem,
      variants,
      sku,
      lowStockThreshold,
      continueWhenOutOfStock: backorder,
    }),
    [
      backorder,
      compareAtPrice,
      costPerItem,
      lowStockThreshold,
      regularPrice,
      sku,
      variants,
    ],
  );

  const updateVariantPrice = (id: string, nextValue: string) => {
    setVariants(current =>
      current.map(variant =>
        variant.id === id ? { ...variant, price: nextValue } : variant,
      ),
    );
  };
  const updateVariantInventory = (id: string, nextValue: string) => {
    setVariants(current =>
      current.map(variant =>
        variant.id === id
          ? { ...variant, inventory: Number.parseInt(nextValue, 10) || 0 }
          : variant,
      ),
    );
  };
  const addVariant = () => {
    const id = `variant-${variants.length + 1}`;
    setVariants(current => [
      ...current,
      {
        id,
        name: `New Variant (${current.length + 1})`,
        price: regularPrice,
        inventory: 0,
      },
    ]);
    onAddVariant?.();
  };

  return (
    <BusinessScreenLayout
      header={{
        title: 'Add New Product',
        eyebrow: 'Step 2 of 4',
        onBack,
        actionLabel: 'Draft',
        onAction: () => onSaveDraft?.(value),
      }}
      contentContainerClassName="pb-6"
      footer={
        <BusinessActionDock>
          <Button
            label="Continue to Branch Availability"
            labelNumberOfLines={2}
            className="min-h-[56px] py-2 shadow-lg"
            rightIcon={<Icon name="arrowForward" size={20} color={colors.surface} />}
            onPress={() => onContinue?.(value)}
          />
          <Button
            label="Back to Step 1"
            variant="ghost"
            className="min-h-11"
            onPress={onBack}
          />
        </BusinessActionDock>
      }
    >
      <BusinessProgress
        label="Step 2 of 4"
        percent={50}
        completionLabel="50% Completed"
        compact
      />
      <View className="mt-3 flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <VemtapText
            accessibilityRole="header"
            variant="headingMd"
            className="text-heading-md"
          >
            Price, Variants & Stock
          </VemtapText>
          <VemtapText tone="secondary" className="mt-1">
            Set your regular selling price, sizes/options, and inventory quantity.
          </VemtapText>
        </View>
        <View className="h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-high">
          <Icon name="payments" size={24} color={colors.primary} />
        </View>
      </View>

      <View className="mt-4 gap-6">
        <SetupCard>
          <BusinessSectionHeading title="Standard Retail Pricing" icon="payments" />
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="labelMd" className="min-w-0 flex-1 font-sans-semibold">
              Regular Base Price
            </VemtapText>
            <VemtapText variant="caption" className="shrink-0 text-primary">
              Required
            </VemtapText>
          </View>
          <BusinessNumberInput
            label=""
            value={regularPrice}
            onChangeText={setRegularPrice}
            leadingText="₦"
            keyboardType="numbers-and-punctuation"
            accessibilityLabel="Regular Base Price"
          />
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="labelMd" className="min-w-0 flex-1 font-sans-semibold">
              Compare-at Price
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary" className="shrink-0">
              Optional
            </VemtapText>
          </View>
          <BusinessNumberInput
            label=""
            value={compareAtPrice}
            onChangeText={setCompareAtPrice}
            leadingText="₦"
            keyboardType="numbers-and-punctuation"
            accessibilityLabel="Compare-at Price"
            className="bg-surface-subtle"
          />
          <View className="flex-row items-center gap-1.5 self-start rounded-lg bg-badge-discount-bg px-3 py-1.5">
            <Icon name="localOffer" size={16} color={colors.badgeDiscountText} />
            <VemtapText
              variant="caption"
              className="font-sans-semibold text-badge-discount-text"
            >
              Shows ₦2,000 discount on normal listing
            </VemtapText>
          </View>
          <View className="flex-row gap-3">
            <View className="min-w-0 flex-1">
              <BusinessNumberInput
                label="Cost per Item"
                value={costPerItem}
                onChangeText={setCostPerItem}
                leadingText="₦"
                keyboardType="numbers-and-punctuation"
                accessibilityLabel="Cost per Item"
              />
            </View>
            <View className="min-w-0 flex-1 gap-1.5">
              <VemtapText variant="labelMd" tone="secondary">
                Gross Margin
              </VemtapText>
              <View className="min-h-[46px] flex-row items-center justify-between rounded-lg bg-surface-tint px-3">
                <VemtapText variant="headingSm" className="text-primary">
                  39%
                </VemtapText>
                <View className="flex-row items-center gap-0.5">
                  <Icon name="trendingUp" size={14} color={colors.badgeDiscountText} />
                  <VemtapText variant="caption" className="text-badge-discount-text">
                    Healthy
                  </VemtapText>
                </View>
              </View>
            </View>
          </View>
          <VemtapText variant="caption" tone="tertiary">
            Cost per item is strictly private to your shop reports and never displayed to
            shoppers.
          </VemtapText>
        </SetupCard>

        <SetupCard>
          <View className="gap-1">
            <BusinessSectionHeading
              title="Product Variants"
              icon="tune"
              trailing={
                <Switch
                  accessibilityRole="switch"
                  accessibilityLabel="Product Variants"
                  value={variantsEnabled}
                  onValueChange={setVariantsEnabled}
                  trackColor={{
                    false: colors.surfaceContainerHighest,
                    true: colors.primary,
                  }}
                  thumbColor={colors.surface}
                  ios_backgroundColor={colors.surfaceContainerHighest}
                />
              }
            />
            <VemtapText variant="caption" tone="secondary">
              Sizes, cuts, colors or preparation styles
            </VemtapText>
          </View>
          {variantsEnabled ? (
            <>
              <View className="flex-row items-center justify-between rounded-lg bg-surface-container-low px-4 py-3">
                <View className="min-w-0 flex-1 flex-row items-center gap-2">
                  <VemtapText variant="labelMd" tone="secondary">
                    Active Option:
                  </VemtapText>
                  <VemtapText
                    variant="button"
                    className="font-sans-semibold text-primary"
                  >
                    Portion Size / Cut
                  </VemtapText>
                </View>
                <BusinessInlineAction label="Edit" icon="edit" />
              </View>
              <ProductVariantList
                variants={variants}
                onPriceChange={updateVariantPrice}
                onInventoryChange={updateVariantInventory}
                onDelete={id =>
                  setVariants(current => current.filter(variant => variant.id !== id))
                }
              />
              <Button
                label="+ Add Another Option / Variant"
                variant="secondary"
                className="min-h-12"
                leftIcon={<Icon name="plusCircle" size={20} color={colors.primary} />}
                onPress={addVariant}
              />
            </>
          ) : null}
        </SetupCard>

        <SetupCard>
          <BusinessSectionHeading
            title="Inventory & SKU"
            icon="inventory"
            trailing={<BusinessStatusPill label="Auto-synced" tone="neutral" />}
          />
          <View className="flex-row items-center justify-between gap-2 rounded-xl bg-surface-container-low p-3">
            <View className="min-w-0 flex-1 flex-row items-center gap-3">
              <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface shadow-sm">
                <Icon name="productionLimits" size={22} color={colors.primary} />
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText variant="caption" tone="secondary">
                  Combined Variant Stock
                </VemtapText>
                <VemtapText variant="headingSm" className="min-w-0">
                  {totalStock} units available
                </VemtapText>
              </View>
            </View>
            <Icon name="checkCircle" size={20} color={colors.textTertiary} />
          </View>
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="labelMd" className="min-w-0 flex-1 font-sans-semibold">
              SKU / Barcode
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary" className="shrink-0">
              Optional
            </VemtapText>
          </View>
          <BusinessNumberInput
            label=""
            value={sku}
            onChangeText={setSku}
            keyboardType="default"
            accessibilityLabel="SKU or Barcode"
            trailingIcon={<Icon name="barcode" size={20} color={colors.textSecondary} />}
          />
          <BusinessNumberInput
            label="Low Stock Alert Threshold"
            value={lowStockThreshold}
            onChangeText={setLowStockThreshold}
            trailingText="units"
            accessibilityLabel="Low Stock Alert Threshold"
          />
          <VemtapText variant="caption" tone="secondary">
            Receive WhatsApp & In-app notification when stock drops below this number.
          </VemtapText>
          <BusinessSwitchRow
            title="Continue selling when out of stock"
            subtitle="Orders will still be accepted for backorder or pre-prep"
            value={backorder}
            onValueChange={setBackorder}
          />
        </SetupCard>

        <View className="flex-row items-center gap-3 rounded-xl bg-surface-tint p-3">
          <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Icon name="verified" size={18} color={colors.primary} />
          </View>
          <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
            Products with clear variant options like{' '}
            <VemtapText className="font-sans-semibold text-primary">
              Portion Size
            </VemtapText>{' '}
            convert up to 2.4x higher on local search.
          </VemtapText>
        </View>
      </View>
    </BusinessScreenLayout>
  );
}
