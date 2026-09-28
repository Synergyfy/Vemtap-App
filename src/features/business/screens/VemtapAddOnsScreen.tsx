import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import { vemtapAddOnsCopy as copy } from '@features/business/verificationCopy';
import { BusinessProductImage } from '@features/business/components/BusinessPrimitives';
import {
  SetupSectionCard,
  StatusPill,
  type PillTone,
} from '@features/business/components/BusinessSetupPrimitives';
import { VerificationPage } from '@features/business/components/VerificationPrimitives';

const ADD_ON_IMAGES = {
  boostDeal:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBWTtRidQwuW9xLsfx9UwkC-dRF93WR7gYGp67eXpJW9rFh1v75uv7wVnYHgDZxG-6dklauRdi7bWwy6S9olY12xv51r_8IBPnPuZxP0mKcoiW45b7x_VjVAfCwsoK1miDoxreJELT6zbOgC_t1i8qBCvbbWc9WQSrmiYNWCkqCLDYdU1uwpxiAlD19-rOHLN0OoBbU49cNimDp5wOwO-e2vwKkPaVYaFE1SrkRbW4TaQEfuu991VVmgw',
  promoteBusiness:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBYUNYjcfh8PjajY1pdmAcScVjolApMRKWER3jMevPSS0Oz5M_i15-Ps2NMpNfh1b1jXbm8huKV0__OK6YdKPWcWD_e1fHW8-3vhpnenNo7NuhmCWvAm4vZyXbcsD7HaDU0-RMHwSNNMFYTmGEG7juOIUgAH2BgQo7Ao35quwzRq1RP2c6DEnezXK1jksjyx7mFOVqnxx2vmF09tKEEh8ZSuvNyONtpTmTDpTTwbVqKHx_s_MzCvRUcJg',
  posHardware:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAqQFUIKZaCUhPtU_pjePUG8bXiHc7_CW9OARNkJRft82ZNSTHquZW8K_PLX5de876RaJfe30PEX7NhODi5JoDmEypcg_6RbXhVaZo0k9Mo_VxuzJ35pnh--xWeRK9p1OcZW8X0jE5Pl_1V8fyuWjm_hZDHUGwbzZ82d3BHyI9gNmrUNDzPfHEEhuQvymHUWA2dRqaNBWyhJ3qvPi5xjNLrxc2PVwXifyEgbp9-TddRwM5-m5oJqTr5ZA',
} as const;

type AddOnImageKey = keyof typeof ADD_ON_IMAGES;

interface AddOnCardProps {
  addOn: (typeof copy.addOns)[number];
  onPress: () => void;
  onJoinWaitlist: () => void;
}

