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
import {
  serviceDurations,
  serviceWeekdays,
} from '@features/business/data/serviceFlowData';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import { PromptDialog } from '@features/business/components/PromptDialog';
import { ServiceWeeklySchedule } from '@features/business/components/ServiceWeeklySchedule';
import { ServiceBlockoutsSheet } from '@features/business/components/ServiceBlockoutsSheet';
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
    'days' | 'from' | 'to' | 'bufferMinutes' | 'requiresConfirmation' | 'blockouts'
  >;
};

export interface AddServiceDurationPricingScreenProps {
  onBack: () => void;
  onNext?: (value: ServiceDurationPricingValue) => void;
  onSaveDraft?: (value: ServiceDurationPricingValue) => void;
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
  initialValue,
}: AddServiceDurationPricingScreenProps) {
  const [basePrice, setBasePrice] = useState<string>(initialValue?.basePrice ?? '');
  const [compareAtPrice, setCompareAtPrice] = useState<string>(
    initialValue?.compareAtPrice ?? '',
  );
  const [duration, setDuration] = useState(initialValue?.duration ?? '60 mins');
  const [tiers, setTiers] = useState<
    { id: string; name: string; price: string; duration?: string; capacity?: string }[]
  >(() => initialValue?.tiers ?? []);
  const [tiersEnabled, setTiersEnabled] = useState(
    (initialValue?.tiers?.length ?? 0) > 0,
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
  const [blockouts, setBlockouts] = useState(schedule?.blockouts ?? []);
  const [editingBlockouts, setEditingBlockouts] = useState(false);
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
  const canContinue = base > 0;

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
      blockouts,
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
              badge={saving}
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
                    {liveCopy.bufferTitle(buffer)}
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
              onPress={() => setDialog('buffer')}
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
          {!tiersEnabled || tiers.length === 0 ? (
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
                      {`\u20a6${(Number(tier.price.replace(/[^0-9.]/g, '')) || 0).toLocaleString('en-NG')}`}
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
            onPress={() => {
              setTiersEnabled(true);
              setDialog('tier');
            }}
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
          <ServiceWeeklySchedule
            activeDays={activeDays}
            onToggleDay={toggleDay}
            startLabel={toClock(from)}
            endLabel={toClock(to)}
            onPressHours={() => setDialog('hours')}
            footer={
              <View className="flex-row items-start gap-1.5 pt-0.5">
                <Icon name="info" size={16} color={colors.primary} />
                <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                  {liveCopy.slotsNote(minutes, buffer)}
                </VemtapText>
              </View>
            }
          />
          <View className="gap-1.5">
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <VemtapText variant="caption" tone="secondary" className="font-sans-medium">
                Preview Slot Intervals
              </VemtapText>
              <VemtapText variant="caption" tone="success" className="font-sans-semibold">
                {liveCopy.dailyWindows(slots.length)}
              </VemtapText>
            </View>
            <View className="flex-row flex-wrap gap-1.5">
              {[
                ...slots.slice(0, 5).map(toClock),
                ...(slots.length > 5 ? [liveCopy.moreSlots(slots.length - 5)] : []),
              ].map((slot, index, all) => (
                <View
                  key={slot}
                  className={
                    index < all.length - 1 || slots.length <= 5
                      ? 'rounded-lg bg-surface-tint px-2.5 py-2'
                      : 'rounded-lg bg-surface-container-low px-2.5 py-2'
                  }
                >
                  <VemtapText
                    variant="labelSm"
                    className={
                      index < all.length - 1 || slots.length <= 5
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
            onPress={() => setEditingBlockouts(true)}
          />
          <VemtapText variant="caption" tone="secondary" className="text-center">
            {liveCopy.blockouts.summary(blockouts.length)}
          </VemtapText>
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
                  {liveCopy.confirmTitle}
                </VemtapText>
              </View>
              <VemtapText variant="caption" tone="secondary">
                {liveCopy.confirmBody}
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
      <>
        <ServiceBlockoutsSheet
          visible={editingBlockouts}
          onClose={() => setEditingBlockouts(false)}
          value={blockouts}
          onSave={setBlockouts}
        />
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
    </ServiceFlowPage>
  );
}
