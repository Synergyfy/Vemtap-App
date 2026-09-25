import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import {
  BusinessActionDock,
  BusinessCheckRow,
  BusinessInlineAction,
  BusinessProgress,
  BusinessScreenLayout,
  BusinessSectionHeading,
  BusinessSelectionChip,
  BusinessStatusPill,
  SetupCard,
} from '@features/business/components/BusinessPrimitives';
import { productBranches } from '@features/business/data/businessSetupData';

export type ProductBranchAvailabilityValue = {
  selectedBranchIds: string[];
  pricingMode: 'unified' | 'custom';
  fulfillment: string[];
  preparationWindow: string;
};

export interface AddProductBranchAvailabilityScreenProps {
  onBack: () => void;
  onContinue?: (value: ProductBranchAvailabilityValue) => void;
  onSaveDraft?: (value: ProductBranchAvailabilityValue) => void;
  onEditPrice?: (branchId: string) => void;
}

const fulfillmentOptions = [
  {
    id: 'pickup',
    title: 'In-Store Pickup / Dine-In Walk',
    subtitle: 'Customers pick up directly from active counters.',
    badge: 'Instant',
  },
  {
    id: 'delivery',
    title: 'Local Delivery / Express Dispatch',
    subtitle: 'Direct merchant courier rider, 30–45 mins within district perimeter.',
    badge: '',
  },
] as const;

const preparationOptions = [
  {
    id: '10-15',
    title: '10 – 15m',
    detail: 'Express',
    message: 'Ready in 10 - 15 minutes',
  },
  {
    id: '20-30',
    title: '20 – 30m',
    detail: 'Standard',
    message: 'Ready in 20 - 30 minutes',
  },
  {
    id: '45-60',
    title: '45 – 60m',
    detail: 'Custom',
    message: 'Ready in 45 - 60 minutes',
  },
] as const;

