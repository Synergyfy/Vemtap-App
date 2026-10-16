import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessNumberInput,
  BusinessScreenLayout,
  BusinessSelectionChip,
  BusinessSwitchRow,
} from '@features/business/components/BusinessPrimitives';
import {
  HorizontallyScrollableRow,
  SetupCallout,
  SetupSectionCard,
  SetupSectionHeading,
  SetupStepBar,
  TextActionButton,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  BusinessSegmentTabs,
  type BusinessSegmentTab,
} from '@features/business/components/BusinessOpsPrimitives';

const copy = strings.boostWizard;
const step = copy.budgetStep;

const budgetModes: BusinessSegmentTab[] = [
  { key: 'daily', label: step.budgetModes[0] },
  { key: 'total', label: step.budgetModes[1] },
];

export interface BoostBudgetScheduleScreenProps {
  onBack?: () => void;
  onContinue?: (selection: BoostBudgetSelection) => void;
  onEditSchedule?: () => void;
  onSelectionChange?: (selection: BoostBudgetSelection) => void;
  /** Starting choices; the design's defaults when absent. */
  initialSelection?: Partial<BoostBudgetSelection>;
  /**
   * Live mode: the asset line, tier estimates and forecast come from the API
   * and the dates from the clock, replacing the design's sample model.
   */
  live?: {
    assetName: string;
    assetGoal: string;
    tierForecasts: Partial<Record<string, { reach: string; claims: string }>>;
    forecast?: { reach: string; claims: string; revenue?: string; revenueMeta?: string };
  };
  /** Clock for the live dates (tests pin it). */
  now?: Date;
}

