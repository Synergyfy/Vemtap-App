import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { unregisteredBusinessCopy as copy } from '@features/business/verificationCopy';
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

const canDoIcons = ['localOffer', 'qrCodeScanner', 'forum'] as const;
const reservedIcons = ['verified', 'pushPin'] as const;

export interface UnregisteredBusinessScreenProps {
  onBack?: () => void;
  onContinue?: () => void;
  onLearnMore?: () => void;
  onHelp?: () => void;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/unregistered_business_that_s_okay/code.html
 */
export function UnregisteredBusinessScreen({
  onBack,
  onContinue,
  onLearnMore,
  onHelp,
}: UnregisteredBusinessScreenProps) {
  const handleBack = useCallback(() => onBack?.(), [onBack]);

  const footnote = (
    <>
      {copy.footnoteLead}
      <VemtapText className="font-sans-medium text-text">
        {copy.footnoteHighlight}
      </VemtapText>
      {copy.footnoteTail}
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
          <PrimaryActionButton label={copy.continue} onPress={onContinue} />
          <TextActionButton
            label={copy.learnMore}
            icon="arrowForward"
            tone="brand"
            onPress={onLearnMore}
          />
          <View className="rounded-lg bg-surface-container-high/50 p-3">
            <VemtapText
              variant="caption"
              tone="secondary"
              className="text-center leading-snug"
            >
              {footnote}
            </VemtapText>
          </View>
        </>
      }
    >
      <View className="items-center gap-1 pt-2">
        <VerificationSeal
          icon="storefront"
          badgeIcon="handshake"
          badgeSurface="success"
          accessibilityLabel="Unregistered business is still supported"
          size="lg"
          className="mb-3"
        />
        <View className="mb-1 flex-row items-center gap-1 self-center rounded-full bg-surface-container-high px-3 py-1">
          <Icon name="emoticonHappy" size={16} color={colors.primary} />
          <VemtapText variant="labelSm" className="text-text-secondary">
            {copy.moodBadge}
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
          {copy.subtitle}
        </VemtapText>
      </View>

      <View className="gap-1 rounded-card bg-surface-container-low p-1">
        <View className="flex-row flex-wrap items-center justify-between gap-2 rounded-lg bg-surface p-3 shadow-sm">
          <View className="min-w-0 flex-row items-center gap-3">
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-badge-discount-bg">
              <Icon name="checkCircle" size={22} color={colors.badgeDiscountText} />
            </View>
            <View className="min-w-0">
              <VemtapText variant="caption" tone="tertiary">
                {copy.identityLabel}
              </VemtapText>
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {copy.identityValue}
              </VemtapText>
            </View>
          </View>
          <StatusPill label={copy.identityStatus} tone="success" icon="checkBold" />
        </View>
        <View className="flex-row flex-wrap items-center justify-between gap-2 rounded-lg bg-surface p-3 shadow-sm">
          <View className="min-w-0 flex-row items-center gap-3">
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high">
              <Icon name="domainOff" size={22} color={colors.textSecondary} />
            </View>
            <View className="min-w-0">
              <VemtapText variant="caption" tone="tertiary">
                {copy.cacLabel}
              </VemtapText>
              <VemtapText variant="bodyMd" className="font-sans-medium" numberOfLines={1}>
                {copy.cacValue}
              </VemtapText>
            </View>
          </View>
          <StatusPill label={copy.cacStatus} tone="neutral" />
        </View>
      </View>

      <SetupSectionCard className="w-full">
        <SetupCallout
          icon="info"
          tone="tint"
          iconSurface="plain"
          bodyVariant="bodyMd"
          className="p-3"
          bodyClassName="leading-relaxed"
          body={copy.scopeBody}
        />

        <View className="gap-3">
          <View className="flex-row items-center gap-1">
            <Icon name="check" size={18} color={colors.badgeDiscountText} />
            <VemtapText variant="labelMd" className="min-w-0 font-sans-semibold">
              {copy.canDoTitle}
            </VemtapText>
          </View>
          <View className="gap-3">
            {copy.canDo.map((item, index) => (
              <VerificationTimelineRow
                key={item}
                title={item}
                markerIcon={canDoIcons[index]}
                markerTone="success"
              />
            ))}
          </View>
        </View>

        <View className="gap-3 pt-3">
          <View className="flex-row items-center gap-1">
            <Icon name="verified" size={18} color={colors.primary} />
            <VemtapText variant="labelMd" className="min-w-0 font-sans-semibold">
              {copy.reservedTitle}
            </VemtapText>
          </View>
          <View className="gap-3 rounded-lg bg-surface-subtle p-3">
            {copy.reserved.map((item, index) => (
              <VerificationTimelineRow
                key={item}
                title={item}
                markerIcon={reservedIcons[index]}
                markerTone="brand"
              />
            ))}
          </View>
        </View>
      </SetupSectionCard>
    </VerificationPage>
  );
}
