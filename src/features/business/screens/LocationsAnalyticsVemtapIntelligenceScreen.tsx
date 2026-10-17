import React from 'react';
import { View } from 'react-native';
import { EmptyState } from '@components/shared';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { BusinessAnalyticsShell } from '@features/business/components/BusinessAnalyticsShell';
import {
  BusinessCompareBars,
  BusinessHeatmap,
  BusinessInsightCard,
  BusinessMetricGrid,
  BusinessSectionHeader,
} from '@features/business/components/BusinessAnalyticsPrimitives';
import {
  BusinessChipScroller,
  BusinessPanel,
  BusinessToggleChip,
} from '@features/business/components/BusinessOpsPrimitives';
import type { LocationsAnalyticsView } from '@features/business/utils/analyticsMappers';

const copy = strings.businessIntelligence.locations;

export interface LocationsAnalyticsVemtapIntelligenceScreenProps {
  view?: LocationsAnalyticsView;
  isError?: boolean;
  onRetry?: () => void;
  range?: string;
  /** Branch the figures are scoped to; `null` for every branch. */
  branchId?: string | null;
  onSelectBranch?: (branchId: string | null) => void;
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
  view,
  isError,
  onRetry,
  range = strings.businessIntelligence.dateRanges[2],
  branchId = null,
  onSelectBranch,
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
  return (
    <BusinessAnalyticsShell
      title={copy.title}
      tab="locations"
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
        view && view.scopes.length > 2 ? (
          <View className="mb-3">
            <BusinessChipScroller>
              {view.scopes.map(scope => (
                <BusinessToggleChip
                  key={scope.id ?? 'all'}
                  label={scope.label}
                  icon="storefront"
                  selected={scope.id === branchId}
                  onPress={() => onSelectBranch?.(scope.id)}
                />
              ))}
            </BusinessChipScroller>
          </View>
        ) : null
      }
    >
      {view ? (
        <>
          <View className="mt-3 flex-row items-center gap-3 rounded-card bg-primary p-4 shadow-md">
            <View className="min-w-0 flex-1 gap-1">
              <VemtapText variant="caption" className="text-primary-foreground">
                {copy.networkTitle}
              </VemtapText>
              <VemtapText
                variant="headingLg"
                className="font-sans-bold text-primary-foreground"
                numberOfLines={1}
              >
                {view.network.value}
              </VemtapText>
              <VemtapText variant="micro" className="text-primary-foreground">
                {view.network.note}
              </VemtapText>
            </View>
          </View>

          <View className="mt-3">
            <BusinessMetricGrid
              columns={3}
              cells={view.ribbon.map(item => ({
                label: item.label,
                value: item.value,
                icon: item.icon,
              }))}
            />
          </View>

          {view.scorecards.length === 0 ? (
            <EmptyState
              className="mt-4"
              icon="storefront"
              variant="contained"
              title={copy.empty.title}
              description={copy.empty.body}
            />
          ) : null}

          {view.share.length > 1 ? (
            <View className="mt-4 gap-3">
              <BusinessSectionHeader title={copy.shareTitle} />
              <BusinessCompareBars rows={view.share} />
            </View>
          ) : null}

          <View className="mt-4 gap-3">
            <BusinessSectionHeader
              title={copy.scorecardsTitle}
              meta={copy.scorecardsSubtitle}
            />
            {view.scorecards.map(branch => (
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
                      accessibilityRole="button"
                      onPress={() => onOpenBranch?.(branch.id)}
                    >
                      {branch.name}
                    </VemtapText>
                    {branch.meta ? (
                      <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                        {branch.meta}
                      </VemtapText>
                    ) : null}
                  </View>
                  <View className="shrink-0 items-end gap-0.5">
                    {branch.badge ? (
                      <View className="rounded-full bg-primary px-2 py-0.5">
                        <VemtapText
                          variant="micro"
                          className="font-sans-semibold text-primary-foreground"
                        >
                          {branch.badge}
                        </VemtapText>
                      </View>
                    ) : null}
                    <VemtapText variant="micro" tone="tertiary">
                      {branch.share}
                    </VemtapText>
                  </View>
                </View>

                <View className="flex-row items-center justify-between gap-3 rounded-field bg-surface-subtle p-2.5">
                  <VemtapText variant="caption" tone="secondary">
                    {copy.revenueLabel}
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

          {view.channels.length ? (
            <View className="mt-4 gap-3">
              <BusinessSectionHeader
                title={copy.channelTitle}
                meta={copy.channelSubtitle}
              />
              <BusinessCompareBars rows={view.channels} variant="segmented" height="sm" />
            </View>
          ) : null}

          <View className="mt-4">
            <BusinessPanel className="gap-3">
              <BusinessSectionHeader
                title={copy.heatmapTitle}
                meta={copy.heatmapSubtitle}
                icon="timer"
              />
              <BusinessHeatmap columns={view.heatmap.columns} rows={view.heatmap.rows} />
            </BusinessPanel>
          </View>

          {view.insights.length ? (
            <View className="mt-4 gap-3">
              {view.insights.map(insight => (
                <BusinessInsightCard
                  key={insight.id}
                  title={insight.title}
                  body={insight.body}
                  icon={insight.id === 'busiest' ? 'fire' : 'hourglass'}
                  cta={insight.id === 'quiet' ? copy.quietCta : undefined}
                  onCtaPress={insight.id === 'quiet' ? onBoostBranch : undefined}
                />
              ))}
            </View>
          ) : null}

          <View className="mt-4">
            <BusinessInsightCard
              title={copy.cta}
              body={copy.ctaBody}
              icon="storefront"
              cta={copy.ctaAction}
              onCtaPress={onManageLocations}
            />
          </View>
        </>
      ) : null}
    </BusinessAnalyticsShell>
  );
}
