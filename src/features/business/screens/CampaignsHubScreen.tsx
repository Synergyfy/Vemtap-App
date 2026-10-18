import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessChipScroller,
  BusinessCountChip,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessAnalyticsNav,
  BusinessAnalyticsRow,
  BusinessInsightCard,
  BusinessMetricGrid,
} from '@features/business/components/BusinessAnalyticsPrimitives';
import {
  campaignStatusMeta,
  growthSubTabIcon,
  growthSubTabs,
  type CampaignCard,
  type CampaignStatus,
} from '@features/business/data/businessGrowthData';

const copy = strings.campaignsHub;

const growthTabs = growthSubTabs.map(label => ({
  key: label,
  label,
  icon: growthSubTabIcon[label],
}));

const campaignToneTile: Record<string, string> = {
  brand: 'bg-surface-tint',
  success: 'bg-badge-discount-bg',
  tertiary: 'bg-tertiary-fixed',
  secondary: 'bg-secondary-fixed',
};

const campaignToneIcon: Record<string, string> = {
  brand: colors.primary,
  success: colors.badgeDiscountText,
  tertiary: colors.tertiary,
  secondary: colors.secondary,
};

/** Filter tab per status; drafts appear under All only. */
const filterForStatus: Record<CampaignStatus, number> = {
  live: 1,
  paused: 1,
  scheduled: 2,
  completed: 3,
  draft: -1,
};

/** Live header figures for the hub. */
export interface CampaignsHubMetrics {
  liveBadge: string;
  reach: string;
  reachNote: string;
  conversions: string;
  conversionsNote: string;
  gmv: string;
  gmvNote: string;
}

