import React, { useState } from 'react';
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
  boostBudgetTiers,
  boostFeedPreview,
  boostRadii,
  boostSelection,
  growthSubTabIcon,
  growthSubTabs,
} from '@features/business/data/businessGrowthData';

const copy = strings.boostEngine;

const growthTabs = growthSubTabs.map(label => ({
  key: label,
  label,
  icon: growthSubTabIcon[label],
}));

/** Daily price per tier, used to derive the investment total. */
const tierDailyPrice: Record<string, number> = { starter: 3000, top: 5000, turbo: 10000 };
const durationDays: Record<string, number> = {
  [copy.durations[0]]: 3,
  [copy.durations[1]]: 7,
  [copy.durations[2]]: 14,
  [copy.durations[3]]: 7,
};

const formatNaira = (value: number) => `₦${value.toLocaleString('en-NG')}`;

export interface BoostEngineScreenProps {
  onBack?: () => void;
  onOpenNotifications?: () => void;
  onOpenSubTab?: (tabKey: string) => void;
  onChangeDeal?: () => void;
  onLaunch?: (total: string) => void;
  onViewHistory?: () => void;
  onClaimDeal?: () => void;
  onOpenProfile?: () => void;
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
}: BoostEngineScreenProps) {
  const [subTab, setSubTab] = useState(growthSubTabs[1]);
  const [radius, setRadius] = useState(boostRadii[0].id);
  const [audience, setAudience] = useState(boostAudiences[0].id);
  const [tier, setTier] = useState('top');
  const [duration, setDuration] = useState<string>(copy.durations[1]);

  const total = (tierDailyPrice[tier] ?? 0) * (durationDays[duration] ?? 7);
  const totalLabel = formatNaira(total);

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
            onPress={() => onLaunch?.(totalLabel)}
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
      <View className="flex-row flex-wrap items-center gap-1.5 rounded-full bg-badge-discount-bg px-3 py-1.5">
        <Icon name="bolt" size={15} color={colors.badgeDiscountText} />
        <VemtapText
          variant="caption"
          className="min-w-0 flex-1 font-sans-semibold text-badge-discount-text"
          numberOfLines={2}
        >
          {copy.activeBanner}
        </VemtapText>
      </View>

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
          cells={[
            {
              label: 'Spend ROI',
              value: '4.6x',
              noteIcon: 'verified',
              noteTone: 'success',
              icon: 'insights',
            },
            {
              label: 'Est. Reach',
              value: '12.5k+',
              note: '5km Abuja radius',
              icon: 'group',
            },
            {
              label: 'Deal Views',
              value: '2,840',
              note: '+34% boost',
              noteIcon: 'trendingUp',
              noteTone: 'success',
              icon: 'visibility',
            },
            {
              label: 'Wallet Claims',
              value: '412',
              note: '8.2% conversion',
              icon: 'redeem',
            },
          ]}
          columns={2}
          variant="bare"
        />
        <View className="flex-row items-center gap-1.5">
          <Icon name="speed" size={14} color={colors.badgeDiscountText} />
          <VemtapText
            variant="caption"
            className="min-w-0 flex-1 text-badge-discount-text"
            numberOfLines={2}
          >
            High consumer claim velocity in Wuse II
          </VemtapText>
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.feedTitle}
        icon="bolt"
        badge={copy.feedSubtitle}
        badgeTone="neutral"
      >
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
              {boostSelection.dealName}
            </VemtapText>
            <View className="mt-1 flex-row flex-wrap items-baseline gap-1.5">
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold text-text-tertiary line-through"
                numberOfLines={1}
              >
                {boostSelection.dealWas}
              </VemtapText>
              <VemtapText
                variant="labelMd"
                className="font-sans-bold text-primary"
                numberOfLines={1}
              >
                {boostSelection.dealNow}
              </VemtapText>
              <BusinessStatusPill label={boostSelection.dealDiscount} tone="success" />
            </View>
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {boostSelection.dealNote}
            </VemtapText>
          </View>
        </View>
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
            value: option.reach,
            hint: option.id === 'hyperlocal' ? copy.recommended : undefined,
            footnote: option.detail,
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
          options={boostAudiences.map(option => ({
            id: option.id,
            title: option.title,
            value: '',
            footnote: option.detail,
            icon: option.icon,
          }))}
          value={audience}
          onChange={setAudience}
          columns={3}
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
          options={boostBudgetTiers.map(option => ({
            id: option.id,
            title: option.name,
            value: `${option.price}/d`,
            hint: option.recommended ? copy.recommended : undefined,
            footnote: option.detail,
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
              {`${duration} • Zero commission markup`}
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
            Guaranteed 24k+ Impressions
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
            <BusinessStatusPill label={boostFeedPreview.distance} tone="neutral" />
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
                  {boostFeedPreview.name}
                </VemtapText>
                <Icon name="verified" size={14} color={colors.primary} />
              </View>
              <View className="flex-row items-center gap-1.5">
                <BusinessRatingStars rating={boostFeedPreview.rating} size={12} />
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {`(${boostFeedPreview.reviews})`}
                </VemtapText>
              </View>
              <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                {boostFeedPreview.branch}
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
