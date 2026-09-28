import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { ProgressDots } from '@components/onboarding/ProgressDots';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { businessRegistrationCopy as copy } from '@features/business/verificationCopy';
import {
  PrimaryActionButton,
  SetupCallout,
  StatusPill,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  SelectableRadioCard,
  VerificationPage,
} from '@features/business/components/VerificationPrimitives';

export type CacRegistrationStatus = 'registered' | 'unregistered';

export interface BusinessRegistrationScreenProps {
  onBack?: () => void;
  onContinue?: (status: CacRegistrationStatus) => void;
  initialStatus?: CacRegistrationStatus;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/business_registration/code.html
 */
export function BusinessRegistrationScreen({
  onBack,
  onContinue,
  initialStatus = 'registered',
}: BusinessRegistrationScreenProps) {
  const [status, setStatus] = useState<CacRegistrationStatus>(initialStatus);

  const handleBack = useCallback(() => onBack?.(), [onBack]);

  const noPressureBody = (
    <>
      <VemtapText className="font-sans-medium text-text">
        {copy.noPressureLead}
      </VemtapText>
      {copy.noPressureBody}
      <VemtapText className="font-sans-semibold text-primary">
        {copy.noPressureHighlight}
      </VemtapText>
      {copy.noPressureTail}
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
            onPress={() => onContinue?.(status)}
          />
          <View className="mt-1 flex-row items-center justify-center gap-1.5">
            <Icon name="lock" size={15} color={colors.textTertiary} />
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
      <View className="flex-row flex-wrap items-center justify-between gap-2 py-2">
        <ProgressDots total={2} activeIndex={1} />
        <StatusPill label={copy.step} tone="neutral" />
      </View>

      <View className="gap-1.5">
        <VemtapText
          accessibilityRole="header"
          variant="headingLg"
          className="text-heading-lg"
        >
          {copy.title}
        </VemtapText>
        <VemtapText variant="labelMd" tone="secondary">
          {copy.subtitle}
        </VemtapText>
      </View>

      <View className="gap-3.5">
        <SelectableRadioCard
          layout="stacked"
          compact
          icon="crown"
          badge={copy.registeredBadge}
          badgeIcon="verified"
          title={copy.registeredTitle}
          body={copy.registeredBody}
          footnote={copy.registeredFootnoteLead}
          footnoteHighlight={copy.registeredFootnoteHighlight}
          footnoteTail={copy.registeredFootnoteTail}
          selected={status === 'registered'}
          onPress={() => setStatus('registered')}
        />
        <SelectableRadioCard
          layout="stacked"
          compact
          icon="storefront"
          badge={copy.unregisteredBadge}
          badgeIcon="storefront"
          title={copy.unregisteredTitle}
          body={copy.unregisteredBody}
          footnote={copy.unregisteredFootnote}
          footnoteIcon="checkCircle"
          footnoteTone="success"
          selected={status === 'unregistered'}
          onPress={() => setStatus('unregistered')}
        />
      </View>

      <SetupCallout
        icon="info"
        tone="container"
        iconSurface="circleMd"
        iconSize={18}
        className="mt-1"
        body={noPressureBody}
      />
    </VerificationPage>
  );
}
