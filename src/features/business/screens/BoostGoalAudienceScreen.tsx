import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessCheckRow,
  BusinessInlineAction,
  BusinessScreenLayout,
  BusinessSelectionChip,
} from '@features/business/components/BusinessPrimitives';
import {
  HorizontallyScrollableRow,
  SetupCallout,
  SetupSectionCard,
  SetupSectionHeading,
  SetupStepBar,
  TextActionButton,
} from '@features/business/components/BusinessSetupPrimitives';
import { BusinessProgressMeter } from '@features/business/components/BusinessOpsPrimitives';
import { showToast } from '@components/shared/toast';

const copy = strings.boostWizard;
const goal = copy.goalStep;

export interface BoostGoalAudienceScreenProps {
  onBack?: () => void;
  onHelp?: () => void;
  onChangeAsset?: () => void;
  onContinue?: (selection: BoostGoalAudienceSelection) => void;
  onSelectionChange?: (selection: BoostGoalAudienceSelection) => void;
  /** Starting choices; the design's defaults when absent. */
  initialSelection?: Partial<BoostGoalAudienceSelection>;
  /** Live boost details; the design's sample asset and reach when absent. */
  live?: {
    asset: { badge: string; business: string; name: string; claims: string } | null;
    geofencePlace: string;
    /** Reach estimate for the chosen radius (`undefined` while it loads). */
    reach?: { value: string; percent: number };
    /**
     * Areas for the "Selected Districts" and "Multi-Branch Clusters" scopes.
     * The clusters scope is hidden when the business has none.
     */
    areas?: {
      districts: readonly { id: string; name: string }[];
      clusters: readonly { id: string; name: string }[];
    };
  };
}

export interface BoostGoalAudienceSelection {
  goalId: string;
  audienceScope: string;
  radiusKm: string;
  placements: string[];
  /** Districts or clusters picked under an area scope; empty for nearby. */
  clusterIds: string[];
}

/**
 * Boost Wizard — Step 1: Goal & Audience Targeting.
 * stitch_vemtap_mobile_app_design/boost_setup_goal_audience_targeting
 * Full wizard page (its own sticky CTA deck); it never owns bottom navigation.
 */
