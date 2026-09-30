import React, { useState } from 'react';
import { View } from 'react-native';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { BusinessAnalyticsShell } from '@features/business/components/BusinessAnalyticsShell';
import {
  BusinessCompareBars,
  BusinessHeatmap,
  BusinessInsightCard,
  BusinessMetricGrid,
  BusinessSectionHeader,
  type BusinessCompareRow,
} from '@features/business/components/BusinessAnalyticsPrimitives';
import {
  BusinessChipScroller,
  BusinessPanel,
  BusinessToggleChip,
} from '@features/business/components/BusinessOpsPrimitives';

const copy = strings.businessIntelligence.locations;

export interface LocationsAnalyticsVemtapIntelligenceScreenProps {
  onBack?: () => void;
  onMoreOptions?: () => void;
  onTabChange?: (tabKey: string) => void;
  onRangeChange?: (value: string) => void;
  onOpenFilters?: () => void;
  onExport?: () => void;
  onOpenBranch?: (branchId: string) => void;
  onManageLocations?: () => void;
  onBoostBranch?: () => void;
}

/**
 * Locations Analytics — VEMTAP Intelligence.
 * stitch_vemtap_mobile_app_design/locations_analytics_vemtap_intelligence
 */
export function LocationsAnalyticsVemtapIntelligenceScreen({
  onBack,
  onMoreOptions,
  onTabChange,
  onRangeChange,
  onOpenFilters,
  onExport,
  onOpenBranch,
  onManageLocations,
  onBoostBranch,
}: LocationsAnalyticsVemtapIntelligenceScreenProps) {
  const [tab, setTab] = useState('locations');
  const [range, setRange] = useState<string>(strings.businessIntelligence.dateRanges[2]);
  const [scope, setScope] = useState<string>(copy.branches[0]);

  const shareRows: BusinessCompareRow[] = copy.share.map(row => ({
    id: row.id,
    label: row.label,
    value: row.value,
    percent: row.percent,
  }));

  const channelRows: BusinessCompareRow[] = copy.channels.map(row => ({
    id: row.id,
    label: row.label,
    value: `${row.percent}%`,
    percent: row.percent,
  }));

  return (
    <BusinessAnalyticsShell
      title={copy.title}
      tab={tab}
      onTabChange={key => {
        setTab(key);
        onTabChange?.(key);
      }}
      range={range}
      onRangeChange={value => {
        setRange(value);
        onRangeChange?.(value);
      }}
      onBack={onBack}
      onMoreOptions={onMoreOptions}
      onOpenFilters={onOpenFilters}
      onExport={onExport}
      banner={
        <View className="mb-3">
          <BusinessChipScroller>
            {copy.branches.map(branch => (
              <BusinessToggleChip
                key={branch}
                label={branch}
                icon="storefront"
                selected={branch === scope}
                onPress={() => {
                  setScope(branch);
                  onOpenBranch?.(branch.split(' ')[0].toLowerCase());
                }}
              />
            ))}
          </BusinessChipScroller>
        </View>
      }
    >
      <View className="mt-3 flex-row items-center gap-3 rounded-card bg-primary p-4 shadow-md">
        <View className="min-w-0 flex-1 gap-1">
          <VemtapText variant="caption" className="text-primary-foreground">
            {copy.networkTitle}
          </VemtapText>
          <VemtapText
            variant="headingLg"
            className="font-sans-bold text-primary-foreground"
          >
            {copy.networkValue}
          </VemtapText>
          <VemtapText variant="micro" className="text-primary-foreground">
            {copy.networkNote}
          </VemtapText>
        </View>
      </View>

      <View className="mt-3">
        <BusinessMetricGrid
          columns={3}
          cells={copy.ribbon.map(item => ({
            label: item.label,
            value: item.value,
            icon:
              item.id === 'outlets'
                ? ('storefront' as const)
                : item.id === 'orders'
                  ? ('receipt' as const)
                  : ('visibility' as const),
          }))}
        />
      </View>

      <View className="mt-4 gap-3">
        <BusinessSectionHeader title={copy.shareTitle} />
        <BusinessCompareBars rows={shareRows} />
      </View>

      <View className="mt-4 gap-3">
        <BusinessSectionHeader
          title={copy.scorecardsTitle}
          meta={copy.scorecardsSubtitle}
          badge={copy.scopeAll}
        />
        {copy.scorecards.map(branch => (
          <View
            key={branch.id}
            className="gap-2.5 rounded-card bg-surface-container-lowest p-4 shadow-sm"
          >
            <View className="flex-row items-start justify-between gap-2">
              <View className="min-w-0 flex-1 gap-0.5">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {branch.name}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {branch.meta}
                </VemtapText>
              </View>
              <View className="shrink-0 items-end gap-0.5">
                <View className="rounded-full bg-primary px-2 py-0.5">
                  <VemtapText
                    variant="micro"
                    className="font-sans-semibold text-primary-foreground"
                  >
                    {branch.badge}
                  </VemtapText>
                </View>
                <VemtapText variant="micro" tone="tertiary">
                  {branch.share}
                </VemtapText>
              </View>
            </View>

            <View className="flex-row items-center justify-between gap-3 rounded-field bg-surface-subtle p-2.5">
              <VemtapText variant="caption" tone="secondary">
                {copy.scorecards[0].metrics[0].label}
              </VemtapText>
              <VemtapText variant="labelMd" className="font-sans-bold">
                {branch.revenue}
              </VemtapText>
            </View>

            <View className="flex-row gap-2">
              {branch.metrics.map(metric => (
                <View
                  key={metric.id}
                  className="min-w-0 flex-1 gap-0.5 rounded-field bg-surface-subtle p-2.5"
                >
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                    {metric.label}
                  </VemtapText>
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {metric.value}
                  </VemtapText>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View className="mt-4 gap-3">
        <BusinessSectionHeader
          title={copy.channelTitle}
          meta={copy.channelSubtitle}
          badge={copy.channelTop}
        />
        <BusinessCompareBars rows={channelRows} variant="segmented" height="sm" />
        <VemtapText variant="micro" tone="tertiary">
          {copy.channelSecond}
        </VemtapText>
      </View>

      <View className="mt-4">
        <BusinessPanel className="gap-3">
          <BusinessSectionHeader
            title={copy.heatmapTitle}
            meta={copy.heatmapRange}
            icon="timer"
          />
          <BusinessHeatmap columns={copy.heatmapColumns} rows={copy.heatmap} />
        </BusinessPanel>
      </View>

      <View className="mt-4 gap-3">
        <BusinessInsightCard
          title={copy.insightLunch}
          body={copy.insightLunchBody}
          icon="restaurant"
        />
        <BusinessInsightCard
          title={copy.insightDinner}
          body={copy.insightDinnerBody}
          icon="fire"
        />
        <BusinessInsightCard
          title={copy.insightOffPeak}
          body={copy.insightOffPeakBody}
          icon="hourglass"
          cta={copy.insightOffPeakCta}
          onCtaPress={onBoostBranch}
        />
      </View>

      <View className="mt-4">
        <BusinessPanel tone="tint" className="gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold text-primary">
            {copy.radarTitle}
          </VemtapText>
          <VemtapText variant="headingSm" className="font-sans-bold text-primary">
            {copy.radarValue}
          </VemtapText>
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="caption" tone="secondary">
              {copy.radarMeta}
            </VemtapText>
            <VemtapText variant="micro" className="text-primary">
              {copy.radarSync}
            </VemtapText>
          </View>
        </BusinessPanel>
      </View>

      <View className="mt-3">
        <BusinessInsightCard
          title={copy.cta}
          body={copy.ctaBody}
          icon="storefront"
          cta={copy.ctaAction}
          onCtaPress={onManageLocations}
        />
      </View>
    </BusinessAnalyticsShell>
  );
}