function formatDay(date: Date): string {
  return date.toLocaleDateString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export interface BoostBudgetSelection {
  budget: number;
  days: number;
  dayparting: boolean;
}

/** Bottom of the tier ladder: the design's own ₦3,000 floor. */
const MIN_BUDGET = 3000;
const MIN_DAYS = 3;

function formatNaira(value: number): string {
  return `\u20a6${value.toLocaleString('en-NG')}`;
}

/**
 * Boost Wizard — Step 2: Budget & Schedule.
 * stitch_vemtap_mobile_app_design/boost_setup_budget_schedule
 * Full wizard page with its own fixed CTA deck; never owns bottom navigation.
 */
export function BoostBudgetScheduleScreen({
  onBack,
  onContinue,
  onEditSchedule,
  onSelectionChange,
  initialSelection,
  live,
  now,
}: BoostBudgetScheduleScreenProps) {
  const initialBudget = initialSelection?.budget ?? 20000;
  const initialDays = initialSelection?.days;
  const [mode, setMode] = useState<string>('total');
  const [budget, setBudget] = useState<number>(initialBudget);
  const [custom, setCustom] = useState<string>(initialBudget.toLocaleString('en-NG'));
  const [days, setDays] = useState<string>(
    step.durations.find(option => Number.parseInt(option, 10) === initialDays) ??
      step.durations[1],
  );
  const [dayparting, setDayparting] = useState(initialSelection?.dayparting ?? true);

  const customValue = Number(custom.replace(/[^0-9]/g, '')) || 0;
  const invalid = customValue > 0 && customValue < MIN_BUDGET;
  const activeDays = Number.parseInt(days, 10) || initialDays || MIN_DAYS;
  // Daily mode spends the amount every day of the run.
  const activeBudget = mode === 'daily' ? budget * activeDays : budget;

  function changeCustom(text: string) {
    setCustom(text);
    const value = Number(text.replace(/[^0-9]/g, '')) || 0;
    if (value > 0) setBudget(value);
  }

  useEffect(() => {
    onSelectionChange?.({ budget: activeBudget, days: activeDays, dayparting });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- report choice changes only.
  }, [activeBudget, activeDays, dayparting]);

  const start = now ?? new Date();
  const startValue = live ? copy.live.startNow(formatDay(start)) : step.startValue;
  const endValue = live
    ? formatDay(new Date(start.getTime() + activeDays * 86_400_000))
    : step.endValue;

  // The design's own model: reach 0.55–0.82 of spend, claims 0.0045–0.0068,
  // with a 1.15x lift while lunch dayparting is on.
  const lift = dayparting ? 1.15 : 1;
  const reachLow = Math.round((activeBudget * 0.55 * lift) / 50) * 50;
  const reachHigh = Math.round((activeBudget * 0.82 * lift) / 50) * 50;
  const claimsLow = Math.round(activeBudget * 0.0045 * lift);
  const claimsHigh = Math.round(activeBudget * 0.0068 * lift);
  const revenueLow = claimsLow * 9600;
  const revenueHigh = claimsHigh * 9600;

  return (
    <BusinessScreenLayout
      header={{ title: step.title, onBack, titleVariant: 'headingSm', showAvatar: true }}
      contentContainerClassName="gap-5 pb-6"
      footer={
        <BusinessActionDock>
          <TextActionButton
            label={step.cta}
            icon="arrowForward"
            tone="brand"
            onPress={() => {
              if (invalid) return;
              onContinue?.({ budget: activeBudget, days: activeDays, dayparting });
            }}
          />
          <View className="flex-row items-center justify-center gap-1.5">
            <Icon name="lock" size={12} color={colors.textTertiary} />
            <VemtapText variant="micro" tone="tertiary" className="text-center">
              {step.ctaNote}
            </VemtapText>
          </View>
        </BusinessActionDock>
      }
    >
      <SetupStepBar
        step={copy.steps.budget}
        percent="66%"
        progress={2 / 3}
        stepMarker="check"
        pillTone="brand"
      />

      <SetupSectionCard tone="low" className="flex-row items-center gap-3 p-3">
        <View className="min-w-0 flex-1 gap-0.5">
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {live?.assetName ?? step.assetName}
          </VemtapText>
          <View className="flex-row items-center gap-1.5">
            <View className="h-1.5 w-1.5 rounded-full bg-primary" />
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {live?.assetGoal ?? step.assetGoal}
            </VemtapText>
          </View>
        </View>
        <View className="shrink-0 rounded-full bg-surface-tint px-2 py-0.5">
          <VemtapText variant="caption" className="font-sans-semibold text-primary">
            {step.assetTag}
          </VemtapText>
        </View>
      </SetupSectionCard>

      <View className="gap-3">
        <SetupSectionHeading title={step.budgetTitle} badge={step.budgetEyebrow} />
        <BusinessSegmentTabs
          tabs={budgetModes}
          value={mode}
          onChange={setMode}
          accessibilityLabel={step.budgetTitle}
        />
        <View className="gap-2">
          {step.tiers.map(tier => {
            const selected = budget === Number(tier.id) * 1000;
            return (
              <SetupSectionCard
                key={tier.id}
                tone={selected ? 'container' : 'lowest'}
                className="gap-2.5 p-4"
              >
                <View className="flex-row items-start justify-between gap-2">
                  <View className="min-w-0 flex-1 gap-1">
                    <View className="flex-row flex-wrap items-center gap-1.5">
                      <VemtapText
                        variant="labelMd"
                        className="font-sans-semibold"
                        numberOfLines={1}
                      >
                        {tier.amount}
                      </VemtapText>
                      {'tier' in tier ? (
                        <View className="rounded-full bg-surface-container px-2 py-0.5">
                          <VemtapText variant="micro" tone="secondary">
                            {tier.tier}
                          </VemtapText>
                        </View>
                      ) : null}
                      {'badge' in tier ? (
                        <View className="rounded-full bg-primary px-2 py-0.5">
                          <VemtapText
                            variant="micro"
                            className="font-sans-semibold text-primary-foreground"
                          >
                            {tier.badge}
                          </VemtapText>
                        </View>
                      ) : null}
                    </View>
                    <VemtapText
                      variant="labelSm"
                      className={
                        'pace' in tier && selected
                          ? 'font-sans-semibold text-primary'
                          : 'text-text-secondary'
                      }
                      numberOfLines={1}
                    >
                      {tier.pace}
                    </VemtapText>
                  </View>
                  <View
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={tier.amount}
                    className={
                      selected
                        ? 'h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary'
                        : 'h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-container-highest'
                    }
                  >
                    {selected ? (
                      <Icon name="check" size={13} color={colors.surface} />
                    ) : null}
                  </View>
                </View>
                <View className="flex-row items-center gap-3">
                  <View className="min-w-0 flex-1 flex-row items-center gap-1">
                    <Icon name="group" size={13} color={colors.textSecondary} />
                    <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                      {live ? (live.tierForecasts[tier.id]?.reach ?? '') : tier.reach}
                    </VemtapText>
                  </View>
                  <View className="min-w-0 flex-1 flex-row items-center gap-1">
                    <Icon name="receipt" size={13} color={colors.textSecondary} />
                    <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                      {live ? (live.tierForecasts[tier.id]?.claims ?? '') : tier.claims}
                    </VemtapText>
                  </View>
                </View>
                <Button
                  label={selected ? step.budgetModes[1] : 'Select'}
                  labelVariant="labelSm"
                  variant={selected ? 'primary' : 'secondary'}
                  size="sm"
                  accessibilityLabel={`${tier.amount} budget tier`}
                  onPress={() => {
                    setMode('total');
                    setBudget(Number(tier.id) * 1000);
                    setCustom(tier.amount.replace('\u20a6', ''));
                  }}
                />
              </SetupSectionCard>
            );
          })}
        </View>

        <SetupSectionCard tone="low" className="gap-2 p-4">
          <BusinessNumberInput
            label={step.customLabel}
            value={custom}
            onChangeText={changeCustom}
            leadingText="\u20a6"
            compact
          />
          {invalid ? (
            <VemtapText variant="caption" className="text-error">
              {step.customError}
            </VemtapText>
          ) : null}
        </SetupSectionCard>
      </View>

      <View className="gap-3">
        <SetupSectionHeading title={step.scheduleTitle} badge={step.scheduleEyebrow} />
        <HorizontallyScrollableRow>
          {step.durations.map(option => (
            <BusinessSelectionChip
              key={option}
              label={option}
              selected={option === days}
              onPress={() => setDays(option)}
            />
          ))}
        </HorizontallyScrollableRow>
        <SetupSectionCard tone="lowest" className="gap-0.5 p-1">
          <View className="flex-row items-center gap-3 rounded-field px-3 py-2.5">
            <View className="min-w-0 flex-1">
              <VemtapText variant="caption" tone="tertiary">
                {step.startLabel}
              </VemtapText>
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {startValue}
              </VemtapText>
            </View>
            <View className="shrink-0 rounded-full bg-surface-container px-2 py-0.5">
              <VemtapText variant="micro" className="font-sans-semibold text-primary">
                {step.startPill}
              </VemtapText>
            </View>
          </View>
          <View className="h-px bg-surface-container" />
          <View className="flex-row items-center gap-3 rounded-field px-3 py-2.5">
            <View className="min-w-0 flex-1">
              <VemtapText variant="caption" tone="tertiary">
                {step.endLabel}
              </VemtapText>
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {endValue}
              </VemtapText>
            </View>
            <View className="shrink-0">
              <Icon name="calendarEdit" size={18} color={colors.primary} />
            </View>
          </View>
        </SetupSectionCard>
        <TextActionButton
          label={step.editSchedule}
          icon="calendarEdit"
          tone="brand"
          onPress={onEditSchedule}
        />
        <SetupSectionCard tone="container" className="p-4">
          <BusinessSwitchRow
            title={step.daypartTitle}
            value={dayparting}
            onValueChange={setDayparting}
            accessibilityLabel={step.daypartTitle}
          />
          <VemtapText variant="caption" tone="secondary" className="mt-2">
            {step.daypartBody}
          </VemtapText>
        </SetupSectionCard>
      </View>

      <View className="gap-3">
        <SetupSectionHeading
          title={step.forecastTitle}
          badge={step.forecastEyebrow}
          dot
        />
        <SetupSectionCard tone="lowest" className="gap-3 p-4">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <VemtapText variant="caption" tone="tertiary">
                {step.forecastTotalLabel}
              </VemtapText>
              <VemtapText
                variant="headingMd"
                className="font-sans-bold"
                numberOfLines={1}
              >
                {formatNaira(activeBudget)}
              </VemtapText>
            </View>
            <View className="shrink-0 items-end">
              <VemtapText variant="caption" tone="tertiary">
                {step.forecastPaceLabel}
              </VemtapText>
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold text-primary"
                numberOfLines={1}
              >
                {formatNaira(Math.round(activeBudget / activeDays))} / day ({activeDays}{' '}
                days)
              </VemtapText>
            </View>
          </View>
          <View className="flex-row gap-2">
            <View className="min-w-0 flex-1 gap-0.5 rounded-field bg-surface-subtle p-3">
              <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                {step.reachLabel}
              </VemtapText>
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {live
                  ? (live.forecast?.reach ?? '\u2026')
                  : `${reachLow.toLocaleString('en-NG')} \u2013 ${reachHigh.toLocaleString('en-NG')}`}
              </VemtapText>
              <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                {step.reachMeta}
              </VemtapText>
            </View>
            <View className="min-w-0 flex-1 gap-0.5 rounded-field bg-surface-subtle p-3">
              <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                {step.claimsLabel}
              </VemtapText>
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {live
                  ? (live.forecast?.claims ?? '\u2026')
                  : `${claimsLow} \u2013 ${claimsHigh}`}
              </VemtapText>
              <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                {step.claimsMeta}
              </VemtapText>
            </View>
          </View>
          {live && !live.forecast?.revenue ? null : (
            <View className="flex-row items-center justify-between gap-2 rounded-field bg-surface-subtle p-3">
              <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                {step.revenueLabel}
              </VemtapText>
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {live?.forecast?.revenue ??
                  `${formatNaira(revenueLow)} \u2013 ${formatNaira(revenueHigh)}`}
              </VemtapText>
            </View>
          )}
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="micro" tone="tertiary" className="min-w-0 flex-1">
              {live ? copy.live.forecastNote : step.forecastNote}
            </VemtapText>
            <VemtapText variant="micro" className="shrink-0 text-primary">
              {live ? (live.forecast?.revenueMeta ?? '') : step.revenueMeta}
            </VemtapText>
          </View>
        </SetupSectionCard>
      </View>

      {invalid ? (
        <SetupCallout
          icon="alert"
          body={step.minBudgetAlert}
          tone="subtle"
          iconTone="tertiary"
        />
      ) : null}
    </BusinessScreenLayout>
  );
}
