import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import {
  DEFAULT_BUDGET_TIERS,
  type BudgetTier,
} from '@features/business/hooks/useBudgetTiers';
import { colors } from '@theme/colors';
import type { IconName } from '@components/ui/Icon';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessChipScroller,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessAnalyticsNav,
  BusinessMetricGrid,
} from '@features/business/components/BusinessAnalyticsPrimitives';
import {
  BusinessOptionGrid,
  BusinessRatingStars,
} from '@features/business/components/BusinessPosPrimitives';
import {
  boostAudiences,
  boostRadii,
  growthSubTabIcon,
  growthSubTabs,
} from '@features/business/data/businessGrowthData';

const copy = strings.boostEngine;

const growthTabs = growthSubTabs.map(label => ({
  key: label,
  label,
  icon: growthSubTabIcon[label],
}));

const durationDays: Record<string, number> = {
  [copy.durations[0]]: 3,
  [copy.durations[1]]: 7,
  [copy.durations[2]]: 14,
  [copy.durations[3]]: 7,
};

const formatNaira = (value: number) => `₦${value.toLocaleString('en-NG')}`;

/** Radius option id → km (the API's targeting radius). */
export const BOOST_ENGINE_RADIUS_KM: Record<string, number> = {
  hyperlocal: 3,
  district: 5,
  metro: 10,
};

/** Boost audiences the API serves (`BOOST_AUDIENCE_TYPES`). */
const LIVE_AUDIENCE_IDS: readonly string[] = ['regulars', 'walkins'];

export interface BoostEngineSelection {
  radius: string;
  radiusKm: number;
  /** Live: `regulars` | `walkins`, or '' for everyone nearby. */
  audience: string;
  tier: string;
  duration: string;
  days: number;
  /** Total budget (₦): the chosen API tier, spread across the run. */
  total: number;
}

/** The engine's live figures. */
export interface BoostEngineLive {
  /** The running boost's banner; omitted when nothing is boosting. */
  activeBanner?: string;
  metrics: readonly { label: string; value: string; note?: string; icon: IconName }[];
  /** The listing to boost; `null` when the business has nothing eligible. */
  asset: {
    name: string;
    was?: string;
    now?: string;
    badge: string;
    note?: string;
  } | null;
  /** Estimated reach per radius id. */
  radiusReach: Partial<Record<string, string>>;
  /** Estimated claims per tier id. */
  tierClaims: Partial<Record<string, string>>;
  /** Reach estimate for the current selection. */
  estimate?: string;
  preview: {
    name: string;
    branch: string;
    distance: string;
    rating?: number;
    reviews?: number;
  };
}

export interface BoostEngineScreenProps {
  onBack?: () => void;
  onOpenNotifications?: () => void;
  onOpenSubTab?: (tabKey: string) => void;
  onChangeDeal?: () => void;
  onLaunch?: (total: string, selection: BoostEngineSelection) => void;
  onViewHistory?: () => void;
  onClaimDeal?: () => void;
  onOpenProfile?: () => void;
  live: BoostEngineLive;
  /** The API's budget tiers (`/boosts/options` `budgetTiers`), each a total for the run. */
  tiers?: readonly BudgetTier[];
  initialSelection?: Partial<Pick<BoostEngineSelection, 'radius' | 'tier' | 'duration'>>;
  onSelectionChange?: (selection: BoostEngineSelection) => void;
}

/**
 * Boost engine: performance figures, the deal being boosted, hyperlocal radius
 * and audience selection, budget tier and duration, the resulting investment
 * and a live consumer-feed preview of the boosted card.
 */
