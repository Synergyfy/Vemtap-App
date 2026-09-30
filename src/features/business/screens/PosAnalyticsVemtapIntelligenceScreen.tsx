import React, { useState } from 'react';
import { View } from 'react-native';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { BusinessAnalyticsShell } from '@features/business/components/BusinessAnalyticsShell';
import {
  BusinessAnalyticsRow,
  BusinessCompareBars,
  BusinessMetricGrid,
  BusinessSectionHeader,
  type BusinessCompareRow,
} from '@features/business/components/BusinessAnalyticsPrimitives';
import {
  BusinessLinkRow,
  BusinessPanel,
  BusinessToggleChip,
} from '@features/business/components/BusinessOpsPrimitives';

const copy = strings.businessIntelligence.pos;

export interface PosAnalyticsVemtapIntelligenceScreenProps {
  onBack?: () => void;
  onMoreOptions?: () => void;
  onTabChange?: (tabKey: string) => void;
  onRangeChange?: (value: string) => void;
  onOpenFilters?: () => void;
  onExport?: () => void;
  onOpenCadence?: (cadence: string) => void;
  onOpenTillLedger?: () => void;
  onOpenItem?: (itemId: string) => void;
}

/**
 * POS Analytics — VEMTAP Intelligence.
 * stitch_vemtap_mobile_app_design/pos_analytics_vemtap_intelligence
 */
export function PosAnalyticsVemtapIntelligenceScreen({
  onBack,
  onMoreOptions,
  onTabChange,
  onRangeChange,
  onOpenFilters,
  onExport,
  onOpenCadence,
  onOpenTillLedger,
  onOpenItem,
}: PosAnalyticsVemtapIntelligenceScreenProps) {
  const [tab, setTab] = useState('pos');
  const [range, setRange] = useState<string>(strings.businessIntelligence.dateRanges[2]);
  const [cadence, setCadence] = useState<string>(copy.cadence[0]);

  const tenderRows: BusinessCompareRow[] = copy.tenders.map(row => ({
    id: row.id,
    label: row.label,
    value: `${row.percent}%`,
    percent: row.percent,
  }));

  const maxRhythm = Math.max(...copy.rhythm.map(slot => slot.value));

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
              {copy.sync}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.syncMeta}
            </VemtapText>
          </View>
          <View className="shrink-0 flex-row items-center gap-1 rounded-full bg-badge-discount-bg px-2 py-0.5">
            <View className="h-1.5 w-1.5 rounded-full bg-badge-discount-text" />
            <VemtapText
              variant="micro"
              className="font-sans-semibold text-badge-discount-text"
            >
              {copy.updated}
            </VemtapText>
          </View>
        </View>
      }
    >
      <View className="mt-3 flex-row items-center justify-between gap-2">
        <VemtapText variant="headingSm" className="font-sans-semibold text-heading-sm">
          {copy.overviewTitle}
        </VemtapText>
      </View>

      <View className="mt-3">
        <BusinessMetricGrid
          columns={3}
          cells={copy.kpis.slice(0, 3).map(kpi => ({
            label: kpi.label,
            value: kpi.value,
            note: kpi.note,
            noteTone: 'brand' as const,
          }))}
        />
        <View className="mt-2">
          <BusinessMetricGrid
            columns={3}
            cells={copy.kpis.slice(3).map(kpi => ({
              label: kpi.label,
              value: kpi.value,
              note: kpi.note,
              noteTone: 'success' as const,
            }))}
          />
        </View>
      </View>

      <View className="mt-4">
        <BusinessPanel className="gap-3">
          <BusinessSectionHeader
            title={copy.rhythmTitle}
            meta={copy.rhythmSubtitle}
            icon="timer"
          />
          <View className="flex-row flex-wrap gap-1.5">
            {copy.cadence.map(option => (
              <BusinessToggleChip
                key={option}
                label={option}
                icon="timer"
                selected={option === cadence}
                onPress={() => {
                  setCadence(option);
                  onOpenCadence?.(option);
                }}
              />
            ))}
          </View>
          <View className="h-28 flex-row items-end gap-1.5">
            {copy.rhythm.map(slot => (
              <View key={slot.id} className="min-w-0 flex-1 items-center gap-1">
                <View
                  className="w-full rounded-t-md bg-primary"
                  style={{ height: `${Math.max(8, (slot.value / maxRhythm) * 100)}%` }}
                />
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {slot.label}
                </VemtapText>
              </View>
            ))}
          </View>
          <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
            <VemtapText variant="micro" className="font-sans-semibold text-primary">
              {copy.peak1}
            </VemtapText>
            <VemtapText
              variant="micro"
              className="font-sans-semibold text-badge-discount-text"
            >
              {copy.peak2}
            </VemtapText>
          </View>
        </BusinessPanel>
      </View>

      <View className="mt-4 gap-3">
        <BusinessSectionHeader title={copy.tenderTitle} meta={copy.tenderNote} />
        <BusinessCompareBars rows={tenderRows} variant="segmented" />
        <View className="gap-2">
          {copy.tenders.map(row => (
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
        <BusinessSectionHeader title={copy.itemsTitle} meta={copy.itemsSubtitle} />
        {copy.items.map(item => (
          <BusinessAnalyticsRow
            key={item.id}
            title={item.name}
            subtitle={item.sold}
            badge={item.badge}
            trailing={item.amount}
            trailingTone="brand"
            onPress={() => onOpenItem?.(item.id)}
          />
        ))}
      </View>

      <View className="mt-4 gap-3">
        <BusinessSectionHeader
          title={copy.auditTitle}
          meta={copy.auditNote}
          icon="verifiedUser"
        />
        {copy.audit.map(cashier => (
          <BusinessAnalyticsRow
            key={cashier.id}
            title={cashier.name}
            subtitle={cashier.value}
            badge={cashier.till}
            icon="person"
            onPress={onOpenTillLedger}
          />
        ))}
        <BusinessLinkRow
          label={copy.cta}
          onPress={() => onOpenItem?.(copy.items[0].id)}
        />
        <BusinessLinkRow label={copy.auditTitle} onPress={onOpenTillLedger} />
      </View>
    </BusinessAnalyticsShell>
  );
}
