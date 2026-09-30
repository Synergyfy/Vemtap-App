import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessChipScroller,
  BusinessCountChip,
  BusinessSearchTrigger,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  posLedgerReceipts,
  posReceiptLedgerFilters,
} from '@features/business/data/businessPosLedgerData';

const copy = strings.posTransactionsLedgerReceipts;

export interface PosTransactionsLedgerReceiptsScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onSelectBranch?: () => void;
  onSyncLedger?: () => void;
  onSearch?: () => void;
  onSelectDate?: () => void;
  onSelectShift?: () => void;
  onExport?: () => void;
  onSelectFilter?: (filterId: string) => void;
  onOpenReceipt?: (receiptId: string) => void;
  /** Long-press a customer row in the CRM hand-off (kept for parity with the CRM list). */
  onOpenCustomer?: (customerName: string) => void;
}

/**
 * `pos_transactions_ledger_2` - the receipt-level ledger: gross total for the
 * active shift, status filters, then each receipt with its sync state. The
 * design's own tab bar is not rendered (BusinessTabBar owns navigation).
 */
export function PosTransactionsLedgerReceiptsScreen({
  onBack,
  onOpenProfile,
  onSelectBranch,
  onSyncLedger,
  onSearch,
  onSelectDate,
  onSelectShift,
  onExport,
  onSelectFilter,
  onOpenReceipt,
  onOpenCustomer,
}: PosTransactionsLedgerReceiptsScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        showAvatar: false,
        titleVariant: 'labelMd',
        leading: (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.headerTitle}
            onPress={onSelectBranch}
            className="flex-row items-center gap-1"
          >
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface-tint">
              <Icon name="store" size={18} color={colors.primary} />
            </View>
            <Icon name="expandMore" size={18} color={colors.primary} />
          </Pressable>
        ),
        titleAccessory: (
          <View className="mt-1 flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-success" />
            <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
              {copy.onlineBadge}
            </VemtapText>
          </View>
        ),
        actions: [
          { icon: 'sync', label: copy.syncActionLabel, onPress: onSyncLedger },
          {
            icon: 'accountCircle',
            label: copy.profileActionLabel,
            onPress: onOpenProfile,
          },
        ],
      }}
      contentContainerClassName="pb-8"
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <Icon name="pointOfSale" size={16} color={colors.textSecondary} />
          <VemtapText variant="caption" className="font-sans-semibold" numberOfLines={1}>
            {`${copy.tillLabel} \u2022 ${copy.cashierLabel}`}
          </VemtapText>
        </View>
        <BusinessStatusPill label={copy.shiftBadge} tone="neutral" />
      </View>

      <View className="mt-2 flex-row items-center gap-2">
        <View className="min-w-0 flex-1">
          <BusinessSearchTrigger
            placeholder={copy.searchPlaceholder}
            onPress={onSearch}
            onFilterPress={onSearch}
            filterLabel={copy.searchPlaceholder}
            surface="bordered"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.dateLabel}
          onPress={onSelectDate}
          className="min-h-11 shrink-0 flex-row items-center gap-1.5 rounded-field bg-surface-container-low px-3 active:scale-95"
        >
          <Icon name="calendar" size={17} color={colors.text} />
          <VemtapText variant="caption" className="font-sans-semibold" numberOfLines={1}>
            {copy.dateLabel}
          </VemtapText>
          <Icon name="expandMore" size={15} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View className="mt-2 flex-row items-center gap-2">
        <View className="min-w-0 flex-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.shiftFilterLabel}
            onPress={onSelectShift}
            className="min-h-11 flex-row items-center gap-1.5 rounded-field bg-surface-container-low px-3 active:scale-95"
          >
            <View className="h-2 w-2 shrink-0 rounded-full bg-primary" />
            <VemtapText
              variant="caption"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={1}
            >
              {copy.shiftFilterLabel}
            </VemtapText>
            <Icon name="tune" size={15} color={colors.textSecondary} />
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.exportCta}
          onPress={onExport}
          className="min-h-11 shrink-0 flex-row items-center gap-1.5 rounded-field bg-surface-container-low px-3 active:scale-95"
        >
          <Icon name="download" size={17} color={colors.text} />
          <VemtapText variant="caption" className="font-sans-semibold" numberOfLines={1}>
            {copy.exportCta}
          </VemtapText>
        </Pressable>
      </View>

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
            <Icon name="cloudDone" size={13} color={colors.surface} />
            <VemtapText variant="micro" className="text-surface" numberOfLines={1}>
              {copy.syncedBadge}
            </VemtapText>
          </View>
        </View>
        <View className="mt-2 flex-row items-end justify-between gap-2">
          <VemtapText
            variant="display"
            className="font-sans-bold text-surface"
            numberOfLines={1}
          >
            {copy.grossValue}
          </VemtapText>
          <VemtapText variant="micro" className="shrink-0 text-surface" numberOfLines={1}>
            {copy.grossMeta}
          </VemtapText>
        </View>
      </View>

      <View className="mt-3">
        <BusinessChipScroller>
          {posReceiptLedgerFilters.map(filter => (
            <BusinessCountChip
              key={filter.id}
              label={filter.label}
              count={filter.count}
              selected={filter.active}
              onPress={() => onSelectFilter?.(filter.id)}
            />
          ))}
        </BusinessChipScroller>
      </View>

      <View className="mt-2 gap-2.5">
        {posLedgerReceipts.map(receipt => (
          <Pressable
            key={receipt.id}
            accessibilityRole="button"
            accessibilityLabel={`${receipt.reference} ${receipt.total}`}
            onPress={() => onOpenReceipt?.(receipt.id)}
            className="rounded-card bg-surface p-3 shadow-sm active:scale-[0.99]"
          >
            <View className="flex-row items-start gap-2.5">
              <View
                className={`h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  receipt.statusTone === 'tertiary'
                    ? 'bg-error-container'
                    : receipt.statusTone === 'brand'
                      ? 'bg-surface-tint'
                      : 'bg-success-container'
                }`}
              >
                <Icon
                  name={receipt.statusIcon}
                  size={17}
                  color={
                    receipt.statusTone === 'tertiary'
                      ? colors.tertiary
                      : receipt.statusTone === 'brand'
                        ? colors.primary
                        : colors.success
                  }
                />
              </View>
              <View className="min-w-0 flex-1">
                <View className="flex-row flex-wrap items-center gap-1.5">
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {receipt.reference}
                  </VemtapText>
                  <BusinessStatusPill
                    label={receipt.statusLabel}
                    tone={receipt.statusTone}
                  />
                </View>
                <View className="mt-0.5 flex-row flex-wrap items-center gap-1.5">
                  <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                    {receipt.when}
                  </VemtapText>
                  <View className="flex-row items-center gap-1">
                    <Icon
                      name={receipt.syncLabel === 'Synced' ? 'cloudDone' : 'cloudQueue'}
                      size={12}
                      color={
                        receipt.syncTone === 'brand' ? colors.primary : colors.tertiary
                      }
                    />
                    <VemtapText
                      variant="micro"
                      tone={receipt.syncTone === 'brand' ? 'brand' : 'tertiary'}
                      numberOfLines={1}
                    >
                      {receipt.syncLabel}
                    </VemtapText>
                  </View>
                </View>
              </View>
              <View className="shrink-0 items-end">
                <VemtapText
                  variant="labelMd"
                  className={
                    receipt.statusTone === 'tertiary'
                      ? 'font-sans-bold text-error'
                      : 'font-sans-bold'
                  }
                  numberOfLines={1}
                >
                  {receipt.total}
                </VemtapText>
                <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                  {receipt.method}
                </VemtapText>
              </View>
            </View>

            <View className="mt-2 flex-row items-start gap-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={receipt.customer}
                onPress={() => onOpenCustomer?.(receipt.customer)}
                className="min-w-0 flex-1 flex-row items-start gap-2"
              >
                <View className="mt-0.5 shrink-0">
                  <Icon
                    name={receipt.customerIcon}
                    size={15}
                    color={colors.textSecondary}
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <View className="flex-row items-center justify-between gap-2">
                    <VemtapText
                      variant="caption"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {receipt.customer}
                    </VemtapText>
                    <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                      {receipt.itemCount}
                    </VemtapText>
                  </View>
                  <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                    {receipt.items}
                  </VemtapText>
                </View>
              </Pressable>
            </View>

            <View className="mt-2 flex-row flex-wrap items-center justify-between gap-2">
              <VemtapText
                variant="caption"
                tone={receipt.noteTone ?? 'secondary'}
                numberOfLines={1}
              >
                {receipt.note}
              </VemtapText>
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {copy.tillMeta}
              </VemtapText>
            </View>
          </Pressable>
        ))}
      </View>
    </BusinessScreenLayout>
  );
}
