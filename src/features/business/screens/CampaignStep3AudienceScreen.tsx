import React, { useState } from 'react';
import { View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { CampaignWizardStepLayout } from '@features/business/components/CampaignWizardStepLayout';
import { ServiceChoiceCard } from '@features/business/components/ServiceFlowPrimitives';
import {
  HorizontallyScrollableRow,
  SetupSectionCard,
  SetupSectionHeading,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  BusinessCheckRow,
  BusinessSelectionChip,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessProgressMeter,
  BusinessScopeCard,
} from '@features/business/components/BusinessOpsPrimitives';

const copy = strings.campaignWizard;
const step = copy.step3;

export interface CampaignStep3AudienceScreenProps {
  onBack: () => void;
  onContinue: (selection: CampaignAudienceSelection) => void;
  /** Segment id handed over from a segment's "Use This Segment" sheet. */
  presetSegmentId?: string;
}

export interface CampaignAudienceSelection {
  strategy: string;
  cohorts: string[];
  branches: string[];
  clusters: string[];
  radius: string;
}

/**
 * Create Campaign — Step 3: Audience.
 * stitch_vemtap_mobile_app_design/create_campaign_step_3_audience
 */
export function CampaignStep3AudienceScreen({
  onBack,
  onContinue,
  presetSegmentId,
}: CampaignStep3AudienceScreenProps) {
  const [strategy, setStrategy] = useState<string>(step.strategies[1].id);
  const [cohorts, setCohorts] = useState<string[]>(
    presetSegmentId
      ? [presetSegmentId]
      : [step.cohorts[0].id, step.cohorts[1].id, step.cohorts[2].id],
  );
  const [branches, setBranches] = useState<string[]>([
    step.branches[0].id,
    step.branches[1].id,
  ]);
  const [clusters, setClusters] = useState<string[]>([
    step.clusters[0],
    step.clusters[1],
    step.clusters[2],
  ]);
  const [radius, setRadius] = useState<string>(step.radii[1].id);

  function toggle(list: string[], setList: (next: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter(item => item !== id) : [...list, id]);
  }

  return (
    <CampaignWizardStepLayout
      step={3}
      title={step.title}
      hero={step.hero}
      heroBody={step.heroBody}
      onBack={onBack}
      onNext={() => onContinue({ strategy, cohorts, branches, clusters, radius })}
      nextLabel={step.cta}
      backLabel={step.back}
    >
      <SetupSectionCard tone="container" className="gap-3 p-4">
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-1.5">
            <View className="h-1.5 w-1.5 rounded-full bg-success" />
            <VemtapText variant="caption" className="font-sans-semibold text-success">
              {step.forecastBadge}
            </VemtapText>
          </View>
          <Icon name="radar" size={20} color={colors.primary} />
        </View>
        <VemtapText variant="caption" tone="tertiary">
          {step.reachLabel}
        </VemtapText>
        <View className="flex-row flex-wrap items-baseline gap-1.5">
          <VemtapText variant="headingLg" className="font-sans-bold" numberOfLines={1}>
            {step.reachValue}
          </VemtapText>
          <VemtapText variant="bodyMd" tone="secondary">
            {step.reachUnit}
          </VemtapText>
        </View>
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {step.mixTitle}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {step.mixMeta}
          </VemtapText>
        </View>
        <View className="h-2 w-full flex-row gap-0.5 overflow-hidden rounded-full">
          {step.mix.map((slice, index) => (
            <View
              key={slice.id}
              className={index === 0 ? 'h-full bg-primary' : 'h-full bg-primary-fixed'}
              style={{ width: `${slice.percent}%` }}
            />
          ))}
        </View>
        <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
          {step.mix.map(slice => (
            <View key={slice.id} className="flex-row items-center gap-1">
              <View className="h-1.5 w-1.5 rounded-full bg-primary" />
              <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                {slice.label}
              </VemtapText>
            </View>
          ))}
        </View>
      </SetupSectionCard>

      <View className="gap-3">
        <SetupSectionHeading title={step.strategyTitle} />
        {step.strategies.map(option => (
          <ServiceChoiceCard
            key={option.id}
            title={option.title}
            description={option.body}
            icon={option.icon}
            selected={option.id === strategy}
            onPress={() => setStrategy(option.id)}
          />
        ))}
      </View>

      {strategy === step.strategies[1].id ? (
        <View className="gap-3">
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-text-secondary"
          >
            {step.cohortsTitle}
          </VemtapText>
          {step.cohorts.map(cohort => (
            <BusinessCheckRow
              key={cohort.id}
              type="checkbox"
              title={cohort.name}
              subtitle={cohort.sub}
              trailing={
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold text-primary"
                  numberOfLines={1}
                >
                  {cohort.figure}
                </VemtapText>
              }
              selected={cohorts.includes(cohort.id)}
              onPress={() => toggle(cohorts, setCohorts, cohort.id)}
            />
          ))}
        </View>
      ) : null}

      <View className="gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <SetupSectionHeading title={step.geoTitle} className="min-w-0 flex-1" />
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {`${branches.length} of ${step.branches.length} Branches`}
          </VemtapText>
        </View>
        {step.branches.map(branch => (
          <BusinessScopeCard
            key={branch.id}
            type="checkbox"
            title={branch.name}
            body={branch.address}
            icon="storefront"
            selected={branches.includes(branch.id)}
            onPress={() => toggle(branches, setBranches, branch.id)}
          />
        ))}
        <VemtapText variant="labelSm" className="font-sans-semibold text-text-secondary">
          {step.clustersTitle}
        </VemtapText>
        <HorizontallyScrollableRow>
          {step.clusters.map(cluster => (
            <BusinessSelectionChip
              key={cluster}
              label={cluster}
              showCheck
              selected={clusters.includes(cluster)}
              onPress={() => toggle(clusters, setClusters, cluster)}
            />
          ))}
        </HorizontallyScrollableRow>
      </View>

      <View className="gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <SetupSectionHeading title={step.radiusTitle} className="min-w-0 flex-1" />
          <View className="shrink-0 rounded-full bg-badge-discount-bg px-2 py-0.5">
            <VemtapText
              variant="caption"
              className="font-sans-semibold text-badge-discount-text"
              numberOfLines={1}
            >
              {step.radiusBadge}
            </VemtapText>
          </View>
        </View>
        <View className="gap-2">
          {step.radii.map(option => {
            const selected = option.id === radius;
            return (
              <View key={option.id} className="flex-row">
                <View className="min-w-0 flex-1">
                  <BusinessScopeCard
                    title={option.label}
                    body={option.caption}
                    selected={selected}
                    onPress={() => setRadius(option.id)}
                  />
                </View>
              </View>
            );
          })}
        </View>
        <BusinessProgressMeter
          label={step.reachLabel}
          value={step.reachValue}
          percent={Number(step.radii.find(option => option.id === radius)?.id ?? 1) * 10}
        />
      </View>
    </CampaignWizardStepLayout>
  );
}
