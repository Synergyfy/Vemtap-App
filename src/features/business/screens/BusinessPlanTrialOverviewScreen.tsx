import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { formatCurrency } from '@utils/formatters';
import { planTrialOverviewCopy as copy } from '@features/business/verificationCopy';
import {
  PrimaryActionButton,
  SetupSectionCard,
  StatusPill,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  PlanFeatureRow,
  SelectableRadioCard,
  VerificationPage,
} from '@features/business/components/VerificationPrimitives';
import type { Plan } from '@api/subscriptionsApi';

export interface BusinessPlanTrialOverviewScreenProps {
  /** Paid plans the business can trial or buy. */
  plans?: Plan[];
  selectedPlanId?: string | null;
  /** The business has not used its one free trial yet. */
  trialEligible?: boolean;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  onSelectPlan?: (planId: string) => void;
  onBack?: () => void;
  onStartTrial?: (plan: Plan) => void;
  onSubscribeNow?: (plan: Plan) => void;
  onViewAddOns?: () => void;
  onHelp?: () => void;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/business_plan_trial_overview/code.html
 */
export function BusinessPlanTrialOverviewScreen({
  plans = [],
  selectedPlanId,
  trialEligible = false,
  loading = false,
  error = false,
  onRetry,
  onSelectPlan,
  onBack,
  onStartTrial,
  onSubscribeNow,
  onViewAddOns,
  onHelp,
}: BusinessPlanTrialOverviewScreenProps) {
  const handleBack = useCallback(() => onBack?.(), [onBack]);
  const plan = plans.find(item => item.id === selectedPlanId) ?? plans[0] ?? null;
  const canTrial = Boolean(plan && trialEligible && plan.trialDurationDays > 0);
  const price = plan ? formatCurrency(plan.monthlyPrice, plan.currency) : '';

  const footer = plan ? (
    <>
      {canTrial ? (
        <PrimaryActionButton
          label={`${copy.startTrialLead}${plan.trialDurationDays}${copy.startTrialTail}`}
          onPress={() => onStartTrial?.(plan)}
        />
      ) : null}
      <Button
        label={`${copy.subscribeNowLead}${price}${copy.subscribeNowTail}`}
        labelVariant="labelMd"
        variant={canTrial ? 'secondary' : 'primary'}
        className={canTrial ? 'border-0' : undefined}
        onPress={() => onSubscribeNow?.(plan)}
      />
      <View className="mt-2 flex-row flex-wrap items-center justify-center gap-1.5">
        <Icon name="lock" size={16} color={colors.textTertiary} />
        <VemtapText
          variant="caption"
          tone="secondary"
          className="min-w-0 flex-1 text-center"
        >
          {canTrial ? copy.footnote : copy.footnoteNoTrial}
        </VemtapText>
      </View>
    </>
  ) : undefined;

  return (
    <VerificationPage
      title={copy.header}
      onBack={handleBack}
      helpLabel={copy.helpLabel}
      onHelp={onHelp}
      background="surface"
      contentContainerClassName="gap-5"
      footer={footer}
    >
      <View className="gap-2">
        <StatusPill label={copy.badge} tone="success" icon="verified" />
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

      {loading ? (
        <View className="items-center gap-2 py-10">
          <ActivityIndicator color={colors.primary} />
          <VemtapText variant="caption" tone="secondary">
            {copy.loading}
          </VemtapText>
        </View>
      ) : !plan ? (
        <SetupSectionCard tone="subtle" className="w-full items-center gap-2 p-6">
          <Icon name="info" size={24} color={colors.textTertiary} />
          <VemtapText variant="labelMd" className="text-center font-sans-semibold">
            {copy.emptyTitle}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" className="text-center">
            {copy.emptyBody}
          </VemtapText>
          {error && onRetry ? (
            <Button
              label={copy.retry}
              labelVariant="labelSm"
              variant="outline"
              size="sm"
              onPress={onRetry}
            />
          ) : null}
        </SetupSectionCard>
      ) : (
        <>
          {plans.length > 1 ? (
            <View className="gap-2">
              <VemtapText variant="labelMd" className="font-sans-semibold">
                {copy.plansLabel}
              </VemtapText>
              <View accessibilityRole="radiogroup" className="gap-2">
                {plans.map(item => (
                  <SelectableRadioCard
                    key={item.id}
                    layout="inline"
                    title={item.name}
                    body={`${formatCurrency(item.monthlyPrice, item.currency)}${copy.planCycle}`}
                    badge={item.isPopular ? copy.popularBadge : undefined}
                    badgeTone="success"
                    selected={item.id === plan.id}
                    onPress={() => onSelectPlan?.(item.id)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <SetupSectionCard tone="subtle" className="mt-1 w-full p-5 shadow-md">
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <View className="flex-row items-center gap-2">
                <View className="h-2.5 w-2.5 rounded-full bg-primary" />
                <VemtapText
                  variant="labelSm"
                  tone="secondary"
                  className="uppercase tracking-wider"
                >
                  {copy.planLabel}
                </VemtapText>
              </View>
              {plan.isPopular ? (
                <StatusPill label={copy.popularBadge} tone="brand" />
              ) : null}
            </View>

            <View className="gap-1">
              <VemtapText variant="headingLg" className="text-heading-lg">
                {plan.name}
              </VemtapText>
              <View className="mt-1 flex-row flex-wrap items-baseline gap-1.5">
                <VemtapText variant="headingLg" className="text-heading-lg">
                  {price}
                </VemtapText>
                <VemtapText variant="bodyMd" tone="secondary">
                  {copy.planCycle}
                </VemtapText>
              </View>
              {plan.description ? (
                <VemtapText variant="bodyMd" tone="secondary" className="mt-2">
                  {plan.description}
                </VemtapText>
              ) : null}
            </View>

            <View className="flex-row items-center gap-2.5 rounded-card bg-badge-discount-bg px-3.5 py-2.5">
              <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface shadow-sm">
                <Icon name="badge" size={18} color={colors.badgeDiscountText} />
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold text-badge-discount-text"
                >
                  {canTrial
                    ? `${copy.trialTitleLead}${plan.trialDurationDays}${copy.trialTitleTail}`
                    : copy.trialUsedTitle}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {canTrial ? copy.trialBody : copy.trialUsedBody}
                </VemtapText>
              </View>
            </View>

            {plan.features.length ? (
              <View className="gap-3">
                {plan.features.map(feature => (
                  <PlanFeatureRow key={feature} label={feature} state="included" />
                ))}
              </View>
            ) : null}
          </SetupSectionCard>
        </>
      )}

      <View className="mt-2 items-center gap-2">
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={copy.addOns}
          onPress={onViewAddOns}
          className="min-h-9 flex-row items-center gap-1"
        >
          <VemtapText variant="labelMd" className="text-primary">
            {copy.addOns}
          </VemtapText>
          <Icon name="arrowForward" size={18} color={colors.primary} />
        </Pressable>
        <VemtapText variant="caption" tone="tertiary" className="text-center">
          {copy.audience}
        </VemtapText>
      </View>
    </VerificationPage>
  );
}
