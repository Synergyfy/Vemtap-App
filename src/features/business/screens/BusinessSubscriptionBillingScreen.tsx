import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
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

const copy = strings.businessSubscriptionBilling;

export type BillingPlanStatus = keyof typeof copy.statuses;

export interface BillingPlanSummary {
  name: string;
  /** Formatted price for the billing period, e.g. "₦15,000". */
  price: string;
  period: keyof typeof copy.periods;
  status: BillingPlanStatus;
  /** "Renews Oct 25, 2026" / "Trial ends …". */
  dateLabel: string | null;
  /** "12 days left" for trials. */
  daysLeftLabel: string | null;
  autoRenews: boolean;
  isFree: boolean;
}

export interface BillingCard {
  brand: string;
  last4: string;
  expMonth?: string | null;
  expYear?: string | null;
}

export interface BillingAddOnRow {
  id: string;
  name: string;
  detail: string | null;
  price: string;
  expiresLabel: string | null;
}

export interface BillingHistoryRow {
  id: string;
  title: string;
  date: string;
  amount: string;
  status: string;
  statusLabel: string;
}

export interface BusinessSubscriptionBillingScreenProps {
  plan?: BillingPlanSummary | null;
  isVerified?: boolean;
  card?: BillingCard | null;
  addOns?: BillingAddOnRow[];
  history?: BillingHistoryRow[];
  loading?: boolean;
  error?: boolean;
  cancelling?: boolean;
  onBack?: () => void;
  onOpenProfile?: () => void;
  onManagePlan?: () => void;
  onCancelTier?: () => void;
  onBrowseAddOns?: () => void;
}

/**
 * Subscription & billing: current plan and renewal, payment method, active
 * add-ons and billing history.
 */
