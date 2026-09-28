import React, { useCallback } from 'react';
import { View } from 'react-native';
import { ProgressDots } from '@components/onboarding/ProgressDots';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { idVerificationSuccessCopy as copy } from '@features/business/verificationCopy';
import {
  PrimaryActionButton,
  SetupSectionCard,
  StatusPill,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  VerificationPage,
  VerificationSeal,
  VerificationSummaryRow,
} from '@features/business/components/VerificationPrimitives';

export interface IdVerificationSuccessScreenProps {
  onBack?: () => void;
  onContinue?: () => void;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/id_verification_success/code.html
 */
export function IdVerificationSuccessScreen({
  onBack,
  onContinue,
}: IdVerificationSuccessScreenProps) {
  const handleBack = useCallback(() => onBack?.(), [onBack]);

  return (
    <VerificationPage
      title={copy.header}
      onBack={handleBack}
      contentContainerClassName="gap-5"
      footer={
        <>
          <PrimaryActionButton label={copy.continue} onPress={onContinue} />
          <View className="mt-2 flex-row items-center justify-center gap-1.5">
            <Icon name="lock" size={15} color={colors.badgeDiscountText} />
            <VemtapText
              variant="caption"
              tone="secondary"
              className="min-w-0 flex-1 text-center"
            >
              {copy.footer}
            </VemtapText>
          </View>
        </>
      }
    >
      <View className="items-center gap-1 pt-2">
        <VerificationSeal
          icon="check"
          accessibilityLabel="Identity verified"
          size="md"
          tone="success"
          className="mb-3"
        />
        <VemtapText
          accessibilityRole="header"
          variant="headingLg"
          className="text-center text-heading-lg"
        >
          {copy.title}
        </VemtapText>
        <VemtapText
          variant="bodyMd"
          tone="secondary"
          className="max-w-[320px] text-center"
        >
          {copy.subtitle}
        </VemtapText>
      </View>

      <SetupSectionCard className="w-full">
        <VerificationSummaryRow
          label={copy.identityStatus}
          trailing={
            <StatusPill label={copy.verifiedBadge} tone="success" icon="verified" />
          }
        />
        <VerificationSummaryRow label={copy.personLabel} value={copy.personValue} />
        <VerificationSummaryRow label={copy.documentLabel} value={copy.documentValue} />
        <VerificationSummaryRow label={copy.referenceLabel} value={copy.referenceValue} />
        <View className="mt-2 flex-row items-center justify-center gap-1.5 rounded-lg bg-surface-container-low px-2 py-2">
          <Icon name="schedule" size={16} color={colors.textSecondary} />
          <VemtapText
            variant="caption"
            tone="secondary"
            className="min-w-0 flex-1 text-center"
          >
            {copy.verifiedOn}
          </VemtapText>
        </View>
      </SetupSectionCard>

      <SetupSectionCard tone="lowest" className="w-full bg-surface-tint-blue">
        <View className="flex-row items-start gap-3">
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface shadow-sm">
            <Icon name="storefront" size={22} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <View className="flex-row flex-wrap items-center gap-1.5">
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold uppercase tracking-wider text-primary"
              >
                {copy.nextStage}
              </VemtapText>
              <View className="h-1 w-1 rounded-full bg-primary/40" />
              <VemtapText variant="caption" tone="secondary">
                {copy.nextStep}
              </VemtapText>
            </View>
            <VemtapText variant="labelMd" className="mb-1 mt-0.5 font-sans-semibold">
              {copy.nextTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" className="leading-relaxed">
              {copy.nextBody}
            </VemtapText>
          </View>
        </View>
      </SetupSectionCard>

      <ProgressDots total={3} activeIndex={1} />
    </VerificationPage>
  );
}
