import React from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessChipScroller,
  BusinessCountChip,
} from '@features/business/components/BusinessOpsPrimitives';

const copy = strings.posOfflineBufferQueue;

export type BufferFilter = 'all' | 'cash' | 'card' | 'transfer';

export interface BufferedSaleView {
  id: string;
  total: string;
  method: string;
  when: string;
  items: string;
  cashier: string;
}

export interface PosOfflineBufferView {
  online: boolean;
  pendingCount: number;
  volume: string;
  counts: Record<BufferFilter, number>;
  sales: BufferedSaleView[];
}

export interface PosOfflineBufferQueueScreenProps {
  view: PosOfflineBufferView;
  filter: BufferFilter;
  isSyncing?: boolean;
  onBack?: () => void;
  onSelectFilter?: (filter: BufferFilter) => void;
  onSyncNow?: () => void;
  onReturnToRegister?: () => void;
}

/** Sales saved on this device while offline, waiting for batch-sync. */
export function PosOfflineBufferQueueScreen({
  view,
  filter,
  isSyncing,
  onBack,
  onSelectFilter,
  onSyncNow,
  onReturnToRegister,
}: PosOfflineBufferQueueScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.syncCta}
            labelVariant="labelMd"
            disabled={!view.online || view.pendingCount === 0}
            loading={isSyncing}
            onPress={onSyncNow}
            leftIcon={<Icon name="sync" size={17} color={colors.surface} />}
          />
          <Button
            label={copy.returnCta}
            labelVariant="labelSm"
            variant="secondary"
            onPress={onReturnToRegister}
          />
        </BusinessActionDock>
      }
    >
      <View className="flex-row gap-2">
        <View className="min-w-0 flex-1 rounded-card bg-surface p-3 shadow-sm">
          <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
            {copy.pendingTitle}
          </VemtapText>
          <VemtapText variant="headingSm" className="font-sans-bold" numberOfLines={1}>
            {copy.pendingValue(view.pendingCount)}
          </VemtapText>
        </View>
        <View className="min-w-0 flex-1 rounded-card bg-surface p-3 shadow-sm">
          <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
            {copy.volumeLabel}
          </VemtapText>
          <VemtapText variant="headingSm" className="font-sans-bold" numberOfLines={1}>
            {view.volume}
          </VemtapText>
        </View>
      </View>

      <View className="mt-3 flex-row items-start gap-2 rounded-field bg-warning-container p-2.5">
        <Icon name="alert" size={15} color={colors.tertiary} />
        <VemtapText variant="caption" className="min-w-0 flex-1" numberOfLines={4}>
          {copy.warningTitle}
        </VemtapText>
      </View>

      <BusinessChipScroller className="mt-3">
        {(['all', 'cash', 'card', 'transfer'] as const).map(id => (
          <BusinessCountChip
            key={id}
            label={copy.filters[id]}
            count={String(view.counts[id])}
            selected={filter === id}
            onPress={() => onSelectFilter?.(id)}
          />
        ))}
      </BusinessChipScroller>

      <View className="mt-3 gap-2">
        {view.sales.map(sale => (
          <View key={sale.id} className="gap-1 rounded-card bg-surface p-3 shadow-sm">
            <View className="flex-row items-center justify-between gap-2">
              <BusinessStatusPill
                label={copy.queueBadgeRow}
                tone="brand"
                icon="cloudQueue"
              />
              <VemtapText variant="labelMd" className="font-sans-bold" numberOfLines={1}>
                {sale.total}
              </VemtapText>
            </View>
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {[sale.when, sale.method, sale.cashier].filter(Boolean).join(' • ')}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
              {sale.items}
            </VemtapText>
          </View>
        ))}
      </View>

      {view.sales.length === 0 ? (
        <EmptyState
          icon="cloudDone"
          variant="contained"
          title={copy.empty.title}
          description={copy.empty.body}
        />
      ) : null}
    </BusinessScreenLayout>
  );
}
