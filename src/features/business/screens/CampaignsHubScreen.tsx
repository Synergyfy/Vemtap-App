import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
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
  campaigns,
  campaignRetention,
  campaignStatusMeta,
  growthSubTabIcon,
  growthSubTabs,
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

const filterForStatus: Record<CampaignStatus, number> = {
  live: 1,
  scheduled: 2,
  completed: 3,
};

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
}: CampaignsHubScreenProps) {
  const [filter, setFilter] = useState(0);
  const [subTab, setSubTab] = useState(growthSubTabs[0]);

  const status: CampaignStatus =
    filter === 1 ? 'live' : filter === 2 ? 'scheduled' : 'completed';
  const visible =
    filter === 0
      ? campaigns
      : campaigns.filter(
          campaign => filterForStatus[campaign.status] === filterForStatus[status],
        );

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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.exportCta}
            onPress={onExport}
            className="min-h-10 flex-row items-center justify-center gap-1.5"
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
        badge={copy.liveNowBadge}
        badgeTone="success"
      >
        <BusinessMetricGrid
          cells={[
            {
              label: copy.reachLabel,
              value: copy.reachValue,
              note: copy.reachDelta,
              noteIcon: 'trendingUp',
              noteTone: 'success',
              icon: 'group',
            },
            {
              label: copy.conversionsLabel,
              value: copy.conversionsValue,
              note: copy.conversionsSub,
              icon: 'pointOfSale',
            },
            {
              label: copy.gmvLabel,
              value: copy.gmvValue,
              note: copy.gmvDelta,
              noteIcon: 'trendingUp',
              noteTone: 'success',
              icon: 'payments',
            },
          ]}
          columns={3}
          variant="bare"
        />
      </BusinessPanel>

      <BusinessChipScroller className="mt-3">
        {copy.tabs.map((tab, index) => (
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

      <View className="mt-3 gap-2">
        {visible.map(campaign => {
          const meta = campaignStatusMeta[campaign.status];
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
                    onPress={() => onPauseCampaign?.(campaign.id)}
                    className="min-h-9 flex-1 flex-row items-center justify-center gap-1.5 rounded-field bg-surface-container px-3 active:scale-95"
                  >
                    <Icon name="pauseCircle" size={15} color={colors.text} />
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {campaign.cta}
                    </VemtapText>
                  </Pressable>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={copy.editSetupCta}
                  onPress={() => onEditSetup?.(campaign.id)}
                  className="min-h-9 flex-1 flex-row items-center justify-center gap-1.5 rounded-field bg-surface-container px-3 active:scale-95"
                >
                  <Icon name="edit" size={15} color={colors.text} />
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {copy.editSetupCta}
                  </VemtapText>
                </Pressable>
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

      {visible.length === 0 ? (
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
        badge={copy.upcomingBadge}
        badgeTone="neutral"
      >
        {campaigns
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

      <BusinessPanel
        className="mt-3"
        title={copy.playbookTitle}
        icon="autoAwesome"
        badge="AI Recommendation"
        badgeTone="brand"
      >
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={2}>
          {campaignRetention.subtitle}
        </VemtapText>
        <BusinessInsightCard
          className="mt-2"
          title={campaignRetention.title}
          body={campaignRetention.body}
          icon={campaignRetention.icon}
        />
        <View className="mt-2 flex-row flex-wrap gap-2">
          <View className="min-w-[45%] flex-1 gap-1 rounded-field bg-surface-subtle p-2.5">
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.playbookOfferLabel}
            </VemtapText>
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={2}
            >
              {campaignRetention.offer}
            </VemtapText>
          </View>
          <View className="min-w-[45%] flex-1 gap-1 rounded-field bg-badge-discount-bg p-2.5">
            <VemtapText
              variant="micro"
              className="text-badge-discount-text"
              numberOfLines={1}
            >
              {copy.playbookValueLabel}
            </VemtapText>
            <VemtapText
              variant="labelMd"
              className="font-sans-bold text-badge-discount-text"
              numberOfLines={2}
            >
              {campaignRetention.value}
            </VemtapText>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={campaignRetention.subtitle}
          onPress={onOpenRetentionPlaybook}
          className="mt-2 min-h-10 flex-row items-center justify-center gap-1.5 rounded-field bg-primary active:scale-95"
        >
          <Icon name="rocket" size={16} color={colors.surface} />
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-surface"
            numberOfLines={1}
          >
            {campaignRetention.subtitle}
          </VemtapText>
        </Pressable>
      </BusinessPanel>

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
