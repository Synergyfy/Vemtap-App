import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { Button } from '@components/ui/Button';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessAnalyticsNav,
  BusinessDateRange,
  BusinessAnalyticsRow,
  BusinessHeatmap,
  BusinessInsightCard,
  BusinessMetricGrid,
} from '@features/business/components/BusinessAnalyticsPrimitives';
import { BusinessInitialsAvatar } from '@features/business/components/BusinessPosPrimitives';
import {
  customerAnalyticsNavTabs,
  customerGrowthSeries,
  customerHeatmap,
  customerInsights,
  customerMetrics,
  customerValueSegments,
  customerTierLabel,
  customerTierTone,
  topCustomers,
} from '@features/business/data/businessAnalyticsData';

const copy = strings.customerIntelligenceAnalytics;

export interface CustomerIntelligenceAnalyticsScreenProps {
  onBack?: () => void;
  onMoreOptions?: () => void;
  onOpenSegment?: (segmentId: string) => void;
  onOpenCustomer?: (customerId: string) => void;
  onViewAllCustomers?: () => void;
  onOpenLoyalty?: () => void;
  onCreateDeal?: () => void;
  onExport?: () => void;
  onOpenLoyaltyProgramme?: () => void;
  onOpenDeals?: () => void;
}

/**
 * Customer intelligence overview: KPI grid, segments, top customers, footfall
 * heatmap, new-vs-returning growth and generated insights.
 */
