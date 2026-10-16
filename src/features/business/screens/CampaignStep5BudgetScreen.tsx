import React, { useState } from 'react';
import { View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { CampaignWizardStepLayout } from '@features/business/components/CampaignWizardStepLayout';
import {
  SetupCallout,
  SetupSectionCard,
  SetupSectionHeading,
  ToggleRow,
} from '@features/business/components/BusinessSetupPrimitives';
import { BusinessNumberInput } from '@features/business/components/BusinessPrimitives';
import {
  BusinessProgressMeter,
  BusinessScopeCard,
  BusinessSegmentTabs,
  type BusinessSegmentTab,
} from '@features/business/components/BusinessOpsPrimitives';

const copy = strings.campaignWizard;
const step = copy.step5;

const MIN_BUDGET = 5000;
const WALLET_BALANCE = 25000;

const modeTabs: BusinessSegmentTab[] = [
  { key: 'total', label: step.modes[0] },
  { key: 'daily', label: step.modes[1] },
];

/** Budget (₦) per investment tier; the API's promotion tiers use the same ids. */
export const CAMPAIGN_BUDGET_TIERS = {
  starter: 15000,
  growth: 35000,
  surge: 70000,
} as const;

const tierAmounts = CAMPAIGN_BUDGET_TIERS;

const tierAmount = (tierId: string): number =>
  Number(tierAmounts[tierId as keyof typeof tierAmounts]);

function naira(value: number): string {
  return `\u20a6${value.toLocaleString('en-NG')}`;
}

export interface CampaignStep5BudgetScreenProps {
  onBack: () => void;
  onContinue: (selection: CampaignBudgetSelection) => void;
  onSaveDraft?: () => void;
  initialDays?: number;
  /** Starting choices; the design's sample budget when absent. */
  initialSelection?: Partial<Pick<CampaignBudgetSelection, 'mode' | 'total' | 'funding'>>;
  /**
   * Live mode reads the wallet and the tier estimates from the API, and drops
   * the design's sample card, projections and testimonial.
   */
  live?: boolean;
  /** Spendable ad-wallet balance (₦); `undefined` while it loads. */
  walletSpendable?: number;
  /** Reach and claims estimate per tier id. */
  tierForecasts?: Partial<Record<string, { reach: string; claims: string }>>;
}

export interface CampaignBudgetSelection {
  mode: string;
  total: number;
  daily: number;
  /** `wallet`, or `card` to pay any shortfall by card (`split` in the design). */
  funding: string;
}

/**
 * Create Campaign — Step 5: Budget & Funding.
 * stitch_vemtap_mobile_app_design/create_campaign_step_5_budget
 */
export function CampaignStep5BudgetScreen({
  onBack,
  onContinue,
  onSaveDraft,
  initialDays = 7,
  initialSelection,
  live = false,
  walletSpendable,
  tierForecasts,
}: CampaignStep5BudgetScreenProps) {
  const initialTotal = initialSelection?.total ?? tierAmounts.growth;
  const initialTier =
    (Object.keys(tierAmounts) as (keyof typeof tierAmounts)[]).find(
      id => tierAmounts[id] === initialTotal,
    ) ?? 'growth';
  const [mode, setMode] = useState<string>(initialSelection?.mode ?? 'total');
  const [tier, setTier] = useState<string>(initialTier);
  const [custom, setCustom] = useState<string>(initialTotal.toLocaleString('en-NG'));
  const [autoDebit, setAutoDebit] = useState(
    initialSelection?.funding ? initialSelection.funding !== 'wallet' : true,
  );

  const days = initialDays;
  const customValue = Number(custom.replace(/[^0-9]/g, '')) || 0;
  const usingCustom = customValue > 0 && customValue !== tierAmount(tier);
  const total = usingCustom ? customValue : tierAmount(tier);
  const daily = Math.round(total / days);
  const balance = live ? walletSpendable : WALLET_BALANCE;
  const shortfall = balance === undefined ? 0 : Math.max(0, total - balance);
  // Live: a wallet that cannot cover the budget needs the card for the rest.
  const blocked = total < MIN_BUDGET || (live && shortfall > 0 && !autoDebit);

  function selectTier(id: string) {
    setTier(id);
    setCustom(
      String(tierAmounts[id as keyof typeof tierAmounts].toLocaleString('en-NG')),
    );
  }

  return (
    <CampaignWizardStepLayout
      step={5}
      title={step.title}
      hero={step.hero}
      heroBody={step.heroBody}
      onBack={onBack}
      onNext={() =>
        onContinue({
          mode,
          total,
          daily,
          funding: autoDebit ? (live ? 'card' : 'split') : 'wallet',
        })
      }
      disabled={blocked}
      nextLabel={copy.reviewCta}
      backLabel={step.back}
      draftLabel={onSaveDraft ? copy.saveDraft : undefined}
      onSaveDraft={onSaveDraft}
      trackerExtra={
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold text-primary">
            {copy.stepOf.replace('{step}', '5')}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {copy.almostReady}
          </VemtapText>
        </View>
      }
      footerExtra={
        <View className="flex-row flex-wrap items-center justify-center gap-x-2">
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {step.summary.replace('{days}', String(days)).replace('{pace}', naira(daily))}
          </VemtapText>
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {step.summaryTotal.replace('{total}', naira(total))}
          </VemtapText>
        </View>
      }
    >
      <SetupSectionCard tone="low" className="flex-row items-center gap-3 p-4">
        <View className="min-w-0 flex-1 gap-0.5">
          <VemtapText
            variant="micro"
            className="uppercase text-primary"
            numberOfLines={1}
          >
            {step.algoEyebrow}
          </VemtapText>
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={2}>
            {step.algoTitle}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
            {step.algoBody}
          </VemtapText>
        </View>
        <Icon name="payments" size={28} color={colors.primary} />
      </SetupSectionCard>

      <View className="gap-3">
        <SetupSectionHeading title={step.modeTitle} />
        <BusinessSegmentTabs
          tabs={modeTabs}
          value={mode}
          onChange={setMode}
          accessibilityLabel={step.modeTitle}
        />
      </View>

      <View className="gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <SetupSectionHeading title={step.tiersTitle} className="min-w-0 flex-1" />
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {live ? step.liveTiersMeta(days) : step.tiersMeta}
          </VemtapText>
        </View>
        {step.tiers.map(option => {
          const selected = !usingCustom && tier === option.id;
          const forecast = tierForecasts?.[option.id];
          const stats = live
            ? forecast
              ? [
                  { label: step.liveReach, value: forecast.reach },
                  { label: step.liveClaims, value: forecast.claims },
                ]
              : []
            : option.stats;
          return (
            <BusinessScopeCard
              key={option.id}
              title={option.name}
              body={option.pace}
              tag={'badge' in option && option.badge ? option.badge : undefined}
              selected={selected}
              onPress={() => selectTier(option.id)}
            >
              <VemtapText
                variant="headingLg"
                className="mt-1 font-sans-bold text-primary"
                numberOfLines={1}
              >
                {option.amount}
              </VemtapText>
              <View className="mt-2 flex-row flex-wrap gap-1.5">
                {stats.map(stat => (
                  <View
                    key={stat.label}
                    className="min-w-0 flex-1 gap-0.5 rounded-lg bg-surface-subtle p-2"
                  >
                    <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                      {stat.label}
                    </VemtapText>
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {stat.value}
                    </VemtapText>
                  </View>
                ))}
              </View>
              {!live && 'projection' in option && option.projection ? (
                <View className="mt-2 flex-row items-center gap-1.5 rounded-lg bg-badge-discount-bg px-2 py-1.5">
                  <Icon name="pointOfSale" size={13} color={colors.badgeDiscountText} />
                  <VemtapText
                    variant="micro"
                    className="min-w-0 flex-1 text-badge-discount-text"
                    numberOfLines={2}
                  >
                    {option.projection}
                  </VemtapText>
                </View>
              ) : null}
            </BusinessScopeCard>
          );
        })}
      </View>

      <SetupSectionCard tone="lowest" className="gap-2.5 p-4 shadow-sm">
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {step.customTitle}
          </VemtapText>
          <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
            {step.customMeta}
          </VemtapText>
        </View>
        <BusinessNumberInput
          label={step.customTitle}
          value={custom}
          onChangeText={setCustom}
          leadingText="\u20a6"
          accessibilityLabel={step.customTitle}
        />
        {customValue > 0 && customValue < MIN_BUDGET ? (
          <VemtapText variant="caption" className="text-error">
            {step.customMeta}
          </VemtapText>
        ) : null}
        <View className="flex-row items-center gap-1.5">
          <Icon name="schedule" size={13} color={colors.textSecondary} />
          <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
            {step.pacingNote.replace('{amount}', `${naira(daily)}.00`)}
          </VemtapText>
        </View>
        <BusinessProgressMeter
          label={step.guardTitle}
          value={naira(total)}
          percent={Math.min(100, Math.round((total / 70000) * 100))}
        />
      </SetupSectionCard>

      <View className="gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <SetupSectionHeading title={step.fundingTitle} className="min-w-0 flex-1" />
          <View className="shrink-0 flex-row items-center gap-1 rounded-full bg-badge-discount-bg px-2 py-0.5">
            <Icon name="wallet" size={12} color={colors.badgeDiscountText} />
            <VemtapText
              variant="caption"
              className="font-sans-semibold text-badge-discount-text"
              numberOfLines={1}
            >
              {step.fundingBadge}
            </VemtapText>
          </View>
        </View>
        <SetupSectionCard tone="low" className="gap-2.5 p-4">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={1}
            >
              {step.walletTitle}
            </VemtapText>
            <VemtapText
              variant="bodyMd"
              className="shrink-0 font-sans-bold"
              numberOfLines={1}
            >
              {live
                ? walletSpendable === undefined
                  ? step.liveWalletLoading
                  : step.liveWalletAvailable(naira(walletSpendable))
                : step.walletAvailable}
            </VemtapText>
            <Icon name="checkCircle" size={16} color={colors.success} />
          </View>
          {shortfall > 0 ? (
            <View className="flex-row items-center gap-2 rounded-lg bg-tertiary-fixed p-2.5">
              <Icon name="info" size={15} color={colors.tertiary} />
              <View className="min-w-0 flex-1 gap-0.5">
                <VemtapText
                  variant="labelSm"
                  className="text-on-tertiary-fixed font-sans-bold"
                >
                  {step.topUpTitle}
                </VemtapText>
                <VemtapText
                  variant="micro"
                  className="text-on-tertiary-fixed"
                  numberOfLines={2}
                >
                  {step.topUpBody
                    .replace('{amount}', naira(shortfall))
                    .replace('{total}', naira(total))}
                </VemtapText>
              </View>
            </View>
          ) : (
            <View className="flex-row items-center gap-2 rounded-lg bg-surface-subtle p-2.5">
              <Icon name="checkCircle" size={15} color={colors.success} />
              <VemtapText
                variant="micro"
                className="min-w-0 flex-1 text-success"
                numberOfLines={2}
              >
                {step.fullyFunded}
              </VemtapText>
            </View>
          )}
          <ToggleRow
            title={live ? step.liveAutoDebitTitle : step.autoDebitTitle}
            body={live ? step.liveAutoDebitBody : step.autoDebitBody}
            value={autoDebit}
            onValueChange={setAutoDebit}
          />
          {live && shortfall > 0 && !autoDebit ? (
            <VemtapText
              variant="caption"
              className="text-error"
              accessibilityRole="alert"
            >
              {step.liveTopUpRequired}
            </VemtapText>
          ) : null}
          {live ? null : (
            <View className="flex-row items-center justify-between gap-2">
              <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                <Icon name="creditCard" size={14} color={colors.textSecondary} />
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {step.linkedCard}
                </VemtapText>
              </View>
              <View className="shrink-0 flex-row items-center gap-1">
                <Icon name="lock" size={12} color={colors.success} />
                <VemtapText variant="micro" className="text-success" numberOfLines={1}>
                  {step.linkedCardBadge}
                </VemtapText>
              </View>
            </View>
          )}
        </SetupSectionCard>
      </View>

      <SetupCallout
        icon="shield"
        title={step.guardTitle}
        body={step.guardBody.replace('{amount}', naira(total))}
        tone="tint"
        bodyVariant="caption"
      />

      {live ? null : (
        <SetupCallout
          icon="autoAwesome"
          body={`\u201c${step.proof}\u201d`}
          title={step.proofBy}
          tone="subtle"
          bodyVariant="caption"
        />
      )}
    </CampaignWizardStepLayout>
  );
}
