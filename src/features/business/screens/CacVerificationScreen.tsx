import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { ProgressDots } from '@components/onboarding/ProgressDots';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cacVerificationCopy } from '@features/business/verificationCopy';
import {
  FieldInput,
  PrimaryActionButton,
  SetupCallout,
  StatusPill,
} from '@features/business/components/BusinessSetupPrimitives';
import { BusinessFieldLabel } from '@features/business/components/BusinessPrimitives';
import {
  SelectableRadioCard,
  VerificationPage,
} from '@features/business/components/VerificationPrimitives';
import { useVerifyBusiness } from '@features/business/hooks/useVerification';
import type { VerificationCheck } from '@api/verificationApi';
import { showToast } from '@components/shared/toast';

const copy = cacVerificationCopy;
const entityIcons = ['storefront', 'officeBuilding', 'accountBalance'] as const;
type EntityPrefix = (typeof cacVerificationCopy.entities)[number]['id'];

export interface CacVerificationScreenProps {
  /** The business name on VEMTAP; CAC's legal name is compared with it. */
  businessName?: string | null;
  onBack?: () => void;
  /** Called with the stored check; route on `check.status`. */
  onResult?: (check: VerificationCheck) => void;
  onRegisterFirst?: () => void;
}

/** Keeps the digits of a registration number ("RC-1234567" → "1234567"). */
function digitsOnly(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/cac_verification/code.html
 */
export function CacVerificationScreen({
  businessName,
  onBack,
  onResult,
  onRegisterFirst,
}: CacVerificationScreenProps) {
  const [entityType, setEntityType] = useState<EntityPrefix>('BN');
  const [number, setNumber] = useState('');
  const verifyBusiness = useVerifyBusiness();

  const handleBack = useCallback(() => onBack?.(), [onBack]);
  const formatValid = number.length >= 4;

  const handleSubmit = useCallback(async () => {
    if (!formatValid) {
      showToast(copy.numberInvalid, 'error');
      return;
    }
    try {
      const check = await verifyBusiness.mutateAsync(`${entityType}${number}`);
      onResult?.(check);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Verification failed', 'error');
    }
  }, [entityType, formatValid, number, onResult, verifyBusiness]);

  return (
    <VerificationPage
      title={copy.header}
      onBack={handleBack}
      contentContainerClassName="gap-6"
      footer={
        <>
          <PrimaryActionButton
            label={copy.submit}
            onPress={handleSubmit}
            loading={verifyBusiness.isPending}
            disabled={verifyBusiness.isPending}
          />
          <View className="flex-row flex-wrap items-center justify-center gap-1 pt-1">
            <VemtapText variant="caption" tone="secondary">
              {copy.notIncorporatedLead}
            </VemtapText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.notIncorporatedAction}
              onPress={onRegisterFirst}
              hitSlop={8}
            >
              <VemtapText variant="caption" className="font-sans-medium text-primary">
                {copy.notIncorporatedAction}
              </VemtapText>
            </Pressable>
          </View>
        </>
      }
    >
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <StatusPill label={copy.pill} tone="brandHigh" icon="verifiedUser" />
        <ProgressDots total={2} activeIndex={1} />
      </View>

      <View className="gap-1.5">
        <VemtapText
          accessibilityRole="header"
          variant="headingLg"
          className="text-heading-lg"
        >
          {copy.title}
        </VemtapText>
        <VemtapText variant="bodyMd" tone="secondary" className="leading-relaxed">
          {copy.subtitle}
        </VemtapText>
      </View>

      <SetupCallout
        icon="bolt"
        tone="container"
        iconSurface="circleMd"
        title={copy.registryTitle}
        body={copy.registryBody}
        trailing={<StatusPill label={copy.registryBadge} tone="success" />}
      />

      <View className="gap-4">
        <View className="gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.entityLabel}
          </VemtapText>
          <View
            accessibilityLabel={copy.entityLabel}
            accessibilityRole="radiogroup"
            className="flex-row gap-2"
          >
            {copy.entities.map((entity, index) => (
              <SelectableRadioCard
                key={entity.id}
                layout="grid"
                icon={entityIcons[index]}
                title={entity.title}
                caption={entity.caption}
                selected={entityType === entity.id}
                onPress={() => setEntityType(entity.id)}
                className="min-w-0 flex-1"
              />
            ))}
          </View>
        </View>

        <View className="gap-1.5">
          <BusinessFieldLabel
            label={`${copy.numberLabel} (${entityType})`}
            trailing={
              formatValid ? (
                <View className="flex-row items-center gap-1">
                  <Icon name="checkCircle" size={14} color={colors.badgeDiscountText} />
                  <VemtapText
                    variant="caption"
                    className="font-sans-medium text-badge-discount-text"
                  >
                    {copy.numberValid}
                  </VemtapText>
                </View>
              ) : undefined
            }
          />
          <FieldInput
            accessibilityLabel={copy.numberLabel}
            value={number}
            onChangeText={value => setNumber(digitsOnly(value))}
            placeholder={copy.numberPlaceholder}
            keyboardType="number-pad"
            tone="lowest"
            leadingIcon="badge"
          />
          <VemtapText variant="caption" tone="secondary" className="px-1">
            {copy.numberHint}
          </VemtapText>
        </View>

        {businessName ? (
          <View className="gap-1.5">
            <BusinessFieldLabel label={copy.nameLabel} />
            <View
              accessibilityLabel={`${copy.nameLabel}: ${businessName}`}
              className="h-[52px] flex-row items-center gap-3 rounded-[14px] bg-surface-container-lowest px-4"
            >
              <Icon name="officeBuilding" size={20} color={colors.textTertiary} />
              <VemtapText variant="bodyMd" className="min-w-0 flex-1" numberOfLines={1}>
                {businessName}
              </VemtapText>
              <Icon name="lock" size={18} color={colors.textTertiary} />
            </View>
            <VemtapText variant="caption" tone="secondary" className="px-1">
              {copy.nameHint}
            </VemtapText>
          </View>
        ) : null}

        <SetupCallout
          icon="shieldLock"
          tone="tint"
          iconSurface="plain"
          iconSize={18}
          className="px-3"
          bodyClassName="leading-relaxed"
          body={copy.privacy}
        />
      </View>
    </VerificationPage>
  );
}
