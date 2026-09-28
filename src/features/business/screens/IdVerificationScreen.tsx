import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { ProgressDots } from '@components/onboarding/ProgressDots';
import { BottomSheet } from '@components/shared/BottomSheet';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import { idVerificationCopy as copy } from '@features/business/verificationCopy';
import {
  FieldInput,
  PrimaryActionButton,
  SetupCallout,
  SetupSectionCard,
  StatusPill,
} from '@features/business/components/BusinessSetupPrimitives';
import { BusinessFieldLabel } from '@features/business/components/BusinessPrimitives';
import {
  UploadChip,
  VerificationPage,
} from '@features/business/components/VerificationPrimitives';

export interface IdVerificationScreenProps {
  onBack?: () => void;
  onSubmit?: (value: { nin: string; fullName: string; slipFile?: string }) => void;
  onCaptureSlip?: () => void;
}

/**
 * Conversion of stitch_vemtap_design_system_1/id_verification/code.html
 */
export function IdVerificationScreen({
  onBack,
  onSubmit,
  onCaptureSlip,
}: IdVerificationScreenProps) {
  const [nin, setNin] = useState<string>(copy.ninValue);
  const [fullName, setFullName] = useState<string>(copy.nameValue);
  const [slipFile, setSlipFile] = useState<string | null>(null);
  const [infoVisible, setInfoVisible] = useState(false);

  const handleBack = useCallback(() => onBack?.(), [onBack]);
  const openInfo = useCallback(() => setInfoVisible(true), []);
  const closeInfo = useCallback(() => setInfoVisible(false), []);
  const attachSlip = useCallback(() => {
    setSlipFile(copy.uploadFileName);
    onCaptureSlip?.();
  }, [onCaptureSlip]);
  const removeSlip = useCallback(() => setSlipFile(null), []);

  return (
    <VerificationPage
      title={copy.header}
      onBack={handleBack}
      contentContainerClassName="gap-5"
      footer={
        <>
          <PrimaryActionButton
            label={copy.submit}
            onPress={() => onSubmit?.({ nin, fullName, slipFile: slipFile ?? undefined })}
          />
          <VemtapText variant="caption" tone="secondary" className="text-center">
            {copy.submitHint}
          </VemtapText>
        </>
      }
    >
      <View className="gap-2">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <StatusPill label={copy.pill} tone="brandContainer" icon="verifiedUser" />
          <VemtapText variant="caption" tone="tertiary">
            {copy.step}
          </VemtapText>
        </View>
        <ProgressDots total={3} activeIndex={1} className="self-start" />
      </View>

      <View className="mt-1 gap-1">
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

      <View className="mt-1 gap-4">
        <View className="gap-1.5">
          <BusinessFieldLabel
            label={copy.ninLabel}
            trailing={
              <View className="flex-row items-center gap-2">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={copy.ninInfoLabel}
                  hitSlop={8}
                  onPress={openInfo}
                  className="-mr-1 h-8 w-8 items-center justify-center rounded-full active:bg-surface-container-low"
                >
                  <Icon name="info" size={16} color={colors.textTertiary} />
                </Pressable>
                <VemtapText variant="caption" tone="tertiary">
                  {copy.ninCounter}
                </VemtapText>
              </View>
            }
          />
          <FieldInput
            accessibilityLabel={copy.ninLabel}
            value={nin}
            onChangeText={setNin}
            placeholder={copy.ninPlaceholder}
            keyboardType="default"
            autoCapitalize="none"
            maxLength={14}
            tone="lowest"
            trailingIcon={nin ? 'check' : undefined}
            trailingIconColor={colors.badgeDiscountText}
          />
          <View className="flex-row items-center gap-1.5 px-1 pt-0.5">
            <Icon name="phoneDevice" size={14} color={colors.primary} />
            <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
              {copy.ussdLead}
              <VemtapText className="font-sans-semibold text-primary">
                {copy.ussdCode}
              </VemtapText>
              {copy.ussdTail}
            </VemtapText>
          </View>
        </View>

        <View className="gap-1.5">
          <BusinessFieldLabel label={copy.nameLabel} />
          <FieldInput
            accessibilityLabel={copy.nameLabel}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            tone="lowest"
            trailingIcon="lock"
            trailingIconColor={colors.textTertiary}
          />
        </View>
      </View>

      <SetupSectionCard className="w-full">
        <View className="flex-row items-start gap-3">
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-tint-blue">
            <Icon name="badge" size={22} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <View className="flex-row flex-wrap items-center gap-1.5">
              <VemtapText variant="labelMd" className="min-w-0 font-sans-semibold">
                {copy.uploadTitle}
              </VemtapText>
              <VemtapText
                variant="caption"
                tone="secondary"
                className="rounded bg-surface-container px-1.5 py-0.5 uppercase"
              >
                {copy.uploadBadge}
              </VemtapText>
            </View>
            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-0.5 leading-relaxed"
            >
              {copy.uploadBody}
            </VemtapText>
          </View>
        </View>
        <Button
          label={copy.uploadAction}
          labelVariant="labelSm"
          variant="outline"
          size="sm"
          className="border-0 bg-surface-subtle"
          leftIcon={<Icon name="camera" size={18} color={colors.primary} />}
          onPress={attachSlip}
        />
        {slipFile ? (
          <UploadChip
            fileName={slipFile}
            onRemove={removeSlip}
            removeLabel={copy.removeFileLabel}
            icon="checkBold"
            tone="subtle"
          />
        ) : null}
      </SetupSectionCard>

      <SetupCallout
        icon="shieldLock"
        tone="tint"
        iconSurface="plain"
        className="p-4"
        bodyClassName="leading-relaxed"
        body={copy.security}
      />

      <BottomSheet visible={infoVisible} onClose={closeInfo} title={copy.infoTitle}>
        <View className={cn('px-6 pb-2')}>
          <VemtapText variant="caption" tone="secondary" className="leading-relaxed">
            {copy.infoBody}
          </VemtapText>
        </View>
      </BottomSheet>
    </VerificationPage>
  );
}
