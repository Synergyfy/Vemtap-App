import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { CampaignWizardStepLayout } from '@features/business/components/CampaignWizardStepLayout';
import {
  SetupCallout,
  SetupSectionCard,
  SetupSectionHeading,
  SwitchToggle,
  ToggleRow,
} from '@features/business/components/BusinessSetupPrimitives';
import { BusinessCheckRow } from '@features/business/components/BusinessPrimitives';
import { BusinessScopeCard } from '@features/business/components/BusinessOpsPrimitives';

cssInterop(Pressable, { className: 'style' });

const copy = strings.campaignWizard;
const step = copy.step4;

const WEEKDAYS = [
  { id: 'mon', label: 'M' },
  { id: 'tue', label: 'T' },
  { id: 'wed', label: 'W' },
  { id: 'thu', label: 'T' },
  { id: 'fri', label: 'F' },
  { id: 'sat', label: 'S' },
  { id: 'sun', label: 'S' },
] as const;

export interface CampaignStep4ScheduleScreenProps {
  onBack: () => void;
  onContinue: (selection: CampaignScheduleSelection) => void;
  onSaveDraft?: () => void;
  initialDays?: number;
  /** Starting choices; the design's sample schedule when absent. */
  initialSelection?: Partial<CampaignScheduleSelection>;
  /**
   * Live mode shows real start/end dates and drops the design's sample dates,
   * the weekend-weighting claim and the testimonial.
   */
  live?: boolean;
  /** Clock for the live dates (tests pin it). */
  now?: Date;
}

