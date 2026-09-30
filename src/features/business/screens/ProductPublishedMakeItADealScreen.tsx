import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { BottomSheet } from '@components/shared/BottomSheet';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import {
  BusinessProductImage,
  BusinessScreenLayout,
  BusinessStatusPill,
  SetupCard,
} from '@features/business/components/BusinessPrimitives';
import {
  businessMedia,
  productIdentity,
} from '@features/business/data/businessSetupData';

export type QuickSetupDeal = {
  discountPercent: number;
  memberPrice: string;
  vouchersPerDay: number;
};

export interface ProductPublishedMakeItADealScreenProps {
  onBack: () => void;
  onConvertToDeal?: (deal: QuickSetupDeal) => void;
  onQuickSetupOpen?: () => void;
  onKeepRegularProduct?: () => void;
}

const discountOptions = [
  { percent: 15, price: '₦10,200' },
  { percent: 20, price: '₦9,600' },
  { percent: 25, price: '₦9,000' },
];

export function ProductPublishedMakeItADealScreen({
  onBack,
  onConvertToDeal,
  onQuickSetupOpen,
  onKeepRegularProduct,
}: ProductPublishedMakeItADealScreenProps) {
  const [quickSetupVisible, setQuickSetupVisible] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(15);
  const selectedDiscount =
    discountOptions.find(option => option.percent === discountPercent) ??
    discountOptions[0];
  const openQuickSetup = () => {
    setQuickSetupVisible(true);
    onQuickSetupOpen?.();
  };
  const publishDeal = () => {
    onConvertToDeal?.({
      discountPercent,
      memberPrice: selectedDiscount.price,
      vouchersPerDay: 25,
    });
    setQuickSetupVisible(false);
  };

  return (
    <BusinessScreenLayout
      header={{
        title: 'Create Deal Offer',
        eyebrow: 'Step 2 of 4',
        onBack,
        actionLabel: 'Draft',
      }}
      contentContainerClassName="gap-6 pb-10"
    >
      <View className="flex-row items-center justify-between gap-3 pt-2">
        <View className="flex-row gap-1">
          {Array.from({ length: 4 }, (_, index) => (
            <View
              key={index}
              className={cn(
                'h-1.5 rounded-full bg-badge-discount-text',
                index === 3 ? 'w-10' : 'w-7',
              )}
            />
          ))}
        </View>
        <BusinessStatusPill label="100% Complete" tone="success" icon="checkCircle" />
      </View>

      <SetupCard className="gap-3">
        <View className="flex-row items-center gap-2">
          <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-badge-discount-bg">
            <Icon name="verified" size={18} color={colors.badgeDiscountText} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="caption"
              className="font-sans-bold uppercase tracking-wider text-success"
            >
              Catalog Status
            </VemtapText>
            <VemtapText variant="headingSm" className="text-heading-sm">
              Product Live in Storefront Catalog!
            </VemtapText>
          </View>
        </View>
        <View className="flex-row items-center gap-3 rounded-lg bg-surface-container-low p-3">
          <View className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-container">
            <BusinessProductImage
              source={businessMedia.ribeyeAlternate}
              alt="Woodfire Aged Ribeye Steak"
              className="h-full w-full"
            />
            <View className="absolute bottom-1 left-1 rounded bg-surface-dark/80 px-1">
              <VemtapText variant="caption" className="font-sans-medium text-surface">
                Active
              </VemtapText>
            </View>
          </View>
          <View className="min-w-0 min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {productIdentity.name}
            </VemtapText>
            <VemtapText variant="button" className="mt-0.5 text-primary">
              ₦12,000 - ₦15,000
            </VemtapText>
            <View className="mt-1 flex-row flex-wrap items-center gap-2">
              <View className="flex-row items-center gap-1">
                <Icon name="storefront" size={13} color={colors.primary} />
                <VemtapText variant="caption" tone="secondary">
                  2 branches active
                </VemtapText>
              </View>
              <View className="flex-row items-center gap-1">
                <View className="h-1.5 w-1.5 rounded-full bg-badge-discount-text" />
                <VemtapText variant="caption" className="text-badge-discount-text">
                  In Stock
                </VemtapText>
              </View>
            </View>
          </View>
        </View>
      </SetupCard>

      <View className="gap-2">
        <View className="flex-row items-center gap-1.5 text-tertiary">
          <Icon name="fire" size={16} color={colors.tertiary} />
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold uppercase tracking-wider text-tertiary"
          >
            Growth Accelerator
          </VemtapText>
        </View>
        <VemtapText
          accessibilityRole="header"
          variant="headingMd"
          className="text-heading-md"
        >
          Make this product a{' '}
          <VemtapText className="text-primary">VEMTAP Deal?</VemtapText>
        </VemtapText>
        <VemtapText tone="secondary">
          Unlock foot traffic from nearby consumers actively scouting neighborhood offers
          right now.
        </VemtapText>
      </View>

      <SetupCard>
        <ComparisonRow
          icon="shoppingBag"
          title="Regular Product"
          badge="Standard"
          description="Listed in your standard menu catalog at full price. Reaches patrons already browsing your specific storefront profile."
        />
        <View className="h-px w-full bg-surface-container" />
        <ComparisonRow
          icon="radar"
          title="VEMTAP Deal Offer"
          badge="Discovery Radar"
          description="Featured on the Deals Feed, hyperlocal map pings, and real-time push alerts to drive walk-in customers into your branches."
          highlighted
        />
        <View className="flex-row items-start gap-2 rounded-lg bg-surface-tint p-3">
          <Icon name="lightbulb" size={18} color={colors.primary} />
          <VemtapText
            variant="caption"
            tone="secondary"
            className="min-w-0 min-w-0 flex-1"
          >
            <VemtapText className="font-sans-semibold">Merchant Pro Tip:</VemtapText> You
            do not have to discount everything. Pick signature dishes like this Ribeye
            Steak as magnet offers to pull first-time diners through your doors!
          </VemtapText>
        </View>
      </SetupCard>

      <View className="gap-3">
        <View className="gap-3 overflow-hidden rounded-card bg-surface p-4 shadow-md">
          <View className="flex-row items-center justify-between gap-2">
            <BusinessStatusPill label="Fastest Setup" icon="autoAwesome" />
            <VemtapText variant="caption" className="font-sans-semibold text-success">
              Ready in 30s
            </VemtapText>
          </View>
          <VemtapText variant="headingSm" className="text-heading-sm">
            Turn into a Deal Now 🔥
          </VemtapText>
          <VemtapText tone="secondary">
            We will automatically import your photos, description, and base pricing
            straight into the Deal Studio. Just choose your discount % and voucher quota!
          </VemtapText>
          <Button
            label="Convert to Deal Offer (Auto-Imported)"
            labelVariant="labelMd"
            labelNumberOfLines={2}
            className="min-h-[52px] shadow-lg"
            rightIcon={<Icon name="arrowForward" size={20} color={colors.surface} />}
            onPress={openQuickSetup}
          />
        </View>
        <View className="gap-3 rounded-card bg-surface p-4 shadow-sm">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            Keep as Regular Product Only
          </VemtapText>
          <VemtapText tone="secondary">
            Item remains active in your standard in-store and takeout menus without
            external deal radar highlights.
          </VemtapText>
          <Button
            label="View in Catalog • Add Another"
            labelVariant="labelMd"
            labelNumberOfLines={2}
            variant="secondary"
            className="min-h-12 border-0 bg-surface-container-high"
            leftIcon={<Icon name="inventory" size={18} color={colors.textSecondary} />}
            onPress={onKeepRegularProduct}
          />
        </View>
      </View>

      <View className="flex-row items-center justify-center gap-1 px-2">
        <Icon name="info" size={16} color={colors.textTertiary} />
        <VemtapText
          variant="caption"
          tone="secondary"
          className="min-w-0 flex-1 text-center"
        >
          Flexible control: you can switch or promote any item anytime directly from your
          Products tab.
        </VemtapText>
      </View>

      <BottomSheet
        visible={quickSetupVisible}
        onClose={() => setQuickSetupVisible(false)}
        title="Quick Setup: Woodfire Ribeye"
      >
        <View className="gap-4 px-6 pb-2">
          <View>
            <VemtapText
              variant="caption"
              className="font-sans-bold uppercase tracking-wider text-primary"
            >
              Instant Deal Auto-Sync
            </VemtapText>
          </View>
          <View className="gap-2">
            <VemtapText variant="labelMd" tone="secondary">
              Select Targeted Discount
            </VemtapText>
            <View className="flex-row gap-2">
              {discountOptions.map(option => {
                const selected = discountPercent === option.percent;
                return (
                  <Pressable
                    key={option.percent}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${option.percent}% OFF`}
                    className={cn(
                      'min-w-0 flex-1 items-center rounded-lg px-2 py-2.5',
                      selected ? 'bg-surface-tint' : 'bg-surface-container-high',
                    )}
                    onPress={() => setDiscountPercent(option.percent)}
                  >
                    <VemtapText
                      variant="button"
                      className={cn(
                        'min-w-0 text-center',
                        selected ? 'text-primary' : 'text-text',
                      )}
                    >
                      {option.percent}% OFF
                    </VemtapText>
                    <VemtapText
                      variant="caption"
                      tone="secondary"
                      className="min-w-0 text-center"
                    >
                      {option.price}
                    </VemtapText>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View className="flex-row items-center justify-between gap-3 rounded-lg bg-surface-container-low p-3">
            <View className="min-w-0 min-w-0 flex-1 flex-row items-center gap-2">
              <Icon name="confirmation" size={20} color={colors.primary} />
              <View className="min-w-0 flex-1">
                <VemtapText variant="labelSm" className="font-sans-semibold">
                  Voucher Limit
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  Caps daily foot traffic redemption
                </VemtapText>
              </View>
            </View>
            <VemtapText variant="button" className="shrink-0 font-sans-bold text-primary">
              25 Vouchers / Day
            </VemtapText>
          </View>
          <Button
            label="Publish VEMTAP Radar Deal"
            labelVariant="labelMd"
            className="min-h-[54px] shadow-lg"
            rightIcon={<Icon name="bolt" size={20} color={colors.surface} />}
            onPress={publishDeal}
          />
        </View>
      </BottomSheet>
    </BusinessScreenLayout>
  );
}

function ComparisonRow({
  icon,
  title,
  badge,
  description,
  highlighted = false,
}: {
  icon: 'shoppingBag' | 'radar';
  title: string;
  badge: string;
  description: string;
  highlighted?: boolean;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <View
        className={cn(
          'mt-0.5 h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          highlighted ? 'bg-surface-tint' : 'bg-surface-container-high',
        )}
      >
        <Icon
          name={icon}
          size={20}
          color={highlighted ? colors.primary : colors.textSecondary}
        />
      </View>
      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row flex-wrap items-center gap-2">
          <VemtapText
            variant="labelMd"
            className={highlighted ? 'text-primary' : undefined}
          >
            {title}
          </VemtapText>
          <BusinessStatusPill label={badge} tone={highlighted ? 'success' : 'neutral'} />
        </View>
        <VemtapText tone="secondary">{description}</VemtapText>
      </View>
    </View>
  );
}
