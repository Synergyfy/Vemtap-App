import React from 'react';
import { Pressable, View } from 'react-native';
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

const copy = strings.posProductsInventory;

export type InventoryFilter = 'all' | 'low' | 'out';
export type InventoryState = 'ok' | 'low' | 'out' | 'untracked';

const stateTone: Record<InventoryState, 'success' | 'warning' | 'tertiary' | 'neutral'> =
  {
    ok: 'success',
    low: 'warning',
    out: 'tertiary',
    untracked: 'neutral',
  };

export interface InventoryItemView {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: string;
  /** Null for items without stock tracking. */
  stock: number | null;
  state: InventoryState;
}

export interface PosProductsInventoryView {
  branchName: string;
  counts: Record<InventoryFilter, number>;
  items: InventoryItemView[];
}

export interface PosProductsInventoryScreenProps {
  view?: PosProductsInventoryView;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  search: string;
  filter: InventoryFilter;
  /** Item whose stock write is in flight. */
  savingItemId?: string | null;
  onBack?: () => void;
  onSearchChange?: (text: string) => void;
  onSelectFilter?: (filter: InventoryFilter) => void;
  onAdjustStock?: (itemId: string, next: number) => void;
  onOpenItem?: (itemId: string) => void;
}

/** Branch catalogue with live stock: filter low/out, nudge counts, open an item's stock history. */
export function PosProductsInventoryScreen({
  view,
  isLoading,
  isError,
  onRetry,
  search,
  filter,
  savingItemId,
  onBack,
  onSearchChange,
  onSelectFilter,
  onAdjustStock,
  onOpenItem,
}: PosProductsInventoryScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, subtitle: view?.branchName, onBack }}
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
          <Input
            placeholder={copy.searchPlaceholder}
            accessibilityLabel={copy.searchPlaceholder}
            value={search}
            onChangeText={onSearchChange}
            leadingIcon={<Icon name="search" size={18} color={colors.textTertiary} />}
          />

          <BusinessChipScroller className="mt-3">
            {(['all', 'low', 'out'] as const).map(id => (
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
            {view.items.map(item => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={item.name}
                onPress={() => onOpenItem?.(item.id)}
                className="gap-2 rounded-card bg-surface p-3 shadow-sm active:scale-[0.99]"
              >
                <View className="flex-row items-start justify-between gap-2">
                  <View className="min-w-0 flex-1">
                    <VemtapText
                      variant="labelMd"
                      className="font-sans-semibold"
                      numberOfLines={2}
                    >
                      {item.name}
                    </VemtapText>
                    <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                      {[item.sku, item.category].filter(Boolean).join(' • ')}
                    </VemtapText>
                  </View>
                  <VemtapText
                    variant="labelMd"
                    className="shrink-0 font-sans-bold"
                    numberOfLines={1}
                  >
                    {item.price}
                  </VemtapText>
                </View>
                <View className="flex-row items-center justify-between gap-2">
                  <BusinessStatusPill
                    label={
                      item.stock == null
                        ? copy.untracked
                        : copy.stateLabel[item.state](item.stock)
                    }
                    tone={stateTone[item.state]}
                  />
                  {item.stock != null ? (
                    <View className="flex-row items-center gap-2">
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${item.name} ${copy.decreaseLabel}`}
                        disabled={item.stock <= 0 || savingItemId === item.id}
                        onPress={() =>
                          onAdjustStock?.(item.id, Math.max(0, (item.stock ?? 0) - 1))
                        }
                        className="h-8 w-8 items-center justify-center rounded-lg bg-surface-container"
                      >
                        <Icon name="remove" size={16} color={colors.text} />
                      </Pressable>
                      <VemtapText
                        variant="labelMd"
                        className="w-8 text-center font-sans-semibold"
                        numberOfLines={1}
                      >
                        {String(item.stock)}
                      </VemtapText>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${item.name} ${copy.increaseLabel}`}
                        disabled={savingItemId === item.id}
                        onPress={() => onAdjustStock?.(item.id, (item.stock ?? 0) + 1)}
                        className="h-8 w-8 items-center justify-center rounded-lg bg-surface-container"
                      >
                        <Icon name="plus" size={16} color={colors.text} />
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>

          {view.items.length === 0 ? (
            <EmptyState
              icon="inventory"
              variant="contained"
              title={copy.empty.title}
              description={copy.empty.body}
            />
          ) : null}
        </>
      )}
    </BusinessScreenLayout>
  );
}
