import React from 'react';
import { View } from 'react-native';
import { VemtapText } from '@components/ui/Text';
import {
  BusinessStatusPill,
  type BusinessPillTone,
} from '@features/business/components/BusinessPrimitives';

export interface BusinessLedgerRowProps {
  /** What the entry is for, e.g. the deal name. */
  title: string;
  /** Who and how, e.g. "Ada O. · ad***@mail.com". */
  subtitle?: string;
  /** A reference people quote back, e.g. the claim code. */
  reference?: string;
  amount: string;
  /** Dims the amount for entries that did not settle (expired vouchers). */
  amountMuted?: boolean;
  time: string;
  statusLabel: string;
  statusTone: BusinessPillTone;
  /** One sentence for screen readers; the row reads as a single element. */
  accessibilityLabel: string;
  /** Draws the hairline above every row but the first in a group. */
  divided?: boolean;
}

/**
 * One line of a money ledger: what it was for and who, on the left; amount,
 * time and a worded status on the right. Status is always text in a pill, so
 * it never depends on colour alone.
 */
export function BusinessLedgerRow({
  title,
  subtitle,
  reference,
  amount,
  amountMuted = false,
  time,
  statusLabel,
  statusTone,
  accessibilityLabel,
  divided = false,
}: BusinessLedgerRowProps) {
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      className={`min-h-[64px] flex-row items-start gap-3 px-4 py-3 ${
        divided ? 'border-t border-border/40' : ''
      }`}
    >
      <View className="min-w-0 flex-1 gap-0.5">
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
          {title}
        </VemtapText>
        {subtitle ? (
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {subtitle}
          </VemtapText>
        ) : null}
        {reference ? (
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {reference}
          </VemtapText>
        ) : null}
      </View>
      <View className="shrink-0 items-end gap-1">
        <VemtapText
          variant="labelMd"
          // Muted is weight, not a pale colour: the tertiary token is 2.5:1 on
          // white, below the 4.5:1 small text needs. The pill carries the state.
          className={amountMuted ? 'text-text-secondary' : 'font-sans-semibold'}
          numberOfLines={1}
        >
          {amount}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {time}
        </VemtapText>
        <BusinessStatusPill label={statusLabel} tone={statusTone} />
      </View>
    </View>
  );
}
