import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import { HorizontallyScrollableRow } from '@features/business/components/BusinessSetupPrimitives';
import {
  BusinessActionDock,
  BusinessCheckRow,
  BusinessNumberInput,
  BusinessRange,
  BusinessScreenLayout,
  BusinessSectionHeading,
  BusinessStatusPill,
  BusinessStepper,
  BusinessTextArea,
  SetupCard,
} from '@features/business/components/BusinessPrimitives';
import { ProductStatusSnapshot } from '@features/business/components/BusinessProductContent';
import {
  businessMedia,
  formatNaira,
  participatingDealBranches,
  productIdentity,
  weekDays,
} from '@features/business/data/businessSetupData';

export type CreateDealOfferValue = {
  discountMode: 'percentage' | 'fixed' | 'bundle';
  discountPercent: number;
  totalVouchers: number;
  selectedBranchIds: string[];
  redemptionDays: string[];
  terms: string;
};

export interface CreateDealOfferAutoImportedScreenProps {
  onBack: () => void;
  onPublish?: (value: CreateDealOfferValue) => void;
  onCancel?: () => void;
  onSaveDraft?: (value: CreateDealOfferValue) => void;
}

const initialTerms =
  'Show voucher code before ordering. Dine-in only. Valid from 12:00 PM - 5:00 PM on eligible redemption days.';

