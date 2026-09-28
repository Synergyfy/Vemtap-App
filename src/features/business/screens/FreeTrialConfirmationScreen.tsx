import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressDots } from '@components/onboarding/ProgressDots';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import {
  freeTrialConfirmationCopy as copy,
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
  VerificationTileGrid,
  VerificationTimelineRow,
} from '@features/business/components/VerificationPrimitives';

const categoryImages = [
  verificationImages.merchantCafe,
  verificationImages.merchantRetail,
];

const timelineMarkers = ['bolt', 'gift', 'flag'] as const;

export interface FreeTrialConfirmationScreenProps {
  onBack?: () => void;
  onStartTrial?: () => void;
  onSubscribeInstead?: () => void;
  onHelp?: () => void;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/free_trial_confirmation/code.html
 */
export function FreeTrialConfirmationScreen({
  onBack,
  onStartTrial,
  onSubscribeInstead,
  onHelp,
}: FreeTrialConfirmationScreenProps) {
  const handleBack = useCallback(() => onBack?.(), [onBack]);

  const compactFeatures = copy.included.filter(feature => !feature.wide);
  const wideFeature = copy.included.find(feature => feature.wide);

  return (
    <VerificationPage
      title={copy.header}
      onBack={handleBack}
      helpLabel={copy.helpLabel}
      onHelp={onHelp}
      background="surface"
      contentContainerClassName="gap-4"
      footer={
        <>
          <PrimaryActionButton label={copy.startTrial} onPress={onStartTrial} />
          <Button
            label={`${copy.subscribeInstead} ${copy.subscribeInsteadPrice}`}
            labelVariant="labelSm"
            variant="secondary"
            size="sm"
            onPress={onSubscribeInstead}
          />
          <VemtapText variant="caption" tone="tertiary" className="text-center">
            {copy.footnote}
          </VemtapText>
        </>
      }
    >
      <View className="items-center gap-2 rounded-card bg-surface-tint-blue p-6">
        <VerificationSeal
          icon="verified"
          badgeIcon="checkCircle"
          badgeSurface="success"
          accessibilityLabel="Free trial started"
          size="sm"
          className="mb-1"
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
          className="mb-2 max-w-[320px] text-center"
        >
          {copy.subtitle}
        </VemtapText>
        <ProgressDots total={3} activeIndex={0} />
      </View>

      <SetupSectionCard tone="subtle" className="w-full">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.timelineTitle}
          </VemtapText>
          <StatusPill label={copy.timelineBadge} tone="brand" />
        </View>
        <View className="gap-4">
          {copy.timeline.map((step, index) => (
            <VerificationTimelineRow
              key={step.label}
              title={step.label}
              meta={step.meta}
              body={step.body}
              markerIcon={timelineMarkers[index]}
              markerTone={index === 0 ? 'brand' : index === 1 ? 'success' : 'muted'}
              showConnector={index < copy.timeline.length - 1}
            />
          ))}
        </View>
      </SetupSectionCard>

      <SetupSectionCard className="w-full">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.includedTitle}
          </VemtapText>
          <VemtapText variant="labelSm" tone="secondary">
            {copy.includedBadge}
          </VemtapText>
        </View>
        <VerificationTileGrid columns={2}>
          {compactFeatures.map(feature => (
            <View
              key={feature.label}
              className="flex-row items-center gap-1 rounded-lg bg-surface-subtle p-2"
            >
              <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-tint-blue">
                <Icon name={feature.icon} size={18} color={colors.primary} />
              </View>
              <VemtapText
                variant="labelSm"
                className="min-w-0 flex-1 font-sans-medium"
                numberOfLines={1}
              >
                {feature.label}
              </VemtapText>
            </View>
          ))}
        </VerificationTileGrid>
        {wideFeature ? (
          <View className="flex-row items-center gap-1 rounded-lg bg-surface-subtle p-2">
            <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-tint-blue">
              <Icon name={wideFeature.icon} size={18} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelSm"
                className="min-w-0 font-sans-medium"
                numberOfLines={1}
              >
                {wideFeature.label}
              </VemtapText>
              {wideFeature.meta ? (
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {wideFeature.meta}
                </VemtapText>
              ) : null}
            </View>
          </View>
        ) : null}
      </SetupSectionCard>

      <SetupCallout
        icon="shield"
        tone="tint"
        iconSurface="circleMd"
        className="p-4"
        title={copy.noCardTitle}
        bodyVariant="bodyMd"
        body={copy.noCardBody}
      />

      <View className="flex-row flex-wrap items-center justify-between gap-2 px-1 pt-1">
        <VemtapText variant="labelSm" tone="secondary">
          {copy.categoriesLabel}
        </VemtapText>
        <VemtapText variant="caption" className="text-primary">
          {copy.categoriesCount}
        </VemtapText>
      </View>

      <View className="flex-row gap-3">
        {copy.categoryCards.map((card, index) => (
          <View
            key={card.title}
            className="relative h-28 min-w-0 flex-1 overflow-hidden rounded-card shadow-sm"
          >
            <BusinessProductImage
              source={{ uri: categoryImages[index] }}
              alt={card.title}
              className="h-full w-full"
            />
            <LinearGradient
              colors={['transparent', 'rgba(17, 24, 39, 0.2)', 'rgba(17, 24, 39, 0.8)']}
              locations={[0, 0.5, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View className="absolute inset-0 justify-end p-2">
              <VemtapText variant="labelSm" className="font-sans-semibold text-surface">
                {card.title}
              </VemtapText>
              <VemtapText variant="caption" className="text-primary-100">
                {card.meta}
              </VemtapText>
            </View>
          </View>
        ))}
      </View>
    </VerificationPage>
  );
}
