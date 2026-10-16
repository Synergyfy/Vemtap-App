import React from 'react';
import { View } from 'react-native';
import { BottomSheet } from '@components/shared/BottomSheet';
import { strings } from '@constants/strings';
import type { AdWalletTransactionType } from '@api/adWalletApi';
import { BusinessCheckRow } from '@features/business/components/BusinessPrimitives';

const copy = strings.boostWizard.wallet.live.filter;

export interface WalletActivityFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  /** The active type; `undefined` = all activity. */
  value?: AdWalletTransactionType;
  onChange: (value: AdWalletTransactionType | undefined) => void;
}

/** Boost Wallet → Filter: narrow the history to one kind of activity. */
export function WalletActivityFilterSheet({
  visible,
  onClose,
  value,
  onChange,
}: WalletActivityFilterSheetProps) {
  const pick = (next: AdWalletTransactionType | undefined) => {
    onChange(next);
    onClose();
  };
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={copy.title}
      titleVariant="headingXl"
      titleClassName="text-heading-xl"
    >
      <View accessibilityRole="radiogroup" className="gap-2 pb-2">
        <BusinessCheckRow
          type="radio"
          title={copy.all}
          selected={value === undefined}
          onPress={() => pick(undefined)}
        />
        {copy.options.map(option => (
          <BusinessCheckRow
            key={option.id}
            type="radio"
            title={option.label}
            selected={value === option.id}
            onPress={() => pick(option.id)}
          />
        ))}
      </View>
    </BottomSheet>
  );
}
