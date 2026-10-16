import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { BusinessStatusPill } from '@features/business/components/BusinessPrimitives';
import type { LedgerRowView } from '@features/business/utils/posMappers';

const copy = strings.posLedger;

const statusStyle: Record<
  LedgerRowView['status'],
  {
    tone: 'success' | 'brand' | 'tertiary' | 'warning';
    icon: IconName;
    well: string;
    color: string;
  }
> = {
  completed: {
    tone: 'success',
    icon: 'checkCircle',
    well: 'bg-success-container',
    color: colors.success,
  },
  partial_refund: {
    tone: 'warning',
    icon: 'undo',
    well: 'bg-surface-tint',
    color: colors.primary,
  },
  refunded: {
    tone: 'tertiary',
    icon: 'undo',
    well: 'bg-error-container',
    color: colors.tertiary,
  },
  queued: {
    tone: 'brand',
    icon: 'cloudQueue',
    well: 'bg-surface-tint',
    color: colors.primary,
  },
};

/** A receipt in a POS ledger list: status, time, total, tender, customer and items. */
export function PosLedgerRow({
  row,
  onPress,
}: {
  row: LedgerRowView;
  onPress?: () => void;
}) {
  const style = statusStyle[row.status];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${row.reference} ${row.total}`}
      onPress={onPress}
      disabled={!onPress}
      className="rounded-card bg-surface p-3 shadow-sm active:scale-[0.99]"
    >
      <View className="flex-row items-start gap-2.5">
        <View
          className={`h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.well}`}
        >
          <Icon name={style.icon} size={17} color={style.color} />
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row flex-wrap items-center gap-1.5">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {row.reference}
            </VemtapText>
            <BusinessStatusPill label={copy.status[row.status]} tone={style.tone} />
          </View>
          <VemtapText
            variant="micro"
            tone="secondary"
            className="mt-0.5"
            numberOfLines={1}
          >
            {row.when}
          </VemtapText>
        </View>
        <View className="shrink-0 items-end">
          <VemtapText
            variant="labelMd"
            className={
              row.status === 'refunded' ? 'font-sans-bold text-error' : 'font-sans-bold'
            }
            numberOfLines={1}
          >
            {row.total}
          </VemtapText>
          <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
            {row.method}
          </VemtapText>
        </View>
      </View>
      <View className="mt-2 flex-row items-start gap-2">
        <View className="mt-0.5 shrink-0">
          <Icon name="person" size={15} color={colors.textSecondary} />
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="caption"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {row.customer}
            </VemtapText>
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.itemCount(row.itemCount)}
            </VemtapText>
          </View>
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {row.items}
          </VemtapText>
        </View>
      </View>
      {row.note ? (
        <VemtapText variant="caption" tone="secondary" className="mt-2" numberOfLines={1}>
          {row.note}
        </VemtapText>
      ) : null}
    </Pressable>
  );
}
