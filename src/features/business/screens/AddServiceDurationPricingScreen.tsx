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
import { strings } from '@constants/strings';
import { PromptDialog } from '@features/business/components/PromptDialog';
import type { ServiceBookingRules, ServiceTier } from '@store/catalogueDraftStore';
import {
  dailySlots,
  durationMinutes,
  parseTime,
  toClock,
  toHhmm,
} from '@features/business/utils/serviceSchedule';

cssInterop(Pressable, { className: 'style' });
cssInterop(View, { className: 'style' });

export type ServiceDurationPricingValue = {
  basePrice: string;
  compareAtPrice: string;
  duration: string;
  bookingEnabled: boolean;
  tiers: ServiceTier[];
  /** Days, hours, buffer and confirmation (the API's `bookingRules`). */
  schedule: Pick<
    ServiceBookingRules,
    'days' | 'from' | 'to' | 'bufferMinutes' | 'requiresConfirmation'
  >;
};

export interface AddServiceDurationPricingScreenProps {
  onBack: () => void;
  onNext?: (value: ServiceDurationPricingValue) => void;
  onSaveDraft?: (value: ServiceDurationPricingValue) => void;
  /**
   * Live mode starts from `initialValue` (or empty) instead of the design's
   * sample prices and tiers, makes hours, buffer and tiers editable, and
   * drops controls that have no backend.
   */
  live?: boolean;
  initialValue?: Partial<ServiceDurationPricingValue>;
}

const liveCopy = strings.serviceFlow;
/** Wizard weekday labels → the API's `0 = Sunday … 6 = Saturday`. */
const WEEKDAY_NUMBER: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

type Dialog = 'tier' | 'hours' | 'buffer' | null;

