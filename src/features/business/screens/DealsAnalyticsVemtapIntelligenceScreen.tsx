import React from 'react';
import { EmptyState } from '@components/shared';
import { Pressable, View } from 'react-native';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { BusinessAnalyticsShell } from '@features/business/components/BusinessAnalyticsShell';
import {
  BusinessInsightCard,
  BusinessMetricGrid,
  BusinessSectionHeader,
} from '@features/business/components/BusinessAnalyticsPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import type { DealsAnalyticsView } from '@features/business/utils/analyticsMappers';

const copy = strings.businessIntelligence.deals;

export interface DealsAnalyticsVemtapIntelligenceScreenProps {
  view?: DealsAnalyticsView;
  isError?: boolean;
  onRetry?: () => void;
  range?: string;
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
  onOpenDeal,
  onOpenBoost,
}: DealsAnalyticsVemtapIntelligenceScreenProps) {
  return (
    <BusinessAnalyticsShell
      title={copy.title}
      tab="deals"
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
        <View className="mb-3">
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.eyebrow}
          </VemtapText>
        </View>
      }
    >
      {view ? (
        <>
          <View className="mt-3">
            <BusinessMetricGrid
              columns={2}
              cells={view.kpis.map(kpi => ({
                label: kpi.label,
                value: kpi.value,
                note: kpi.note,
                noteTone: 'brand' as const,
              }))}
            />
          </View>

          <View className="mt-4 flex-row items-center justify-between gap-2">
            <VemtapText
              variant="headingSm"
              className="font-sans-semibold text-heading-sm"
            >
              {copy.perDealTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary">
              {copy.perDealRange}
            </VemtapText>
          </View>

          {view.deals.length === 0 ? (
            <EmptyState
              className="mt-3"
              icon="localOffer"
              variant="contained"
              title={copy.empty.title}
              description={copy.empty.body}
            />
          ) : null}

          <View className="mt-3 gap-3">
            {view.deals.map(deal => (
              <Pressable
                key={deal.id}
                accessibilityRole="button"
                accessibilityLabel={deal.name}
                onPress={() => onOpenDeal?.(deal.id)}
                className="gap-3 rounded-card bg-surface-container-lowest p-4 shadow-sm active:bg-surface-subtle"
              >
                <View className="flex-row items-start justify-between gap-2">
                  <View className="min-w-0 flex-1 gap-1">
                    <View className="flex-row flex-wrap items-center gap-1.5">
                      {deal.badge ? (
                        <View className="rounded-full bg-primary px-2 py-0.5">
                          <VemtapText
                            variant="micro"
                            className="font-sans-semibold text-primary-foreground"
                          >
                            {deal.badge}
                          </VemtapText>
                        </View>
                      ) : null}
                      <View
                        className={
                          deal.live
                            ? 'rounded-full bg-badge-discount-bg px-2 py-0.5'
                            : 'rounded-full bg-surface-container px-2 py-0.5'
                        }
                      >
                        <VemtapText
                          variant="micro"
                          className={
                            deal.live ? 'text-badge-discount-text' : 'text-text-secondary'
                          }
                        >
                          {deal.status}
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
                    <VemtapText
                      variant="headingSm"
                      className="font-sans-bold text-primary"
                    >
                      {deal.claimRate}
                    </VemtapText>
                  </View>
                </View>

                <View className="flex-row gap-2">
                  {[
                    { id: 'views', label: copy.viewsLabel, value: deal.views },
                    { id: 'claims', label: copy.claimsLabel, value: deal.claims },
                    { id: 'basket', label: copy.basketLabel, value: deal.basket },
                  ].map(cell => (
                    <View
                      key={cell.id}
                      className="min-w-0 flex-1 gap-0.5 rounded-field bg-surface-subtle p-2.5"
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

                <View className="flex-row flex-wrap items-center gap-1.5">
                  {deal.opportunities.map(opportunity => (
                    <View
                      key={opportunity.label}
                      className="flex-row items-center gap-1 rounded-full bg-surface-container px-2 py-0.5"
                    >
                      <VemtapText variant="micro" tone="tertiary">
                        {opportunity.label}
                      </VemtapText>
                      <VemtapText variant="micro" className="font-sans-semibold">
                        {opportunity.value}
                      </VemtapText>
                    </View>
                  ))}
                </View>

                {deal.belowAverage ? (
                  <View className="rounded-lg bg-tertiary-fixed p-2.5">
                    <VemtapText
                      variant="caption"
                      className="font-sans-medium text-tertiary-container"
                    >
                      {copy.lowRateNote}
                    </VemtapText>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>

          {view.matrix.length > 1 ? (
            <View className="mt-4">
              <BusinessPanel className="gap-3">
                <BusinessSectionHeader
                  title={copy.matrixTitle}
                  meta={copy.matrixSubtitle}
                  icon="insights"
                />
                {view.matrix.map(row => (
                  <View
                    key={row.id}
                    className="gap-1.5 rounded-field bg-surface-subtle p-2.5"
                  >
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
          ) : null}

          <View className="mt-4 gap-3">
            <BusinessSectionHeader title={copy.funnelTitle} meta={copy.funnelSubtitle} />
            <View className="gap-2">
              {view.funnel.map(stage => (
                <View key={stage.id} className="gap-1">
                  <View className="flex-row items-center justify-between gap-2">
                    <VemtapText
                      variant="caption"
                      tone="secondary"
                      className="min-w-0 flex-1"
                    >
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
                {view.funnelCompletion}
              </VemtapText>
            </View>
          </View>

          <View className="mt-4 gap-3">
            <BusinessSectionHeader
              title={copy.boostTitle}
              badge={view.boost ? copy.boostActive : copy.boostNone}
            />
            {view.boost ? (
              <View className="rounded-card bg-surface-container-lowest p-4 shadow-sm">
                <View className="gap-2">
                  {view.boost.rows.map(row => (
                    <View
                      key={row.id}
                      className="flex-row items-center justify-between gap-3"
                    >
                      <VemtapText
                        variant="caption"
                        tone="secondary"
                        className="min-w-0 flex-1"
                      >
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
            ) : null}
            <BusinessInsightCard
              title={copy.boostTitle}
              body={view.boost ? view.boost.name : copy.boostNoneBody}
              icon="bolt"
              cta={copy.boostCta}
              onCtaPress={onOpenBoost}
            />
          </View>
        </>
      ) : null}
    </BusinessAnalyticsShell>
  );
}
