import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { ProgressDots } from '@components/onboarding/ProgressDots';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cacVerificationCopy as copy } from '@features/business/verificationCopy';
import {
  FieldInput,
  PrimaryActionButton,
  SetupCallout,
  SetupSectionCard,
  StatusPill,
} from '@features/business/components/BusinessSetupPrimitives';
import { BusinessFieldLabel } from '@features/business/components/BusinessPrimitives';
import {
  SelectableRadioCard,
  UploadChip,
  VerificationPage,
} from '@features/business/components/VerificationPrimitives';

const entityIcons = ['storefront', 'officeBuilding', 'accountBalance'] as const;

export interface CacVerificationValue {
  entityType: string;
  registrationNumber: string;
  businessName: string;
  certificateFile?: string;
}

export interface CacVerificationScreenProps {
  onBack?: () => void;
  onSubmit?: (value: CacVerificationValue) => void;
  onAttachCertificate?: () => void;
  onRegisterFirst?: () => void;
  initialValue?: Partial<CacVerificationValue>;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/cac_verification/code.html
 */
export function CacVerificationScreen({
  onBack,
  onSubmit,
  onAttachCertificate,
  onRegisterFirst,
  initialValue,
}: CacVerificationScreenProps) {
  const [entityType, setEntityType] = useState<string>(initialValue?.entityType ?? 'BN');
  const [number, setNumber] = useState<string>(
    initialValue?.registrationNumber ?? copy.numberValue,
  );
  const [businessName, setBusinessName] = useState<string>(
    initialValue?.businessName ?? copy.nameValue,
  );
  const [certificate, setCertificate] = useState<string | null>(
    initialValue?.certificateFile ?? null,
  );

  const handleBack = useCallback(() => onBack?.(), [onBack]);
  const attachCertificate = useCallback(() => {
    setCertificate(copy.uploadFileName);
    onAttachCertificate?.();
  }, [onAttachCertificate]);
  const removeCertificate = useCallback(() => setCertificate(null), []);

  return (
    <VerificationPage
      title={copy.header}
      onBack={handleBack}
      contentContainerClassName="gap-6"
      footer={
        <>
          <PrimaryActionButton
            label={copy.submit}
            onPress={() =>
              onSubmit?.({
                entityType,
                registrationNumber: number,
                businessName,
                certificateFile: certificate ?? undefined,
              })
            }
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
        <ProgressDots total={3} activeIndex={1} />
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
            label={copy.numberLabel}
            trailing={
              <View className="flex-row items-center gap-1">
                <Icon name="checkCircle" size={14} color={colors.badgeDiscountText} />
                <VemtapText
                  variant="caption"
                  className="font-sans-medium text-badge-discount-text"
                >
                  {copy.numberValid}
                </VemtapText>
              </View>
            }
          />
          <FieldInput
            accessibilityLabel={copy.numberLabel}
            value={number}
            onChangeText={setNumber}
            placeholder={copy.numberPlaceholder}
            autoCapitalize="characters"
            keyboardType="default"
            tone="lowest"
            leadingIcon="badge"
            trailingIcon="verified"
            trailingIconColor={colors.primary}
          />
          <VemtapText variant="caption" tone="secondary" className="px-1">
            {copy.numberHint}
          </VemtapText>
        </View>

        <View className="gap-1.5">
          <BusinessFieldLabel label={copy.nameLabel} />
          <FieldInput
            accessibilityLabel={copy.nameLabel}
            value={businessName}
            onChangeText={setBusinessName}
            placeholder={copy.namePlaceholder}
            keyboardType="default"
            tone="lowest"
            leadingIcon="officeBuilding"
          />
          <VemtapText variant="caption" tone="secondary" className="px-1">
            {copy.nameHint}
          </VemtapText>
        </View>

        <SetupSectionCard tone="low" className="w-full">
          <View className="flex-row items-start gap-3">
            <View className="mt-0.5 h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
              <Icon name="fileDocument" size={20} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <View className="flex-row flex-wrap items-center gap-2">
                <VemtapText variant="labelMd" className="min-w-0 font-sans-semibold">
                  {copy.uploadTitle}
                </VemtapText>
                <StatusPill label={copy.uploadBadge} tone="neutral" />
              </View>
              <VemtapText
                variant="caption"
                tone="secondary"
                className="mt-0.5 leading-normal"
              >
                {copy.uploadBody}
              </VemtapText>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.uploadAction}
            onPress={attachCertificate}
            className="items-center gap-2 rounded-card bg-surface p-4 active:bg-surface-subtle"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-fixed">
              <Icon name="imagePlus" size={22} color={colors.primary} />
            </View>
            <View className="items-center gap-0.5">
              <VemtapText variant="button" className="font-sans-medium text-primary">
                {copy.uploadAction}
              </VemtapText>
              <VemtapText variant="caption" tone="tertiary">
                {copy.uploadActionHint}
              </VemtapText>
            </View>
          </Pressable>
          {certificate ? (
            <UploadChip
              fileName={certificate}
              onRemove={removeCertificate}
              removeLabel={copy.removeFileLabel}
              tone="success"
            />
          ) : null}
        </SetupSectionCard>

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
