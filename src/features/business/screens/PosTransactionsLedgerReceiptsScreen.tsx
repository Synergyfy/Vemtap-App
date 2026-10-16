import React from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import {
  BusinessChipScroller,
  BusinessCountChip,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { PosLedgerRow } from '@features/business/components/PosLedgerRow';
import type { LedgerRowView } from '@features/business/utils/posMappers';

const copy = strings.posTransactionsLedgerReceipts;

export type ReceiptFilter = 'all' | 'completed' | 'partial_refund' | 'refunded';

export interface PosLedgerReceiptsView {
  branchName: string;
  online: boolean;
  /** `Till 01 • Ada Obi`; null without an open register. */
  registerLine: string | null;
  grossValue: string;
  grossMeta: string;
  queuedCount: number;
  filters: { id: ReceiptFilter; label: string; count: number }[];
  rows: LedgerRowView[];
  hasMore: boolean;
}

export interface PosTransactionsLedgerReceiptsScreenProps {
  view?: PosLedgerReceiptsView;
  isLoading?: boolean;
  isError?: boolean;
  isFetchingMore?: boolean;
  onRetry?: () => void;
  search: string;
  filter: ReceiptFilter;
  onBack?: () => void;
  onSyncLedger?: () => void;
  onSearchChange?: (text: string) => void;
  onSelectFilter?: (filter: ReceiptFilter) => void;
  onOpenReceipt?: (saleId: string) => void;
  onLoadMore?: () => void;
}

/** Today's receipt ledger: gross total, status filters and each receipt. */
export function PosTransactionsLedgerReceiptsScreen({
  view,
  isLoading,
  isError,
  isFetchingMore,
  onRetry,
  search,
  filter,
  onBack,
  onSyncLedger,
  onSearchChange,
  onSelectFilter,
  onOpenReceipt,
  onLoadMore,
}: PosTransactionsLedgerReceiptsScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: view?.branchName || copy.headerTitle,
        onBack,
        showAvatar: false,
        titleVariant: 'labelMd',
        titleAccessory: view ? (
          <View className="mt-1 flex-row items-center gap-1.5">
            <View
              className={`h-2 w-2 rounded-full ${view.online ? 'bg-success' : 'bg-warning'}`}
            />
            <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
              {view.online ? copy.onlineBadge : copy.offlineBadge}
            </VemtapText>
          </View>
        ) : undefined,
        actions: [{ icon: 'sync', label: copy.syncActionLabel, onPress: onSyncLedger }],
      }}
      contentContainerClassName="pb-8"
    >
      {!view ? (
        isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={onRetry}
          />
        ) : (
          <LoadingState label={isLoading ? copy.loading : undefined} />
        )
      ) : (
        <>
          {view.registerLine ? (
            <View className="flex-row items-center gap-1.5">
              <Icon name="pointOfSale" size={16} color={colors.textSecondary} />
              <VemtapText
                variant="caption"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {view.registerLine}
              </VemtapText>
            </View>
          ) : null}

          <Input
            containerClassName="mt-2"
            placeholder={copy.searchPlaceholder}
            accessibilityLabel={copy.searchPlaceholder}
            value={search}
            onChangeText={onSearchChange}
            leadingIcon={<Icon name="search" size={18} color={colors.textTertiary} />}
          />

          <View className="mt-3 rounded-card bg-primary p-4">
            <View className="flex-row items-center justify-between gap-2">
              <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                <Icon name="payments" size={16} color={colors.surface} />
                <VemtapText
                  variant="micro"
                  className="font-sans-semibold uppercase tracking-wider text-surface"
                  numberOfLines={1}
                >
                  {copy.grossTitle}
                </VemtapText>
              </View>
              <View className="shrink-0 flex-row items-center gap-1.5 rounded-full bg-surface/20 px-2.5 py-1">
                <Icon
                  name={view.queuedCount ? 'cloudQueue' : 'cloudDone'}
                  size={13}
                  color={colors.surface}
                />
                <VemtapText variant="micro" className="text-surface" numberOfLines={1}>
                  {view.queuedCount
                    ? copy.queuedBadge(view.queuedCount)
                    : copy.syncedBadge}
                </VemtapText>
              </View>
            </View>
            <View className="mt-2 flex-row items-end justify-between gap-2">
              <VemtapText
                variant="display"
                className="font-sans-bold text-surface"
                numberOfLines={1}
              >
                {view.grossValue}
              </VemtapText>
              <VemtapText
                variant="micro"
                className="shrink-0 text-surface"
                numberOfLines={1}
              >
                {view.grossMeta}
              </VemtapText>
            </View>
          </View>

          <View className="mt-3">
            <BusinessChipScroller>
              {view.filters.map(item => (
                <BusinessCountChip
                  key={item.id}
                  label={item.label}
                  count={String(item.count)}
                  selected={filter === item.id}
                  onPress={() => onSelectFilter?.(item.id)}
                />
              ))}
            </BusinessChipScroller>
          </View>

          <View className="mt-2 gap-2.5">
            {view.rows.map(row => (
              <PosLedgerRow
                key={row.id}
                row={row}
                onPress={() => onOpenReceipt?.(row.id)}
              />
            ))}
          </View>

          {view.rows.length === 0 ? (
            <EmptyState
              icon="receiptLong"
              variant="contained"
              title={copy.empty.title}
              description={copy.empty.body}
            />
          ) : null}

          {view.hasMore ? (
            <View className="mt-3">
              <Button
                label={strings.posLedger.loadMore}
                variant="secondary"
                loading={isFetchingMore}
                onPress={onLoadMore}
              />
            </View>
          ) : null}

          {!view.online ? (
            <BusinessStatusPill
              className="mt-3 self-start"
              label={copy.offlineNote}
              tone="warning"
            />
          ) : null}
        </>
      )}
    </BusinessScreenLayout>
  );
}
