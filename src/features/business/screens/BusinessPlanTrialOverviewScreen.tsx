import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { planTrialOverviewCopy as copy } from '@features/business/verificationCopy';
import {
  PrimaryActionButton,
  SetupSectionCard,
  StatusPill,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  DisclosureSection,
  PlanFeatureRow,
  VerificationPage,
} from '@features/business/components/VerificationPrimitives';

export interface BusinessPlanTrialOverviewScreenProps {
  onBack?: () => void;
  onStartTrial?: () => void;
  onSubscribeNow?: () => void;
  onViewAddOns?: () => void;
  onHelp?: () => void;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/business_plan_trial_overview/code.html
 */
export function BusinessPlanTrialOverviewScreen({
  onBack,
  onStartTrial,
  onSubscribeNow,
  onViewAddOns,
  onHelp,
}: BusinessPlanTrialOverviewScreenProps) {
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const handleBack = useCallback(() => onBack?.(), [onBack]);
  const toggleBreakdown = useCallback(() => setBreakdownOpen(current => !current), []);

  return (
    <VerificationPage
      title={copy.header}
      onBack={handleBack}
      helpLabel={copy.helpLabel}
      onHelp={onHelp}
      background="surface"
      contentContainerClassName="gap-5"
      footer={
        <>
          <PrimaryActionButton label={copy.startTrial} onPress={onStartTrial} />
          <Button
            label={copy.subscribeNow}
            labelVariant="labelMd"
            variant="secondary"
            className="border-0"
            onPress={onSubscribeNow}
          />
          <View className="mt-2 flex-row flex-wrap items-center justify-center gap-1.5">
            <Icon name="lock" size={16} color={colors.textTertiary} />
            <VemtapText
              variant="caption"
              tone="secondary"
              className="min-w-0 flex-1 text-center"
            >
              {copy.footnote}
            </VemtapText>
          </View>
        </>
      }
    >
      <View className="gap-2">
        <StatusPill label={copy.badge} tone="success" icon="verified" />
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

      <SetupSectionCard tone="subtle" className="mt-1 w-full p-5 shadow-md">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <View className="flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-full bg-primary" />
            <VemtapText
              variant="labelSm"
              tone="secondary"
              className="uppercase tracking-wider"
            >
              {copy.planLabel}
            </VemtapText>
          </View>
          <StatusPill label={copy.planBadge} tone="brand" />
        </View>

        <View className="gap-1">
          <VemtapText variant="headingLg" className="text-heading-lg">
            {copy.planName}
          </VemtapText>
          <View className="mt-1 flex-row flex-wrap items-baseline gap-1.5">
            <VemtapText variant="headingLg" className="text-heading-lg">
              {copy.planPrice}
            </VemtapText>
            <VemtapText variant="bodyMd" tone="secondary">
              {copy.planCycle}
            </VemtapText>
          </View>
          <VemtapText variant="bodyMd" tone="secondary" className="mt-2">
            {copy.planBody}
          </VemtapText>
        </View>

        <View className="flex-row items-center gap-2.5 rounded-card bg-badge-discount-bg px-3.5 py-2.5">
          <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface shadow-sm">
            <Icon name="badge" size={18} color={colors.badgeDiscountText} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold text-badge-discount-text"
            >
              {copy.trialTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary">
              {copy.trialBody}
            </VemtapText>
          </View>
        </View>

        <View className="gap-3">
          {copy.features.map(feature => (
            <PlanFeatureRow
              key={feature.label}
              label={feature.label}
              badge={feature.featured ? feature.badge : undefined}
              state={feature.featured ? 'highlighted' : 'included'}
            />
          ))}
        </View>

        <DisclosureSection
          className="pt-3"
          label={copy.breakdownToggle}
          expanded={breakdownOpen}
          onToggle={toggleBreakdown}
        >
          {copy.breakdown.map(entry => (
            <View key={entry.title} className="gap-0.5">
              <VemtapText variant="labelSm" className="font-sans-semibold">
                {entry.title}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" className="leading-snug">
                {entry.body}
              </VemtapText>
            </View>
          ))}
        </DisclosureSection>
      </SetupSectionCard>

      <View className="mt-2 items-center gap-2">
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={copy.addOns}
          onPress={onViewAddOns}
          className="min-h-9 flex-row items-center gap-1"
        >
          <VemtapText variant="labelMd" className="text-primary">
            {copy.addOns}
          </VemtapText>
          <Icon name="arrowForward" size={18} color={colors.primary} />
        </Pressable>
        <VemtapText variant="caption" tone="tertiary" className="text-center">
          {copy.audience}
        </VemtapText>
      </View>
    </VerificationPage>
  );
}
