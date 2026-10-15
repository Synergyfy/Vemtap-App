import React from 'react';
import { View, type RefreshControlProps } from 'react-native';
import { Button } from '@components/ui/Button';
import { VemtapText } from '@components/ui/Text';
import { EmptyState } from '@components/shared/EmptyState';
import { LoadingState } from '@components/shared/LoadingState';
import { strings } from '@constants/strings';
import type { DealLedgerPage, DealLedgerRow, DealLedgerStatus } from '@api/catalogueApi';
import {
  BusinessInlineAction,
  BusinessScreenLayout,
  BusinessStatusPill,
  type BusinessPillTone,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessScopePicker,
  BusinessSegmentTabs,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessLedgerRow } from '@features/business/components/BusinessLedgerRow';
import { formatNaira } from '@features/business/data/businessSetupData';
import { calendarDaysAgo, formatClock, formatShortDate } from '@utils/formatters';

const copy = strings.dealLedger;

export type DealLedgerStatusFilter = 'all' | DealLedgerStatus;
export type DealLedgerPeriod = (typeof copy.periods)[number]['value'];

const STATUS_TONE: Record<DealLedgerStatus, BusinessPillTone> = {
  redeemed: 'success',
  claimed: 'brand',
  expired: 'neutral',
};

export interface DealRedemptionLedgerScreenProps {
  onBack?: () => void;
  rows: DealLedgerRow[];
  totals?: DealLedgerPage['totals'];
  status: DealLedgerStatusFilter;
  onChangeStatus: (status: DealLedgerStatusFilter) => void;
  period: DealLedgerPeriod;
  onChangePeriod: (period: DealLedgerPeriod) => void;
  branch: string;
  branchOptions: { label: string; value: string }[];
  onChangeBranch: (branch: string) => void;
  /** Set when opened from one deal; the chip clears it. */
  dealName?: string;
  onClearDeal?: () => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  /** True when any filter is narrowed, so the empty state can offer a reset. */
  isFiltered?: boolean;
  onResetFilters?: () => void;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  /** Injectable clock so day grouping is testable. */
  now?: Date;
}

/** "Today" · "Yesterday" · "Oct 14", by the row's activity time. */
function dayLabel(iso: string, now: Date): string {
  const days = calendarDaysAgo(iso, now);
  if (days === 0) return copy.today;
  if (days === 1) return copy.yesterday;
  return formatShortDate(iso);
}

/** Consecutive rows (already newest first) grouped under their day. */
function groupByDay(rows: DealLedgerRow[], now: Date) {
  const groups: { label: string; rows: DealLedgerRow[] }[] = [];
  for (const row of rows) {
    const label = dayLabel(row.activityAt, now);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.rows.push(row);
    else groups.push({ label, rows: [row] });
  }
  return groups;
}

/**
 * Deal redemption ledger. One job: show what deals actually brought in and
 * which vouchers are still outstanding. The net-revenue figure is the only
 * bold number on the page; everything below it is a quiet, dated record.
 */
