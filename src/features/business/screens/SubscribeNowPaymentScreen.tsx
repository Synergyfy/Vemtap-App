import React, { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { formatCurrency } from '@utils/formatters';
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
import {
  planPrice,
  type BillingPeriod,
  type Plan,
  type PricePreview,
} from '@api/subscriptionsApi';

const PERIODS: BillingPeriod[] = ['monthly', 'quarterly', 'yearly'];

export interface SubscribeNowPaymentScreenProps {
  plan?: Plan | null;
  billingPeriod?: BillingPeriod;
  onChangePeriod?: (period: BillingPeriod) => void;
  /** Server-calculated subtotal, tax and total for the chosen period. */
  preview?: PricePreview | null;
  onBack?: () => void;
  onPay?: () => void;
  onViewTerms?: () => void;
  onHelp?: () => void;
  processing?: boolean;
}

/** Percentage saved against paying monthly for the same months. */
function savingsPercent(plan: Plan, period: BillingPeriod): number {
  const { months } = copy.periods[period];
  const monthlyTotal = plan.monthlyPrice * months;
  if (months === 1 || monthlyTotal <= 0) return 0;
  return Math.round((1 - planPrice(plan, period) / monthlyTotal) * 100);
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/subscribe_now_payment/code.html
 */
export function SubscribeNowPaymentScreen({
  plan,
  billingPeriod = 'monthly',
  onChangePeriod,
  preview,
  onBack,
  onPay,
  onViewTerms,
  onHelp,
  processing = false,
}: SubscribeNowPaymentScreenProps) {
  const handleBack = useCallback(() => onBack?.(), [onBack]);
  const currency = plan?.currency ?? 'NGN';
  const money = (amount: number) => formatCurrency(amount, currency);
  const basePrice = plan ? planPrice(plan, billingPeriod) : 0;
  const total = preview ? preview.total : basePrice;
  const period = copy.periods[billingPeriod];
  const taxEnabled = Boolean(preview?.taxRule?.isEnabled && preview.taxAmount > 0);

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
          plan ? (
            <>
              <PrimaryActionButton
                label={`${copy.payLead}${money(total)}${copy.payMid}${plan.name}`}
                onPress={onPay}
                loading={processing}
                disabled={processing}
              />
              <VemtapText
                variant="caption"
                tone="secondary"
                className="text-center leading-snug"
              >
                {`${copy.renewLead}${money(total)} ${period.cycle}${copy.renewTail}`}
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
          ) : undefined
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
            {`${copy.titleLead}${plan?.name ?? ''}`}
          </VemtapText>
          <VemtapText variant="bodyMd" tone="secondary">
            {copy.subtitle}
          </VemtapText>
        </View>

        {plan ? (
          <SetupSectionCard tone="subtle" className="mt-1 w-full p-6">
            <View className="flex-row flex-wrap items-start justify-between gap-2">
              <View className="min-w-0 flex-1">
                {plan.isPopular ? (
                  <StatusPill label={copy.popularBadge} tone="primary" icon="verified" />
                ) : null}
                <VemtapText variant="labelMd" className="mb-2 mt-2 font-sans-semibold">
                  {plan.name}
                </VemtapText>
              </View>
              <View className="shrink-0 items-end">
                <VemtapText variant="headingLg" className="text-heading-lg text-primary">
                  {money(basePrice)}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {period.cycle}
                </VemtapText>
              </View>
            </View>
            <View className="flex-row flex-wrap items-center gap-1.5">
              <Icon name="autorenew" size={16} color={colors.textTertiary} />
              <VemtapText variant="labelSm" tone="secondary">
                {`${period.title} • ${copy.periodNote}`}
              </VemtapText>
            </View>
            {plan.features.length ? (
              <View className="gap-2.5 rounded-card bg-surface p-3.5 shadow-sm">
                {plan.features.map(perk => (
                  <PlanFeatureRow
                    key={perk}
                    label={perk}
                    state="highlighted"
                    size="sm"
                    className="min-w-0"
                  />
                ))}
              </View>
            ) : null}
          </SetupSectionCard>
        ) : null}

        {plan ? (
          <View className="gap-3">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.periodTitle}
            </VemtapText>
            <View
              accessibilityLabel={copy.periodTitle}
              accessibilityRole="radiogroup"
              className="gap-2"
            >
              {PERIODS.filter(option => planPrice(plan, option) > 0).map(option => {
                const saving = savingsPercent(plan, option);
                const selected = option === billingPeriod;
                return (
                  <SelectableRadioCard
                    key={option}
                    layout="inline"
                    icon="calendar"
                    title={copy.periods[option].title}
                    body={`${money(planPrice(plan, option))} ${copy.periods[option].cycle}`}
                    badge={saving > 0 ? `${copy.saveLead}${saving}%` : undefined}
                    badgeTone="success"
                    selected={selected}
                    onPress={() => onChangePeriod?.(option)}
                    className={selected ? undefined : 'bg-surface-subtle'}
                  />
                );
              })}
            </View>
          </View>
        ) : null}

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
          <SelectableRadioCard
            layout="inline"
            icon="creditCard"
            title={copy.methodName}
            body={copy.methodBody}
            selected
            onPress={() => undefined}
          />
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

        {plan ? (
          <SetupSectionCard tone="subtle" className="w-full p-6">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.billingTitle}
            </VemtapText>
            <View className="gap-2">
              <VerificationSummaryRow
                label={`${plan.name}${copy.subscriptionLine} (${period.title})`}
                value={money(preview?.subtotal ?? basePrice)}
              />
              <VerificationSummaryRow
                label={`${preview?.taxRule?.name ?? 'VAT'}${
                  preview?.taxRule?.rate ? ` (${preview.taxRule.rate}%)` : ''
                }`}
                value={taxEnabled ? money(preview?.taxAmount ?? 0) : money(0)}
                valueTone={taxEnabled ? undefined : 'success'}
                labelTrailing={
                  taxEnabled ? undefined : (
                    <StatusPill label={copy.vatWaived} tone="success" />
                  )
                }
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
                {preview ? money(preview.total) : copy.calculating}
              </VemtapText>
            </View>
          </SetupSectionCard>
        ) : null}
      </VerificationPage>

      <ProcessingOverlay
        visible={processing}
        title={copy.processingTitle}
        body={copy.processingBody}
      />
    </>
  );
}
