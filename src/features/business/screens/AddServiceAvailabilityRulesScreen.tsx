import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';
import { BusinessSelectionChip } from '@features/business/components/BusinessPrimitives';
import {
  ServiceChoiceCard,
  ServiceFlowFooter,
  ServicePriceField,
  ServiceFlowPage,
  ServiceProgress,
  ServiceSection,
  ServiceSectionHeader,
} from '@features/business/components/ServiceFlowPrimitives';
import { strings } from '@constants/strings';
import {
  LocationScheduleSheet,
  type WeeklyHours,
} from '@features/business/components/LocationScheduleSheet';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';

cssInterop(Pressable, { className: 'style' });
cssInterop(View, { className: 'style' });

export type ServiceAvailabilityValue = {
  branchIds: string[];
  serviceMode: string;
  isBookable: boolean;
  /** Notice, horizon and capacity (the API's `bookingRules`). */
  rules: { leadMinutes: number; horizonDays: number; capacity: number };
  pricingMode: 'uniform' | 'per_branch';
  /** Price per selected branch (raw input) when priced per branch. */
  branchPrices: Record<string, string>;
  /** Selected branches with their own days/hours. */
  branchSchedules: (WeeklyHours & { branchId: string })[];
};

/** Lead-time choices → minutes of notice. */
const LEAD_MINUTES: Record<string, number> = {
  'same-day': 120,
  '12-hours': 720,
  '24-hours': 1440,
};
/** Horizon choices → days ahead. */
const HORIZON_DAYS: Record<string, number> = {
  '14-days': 14,
  '30-days': 30,
  '60-days': 60,
};
const keyFor = (map: Record<string, number>, value: number | undefined) =>
  Object.keys(map).find(key => map[key] === value);

export interface AddServiceAvailabilityRulesScreenProps {
  onBack: () => void;
  onNext?: (value: ServiceAvailabilityValue) => void;
  onSaveDraft?: (value: ServiceAvailabilityValue) => void;
  /** The business's real branches (only these ids are accepted by the API). */
  branches: readonly { id: string; name: string; address?: string | null }[];
  /** Branches ticked on arrival (all of them when absent). */
  initialBranchIds?: readonly string[];
  /** The base price from the pricing step, for the universal-price card. */
  basePrice?: string;
  /** Saved notice/horizon/capacity when the owner comes back to this step. */
  initialRules?: Partial<ServiceAvailabilityValue['rules']>;
  initialPricingMode?: ServiceAvailabilityValue['pricingMode'];
  initialBranchPrices?: Record<string, string>;
  /** The service-wide days/hours from the pricing step (live). */
  serviceSchedule?: WeeklyHours;
  initialBranchSchedules?: ServiceAvailabilityValue['branchSchedules'];
}

const copy = strings.serviceFlow;

