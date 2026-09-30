import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import { BusinessMetricGrid } from '@features/business/components/BusinessAnalyticsPrimitives';
import {
  billingAddOns,
  billingHistory,
  billingPaymentMethod,
  billingValueFigures,
  type BusinessInvoice,
} from '@features/business/data/businessTrustSettingsData';

const copy = strings.businessSubscriptionBilling;

export interface BusinessSubscriptionBillingScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onManagePlan?: () => void;
  onCancelTier?: () => void;
  onChangeCard?: () => void;
  onAddFallback?: () => void;
  onOpenAddOn?: (addOnId: string) => void;
  onBrowseAddOns?: () => void;
  onDownloadInvoice?: (invoiceId: string) => void;
}

/**
 * Subscription & billing: current plan and renewal, cycle value generated,
 * payment method, active add-ons and downloadable billing history.
 */
export function BusinessSubscriptionBillingScreen({
  onBack,
  onOpenProfile,
  onManagePlan,
  onCancelTier,
  onChangeCard,
  onAddFallback,
  onOpenAddOn,
  onBrowseAddOns,
  onDownloadInvoice,
}: BusinessSubscriptionBillingScreenProps) {
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
      footer={
        <BusinessActionDock>
          <Button
            label={copy.managePlanCta}
            labelVariant="labelMd"
            onPress={onManagePlan}
            leftIcon={<Icon name="workspacePremium" size={18} color={colors.surface} />}
          />
          <Button
            label={copy.cancelCta}
            labelVariant="labelSm"
            variant="outline"
            onPress={onCancelTier}
          />
        </BusinessActionDock>
      }
    >
      <View className="gap-2 rounded-card bg-primary p-4 shadow-md">
        <View className="flex-row items-center justify-between gap-2">
          <BusinessStatusPill label={copy.statusActive} tone="success" />
          <View className="flex-row items-center gap-1">
            <Icon name="verified" size={14} color={colors.surface} />
            <VemtapText
              variant="micro"
              className="font-sans-semibold text-surface"
              numberOfLines={1}
            >
              {copy.statusVerified}
            </VemtapText>
          </View>
        </View>
        <VemtapText
          variant="labelMd"
          className="font-sans-semibold text-surface"
          numberOfLines={1}
        >
          {copy.planName}
        </VemtapText>
        <View className="flex-row items-baseline gap-1.5">
          <VemtapText
            variant="headingLg"
            className="font-sans-bold text-surface"
            numberOfLines={1}
          >
            {copy.planPrice}
          </VemtapText>
          <VemtapText variant="labelSm" className="text-surface" numberOfLines={1}>
            {copy.planPeriod}
          </VemtapText>
        </View>
        <VemtapText variant="caption" className="text-surface" numberOfLines={2}>
          {copy.planPitch}
        </VemtapText>
        <View className="mt-1 flex-row flex-wrap items-center gap-2 border-t border-surface pt-3">
          <View className="flex-row items-center gap-1.5">
            <Icon name="calendarTask" size={14} color={colors.surface} />
            <VemtapText variant="caption" className="text-surface" numberOfLines={1}>
              {copy.renewsLabel}
            </VemtapText>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Icon name="autorenew" size={14} color={colors.surface} />
            <VemtapText variant="caption" className="text-surface" numberOfLines={1}>
              {copy.autoDebitLabel}
            </VemtapText>
          </View>
        </View>
      </View>

      <BusinessPanel className="mt-3" title={copy.valueTitle} icon="insights">
        <BusinessMetricGrid
          cells={billingValueFigures.map(figure => ({
            label: figure.label,
            value: figure.value,
            icon: figure.icon,
          }))}
          columns={3}
          variant="bare"
        />
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.paymentTitle}
        icon="creditCard"
        badge={copy.paymentSecure}
        badgeTone="success"
      >
        <View className="flex-row items-center gap-3 rounded-field bg-surface-subtle p-3">
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
            <VemtapText variant="labelSm" className="font-sans-bold" numberOfLines={1}>
              {billingPaymentMethod.brandInitials}
            </VemtapText>
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {`${billingPaymentMethod.brand} ending in ${billingPaymentMethod.last4}`}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.paymentExpiry}
            </VemtapText>
          </View>
          <BusinessStatusPill label={copy.paymentPrimary} tone="brand" />
        </View>
        <View className="mt-1 flex-row gap-2">
          <View className="min-w-0 flex-1">
            <Button
              label={copy.changeCardCta}
              labelVariant="labelSm"
              variant="secondary"
              size="sm"
              onPress={onChangeCard}
            />
          </View>
          <View className="min-w-0 flex-1">
            <Button
              label={copy.addFallbackCta}
              labelVariant="labelSm"
              variant="secondary"
              size="sm"
              onPress={onAddFallback}
            />
          </View>
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.addOnsTitle}
        icon="rocket"
        badge={copy.addOnsBadge}
        badgeTone="brand"
      >
        <View className="gap-2">
          {billingAddOns.map(addOn => (
            <View key={addOn.id} className="gap-2 rounded-field bg-surface-subtle p-3">
              <View className="flex-row items-start justify-between gap-2">
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={2}
                  >
                    {addOn.name}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                    {addOn.detail}
                  </VemtapText>
                </View>
                <VemtapText
                  variant="labelSm"
                  className={
                    addOn.featured
                      ? 'shrink-0 font-sans-bold text-primary'
                      : 'shrink-0 font-sans-bold text-text'
                  }
                  numberOfLines={1}
                >
                  {addOn.price}
                </VemtapText>
              </View>
              <View className="flex-row flex-wrap items-center gap-1.5">
                <BusinessStatusPill
                  label={addOn.status}
                  tone={addOn.featured ? 'success' : 'neutral'}
                />
                {addOn.locations ? (
                  <VemtapText
                    variant="micro"
                    tone="tertiary"
                    className="min-w-0 flex-1"
                    numberOfLines={1}
                  >
                    {addOn.locations}
                  </VemtapText>
                ) : null}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={addOn.cta}
                onPress={() => onOpenAddOn?.(addOn.id)}
                className="min-h-9 flex-row items-center gap-1 self-start px-1"
              >
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold text-primary"
                  numberOfLines={1}
                >
                  {addOn.cta}
                </VemtapText>
                <Icon name="forward" size={15} color={colors.primary} />
              </Pressable>
            </View>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.browseAddOnsCta}
          onPress={onBrowseAddOns}
          className="mt-1 min-h-10 flex-row items-center justify-between gap-2 rounded-field bg-surface-tint px-2.5"
        >
          <VemtapText
            variant="labelSm"
            className="min-w-0 flex-1 font-sans-semibold text-primary"
            numberOfLines={2}
          >
            {copy.browseAddOnsCta}
          </VemtapText>
          <View className="shrink-0">
            <Icon name="forward" size={16} color={colors.primary} />
          </View>
        </Pressable>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.historyTitle}
        icon="receiptLong"
        badge={copy.historySubtitle}
        badgeTone="neutral"
      >
        <View className="gap-2">
          {billingHistory.map(invoice => (
            <InvoiceRow
              key={invoice.id}
              invoice={invoice}
              onDownload={() => onDownloadInvoice?.(invoice.id)}
            />
          ))}
        </View>
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}