export function BoostGoalAudienceScreen({
  onBack,
  onHelp,
  onChangeAsset,
  onContinue,
  onSelectionChange,
  initialSelection,
  live,
}: BoostGoalAudienceScreenProps) {
  const [goalId, setGoalId] = useState<string>(
    initialSelection?.goalId ?? goal.goals[0].id,
  );
  const [scope, setScope] = useState<string>(
    initialSelection?.audienceScope ?? goal.audienceScopes[0],
  );
  const [radius, setRadius] = useState<string>(initialSelection?.radiusKm ?? '3');
  const [placements, setPlacements] = useState<string[]>(
    initialSelection?.placements ?? goal.placements.map(placement => placement.id),
  );
  const [clusterIds, setClusterIds] = useState<string[]>(
    initialSelection?.clusterIds ?? [],
  );

  // Live: an area scope lists its areas and replaces the radius.
  const [, districtScope, clusterScope] = goal.audienceScopes;
  const areaOptions = live?.areas
    ? scope === districtScope
      ? live.areas.districts
      : scope === clusterScope
        ? live.areas.clusters
        : null
    : null;
  const scopes = goal.audienceScopes.filter(
    option => option !== clusterScope || !live?.areas || live.areas.clusters.length > 0,
  );
  const pickedAreas = areaOptions
    ? clusterIds.filter(id => areaOptions.some(option => option.id === id))
    : [];

  const sample = goal.radiusReach[radius as keyof typeof goal.radiusReach];
  const reach = live
    ? { reach: live.reach?.value ?? '\u2026', percent: live.reach?.percent ?? 0 }
    : sample;
  const asset = live?.asset;
  const canContinue =
    !live || (Boolean(asset) && (!areaOptions || pickedAreas.length > 0));

  useEffect(() => {
    onSelectionChange?.({
      goalId,
      audienceScope: scope,
      radiusKm: radius,
      placements,
      clusterIds: pickedAreas,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- report choice changes only.
  }, [goalId, scope, radius, placements, pickedAreas.join()]);

  function toggleArea(id: string) {
    setClusterIds(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );
  }

  function togglePlacement(id: string) {
    setPlacements(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );
  }

  return (
    <BusinessScreenLayout
      header={{
        title: goal.title,
        onBack,
        titleVariant: 'headingSm',
        titleAccessory: (
          <View className="flex-row items-center gap-1 rounded-full bg-badge-discount-bg px-2 py-0.5">
            <Icon name="verified" size={12} color={colors.badgeDiscountText} />
            <VemtapText
              variant="micro"
              className="font-sans-semibold text-badge-discount-text"
            >
              {goal.verified}
            </VemtapText>
          </View>
        ),
        actions: [{ label: goal.help, icon: 'help', onPress: onHelp }],
        showAvatar: true,
      }}
      contentContainerClassName="gap-5 pb-6"
      footer={
        <BusinessActionDock>
          <TextActionButton
            label={goal.cta}
            icon="arrowForward"
            tone="brand"
            onPress={() => {
              // Live: a boost cannot launch without the listing it features,
              // nor an area scope without an area.
              if (!canContinue) {
                if (asset && areaOptions) showToast(copy.live.pickAreaFirst, 'error');
                return;
              }
              onContinue?.({
                goalId,
                audienceScope: scope,
                radiusKm: radius,
                placements,
                clusterIds: pickedAreas,
              });
            }}
          />
          <VemtapText variant="micro" tone="tertiary" className="text-center">
            {goal.stepNote}
          </VemtapText>
        </BusinessActionDock>
      }
    >
      <SetupStepBar
        step={copy.steps.goal}
        percent="33%"
        progress={1 / 3}
        stepMarker="number"
        stepNumber={1}
        dot
      />

      <SetupSectionCard tone="lowest" className="gap-2.5 p-4">
        <View className="flex-row items-start justify-between gap-2">
          <View className="min-w-0 flex-1 gap-1">
            <View className="flex-row flex-wrap items-center gap-1.5">
              <View className="rounded-full bg-primary px-2 py-0.5">
                <VemtapText
                  variant="micro"
                  className="font-sans-semibold text-primary-foreground"
                >
                  {asset?.badge ?? goal.assetBadge}
                </VemtapText>
              </View>
              <View className="flex-row items-center gap-1">
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {asset?.business ?? goal.assetBusiness}
                </VemtapText>
                <Icon name="verified" size={12} color={colors.badgeDiscountText} />
              </View>
            </View>
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={2}
            >
              {asset?.name ??
                (live ? strings.boostEngine.live.noAssetTitle : goal.assetName)}
            </VemtapText>
          </View>
          <View className="shrink-0">
            <BusinessInlineAction
              label={goal.changeAction}
              icon="swapHoriz"
              onPress={onChangeAsset}
            />
          </View>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Icon name="localOffer" size={14} color={colors.textSecondary} />
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {asset?.claims ??
              (live ? strings.boostEngine.live.noAssetBody : goal.assetClaims)}
          </VemtapText>
        </View>
      </SetupSectionCard>

      <View className="gap-3">
        <SetupSectionHeading title={goal.goalTitle} />
        <VemtapText variant="bodyMd" tone="secondary">
          {goal.goalSubtitle}
        </VemtapText>
        <View className="gap-2">
          {goal.goals.map(option => (
            <BusinessCheckRow
              key={option.id}
              type="radio"
              title={option.title}
              subtitle={option.body}
              badge={'badge' in option ? option.badge : undefined}
              selected={option.id === goalId}
              onPress={() => setGoalId(option.id)}
            />
          ))}
        </View>
        {goal.goals[0].note ? (
          <SetupCallout
            icon="bolt"
            title={goal.goals[0].note}
            body={goal.goals[0].body}
            tone="tint"
          />
        ) : null}
      </View>

      <View className="gap-3">
        <SetupSectionHeading title={goal.audienceTitle} />
        <VemtapText variant="bodyMd" tone="secondary">
          {goal.audienceSubtitle}
        </VemtapText>
        <HorizontallyScrollableRow>
          {scopes.map(option => (
            <BusinessSelectionChip
              key={option}
              label={option}
              selected={option === scope}
              onPress={() => setScope(option)}
            />
          ))}
        </HorizontallyScrollableRow>

        {areaOptions ? (
          <SetupSectionCard tone="low" className="gap-2.5 p-4">
            <VemtapText variant="caption" tone="secondary">
              {scope === districtScope ? copy.live.pickDistricts : copy.live.pickClusters}
            </VemtapText>
            <HorizontallyScrollableRow>
              {areaOptions.map(option => (
                <BusinessSelectionChip
                  key={option.id}
                  label={option.name}
                  selected={clusterIds.includes(option.id)}
                  onPress={() => toggleArea(option.id)}
                />
              ))}
            </HorizontallyScrollableRow>
          </SetupSectionCard>
        ) : null}

        {areaOptions ? null : (
          <SetupSectionCard tone="low" className="gap-3 p-4">
            <View className="flex-row items-center justify-between gap-2">
              <View className="flex-row items-center gap-1.5">
                <Icon name="radar" size={16} color={colors.primary} />
                <VemtapText variant="labelMd" className="font-sans-semibold">
                  {goal.radiusTitle}
                </VemtapText>
              </View>
              <VemtapText variant="labelMd" className="font-sans-bold text-primary">
                {sample.label}
              </VemtapText>
            </View>
            <View className="flex-row gap-2">
              {goal.radiusOptions.map(option => (
                <View key={option.id} className="min-w-0 flex-1">
                  <BusinessSelectionChip
                    label={option.label}
                    selected={option.id === radius}
                    onPress={() => setRadius(option.id)}
                    className="w-full items-center"
                  />
                  <VemtapText
                    variant="micro"
                    tone="tertiary"
                    className="mt-1 text-center"
                    numberOfLines={1}
                  >
                    {option.meta}
                  </VemtapText>
                </View>
              ))}
            </View>
          </SetupSectionCard>
        )}

        <SetupSectionCard tone="low" className="gap-2.5 overflow-hidden p-0">
          <View className="relative h-36 w-full items-center justify-center bg-surface-container">
            <View className="items-center gap-1">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/20">
                <Icon name="restaurant" size={20} color={colors.primary} />
              </View>
              <VemtapText variant="caption" className="font-sans-semibold">
                {live?.geofencePlace ?? goal.geofencePlace}
              </VemtapText>
            </View>
            <View className="absolute left-2 top-2 flex-row items-center gap-1 rounded-full bg-inverse-surface/80 px-2 py-0.5">
              <Icon name="pinDrop" size={12} color={colors.inverseOnSurface} />
              <VemtapText
                variant="micro"
                className="text-inverse-on-surface"
                numberOfLines={1}
              >
                {live?.geofencePlace ?? goal.geofencePlace}
              </VemtapText>
            </View>
            <View className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5">
              <VemtapText
                variant="micro"
                className="font-sans-semibold text-primary-foreground"
              >
                {goal.geofenceStatus}
              </VemtapText>
            </View>
          </View>
          <View className="gap-2 p-4">
            <BusinessProgressMeter
              label={goal.reachLabel}
              value={reach.reach}
              percent={reach.percent}
            />
            <VemtapText variant="caption" tone="secondary">
              {live ? copy.live.reachNote : goal.reachNote}
            </VemtapText>
          </View>
        </SetupSectionCard>
      </View>

      <View className="gap-3">
        <SetupSectionHeading title={goal.placementsTitle} />
        <VemtapText variant="bodyMd" tone="secondary">
          {goal.placementsSubtitle}
        </VemtapText>
        <View className="gap-2">
          {goal.placements.map(option => (
            <BusinessCheckRow
              key={option.id}
              type="checkbox"
              title={option.title}
              subtitle={option.subtitle}
              badge={'badge' in option ? option.badge : undefined}
              selected={placements.includes(option.id)}
              onPress={() => togglePlacement(option.id)}
            />
          ))}
        </View>
      </View>
    </BusinessScreenLayout>
  );
}
