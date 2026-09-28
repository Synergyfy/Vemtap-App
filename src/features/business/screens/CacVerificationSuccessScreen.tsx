import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import {
  cacVerificationSuccessCopy as copy,
  verificationImages,
} from '@features/business/verificationCopy';
import { BusinessProductImage } from '@features/business/components/BusinessPrimitives';
import {
  PrimaryActionButton,
  SetupCallout,
  SetupSectionCard,
  StatusPill,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  VerificationPage,
  VerificationSeal,
} from '@features/business/components/VerificationPrimitives';

export interface CacVerificationSuccessScreenProps {
  onBack?: () => void;
  onContinue?: () => void;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/cac_verification_success/code.html
 */
export function CacVerificationSuccessScreen({
  onBack,
  onContinue,
}: CacVerificationSuccessScreenProps) {
  const handleBack = useCallback(() => onBack?.(), [onBack]);

  const trustBody = (
    <>
      {copy.trustLead}
      <VemtapText className="font-sans-semibold text-primary">
        {copy.trustHighlight}
      </VemtapText>
      {copy.trustTail}
    </>
  );

  return (
    <VerificationPage
      title={copy.header}
      onBack={handleBack}
      contentContainerClassName="gap-4"
      footer={
        <>
          <PrimaryActionButton label={copy.continue} onPress={onContinue} />
          <VemtapText variant="caption" tone="secondary" className="mt-1 text-center">
            {copy.footnote}
          </VemtapText>
        </>
      }
    >
      <View className="items-center gap-1 pt-2">
        <VerificationSeal
          icon="check"
          accessibilityLabel="Business registration verified"
          size="md"
          tone="success"
          className="my-3"
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

      <View className="mt-2 flex-row items-center gap-3 rounded-card bg-surface p-3 shadow-sm">
        <View className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-container">
          <BusinessProductImage
            source={{ uri: verificationImages.cacStorefront }}
            alt={copy.businessName}
            className="h-full w-full"
          />
          <View className="absolute bottom-0 right-0 flex-row items-center gap-0.5 rounded-tl-md bg-primary px-1 py-0.5">
            <Icon name="verified" size={10} color={colors.surface} />
          </View>
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-1.5">
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={1}
            >
              {copy.businessName}
            </VemtapText>
            <Icon name="verified" size={18} color={colors.primary} />
          </View>
          <VemtapText
            variant="caption"
            tone="secondary"
            className="mt-0.5"
            numberOfLines={1}
          >
            {copy.businessMeta}
          </VemtapText>
        </View>
      </View>

      <SetupSectionCard className="w-full">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <VemtapText
            variant="labelSm"
            tone="tertiary"
            className="uppercase tracking-wider"
          >
            {copy.recordLabel}
          </VemtapText>
          <View className="flex-row items-center gap-1">
            <View className="h-1.5 w-1.5 rounded-full bg-badge-discount-text" />
            <VemtapText
              variant="caption"
              className="font-sans-semibold text-badge-discount-text"
            >
              {copy.recordLive}
            </VemtapText>
          </View>
        </View>
        <View className="gap-1">
          <VemtapText variant="caption" tone="secondary">
            {copy.nameLabel}
          </VemtapText>
          <VemtapText variant="button" className="font-sans-semibold" numberOfLines={2}>
            {copy.nameValue}
          </VemtapText>
        </View>
        <View className="gap-1.5">
          <VemtapText variant="caption" tone="secondary">
            {copy.cacLabel}
          </VemtapText>
          <StatusPill label={copy.cacValue} tone="success" icon="checkCircle" />
        </View>
        <View className="gap-1.5">
          <VemtapText variant="caption" tone="secondary">
            {copy.operatorLabel}
          </VemtapText>
          <StatusPill label={copy.operatorValue} tone="success" icon="badge" />
        </View>
        <View className="gap-1.5 pt-1">
          <VemtapText variant="caption" tone="secondary">
            {copy.badgeLabel}
          </VemtapText>
          <StatusPill label={copy.badgeValue} tone="brand" icon="verified" />
        </View>
      </SetupSectionCard>

      <SetupCallout
        icon="shield"
        tone="container"
        iconSurface="circleMd"
        iconSize={20}
        bodyVariant="bodyMd"
        className="p-4"
        body={trustBody}
      />
    </VerificationPage>
  );
}