export function AddServiceDurationPricingScreen({
  onBack,
  onNext,
  onSaveDraft,
  live = false,
  initialValue,
}: AddServiceDurationPricingScreenProps) {
  const [basePrice, setBasePrice] = useState<string>(
    initialValue?.basePrice ?? (live ? '' : serviceFlowDraft.basePrice),
  );
  const [compareAtPrice, setCompareAtPrice] = useState<string>(
    initialValue?.compareAtPrice ?? (live ? '' : serviceFlowDraft.compareAtPrice),
  );
  const [duration, setDuration] = useState(initialValue?.duration ?? '60 mins');
  const [tiers, setTiers] = useState<
    { id: string; name: string; price: string; duration?: string; capacity?: string }[]
  >(() => initialValue?.tiers ?? (live ? [] : [...serviceTiers]));
  const [tiersEnabled, setTiersEnabled] = useState(
    live ? (initialValue?.tiers?.length ?? 0) > 0 : true,
  );
  const [bookingEnabled, setBookingEnabled] = useState(
    initialValue?.bookingEnabled ?? true,
  );
  const schedule = initialValue?.schedule;
  const [confirmationEnabled, setConfirmationEnabled] = useState(
    schedule?.requiresConfirmation ?? true,
  );
  const [activeDays, setActiveDays] = useState(
    () =>
      new Set<string>(
        schedule?.days
          ? serviceWeekdays.filter(day => schedule.days!.includes(WEEKDAY_NUMBER[day]))
          : serviceWeekdays.filter(day => day !== 'Sun'),
      ),
  );
  const [from, setFrom] = useState(parseTime(schedule?.from ?? '') ?? 9 * 60);
  const [to, setTo] = useState(parseTime(schedule?.to ?? '') ?? 18 * 60);
  const [buffer, setBuffer] = useState(schedule?.bufferMinutes ?? 15);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const minutes = durationMinutes(duration);
  const slots = dailySlots(from, to, minutes, buffer);
  const base = Number(basePrice.replace(/[^0-9.]/g, '')) || 0;
  const was = Number(compareAtPrice.replace(/[^0-9.]/g, '')) || 0;
  const saving =
    was > base && base > 0
      ? liveCopy.save(
          `\u20a6${(was - base).toLocaleString('en-NG')}`,
          Math.round(((was - base) / was) * 100),
        )
      : undefined;
  const canContinue = !live || base > 0;

  const currentValue: ServiceDurationPricingValue = {
    basePrice,
    compareAtPrice,
    duration,
    bookingEnabled,
    tiers: tiersEnabled
      ? tiers.map(tier => ({
          id: tier.id,
          name: tier.name,
          price: tier.price,
          duration: tier.duration,
        }))
      : [],
    schedule: {
      days: serviceWeekdays
        .filter(day => activeDays.has(day))
        .map(day => WEEKDAY_NUMBER[day]),
      from: toHhmm(from),
      to: toHhmm(to),
      bufferMinutes: buffer,
      requiresConfirmation: confirmationEnabled,
    },
  };

  const closeDialog = () => {
    setDialog(null);
    setDialogError(null);
  };

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
      onSaveDraft={() => onSaveDraft?.(currentValue)}
      footer={
        <ServiceFlowFooter
          primaryLabel="Continue to Branch Availability"
          primaryDisabled={!canContinue}
          onPrimary={() => onNext?.(currentValue)}
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
              badge={live ? saving : 'Save ₦4,000 (20% OFF)'}
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
                    {live ? liveCopy.bufferTitle(buffer) : '15 mins turnaround buffer'}
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
              onPress={live ? () => setDialog('buffer') : undefined}
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
                    {liveCopy.activeTiers(tiersEnabled ? tiers.length : 0)}
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
          {live ? null : (
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
          )}
          {live && (!tiersEnabled || tiers.length === 0) ? (
            <VemtapText variant="caption" tone="secondary">
              {liveCopy.noTiers}
            </VemtapText>
          ) : null}
          <View className="gap-3">
            {(tiersEnabled ? tiers : []).map(tier => (
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
                    {tier.duration ? (
                      <View className="rounded-full bg-surface-tint px-2 py-0.5">
                        <VemtapText variant="caption" tone="brand">
                          {tier.duration}
                        </VemtapText>
                      </View>
                    ) : null}
                  </View>
                  <View className="flex-row flex-wrap items-center gap-3">
                    <VemtapText variant="labelMd" tone="brand" className="font-sans-bold">
                      {live
                        ? `\u20a6${(Number(tier.price.replace(/[^0-9.]/g, '')) || 0).toLocaleString('en-NG')}`
                        : tier.price}
                    </VemtapText>
                    {tier.capacity ? (
                      <View className="flex-row items-center gap-1">
                        <Icon name="person" size={14} color={colors.textSecondary} />
                        <VemtapText variant="caption" tone="secondary">
                          {tier.capacity}
                        </VemtapText>
                      </View>
                    ) : null}
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
            label={liveCopy.addTier}
            icon="plusCircle"
            className="bg-surface-tint active:bg-surface-tint-blue"
            onPress={
              live
                ? () => {
                    setTiersEnabled(true);
                    setDialog('tier');
                  }
                : undefined
            }
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
                  ['Start Time', live ? toClock(from) : '09:00 AM'],
                  ['End Time', live ? toClock(to) : '06:00 PM'],
                ].map(([label, value]) => (
                  <Pressable
                    key={label}
                    accessibilityRole="button"
                    accessibilityLabel={`${label}: ${value}`}
                    disabled={!live}
                    onPress={() => setDialog('hours')}
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
                  </Pressable>
                ))}
              </View>
            </View>
            <View className="flex-row items-start gap-1.5 pt-0.5">
              <Icon name="info" size={16} color={colors.primary} />
              <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                {live
                  ? liveCopy.slotsNote(minutes, buffer)
                  : '60 mins appointment slots (15 mins cleanup buffer auto-added)'}
              </VemtapText>
            </View>
          </View>
          <View className="gap-1.5">
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <VemtapText variant="caption" tone="secondary" className="font-sans-medium">
                Preview Slot Intervals
              </VemtapText>
              <VemtapText variant="caption" tone="success" className="font-sans-semibold">
                {live ? liveCopy.dailyWindows(slots.length) : '7 Daily Windows'}
              </VemtapText>
            </View>
            <View className="flex-row flex-wrap gap-1.5">
              {(live
                ? [
                    ...slots.slice(0, 5).map(toClock),
                    ...(slots.length > 5 ? [liveCopy.moreSlots(slots.length - 5)] : []),
                  ]
                : servicePreviewSlots
              ).map((slot, index, all) => (
                <View
                  key={slot}
                  className={
                    index < all.length - 1 || (live && slots.length <= 5)
                      ? 'rounded-lg bg-surface-tint px-2.5 py-2'
                      : 'rounded-lg bg-surface-container-low px-2.5 py-2'
                  }
                >
                  <VemtapText
                    variant="labelSm"
                    className={
                      index < all.length - 1 || (live && slots.length <= 5)
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
          {live ? null : (
            <ServiceLinkButton
              label="Customize Specific Dates & Blockouts"
              icon="doNotDisturb"
            />
          )}
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
                  {live ? liveCopy.confirmTitle : 'Advance consultation confirmation'}
                </VemtapText>
                {live ? null : (
                  <View className="rounded bg-success-container px-1.5 py-0.5">
                    <VemtapText
                      variant="micro"
                      tone="success"
                      className="font-sans-medium"
                    >
                      WhatsApp
                    </VemtapText>
                  </View>
                )}
              </View>
              <VemtapText variant="caption" tone="secondary">
                {live
                  ? liveCopy.confirmBody
                  : 'Send automated instant WhatsApp ping to confirm high-value visits'}
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
      {live ? (
        <>
          <PromptDialog
            visible={dialog === 'tier'}
            title={liveCopy.tierDialog.title}
            fields={[
              { key: 'name', label: liveCopy.tierDialog.name, value: '' },
              {
                key: 'price',
                label: liveCopy.tierDialog.price,
                value: '',
                keyboardType: 'decimal-pad',
              },
              { key: 'duration', label: liveCopy.tierDialog.duration, value: '' },
            ]}
            confirmLabel={liveCopy.tierDialog.confirm}
            error={dialogError}
            onChangeField={() => setDialogError(null)}
            onCancel={closeDialog}
            onConfirm={values => {
              const name = values.name?.trim() ?? '';
              const price = values.price?.trim() ?? '';
              if (!name) return setDialogError(liveCopy.tierDialog.nameRequired);
              if (!(Number(price.replace(/[^0-9.]/g, '')) > 0)) {
                return setDialogError(liveCopy.tierDialog.priceRequired);
              }
              setTiers(current => [
                ...current,
                {
                  id: `tier-${Date.now()}`,
                  name,
                  price,
                  duration: values.duration?.trim() || undefined,
                },
              ]);
              return closeDialog();
            }}
          />
          <PromptDialog
            visible={dialog === 'hours'}
            title={liveCopy.hoursDialog.title}
            fields={[
              { key: 'from', label: liveCopy.hoursDialog.from, value: toHhmm(from) },
              { key: 'to', label: liveCopy.hoursDialog.to, value: toHhmm(to) },
            ]}
            confirmLabel={liveCopy.hoursDialog.confirm}
            error={dialogError}
            onChangeField={() => setDialogError(null)}
            onCancel={closeDialog}
            onConfirm={values => {
              const start = parseTime(values.from ?? '');
              const end = parseTime(values.to ?? '');
              if (start === null || end === null || end <= start) {
                return setDialogError(liveCopy.hoursDialog.invalid);
              }
              setFrom(start);
              setTo(end);
              return closeDialog();
            }}
          />
          <PromptDialog
            visible={dialog === 'buffer'}
            title={liveCopy.bufferDialog.title}
            fields={[
              {
                key: 'minutes',
                label: liveCopy.bufferDialog.minutes,
                value: String(buffer),
                keyboardType: 'numeric',
              },
            ]}
            confirmLabel={liveCopy.bufferDialog.confirm}
            error={dialogError}
            onChangeField={() => setDialogError(null)}
            onCancel={closeDialog}
            onConfirm={values => {
              const next = Number(values.minutes);
              if (!Number.isInteger(next) || next < 0 || next > 240) {
                return setDialogError(liveCopy.bufferDialog.invalid);
              }
              setBuffer(next);
              return closeDialog();
            }}
          />
        </>
      ) : null}
    </ServiceFlowPage>
  );
}
