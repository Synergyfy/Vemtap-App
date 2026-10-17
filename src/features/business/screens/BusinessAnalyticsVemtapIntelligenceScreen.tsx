import React, { useState } from 'react';
import { EmptyState } from '@components/shared';
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
} from '@features/business/components/BusinessAnalyticsPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import type { BusinessOverviewView } from '@features/business/utils/analyticsMappers';

const copy = strings.businessIntelligence.business;

export interface BusinessAnalyticsVemtapIntelligenceScreenProps {
  view?: BusinessOverviewView;
  isError?: boolean;
  onRetry?: () => void;
  /** Selected range chip; the route owns the period. */
  range?: string;
  onBack?: () => void;
  onMoreOptions?: () => void;
  onTabChange?: (tabKey: string) => void;
  onRangeChange?: (value: string) => void;
  onOpenFilters?: () => void;
  onExport?: () => void;
  onOpenHub?: () => void;
  onChangeMetric?: (metric: string) => void;
}

type TrendMetric = (typeof copy.trendMetrics)[number];

/**
 * Business Analytics — VEMTAP Intelligence.
 * stitch_vemtap_mobile_app_design/business_analytics_vemtap_intelligence
 */
export function BusinessAnalyticsVemtapIntelligenceScreen({
  view,
  isError,
  onRetry,
  range = strings.businessIntelligence.dateRanges[2],
  onBack,
  onMoreOptions,
  onTabChange,
  onRangeChange,
  onOpenFilters,
  onExport,
  onOpenHub,
  onChangeMetric,
}: BusinessAnalyticsVemtapIntelligenceScreenProps) {
  const [metric, setMetric] = useState<TrendMetric>(copy.trendMetrics[0]);

  const trendValues = view?.trend.series[metric] ?? [];
  const maxTrend = Math.max(0, ...trendValues);

  return (
    <BusinessAnalyticsShell
      title={copy.title}
      tab="business"
      onTabChange={key => onTabChange?.(key)}
      range={range}
      onRangeChange={value => onRangeChange?.(value)}
      onBack={onBack}
      onMoreOptions={onMoreOptions}
      onOpenFilters={onOpenFilters}
      onExport={onExport}
      ready={Boolean(view)}
      isError={isError}
      onRetry={onRetry}
      banner={
        view ? (
          <View className="mb-3 flex-row items-center gap-1.5">
            <View className="h-1.5 w-1.5 rounded-full bg-badge-discount-text" />
            <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
              {view.snapshot}
            </VemtapText>
          </View>
        ) : null
      }
    >
      {view ? (
        <>
          <View className="mt-3 min-w-0">
            <VemtapText
              variant="headingSm"
              className="font-sans-semibold text-heading-sm"
            >
              {copy.heroTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {view.scope}
            </VemtapText>
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
                  numberOfLines={1}
                >
                  {view.revenue.value}
                </VemtapText>
                <VemtapText variant="micro" className="text-primary-foreground">
                  {view.revenue.note}
                </VemtapText>
              </View>
              <View className="max-w-[45%] shrink-0 items-end gap-1">
                <View className="rounded-full bg-surface/20 px-2 py-0.5">
                  <VemtapText
                    variant="micro"
                    className="font-sans-semibold text-primary-foreground"
                    numberOfLines={2}
                  >
                    {view.revenue.delta.label}
                  </VemtapText>
                </View>
                <Icon
                  name={
                    view.revenue.delta.direction === 'down'
                      ? 'trendingDown'
                      : 'trendingUp'
                  }
                  size={22}
                  color={colors.surface}
                />
              </View>
            </View>

            <BusinessMetricGrid
              columns={2}
              cells={[
                {
                  label: copy.ordersLabel,
                  value: view.orders.value,
                  note: view.orders.note,
                  noteTone: 'brand',
                  icon: 'receipt',
                },
                {
                  label: copy.interactionsLabel,
                  value: view.interactions.value,
                  note: view.interactions.note,
                  noteTone: 'success',
                  icon: 'nearMe',
                },
              ]}
            />
          </View>

          {view.isEmpty ? (
            <EmptyState
              className="mt-4"
              icon="insights"
              variant="contained"
              title={copy.empty.title}
              description={copy.empty.body}
            />
          ) : null}

          <View className="mt-4">
            <BusinessPanel className="gap-3">
              <BusinessSectionHeader
                title={copy.activityLabel}
                meta={view.activityTotal}
              />
              <View className="flex-row flex-wrap gap-2">
                {view.activity.map(cell => (
                  <View
                    key={cell.id}
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
                badge={view.trend.peak[metric]}
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
                      accessibilityRole="button"
                      className={
                        option === metric
                          ? 'text-primary-foreground'
                          : 'text-text-secondary'
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
                {view.trend.labels.map((label, index) => {
                  const value = trendValues[index] ?? 0;
                  return (
                    <View key={label} className="min-w-0 flex-1 items-center gap-1">
                      <View
                        className="w-full rounded-t-md bg-primary"
                        style={{
                          height: `${maxTrend ? Math.max(4, (value / maxTrend) * 100) : 4}%`,
                        }}
                      />
                      <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                        {label}
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
            <BusinessCompareBars
              rows={view.retention.map(row => ({
                ...row,
                fillClass:
                  row.id === 'returning' ? 'bg-success' : 'bg-surface-container-highest',
              }))}
            />
            <View className="rounded-card bg-surface-container p-3">
              <VemtapText variant="labelMd" className="font-sans-semibold text-primary">
                {view.repeatRate}
              </VemtapText>
            </View>
          </View>

          <View className="mt-4 gap-3">
            <BusinessSectionHeader title={copy.sourceTitle} meta={view.sourcesSubtitle} />
            <BusinessCompareBars rows={view.sources} />
          </View>

          <View className="mt-4 gap-3">
            <BusinessSectionHeader
              title={copy.insightsTitle}
              meta={copy.insightsSubtitle}
            />
            {view.insights.map(insight => (
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
        </>
      ) : null}
    </BusinessAnalyticsShell>
  );
}