export function CustomerIntelligenceAnalyticsScreen({
  onBack,
  onMoreOptions,
  onOpenSegment,
  onOpenCustomer,
  onViewAllCustomers,
  onOpenLoyalty,
  onCreateDeal,
  onExport,
  onOpenLoyaltyProgramme,
  onOpenDeals,
}: CustomerIntelligenceAnalyticsScreenProps) {
  const [tab, setTab] = useState<string>(customerAnalyticsNavTabs[0].key);
  const [range, setRange] = useState<string>(copy.dateRanges[1]);
  const maxGrowth = Math.max(
    ...customerGrowthSeries.map(point => point.newValue + point.returningValue),
  );

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [{ icon: 'more', label: copy.headerMore, onPress: onMoreOptions }],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.exportCta}
            labelVariant="labelMd"
            onPress={onExport}
            leftIcon={<Icon name="download" size={18} color={colors.surface} />}
          />
          <VemtapText variant="caption" tone="secondary" className="text-center">
            {copy.exportHint}
          </VemtapText>
        </BusinessActionDock>
      }
    >
      <View className="gap-1">
        <VemtapText variant="headingLg" className="text-heading-lg" numberOfLines={2}>
          {copy.greeting}
        </VemtapText>
        <VemtapText variant="bodyMd" tone="secondary" numberOfLines={2}>
          {copy.subheading}
        </VemtapText>
      </View>

      <BusinessAnalyticsNav
        tabs={customerAnalyticsNavTabs}
        value={tab}
        onChange={next => {
          setTab(next);
          if (next === 'loyalty') onOpenLoyaltyProgramme?.();
          if (next === 'deals') onOpenDeals?.();
        }}
        className="mt-3"
      />

      <BusinessDateRange
        value={range}
        options={copy.dateRanges}
        onChange={setRange}
        className="mt-3"
      />

      <BusinessMetricGrid
        cells={customerMetrics.map(metric => ({
          label: metric.label,
          value: metric.value,
          note: metric.delta,
          noteIcon: metric.delta.startsWith('-') ? 'trendingDown' : 'trendingUp',
          noteTone: metric.tone === 'brand' ? 'brand' : 'success',
          icon: metric.icon,
        }))}
        className="mt-3"
      />

      <BusinessPanel className="mt-3" title={copy.segmentsTitle} icon="group">
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText
            variant="caption"
            tone="secondary"
            className="min-w-0 flex-1"
            numberOfLines={2}
          >
            {copy.segmentsSubtitle}
          </VemtapText>
          <BusinessStatusPill label={copy.segmentsBadge} tone="neutral" />
        </View>
        <View className="gap-2">
          {customerValueSegments.map(segment => (
            <BusinessAnalyticsRow
              key={segment.id}
              title={segment.name}
              subtitle={segment.count}
              icon={segment.icon}
              trailing={segment.share}
              trailingTone="brand"
              onPress={() => onOpenSegment?.(segment.id)}
            />
          ))}
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.topCustomersTitle}
        icon="starFilled"
        badge={String(topCustomers.length)}
        badgeTone="neutral"
      >
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {copy.topCustomersSubtitle}
        </VemtapText>
        <View className="gap-2">
          {topCustomers.map(customer => (
            <BusinessAnalyticsRow
              key={customer.id}
              title={customer.name}
              subtitle={customer.visits}
              leading={
                <BusinessInitialsAvatar
                  initials={customer.initials}
                  size="sm"
                  tone="neutral"
                />
              }
              badge={customerTierLabel[customer.tier]}
              badgeTone={customerTierTone[customer.tier]}
              trailing={customer.spend}
              onPress={() => onOpenCustomer?.(customer.id)}
            />
          ))}
        </View>
        <View className="flex-row justify-end">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.topCustomersAction}
            onPress={onViewAllCustomers}
            className="min-h-10 flex-row items-center gap-1 px-2"
          >
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-primary"
              numberOfLines={1}
            >
              {copy.topCustomersAction}
            </VemtapText>
            <Icon name="forward" size={16} color={colors.primary} />
          </Pressable>
        </View>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.heatmapTitle} icon="radar">
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {copy.heatmapSubtitle}
        </VemtapText>
        <BusinessHeatmap
          columns={customerHeatmap.columns}
          rows={customerHeatmap.rows}
          className="mt-1"
        />
        <View className="mt-1 flex-row items-center justify-end gap-1.5">
          <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
            {copy.heatmapLegendLow}
          </VemtapText>
          {(['lowest', 'low', 'mid', 'high', 'peak'] as const).map(level => (
            <View key={level} className={`h-3 w-6 rounded ${levelSurface[level]}`} />
          ))}
          <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
            {copy.heatmapLegendHigh}
          </VemtapText>
        </View>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.growthTitle} icon="trendingUp">
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {copy.growthSubtitle}
        </VemtapText>
        <View className="mt-1 h-36 flex-row items-end justify-between gap-2">
          {customerGrowthSeries.map(point => {
            const total = point.newValue + point.returningValue;
            return (
              <View key={point.label} className="flex-1 items-center gap-1">
                <View className="h-[100px] w-full justify-end">
                  <View
                    className="w-full overflow-hidden rounded-t bg-surface-container"
                    style={{ height: (point.returningValue / maxGrowth) * 100 }}
                  />
                  <View
                    className="w-full bg-primary"
                    style={{ height: (point.newValue / maxGrowth) * 100 }}
                  />
                </View>
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {point.label}
                </VemtapText>
                <VemtapText
                  variant="micro"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {String(total)}
                </VemtapText>
              </View>
            );
          })}
        </View>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1.5">
            <View className="h-2.5 w-2.5 rounded bg-primary" />
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.growthNew}
            </VemtapText>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="h-2.5 w-2.5 rounded bg-surface-container-high" />
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.growthReturning}
            </VemtapText>
          </View>
        </View>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.insightsTitle} icon="autoAwesome">
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {copy.insightsSubtitle}
        </VemtapText>
        <View className="gap-2">
          {customerInsights.map(insight => (
            <BusinessInsightCard
              key={insight.id}
              title={insight.title}
              body={insight.body}
              icon={insight.icon}
              cta={insight.cta}
              onCtaPress={insight.id === 'loyalty' ? onOpenLoyalty : onCreateDeal}
            />
          ))}
        </View>
      </BusinessPanel>

      <View className="mt-3 flex-row items-center gap-1.5 rounded-field bg-surface-subtle p-2.5">
        <Icon name="schedule" size={14} color={colors.textTertiary} />
        <VemtapText
          variant="caption"
          tone="tertiary"
          className="min-w-0 flex-1"
          numberOfLines={2}
        >
          {copy.periodNote}
        </VemtapText>
      </View>
    </BusinessScreenLayout>
  );
}

const levelSurface: Record<string, string> = {
  lowest: 'bg-surface-container-low',
  low: 'bg-surface-container-high',
  mid: 'bg-surface-container',
  high: 'bg-secondary-container',
  peak: 'bg-primary-container',
};
