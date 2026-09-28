import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import {
  subscribeNowCopy as copy,
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
  PlanFeatureRow,
  ProcessingOverlay,
  SelectableRadioCard,
  VerificationPage,
  VerificationSummaryRow,
} from '@features/business/components/VerificationPrimitives';

const methodIcons = ['creditCard', 'accountBalance', 'contactless'] as const;

export type PaymentMethodId = 'paystack' | 'virtual_account' | 'digital_wallet';

export interface SubscribeNowPaymentScreenProps {
  onBack?: () => void;
  onPay?: (method: PaymentMethodId) => void;
  onViewTerms?: () => void;
  onHelp?: () => void;
  processing?: boolean;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/subscribe_now_payment/code.html
 */
export function SubscribeNowPaymentScreen({
  onBack,
  onPay,
  onViewTerms,
  onHelp,
  processing = false,
}: SubscribeNowPaymentScreenProps) {
  const [method, setMethod] = useState<PaymentMethodId>('paystack');

  const handleBack = useCallback(() => onBack?.(), [onBack]);

  return (
    <>
      <VerificationPage
        title={copy.header}
        onBack={handleBack}
        helpLabel={copy.helpLabel}
        onHelp={onHelp}
        background="surface"
        contentContainerClassName="gap-5"
        footer={
          <>
            <PrimaryActionButton label={copy.pay} onPress={() => onPay?.(method)} />
            <VemtapText
              variant="caption"
              tone="secondary"
              className="text-center leading-snug"
            >
              {copy.renewNote}
            </VemtapText>
            <View className="items-center">
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={copy.termsAction}
                hitSlop={8}
                onPress={onViewTerms}
                className="min-h-9 flex-row items-center gap-0.5"
              >
                <VemtapText variant="caption" className="font-sans-medium text-primary">
                  {copy.termsAction}
                </VemtapText>
                <Icon name="openInNew" size={13} color={colors.primary} />
              </Pressable>
            </View>
          </>
        }
      >
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <View className="flex-row items-center gap-2 self-start">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-badge-discount-bg">
              <Icon name="bolt" size={16} color={colors.badgeDiscountText} />
            </View>
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold uppercase tracking-wide text-primary"
            >
              {copy.tierBadge}
            </VemtapText>
          </View>
          <View className="flex-row items-center gap-1.5 self-start rounded-full bg-badge-discount-bg px-2.5 py-1">
            <View className="h-2 w-2 rounded-full bg-badge-discount-text" />
            <VemtapText
              variant="caption"
              className="font-sans-semibold text-badge-discount-text"
            >
              {copy.zeroFeeBadge}
            </VemtapText>
          </View>
        </View>

        <View className="mt-1 gap-1">
          <VemtapText
            accessibilityRole="header"
            variant="headingLg"
            className="text-heading-lg"
          >
            {copy.title}
          </VemtapText>
          <VemtapText variant="bodyMd" tone="secondary">
            {copy.subtitle}
          </VemtapText>
        </View>

        <SetupSectionCard tone="subtle" className="mt-1 w-full p-6">
          <View className="flex-row flex-wrap items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <StatusPill label={copy.planBadge} tone="primary" icon="verified" />
              <VemtapText variant="labelMd" className="mb-2 mt-2 font-sans-semibold">
                {copy.planName}
              </VemtapText>
            </View>
            <View className="shrink-0 items-end">
              <VemtapText variant="headingLg" className="text-heading-lg text-primary">
                {copy.planPrice}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {copy.planCycle}
              </VemtapText>
            </View>
          </View>
          <View className="flex-row flex-wrap items-center gap-1.5">
            <Icon name="autorenew" size={16} color={colors.textTertiary} />
            <VemtapText variant="labelSm" tone="secondary">
              {copy.planCycleNote}
            </VemtapText>
          </View>
          <View className="gap-2.5 rounded-card bg-surface p-3.5 shadow-sm">
            {copy.perks.map(perk => (
              <PlanFeatureRow
                key={perk}
                label={perk}
                state="highlighted"
                size="sm"
                className="min-w-0"
              />
            ))}
          </View>
        </SetupSectionCard>

        <View className="mt-1 flex-row items-center gap-4 rounded-card-lg bg-surface-container-low p-4">
          <BusinessProductImage
            source={{ uri: verificationImages.merchantOwner }}
            alt={copy.storeReadyTitle}
            className="h-16 w-16 shrink-0 rounded-card shadow-sm"
          />
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-1">
              <Icon name="storefront" size={16} color={colors.primary} />
              <VemtapText
                variant="caption"
                className="font-sans-semibold uppercase tracking-wider text-primary"
              >
                {copy.storeReadyLabel}
              </VemtapText>
            </View>
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.storeReadyTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" className="leading-snug">
              {copy.storeReadyBody}
            </VemtapText>
          </View>
        </View>

        <View className="mt-2 gap-3">
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.methodTitle}
            </VemtapText>
            <VemtapText variant="caption" className="font-sans-medium text-primary">
              {copy.methodBadge}
            </VemtapText>
          </View>
          <View
            accessibilityLabel={copy.methodTitle}
            accessibilityRole="radiogroup"
            className="gap-2"
          >
            {copy.methods.map((option, index) => {
              const selected = method === option.id;
              return (
                <SelectableRadioCard
                  key={option.id}
                  layout="inline"
                  icon={methodIcons[index]}
                  title={option.title}
                  badge={'badge' in option ? option.badge : undefined}
                  badgeTone="brand"
                  body={option.body}
                  selected={selected}
                  onPress={() => setMethod(option.id as PaymentMethodId)}
                  className={selected ? undefined : 'bg-surface-subtle'}
                />
              );
            })}
          </View>
        </View>

        <SetupCallout
          icon="lock"
          tone="subtle"
          iconSurface="circleSuccess"
          iconTone="success"
          className="p-4"
          bodyClassName="leading-relaxed"
          title={copy.securityTitle}
          body={copy.securityBody}
        />

        <SetupSectionCard tone="subtle" className="w-full p-6">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.billingTitle}
          </VemtapText>
          <View className="gap-2">
            <VerificationSummaryRow
              label={copy.billingLine}
              value={copy.billingLineValue}
            />
            <VerificationSummaryRow
              label={copy.vatLabel}
              value={copy.vatValue}
              valueTone="success"
              labelTrailing={<StatusPill label={copy.vatBadge} tone="success" />}
            />
          </View>
          <View className="flex-row flex-wrap items-center justify-between gap-2 rounded-card bg-surface p-3.5 shadow-sm">
            <View className="min-w-0 flex-1">
              <VemtapText variant="labelMd" className="font-sans-semibold">
                {copy.totalLabel}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {copy.totalNote}
              </VemtapText>
            </View>
            <VemtapText variant="headingLg" className="text-heading-lg text-primary">
              {copy.totalValue}
            </VemtapText>
          </View>
        </SetupSectionCard>
      </VerificationPage>

      <ProcessingOverlay
        visible={processing}
        title={copy.processingTitle}
        body={copy.processingBody}
      />
    </>
  );
}
