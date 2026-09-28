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

export interface PaymentSuccessVemtapGrowthScreenProps {
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
          <StatusPill label={copy.statusBadge} tone="brandContainer" />
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

      <View className="flex-row items-center gap-3.5 rounded-card bg-surface-subtle p-3 shadow-sm">
        <View className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-container">
          <BusinessProductImage
            source={{ uri: verificationImages.successStorefront }}
            alt={copy.storeName}
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
              {copy.storeName}
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
            {copy.locationsValue}
          </VemtapText>
        </View>
      </View>

      <SetupSectionCard className="w-full">
        <View className="-mx-4 -mt-4 flex-row flex-wrap items-start justify-between gap-2 rounded-t-card bg-surface-subtle p-4">
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-1.5">
              <Icon name="crown" size={18} color={colors.primary} />
              <VemtapText variant="labelMd" className="font-sans-semibold">
                {copy.planName}
              </VemtapText>
            </View>
            <VemtapText variant="caption" tone="secondary">
              {copy.planKind}
            </VemtapText>
          </View>
          <View className="shrink-0 items-end">
            <VemtapText variant="headingLg" className="text-heading-lg">
              {copy.planPrice}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary">
              {copy.planCycle}
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
            {copy.ribbonBadge}
          </VemtapText>
        </View>

        <View className="gap-3 pt-1">
          <VerificationSummaryRow
            label={copy.transactionIdLabel}
            value={copy.transactionId}
          />
          <VerificationSummaryRow
            label={copy.locationsRowLabel}
            value={copy.locationsRowValue}
          />
          <VerificationSummaryRow label={copy.paidOnLabel} value={copy.paidOn} />
          <VerificationSummaryRow
            label={copy.nextBillingLabel}
            value={copy.nextBilling}
          />
          <VerificationSummaryRow
            label={copy.methodLabel}
            value={copy.methodValue}
            trailing={
              <View className="h-4 w-6 items-center justify-center rounded bg-surface-container px-1">
                <VemtapText
                  variant="micro"
                  className="font-sans-bold tracking-tight text-primary"
                >
                  {copy.methodBrand}
                </VemtapText>
              </View>
            }
          />
        </View>

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
      </SetupSectionCard>

      <SetupSectionCard className="w-full">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold tracking-tight">
            {copy.benefitsTitle}
          </VemtapText>
          <StatusPill label={copy.benefitsBadge} tone="brand" />
        </View>
        <View className="gap-3">
          {copy.benefits.map(benefit => (
            <View key={benefit.label} className="flex-row items-start gap-3">
              <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-badge-discount-bg">
                <Icon name="check" size={16} color={colors.badgeDiscountText} />
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText variant="labelMd" className="font-sans-medium">
                  {benefit.label}
                </VemtapText>
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="mt-0.5 leading-snug"
                >
                  {benefit.meta}
                </VemtapText>
              </View>
            </View>
          ))}
        </View>
      </SetupSectionCard>
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
