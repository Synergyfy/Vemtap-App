import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { verifyBusinessCopy as copy } from '@features/business/verificationCopy';
import {
  PrimaryActionButton,
  SetupCallout,
  SetupSectionCard,
  TextActionButton,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  VerificationPage,
  VerificationPillarRow,
  VerificationSeal,
  VerificationStageRail,
} from '@features/business/components/VerificationPrimitives';

export interface VerifyYourBusinessScreenProps {
  onBack?: () => void;
  onStart?: () => void;
  onLater?: () => void;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/verify_your_business/code.html
 */
export function VerifyYourBusinessScreen({
  onBack,
  onStart,
  onLater,
}: VerifyYourBusinessScreenProps) {
  const handleBack = useCallback(() => onBack?.(), [onBack]);

  return (
    <VerificationPage
      title={copy.header}
      onBack={handleBack}
      contentContainerClassName="items-center gap-5"
      footer={
        <>
          <PrimaryActionButton label={copy.start} onPress={onStart} />
          <TextActionButton label={copy.later} onPress={onLater ?? onBack} />
          <VemtapText
            variant="caption"
            tone="tertiary"
            className="px-2 text-center leading-relaxed"
          >
            {copy.footnote}
          </VemtapText>
        </>
      }
    >
      <VerificationStageRail
        accessibilityLabel="Business setup, verification and activation progress"
        stages={[
          { label: copy.stageSetup, state: 'done' },
          { label: copy.stageVerification, state: 'active' },
          { label: copy.stageActivation, state: 'pending' },
        ]}
      />

      <VerificationSeal
        icon="verifiedUser"
        badgeIcon="lock"
        badgeSurface="success"
        accessibilityLabel="Business verification trust shield"
        size="md"
      />

      <View className="items-center px-1">
        <VemtapText
          accessibilityRole="header"
          variant="headingLg"
          className="text-center text-heading-lg"
        >
          {copy.title}
        </VemtapText>
        <VemtapText variant="bodyMd" tone="secondary" className="mt-1 text-center">
          {copy.subtitle}
        </VemtapText>
      </View>

      <View className="w-full">
        <SetupCallout
          icon="info"
          tone="container"
          iconSurface="plain"
          bodyVariant="labelSm"
          body={copy.context}
        />
      </View>

      <SetupSectionCard className="w-full">
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText
            variant="labelSm"
            tone="tertiary"
            className="font-sans-semibold uppercase tracking-wider"
          >
            {copy.whyTitle}
          </VemtapText>
          <Icon name="verified" size={18} color={colors.primary} />
        </View>
        <VerificationPillarRow
          icon="shield"
          tileSize="md"
          title={copy.valueProtectTitle}
          body={copy.valueProtectBody}
        />
        <VerificationPillarRow
          icon="handshake"
          tileSize="md"
          title={copy.valueTrustTitle}
          body={copy.valueTrustBody}
        />
        <VerificationPillarRow
          icon="rocket"
          tileSize="md"
          title={copy.valueUnlockTitle}
          body={copy.valueUnlockBody}
        />
      </SetupSectionCard>

      <View className="w-full">
        <SetupCallout
          icon="check"
          iconTone="success"
          iconSurface="circleSm"
          iconSize={15}
          tone="subtle"
          className="w-full p-3"
          body={copy.reassurance}
        />
      </View>
    </VerificationPage>
  );
}
