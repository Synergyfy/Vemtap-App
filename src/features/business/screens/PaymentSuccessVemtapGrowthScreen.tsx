import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import {
  paymentSuccessCopy as copy,
  verificationImages,
} from '@features/business/verificationCopy';
import { BusinessProductImage } from '@features/business/components/BusinessPrimitives';
import {
  PrimaryActionButton,
  SetupSectionCard,
  StatusPill,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  VerificationPage,
  VerificationSeal,
  VerificationSummaryRow,
} from '@features/business/components/VerificationPrimitives';
import type { BillingPeriod } from '@api/subscriptionsApi';

export interface PaymentSuccessVemtapGrowthScreenProps {
  /** Paid, but the webhook has not activated the plan yet. */
  pending?: boolean;
  planName?: string;
  /** Formatted price for the billing period, e.g. "₦15,000". */
  price?: string | null;
  billingPeriod?: BillingPeriod;
  reference?: string | null;
  paidOn?: string | null;
  nextBilling?: string | null;
  /** e.g. "Visa •••• 4081". */
  cardLabel?: string | null;
  features?: string[];
  businessName?: string | null;
  logoUrl?: string | null;
  branchNames?: string[];
  onGoToDashboard?: () => void;
  onExploreFeatures?: () => void;
  onDownloadInvoice?: () => void;
  onContactSupport?: () => void;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/payment_success_vemtap_growth/code.html
 * The Stitch spec renders this outcome without a header, so the shell is
 * header-less by design.
 */
export function PaymentSuccessVemtapGrowthScreen({
  pending = false,
  planName = '',
  price,
  billingPeriod = 'monthly',
  reference,
  paidOn,
  nextBilling,
  cardLabel,
  features = [],
  businessName,
  logoUrl,
  branchNames = [],
  onGoToDashboard,
  onExploreFeatures,
  onDownloadInvoice,
  onContactSupport,
}: PaymentSuccessVemtapGrowthScreenProps) {
  const handleDashboard = useCallback(() => onGoToDashboard?.(), [onGoToDashboard]);

  return (
    <VerificationPage
      showHeader={false}
      background="surface"
      contentContainerClassName="gap-4"
      footer={
        <>
          <PrimaryActionButton label={copy.dashboard} onPress={handleDashboard} />
          <Button
            label={copy.explore}
            labelVariant="labelMd"
            variant="secondary"
            className="border-0 bg-surface-container"
            leftIcon={<Icon name="explore" size={18} color={colors.secondary} />}
            onPress={onExploreFeatures}
          />
          <View className="flex-row flex-wrap items-center justify-center gap-1 pt-2">
            <VemtapText variant="caption" tone="tertiary">
              {copy.supportQuestion}
            </VemtapText>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={copy.supportAction}
              hitSlop={8}
              onPress={onContactSupport}
            >
              <VemtapText variant="caption" className="font-sans-medium text-primary">
                {copy.supportAction}
              </VemtapText>
            </Pressable>
          </View>
        </>
      }
    >
      <View className="items-center gap-1.5 pt-2">
        <VerificationSeal
          icon="check"
          badgeIcon="verified"
          badgeSurface="primary"
          badgeTone="inverse"
          accessibilityLabel="Payment successful"
          size="md"
          tone="success"
          className="mb-3"
        />
        <View className="mb-1">
          <StatusPill
            label={pending ? copy.pendingBadge : copy.statusBadge}
            tone="brandContainer"
          />
        </View>
        <VemtapText
          accessibilityRole="header"
          variant="headingLg"
          className="text-center text-heading-lg"
        >
          {pending ? copy.pendingTitle : `${copy.titleLead}${planName}`}
        </VemtapText>
        <VemtapText variant="bodyMd" tone="secondary" className="max-w-xs text-center">
          {pending ? copy.pendingSubtitle : copy.subtitle}
        </VemtapText>
      </View>

      <View className="flex-row items-center gap-3.5 rounded-card bg-surface-subtle p-3 shadow-sm">
        <View className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-container">
          <BusinessProductImage
            source={{ uri: logoUrl ?? verificationImages.successStorefront }}
            alt={businessName ?? ''}
            className="h-full w-full"
          />
          <LinearGradient
            colors={['transparent', 'rgba(17, 24, 39, 0.7)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.thumbnailScrim}
          />
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-1.5">
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={1}
            >
              {businessName ?? ''}
            </VemtapText>
            <Icon name="checkCircle" size={16} color={colors.primary} />
          </View>
          <View className="mt-0.5 flex-row items-center gap-1">
            <View className="h-1.5 w-1.5 rounded-full bg-badge-discount-text" />
            <VemtapText
              variant="caption"
              className="min-w-0 flex-1 font-sans-medium text-badge-discount-text"
            >
              {copy.storeStatus}
            </VemtapText>
          </View>
        </View>
        <View className="shrink-0 items-end">
          <VemtapText variant="caption" tone="tertiary">
            {copy.locationsLabel}
          </VemtapText>
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {`${branchNames.length}${copy.activeTail}`}
          </VemtapText>
        </View>
      </View>

      <SetupSectionCard className="w-full">
        <View className="-mx-4 -mt-4 flex-row flex-wrap items-start justify-between gap-2 rounded-t-card bg-surface-subtle p-4">
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-1.5">
              <Icon name="crown" size={18} color={colors.primary} />
              <VemtapText variant="labelMd" className="font-sans-semibold">
                {planName}
              </VemtapText>
            </View>
            <VemtapText variant="caption" tone="secondary">
              {copy.planKind}
            </VemtapText>
          </View>
          <View className="shrink-0 items-end">
            <VemtapText variant="headingLg" className="text-heading-lg">
              {price ?? ''}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary">
              {copy.cycles[billingPeriod]}
            </VemtapText>
          </View>
        </View>

        <View className="flex-row flex-wrap items-center justify-between gap-2 rounded-lg bg-badge-discount-bg px-3 py-2">
          <View className="min-w-0 flex-row items-center gap-1.5">
            <Icon name="autorenew" size={16} color={colors.badgeDiscountText} />
            <VemtapText
              variant="labelSm"
              className="min-w-0 flex-1 font-sans-semibold text-badge-discount-text"
            >
              {copy.ribbon}
            </VemtapText>
          </View>
          <VemtapText
            variant="caption"
            className="font-sans-semibold uppercase tracking-wider text-badge-discount-text"
          >
            {copy.ribbonBadges[billingPeriod]}
          </VemtapText>
        </View>

        <View className="gap-3 pt-1">
          {reference ? (
            <VerificationSummaryRow label={copy.transactionIdLabel} value={reference} />
          ) : null}
          {branchNames.length ? (
            <VerificationSummaryRow
              label={copy.locationsRowLabel}
              value={branchNames.join(' & ')}
            />
          ) : null}
          {paidOn ? (
            <VerificationSummaryRow label={copy.paidOnLabel} value={paidOn} />
          ) : null}
          {nextBilling ? (
            <VerificationSummaryRow label={copy.nextBillingLabel} value={nextBilling} />
          ) : null}
          {cardLabel ? (
            <VerificationSummaryRow label={copy.methodLabel} value={cardLabel} />
          ) : null}
        </View>

        {onDownloadInvoice ? (
          <View className="items-center pt-1">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.invoiceAction}
              onPress={onDownloadInvoice}
              className="min-h-9 flex-row items-center gap-1 active:opacity-75"
            >
              <Icon name="receipt" size={16} color={colors.primary} />
              <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
                {copy.invoiceAction}
              </VemtapText>
            </Pressable>
          </View>
        ) : null}
      </SetupSectionCard>

      {features.length && !pending ? (
        <SetupSectionCard className="w-full">
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <VemtapText variant="labelMd" className="font-sans-semibold tracking-tight">
              {copy.benefitsTitle}
            </VemtapText>
            <StatusPill label={copy.benefitsBadge} tone="brand" />
          </View>
          <View className="gap-3">
            {features.map(benefit => (
              <View key={benefit} className="flex-row items-start gap-3">
                <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-badge-discount-bg">
                  <Icon name="check" size={16} color={colors.badgeDiscountText} />
                </View>
                <View className="min-w-0 flex-1">
                  <VemtapText variant="labelMd" className="font-sans-medium">
                    {benefit}
                  </VemtapText>
                </View>
              </View>
            ))}
          </View>
        </SetupSectionCard>
      ) : null}
    </VerificationPage>
  );
}

const styles = StyleSheet.create({
  thumbnailScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 16,
  },
});
