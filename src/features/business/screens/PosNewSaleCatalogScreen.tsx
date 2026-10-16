import React from 'react';
import { Pressable, View } from 'react-native';
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
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessChipScroller,
  BusinessCountChip,
} from '@features/business/components/BusinessOpsPrimitives';

const copy = strings.posNewSaleCatalog;

export type CatalogStockTone = 'ready' | 'low' | 'out' | 'untracked';

const stockTone: Record<CatalogStockTone, 'success' | 'warning' | 'neutral'> = {
  ready: 'success',
  low: 'warning',
  out: 'neutral',
  untracked: 'neutral',
};

export interface CatalogItemView {
  id: string;
  name: string;
  detail: string;
  price: string;
  wasPrice?: string;
  stockLabel: string;
  stockTone: CatalogStockTone;
  dealLabel?: string;
  /** Quantity already on the ticket. */
  inTicket: number;
}

export interface PosNewSaleCatalogView {
  registerLabel: string;
  categories: { id: string; label: string }[];
  items: CatalogItemView[];
  totalItems: number;
  ticket: {
    itemCount: number;
    total: string;
    customerName: string | null;
    taxLabel: string;
  };
}

export interface PosNewSaleCatalogScreenProps {
  view?: PosNewSaleCatalogView;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  search: string;
  category: string;
  onBack?: () => void;
  onSearchChange?: (text: string) => void;
  onFilterCategory?: (categoryId: string) => void;
  onAddItem?: (itemId: string) => void;
  onOpenCustomer?: () => void;
  onCharge?: () => void;
}

/** Register catalog: category chips, live branch items with stock and the running ticket. */
export function PosNewSaleCatalogScreen({
  view,
  isLoading,
  isError,
  onRetry,
  search,
  category,
  onBack,
  onSearchChange,
  onFilterCategory,
  onAddItem,
  onOpenCustomer,
  onCharge,
}: PosNewSaleCatalogScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        view ? (
          <BusinessActionDock>
            <View className="flex-row items-center justify-between gap-3 rounded-field bg-surface px-3 py-2.5 shadow-sm">
              <View className="min-w-0 flex-1">
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {copy.ticketLabel}
                </VemtapText>
                <VemtapText
                  variant="caption"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {copy.itemsCount(view.ticket.itemCount)}
                </VemtapText>
              </View>
              <VemtapText
                variant="labelMd"
                className="shrink-0 font-sans-bold text-primary"
                numberOfLines={1}
              >
                {view.ticket.total}
              </VemtapText>
            </View>
            <Button
              label={copy.chargeCta}
              labelVariant="labelMd"
              disabled={view.ticket.itemCount === 0}
              onPress={onCharge}
              rightIcon={<Icon name="arrowForward" size={17} color={colors.surface} />}
            />
          </BusinessActionDock>
        ) : undefined
      }
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
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {view.registerLabel}
          </VemtapText>

          <Input
            containerClassName="mt-3"
            placeholder={copy.searchPlaceholder}
            value={search}
            onChangeText={onSearchChange}
            accessibilityLabel={copy.searchPlaceholder}
            leadingIcon={<Icon name="search" size={18} color={colors.textTertiary} />}
          />

          <BusinessChipScroller className="mt-3">
            <BusinessCountChip
              label={copy.allItemsLabel}
              count={String(view.totalItems)}
              selected={category === 'all'}
              onPress={() => onFilterCategory?.('all')}
            />
            {view.categories.map(item => (
              <BusinessCountChip
                key={item.id}
                label={item.label}
                selected={category === item.id}
                onPress={() => onFilterCategory?.(item.id)}
              />
            ))}
          </BusinessChipScroller>

          <View className="mt-3 flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              <Icon name="catalog" size={16} color={colors.primary} />
              <VemtapText
                variant="labelMd"
                className="min-w-0 font-sans-semibold"
                numberOfLines={1}
              >
                {copy.catalogTitle}
              </VemtapText>
            </View>
            <BusinessStatusPill label={copy.catalogSub} tone="success" />
          </View>

          <View className="mt-2 gap-2">
            {view.items.map(item => (
              <View key={item.id} className="gap-2 rounded-card bg-surface p-3 shadow-sm">
                <View className="flex-row items-start justify-between gap-2">
                  <View className="min-w-0 flex-1">
                    <View className="flex-row flex-wrap items-center gap-1.5">
                      <VemtapText
                        variant="labelMd"
                        className="min-w-0 font-sans-semibold"
                        numberOfLines={2}
                      >
                        {item.name}
                      </VemtapText>
                      {item.dealLabel ? (
                        <BusinessStatusPill label={item.dealLabel} tone="brand" />
                      ) : null}
                    </View>
                    {item.detail ? (
                      <VemtapText
                        variant="caption"
                        tone="secondary"
                        className="mt-0.5"
                        numberOfLines={1}
                      >
                        {item.detail}
                      </VemtapText>
                    ) : null}
                    <View className="mt-1 flex-row items-baseline gap-1.5">
                      {item.wasPrice ? (
                        <VemtapText
                          variant="labelSm"
                          tone="tertiary"
                          className="line-through"
                          numberOfLines={1}
                        >
                          {item.wasPrice}
                        </VemtapText>
                      ) : null}
                      <VemtapText
                        variant="labelMd"
                        className="font-sans-bold"
                        numberOfLines={1}
                      >
                        {item.price}
                      </VemtapText>
                    </View>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${item.name} ${copy.addItemCta}`}
                    accessibilityState={{ disabled: item.stockTone === 'out' }}
                    disabled={item.stockTone === 'out'}
                    onPress={() => onAddItem?.(item.id)}
                    className={`h-9 w-9 shrink-0 items-center justify-center rounded-lg active:scale-95 ${
                      item.stockTone === 'out' ? 'bg-surface-container' : 'bg-primary'
                    }`}
                  >
                    <Icon name="plus" size={19} color={colors.surface} />
                  </Pressable>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <BusinessStatusPill
                    label={item.stockLabel}
                    tone={stockTone[item.stockTone]}
                  />
                  {item.inTicket > 0 ? (
                    <View className="flex-row items-center gap-1">
                      <Icon
                        name="checkCircle"
                        size={14}
                        color={colors.badgeDiscountText}
                      />
                      <VemtapText
                        variant="micro"
                        className="text-badge-discount-text"
                        numberOfLines={1}
                      >
                        {copy.inTicket(item.inTicket)}
                      </VemtapText>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>

          {view.items.length === 0 ? (
            <EmptyState
              icon="catalog"
              variant="contained"
              title={copy.empty.title}
              description={copy.empty.body}
            />
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={view.ticket.customerName ?? copy.guestLabel}
            onPress={onOpenCustomer}
            className="mt-3 flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-3"
          >
            <Icon name="accountCircle" size={18} color={colors.primary} />
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={1}
            >
              {view.ticket.customerName ?? copy.guestLabel}
            </VemtapText>
            <Icon name="expandMore" size={18} color={colors.textTertiary} />
          </Pressable>

          <VemtapText variant="micro" tone="tertiary" className="mt-2" numberOfLines={1}>
            {view.ticket.taxLabel}
          </VemtapText>
        </>
      )}
    </BusinessScreenLayout>
  );
}
