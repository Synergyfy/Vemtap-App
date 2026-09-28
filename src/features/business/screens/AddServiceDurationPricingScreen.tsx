import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import {
  ServiceChip,
  ServiceFlowFooter,
  ServiceFlowPage,
  ServiceInfoRow,
  ServiceLinkButton,
  ServicePriceField,
  ServiceProgress,
  ServiceSection,
  ServiceToggle,
} from '@features/business/components/ServiceFlowPrimitives';
import { BusinessSelectionChip } from '@features/business/components/BusinessPrimitives';
import {
  serviceDurations,
  serviceFlowDraft,
  servicePreviewSlots,
  serviceTiers,
  serviceWeekdays,
} from '@features/business/data/serviceFlowData';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';

cssInterop(Pressable, { className: 'style' });
cssInterop(View, { className: 'style' });

export interface AddServiceDurationPricingScreenProps {
  onBack: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
}

export function AddServiceDurationPricingScreen({
  onBack,
  onNext,
  onSaveDraft,
}: AddServiceDurationPricingScreenProps) {
  const [basePrice, setBasePrice] = useState<string>(serviceFlowDraft.basePrice);
  const [compareAtPrice, setCompareAtPrice] = useState<string>(
    serviceFlowDraft.compareAtPrice,
  );
  const [duration, setDuration] = useState('60 mins');
  const [tiers, setTiers] = useState([...serviceTiers]);
  const [tiersEnabled, setTiersEnabled] = useState(true);
  const [bookingEnabled, setBookingEnabled] = useState(true);
  const [confirmationEnabled, setConfirmationEnabled] = useState(true);
  const [activeDays, setActiveDays] = useState(
    () => new Set<string>(serviceWeekdays.filter(day => day !== 'Sun')),
  );

  const toggleDay = (day: string) => {
    setActiveDays(current => {
      const next = new Set(current);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  return (
    <ServiceFlowPage
      title="Add Service   Step 2: Duration Pricing & Staff/Tiers"
      onBack={onBack}
      onSaveDraft={onSaveDraft}
      footer={
        <ServiceFlowFooter
          primaryLabel="Continue to Branch Availability"
          onPrimary={onNext}
          backLabel="Back to Step 1"
          onBack={onBack}
        />
      }
      contentContainerClassName="px-6 pb-10 pt-4"
    >
      <View className="gap-6">
        <View className="-mx-6 bg-surface px-6 pb-3 pt-4 shadow-sm">
          <ServiceProgress
            stepLabel="Step 2 of 4"
            statusLabel="50% Completed"
            progress={50}
            title="Duration & Pricing"
            description="Define treatment duration, session pricing, tiered options, and specialist rates."
            showDot
            stepLabelClassName="uppercase tracking-wider"
          />
        </View>

        <ServiceSection>
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <View className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
                <Icon name="payments" size={20} color={colors.primary} />
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText variant="headingSm" className="text-heading-sm text-text">
                  Base Session Price
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  Standard one-on-one booking rate
                </VemtapText>
              </View>
            </View>
            <View className="shrink-0 rounded bg-surface-container-low px-2 py-0.5">
              <VemtapText variant="caption" tone="brand" className="font-sans-medium">
                Required
              </VemtapText>
            </View>
          </View>
          <View className="gap-3">
            <ServicePriceField
              label="Standard Base Price"
              value={basePrice}
              onChangeText={setBasePrice}
              trailingLabel="NGN"
              emphasized
            />
            <ServicePriceField
              label="Compare-at Price"
              optionalLabel="(Optional)"
              badge="Save ₦4,000 (20% OFF)"
              value={compareAtPrice}
              onChangeText={setCompareAtPrice}
              trailingIcon="localOffer"
              lineThrough
            />
          </View>
          <View className="gap-2 pt-2">
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <VemtapText variant="labelSm" className="font-sans-medium text-text">
                Service Duration
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                Client service window
              </VemtapText>
            </View>
            <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
              {serviceDurations.map(option => (
                <ServiceChip
                  key={option}
                  label={option}
                  selected={duration === option}
                  onPress={() => setDuration(option)}
                  leadingIcon={duration === option ? 'check' : undefined}
                />
              ))}
            </View>
          </View>
          <View className="flex-row flex-wrap items-center justify-between gap-2 rounded-card-lg bg-surface-container-low p-3">
            <View className="min-w-[190px] flex-1 flex-row items-center gap-2.5">
              <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container-highest">
                <Icon name="sanitizer" size={18} color={colors.primary} />
              </View>
              <View className="min-w-0 flex-1">
                <View className="flex-row items-center gap-1">
                  <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                    15 mins turnaround buffer
                  </VemtapText>
                  <Icon name="info" size={16} color={colors.textTertiary} />
                </View>
                <VemtapText variant="caption" tone="secondary">
                  Auto-reserves sanitation time between clients
                </VemtapText>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change turnaround buffer"
              className="min-h-11 shrink-0 justify-center rounded-field px-2"
            >
              <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
                Change
              </VemtapText>
            </Pressable>
          </View>
        </ServiceSection>

        <ServiceSection>
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1">
              <View className="flex-row flex-wrap items-center gap-2">
                <VemtapText variant="headingSm" className="text-heading-sm text-text">
                  Service Tiers &amp; Add-ons
                </VemtapText>
                <View className="rounded-full bg-success-container px-2 py-0.5">
                  <VemtapText variant="caption" tone="success" className="font-sans-bold">
                    {tiers.length} active
                  </VemtapText>
                </View>
              </View>
              <VemtapText variant="caption" tone="secondary">
                Upsell customized packages &amp; add-ons
              </VemtapText>
            </View>
            <View className="shrink-0 pt-1">
              <ServiceToggle
                value={tiersEnabled}
                onValueChange={setTiersEnabled}
                accessibilityLabel="Enable service tiers and add-ons"
              />
            </View>
          </View>
          <View className="flex-row flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-container-low px-3 py-2">
            <View className="min-w-0 flex-1 flex-row flex-wrap items-center gap-2">
              <VemtapText
                variant="caption"
                tone="secondary"
                className="min-w-0 font-sans-medium"
              >
                Option Group:
              </VemtapText>
              <VemtapText
                variant="labelSm"
                className="min-w-0 flex-1 font-sans-semibold text-text"
              >
                Treatment Depth / Tier
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit treatment depth tier option group"
              className="min-h-11 shrink-0 flex-row items-center gap-1 rounded-field px-2"
            >
              <Icon name="edit" size={16} color={colors.primary} />
              <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
                Edit
              </VemtapText>
            </Pressable>
          </View>
          <View className="gap-3">
            {tiers.map(tier => (
              <View
                key={tier.id}
                className="flex-row items-center justify-between gap-2 rounded-card-lg bg-surface-container-low p-3"
              >
                <View className="min-w-0 flex-1 gap-1">
                  <View className="flex-row flex-wrap items-center gap-2">
                    <VemtapText
                      variant="labelMd"
                      className="font-sans-semibold text-text"
                    >
                      {tier.name}
                    </VemtapText>
                    <View className="rounded-full bg-surface-tint px-2 py-0.5">
                      <VemtapText variant="caption" tone="brand">
                        {tier.duration}
                      </VemtapText>
                    </View>
                  </View>
                  <View className="flex-row flex-wrap items-center gap-3">
                    <VemtapText variant="labelMd" tone="brand" className="font-sans-bold">
                      {tier.price}
                    </VemtapText>
                    <View className="flex-row items-center gap-1">
                      <Icon name="person" size={14} color={colors.textSecondary} />
                      <VemtapText variant="caption" tone="secondary">
                        {tier.capacity}
                      </VemtapText>
                    </View>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${tier.name}`}
                  onPress={() =>
                    setTiers(current => current.filter(item => item.id !== tier.id))
                  }
                  className="h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-container-highest/60 active:bg-error-container"
                >
                  <Icon name="delete" size={20} color={colors.textTertiary} />
                </Pressable>
              </View>
            ))}
          </View>
          <ServiceLinkButton
            label="Add Another Tier or Add-on"
            icon="plusCircle"
            className="bg-surface-tint active:bg-surface-tint-blue"
          />
        </ServiceSection>

        <ServiceSection>
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1 flex-row items-start gap-2.5">
              <View className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
                <Icon name="calendar" size={20} color={colors.primary} />
              </View>
              <View className="min-w-0 flex-1">
                <View className="flex-row flex-wrap items-center gap-1.5">
                  <VemtapText variant="headingSm" className="text-heading-sm text-text">
                    Online Appointment Booking
                  </VemtapText>
                  <View className="rounded-full bg-success-container px-2 py-0.5">
                    <VemtapText
                      variant="caption"
                      tone="success"
                      className="font-sans-bold"
                    >
                      Live Sync
                    </VemtapText>
                  </View>
                </View>
                <VemtapText variant="caption" tone="secondary">
                  Allow clients to book slots directly via VEMTAP live calendar
                </VemtapText>
              </View>
            </View>
            <View className="shrink-0 pt-1">
              <ServiceToggle
                value={bookingEnabled}
                onValueChange={setBookingEnabled}
                accessibilityLabel="Enable online appointment booking"
              />
            </View>
          </View>
          <View className="gap-3 rounded-card-lg bg-surface-container-low p-3">
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <VemtapText variant="labelSm" className="font-sans-semibold text-text">
                Weekly Available Days
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {activeDays.size} days active
              </VemtapText>
            </View>
            <View accessibilityRole="radiogroup" className="flex-row gap-1">
              {serviceWeekdays.map(day => (
                <BusinessSelectionChip
                  key={day}
                  label={day}
                  selected={activeDays.has(day)}
                  tone="neutral"
                  onPress={() => toggleDay(day)}
                  className="min-w-0 flex-1 rounded-lg px-0"
                />
              ))}
            </View>
            <View className="mt-1 gap-1.5">
              <VemtapText variant="caption" tone="secondary" className="font-sans-medium">
                Available Daily Hours
              </VemtapText>
              <View className="flex-row gap-2">
                {[
                  ['Start Time', '09:00 AM'],
                  ['End Time', '06:00 PM'],
                ].map(([label, value]) => (
                  <View
                    key={label}
                    className="min-w-0 flex-1 flex-row items-center justify-between gap-1 rounded-lg border border-border bg-surface px-3 py-2"
                  >
                    <View className="min-w-0 flex-1">
                      <VemtapText variant="micro" tone="tertiary" className="uppercase">
                        {label}
                      </VemtapText>
                      <VemtapText
                        variant="labelMd"
                        className="font-sans-semibold text-text"
                      >
                        {value}
                      </VemtapText>
                    </View>
                    <Icon name="schedule" size={18} color={colors.textTertiary} />
                  </View>
                ))}
              </View>
            </View>
            <View className="flex-row items-start gap-1.5 pt-0.5">
              <Icon name="info" size={16} color={colors.primary} />
              <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                60 mins appointment slots (15 mins cleanup buffer auto-added)
              </VemtapText>
            </View>
          </View>
          <View className="gap-1.5">
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <VemtapText variant="caption" tone="secondary" className="font-sans-medium">
                Preview Slot Intervals
              </VemtapText>
              <VemtapText variant="caption" tone="success" className="font-sans-semibold">
                7 Daily Windows
              </VemtapText>
            </View>
            <View className="flex-row flex-wrap gap-1.5">
              {servicePreviewSlots.map((slot, index) => (
                <View
                  key={slot}
                  className={
                    index < servicePreviewSlots.length - 1
                      ? 'rounded-lg bg-surface-tint px-2.5 py-2'
                      : 'rounded-lg bg-surface-container-low px-2.5 py-2'
                  }
                >
                  <VemtapText
                    variant="labelSm"
                    className={
                      index < servicePreviewSlots.length - 1
                        ? 'font-sans-semibold text-primary'
                        : 'font-sans-medium text-text-secondary'
                    }
                  >
                    {slot}
                  </VemtapText>
                </View>
              ))}
            </View>
          </View>
          <ServiceLinkButton
            label="Customize Specific Dates & Blockouts"
            icon="doNotDisturb"
          />
        </ServiceSection>

        <ServiceSection>
          <View className="rounded-card bg-surface-tint p-4">
            <ServiceInfoRow
              icon="verifiedUser"
              title="VEMTAP Zero-Upfront Guarantee"
              description="Customers pay directly at your salon after treatment. VEMTAP never holds your payout or charges gateway checkout cuts."
              iconContainerClassName="bg-primary"
            />
          </View>
          <View className="flex-row flex-wrap items-center justify-between gap-3 rounded-card-lg bg-surface-container-low p-3">
            <View className="min-w-[190px] flex-1">
              <View className="flex-row flex-wrap items-center gap-1.5">
                <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                  Advance consultation confirmation
                </VemtapText>
                <View className="rounded bg-success-container px-1.5 py-0.5">
                  <VemtapText variant="micro" tone="success" className="font-sans-medium">
                    WhatsApp
                  </VemtapText>
                </View>
              </View>
              <VemtapText variant="caption" tone="secondary">
                Send automated instant WhatsApp ping to confirm high-value visits
              </VemtapText>
            </View>
            <View className="shrink-0">
              <ServiceToggle
                value={confirmationEnabled}
                onValueChange={setConfirmationEnabled}
                accessibilityLabel="Enable advance consultation confirmation"
              />
            </View>
          </View>
        </ServiceSection>
      </View>
    </ServiceFlowPage>
  );
}
