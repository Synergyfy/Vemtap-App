import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { businessIntroCopy as copy } from '@features/business/businessCopy';
import { businessIntroImages, introPillars } from '@features/business/businessData';
import {
  PrimaryActionButton,
  SetupSectionCard,
  StatusPill,
  TextActionButton,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  PillarRow,
  RadiusSlider,
  SocialProofTile,
  StorefrontHero,
  TrustRow,
} from '@features/business/components/BusinessSetupCards';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

const RADIUS_MIN = 500;
const RADIUS_MAX = 3500;
const RADIUS_STEP = 250;
const RADIUS_DEFAULT = 1500;

const audienceDensity: { max: number; label: string }[] = [
  { max: 1000, label: 'Medium Density' },
  { max: 2000, label: 'High Density' },
  { max: RADIUS_MAX, label: 'Peak Density' },
];

export interface BusinessIntroductionScreenProps {
  onBack?: () => void;
  onSetUpBusiness?: () => void;
  onLearnMore?: () => void;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/business_introduction_vemtap_for_business/code.html
 * (full page, scrollable with a persistent action deck).
 */
export function BusinessIntroductionScreen({
  onBack,
  onSetUpBusiness,
  onLearnMore,
}: BusinessIntroductionScreenProps) {
  const [radius, setRadius] = useState(RADIUS_DEFAULT);
  const [toolsExpanded, setToolsExpanded] = useState(true);

  const radiusLabel = useMemo(() => `${(radius / 1000).toFixed(1)} km radius`, [radius]);
  const reach = useMemo(
    () => Math.round((radius / 1000) * (radius / 1000) * 1280).toLocaleString('en-US'),
    [radius],
  );
  const density = useMemo(
    () => audienceDensity.find(entry => radius <= entry.max)?.label ?? 'Peak Density',
    [radius],
  );

  const onToggleTools = useCallback(() => setToolsExpanded(current => !current), []);
  const handleBack = useCallback(() => onBack?.(), [onBack]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <RegistrationHeader title={copy.header} onBack={handleBack} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-6 pb-6 pt-2"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-1">
          <VemtapText
            accessibilityRole="header"
            variant="headingMd"
            className="text-heading-md"
          >
            {copy.title}
          </VemtapText>
          <VemtapText variant="labelSm" tone="secondary" className="mt-1">
            {copy.subtitle}
          </VemtapText>
        </View>

        <StorefrontHero
          imageUri={businessIntroImages.storefront}
          districtLabel={copy.storeDistrict}
          badgeLabel={copy.zeroCommission}
          footfallLabel={copy.footfallLabel}
          footfallValue={copy.footfallValue}
          returnLabel={copy.returnLabel}
          returnValue={copy.returnValue}
        />

        <SetupSectionCard tone="container" className="gap-2">
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <View className="min-w-0 flex-row items-center gap-1.5">
              <Icon name="radar" size={18} color={colors.primary} />
              <VemtapText
                variant="labelMd"
                className="min-w-0 flex-1 font-sans-semibold text-text"
              >
                {copy.audienceTitle}
              </VemtapText>
            </View>
            <StatusPill label={radiusLabel} tone="brand" />
          </View>
          <VemtapText variant="caption" tone="secondary">
            {copy.audienceHint}
          </VemtapText>
          <RadiusSlider
            min={RADIUS_MIN}
            max={RADIUS_MAX}
            step={RADIUS_STEP}
            initialValue={RADIUS_DEFAULT}
            onChange={setRadius}
          />
          <View className="mt-1 flex-row flex-wrap items-center justify-between gap-2 pt-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              <Icon name="groupAdd" size={18} color={colors.badgeDiscountText} />
              <VemtapText
                variant="labelSm"
                className="min-w-0 flex-1 font-sans-medium text-text"
              >
                <VemtapText variant="labelMd" className="font-sans-semibold text-primary">
                  {reach}
                </VemtapText>{' '}
                {copy.audienceReady}
              </VemtapText>
            </View>
            <StatusPill label={density} tone="success" />
          </View>
        </SetupSectionCard>

        <View className="flex-row flex-wrap items-center justify-between gap-2 pt-3">
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelMd" className="font-sans-semibold text-text">
              {copy.pillarsTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary">
              {copy.pillarsSubtitle}
            </VemtapText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.pillarsToggle}
            accessibilityState={{ expanded: toolsExpanded }}
            onPress={onToggleTools}
            className="flex-row items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 active:bg-surface-container-high"
          >
            <VemtapText
              variant="caption"
              className="font-sans-semibold text-text-secondary"
            >
              {copy.pillarsToggle}
            </VemtapText>
            <Icon
              name="expandMore"
              size={18}
              color={colors.textSecondary}
              style={toolsExpanded ? { transform: [{ rotate: '180deg' }] } : undefined}
            />
          </Pressable>
        </View>

        {toolsExpanded ? (
          <View className="gap-3">
            {introPillars.map(pillar => (
              <PillarRow key={pillar.id} pillar={pillar} />
            ))}
          </View>
        ) : null}

        <SocialProofTile
          avatarUri={businessIntroImages.founder}
          quote={copy.testimonial}
          author={copy.testimonialAuthor}
        />
      </ScrollView>

      <View className="gap-2 border-t border-border bg-surface px-6 pb-2 pt-3">
        <View className="flex-row flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <TrustRow label={copy.freeToJoin} />
          <VemtapText variant="caption" tone="tertiary">
            •
          </VemtapText>
          <TrustRow label={copy.noSetupFees} />
          <VemtapText variant="caption" tone="tertiary">
            •
          </VemtapText>
          <View className="flex-row items-center gap-1">
            <Icon name="verifiedUser" size={14} color={colors.primary} />
            <VemtapText
              variant="caption"
              className="font-sans-medium text-text-secondary"
            >
              {copy.verifiedMerchants}
            </VemtapText>
          </View>
        </View>
        <PrimaryActionButton label={copy.setUpBusiness} onPress={onSetUpBusiness} />
        <TextActionButton label={copy.learnMore} icon="openInNew" onPress={onLearnMore} />
      </View>
    </SafeAreaView>
  );
}
