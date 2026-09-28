import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { idVerificationNeedsReviewCopy as copy } from '@features/business/verificationCopy';
import {
  SetupCallout,
  SetupSectionCard,
  TextActionButton,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  VerificationPage,
  VerificationSeal,
  VerificationTimelineRow,
} from '@features/business/components/VerificationPrimitives';

const reasonIcons = ['badge', 'blur', 'cropFree', 'wifiAlert'] as const;

export interface IdVerificationNeedsReviewScreenProps {
  onBack?: () => void;
  onTryAgain?: () => void;
  onUseAnotherId?: () => void;
  onRequestManualReview?: () => void;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/id_verification_needs_review/code.html
 */
export function IdVerificationNeedsReviewScreen({
  onBack,
  onTryAgain,
  onUseAnotherId,
  onRequestManualReview,
}: IdVerificationNeedsReviewScreenProps) {
  const handleBack = useCallback(() => onBack?.(), [onBack]);

  return (
    <VerificationPage
      title={copy.header}
      onBack={handleBack}
      contentContainerClassName="gap-5"
      footer={
        <>
          <Button
            label={copy.tryAgain}
            labelVariant="labelMd"
            rightIcon={<Icon name="sync" size={20} color={colors.surface} />}
            onPress={onTryAgain}
          />
          <Button
            label={copy.useAnotherId}
            labelVariant="labelMd"
            variant="secondary"
            leftIcon={<Icon name="fileDocument" size={20} color={colors.textSecondary} />}
            onPress={onUseAnotherId}
          />
          <View className="items-center gap-1 px-2 pt-1">
            <TextActionButton
              label={copy.manualReview}
              icon="support"
              tone="brand"
              onPress={onRequestManualReview}
            />
            <VemtapText variant="caption" tone="tertiary" className="text-center">
              {copy.manualReviewHint}
            </VemtapText>
          </View>
        </>
      }
    >
      <View className="items-center gap-1">
        <VerificationSeal
          icon="shieldKey"
          badgeIcon="restore"
          badgeTone="tertiary"
          accessibilityLabel="Identity verification could not be completed"
          size="sm"
          tone="tertiary"
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

      <SetupSectionCard tone="subtle" className="w-full p-5">
        <View className="flex-row items-center gap-2">
          <Icon name="lightbulb" size={20} color={colors.primary} />
          <VemtapText variant="labelMd" className="min-w-0 font-sans-semibold">
            {copy.reasonsTitle}
          </VemtapText>
        </View>
        <View className="gap-3">
          {copy.reasons.map((reason, index) => (
            <VerificationTimelineRow
              key={reason}
              title={reason}
              markerIcon={reasonIcons[index]}
              markerTone="brand"
            />
          ))}
        </View>
      </SetupSectionCard>

      <SetupCallout
        icon="verifiedUser"
        tone="container"
        iconSurface="plain"
        iconTone="success"
        bodyVariant="labelSm"
        className="mt-1"
        bodyClassName="leading-tight"
        body={copy.reassurance}
      />
    </VerificationPage>
  );
}
