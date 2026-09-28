import React, { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { VemtapText } from '@components/ui/Text';
import { verificationInProgressCopy as copy } from '@features/business/verificationCopy';
import {
  PrimaryActionButton,
  SetupCallout,
  SetupSectionCard,
  StatusPill,
  TextActionButton,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  VerificationPage,
  VerificationSeal,
  VerificationTimelineRow,
} from '@features/business/components/VerificationPrimitives';

export interface VerificationInProgressScreenProps {
  onBack?: () => void;
  onContinueSetup?: () => void;
  onCheckLater?: () => void;
  onContactSupport?: () => void;
  onHelp?: () => void;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/verification_in_progress/code.html
 */
export function VerificationInProgressScreen({
  onBack,
  onContinueSetup,
  onCheckLater,
  onContactSupport,
  onHelp,
}: VerificationInProgressScreenProps) {
  const handleBack = useCallback(() => onBack?.(), [onBack]);

  return (
    <VerificationPage
      title={copy.header}
      onBack={handleBack}
      helpLabel={copy.helpLabel}
      onHelp={onHelp}
      contentContainerClassName="gap-5"
      footer={
        <>
          <PrimaryActionButton label={copy.continueSetup} onPress={onContinueSetup} />
          <TextActionButton
            label={copy.checkLater}
            tone="brand"
            onPress={onCheckLater ?? onBack}
          />
          <View className="mt-1 flex-row flex-wrap items-center justify-center gap-1 pt-1">
            <VemtapText variant="caption" tone="secondary">
              {copy.questions}
            </VemtapText>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={copy.support}
              hitSlop={8}
              onPress={onContactSupport}
              className="min-h-9 flex-row items-center gap-0.5"
            >
              <VemtapText
                variant="caption"
                className="font-sans-medium text-primary underline"
              >
                {copy.support}
              </VemtapText>
            </Pressable>
          </View>
        </>
      }
    >
      <View className="items-center gap-1">
        <VerificationSeal
          icon="schedule"
          badgeIcon="verifiedUser"
          badgeSurface="tertiary"
          badgeTone="tertiary"
          accessibilityLabel="Verification review in progress"
          size="md"
          className="my-3"
        />
        <View className="mb-1">
          <StatusPill label={copy.statusPill} tone="brand" />
        </View>
        <VemtapText
          accessibilityRole="header"
          variant="headingLg"
          className="text-center text-heading-lg"
        >
          {copy.title}
        </VemtapText>
        <VemtapText variant="bodyMd" tone="secondary" className="max-w-sm text-center">
          {copy.subtitle}
        </VemtapText>
      </View>

      <SetupSectionCard className="w-full">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.progressTitle}
          </VemtapText>
          <StatusPill label={copy.stepBadge} tone="success" />
        </View>
        <View className="gap-4">
          {copy.steps.map(step => (
            <VerificationTimelineRow
              key={step.title}
              title={step.title}
              body={step.body}
              state={step.state}
              markerIcon={step.state === 'done' ? 'check' : undefined}
              trailingIcon={step.trailingIcon}
              highlightActive
            />
          ))}
        </View>
      </SetupSectionCard>

      <SetupCallout
        icon="schedule"
        tone="container"
        iconSurface="circleMd"
        title={copy.turnaroundTitle}
        className="p-3"
        bodyClassName="leading-relaxed"
        body={copy.turnaroundBody}
      />

      <SetupCallout
        icon="storefront"
        tone="plain"
        iconTone="success"
        iconSurface="circleSuccess"
        iconSize={20}
        title={copy.keepGoingTitle}
        bodyVariant="bodyMd"
        className="p-4"
        bodyClassName="leading-normal"
        body={copy.keepGoingBody}
        trailing={<StatusPill label={copy.keepGoingBadge} tone="brand" />}
      />
    </VerificationPage>
  );
}