function InvoiceRow({
  invoice,
  onDownload,
}: {
  invoice: BusinessInvoice;
  onDownload: () => void;
}) {
  const paid = invoice.status === 'paid';
  return (
    <View className="flex-row items-center gap-3 rounded-field bg-surface-subtle p-2.5">
      <View
        className={`h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          paid ? 'bg-badge-discount-bg' : 'bg-surface-tint'
        }`}
      >
        <Icon
          name={paid ? 'checkCircle' : 'pendingActions'}
          size={16}
          color={paid ? colors.badgeDiscountText : colors.primary}
        />
      </View>
      <View className="min-w-0 flex-1">
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
          {invoice.title}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {`${invoice.date} • ${invoice.method}`}
        </VemtapText>
      </View>
      <BusinessStatusPill
        label={paid ? copy.statuses.paid : copy.statuses.upcoming}
        tone={paid ? 'success' : 'brand'}
      />
      <VemtapText
        variant="labelSm"
        className="shrink-0 font-sans-semibold"
        numberOfLines={1}
      >
        {invoice.amount}
      </VemtapText>
      {paid ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${copy.historyTitle}: ${invoice.title}`}
          onPress={onDownload}
          className="shrink-0"
        >
          <Icon name="download" size={17} color={colors.textTertiary} />
        </Pressable>
      ) : null}
    </View>
  );
}
