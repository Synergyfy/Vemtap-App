import React, { useState } from 'react';
import { View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { CampaignWizardStepLayout } from '@features/business/components/CampaignWizardStepLayout';
import {
  SetupSectionCard,
  TextActionButton,
} from '@features/business/components/BusinessSetupPrimitives';
import { BusinessCheckRow } from '@features/business/components/BusinessPrimitives';

const copy = strings.campaignWizard;
const step = copy.step6;
const wizard = copy;

export interface CampaignStep6ReviewScreenProps {
  onBack: () => void;
  onLaunch: (payload: CampaignReviewPayload) => void;
  onSaveDraft?: () => void;
  /** Step 1 choice, so the summary can never contradict the objective screen. */
  objectiveId?: string;
  objectiveTitle?: string;
  /** Step 2 choices. */
  assetNames?: string[];
  /** The business the campaign promotes (storefront line on the asset card). */
  storeName?: string;
  /** Step 3 choices. */
  cohortNames?: string[];
  branchNames?: string[];
  clusterNames?: string[];
  radiusLabel?: string;
  /** Step 4 choices. */
  scheduleLabel?: string;
  daypartingLabel?: string;
  /** Step 5 choices. */
  totalLabel?: string;
  dailyLabel?: string;
  walletLabel?: string;
  cardLabel?: string;
  cardAmountLabel?: string;
  durationDays?: number;
  forecast?: { reach: string; claims: string };
  audienceSummary?: string;
  /** Launch state is owned by the caller once live (it waits for the API). */
  launching?: boolean;
  launchedLabel?: string;
  error?: string;
}

export interface CampaignReviewPayload {
  objectiveId: string;
  agreed: boolean;
  total: string;
}

const DEFAULT_OBJECTIVE = wizard.step1.objectives[0];

/**
 * Create Campaign — Step 6: Review & Launch.
 * stitch_vemtap_mobile_app_design/create_campaign_step_6_review_launch
 *
 * Every summary row is driven by the props the earlier steps produced, so the
 * review can never disagree with what the merchant actually chose.
 */
export function CampaignStep6ReviewScreen({
  onBack,
  onLaunch,
  onSaveDraft,
  objectiveId = DEFAULT_OBJECTIVE.id,
  objectiveTitle = DEFAULT_OBJECTIVE.title,
  assetNames = [],
  storeName,
  cohortNames = [],
  branchNames = [],
  clusterNames = [],
  radiusLabel = '',
  scheduleLabel = '',
  daypartingLabel = '',
  totalLabel = '',
  dailyLabel = '',
  walletLabel = '',
  cardLabel = '',
  cardAmountLabel = '',
  durationDays = 7,
  forecast,
  audienceSummary,
  launching: launchingProp,
  launchedLabel,
  error,
}: CampaignStep6ReviewScreenProps) {
  const [agreed, setAgreed] = useState(true);
  // Launch state is owned by the caller (it waits for the API).
  const launching = Boolean(launchingProp);
  const live = Boolean(launchedLabel);
  const stats = forecast
    ? [
        { label: step.liveReachLabel, value: forecast.reach, sub: '' },
        {
          label: step.liveClaimsLabel,
          value: forecast.claims,
          sub: step.liveClaimsSub,
        },
      ]
    : [];

  function edit(_target: string) {
    onBack();
  }

  return (
    <CampaignWizardStepLayout
      step={6}
      title={step.title}
      hero={step.hero}
      heroBody={step.heroBody}
      onBack={onBack}
      onNext={() => {
        if (!agreed || launching || live) return;
        onLaunch({ objectiveId, agreed, total: totalLabel });
      }}
      nextLabel={
        live
          ? (launchedLabel ?? wizard.liveCopy)
          : launching
            ? wizard.deploying
            : wizard.launchCta.replace('{amount}', totalLabel)
      }
      draftLabel={wizard.saveDraftExit}
      onSaveDraft={onSaveDraft}
      loading={launching}
    >
      <SetupSectionCard tone="container" className="gap-3 p-4">
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 gap-0.5">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={2}
            >
              {step.impactTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
              {step.liveImpactMeta(durationDays)}
            </VemtapText>
          </View>
          <View className="shrink-0 rounded-full bg-badge-discount-bg px-2 py-0.5">
            <VemtapText
              variant="caption"
              className="font-sans-semibold text-badge-discount-text"
              numberOfLines={1}
            >
              {step.liveImpactBadge}
            </VemtapText>
          </View>
        </View>
        <View className="flex-row gap-2">
          {stats.map(stat => (
            <View
              key={stat.label}
              className="min-w-0 flex-1 gap-0.5 rounded-lg bg-surface p-2.5"
            >
              <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                {stat.label}
              </VemtapText>
              <VemtapText variant="labelMd" className="font-sans-bold" numberOfLines={1}>
                {stat.value}
              </VemtapText>
              {stat.sub ? (
                <VemtapText variant="micro" className="text-success" numberOfLines={1}>
                  {stat.sub}
                </VemtapText>
              ) : null}
            </View>
          ))}
        </View>
      </SetupSectionCard>

      <View className="gap-3">
        <SetupSectionCard tone="lowest" className="gap-2 p-4 shadow-sm">
          <View className="flex-row items-center gap-2">
            <Icon name={step.sections[0].icon} size={18} color={colors.primary} />
            <VemtapText
              variant="caption"
              tone="tertiary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {step.sections[0].eyebrow}
            </VemtapText>
            <TextActionButton
              label={step.editAction}
              icon="edit"
              tone="brand"
              onPress={() => edit('objective')}
            />
          </View>
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={2}>
            {objectiveTitle}
          </VemtapText>
        </SetupSectionCard>

        <SetupSectionCard tone="lowest" className="gap-2 p-4 shadow-sm">
          <View className="flex-row items-center gap-2">
            <Icon name={step.sections[1].icon} size={18} color={colors.primary} />
            <VemtapText
              variant="caption"
              tone="tertiary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {step.sections[1].eyebrow}
            </VemtapText>
            <TextActionButton
              label={step.editAction}
              icon="edit"
              tone="brand"
              onPress={() => edit('content')}
            />
          </View>
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {`${assetNames.length} Active Assets Attached`}
          </VemtapText>
          <View className="flex-row items-center gap-2 rounded-lg bg-surface-subtle p-2">
            <View className="h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface-container">
              <Icon name="localOffer" size={22} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1 gap-0.5">
              <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                {storeName ?? ''}
              </VemtapText>
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {assetNames[0]}
              </VemtapText>
            </View>
          </View>
        </SetupSectionCard>

        <SetupSectionCard tone="lowest" className="gap-2 p-4 shadow-sm">
          <View className="flex-row items-center gap-2">
            <Icon name={step.sections[2].icon} size={18} color={colors.primary} />
            <VemtapText
              variant="caption"
              tone="tertiary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {step.sections[2].eyebrow}
            </VemtapText>
            <TextActionButton
              label={step.editAction}
              icon="edit"
              tone="brand"
              onPress={() => edit('audience')}
            />
          </View>
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {audienceSummary ?? `${cohortNames.length} Segments`}
          </VemtapText>
          <View className="gap-1.5">
            <View className="flex-row items-center gap-1.5">
              <Icon name="radar" size={13} color={colors.textSecondary} />
              <VemtapText
                variant="caption"
                tone="secondary"
                className="min-w-0 flex-1"
                numberOfLines={1}
              >
                {`${step.radiusLabel} ${radiusLabel}`}
              </VemtapText>
            </View>
            {clusterNames.length ? (
              <View className="flex-row items-center gap-1.5">
                <Icon name="explore" size={13} color={colors.textSecondary} />
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="min-w-0 flex-1"
                  numberOfLines={2}
                >
                  {`${step.clustersLabel} ${clusterNames.join(' & ')}`}
                </VemtapText>
              </View>
            ) : null}
          </View>
          <View className="flex-row flex-wrap gap-1.5">
            {cohortNames.map(name => (
              <View key={name} className="rounded-full bg-surface-container px-2 py-0.5">
                <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                  {name}
                </VemtapText>
              </View>
            ))}
          </View>
        </SetupSectionCard>

        <SetupSectionCard tone="lowest" className="gap-2 p-4 shadow-sm">
          <View className="flex-row items-center gap-2">
            <Icon name={step.sections[3].icon} size={18} color={colors.primary} />
            <VemtapText
              variant="caption"
              tone="tertiary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {step.sections[3].eyebrow}
            </VemtapText>
            <TextActionButton
              label={step.editAction}
              icon="edit"
              tone="brand"
              onPress={() => edit('venues')}
            />
          </View>
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {`${branchNames.length} Selected Outlets`}
          </VemtapText>
          {branchNames.map((name, index) => (
            <View key={name} className="flex-row items-center justify-between gap-2">
              <VemtapText variant="caption" className="min-w-0 flex-1" numberOfLines={1}>
                {name}
              </VemtapText>
              <VemtapText
                variant="micro"
                className="shrink-0 text-primary"
                numberOfLines={1}
              >
                {index === 0 ? step.primary : step.branch}
              </VemtapText>
            </View>
          ))}
        </SetupSectionCard>

        <SetupSectionCard tone="lowest" className="gap-2 p-4 shadow-sm">
          <View className="flex-row items-center gap-2">
            <Icon name={step.sections[4].icon} size={18} color={colors.primary} />
            <VemtapText
              variant="caption"
              tone="tertiary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {step.sections[4].eyebrow}
            </VemtapText>
            <TextActionButton
              label={step.editAction}
              icon="edit"
              tone="brand"
              onPress={() => edit('schedule')}
            />
          </View>
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {scheduleLabel}
          </VemtapText>
          <View className="flex-row items-center gap-1.5">
            <Icon name="schedule" size={13} color={colors.textSecondary} />
            <VemtapText
              variant="caption"
              tone="secondary"
              className="min-w-0 flex-1"
              numberOfLines={2}
            >
              {`${step.daypartingLabel} ${daypartingLabel}`}
            </VemtapText>
          </View>
        </SetupSectionCard>

        <SetupSectionCard tone="lowest" className="gap-2 p-4 shadow-sm">
          <View className="flex-row items-center gap-2">
            <Icon name={step.sections[5].icon} size={18} color={colors.primary} />
            <VemtapText
              variant="caption"
              tone="tertiary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {step.sections[5].eyebrow}
            </VemtapText>
            <TextActionButton
              label={step.editAction}
              icon="edit"
              tone="brand"
              onPress={() => edit('budget')}
            />
          </View>
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {`${totalLabel} Total Allocation`}
          </VemtapText>
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="caption" tone="secondary">
              {step.pacingLabel}
            </VemtapText>
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {dailyLabel}
            </VemtapText>
          </View>
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="caption" tone="secondary">
              {step.commissionLabel}
            </VemtapText>
            <View className="shrink-0 flex-row items-center gap-1">
              <Icon name="checkCircle" size={13} color={colors.success} />
              <VemtapText variant="labelSm" className="text-success" numberOfLines={1}>
                {step.commission}
              </VemtapText>
            </View>
          </View>
          <View className="gap-1.5 rounded-lg bg-surface-subtle p-2.5">
            <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
              {step.splitTitle}
            </VemtapText>
            <View className="flex-row items-center justify-between gap-2">
              <VemtapText variant="caption" tone="secondary">
                {step.splitWallet}
              </VemtapText>
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {walletLabel}
              </VemtapText>
            </View>
            {cardAmountLabel ? (
              <View className="flex-row items-center justify-between gap-2">
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="min-w-0 flex-1"
                  numberOfLines={1}
                >
                  {cardLabel}
                </VemtapText>
                <VemtapText
                  variant="labelSm"
                  className="shrink-0 font-sans-semibold"
                  numberOfLines={1}
                >
                  {cardAmountLabel}
                </VemtapText>
              </View>
            ) : null}
          </View>
        </SetupSectionCard>
      </View>

      {error ? (
        <VemtapText variant="caption" className="text-error" accessibilityRole="alert">
          {error}
        </VemtapText>
      ) : null}
      <BusinessCheckRow
        type="checkbox"
        title={`${step.termsPrefix} ${step.termsSuffix.replace('{amount}', totalLabel)}`}
        selected={agreed}
        onPress={() => setAgreed(current => !current)}
      />
    </CampaignWizardStepLayout>
  );
}
