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

export interface TrialActiveStatusScreenProps {
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
        <VemtapText variant="caption" tone="tertiary">
          {copy.subscriptionId}
        </VemtapText>
      </View>

      <View className="gap-1">
        <VemtapText
          accessibilityRole="header"
          variant="headingLg"
          className="text-heading-lg"
        >
          {copy.title}
        </VemtapText>
        <VemtapText variant="bodyMd" tone="secondary">
          {copy.subtitle}
        </VemtapText>
      </View>

      <DaysRemainingTile
        label={copy.timelineLabel}
        days={23}
        unit={copy.daysRemaining}
        icon="hourglass"
        progress={23.33}
        progressLeft={copy.usedLabel}
        progressRight={copy.elapsedLabel}
        footerLeft={copy.startedLabel}
        footerRight={copy.endsLabel}
      />

      <View className="gap-3">
        <PrimaryActionButton label={copy.exploreDashboard} onPress={onExploreDashboard} />
        <Button
          label={copy.subscribeNow}
          labelVariant="labelMd"
          variant="secondary"
          className="border-0"
          leftIcon={<Icon name="verified" size={20} color={colors.primary} />}
          onPress={onSubscribeNow}
        />
      </View>

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
          {copy.includes.map(feature => (
            <PlanFeatureRow
              key={feature.label}
              label={feature.label}
              meta={feature.meta ?? undefined}
              state="highlighted"
            />
          ))}
        </SetupSectionCard>
      </View>

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
