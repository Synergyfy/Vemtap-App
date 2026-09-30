import React, { useState } from 'react';
import { View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { BusinessAnalyticsShell } from '@features/business/components/BusinessAnalyticsShell';
import {
  BusinessCompareBars,
  BusinessInsightCard,
  BusinessMetricGrid,
  BusinessSectionHeader,
  type BusinessCompareRow,
  type BusinessMetricCell,
} from '@features/business/components/BusinessAnalyticsPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';

const copy = strings.businessIntelligence.business;

export interface BusinessAnalyticsVemtapIntelligenceScreenProps {
  onBack?: () => void;
  onMoreOptions?: () => void;
  onTabChange?: (tabKey: string) => void;
  onRangeChange?: (value: string) => void;
  onOpenFilters?: () => void;
  onExport?: () => void;
  onOpenHub?: () => void;
  onChangeMetric?: (metric: string) => void;
}

/**
 * Business Analytics — VEMTAP Intelligence.
 * stitch_vemtap_mobile_app_design/business_analytics_vemtap_intelligence
 */
export function BusinessAnalyticsVemtapIntelligenceScreen({
  onBack,
  onMoreOptions,
  onTabChange,
  onRangeChange,
  onOpenFilters,
  onExport,
  onOpenHub,
  onChangeMetric,
}: BusinessAnalyticsVemtapIntelligenceScreenProps) {
  const [tab, setTab] = useState('business');
  const [range, setRange] = useState<string>(strings.businessIntelligence.dateRanges[2]);
  const [metric, setMetric] = useState<string>(copy.trendMetrics[0]);

  const activityCells: BusinessMetricCell[] = copy.activity.map(item => ({
    label: item.label,
    value: item.value,
  }));

  const sourceRows: BusinessCompareRow[] = copy.sources.map(row => ({
    id: row.id,
    label: row.label,
    value: row.value,
    percent: row.percent,
  }));

  const retentionRows: BusinessCompareRow[] = copy.retentionSplit.map(row => ({
    id: row.id,
    label: row.label,
    value: row.value,
    percent: row.percent,
    fillClass: row.id === 'returning' ? 'bg-success' : 'bg-surface-container-highest',
  }));

  const trendValues = copy.trend.map(
    point =>
      point[metric.toLowerCase() as 'revenue' | 'orders' | 'visits'] ?? point.revenue,
  );
  const maxTrend = Math.max(...trendValues);

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
        <View className="mb-3 flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-row items-center gap-1.5">
            <View className="h-1.5 w-1.5 rounded-full bg-badge-discount-text" />
            <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
              {copy.subtitle}
            </VemtapText>
          </View>
          <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
            {copy.updated}
          </VemtapText>
        </View>
      }
    >
      <View className="mt-3 flex-row items-center justify-between gap-2">
        <View className="min-w-0">
          <VemtapText variant="headingSm" className="font-sans-semibold text-heading-sm">
            {copy.heroTitle}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {copy.heroSubtitle}
          </VemtapText>
        </View>
      </View>

      <View className="mt-3 gap-3">
        <View className="flex-row items-center gap-2 rounded-card bg-primary p-4 shadow-md">
          <View className="min-w-0 flex-1 gap-1">
            <VemtapText variant="caption" className="text-primary-foreground">
              {copy.revenueLabel}
            </VemtapText>
            <VemtapText
              variant="headingLg"
              className="font-sans-bold text-primary-foreground"
            >
              {copy.revenueValue}
            </VemtapText>
            <VemtapText variant="micro" className="text-primary-foreground">
              {copy.revenueNote}
            </VemtapText>
          </View>
          <View className="shrink-0 items-end gap-1">
            <View className="rounded-full bg-surface/20 px-2 py-0.5">
              <VemtapText
                variant="micro"
                className="font-sans-semibold text-primary-foreground"
              >
                {copy.revenueNote.split(' ')[0]}
              </VemtapText>
            </View>
            <Icon name="trendingUp" size={22} color={colors.surface} />
          </View>
        </View>

        <BusinessMetricGrid
          columns={2}
          cells={[
            {
              label: copy.ordersLabel,
              value: copy.ordersValue,
              note: copy.ordersNote,
              noteTone: 'brand',
              icon: 'receipt',
            },
            {
              label: copy.interactionsLabel,
              value: copy.interactionsValue,
              note: copy.interactionsNote,
              noteTone: 'success',
              icon: 'nearMe',
            },
          ]}
        />
      </View>

      <View className="mt-4">
        <BusinessPanel className="gap-3">
          <BusinessSectionHeader title={copy.activityLabel} meta={copy.activityValue} />
          <View className="flex-row flex-wrap gap-2">
            {activityCells.map(cell => (
              <View
                key={cell.label}
                className="min-w-[46%] flex-1 gap-0.5 rounded-field bg-surface-subtle p-2.5"
              >
                <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                  {cell.label}
                </VemtapText>
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {cell.value}
                </VemtapText>
              </View>
            ))}
          </View>
        </BusinessPanel>
      </View>

      <View className="mt-4">
        <BusinessPanel className="gap-3">
          <BusinessSectionHeader
            title={copy.trendTitle}
            meta={copy.trendSubtitle}
            badge={copy.trendNote}
          />
          <View className="flex-row flex-wrap gap-2">
            {copy.trendMetrics.map(option => (
              <View
                key={option}
                className={
                  option === metric
                    ? 'rounded-full bg-primary px-2.5 py-1'
                    : 'rounded-full bg-surface-container px-2.5 py-1'
                }
              >
                <VemtapText
                  variant="micro"
                  className={
                    option === metric ? 'text-primary-foreground' : 'text-text-secondary'
                  }
                  onPress={() => {
                    setMetric(option);
                    onChangeMetric?.(option);
                  }}
                >
                  {option}
                </VemtapText>
              </View>
            ))}
          </View>
          <View className="h-28 flex-row items-end gap-2">
            {copy.trend.map((point, index) => {
              const value = trendValues[index] ?? 0;
              return (
                <View key={point.id} className="min-w-0 flex-1 items-center gap-1">
                  <View
                    className="w-full rounded-t-md bg-primary"
                    style={{ height: `${Math.max(8, (value / maxTrend) * 100)}%` }}
                  />
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                    {point.label}
                  </VemtapText>
                </View>
              );
            })}
          </View>
        </BusinessPanel>
      </View>

      <View className="mt-4 gap-3">
        <BusinessSectionHeader
          title={copy.retentionTitle}
          meta={copy.retentionSubtitle}
        />
        <BusinessCompareBars rows={retentionRows} />
        <View className="rounded-card bg-surface-container p-3">
          <VemtapText variant="labelMd" className="font-sans-semibold text-primary">
            {copy.repeatRate}
          </VemtapText>
        </View>
      </View>

      <View className="mt-4 gap-3">
        <BusinessSectionHeader title={copy.sourceTitle} meta={copy.sourceSubtitle} />
        <BusinessCompareBars rows={sourceRows} />
      </View>

      <View className="mt-4 gap-3">
        <BusinessSectionHeader title={copy.insightsTitle} meta={copy.insightsSubtitle} />
        {copy.insights.map(insight => (
          <BusinessInsightCard
            key={insight.id}
            title={insight.title}
            body={insight.body}
            icon="insights"
          />
        ))}
        <BusinessInsightCard
          title={copy.ctaTitle}
          body={copy.ctaBody}
          icon="storefront"
          cta={copy.cta}
          onCtaPress={onOpenHub}
        />
      </View>
    </BusinessAnalyticsShell>
  );
}