function AddOnCard({ addOn, onPress, onJoinWaitlist }: AddOnCardProps) {
  const image = addOn.image as AddOnImageKey | null;
  const features = 'features' in addOn ? addOn.features : null;
  const statIcon = addOn.statIcon as IconName | null;
  const actionIcon = addOn.actionIcon as IconName;
  const isSecondary = addOn.actionVariant === 'secondary';
  const hasSecondaryBadge = 'badgeSecondary' in addOn && Boolean(addOn.badgeSecondary);

  return (
    <SetupSectionCard tone="subtle" className="w-full gap-3">
      <View className="flex-row flex-wrap items-start justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          <View
            className={cn(
              'h-11 w-11 shrink-0 items-center justify-center rounded-lg',
              isSecondary ? 'bg-surface-container-high' : 'bg-surface-tint-blue',
            )}
          >
            <Icon
              name={addOn.icon as IconName}
              size={24}
              color={isSecondary ? colors.secondary : colors.primary}
            />
          </View>
          <View className="min-w-0 flex-1">
            <View className="mb-1 flex-row flex-wrap items-center gap-1.5">
              <StatusPill
                label={addOn.badge}
                tone={hasSecondaryBadge ? 'brandHigh' : (addOn.badgeTone as PillTone)}
                className="self-start"
              />
              {hasSecondaryBadge ? (
                <StatusPill
                  label={addOn.badgeSecondary}
                  tone="neutral"
                  className="self-start"
                />
              ) : null}
            </View>
            <VemtapText variant="labelMd" className="min-w-0 font-sans-semibold">
              {addOn.title}
            </VemtapText>
          </View>
        </View>
      </View>

      <VemtapText variant="bodyMd" tone="secondary">
        {addOn.body}
      </VemtapText>

      {image ? (
        <View
          className={cn(
            'relative my-1 w-full overflow-hidden rounded-lg',
            isSecondary ? 'h-24 opacity-80' : 'h-28',
          )}
        >
          <BusinessProductImage
            source={{ uri: ADD_ON_IMAGES[image] }}
            alt={addOn.imageAlt ?? addOn.title}
            className="h-full w-full"
          />
          <LinearGradient
            colors={['transparent', 'transparent', 'rgba(248, 250, 252, 0.95)']}
            locations={[0, 0.55, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {addOn.stat ? (
            <View className="absolute bottom-2 left-2.5 flex-row items-center gap-1.5 rounded bg-surface/90 px-2 py-1 shadow-sm">
              {statIcon ? (
                <Icon name={statIcon} size={14} color={colors.primary} />
              ) : (
                <View className="bg-badgeDiscountText h-2 w-2 rounded-full" />
              )}
              <VemtapText variant="caption" className="font-sans-medium">
                {addOn.stat}
              </VemtapText>
            </View>
          ) : null}
        </View>
      ) : null}

      {!image && addOn.stat && statIcon ? (
        <View className="flex-row items-center justify-between gap-2 rounded-lg bg-surface p-3">
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <Icon name={statIcon} size={20} color={colors.textTertiary} />
            <VemtapText variant="labelSm" tone="secondary" className="min-w-0 flex-1">
              {addOn.stat}
            </VemtapText>
          </View>
          {'statValue' in addOn && addOn.statValue ? (
            <VemtapText
              variant="labelSm"
              className="shrink-0 font-sans-semibold text-primary"
            >
              {addOn.statValue}
            </VemtapText>
          ) : null}
        </View>
      ) : null}

      {features ? (
        <View className="flex-row gap-2">
          {features.map(feature => (
            <View
              key={feature.label}
              className="w-1/3 flex-1 items-center gap-0.5 rounded-lg bg-surface px-2.5 py-2.5"
            >
              <Icon name={feature.icon as IconName} size={18} color={colors.primary} />
              <VemtapText
                variant="caption"
                tone="secondary"
                className="text-center font-sans-medium"
              >
                {feature.label}
              </VemtapText>
            </View>
          ))}
        </View>
      ) : null}

      <View className="mt-auto flex-row flex-wrap items-end justify-between gap-3 pt-1">
        {addOn.price ? (
          <View className="min-w-0 shrink-0">
            <VemtapText variant="caption" tone="tertiary">
              {addOn.priceCaption}
            </VemtapText>
            <View className="flex-row items-baseline gap-1">
              <VemtapText variant="labelMd" className="font-sans-bold font-sans-semibold">
                {addOn.price}
              </VemtapText>
              {addOn.priceSuffix ? (
                <VemtapText variant="caption" tone="secondary">
                  {addOn.priceSuffix}
                </VemtapText>
              ) : null}
            </View>
          </View>
        ) : 'statLeadingLabel' in addOn && addOn.statLeadingLabel ? (
          <View className="min-w-0 shrink-0 flex-row items-center gap-1.5">
            <Icon name="devices" size={18} color={colors.textSecondary} />
            <VemtapText variant="labelSm" tone="secondary" className="font-sans-medium">
              {addOn.statLeadingLabel}
            </VemtapText>
          </View>
        ) : (
          <View className="shrink-0" />
        )}

        <Button
          label={addOn.action}
          labelVariant="labelSm"
          fullWidth={false}
          rightIcon={
            <Icon
              name={actionIcon}
              size={18}
              color={isSecondary ? colors.onSurfaceVariant : colors.surface}
            />
          }
          variant={isSecondary ? 'secondary' : 'primary'}
          size="sm"
          className={isSecondary ? 'border-0 bg-surface-container' : undefined}
          labelClassName={isSecondary ? 'text-text-secondary' : undefined}
          onPress={isSecondary ? onJoinWaitlist : onPress}
        />
      </View>
    </SetupSectionCard>
  );
}

export interface VemtapAddOnsScreenProps {
  onBack?: () => void;
  onHelp?: () => void;
  onSelectAddOn?: (addOnTitle: string) => void;
  onJoinPosWaitlist?: () => void;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/vemtap_add_ons/code.html
 */
export function VemtapAddOnsScreen({
  onBack,
  onHelp,
  onSelectAddOn,
  onJoinPosWaitlist,
}: VemtapAddOnsScreenProps) {
  const handleBack = useCallback(() => onBack?.(), [onBack]);

  return (
    <VerificationPage
      title={copy.header}
      onBack={handleBack}
      helpLabel={copy.helpLabel}
      onHelp={onHelp}
      background="surface"
      contentContainerClassName="gap-4"
    >
      <View className="gap-1.5 pb-1 pt-2">
        <View className="flex-row items-center gap-2">
          <View className="h-6 w-6 items-center justify-center rounded-full bg-primary-fixed">
            <Icon name="bolt" size={15} color={colors.primary} />
          </View>
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold uppercase tracking-wider text-primary"
          >
            {copy.eyebrow}
          </VemtapText>
        </View>
        <VemtapText variant="bodyMd" tone="secondary" className="leading-relaxed">
          {copy.subtitle}
        </VemtapText>
      </View>

      {copy.addOns.map(addOn => (
        <AddOnCard
          key={addOn.title}
          addOn={addOn}
          onPress={() => onSelectAddOn?.(addOn.title)}
          onJoinWaitlist={() => onJoinPosWaitlist?.()}
        />
      ))}

      <View className="mb-2 mt-6 flex-row items-start gap-3 rounded-card bg-surface-tint-blue p-4">
        <View className="mt-0.5 shrink-0">
          <Icon name="info" size={22} color={colors.primary} />
        </View>
        <VemtapText
          variant="bodyMd"
          tone="secondary"
          className="min-w-0 flex-1 leading-relaxed"
        >
          {copy.note}{' '}
          <VemtapText variant="bodyMd" className="font-sans-semibold">
            {copy.noteEmphasis}
          </VemtapText>
          .
        </VemtapText>
      </View>
    </VerificationPage>
  );
}