function formatDay(date: Date): string {
  return date.toLocaleDateString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export interface CampaignScheduleSelection {
  durationDays: number;
  instantLaunch: boolean;
  dayparting: boolean;
  windows: string[];
  weekdays: string[];
  autoRenew: boolean;
}

/**
 * Create Campaign — Step 4: Schedule & Timing.
 * stitch_vemtap_mobile_app_design/create_campaign_step_4_schedule
 */
export function CampaignStep4ScheduleScreen({
  onBack,
  onContinue,
  onSaveDraft,
  initialDays = 7,
  initialSelection,
  live = false,
  now,
}: CampaignStep4ScheduleScreenProps) {
  const [duration, setDuration] = useState<string>(
    String(initialSelection?.durationDays ?? initialDays),
  );
  const [instant, setInstant] = useState(initialSelection?.instantLaunch ?? true);
  const [dayparting, setDayparting] = useState(initialSelection?.dayparting ?? true);
  const [windows, setWindows] = useState<string[]>(
    initialSelection?.windows ?? ['lunch', 'dinner'],
  );
  const [weekdays, setWeekdays] = useState<string[]>(
    initialSelection?.weekdays ?? ['fri', 'sat', 'sun'],
  );
  const [autoRenew, setAutoRenew] = useState(initialSelection?.autoRenew ?? false);

  const days = Number.parseInt(duration, 10) || 7;
  const start = now ?? new Date();
  const startValue = live ? step.liveStartNow(formatDay(start)) : step.startValue;
  const endValue = live
    ? formatDay(new Date(start.getTime() + days * 86_400_000))
    : step.endValue;
  const totalDays = step.durations.find(option => option.id === duration);

  return (
    <CampaignWizardStepLayout
      step={4}
      title={step.title}
      hero={step.hero}
      heroBody={step.heroBody}
      onBack={onBack}
      onNext={() =>
        onContinue({
          durationDays: days,
          instantLaunch: instant,
          dayparting,
          windows,
          weekdays,
          autoRenew,
        })
      }
      nextLabel={step.cta}
      backLabel={step.back}
      draftLabel={onSaveDraft ? copy.saveDraft : undefined}
      onSaveDraft={onSaveDraft}
      trackerExtra={
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold uppercase tracking-wide text-primary"
          >
            {copy.stepOf.replace('{step}', '4')}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {copy.nextHint}
          </VemtapText>
        </View>
      }
    >
      <View className="gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <SetupSectionHeading title={step.durationTitle} className="min-w-0 flex-1" />
          <View className="shrink-0 flex-row items-center gap-1">
            <Icon name="insights" size={14} color={colors.primary} />
            <VemtapText variant="caption" className="text-primary" numberOfLines={1}>
              {step.durationNote}
            </VemtapText>
          </View>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {step.durations.map(option => {
            const selected = option.id === duration;
            return (
              <View
                key={option.id}
                className={option.id === 'custom' ? 'w-full' : 'w-[47.5%]'}
              >
                <BusinessScopeCard
                  title={option.label}
                  body={option.caption}
                  selected={selected}
                  onPress={() => setDuration(option.id)}
                >
                  {'badge' in option && option.badge ? (
                    <View className="absolute right-3 top-0 rounded-full bg-badge-discount-bg px-2 py-0.5">
                      <VemtapText
                        variant="micro"
                        className="font-sans-semibold text-badge-discount-text"
                        numberOfLines={1}
                      >
                        {option.badge}
                      </VemtapText>
                    </View>
                  ) : null}
                </BusinessScopeCard>
              </View>
            );
          })}
        </View>
        <VemtapText variant="caption" tone="tertiary" numberOfLines={2}>
          {totalDays && 'caption' in totalDays ? totalDays.caption : ''}
        </VemtapText>
      </View>

      <View className="gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <SetupSectionHeading title={step.horizonTitle} className="min-w-0 flex-1" />
          <View className="shrink-0 rounded-full bg-badge-discount-bg px-2 py-0.5">
            <VemtapText
              variant="caption"
              className="font-sans-semibold text-badge-discount-text"
              numberOfLines={1}
            >
              {`${days} Full Days (${days * 24} Hours)`}
            </VemtapText>
          </View>
        </View>
        <SetupSectionCard tone="container" className="gap-2.5 p-4">
          <ToggleRow
            title={step.instantTitle}
            body={step.instantBody}
            value={instant}
            onValueChange={setInstant}
          />
          <View className="flex-row items-center justify-between gap-2 rounded-field bg-surface-subtle p-3">
            <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
              {step.startLabel}
            </VemtapText>
            <VemtapText
              variant="labelSm"
              className="shrink-0 font-sans-semibold"
              numberOfLines={1}
            >
              {startValue}
            </VemtapText>
            <View className="shrink-0 rounded-full bg-badge-discount-bg px-2 py-0.5">
              <VemtapText
                variant="micro"
                className="font-sans-semibold text-badge-discount-text"
                numberOfLines={1}
              >
                {step.startBadge}
              </VemtapText>
            </View>
          </View>
        </SetupSectionCard>
        <SetupSectionCard
          tone="lowest"
          className="flex-row items-center gap-3 p-4 shadow-sm"
        >
          <View className="min-w-0 flex-1 gap-0.5">
            <VemtapText variant="caption" tone="secondary">
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
          <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container">
            <Icon name="calendarEdit" size={18} color={colors.primary} />
          </View>
        </SetupSectionCard>
      </View>

      <View className="gap-3">
        <SetupSectionCard tone="container" className="gap-3 p-4">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary-fixed">
              <Icon name="fire" size={20} color={colors.tertiary} />
            </View>
            <View className="min-w-0 flex-1 gap-0.5">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={2}
              >
                {step.daypartTitle}
              </VemtapText>
              <VemtapText variant="micro" className="text-success" numberOfLines={1}>
                {step.daypartBadge}
              </VemtapText>
            </View>
            <SwitchToggle
              value={dayparting}
              onValueChange={setDayparting}
              accessibilityLabel={step.daypartTitle}
            />
          </View>
          <VemtapText variant="caption" tone="secondary">
            {step.daypartBody}
          </VemtapText>
        </SetupSectionCard>

        {dayparting ? (
          <View className="gap-2">
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-text-secondary"
            >
              {step.windowsTitle}
            </VemtapText>
            {step.windows.map(window => (
              <BusinessCheckRow
                key={window.id}
                type="checkbox"
                title={window.name}
                subtitle={window.caption}
                icon={window.icon}
                trailing={
                  <VemtapText
                    variant="caption"
                    className="shrink-0 font-sans-semibold text-primary"
                    numberOfLines={1}
                  >
                    {window.time}
                  </VemtapText>
                }
                selected={windows.includes(window.id)}
                onPress={() =>
                  setWindows(current =>
                    current.includes(window.id)
                      ? current.filter(item => item !== window.id)
                      : [...current, window.id],
                  )
                }
              />
            ))}
          </View>
        ) : null}

        <View className="flex-row items-center justify-between gap-2">
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-text-secondary"
          >
            {step.daysTitle}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {`${weekdays.length} Days Selected`}
          </VemtapText>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {WEEKDAYS.map(day => {
            const selected = weekdays.includes(day.id);
            return (
              <Pressable
                key={day.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${day.label} weekday`}
                onPress={() =>
                  setWeekdays(current =>
                    current.includes(day.id)
                      ? current.filter(item => item !== day.id)
                      : [...current, day.id],
                  )
                }
                className={
                  selected
                    ? 'h-10 w-10 items-center justify-center rounded-full bg-primary'
                    : 'h-10 w-10 items-center justify-center rounded-full bg-surface-container'
                }
              >
                <VemtapText
                  variant="labelMd"
                  className={
                    selected
                      ? 'font-sans-bold text-primary-foreground'
                      : 'text-text-secondary'
                  }
                >
                  {day.label}
                </VemtapText>
              </Pressable>
            );
          })}
        </View>
        {live ? null : (
          <SetupCallout
            icon="autoAwesome"
            title={step.weekendNote}
            body={step.weekendBody}
            tone="tint"
            bodyVariant="caption"
          />
        )}
      </View>

      <SetupSectionCard tone="lowest" className="p-4 shadow-sm">
        <ToggleRow
          title={step.renewTitle}
          body={live ? step.liveRenewBody : step.renewBody}
          value={autoRenew}
          onValueChange={setAutoRenew}
        />
      </SetupSectionCard>

      {live ? null : (
        <SetupCallout
          icon="autoAwesome"
          title={step.tipFrom}
          body={step.tipBody}
          tone="subtle"
          bodyVariant="caption"
        />
      )}
    </CampaignWizardStepLayout>
  );
}
