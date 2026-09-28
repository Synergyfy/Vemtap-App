import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { ProgressDots } from '@components/onboarding/ProgressDots';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { verifyIdentityCopy as copy } from '@features/business/verificationCopy';
import {
  PrimaryActionButton,
  SetupCallout,
  StatusPill,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  SelectableRadioCard,
  VerificationPage,
} from '@features/business/components/VerificationPrimitives';

export type IdentityDocumentId = 'nin' | 'drivers_license' | 'passport';

export interface VerifyYourIdentityScreenProps {
  onBack?: () => void;
  onContinue?: (documentId: IdentityDocumentId) => void;
  initialDocumentId?: IdentityDocumentId;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/verify_your_identity/code.html
 */
export function VerifyYourIdentityScreen({
  onBack,
  onContinue,
  initialDocumentId = 'nin',
}: VerifyYourIdentityScreenProps) {
  const [selectedId, setSelectedId] = useState<IdentityDocumentId>(initialDocumentId);

  const handleBack = useCallback(() => onBack?.(), [onBack]);

  const privacyBody = (
    <>
      {copy.privacyLead}
      <VemtapText className="font-sans-semibold text-text">
        {copy.privacyHighlight}
      </VemtapText>
      {copy.privacyTail}
    </>
  );

  return (
    <VerificationPage
      title={copy.header}
      onBack={handleBack}
      contentContainerClassName="gap-5"
      footer={
        <>
          <PrimaryActionButton
            label={copy.continue}
            onPress={() => onContinue?.(selectedId)}
          />
          <View className="mt-2 flex-row items-center justify-center gap-1.5">
            <Icon name="verified" size={16} color={colors.primary} />
            <VemtapText
              variant="caption"
              tone="secondary"
              className="min-w-0 flex-1 text-center"
            >
              {copy.speedHint}
            </VemtapText>
          </View>
        </>
      }
    >
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <StatusPill label={copy.stepLabel} tone="brandHigh" icon="shieldPerson" />
        <ProgressDots total={2} activeIndex={0} />
      </View>

      <View className="gap-1">
        <VemtapText
          accessibilityRole="header"
          variant="headingLg"
          className="text-heading-lg"
        >
          {copy.title}
        </VemtapText>
        <VemtapText variant="bodyMd" tone="secondary" className="leading-relaxed">
          {copy.subtitle}
        </VemtapText>
      </View>

      <SetupCallout
        icon="verifiedUser"
        tone="container"
        iconSurface="circle"
        className="mt-1"
        title={copy.registryTitle}
        body={copy.registryBody}
        trailing={<View className="h-2 w-2 rounded-full bg-badge-discount-text" />}
      />

      <View className="gap-3.5">
        <SelectableRadioCard
          layout="inline"
          icon="fingerprint"
          title={copy.nin}
          badge={copy.ninBadge}
          badgeTone="success"
          body={copy.ninBody}
          selected={selectedId === 'nin'}
          onPress={() => setSelectedId('nin')}
        />
        <SelectableRadioCard
          layout="inline"
          icon="directionsCar"
          title={copy.licence}
          body={copy.licenceBody}
          selected={selectedId === 'drivers_license'}
          onPress={() => setSelectedId('drivers_license')}
        />
        <SelectableRadioCard
          layout="inline"
          icon="passport"
          title={copy.passport}
          body={copy.passportBody}
          selected={selectedId === 'passport'}
          onPress={() => setSelectedId('passport')}
        />
      </View>

      <SetupCallout
        icon="lock"
        tone="container"
        iconSurface="circleMd"
        iconSize={18}
        className="mt-1"
        body={privacyBody}
      />
    </VerificationPage>
  );
}