export interface CampaignsHubScreenProps {
  onBack?: () => void;
  onOpenNotifications?: () => void;
  onCreateCampaign?: () => void;
  onApplyFilter?: (tabIndex: number) => void;
  onOpenSubTab?: (tabKey: string) => void;
  onPauseCampaign?: (campaignId: string) => void;
  onEditSetup?: (campaignId: string) => void;
  onPreviewPush?: (campaignId: string) => void;
  onOpenRetentionPlaybook?: () => void;
  onExport?: () => void;
  onViewCampaign?: (campaignId: string) => void;
  /** The business's campaigns (empty until they load). */
  campaigns: readonly CampaignCard[];
  metrics?: CampaignsHubMetrics;
  /** Filter tab labels with live counts. */
  tabs?: readonly string[];
  upcomingBadge?: string;
  /** Win-back nudge; absent or `null` hides the playbook. */
  playbook?: { subtitle: string; body: string } | null;
  /** The ledger export is being built. */
  exporting?: boolean;
  /** Campaign ids with a pause/resume/launch request in flight. */
  busyIds?: readonly string[];
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

/**
 * Campaigns & growth: live/reach/conversion/GMV figures, the live campaign
 * cards with claim-to-till stats, the scheduled pipeline, an AI retention
 * recommendation and a CSV export.
 */
export function CampaignsHubScreen({
  onBack,
  onOpenNotifications,
  onCreateCampaign,
  onApplyFilter,
  onOpenSubTab,
  onPauseCampaign,
  onEditSetup,
  onPreviewPush,
  onOpenRetentionPlaybook,
  onExport,
  onViewCampaign,
  campaigns: liveCampaigns,
  metrics,
  tabs = copy.tabs,
  upcomingBadge,
  playbook,
  busyIds = [],
  exporting = false,
  isLoading = false,
  error,
  onRetry,
}: CampaignsHubScreenProps) {
  const [filter, setFilter] = useState(0);
  const [subTab, setSubTab] = useState(growthSubTabs[0]);

  const source = liveCampaigns;
  const visible =
    filter === 0
      ? source
      : source.filter(campaign => filterForStatus[campaign.status] === filter);

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'bellRing', label: copy.headerTitle, onPress: onOpenNotifications },
          { icon: 'accountCircle', label: copy.headerTitle, onPress: undefined },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.createCta}
            labelVariant="labelMd"
            onPress={onCreateCampaign}
            leftIcon={<Icon name="plus" size={18} color={colors.surface} />}
          />
          {!onExport ? null : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.exportCta}
              accessibilityState={{ disabled: exporting, busy: exporting }}
              disabled={exporting}
              onPress={onExport}
              className={`min-h-10 flex-row items-center justify-center gap-1.5 ${exporting ? 'opacity-50' : ''}`}
            >
              <Icon name="download" size={17} color={colors.primary} />
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold text-primary"
                numberOfLines={1}
              >
                {copy.exportCta}
              </VemtapText>
            </Pressable>
          )}
        </BusinessActionDock>
      }
    >
      <VemtapText variant="bodyMd" tone="secondary" numberOfLines={2}>
        {copy.headerSubtitle}
      </VemtapText>

      <BusinessAnalyticsNav
        tabs={growthTabs}
        value={subTab}
        onChange={next => {
          setSubTab(next as typeof subTab);
          onOpenSubTab?.(next);
        }}
        className="-mx-6 mt-2"
      />

      <BusinessPanel
        className="mt-3"
        title={copy.liveNowTitle}
        icon="sensors"
        badge={metrics?.liveBadge}
        badgeTone="success"
      >
        <BusinessMetricGrid
          cells={
            metrics
              ? [
                  {
                    label: copy.reachLabel,
                    value: metrics.reach,
                    note: metrics.reachNote,
                    icon: 'group',
                  },
                  {
                    label: copy.live.conversionsLabel,
                    value: metrics.conversions,
                    note: metrics.conversionsNote,
                    icon: 'pointOfSale',
                  },
                  {
                    label: copy.live.gmvLabel,
                    value: metrics.gmv,
                    note: metrics.gmvNote,
                    icon: 'payments',
                  },
                ]
              : [
                  // Loading or unavailable: labels only, never sample figures.
                  { label: copy.reachLabel, value: '\u2014', icon: 'group' },
                  {
                    label: copy.live.conversionsLabel,
                    value: '\u2014',
                    icon: 'pointOfSale',
                  },
                  { label: copy.live.gmvLabel, value: '\u2014', icon: 'payments' },
                ]
          }
          columns={3}
          variant="bare"
        />
      </BusinessPanel>

      <BusinessChipScroller className="mt-3">
        {tabs.map((tab, index) => (
          <BusinessCountChip
            key={tab}
            label={tab}
            selected={index === filter}
            onPress={() => {
              setFilter(index);
              onApplyFilter?.(index);
            }}
          />
        ))}
      </BusinessChipScroller>

      {isLoading ? <LoadingState /> : null}
      {!isLoading && error ? <ErrorState description={error} onRetry={onRetry} /> : null}

      <View className="mt-3 gap-2">
        {(isLoading || error ? [] : visible).map(campaign => {
          const meta = campaignStatusMeta[campaign.status];
          const busy = busyIds.includes(campaign.id);
          const showEdit = campaign.status === 'draft';
          return (
            <View
              key={campaign.id}
              className="gap-2 rounded-card bg-surface p-3 shadow-sm"
            >
              <View className="flex-row items-center gap-2.5">
                <View
                  className={`h-9 w-9 shrink-0 items-center justify-center rounded-lg ${campaignToneTile[campaign.iconTone]}`}
                >
                  <Icon
                    name={campaign.icon}
                    size={18}
                    color={campaignToneIcon[campaign.iconTone]}
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {campaign.name}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                    {campaign.offer}
                  </VemtapText>
                </View>
                <BusinessStatusPill label={campaign.statusLabel} tone={meta.tone} />
              </View>

              {campaign.channelLabel ? (
                <View className="flex-row items-center gap-1.5">
                  <Icon
                    name={campaign.channelIcon ?? 'campaign'}
                    size={14}
                    color={colors.textTertiary}
                  />
                  <VemtapText
                    variant="caption"
                    tone="tertiary"
                    className="min-w-0 flex-1"
                    numberOfLines={1}
                  >
                    {campaign.channelLabel}
                  </VemtapText>
                </View>
              ) : null}

              <View className="flex-row items-center gap-1.5">
                <Icon name="group" size={14} color={colors.textTertiary} />
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="min-w-0 flex-1"
                  numberOfLines={2}
                >
                  {`${copy.targetingLabel} ${campaign.audience}`}
                </VemtapText>
              </View>

              {campaign.stats.length ? (
                <View className="flex-row flex-wrap gap-2">
                  {campaign.stats.map(stat => (
                    <View
                      key={stat.label}
                      className="min-w-[30%] flex-1 gap-0.5 rounded-field bg-surface-subtle p-2.5"
                    >
                      <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                        {stat.label}
                      </VemtapText>
                      <VemtapText
                        variant="labelMd"
                        className="font-sans-bold"
                        numberOfLines={1}
                      >
                        {stat.value}
                      </VemtapText>
                      {stat.note ? (
                        <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                          {stat.note}
                        </VemtapText>
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : null}

              <View className="flex-row flex-wrap gap-2">
                {campaign.cta ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={campaign.cta}
                    accessibilityState={{ disabled: busy }}
                    disabled={busy}
                    onPress={() => onPauseCampaign?.(campaign.id)}
                    className={`min-h-9 flex-1 flex-row items-center justify-center gap-1.5 rounded-field bg-surface-container px-3 active:scale-95 ${busy ? 'opacity-50' : ''}`}
                  >
                    <Icon
                      name={campaign.status === 'paused' ? 'playCircle' : 'pauseCircle'}
                      size={15}
                      color={colors.text}
                    />
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {campaign.cta}
                    </VemtapText>
                  </Pressable>
                ) : null}
                {showEdit ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={copy.live.continueCta}
                    onPress={() => onEditSetup?.(campaign.id)}
                    className="min-h-9 flex-1 flex-row items-center justify-center gap-1.5 rounded-field bg-surface-container px-3 active:scale-95"
                  >
                    <Icon name="edit" size={15} color={colors.text} />
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {copy.live.continueCta}
                    </VemtapText>
                  </Pressable>
                ) : null}
                {!onPreviewPush ? null : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={copy.previewPushCta}
                    onPress={() => onPreviewPush?.(campaign.id)}
                    className="min-h-9 flex-1 flex-row items-center justify-center gap-1.5 rounded-field bg-primary px-3 active:scale-95"
                  >
                    <Icon name="visibility" size={15} color={colors.surface} />
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-semibold text-surface"
                      numberOfLines={1}
                    >
                      {copy.previewPushCta}
                    </VemtapText>
                  </Pressable>
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={campaign.name}
                  onPress={() => onViewCampaign?.(campaign.id)}
                  className="min-h-9 w-10 items-center justify-center rounded-field bg-surface-container active:scale-95"
                >
                  <Icon name="more" size={16} color={colors.text} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      {!isLoading && !error && visible.length === 0 ? (
        <EmptyState
          icon="campaign"
          variant="contained"
          title={copy.empty.title}
          description={copy.empty.body}
        />
      ) : null}

      <BusinessPanel
        className="mt-3"
        title={copy.upcomingTitle}
        icon="schedule"
        badge={upcomingBadge}
        badgeTone="neutral"
      >
        {source
          .filter(campaign => campaign.status === 'scheduled')
          .map(campaign => (
            <BusinessAnalyticsRow
              key={campaign.id}
              title={campaign.name}
              subtitle={campaign.offer}
              icon={campaign.icon}
              badge={campaign.statusLabel}
              badgeTone={campaignStatusMeta[campaign.status].tone}
              onPress={() => onViewCampaign?.(campaign.id)}
            />
          ))}
      </BusinessPanel>

      {!playbook ? null : (
        <BusinessPanel
          className="mt-3"
          title={copy.playbookTitle}
          icon="autoAwesome"
          badge="AI Recommendation"
          badgeTone="brand"
        >
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={2}>
            {playbook.subtitle}
          </VemtapText>
          <BusinessInsightCard
            className="mt-2"
            title={copy.playbookTitle}
            body={playbook.body}
            icon="personAlert"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={playbook.subtitle}
            onPress={onOpenRetentionPlaybook}
            className="mt-2 min-h-10 flex-row items-center justify-center gap-1.5 rounded-field bg-primary active:scale-95"
          >
            <Icon name="rocket" size={16} color={colors.surface} />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-surface"
              numberOfLines={1}
            >
              {playbook.subtitle}
            </VemtapText>
          </Pressable>
        </BusinessPanel>
      )}

      <View className="mt-3 flex-row items-center gap-1.5 rounded-field bg-surface-subtle p-2.5">
        <Icon name="sync" size={14} color={colors.textTertiary} />
        <VemtapText
          variant="caption"
          tone="tertiary"
          className="min-w-0 flex-1"
          numberOfLines={2}
        >
          {copy.exportFooter}
        </VemtapText>
      </View>
    </BusinessScreenLayout>
  );
}