export function CreateDealOfferAutoImportedScreen({
  onBack,
  onPublish,
  onCancel,
  onSaveDraft,
}: CreateDealOfferAutoImportedScreenProps) {
  const [discountMode, setDiscountMode] =
    useState<CreateDealOfferValue['discountMode']>('percentage');
  const [discountPercent, setDiscountPercent] = useState(20);
  const [vouchers, setVouchers] = useState(50);
  const [selectedBranchIds, setSelectedBranchIds] = useState(['wuse-ii', 'garki-ii']);
  const [redemptionDays, setRedemptionDays] = useState([
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
  ]);
  const [terms, setTerms] = useState(initialTerms);
  const savings = Math.round(12000 * (discountPercent / 100));
  const memberPrice = formatNaira(12000 - savings);
  const value = useMemo(
    () => ({
      discountMode,
      discountPercent,
      totalVouchers: vouchers,
      selectedBranchIds,
      redemptionDays,
      terms,
    }),
    [discountMode, discountPercent, redemptionDays, selectedBranchIds, terms, vouchers],
  );
  const toggleBranch = (id: string) => {
    setSelectedBranchIds(current =>
      current.includes(id)
        ? current.filter(branchId => branchId !== id)
        : [...current, id],
    );
  };
  const toggleDay = (day: string) => {
    setRedemptionDays(current =>
      current.includes(day) ? current.filter(item => item !== day) : [...current, day],
    );
  };

  return (
    <BusinessScreenLayout
      header={{
        title: 'Product Deal Preview',
        eyebrow: 'Step 2 of 4',
        onBack,
        actionLabel: 'Draft',
        onAction: () => onSaveDraft?.(value),
      }}
      contentContainerClassName="pb-10"
      footer={
        <BusinessActionDock>
          <Button
            label="Publish Deal to Nearby Feeds 🔥"
            labelVariant="labelMd"
            labelNumberOfLines={2}
            className="min-h-[52px] shadow-lg"
            rightIcon={<Icon name="arrowForward" size={20} color={colors.surface} />}
            onPress={() => onPublish?.(value)}
          />
          <Button
            label="Cancel & Keep Regular Product Only"
            labelVariant="labelMd"
            labelNumberOfLines={2}
            variant="ghost"
            className="min-h-9"
            onPress={onCancel ?? onBack}
          />
        </BusinessActionDock>
      }
    >
      <View className="rounded-xl bg-surface-tint p-4 shadow-sm">
        <View className="mb-1 flex-row items-center gap-2">
          <View className="h-5 w-5 items-center justify-center rounded-full bg-primary">
            <Icon name="bolt" size={14} color={colors.surface} />
          </View>
          <VemtapText
            variant="labelSm"
            className="min-w-0 flex-1 font-sans-semibold tracking-wide text-primary"
          >
            Auto-Imported from “{productIdentity.name}”
          </VemtapText>
        </View>
        <VemtapText variant="caption" tone="secondary">
          Adjust your discount, voucher quantity, and redemption terms. We pre-filled
          everything directly from your catalog!
        </VemtapText>
      </View>

      <View className="mt-3 gap-6">
        <ProductStatusSnapshot
          image={businessMedia.ribeyeAlternate}
          imageAlt="Woodfire Aged Ribeye Steak"
          name={productIdentity.name}
          statusLabel="Details Auto-Synced"
          statusTone="success"
          price={
            <View className="flex-row items-baseline gap-2">
              <VemtapText variant="caption" tone="tertiary">
                Catalog Base:
              </VemtapText>
              <VemtapText variant="labelMd" tone="secondary" className="line-through">
                ₦12,000
              </VemtapText>
            </View>
          }
        />

        <SetupCard>
          <BusinessSectionHeading
            title="Discount Strategy"
            trailing={<BusinessStatusPill label="Smart Calculator" />}
          />
          <View className="flex-row gap-1 rounded-xl bg-surface-container-low p-1">
            {[
              { id: 'percentage', label: '% Percentage' },
              { id: 'fixed', label: 'Fixed ₦ Off' },
              { id: 'bundle', label: 'Combo Bundle' },
            ].map(option => {
              const selected = discountMode === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  accessibilityLabel={option.label}
                  className={cn(
                    'min-h-10 min-w-0 flex-1 justify-center rounded-lg px-1',
                    selected && 'bg-surface shadow-sm',
                  )}
                  onPress={() =>
                    setDiscountMode(option.id as CreateDealOfferValue['discountMode'])
                  }
                >
                  <VemtapText
                    variant="labelSm"
                    className={cn(
                      'text-center',
                      selected ? 'text-primary' : 'text-text-secondary',
                    )}
                  >
                    {option.label}
                  </VemtapText>
                </Pressable>
              );
            })}
          </View>
          <HorizontallyScrollableRow>
            {[15, 20, 25, 30, 40].map(percent => {
              const selected = discountPercent === percent;
              return (
                <Pressable
                  key={percent}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${percent} percent off`}
                  className={cn(
                    'min-w-0 items-center rounded-full px-3 py-1.5 active:scale-95',
                    selected ? 'bg-surface-tint shadow-sm' : 'bg-surface-container-low',
                  )}
                  onPress={() => setDiscountPercent(percent)}
                >
                  <VemtapText
                    variant="labelSm"
                    className={cn(
                      'text-center',
                      selected
                        ? 'font-sans-semibold text-primary'
                        : 'text-text-secondary',
                    )}
                  >
                    {percent}%{percent === 20 ? ' OFF' : ''}
                  </VemtapText>
                </Pressable>
              );
            })}
          </HorizontallyScrollableRow>
          <View className="gap-2 rounded-xl bg-surface-subtle p-3">
            <View className="flex-row items-center justify-between gap-3">
              <VemtapText variant="labelSm" tone="secondary">
                Custom Discount Rate
              </VemtapText>
              <View className="flex-row items-center rounded-lg bg-surface px-3 py-1 shadow-sm">
                <BusinessNumberInput
                  label=""
                  value={String(discountPercent)}
                  onChangeText={nextValue =>
                    setDiscountPercent(Math.max(5, Math.min(80, Number(nextValue) || 5)))
                  }
                  accessibilityLabel="Custom Discount Rate"
                  className="min-h-8 w-20 bg-transparent p-0"
                />
                <VemtapText variant="headingSm" className="font-sans-bold text-primary">
                  %
                </VemtapText>
              </View>
            </View>
            <BusinessRange
              value={discountPercent}
              minimum={5}
              maximum={75}
              onChange={setDiscountPercent}
              accessibilityLabel="Custom Discount Rate"
            />
          </View>
          <View className="gap-2 rounded-xl bg-surface-container-low p-4">
            <View className="flex-row items-center justify-between gap-3">
              <VemtapText variant="labelSm" tone="secondary">
                Regular Catalog Price
              </VemtapText>
              <VemtapText variant="labelSm" className="font-sans-medium">
                ₦12,000
              </VemtapText>
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <VemtapText variant="labelSm" tone="secondary">
                Deal Member Price
              </VemtapText>
              <VemtapText variant="headingSm" className="font-sans-bold text-primary">
                {memberPrice}
              </VemtapText>
            </View>
            <View className="flex-row flex-wrap items-center justify-between gap-2 pt-2">
              <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                Diner Incentive
              </VemtapText>
              <View className="max-w-full shrink-0 rounded-full bg-badge-discount-bg px-2.5 py-1">
                <VemtapText variant="labelSm" className="font-sans-bold text-success">
                  Customer Saves {formatNaira(savings)} ({discountPercent}%)
                </VemtapText>
              </View>
            </View>
          </View>
        </SetupCard>

        <SetupCard>
          <BusinessSectionHeading
            title="Limits & Scarcity"
            subtitle="Foster customer FOMO & prevent overflow"
            trailing={
              <View className="h-6 w-6 items-center justify-center">
                <Icon name="timer" size={22} color={colors.primary} />
              </View>
            }
          />
          <View className="gap-2 rounded-xl bg-surface-subtle p-3">
            <BusinessStepper
              label="Total Available Vouchers"
              value={vouchers}
              onDecrease={() => setVouchers(current => Math.max(10, current - 5))}
              onIncrease={() => setVouchers(current => Math.min(500, current + 5))}
              decreaseLabel="Decrease vouchers"
              increaseLabel="Increase vouchers"
              minimumReached={vouchers <= 10}
              maximumReached={vouchers >= 500}
            />
            <VemtapText variant="caption" tone="secondary">
              App alerts when 80% claimed
            </VemtapText>
          </View>
          <View className="flex-row gap-3">
            <InfoMetric icon="person" label="Claims / Customer" value="1 per person" />
            <InfoMetric icon="calendar" label="Validity Window" value="14 Days Claim" />
          </View>
          <View className="gap-2 pt-1">
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <VemtapText
                variant="labelSm"
                tone="secondary"
                className="min-w-0 flex-1 font-sans-medium"
              >
                Valid Redemption Days
              </VemtapText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Lunch Hours Only (12-5pm)"
                hitSlop={8}
                className="shrink-0"
                onPress={() => setRedemptionDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])}
              >
                <VemtapText variant="caption" className="font-sans-semibold text-primary">
                  Lunch Hours Only (12-5pm)
                </VemtapText>
              </Pressable>
            </View>
            <View className="flex-row gap-1.5">
              {weekDays.map(day => {
                const selected = redemptionDays.includes(day);
                return (
                  <Pressable
                    key={day}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={day}
                    className={cn(
                      'h-10 min-w-0 flex-1 items-center justify-center rounded-xl px-0',
                      selected ? 'bg-surface-tint shadow-sm' : 'bg-surface-container-low',
                    )}
                    onPress={() => toggleDay(day)}
                  >
                    <VemtapText
                      variant="labelSm"
                      numberOfLines={1}
                      className={cn(
                        'text-center',
                        selected ? 'font-sans-bold text-primary' : 'text-text-tertiary',
                      )}
                    >
                      {day}
                    </VemtapText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </SetupCard>

        <SetupCard className="gap-3">
          <BusinessSectionHeading
            title="Participating Locations"
            trailing={
              <VemtapText variant="caption" className="shrink-0 text-success">
                2 Active Stores
              </VemtapText>
            }
          />
          <View className="gap-2">
            {participatingDealBranches.map(branch => (
              <BusinessCheckRow
                key={branch.id}
                title={branch.name}
                subtitle={branch.address}
                icon="storefront"
                selected={selectedBranchIds.includes(branch.id)}
                onPress={() => toggleBranch(branch.id)}
                className="bg-surface-subtle"
              />
            ))}
          </View>
        </SetupCard>

        <SetupCard className="gap-2">
          <BusinessSectionHeading title="Terms & Claim Notes" icon="fileDocument" />
          <VemtapText variant="caption" tone="tertiary">
            Pre-composed from your restaurant dining policy:
          </VemtapText>
          <BusinessTextArea
            value={terms}
            onChangeText={setTerms}
            accessibilityLabel="Terms and Claim Notes"
            minHeight={104}
          />
        </SetupCard>

        <View className="flex-row items-center justify-center gap-2 py-2">
          <Icon name="verified" size={18} color={colors.badgeDiscountText} />
          <VemtapText variant="caption" tone="secondary" className="text-center">
            Push notifications sent to 1,420 foodies within 3.5 miles
          </VemtapText>
        </View>
      </View>
    </BusinessScreenLayout>
  );
}

function InfoMetric({
  icon,
  label,
  value,
}: {
  icon: 'person' | 'calendar';
  label: string;
  value: string;
}) {
  return (
    <View className="min-w-0 flex-1 gap-1 rounded-xl bg-surface-subtle p-3">
      <VemtapText variant="caption" tone="secondary">
        {label}
      </VemtapText>
      <View className="mt-0.5 flex-row items-center gap-1.5">
        <Icon name={icon} size={18} color={colors.primary} />
        <VemtapText variant="labelMd" className="min-w-0 font-sans-semibold">
          {value}
        </VemtapText>
      </View>
    </View>
  );
}