export function DealRedemptionLedgerScreen({
  onBack,
  rows,
  totals,
  status,
  onChangeStatus,
  period,
  onChangePeriod,
  branch,
  branchOptions,
  onChangeBranch,
  dealName,
  onClearDeal,
  isLoading = false,
  isError = false,
  onRetry,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  isFiltered = false,
  onResetFilters,
  refreshControl,
  now = new Date(),
}: DealRedemptionLedgerScreenProps) {
  const outstanding = Math.max(
    0,
    (totals?.claims ?? 0) - (totals?.redeemed ?? 0) - (totals?.expired ?? 0),
  );
  const groups = groupByDay(rows, now);

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        eyebrow: copy.eyebrow,
        centerTitle: false,
        titleVariant: 'headingSm',
        onBack,
      }}
      contentContainerClassName="gap-4 pb-8"
      refreshControl={refreshControl}
    >
      <View className="gap-2 rounded-card bg-surface p-4 shadow-sm">
        <View className="flex-row items-start justify-between gap-2">
          <VemtapText
            variant="caption"
            tone="secondary"
            className="min-w-0 flex-1"
            numberOfLines={2}
          >
            {copy.netRevenueLabel}
          </VemtapText>
          <BusinessStatusPill label={copy.zeroCommission} tone="success" />
        </View>
        <VemtapText
          variant="headingLg"
          className="font-sans-bold"
          numberOfLines={1}
          accessibilityRole="header"
        >
          {formatNaira(totals?.netRevenue ?? 0)}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary">
          {[
            copy.redeemedStat(totals?.redeemed ?? 0),
            copy.outstandingStat(outstanding),
            copy.discountStat(formatNaira(totals?.discountGiven ?? 0)),
          ].join(' · ')}
        </VemtapText>
      </View>

      {dealName ? (
        <View className="flex-row items-center justify-between gap-2 rounded-field bg-surface-tint px-3 py-2">
          <VemtapText
            variant="labelSm"
            className="min-w-0 flex-1 font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.filteredDeal(dealName)}
          </VemtapText>
          {onClearDeal ? (
            <BusinessInlineAction label={copy.clearDeal} onPress={onClearDeal} />
          ) : null}
        </View>
      ) : null}

      <View className="z-10 flex-row flex-wrap items-center gap-2">
        <BusinessScopePicker
          icon="calendar"
          label={copy.periods.find(option => option.value === period)?.label ?? ''}
          value={period}
          options={copy.periods.map(option => ({
            label: option.label,
            value: option.value,
          }))}
          onChange={value => onChangePeriod(value as DealLedgerPeriod)}
        />
        {branchOptions.length > 1 ? (
          <BusinessScopePicker
            label={branchOptions.find(option => option.value === branch)?.label ?? ''}
            value={branch}
            options={branchOptions}
            onChange={onChangeBranch}
          />
        ) : null}
      </View>

      <BusinessSegmentTabs
        tabs={copy.tabs.map(tab => ({ key: tab.key, label: tab.label }))}
        value={status}
        onChange={key => onChangeStatus(key as DealLedgerStatusFilter)}
        accessibilityLabel={copy.headerTitle}
      />

      {isLoading && !rows.length ? (
        <LoadingState label={copy.loading} className="mt-6" />
      ) : isError && !rows.length ? (
        <EmptyState
          title={copy.loadError}
          actionLabel={copy.retry}
          onAction={onRetry}
          className="px-0"
        />
      ) : !rows.length ? (
        <EmptyState
          icon="receiptLong"
          title={isFiltered ? copy.emptyFilteredTitle : copy.emptyTitle}
          description={isFiltered ? copy.emptyFilteredBody : copy.emptyBody}
          actionLabel={isFiltered ? copy.resetFilters : undefined}
          onAction={isFiltered ? onResetFilters : undefined}
          className="px-0"
        />
      ) : (
        <View className="gap-4">
          {groups.map(group => (
            <View key={group.label} className="gap-1.5">
              <VemtapText
                variant="caption"
                tone="secondary"
                className="px-1 font-sans-semibold uppercase tracking-wider"
                accessibilityRole="header"
              >
                {group.label}
              </VemtapText>
              <View className="overflow-hidden rounded-card bg-surface shadow-sm">
                {group.rows.map((row, index) => {
                  const statusLabel = copy.statusLabels[row.status];
                  const amount = formatNaira(row.amount);
                  const time = formatClock(row.activityAt);
                  const subtitle = [row.customerName, row.contact, row.branchName]
                    .filter(Boolean)
                    .join(' · ');
                  return (
                    <BusinessLedgerRow
                      key={row.id}
                      divided={index > 0}
                      title={row.dealName}
                      subtitle={subtitle}
                      reference={
                        row.status === 'redeemed' && row.discountGiven > 0
                          ? `${row.claimCode} · ${copy.savedAmount(formatNaira(row.discountGiven))}`
                          : row.claimCode
                      }
                      amount={amount}
                      amountMuted={row.status === 'expired'}
                      time={time}
                      statusLabel={statusLabel}
                      statusTone={STATUS_TONE[row.status]}
                      accessibilityLabel={copy.rowA11y(
                        row.dealName,
                        row.customerName,
                        statusLabel,
                        amount,
                        `${group.label} ${time}`,
                      )}
                    />
                  );
                })}
              </View>
            </View>
          ))}
          {hasMore ? (
            <Button
              label={isLoadingMore ? copy.loadingMore : copy.loadMore}
              labelVariant="labelMd"
              variant="secondary"
              loading={isLoadingMore}
              onPress={onLoadMore}
            />
          ) : null}
        </View>
      )}
    </BusinessScreenLayout>
  );
}
