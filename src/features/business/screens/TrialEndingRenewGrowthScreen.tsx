import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import {
  trialEndingCopy as copy,
  verificationImages,
} from '@features/business/verificationCopy';
import { BusinessProductImage } from '@features/business/components/BusinessPrimitives';
import {
  PrimaryActionButton,
  SetupCallout,
  SetupSectionCard,
  StatusPill,
  TextActionButton,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  PlanFeatureRow,
  VerificationPage,
} from '@features/business/components/VerificationPrimitives';

export interface TrialEndingRenewGrowthScreenProps {
  onBack?: () => void;
  onContinueGrowth?: () => void;
  onReviewBusiness?: () => void;
  onHelp?: () => void;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/trial_ending_renew_growth/code.html
 */
export function TrialEndingRenewGrowthScreen({
  onBack,
  onContinueGrowth,
  onReviewBusiness,
  onHelp,
}: TrialEndingRenewGrowthScreenProps) {
  const handleBack = useCallback(() => onBack?.(), [onBack]);

  const noticeBody = (
    <>
      {copy.bodyLead}
      <VemtapText className="font-sans-bold text-tertiary">
        {copy.bodyHighlight}
      </VemtapText>
      {copy.bodyTail}
    </>
  );

  return (
    <VerificationPage
      title={copy.header}
      onBack={handleBack}
      helpLabel={copy.helpLabel}
      onHelp={onHelp}
      background="surface"
      contentContainerClassName="gap-4"
      footer={
        <>
          <PrimaryActionButton label={copy.continue} onPress={onContinueGrowth} />
          <TextActionButton label={copy.review} tone="brand" onPress={onReviewBusiness} />
          <View className="mt-1 flex-row flex-wrap items-center justify-center gap-1 pt-1">
            <Icon name="lock" size={16} color={colors.textTertiary} />
            <VemtapText
              variant="caption"
              tone="tertiary"
              className="min-w-0 flex-1 text-center"
            >
              {copy.guarantee}
            </VemtapText>
          </View>
        </>
      }
    >
      <SetupCallout
        icon="hourglass"
        tone="tertiary"
        iconSurface="circleTertiary"
        iconSize={24}
        iconTone="tertiary"
        className="p-4"
        title={copy.title}
        bodyVariant="bodyMd"
        body={noticeBody}
      >
        <View className="flex-row flex-wrap items-center justify-between gap-2 pt-1">
          <View className="min-w-0 flex-row items-center gap-2">
            <Icon name="eventAvailable" size={16} color={colors.tertiary} />
            <VemtapText variant="labelSm" className="min-w-0 flex-1 text-tertiary">
              {copy.dayLabel}
            </VemtapText>
          </View>
          <View className="rounded-full bg-tertiary px-2 py-0.5">
            <VemtapText
              variant="caption"
              className="font-sans-bold text-primary-foreground"
            >
              {copy.daysLeftBadge}
            </VemtapText>
          </View>
        </View>
      </SetupCallout>

      <SetupSectionCard tone="subtle" className="w-full">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <View className="flex-row items-center gap-1.5">
            <View className="h-2.5 w-2.5 rounded-full bg-badge-discount-text" />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold uppercase tracking-wider text-badge-discount-text"
            >
              {copy.storefrontLabel}
            </VemtapText>
          </View>
          <VemtapText variant="caption" tone="secondary">
            {copy.storefrontCount}
          </VemtapText>
        </View>
        <View className="mt-1 flex-row items-center gap-3">
          <BusinessProductImage
            source={{ uri: verificationImages.endingStorefront }}
            alt={copy.storefrontName}
            className="h-12 w-12 shrink-0 rounded-lg bg-surface-container shadow-sm"
          />
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.storefrontName}
            </VemtapText>
            <VemtapText variant="bodyMd" tone="secondary" numberOfLines={1}>
              {copy.storefrontMeta}
            </VemtapText>
          </View>
          <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-tint-blue">
            <Icon name="storefront" size={20} color={colors.primary} />
          </View>
        </View>
      </SetupSectionCard>

      <SetupSectionCard className="w-full p-6 shadow-md">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <StatusPill label={copy.planBadge} tone="brand" />
          <View className="flex-row items-baseline gap-1">
            <VemtapText variant="headingLg" className="text-heading-lg">
              {copy.planPrice}
            </VemtapText>
            <VemtapText variant="bodyMd" tone="secondary">
              {copy.planCycle}
            </VemtapText>
          </View>
        </View>

        <View className="gap-1">
          <VemtapText variant="headingLg" className="text-heading-lg">
            {copy.planTitle}
          </VemtapText>
          <VemtapText variant="bodyMd" tone="secondary">
            {copy.planBody}
          </VemtapText>
        </View>

        <View className="gap-3 rounded-lg bg-surface-subtle/70 p-4 pt-8">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.benefitsTitle}
          </VemtapText>
          {copy.benefits.map(benefit => (
            <PlanFeatureRow
              key={benefit}
              label={benefit}
              state="highlighted"
              className="min-w-0"
            />
          ))}
        </View>

        <View className="flex-row flex-wrap items-center gap-1 px-1">
          <Icon name="verified" size={18} color={colors.primary} />
          <VemtapText variant="labelSm" tone="secondary" className="min-w-0 flex-1">
            {copy.pricingNote}
          </VemtapText>
        </View>
      </SetupSectionCard>
    </VerificationPage>
  );
}