export function AddServiceAvailabilityRulesScreen({
  onBack,
  onNext,
  onSaveDraft,
  branches,
  initialBranchIds,
  basePrice,
  initialRules,
  initialPricingMode,
  initialBranchPrices,
  serviceSchedule,
  initialBranchSchedules,
}: AddServiceAvailabilityRulesScreenProps) {
  const [schedules, setSchedules] = useState<Record<string, WeeklyHours>>(() =>
    Object.fromEntries(
      (initialBranchSchedules ?? []).map(({ branchId, ...hours }) => [branchId, hours]),
    ),
  );
  const [scheduling, setScheduling] = useState<{ id: string; name: string } | null>(null);
  const outlets = branches;
  const [selectedOutlets, setSelectedOutlets] = useState(
    () => new Set<string>(initialBranchIds ?? outlets.map(branch => branch.id)),
  );
  const [deselectMode, setDeselectMode] = useState(false);
  const [pricingMode, setPricingMode] = useState(
    initialPricingMode === 'per_branch' ? 'tiered' : 'universal',
  );
  const [branchPrices, setBranchPrices] = useState<Record<string, string>>(
    initialBranchPrices ?? {},
  );
  const tiered = pricingMode === 'tiered';
  // A branch with no price of its own starts from the base price.
  const priceFor = (branchId: string) =>
    branchPrices[branchId] ?? (basePrice ?? '').replace(/[^0-9.,]/g, '');
  const missingPrice =
    tiered &&
    [...selectedOutlets].some(id => !(Number(priceFor(id).replace(/[^0-9.]/g, '')) > 0));
  const [leadTime, setLeadTime] = useState(
    keyFor(LEAD_MINUTES, initialRules?.leadMinutes) ?? 'same-day',
  );
  const [horizon, setHorizon] = useState(
    keyFor(HORIZON_DAYS, initialRules?.horizonDays) ?? '30-days',
  );
  const [capacity, setCapacity] = useState(initialRules?.capacity ?? 2);

  const currentValue: ServiceAvailabilityValue = {
    branchIds: [...selectedOutlets],
    serviceMode: 'location',
    isBookable: leadTime !== 'never',
    rules: {
      leadMinutes: LEAD_MINUTES[leadTime] ?? 120,
      horizonDays: HORIZON_DAYS[horizon] ?? 30,
      capacity,
    },
    pricingMode: tiered ? 'per_branch' : 'uniform',
    branchPrices: tiered
      ? Object.fromEntries([...selectedOutlets].map(id => [id, priceFor(id)]))
      : {},
    // Only branches still offering the service keep their own schedule.
    branchSchedules: [...selectedOutlets]
      .filter(id => schedules[id])
      .map(id => ({ branchId: id, ...schedules[id] })),
  };

  const toggleOutlet = (id: string) => {
    setSelectedOutlets(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllOutlets = () => {
    const nextDeselectMode = !deselectMode;
    setDeselectMode(nextDeselectMode);
    setSelectedOutlets(
      nextDeselectMode ? new Set<string>() : new Set(outlets.map(branch => branch.id)),
    );
  };

  return (
    <ServiceFlowPage
      title="Add Service   Step 3: Branch Availability & Appointment Rules"
      onBack={onBack}
      onSaveDraft={() => onSaveDraft?.(currentValue)}
      footer={
        <ServiceFlowFooter
          primaryLabel="Review & Publish"
          primaryDisabled={selectedOutlets.size === 0 || missingPrice}
          onPrimary={() => onNext?.(currentValue)}
          backLabel="Back"
          onBack={onBack}
        />
      }
      contentContainerClassName="px-6 pb-10 pt-4"
    >
      <View className="gap-8">
        <View className="-mx-6 gap-2 bg-surface-container-low px-6 pb-3 pt-4">
          <ServiceProgress
            stepLabel="Step 3 of 4: Availability & Rules"
            statusLabel="75% Complete"
            progress={75}
            description="Select which branches offer this service and set booking schedule windows."
            stepLabelClassName="text-text"
          />
        </View>

        <View className="gap-3">
          <ServiceSectionHeader
            icon="storefront"
            title="Available Outlets & Studios"
            actionLabel={deselectMode ? copy.deselectAll : copy.selectAll(outlets.length)}
            onAction={toggleAllOutlets}
          />
          <View className="gap-3">
            {outlets.length === 0 ? (
              <VemtapText variant="caption" tone="secondary">
                {copy.noBranches}
              </VemtapText>
            ) : null}
            {outlets.map((branch, index) => {
              const selected = selectedOutlets.has(branch.id);
              return (
                <ServiceSection key={branch.id} className="gap-3">
                  <View className="flex-row items-start gap-3">
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityLabel={branch.name}
                      accessibilityState={{ checked: selected }}
                      onPress={() => toggleOutlet(branch.id)}
                      className="h-11 w-11 shrink-0 items-center justify-center"
                    >
                      <View
                        className={cn(
                          'h-5 w-5 items-center justify-center rounded-lg shadow-sm',
                          selected ? 'bg-primary' : 'bg-surface-container',
                        )}
                      >
                        {selected ? (
                          <Icon name="check" size={16} color={colors.surface} />
                        ) : null}
                      </View>
                    </Pressable>
                    <View className="min-w-0 flex-1">
                      <View className="flex-row flex-wrap items-center gap-2">
                        <VemtapText
                          variant="bodyMd"
                          className="min-w-0 font-sans-semibold text-text"
                          numberOfLines={1}
                        >
                          {branch.name}
                        </VemtapText>
                        {index === 0 ? (
                          <View className="rounded-full bg-secondary-container px-2 py-0.5">
                            <VemtapText
                              variant="caption"
                              className="font-sans-semibold text-on-secondary-container"
                            >
                              {copy.flagship}
                            </VemtapText>
                          </View>
                        ) : null}
                        {selected && schedules[branch.id] ? (
                          <View className="rounded-full bg-surface-tint px-2 py-0.5">
                            <VemtapText
                              variant="caption"
                              className="font-sans-semibold text-primary"
                            >
                              {copy.locationSchedule.customPill}
                            </VemtapText>
                          </View>
                        ) : null}
                      </View>
                      {branch.address ? (
                        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                          {branch.address}
                        </VemtapText>
                      ) : null}
                    </View>
                  </View>
                  {tiered && selected ? (
                    <ServicePriceField
                      label={copy.branchPriceLabel}
                      value={priceFor(branch.id)}
                      onChangeText={value =>
                        setBranchPrices(current => ({ ...current, [branch.id]: value }))
                      }
                      trailingLabel="NGN"
                    />
                  ) : null}
                  {!selected ? null : (
                    <View className="flex-row justify-end pt-1">
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Edit Location Schedule for ${branch.name}`}
                        onPress={() =>
                          setScheduling({ id: branch.id, name: branch.name })
                        }
                        className="min-h-11 flex-row items-center gap-1 rounded-lg bg-surface-tint px-2.5 active:scale-[0.98]"
                      >
                        <Icon name="locationSchedule" size={16} color={colors.primary} />
                        <VemtapText
                          variant="button"
                          tone="brand"
                          className="font-sans-medium"
                        >
                          Edit Location Schedule
                        </VemtapText>
                      </Pressable>
                    </View>
                  )}
                </ServiceSection>
              );
            })}
          </View>
        </View>

        <View className="gap-3">
          <ServiceSectionHeader icon="payments" title="Branch Pricing Mode" />
          <View accessibilityRole="radiogroup" className="gap-2">
            <ServiceChoiceCard
              title="Universal Session Price"
              description={
                basePrice ? copy.universalPrice(basePrice) : copy.universalPriceUnset
              }
              selected={pricingMode === 'universal'}
              onPress={() => setPricingMode('universal')}
              selectionPosition="left"
              selectionStyle="dot"
              selectedTone="surface"
            />
            <ServiceChoiceCard
              title="Tiered Branch Pricing"
              description="Set a different price at each branch (e.g. higher-rent locations)."
              selected={pricingMode === 'tiered'}
              onPress={() => setPricingMode('tiered')}
              selectionPosition="left"
              selectionStyle="dot"
              selectedTone="surface"
            />
          </View>
          {missingPrice ? (
            <VemtapText
              variant="caption"
              className="text-error"
              accessibilityRole="alert"
            >
              {copy.branchPriceMissing}
            </VemtapText>
          ) : null}
        </View>

        <View className="gap-4">
          <ServiceSectionHeader icon="tune" title="Booking Schedule & Slot Rules" />
          <ServiceSection className="gap-2">
            <VemtapText variant="labelMd" className="font-sans-semibold text-text">
              Minimum Lead Notice
            </VemtapText>
            <VemtapText variant="caption" tone="secondary">
              Earliest time before appointment a guest can book online.
            </VemtapText>
            <View
              accessibilityRole="radiogroup"
              className="mt-2 flex-row flex-wrap gap-2"
            >
              {[
                ['same-day', 'Same day (2 hrs)'],
                ['12-hours', '12 hrs ahead'],
                ['24-hours', '24 hrs ahead'],
              ].map(([value, label]) => (
                <BusinessSelectionChip
                  key={value}
                  label={label}
                  selected={leadTime === value}
                  tone="neutral"
                  onPress={() => setLeadTime(value)}
                />
              ))}
            </View>
          </ServiceSection>
          <ServiceSection className="gap-2">
            <VemtapText variant="labelMd" className="font-sans-semibold text-text">
              Maximum Booking Horizon
            </VemtapText>
            <VemtapText variant="caption" tone="secondary">
              How far into the future reservations are unlocked.
            </VemtapText>
            <View
              accessibilityRole="radiogroup"
              className="mt-2 flex-row flex-wrap gap-2"
            >
              {[
                ['14-days', '14 days'],
                ['30-days', '30 days in advance'],
                ['60-days', '60 days'],
              ].map(([value, label]) => (
                <BusinessSelectionChip
                  key={value}
                  label={label}
                  selected={horizon === value}
                  tone="neutral"
                  onPress={() => setHorizon(value)}
                />
              ))}
            </View>
          </ServiceSection>
          <ServiceSection className="flex-row flex-wrap items-center justify-between gap-3">
            <View className="min-w-[170px] flex-1">
              <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                Concurrent Bookings
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                Simultaneous client capacity per time window.
              </VemtapText>
            </View>
            <View className="shrink-0 flex-row items-center gap-1 rounded-card-lg bg-surface-muted p-1">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decrease concurrent bookings"
                disabled={capacity <= 1}
                onPress={() => setCapacity(current => Math.max(1, current - 1))}
                className="h-11 w-11 items-center justify-center rounded-lg bg-surface shadow-sm active:bg-surface-container"
              >
                <Icon name="remove" size={18} color={colors.surfaceDark} />
              </Pressable>
              <View className="min-w-[58px] flex-row items-center justify-center gap-1 px-1">
                <VemtapText variant="headingSm" className="font-sans-bold text-primary">
                  {capacity}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  slots
                </VemtapText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Increase concurrent bookings"
                disabled={capacity >= 12}
                onPress={() => setCapacity(current => Math.min(12, current + 1))}
                className="h-11 w-11 items-center justify-center rounded-lg bg-surface shadow-sm active:bg-surface-container"
              >
                <Icon name="plus" size={18} color={colors.surfaceDark} />
              </Pressable>
            </View>
          </ServiceSection>
        </View>

        <View className="gap-3">
          <ServiceSectionHeader icon="verifiedUser" title="Policies & Automation" />
          <ServiceSection>
            <View className="flex-row items-start gap-3">
              <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-container">
                <Icon name="schedule" size={18} color={colors.badgeDiscountText} />
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                  Free Cancellation Cutoff
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  Complimentary cancellation up to 2 hours before scheduled session start.
                </VemtapText>
              </View>
            </View>
            <View className="flex-row items-start gap-3">
              <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-tint">
                <Icon name="hourglass" size={18} color={colors.primary} />
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                  Late Arrival Grace Window
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  15 minutes buffer window maintained before the appointment slot is
                  released.
                </VemtapText>
              </View>
            </View>
            <View className="flex-row items-start gap-2 rounded-card-lg bg-surface-tint p-3">
              <Icon name="sms" size={20} color={colors.primary} />
              <VemtapText
                variant="caption"
                tone="secondary"
                className="min-w-0 flex-1 leading-relaxed"
              >
                <VemtapText tone="brand" className="font-sans-semibold">
                  Automated WhatsApp Concierge:
                </VemtapText>{' '}
                Reminders are automatically triggered 24 hours and 2 hours prior to the
                session.
              </VemtapText>
            </View>
          </ServiceSection>
        </View>
      </View>
      {serviceSchedule ? (
        <LocationScheduleSheet
          visible={scheduling !== null}
          onClose={() => setScheduling(null)}
          branchName={scheduling?.name ?? ''}
          serviceSchedule={serviceSchedule}
          value={scheduling ? schedules[scheduling.id] : undefined}
          onSave={next => {
            if (!scheduling) return;
            setSchedules(current => {
              const { [scheduling.id]: _previous, ...rest } = current;
              return next ? { ...rest, [scheduling.id]: next } : rest;
            });
          }}
        />
      ) : null}
    </ServiceFlowPage>
  );
}
