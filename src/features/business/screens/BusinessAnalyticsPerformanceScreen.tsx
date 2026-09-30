import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessScreenLayout,
} from '@features/business/components/BusinessPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessAnalyticsNav,
  BusinessAnalyticsRow,
  BusinessCompareBars,
  BusinessDateRange,
  BusinessMetricGrid,
} from '@features/business/components/BusinessAnalyticsPrimitives';
import { BusinessInitialsAvatar } from '@features/business/components/BusinessPosPrimitives';
import {
  businessPerformanceNavTabs,
  hourlyVolume,
  performanceMetrics,
  revenueChannels,
  revenueSeries,
  teamPerformance,
  topPerformingItems,
} from '@features/business/data/businessAnalyticsData';

const copy = strings.businessAnalyticsPerformance;

export interface BusinessAnalyticsPerformanceScreenProps {
  onBack?: () => void;
  onMoreOptions?: () => void;
  onOpenTab?: (tabKey: string) => void;
  onSwitchReport?: () => void;
  onOpenItem?: (itemId: string) => void;
  onOpenStaff?: (staffId: string) => void;
}

/**
 * Business performance: revenue/orders/AOV/redemption KPIs, revenue-over-time
 * against the previous period, channel split, top items, hour-of-day volume
 * and per-team results.
 */
export function BusinessAnalyticsPerformanceScreen({
  onBack,
  onMoreOptions,
  onOpenTab,
  onSwitchReport,
  onOpenItem,
  onOpenStaff,
}: BusinessAnalyticsPerformanceScreenProps) {
  const [tab, setTab] = useState<string>(businessPerformanceNavTabs[0].key);
  const [range, setRange] = useState<string>(copy.dateRanges[2]);
  const maxRevenue = Math.max(...revenueSeries.map(point => point.value));
  const maxHourly = Math.max(...hourlyVolume.map(point => point.value));

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
            label={copy.switchCta}
            labelVariant="labelMd"
            onPress={onSwitchReport}
            leftIcon={<Icon name="swapHoriz" size={18} color={colors.surface} />}
          />
          <VemtapText variant="caption" tone="secondary" className="text-center">
            {copy.switchHint}
          </VemtapText>
        </BusinessActionDock>
      }
    >
      <BusinessAnalyticsNav
        tabs={businessPerformanceNavTabs}
        value={tab}
        onChange={next => {
          setTab(next);
          onOpenTab?.(next);
        }}
        className="-mx-6"
      />

      <BusinessDateRange
        value={range}
        options={copy.dateRanges}
        onChange={setRange}
        className="mt-3"
      />

      <BusinessMetricGrid
        cells={performanceMetrics.map(metric => ({
          label: metric.label,
          value: metric.value,
          note: metric.delta,
          noteIcon: 'trendingUp',
          noteTone: 'success',
          icon: metric.icon,
        }))}
        className="mt-3"
      />

      <BusinessPanel className="mt-3" title={copy.revenueChartTitle} icon="insights">
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {copy.revenueChartSubtitle}
        </VemtapText>
        <View className="mt-1 h-44 justify-end">
          {revenueSeries.map((point, index) => (
            <View
              key={point.label}
              accessibilityRole="image"
              accessibilityLabel={`${point.label}: ${point.value}`}
              className="flex-row items-center gap-2"
            >
              <VemtapText
                variant="micro"
                tone="tertiary"
                numberOfLines={1}
                className="w-7 shrink-0"
              >
                {point.label}
              </VemtapText>
              <View className="min-w-0 flex-1 gap-0.5">
                <View
                  className="h-2.5 rounded-full bg-primary"
                  style={{ width: `${(point.value / maxRevenue) * 100}%` }}
                />
                <View
                  className="h-1.5 rounded-full bg-surface-container-high"
                  style={{ width: `${(point.previous / maxRevenue) * 100}%` }}
                />
              </View>
              <VemtapText
                variant="micro"
                className="w-12 shrink-0 text-right"
                numberOfLines={1}
              >
                {`${index + 1}`}
              </VemtapText>
            </View>
          ))}
        </View>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1.5">
            <View className="h-2.5 w-4 rounded-full bg-primary" />
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {range}
            </VemtapText>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="h-1.5 w-4 rounded-full bg-surface-container-high" />
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.switchHint}
            </VemtapText>
          </View>
        </View>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.channelTitle} icon="share">
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {copy.channelSubtitle}
        </VemtapText>
        <BusinessCompareBars
          rows={revenueChannels.map(channel => ({
            id: channel.id,
            label: channel.label,
            value: channel.value,
            percent: channel.percent,
          }))}
          variant="titled"
        />
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.topProductsTitle}
        icon="trophy"
        badge={String(topPerformingItems.length)}
        badgeTone="neutral"
      >
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {copy.topProductsSubtitle}
        </VemtapText>
        <View className="gap-2">
          {topPerformingItems.map((item, index) => (
            <BusinessAnalyticsRow
              key={item.id}
              title={item.name}
              subtitle={item.meta}
              leading={
                <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-tint">
                  <VemtapText variant="micro" className="font-sans-bold text-primary">
                    {String(index + 1)}
                  </VemtapText>
                </View>
              }
              trailing={item.value}
              onPress={() => onOpenItem?.(item.id)}
            />
          ))}
        </View>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.hourlyTitle} icon="schedule">
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {copy.hourlySubtitle}
        </VemtapText>
        <View className="mt-1 h-28 flex-row items-end justify-between gap-1.5">
          {hourlyVolume.map(point => (
            <View key={point.label} className="flex-1 items-center gap-1">
              <View
                className="w-full rounded-t bg-secondary"
                style={{ height: Math.max(6, (point.value / maxHourly) * 84) }}
              />
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {point.label}
              </VemtapText>
            </View>
          ))}
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.staffTitle}
        icon="accountCircle"
        badge={String(teamPerformance.length)}
        badgeTone="neutral"
      >
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {copy.staffSubtitle}
        </VemtapText>
        <View className="flex-row px-1">
          <VemtapText
            variant="micro"
            tone="tertiary"
            className="min-w-0 flex-1"
            numberOfLines={1}
          >
            {copy.staffOrders}
          </VemtapText>
          <VemtapText
            variant="micro"
            tone="tertiary"
            className="w-24 text-right"
            numberOfLines={1}
          >
            {copy.staffSales}
          </VemtapText>
        </View>
        <View className="gap-2">
          {teamPerformance.map(member => (
            <BusinessAnalyticsRow
              key={member.id}
              title={member.name}
              subtitle={member.role}
              leading={
                <BusinessInitialsAvatar
                  initials={member.name
                    .split(' ')
                    .map(part => part[0])
                    .join('')
                    .slice(0, 2)}
                  size="sm"
                  tone="brand"
                />
              }
              trailing={`${member.orders} · ${member.sales}`}
              onPress={() => onOpenStaff?.(member.id)}
            />
          ))}
        </View>
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}
