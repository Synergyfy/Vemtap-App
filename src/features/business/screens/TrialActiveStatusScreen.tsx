import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { trialActiveStatusCopy as copy } from '@features/business/verificationCopy';
import {
  PrimaryActionButton,
  SetupCallout,
  SetupSectionCard,
} from '@features/business/components/BusinessSetupPrimitives';
import { Button } from '@components/ui/Button';
import {
  DaysRemainingTile,
  PlanFeatureRow,
  VerificationPage,
} from '@features/business/components/VerificationPrimitives';
import type { TrialProgress } from '@features/business/subscriptionDisplay';

export interface TrialActiveStatusScreenProps {
  planName?: string;
  /** Formatted monthly price, e.g. "₦15,000". */
  monthlyPrice?: string | null;
  reference?: string | null;
  progress?: TrialProgress;
  features?: string[];
  onBack?: () => void;
  onExploreDashboard?: () => void;
  onSubscribeNow?: () => void;
  onHelp?: () => void;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/trial_active_status/code.html
 */
export function TrialActiveStatusScreen({
  planName = '',
  monthlyPrice,
  reference,
  progress,
  features = [],
  onBack,
  onExploreDashboard,
  onSubscribeNow,
  onHelp,
}: TrialActiveStatusScreenProps) {
  const handleBack = useCallback(() => onBack?.(), [onBack]);

  return (
    <VerificationPage
      title={copy.header}
      onBack={handleBack}
      helpLabel={copy.helpLabel}
      onHelp={onHelp}
      background="surface"
      contentContainerClassName="gap-5"
    >
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <View className="flex-row items-center gap-2 self-start rounded-full bg-badge-discount-bg px-3 py-1.5 shadow-sm">
          <View className="h-2 w-2 rounded-full bg-badge-discount-text" />
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold uppercase tracking-wide text-badge-discount-text"
          >
            {copy.liveBadge}
          </VemtapText>
        </View>
        {reference ? (
          <VemtapText variant="caption" tone="tertiary">
            {`${copy.idLead}${reference}`}
          </VemtapText>
        ) : null}
      </View>

      <View className="gap-1">
        <VemtapText
          accessibilityRole="header"
          variant="headingLg"
          className="text-heading-lg"
        >
          {`${planName}${copy.titleTail}`}
        </VemtapText>
        <VemtapText variant="bodyMd" tone="secondary">
          {`${copy.subtitleLead}${planName}${copy.subtitleTail}`}
        </VemtapText>
      </View>

      <DaysRemainingTile
        label={copy.timelineLabel}
        days={progress?.daysRemaining ?? 0}
        unit={copy.daysRemaining}
        icon="hourglass"
        progress={progress?.percentElapsed ?? 0}
        progressLeft={`${copy.usedLead}${progress?.daysUsed ?? 0}${copy.usedMid}${progress?.totalDays ?? 0}${copy.usedTail}`}
        progressRight={`${progress?.percentElapsed ?? 0}${copy.elapsedTail}`}
        footerLeft={progress?.startedOn ?? ''}
        footerRight={progress?.endsOn ?? ''}
      />

      <View className="gap-3">
        <PrimaryActionButton label={copy.exploreDashboard} onPress={onExploreDashboard} />
        <Button
          label={`${copy.subscribeNowLead}${planName}${monthlyPrice ? ` (${monthlyPrice}/mo)` : ''}`}
          labelVariant="labelMd"
          variant="secondary"
          className="border-0"
          leftIcon={<Icon name="verified" size={20} color={colors.primary} />}
          onPress={onSubscribeNow}
        />
      </View>

      {features.length ? (
        <View className="gap-3">
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.includesTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary">
              {copy.includesBadge}
            </VemtapText>
          </View>
          <SetupSectionCard tone="subtle" className="w-full">
            {features.map(feature => (
              <PlanFeatureRow key={feature} label={feature} state="highlighted" />
            ))}
          </SetupSectionCard>
        </View>
      ) : null}

      <SetupCallout
        icon="bellRing"
        tone="subtle"
        iconSurface="circleMd"
        className="p-4"
        title={copy.guaranteeTitle}
        body={copy.guaranteeBody}
      />
    </VerificationPage>
  );
}