export function BusinessSubscriptionBillingScreen({
  plan,
  isVerified = false,
  card,
  addOns = [],
  history = [],
  loading = false,
  error = false,
  cancelling = false,
  onBack,
  onOpenProfile,
  onManagePlan,
  onCancelTier,
  onBrowseAddOns,
}: BusinessSubscriptionBillingScreenProps) {
  const canCancel = Boolean(
    plan && !plan.isFree && (plan.status === 'active' || plan.status === 'trial'),
  );

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
            label={plan?.isFree ? copy.upgradeCta : copy.managePlanCta}
            labelVariant="labelMd"
            onPress={onManagePlan}
            leftIcon={<Icon name="workspacePremium" size={18} color={colors.surface} />}
          />
          {canCancel ? (
            <Button
              label={copy.cancelCta}
              labelVariant="labelSm"
              variant="outline"
              loading={cancelling}
              disabled={cancelling}
              onPress={onCancelTier}
            />
          ) : null}
        </BusinessActionDock>
      }
    >
      {loading ? (
        <View className="items-center py-10">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error || !plan ? (
        <View className="items-center gap-1 rounded-card bg-surface-subtle p-6">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.error.title}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" className="text-center">
            {copy.error.body}
          </VemtapText>
        </View>
      ) : (
        <View className="gap-2 rounded-card bg-primary p-4 shadow-md">
          <View className="flex-row items-center justify-between gap-2">
            <BusinessStatusPill
              label={copy.statuses[plan.status]}
              tone={
                plan.status === 'active' || plan.status === 'trial'
                  ? 'success'
                  : 'neutral'
              }
            />
            {isVerified ? (
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
            ) : null}
          </View>
          <VemtapText
            variant="labelMd"
            className="font-sans-semibold text-surface"
            numberOfLines={1}
          >
            {plan.name}
          </VemtapText>
          <View className="flex-row items-baseline gap-1.5">
            <VemtapText
              variant="headingLg"
              className="font-sans-bold text-surface"
              numberOfLines={1}
            >
              {plan.price}
            </VemtapText>
            <VemtapText variant="labelSm" className="text-surface" numberOfLines={1}>
              {copy.periods[plan.period]}
            </VemtapText>
          </View>
          <View className="mt-1 flex-row flex-wrap items-center gap-2 border-t border-surface pt-3">
            {plan.dateLabel ? (
              <View className="flex-row items-center gap-1.5">
                <Icon name="calendarTask" size={14} color={colors.surface} />
                <VemtapText variant="caption" className="text-surface" numberOfLines={1}>
                  {plan.daysLeftLabel
                    ? `${plan.dateLabel} • ${plan.daysLeftLabel}`
                    : plan.dateLabel}
                </VemtapText>
              </View>
            ) : null}
            {plan.isFree ? null : (
              <View className="flex-row items-center gap-1.5">
                <Icon name="autorenew" size={14} color={colors.surface} />
                <VemtapText variant="caption" className="text-surface" numberOfLines={1}>
                  {plan.autoRenews ? copy.autoRenews : copy.noAutoCharge}
                </VemtapText>
              </View>
            )}
          </View>
        </View>
      )}

      <BusinessPanel
        className="mt-3"
        title={copy.paymentTitle}
        icon="creditCard"
        badge={copy.paymentSecure}
        badgeTone="success"
      >
        <View className="flex-row items-center gap-3 rounded-field bg-surface-subtle p-3">
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
            {card ? (
              <VemtapText variant="labelSm" className="font-sans-bold" numberOfLines={1}>
                {card.brand.slice(0, 2).toUpperCase()}
              </VemtapText>
            ) : (
              <Icon name="creditCard" size={18} color={colors.textTertiary} />
            )}
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {card ? copy.paymentCard(card.brand, card.last4) : copy.paymentNone}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
              {card
                ? card.expMonth && card.expYear
                  ? copy.paymentExpiry(card.expMonth, card.expYear)
                  : ''
                : copy.paymentNoneBody}
            </VemtapText>
          </View>
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.addOnsTitle}
        icon="rocket"
        badge={copy.addOnsCount(addOns.length)}
        badgeTone="brand"
      >
        <View className="gap-2">
          {addOns.length ? (
            addOns.map(addOn => (
              <View key={addOn.id} className="gap-1 rounded-field bg-surface-subtle p-3">
                <View className="flex-row items-start justify-between gap-2">
                  <View className="min-w-0 flex-1">
                    <VemtapText
                      variant="labelMd"
                      className="font-sans-semibold"
                      numberOfLines={2}
                    >
                      {addOn.name}
                    </VemtapText>
                    {addOn.detail ? (
                      <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                        {addOn.detail}
                      </VemtapText>
                    ) : null}
                  </View>
                  <VemtapText
                    variant="labelSm"
                    className="shrink-0 font-sans-bold text-text"
                    numberOfLines={1}
                  >
                    {addOn.price}
                  </VemtapText>
                </View>
                {addOn.expiresLabel ? (
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                    {addOn.expiresLabel}
                  </VemtapText>
                ) : null}
              </View>
            ))
          ) : (
            <VemtapText variant="caption" tone="secondary">
              {copy.addOnsNone}
            </VemtapText>
          )}
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
          {history.length ? (
            history.map(row => <HistoryRow key={row.id} row={row} />)
          ) : (
            <View className="gap-0.5">
              <VemtapText variant="labelSm" className="font-sans-semibold">
                {copy.empty.title}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {copy.empty.body}
              </VemtapText>
            </View>
          )}
        </View>
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}

function HistoryRow({ row }: { row: BillingHistoryRow }) {
  const paid = row.status === 'success';
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
          {row.title}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {row.date}
        </VemtapText>
      </View>
      <BusinessStatusPill label={row.statusLabel} tone={paid ? 'success' : 'brand'} />
      <VemtapText
        variant="labelSm"
        className="shrink-0 font-sans-semibold"
        numberOfLines={1}
      >
        {row.amount}
      </VemtapText>
    </View>
  );
}