export function AddProductBranchAvailabilityScreen({
  onBack,
  onContinue,
  onSaveDraft,
  onEditPrice,
}: AddProductBranchAvailabilityScreenProps) {
  const [selectedBranchIds, setSelectedBranchIds] = useState(['wuse', 'garki']);
  const [pricingMode, setPricingMode] = useState<'unified' | 'custom'>('unified');
  const [fulfillment, setFulfillment] = useState(['pickup', 'delivery']);
  const [preparationWindow, setPreparationWindow] = useState('20-30');
  const value = useMemo(
    () => ({ selectedBranchIds, pricingMode, fulfillment, preparationWindow }),
    [fulfillment, preparationWindow, pricingMode, selectedBranchIds],
  );
  const selectedMessage =
    preparationOptions.find(option => option.id === preparationWindow)?.message ??
    'Ready in 20 - 30 minutes';

  const toggleBranch = (id: string) => {
    setSelectedBranchIds(current =>
      current.includes(id)
        ? current.filter(branchId => branchId !== id)
        : [...current, id],
    );
  };
  const toggleFulfillment = (id: string) => {
    setFulfillment(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );
  };
  const toggleAll = () => {
    setSelectedBranchIds(current => (current.length === 2 ? [] : ['wuse', 'garki']));
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
          <View className="flex-row gap-3">
            <Button
              label="Back"
              labelNumberOfLines={2}
              variant="secondary"
              fullWidth={false}
              className="min-h-[52px] min-w-[84px] px-5"
              onPress={onBack}
            />
            <Button
              label="Review & Publish"
              labelNumberOfLines={2}
              className="min-h-[52px] min-w-0 flex-1 py-2 shadow-lg"
              rightIcon={<Icon name="arrowForward" size={18} color={colors.surface} />}
              onPress={() => onContinue?.(value)}
            />
          </View>
        </BusinessActionDock>
      }
    >
      <BusinessProgress
        label="Step 3 of 4: Branch Availability"
        percent={75}
        completionLabel="75% Complete"
        compact
      />
      <View className="mt-3">
        <VemtapText
          accessibilityRole="header"
          variant="headingMd"
          className="text-heading-md"
        >
          Where is this sold & fulfilled?
        </VemtapText>
        <VemtapText tone="secondary" className="mt-1">
          Assign which of your registered branch locations stock and fulfill this item.
        </VemtapText>
      </View>

      <View className="mt-4 gap-6">
        <View className="gap-3">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="labelMd" className="min-w-0 flex-1 font-sans-medium">
              Select available locations
            </VemtapText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Select all active branches"
              hitSlop={8}
              className="shrink-0"
              onPress={toggleAll}
            >
              <VemtapText variant="caption" className="text-primary">
                Select all (2 active)
              </VemtapText>
            </Pressable>
          </View>
          {productBranches.map(branch => {
            const inactive = branch.id === 'maitama';
            const selected = selectedBranchIds.includes(branch.id);
            return (
              <View
                key={branch.id}
                className={cn(
                  'gap-3 rounded-card bg-surface p-4 shadow-sm',
                  inactive && 'bg-surface-container-low/60 opacity-75',
                  !inactive && !selected && 'opacity-50',
                )}
              >
                <View className="flex-row items-start gap-3">
                  {inactive ? (
                    <View className="mt-0.5 h-6 w-6 shrink-0 items-center justify-center">
                      <View className="h-5 w-5 items-center justify-center rounded-md bg-surface-container-high">
                        <Icon name="lock" size={14} color={colors.outline} />
                      </View>
                    </View>
                  ) : (
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected }}
                      accessibilityLabel={`Select ${branch.name}`}
                      className="mt-0.5 h-6 w-6 shrink-0 items-center justify-center"
                      onPress={() => toggleBranch(branch.id)}
                    >
                      <View
                        className={cn(
                          'h-5 w-5 items-center justify-center rounded-md',
                          selected ? 'bg-primary' : 'bg-surface-container-high',
                        )}
                      >
                        {selected ? (
                          <Icon name="check" size={15} color={colors.surface} />
                        ) : null}
                      </View>
                    </Pressable>
                  )}
                  <View className="min-w-0 flex-1">
                    <View className="flex-row flex-wrap items-center gap-2">
                      <VemtapText
                        variant="button"
                        className={cn('min-w-0', inactive && 'text-text-secondary')}
                        numberOfLines={1}
                      >
                        {branch.name}
                      </VemtapText>
                      <BusinessStatusPill
                        label={branch.badge}
                        tone={branch.id === 'wuse' ? 'brand' : 'neutral'}
                      />
                    </View>
                    <VemtapText
                      variant="caption"
                      tone={inactive ? 'tertiary' : 'secondary'}
                      className="mt-0.5"
                    >
                      {branch.address}
                    </VemtapText>
                    {inactive ? (
                      <VemtapText variant="caption" tone="tertiary" className="mt-3">
                        {branch.stock}
                      </VemtapText>
                    ) : (
                      <View className="mt-3 flex-row items-center justify-between gap-2">
                        <View className="flex-row items-center gap-1.5 rounded-md bg-badge-discount-bg px-2 py-1">
                          <View className="h-1.5 w-1.5 rounded-full bg-badge-discount-text" />
                          <VemtapText
                            variant="caption"
                            className="text-badge-discount-text"
                          >
                            {branch.stock}
                          </VemtapText>
                        </View>
                        <BusinessInlineAction
                          label="Edit Price"
                          icon="edit"
                          onPress={() => onEditPrice?.(branch.id)}
                        />
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <SetupCard>
          <BusinessSectionHeading title="Location Pricing Mode" icon="tune" />
          <View className="gap-3">
            <BusinessCheckRow
              type="radio"
              title="Use same base price across branches"
              subtitle="Single standard checkout price across Abuja branches."
              selected={pricingMode === 'unified'}
              onPress={() => setPricingMode('unified')}
            />
            <BusinessCheckRow
              type="radio"
              title="Customize prices per branch"
              subtitle="Adjust for varying logistics, rent, or regional premiums."
              selected={pricingMode === 'custom'}
              onPress={() => setPricingMode('custom')}
            />
          </View>
        </SetupCard>

        <SetupCard>
          <View className="gap-1">
            <BusinessSectionHeading
              title="Fulfillment & Ordering"
              icon="delivery"
              trailing={<BusinessStatusPill label="Jumia / Jiji Ready" tone="success" />}
            />
            <VemtapText variant="caption" tone="secondary">
              Define how hyper-local shoppers receive this item.
            </VemtapText>
          </View>
          <View className="gap-3">
            {fulfillmentOptions.map(option => (
              <BusinessCheckRow
                key={option.id}
                title={option.title}
                subtitle={option.subtitle}
                badge={option.badge}
                selected={fulfillment.includes(option.id)}
                onPress={() => toggleFulfillment(option.id)}
                className="bg-surface"
              />
            ))}
            <View className="flex-row items-start gap-3 rounded-lg bg-surface-container-low p-3 opacity-60">
              <View className="mt-0.5 h-5 w-5 shrink-0 items-center justify-center rounded-md bg-surface-container-high">
                <Icon name="blocked" size={14} color={colors.outline} />
              </View>
              <View className="min-w-0 flex-1">
                <View className="flex-row flex-wrap items-center gap-2">
                  <VemtapText variant="labelMd" className="text-text-secondary">
                    Nationwide Interstate Waybill
                  </VemtapText>
                  <View className="rounded bg-error-container px-1.5 py-0.5">
                    <VemtapText className="text-micro text-error">Perishable</VemtapText>
                  </View>
                </View>
                <VemtapText variant="caption" tone="tertiary" className="mt-0.5">
                  Unavailable for freshly prepared or temperature-sensitive goods.
                </VemtapText>
              </View>
            </View>
          </View>
        </SetupCard>

        <SetupCard>
          <View className="gap-1">
            <BusinessSectionHeading
              title="Handling & Prep Window"
              icon="schedule"
              trailing={
                <VemtapText variant="caption" tone="secondary" className="shrink-0">
                  Expected Lead
                </VemtapText>
              }
            />
            <VemtapText variant="caption" tone="secondary">
              Time needed from order confirmation to rider handoff or customer collection.
            </VemtapText>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {preparationOptions.map(option => (
              <BusinessSelectionChip
                key={option.id}
                label={`${option.title} · ${option.detail}`}
                labelNumberOfLines={2}
                selected={preparationWindow === option.id}
                onPress={() => setPreparationWindow(option.id)}
                className="min-w-[68px] flex-1"
              />
            ))}
          </View>
          <View className="flex-row items-center gap-2 rounded-lg bg-surface-container-low p-2">
            <Icon name="info" size={16} color={colors.primary} />
            <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
              Selected window:{' '}
              <VemtapText className="font-sans-semibold text-text">
                {selectedMessage}
              </VemtapText>{' '}
              for live dispatch.
            </VemtapText>
          </View>
        </SetupCard>
      </View>
    </BusinessScreenLayout>
  );
}
