import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessIconWell,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessInitialsAvatar,
  BusinessPillar,
} from '@features/business/components/BusinessPosPrimitives';
import {
  verificationPerks,
  verificationPillars,
} from '@features/business/data/businessTrustSettingsData';

const copy = strings.businessVerificationTrust;

export interface BusinessVerificationTrustScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onOpenPillar?: (pillarId: string) => void;
  onOpenCertificate?: (pillarId: string) => void;
  onContactCompliance?: () => void;
}

/**
 * Verification & trust: enterprise trust badge, trust score, the consumer-feed
 * preview customers actually see, the four verification pillars and the perks
 * unlocking them unlocks.
 */
export function BusinessVerificationTrustScreen({
  onBack,
  onOpenProfile,
  onOpenPillar,
  onOpenCertificate,
  onContactCompliance,
}: BusinessVerificationTrustScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'accountCircle', label: copy.headerTitle, onPress: onOpenProfile },
        ],
      }}
      contentContainerClassName="pb-8"
    >
      <View className="items-center gap-2 rounded-card bg-surface p-4 shadow-sm">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-badge-discount-bg">
          <Icon name="shieldLock" size={26} color={colors.badgeDiscountText} />
        </View>
        <VemtapText
          variant="headingLg"
          className="text-center text-heading-lg"
          numberOfLines={2}
        >
          {copy.headline}
        </VemtapText>
        <VemtapText
          variant="bodyMd"
          className="text-center font-sans-semibold"
          numberOfLines={2}
        >
          {copy.legalEntity}
        </VemtapText>
        <BusinessStatusPill label={copy.levelBadge} tone="success" />
      </View>

      <View className="mt-3 flex-row items-center gap-3 rounded-card bg-surface p-4 shadow-sm">
        <View className="min-w-0 flex-1">
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {copy.trustScoreLabel}
          </VemtapText>
          <VemtapText
            variant="headingLg"
            className="font-sans-bold text-primary"
            numberOfLines={1}
          >
            {copy.trustScoreValue}
          </VemtapText>
        </View>
        <View className="min-w-0 flex-[1.2] items-end gap-1">
          <Icon name="checkCircle" size={18} color={colors.badgeDiscountText} />
          <VemtapText
            variant="caption"
            tone="secondary"
            className="text-right"
            numberOfLines={2}
          >
            {copy.trustScoreNote}
          </VemtapText>
        </View>
      </View>

      <BusinessPanel
        className="mt-3"
        title={copy.previewTitle}
        icon="radar"
        badge={copy.previewStatus}
        badgeTone="success"
      >
        <View className="flex-row items-center gap-3 rounded-field bg-surface-subtle p-3">
          <BusinessInitialsAvatar
            initials={copy.previewInitials}
            size="lg"
            tone="brand"
          />
          <View className="min-w-0 flex-1 gap-0.5">
            <View className="flex-row items-center gap-1.5">
              <VemtapText
                variant="labelMd"
                className="min-w-0 font-sans-semibold"
                numberOfLines={1}
              >
                {copy.previewName}
              </VemtapText>
              <Icon name="verified" size={15} color={colors.primary} />
            </View>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.previewPartner}
            </VemtapText>
            <View className="flex-row items-center gap-1">
              <View className="h-1.5 w-1.5 rounded-full bg-outline" />
              <VemtapText
                variant="caption"
                tone="tertiary"
                className="min-w-0 flex-1"
                numberOfLines={1}
              >
                {copy.previewLocations}
              </VemtapText>
            </View>
          </View>
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.pillarsTitle}
        icon="verified"
        badge={copy.pillarsBadge}
        badgeTone="success"
      >
        <View className="gap-2">
          {verificationPillars.map(pillar => (
            <BusinessPillar
              key={pillar.id}
              title={pillar.title}
              status={pillar.status}
              icon={pillar.icon}
              lines={pillar.lines}
              detail={pillar.detail}
              cta={pillar.cta}
              onCtaPress={() => {
                if (pillar.cta) onOpenCertificate?.(pillar.id);
                onOpenPillar?.(pillar.id);
              }}
            />
          ))}
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.perksTitle}
        icon="workspacePremium"
        badge={String(verificationPerks.length)}
        badgeTone="brand"
      >
        <View className="gap-2">
          {verificationPerks.map(perk => (
            <View key={perk} className="flex-row items-start gap-2">
              <Icon name="checkBold" size={15} color={colors.badgeDiscountText} />
              <VemtapText
                variant="caption"
                tone="secondary"
                className="min-w-0 flex-1 leading-relaxed"
                numberOfLines={3}
              >
                {perk}
              </VemtapText>
            </View>
          ))}
        </View>
      </BusinessPanel>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.updateCta}
        onPress={onContactCompliance}
        className="mt-3 flex-row items-center gap-2.5 rounded-card bg-surface p-3 shadow-sm active:bg-surface-subtle"
      >
        <BusinessIconWell icon="info" tone="brand" size="md" />
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={2}>
            {copy.updateTitle}
          </VemtapText>
          <VemtapText
            variant="caption"
            className="font-sans-semibold text-primary"
            numberOfLines={2}
          >
            {copy.updateCta}
          </VemtapText>
        </View>
        <View className="shrink-0">
          <Icon name="forward" size={18} color={colors.primary} />
        </View>
      </Pressable>
    </BusinessScreenLayout>
  );
}
