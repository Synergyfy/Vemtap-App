import React, { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import {
  trialExpiredCopy as copy,
  verificationImages,
} from '@features/business/verificationCopy';
import { BusinessProductImage } from '@features/business/components/BusinessPrimitives';
import {
  PrimaryActionButton,
  SetupCallout,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  PlanFeatureRow,
  VerificationPage,
  VerificationSeal,
  VerificationTileGrid,
} from '@features/business/components/VerificationPrimitives';

const assetImages = [
  verificationImages.savedCatalog,
  verificationImages.savedOutlet,
  verificationImages.savedReviews,
];

export interface TrialExpiredReactivateScreenProps {
  onBack?: () => void;
  onActivate?: () => void;
  onViewBusiness?: () => void;
  onContactSupport?: () => void;
  onHelp?: () => void;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/trial_expired_reactivate/code.html
 */
export function TrialExpiredReactivateScreen({
  onBack,
  onActivate,
  onViewBusiness,
  onContactSupport,
  onHelp,
}: TrialExpiredReactivateScreenProps) {
  const handleBack = useCallback(() => onBack?.(), [onBack]);

  return (
    <VerificationPage
      title={copy.header}
      onBack={handleBack}
      helpLabel={copy.helpLabel}
      onHelp={onHelp}
      background="surface"
      contentContainerClassName="gap-5"
      footer={
        <>
          <PrimaryActionButton label={copy.activate} onPress={onActivate} />
          <Button
            label={copy.viewBusiness}
            labelVariant="labelMd"
            variant="secondary"
            className="border-0 bg-surface-subtle"
            leftIcon={<Icon name="visibility" size={20} color={colors.textSecondary} />}
            onPress={onViewBusiness}
          />
          <View className="items-center gap-1 pt-1">
            <VemtapText variant="bodyMd" tone="secondary" className="text-center">
              {copy.supportQuestion}
            </VemtapText>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={copy.supportAction}
              hitSlop={8}
              onPress={onContactSupport}
              className="min-h-9 flex-row items-center gap-1"
            >
              <Icon name="support" size={16} color={colors.primary} />
              <VemtapText variant="labelMd" className="font-sans-medium text-primary">
                {copy.supportAction}
              </VemtapText>
            </Pressable>
          </View>
        </>
      }
    >
      <View className="items-center gap-2">
        <VerificationSeal
          icon="clockLock"
          badgeIcon="verifiedUser"
          badgeSurface="success"
          accessibilityLabel="Free trial has ended"
          size="sm"
          className="mb-2"
        />
        <VemtapText
          accessibilityRole="header"
          variant="headingLg"
          className="max-w-[320px] text-center text-heading-lg"
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

      <SetupCallout
        icon="cloudDone"
        tone="subtle"
        iconSurface="circle"
        iconSize={22}
        className="p-4"
        title={copy.dataTitle}
        bodyVariant="bodyMd"
        body={copy.dataBody}
      >
        <VerificationTileGrid columns={3} className="w-full self-center">
          {copy.assets.map((asset, index) => (
            <View
              key={asset.label}
              className="relative h-16 overflow-hidden rounded-lg bg-surface-container shadow-sm"
            >
              <BusinessProductImage
                source={{ uri: assetImages[index] }}
                alt={asset.label}
                className="h-full w-full"
              />
              <View className="absolute inset-0 w-full items-center justify-center bg-inverse-surface/30 px-1">
                <View className="w-full flex-row items-center justify-center gap-1">
                  <Icon name={asset.icon} size={14} color={colors.surface} />
                  <VemtapText
                    variant="labelSm"
                    className="min-w-0 flex-1 text-center font-sans-medium text-surface"
                  >
                    {asset.label}
                  </VemtapText>
                </View>
              </View>
            </View>
          ))}
        </VerificationTileGrid>
      </SetupCallout>

      <View className="mt-1 overflow-hidden rounded-card bg-surface shadow-md">
        <View className="h-1.5 w-full bg-primary" />
        <View className="gap-3 p-4">
          <View className="flex-row flex-wrap items-start justify-between gap-2">
            <View className="min-w-0 flex-1 gap-0.5">
              <VemtapText
                variant="labelSm"
                className="font-sans-bold uppercase tracking-wider text-primary"
              >
                {copy.planBadge}
              </VemtapText>
              <VemtapText variant="headingLg" className="text-heading-lg">
                {copy.planName}
              </VemtapText>
            </View>
            <View className="shrink-0 items-end">
              <VemtapText variant="headingLg" className="text-heading-lg">
                {copy.planPrice}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" className="-mt-1">
                {copy.planCycle}
              </VemtapText>
            </View>
          </View>

          <View className="flex-row items-center gap-1">
            <Icon name="bolt" size={18} color={colors.badgeDiscountText} />
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-1 font-sans-medium text-badge-discount-text"
            >
              {copy.planTagline}
            </VemtapText>
          </View>

          <View className="gap-3 pt-1">
            {copy.planFeatures.map(feature => (
              <PlanFeatureRow key={feature} label={feature} state="highlighted" />
            ))}
          </View>
        </View>
      </View>
    </VerificationPage>
  );
}