export function BoostEngineScreen({
  onBack,
  onOpenNotifications,
  onOpenSubTab,
  onChangeDeal,
  onLaunch,
  onViewHistory,
  onClaimDeal,
  onOpenProfile,
  live,
  tiers = DEFAULT_BUDGET_TIERS.boost,
  initialSelection,
  onSelectionChange,
}: BoostEngineScreenProps) {
  const [subTab, setSubTab] = useState(growthSubTabs[1]);
  const [radius, setRadius] = useState(initialSelection?.radius ?? boostRadii[0].id);
  // Live: optional, and only the audiences built from the business's own
  // data; targeting rivals' claimers is not offered.
  const audiences = boostAudiences.filter(option =>
    LIVE_AUDIENCE_IDS.includes(option.id),
  );
  const [audience, setAudience] = useState<string>('');
  const chooseAudience = (id: string) =>
    setAudience(current => (current === id ? '' : id));
  // The middle tier is the suggested starting point.
  const suggested = tiers[Math.floor(tiers.length / 2)] ?? tiers[0];
  const [tier, setTier] = useState(initialSelection?.tier ?? suggested?.id ?? '');
  const [duration, setDuration] = useState<string>(
    initialSelection?.duration ?? copy.durations[1],
  );

  const days = durationDays[duration] ?? 7;
  const total = tiers.find(option => option.id === tier)?.amount ?? 0;
  const totalLabel = formatNaira(total);
  const selection: BoostEngineSelection = {
    radius,
    radiusKm: BOOST_ENGINE_RADIUS_KM[radius] ?? 3,
    audience,
    tier,
    duration,
    days,
    total,
  };

  useEffect(() => {
    onSelectionChange?.(selection);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- report choice changes only.
  }, [radius, audience, tier, duration]);

  const liveCopy = copy.live;
  const { asset } = live;
  const canLaunch = Boolean(asset);
  const { preview } = live;

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'bellRing', label: copy.headerTitle, onPress: onOpenNotifications },
          { icon: 'accountCircle', label: copy.headerTitle, onPress: onOpenProfile },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.launchCta.replace('{amount}', totalLabel)}
            labelVariant="labelMd"
            disabled={!canLaunch}
            onPress={() => onLaunch?.(totalLabel, selection)}
            leftIcon={<Icon name="rocket" size={18} color={colors.surface} />}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.historyCta}
            onPress={onViewHistory}
            className="min-h-10 flex-row items-center justify-center gap-1.5"
          >
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-primary"
              numberOfLines={1}
            >
              {copy.historyCta}
            </VemtapText>
            <Icon name="forward" size={15} color={colors.primary} />
          </Pressable>
        </BusinessActionDock>
      }
    >
      {!live.activeBanner ? null : (
        <View className="flex-row flex-wrap items-center gap-1.5 rounded-full bg-badge-discount-bg px-3 py-1.5">
          <Icon name="bolt" size={15} color={colors.badgeDiscountText} />
          <VemtapText
            variant="caption"
            className="min-w-0 flex-1 font-sans-semibold text-badge-discount-text"
            numberOfLines={2}
          >
            {live.activeBanner}
          </VemtapText>
        </View>
      )}

      <BusinessAnalyticsNav
        tabs={growthTabs}
        value={subTab}
        onChange={next => {
          setSubTab(next as typeof subTab);
          onOpenSubTab?.(next);
        }}
        className="-mx-6 mt-3"
      />

      <BusinessPanel
        className="mt-3"
        title={copy.metricsTitle}
        icon="trendingUp"
        badge={copy.metricsSubtitle}
        badgeTone="neutral"
      >
        <BusinessMetricGrid
          cells={live.metrics.map(metric => ({ ...metric }))}
          columns={2}
          variant="bare"
        />
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.feedTitle}
        icon="bolt"
        badge={copy.feedSubtitle}
        badgeTone="neutral"
      >
        {!asset ? (
          <View className="gap-1 rounded-field bg-surface-subtle p-3">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {liveCopy.noAssetTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary">
              {liveCopy.noAssetBody}
            </VemtapText>
          </View>
        ) : (
          <View className="flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-3">
            <View className="min-w-0 flex-1">
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {copy.boostingLabel}
              </VemtapText>
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {asset.name}
              </VemtapText>
              <View className="mt-1 flex-row flex-wrap items-baseline gap-1.5">
                {!asset.was ? null : (
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold text-text-tertiary line-through"
                    numberOfLines={1}
                  >
                    {asset.was}
                  </VemtapText>
                )}
                {!asset.now ? null : (
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-bold text-primary"
                    numberOfLines={1}
                  >
                    {asset.now}
                  </VemtapText>
                )}
                <BusinessStatusPill label={asset.badge} tone="success" />
              </View>
              {!asset.note ? null : (
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {asset.note}
                </VemtapText>
              )}
            </View>
          </View>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.changeDealCta}
          onPress={onChangeDeal}
          className="mt-2 min-h-10 flex-row items-center justify-center gap-1.5 rounded-field bg-surface-container active:scale-95"
        >
          <Icon name="swapHoriz" size={16} color={colors.text} />
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {copy.changeDealCta}
          </VemtapText>
        </Pressable>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.radiusTitle}
        icon="nearMe"
        badge={copy.radiusSubtitle}
        badgeTone="neutral"
      >
        <BusinessOptionGrid
          options={boostRadii.map(option => ({
            id: option.id,
            title: option.title,
            value: live.radiusReach[option.id] ?? '',
            hint: option.id === 'hyperlocal' ? copy.recommended : undefined,
            icon: option.icon,
          }))}
          value={radius}
          onChange={setRadius}
          columns={3}
          accessibilityLabel={copy.radiusTitle}
        />
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.audienceTitle} icon="loyalty">
        <BusinessOptionGrid
          options={audiences.map(option => ({
            id: option.id,
            title: option.title,
            value: '',
            footnote: option.detail,
            icon: option.icon,
          }))}
          value={audience}
          onChange={chooseAudience}
          columns={2}
          accessibilityLabel={copy.audienceTitle}
        />
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.budgetTitle}
        icon="payments"
        badge="Direct Visibility"
        badgeTone="brand"
      >
        <BusinessOptionGrid
          options={tiers.map(option => ({
            id: option.id,
            title: option.label,
            value: formatNaira(option.amount),
            hint: option.id === suggested?.id ? copy.recommended : undefined,
            footnote: live.tierClaims[option.id],
          }))}
          value={tier}
          onChange={setTier}
          columns={3}
          accessibilityLabel={copy.budgetTitle}
        />

        <BusinessChipScroller className="mt-2">
          {copy.durations.map(item => (
            <Pressable
              key={item}
              accessibilityRole="radio"
              accessibilityState={{ selected: item === duration }}
              accessibilityLabel={`${copy.budgetTitle}: ${item}`}
              onPress={() => setDuration(item)}
              className={`min-h-9 flex-row items-center rounded-full px-3.5 py-1.5 active:scale-95 ${
                item === duration ? 'bg-surface-tint shadow-sm' : 'bg-surface-container'
              }`}
            >
              <VemtapText
                variant="labelSm"
                className={
                  item === duration
                    ? 'font-sans-semibold text-primary'
                    : 'text-text-secondary'
                }
                numberOfLines={1}
              >
                {item}
              </VemtapText>
            </Pressable>
          ))}
        </BusinessChipScroller>

        <View className="mt-2 flex-row items-center justify-between gap-3 rounded-field bg-surface-subtle p-3">
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.investmentTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {liveCopy.investmentNote(duration)}
            </VemtapText>
          </View>
          <VemtapText
            variant="headingLg"
            className="shrink-0 font-sans-bold text-primary"
            numberOfLines={1}
          >
            {totalLabel}
          </VemtapText>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Icon name="verified" size={14} color={colors.badgeDiscountText} />
          <VemtapText
            variant="caption"
            className="min-w-0 flex-1 text-badge-discount-text"
            numberOfLines={1}
          >
            {live.estimate ?? ''}
          </VemtapText>
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.previewTitle}
        icon="phoneDevice"
        badge={copy.previewSubtitle}
        badgeTone="neutral"
      >
        <View className="gap-2 rounded-card border border-border bg-surface p-3">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="micro"
              className="font-sans-bold uppercase tracking-wider text-primary"
              numberOfLines={1}
            >
              {copy.boostedLabel}
            </VemtapText>
            <BusinessStatusPill label={preview.distance} tone="neutral" />
          </View>
          <View className="flex-row items-center gap-2.5">
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-badge-discount-bg">
              <Icon name="restaurant" size={19} color={colors.badgeDiscountText} />
            </View>
            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-1.5">
                <VemtapText
                  variant="labelMd"
                  className="min-w-0 flex-1 font-sans-semibold"
                  numberOfLines={1}
                >
                  {preview.name}
                </VemtapText>
                <Icon name="verified" size={14} color={colors.primary} />
              </View>
              {preview.rating !== undefined ? (
                <View className="flex-row items-center gap-1.5">
                  <BusinessRatingStars rating={preview.rating} size={12} />
                  {preview.reviews !== undefined ? (
                    <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                      {`(${preview.reviews})`}
                    </VemtapText>
                  ) : null}
                </View>
              ) : null}
              <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                {preview.branch}
              </VemtapText>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.claimDealCta}
            onPress={onClaimDeal}
            className="min-h-10 flex-row items-center justify-center gap-1.5 rounded-field bg-primary active:scale-95"
          >
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-surface"
              numberOfLines={1}
            >
              {copy.claimDealCta}
            </VemtapText>
          </Pressable>
        </View>
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}
