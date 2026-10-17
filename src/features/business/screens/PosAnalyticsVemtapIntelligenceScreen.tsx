import React from 'react';
import { View } from 'react-native';
import { EmptyState } from '@components/shared';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { BusinessAnalyticsShell } from '@features/business/components/BusinessAnalyticsShell';
import {
  BusinessAnalyticsRow,
  BusinessCompareBars,
  BusinessMetricGrid,
  BusinessSectionHeader,
} from '@features/business/components/BusinessAnalyticsPrimitives';
import {
  BusinessLinkRow,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import type { PosAnalyticsView } from '@features/business/utils/analyticsMappers';

const copy = strings.businessIntelligence.pos;

export interface PosAnalyticsVemtapIntelligenceScreenProps {
  view?: PosAnalyticsView;
  isError?: boolean;
  onRetry?: () => void;
  range?: string;
  onBack?: () => void;
  onMoreOptions?: () => void;
  onTabChange?: (tabKey: string) => void;
  onRangeChange?: (value: string) => void;
  onOpenFilters?: () => void;
  onExport?: () => void;
  onOpenTillLedger?: () => void;
  onOpenItem?: (itemName: string) => void;
}

/**
 * POS Analytics — VEMTAP Intelligence.
 * stitch_vemtap_mobile_app_design/pos_analytics_vemtap_intelligence
 */
export function PosAnalyticsVemtapIntelligenceScreen({
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
  onOpenTillLedger,
  onOpenItem,
}: PosAnalyticsVemtapIntelligenceScreenProps) {
  const maxRhythm = Math.max(1, ...(view?.rhythm ?? []).map(slot => slot.value));

  return (
    <BusinessAnalyticsShell
      title={copy.title}
      tab="pos"
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
          <View className="mb-3 min-w-0">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.sync}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {view.syncMeta}
            </VemtapText>
          </View>
        ) : null
      }
    >
      {view ? (
        <>
          <View className="mt-3 flex-row items-center justify-between gap-2">
            <VemtapText
              variant="headingSm"
              className="font-sans-semibold text-heading-sm"
            >
              {copy.overviewTitle}
            </VemtapText>
          </View>

          <View className="mt-3">
            <BusinessMetricGrid
              columns={3}
              cells={view.kpis.slice(0, 3).map(kpi => ({
                label: kpi.label,
                value: kpi.value,
                note: kpi.note,
                noteTone: 'brand' as const,
              }))}
            />
            <View className="mt-2">
              <BusinessMetricGrid
                columns={3}
                cells={view.kpis.slice(3).map(kpi => ({
                  label: kpi.label,
                  value: kpi.value,
                  note: kpi.note,
                  noteTone: 'success' as const,
                }))}
              />
            </View>
          </View>

          {view.isEmpty ? (
            <EmptyState
              className="mt-4"
              icon="pointOfSale"
              variant="contained"
              title={copy.empty.title}
              description={copy.empty.body}
            />
          ) : (
            <>
              <View className="mt-4">
                <BusinessPanel className="gap-3">
                  <BusinessSectionHeader
                    title={copy.rhythmTitle}
                    meta={copy.rhythmSubtitle}
                    icon="timer"
                  />
                  <View className="h-28 flex-row items-end gap-1">
                    {view.rhythm.map(slot => (
                      <View key={slot.id} className="min-w-0 flex-1 items-center gap-1">
                        <View
                          className={
                            slot.badge
                              ? 'w-full rounded-t-md bg-primary'
                              : 'w-full rounded-t-md bg-primary-container'
                          }
                          style={{
                            height: `${slot.value ? Math.max(6, (slot.value / maxRhythm) * 100) : 2}%`,
                          }}
                        />
                        <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                          {slot.label}
                        </VemtapText>
                      </View>
                    ))}
                  </View>
                  <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
                    {view.peaks.map((peak, index) => (
                      <VemtapText
                        key={peak}
                        variant="micro"
                        className={
                          index === 0
                            ? 'font-sans-semibold text-primary'
                            : 'font-sans-semibold text-badge-discount-text'
                        }
                      >
                        {peak}
                      </VemtapText>
                    ))}
                  </View>
                </BusinessPanel>
              </View>

              <View className="mt-4 gap-3">
                <BusinessSectionHeader title={copy.tenderTitle} meta={copy.tenderNote} />
                <BusinessCompareBars rows={view.tenders} variant="segmented" />
                <View className="gap-2">
                  {view.tenderRows.map(row => (
                    <View
                      key={row.id}
                      className="flex-row items-center justify-between gap-3 rounded-field bg-surface-subtle p-2.5"
                    >
                      <VemtapText
                        variant="caption"
                        tone="secondary"
                        className="min-w-0 flex-1"
                        numberOfLines={1}
                      >
                        {row.label}
                      </VemtapText>
                      <View className="shrink-0 items-end">
                        <VemtapText variant="labelSm" className="font-sans-semibold">
                          {row.amount}
                        </VemtapText>
                        <VemtapText variant="micro" tone="tertiary">
                          {row.value}
                        </VemtapText>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View className="mt-4 gap-3">
                <BusinessSectionHeader
                  title={copy.itemsTitle}
                  meta={copy.itemsSubtitle}
                />
                {view.items.map(item => (
                  <BusinessAnalyticsRow
                    key={item.id}
                    title={item.name}
                    subtitle={item.sold}
                    trailing={item.amount}
                    trailingTone="brand"
                    onPress={() => onOpenItem?.(item.name)}
                  />
                ))}
              </View>

              <View className="mt-4 gap-3">
                <BusinessSectionHeader
                  title={copy.auditTitle}
                  meta={copy.auditNote}
                  icon="verifiedUser"
                />
                {view.cashiers.map(cashier => (
                  <BusinessAnalyticsRow
                    key={cashier.id}
                    title={cashier.name}
                    subtitle={cashier.value}
                    badge={cashier.till}
                    icon="person"
                    onPress={onOpenTillLedger}
                  />
                ))}
              </View>
            </>
          )}

          <View className="mt-4">
            <BusinessLinkRow label={copy.cta} onPress={onOpenTillLedger} />
          </View>
        </>
      ) : null}
    </BusinessAnalyticsShell>
  );
}
