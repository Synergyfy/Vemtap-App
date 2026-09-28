import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import {
  youReVerifiedCopy as copy,
  verificationImages,
} from '@features/business/verificationCopy';
import { BusinessProductImage } from '@features/business/components/BusinessPrimitives';
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
} from '@features/business/components/VerificationPrimitives';

export interface YouReVerifiedScreenProps {
  onBack?: () => void;
  onContinue?: () => void;
  onPreviewStorefront?: () => void;
  onHelp?: () => void;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/you_re_verified/code.html
 */
export function YouReVerifiedScreen({
  onBack,
  onContinue,
  onPreviewStorefront,
  onHelp,
}: YouReVerifiedScreenProps) {
  const handleBack = useCallback(() => onBack?.(), [onBack]);

  const subtitle = (
    <>
      {copy.subtitleLead}
      <VemtapText variant="labelMd" className="text-text">
        {copy.businessName}
      </VemtapText>
      {copy.subtitleTail}
    </>
  );

  return (
    <VerificationPage
      title={copy.header}
      onBack={handleBack}
      helpLabel={copy.helpLabel}
      onHelp={onHelp}
      contentContainerClassName="gap-6"
      footer={
        <>
          <VemtapText variant="labelMd" tone="secondary" className="text-center">
            {copy.readyNote}
          </VemtapText>
          <PrimaryActionButton label={copy.continue} onPress={onContinue} />
          <TextActionButton
            label={copy.previewAction}
            icon="visibility"
            tone="brand"
            onPress={onPreviewStorefront}
          />
          <View className="flex-row items-center justify-center gap-1.5">
            <Icon name="lock" size={16} color={colors.textTertiary} />
            <VemtapText variant="caption" tone="secondary" className="text-center">
              {copy.footer}
            </VemtapText>
          </View>
        </>
      }
    >
      <View className="items-center gap-1 pt-2">
        <VerificationSeal
          icon="verifiedUser"
          badgeIcon="verified"
          badgeSurface="success"
          accessibilityLabel="Business verification complete"
          size="lg"
          className="mb-3"
        />
        <View className="mb-1 flex-row items-center gap-1.5 self-center rounded-full bg-badge-discount-bg px-3 py-1">
          <View className="h-2 w-2 rounded-full bg-badge-discount-text" />
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-badge-discount-text"
          >
            {copy.validatedBadge}
          </VemtapText>
        </View>
        <VemtapText
          accessibilityRole="header"
          variant="headingLg"
          className="text-center text-heading-lg"
        >
          {copy.title}
        </VemtapText>
        <VemtapText variant="bodyMd" tone="secondary" className="max-w-xs text-center">
          {subtitle}
        </VemtapText>
      </View>

      <SetupSectionCard className="w-full">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <VemtapText
            variant="labelSm"
            tone="secondary"
            className="uppercase tracking-wider"
          >
            {copy.breakdownLabel}
          </VemtapText>
          <View className="flex-row items-center gap-1">
            <Icon name="checkCircle" size={15} color={colors.badgeDiscountText} />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-badge-discount-text"
            >
              {copy.confirmed}
            </VemtapText>
          </View>
        </View>
        <View className="gap-3">
          {copy.pillars.map(pillar => (
            <VerificationPillarRow
              key={pillar.title}
              icon={pillar.icon}
              surface="subtle"
              title={pillar.title}
              body={pillar.body}
              statusLabel={pillar.tag}
            />
          ))}
        </View>

        <View className="pt-3">
          <View className="flex-row items-center gap-3 rounded-card bg-surface-container-low p-2">
            <BusinessProductImage
              source={{ uri: verificationImages.verifiedStorefront }}
              alt={copy.previewName}
              className="h-14 w-14 shrink-0 rounded-lg shadow-sm"
            />
            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-1">
                <VemtapText
                  variant="labelMd"
                  className="min-w-0 flex-1 font-sans-semibold"
                  numberOfLines={1}
                >
                  {copy.previewName}
                </VemtapText>
                <Icon name="verified" size={16} color={colors.primary} />
              </View>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {copy.previewMeta}
              </VemtapText>
              <VemtapText
                variant="caption"
                className="mt-0.5 font-sans-medium text-badge-discount-text"
                numberOfLines={1}
              >
                {copy.previewStatus}
              </VemtapText>
            </View>
          </View>
        </View>
      </SetupSectionCard>

      <SetupCallout
        icon="verifiedUser"
        tone="tint"
        iconSurface="circlePrimary"
        iconTone="inverse"
        iconSize={18}
        className="p-4"
        title={copy.trustTitle}
        bodyVariant="bodyMd"
        body={copy.trustBody}
      />
    </VerificationPage>
  );
}
