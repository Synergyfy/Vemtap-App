import React, { useState } from 'react';
import { View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { BusinessAnalyticsShell } from '@features/business/components/BusinessAnalyticsShell';
import {
  BusinessInsightCard,
  BusinessMetricGrid,
  BusinessSectionHeader,
} from '@features/business/components/BusinessAnalyticsPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';

const copy = strings.businessIntelligence.deals;

export interface DealsAnalyticsVemtapIntelligenceScreenProps {
  onBack?: () => void;
  onMoreOptions?: () => void;
  onTabChange?: (tabKey: string) => void;
  onRangeChange?: (value: string) => void;
  onOpenFilters?: () => void;
  onExport?: () => void;
  onOpenDeal?: (dealId: string) => void;
  onOpenBoost?: () => void;
}

/**
 * Deals Analytics — VEMTAP Intelligence.
 * stitch_vemtap_mobile_app_design/deals_analytics_vemtap_intelligence
 */
export function DealsAnalyticsVemtapIntelligenceScreen({
  onBack,
  onMoreOptions,
  onTabChange,
  onRangeChange,
  onOpenFilters,
  onExport,
  onOpenDeal,
  onOpenBoost,
}: DealsAnalyticsVemtapIntelligenceScreenProps) {
  const [tab, setTab] = useState('deals');
  const [range, setRange] = useState<string>(strings.businessIntelligence.dateRanges[2]);

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
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.eyebrow}
          </VemtapText>
        </View>
      }
    >
      <View className="mt-3">
        <BusinessMetricGrid
          columns={2}
          cells={copy.kpis.map(kpi => ({
            label: kpi.label,
            value: kpi.value,
            note: kpi.note,
            noteTone: 'brand' as const,
          }))}
        />
      </View>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <VemtapText variant="headingSm" className="font-sans-semibold text-heading-sm">
          {copy.perDealTitle}
        </VemtapText>
        <VemtapText variant="caption" tone="tertiary">
          {copy.perDealRange}
        </VemtapText>
      </View>

      <View className="mt-3 gap-3">
        {copy.deals.map(deal => (
          <View
            key={deal.id}
            className="gap-3 rounded-card bg-surface-container-lowest p-4 shadow-sm"
          >
            <View className="flex-row items-start justify-between gap-2">
              <View className="min-w-0 flex-1 gap-1">
                <View className="flex-row flex-wrap items-center gap-1.5">
                  <View className="rounded-full bg-primary px-2 py-0.5">
                    <VemtapText
                      variant="micro"
                      className="font-sans-semibold text-primary-foreground"
                    >
                      {deal.badge}
                    </VemtapText>
                  </View>
                  <View className="rounded-full bg-surface-container px-2 py-0.5">
                    <VemtapText variant="micro" tone="secondary">
                      {deal.badge2}
                    </VemtapText>
                  </View>
                </View>
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {deal.name}
                </VemtapText>
              </View>
              <View className="shrink-0 items-end">
                <VemtapText variant="caption" tone="tertiary">
                  {copy.claimRateLabel}
                </VemtapText>
                <VemtapText variant="headingSm" className="font-sans-bold text-primary">
                  {deal.claimRate}
                </VemtapText>
              </View>
            </View>

            <View className="flex-row gap-2">
              <View className="min-w-0 flex-1 gap-0.5 rounded-field bg-surface-subtle p-2.5">
                <VemtapText variant="caption" tone="tertiary">
                  {copy.viewsLabel}
                </VemtapText>
                <VemtapText variant="labelMd" className="font-sans-semibold">
                  {deal.views}
                </VemtapText>
              </View>
              <View className="min-w-0 flex-1 gap-0.5 rounded-field bg-surface-subtle p-2.5">
                <VemtapText variant="caption" tone="tertiary">
                  {copy.claimsLabel}
                </VemtapText>
                <VemtapText variant="labelMd" className="font-sans-semibold">
                  {deal.claims}
                </VemtapText>
              </View>
              <View className="min-w-0 flex-1 gap-0.5 rounded-field bg-surface-subtle p-2.5">
                <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                  {copy.basketLabel}
                </VemtapText>
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {deal.basket}
                </VemtapText>
              </View>
            </View>

            <View className="flex-row flex-wrap items-center gap-1.5">
              {deal.opportunities.map((label, index) => (
                <View
                  key={label}
                  className="flex-row items-center gap-1 rounded-full bg-surface-container px-2 py-0.5"
                >
                  <VemtapText variant="micro" tone="tertiary">
                    {label}
                  </VemtapText>
                  <VemtapText variant="micro" className="font-sans-semibold">
                    {deal.opportunityCounts[index]}
                  </VemtapText>
                </View>
              ))}
            </View>

            {deal.opportunities[0] === 'Views' && deal.id === 'cocktails' ? (
              <View className="rounded-lg bg-tertiary-fixed p-2.5">
                <VemtapText
                  variant="caption"
                  className="font-sans-medium text-tertiary-container"
                >
                  {copy.cocktailsNote}
                </VemtapText>
              </View>
            ) : null}
          </View>
        ))}
      </View>

      <View className="mt-4">
        <BusinessPanel className="gap-3">
          <BusinessSectionHeader
            title={copy.matrixTitle}
            meta={copy.matrixSubtitle}
            icon="insights"
          />
          {copy.matrix.map(row => (
            <View key={row.id} className="gap-1.5 rounded-field bg-surface-subtle p-2.5">
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {row.label}
              </VemtapText>
              <View className="flex-row flex-wrap items-center gap-x-3 gap-y-0.5">
                <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                  {row.basket}
                </VemtapText>
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {row.views}
                </VemtapText>
                <VemtapText variant="micro" tone="brand" numberOfLines={1}>
                  {row.claims}
                </VemtapText>
              </View>
            </View>
          ))}
        </BusinessPanel>
      </View>

      <View className="mt-4 gap-3">
        <BusinessSectionHeader title={copy.funnelTitle} meta={copy.funnelSubtitle} />
        <View className="gap-2">
          {copy.funnel.map(stage => (
            <View key={stage.id} className="gap-1">
              <View className="flex-row items-center justify-between gap-2">
                <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                  {stage.label}
                </VemtapText>
                <VemtapText variant="labelSm" className="shrink-0 font-sans-semibold">
                  {stage.value}
                </VemtapText>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-surface-container">
                <View
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${stage.percent}%` }}
                />
              </View>
            </View>
          ))}
        </View>
        <View className="self-start rounded-full bg-badge-discount-bg px-2 py-0.5">
          <VemtapText
            variant="micro"
            className="font-sans-semibold text-badge-discount-text"
          >
            {copy.funnelCompletion}
          </VemtapText>
        </View>
      </View>

      <View className="mt-4 gap-3">
        <BusinessSectionHeader title={copy.boostTitle} badge={copy.boostActive} />
        <View className="rounded-card bg-surface-container-lowest p-4 shadow-sm">
          <View className="gap-2">
            {copy.boost.map(row => (
              <View key={row.id} className="flex-row items-center justify-between gap-3">
                <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                  {row.label}
                </VemtapText>
                <VemtapText
                  variant="labelSm"
                  className="shrink-0 font-sans-semibold"
                  numberOfLines={1}
                >
                  {row.value}
                </VemtapText>
              </View>
            ))}
          </View>
        </View>
        <BusinessInsightCard
          title={copy.boostTitle}
          body={copy.boost[1].value}
          icon="bolt"
          cta={copy.boostCta}
          onCtaPress={onOpenBoost}
        />
        <View className="flex-row items-center gap-2 rounded-card bg-surface-container-low p-3">
          <Icon name="trendingUp" size={18} color={undefined} />
          <VemtapText
            variant="caption"
            tone="secondary"
            className="min-w-0 flex-1"
            onPress={() => onOpenDeal?.(copy.deals[0].id)}
          >
            {copy.deals[0].name} \u00b7 {copy.deals[0].claimRate}
          </VemtapText>
        </View>
      </View>
    </BusinessAnalyticsShell>
  );
}
