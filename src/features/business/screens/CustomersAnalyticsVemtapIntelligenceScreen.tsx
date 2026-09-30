import React, { useState } from 'react';
import { View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { BusinessAnalyticsShell } from '@features/business/components/BusinessAnalyticsShell';
import {
  BusinessCompareBars,
  BusinessInsightCard,
  BusinessMetricGrid,
  BusinessSectionHeader,
  type BusinessCompareRow,
} from '@features/business/components/BusinessAnalyticsPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';

const copy = strings.businessIntelligence.customers;

export interface CustomersAnalyticsVemtapIntelligenceScreenProps {
  onBack?: () => void;
  onMoreOptions?: () => void;
  onTabChange?: (tabKey: string) => void;
  onRangeChange?: (value: string) => void;
  onOpenFilters?: () => void;
  onExport?: () => void;
  onReengage?: () => void;
  onOpenSegment?: (segmentId: string) => void;
}

/**
 * Customers Analytics — VEMTAP Intelligence.
 * stitch_vemtap_mobile_app_design/customers_analytics_vemtap_intelligence
 */
export function CustomersAnalyticsVemtapIntelligenceScreen({
  onBack,
  onMoreOptions,
  onTabChange,
  onRangeChange,
  onOpenFilters,
  onExport,
  onReengage,
  onOpenSegment,
}: CustomersAnalyticsVemtapIntelligenceScreenProps) {
  const [tab, setTab] = useState('customers');
  const [range, setRange] = useState<string>(strings.businessIntelligence.dateRanges[2]);

  const channelRows: BusinessCompareRow[] = copy.channels.map(row => ({
    id: row.id,
    label: row.label,
    value: row.value,
    percent: row.percent,
  }));

  const maxGrowth = Math.max(
    ...copy.growth.map(point => Math.max(point.returning, point.new)),
  );

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
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.eyebrow}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.subtitle}
            </VemtapText>
          </View>
          <View className="shrink-0 flex-row items-center gap-1 rounded-full bg-badge-discount-bg px-2 py-0.5">
            <View className="h-1.5 w-1.5 rounded-full bg-badge-discount-text" />
            <VemtapText
              variant="micro"
              className="font-sans-semibold text-badge-discount-text"
            >
              {copy.sync}
            </VemtapText>
          </View>
        </View>
      }
    >
      <View className="mt-3 flex-row items-center justify-between gap-2">
        <VemtapText variant="headingSm" className="font-sans-semibold text-heading-sm">
          {copy.overviewTitle}
        </VemtapText>
        <VemtapText variant="caption" tone="tertiary">
          {copy.overviewRange}
        </VemtapText>
      </View>

      <View className="mt-3">
        <BusinessMetricGrid
          columns={2}
          cells={[
            {
              label: copy.total,
              value: copy.totalValue,
              note: copy.totalNote,
              noteTone: 'brand',
              icon: 'groupAdd',
            },
            {
              label: copy.active,
              value: copy.activeValue,
              note: copy.activeNote,
              noteTone: 'success',
              icon: 'bolt',
            },
          ]}
        />
        <View className="mt-2">
          <BusinessMetricGrid
            columns={2}
            cells={[
              { label: copy.newCustomers, value: copy.newValue, icon: 'personPin' },
              { label: copy.returning, value: copy.returningValue, icon: 'history' },
            ]}
          />
        </View>
      </View>

      <View className="mt-3">
        <BusinessPanel tone="tint" className="gap-2">
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1">
              <VemtapText variant="labelMd" className="font-sans-semibold">
                {copy.inactiveTitle}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {copy.inactiveBody}
              </VemtapText>
            </View>
            <View className="shrink-0">
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold text-primary"
                onPress={onReengage}
              >
                {copy.inactiveCta}
              </VemtapText>
            </View>
          </View>
        </BusinessPanel>
      </View>

      <View className="mt-4">
        <BusinessPanel className="gap-3">
          <BusinessSectionHeader
            title={copy.growthTitle}
            meta={copy.growthSubtitle}
            icon="trendingUp"
          />
          <View className="flex-row flex-wrap gap-2">
            {copy.growthLegend.map((legend, index) => (
              <View key={legend} className="flex-row items-center gap-1.5">
                <View
                  className={
                    index === 0
                      ? 'h-2 w-2 rounded-full bg-primary'
                      : 'h-2 w-2 rounded-full bg-surface-container-highest'
                  }
                />
                <VemtapText variant="micro" tone="secondary">
                  {legend}
                </VemtapText>
              </View>
            ))}
          </View>
          <View className="h-28 flex-row items-end gap-2">
            {copy.growth.map(point => (
              <View key={point.id} className="min-w-0 flex-1 items-center gap-1">
                <View className="w-full flex-1 justify-end gap-0.5">
                  <View
                    className="w-full rounded-t-sm bg-primary"
                    style={{ height: `${(point.returning / maxGrowth) * 100}%` }}
                  />
                  <View
                    className="w-full rounded-t-sm bg-surface-container-highest"
                    style={{ height: `${(point.new / maxGrowth) * 100}%` }}
                  />
                </View>
                <VemtapText variant="micro" tone="tertiary">
                  {point.label}
                </VemtapText>
              </View>
            ))}
          </View>
          <View className="rounded-lg bg-surface-subtle p-2.5">
            <VemtapText variant="caption" tone="secondary">
              {copy.growthCallout}
            </VemtapText>
          </View>
        </BusinessPanel>
      </View>

      <View className="mt-4">
        <BusinessPanel className="gap-2">
          <BusinessSectionHeader title={copy.touchpointsTitle} icon="nearMe" />
          <View className="flex-row flex-wrap gap-2">
            {copy.touchpoints.map(point => (
              <View
                key={point.id}
                className="min-w-[46%] flex-1 gap-0.5 rounded-field bg-surface-subtle p-2.5"
              >
                <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                  {point.label}
                </VemtapText>
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {point.value}
                </VemtapText>
              </View>
            ))}
          </View>
        </BusinessPanel>
      </View>

      <View className="mt-4 gap-3">
        <BusinessSectionHeader title={copy.channelsTitle} meta={copy.channelsSubtitle} />
        <BusinessCompareBars rows={channelRows} />
      </View>

      <View className="mt-4">
        <BusinessPanel className="gap-3">
          <BusinessSectionHeader title={copy.retentionTitle} icon="loyalty" />
          {copy.retention.map(row => (
            <View
              key={row.id}
              className="flex-row items-center justify-between gap-3 rounded-field bg-surface-subtle p-2.5"
            >
              <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                {row.label}
              </VemtapText>
              <VemtapText variant="labelSm" className="shrink-0 font-sans-semibold">
                {row.value}
              </VemtapText>
            </View>
          ))}
          <View className="self-start rounded-full bg-badge-discount-bg px-2 py-0.5">
            <VemtapText
              variant="micro"
              className="font-sans-semibold text-badge-discount-text"
            >
              {copy.frequencyBadge}
            </VemtapText>
          </View>
        </BusinessPanel>
      </View>

      <View className="mt-4 gap-3">
        <BusinessSectionHeader
          title={copy.segmentsTitle}
          meta={copy.segmentsSubtitle}
          badge={copy.segmentsCount}
        />
        {copy.segments.map(segment => (
          <View
            key={segment.id}
            className="flex-row items-center gap-3 rounded-card bg-surface-container-lowest p-3 shadow-sm"
          >
            <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-tint">
              <Icon name="groupAdd" size={18} color={undefined} />
            </View>
            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-1.5">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {segment.label}
                </VemtapText>
                {segment.badge ? (
                  <View className="rounded-full bg-primary px-1.5 py-0.5">
                    <VemtapText
                      variant="micro"
                      className="font-sans-semibold text-primary-foreground"
                    >
                      {segment.badge}
                    </VemtapText>
                  </View>
                ) : null}
              </View>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {segment.value}
              </VemtapText>
            </View>
            <Icon name="arrowForward" size={18} color={undefined} />
          </View>
        ))}
        <BusinessInsightCard
          title={copy.segmentsTitle}
          body={copy.segmentsSubtitle}
          icon="insights"
          cta={copy.cta}
          onCtaPress={() => onOpenSegment?.(copy.segments[0].id)}
        />
      </View>
    </BusinessAnalyticsShell>
  );
}
