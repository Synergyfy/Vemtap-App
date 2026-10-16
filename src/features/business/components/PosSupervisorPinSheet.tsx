import React, { useState } from 'react';
import { View } from 'react-native';
import { BottomSheet } from '@components/shared/BottomSheet';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';

const copy = strings.posSupervisorPin;

export interface PosSupervisorPinSheetProps {
  visible: boolean;
  /** What the approval is for, e.g. "refund this sale". */
  reason: string;
  isVerifying?: boolean;
  error?: string | null;
  onSubmit: (pin: string) => void;
  onClose: () => void;
}

/** A supervisor types their PIN on the cashier's device to approve one action. */
export function PosSupervisorPinSheet({
  visible,
  reason,
  isVerifying,
  error,
  onSubmit,
  onClose,
}: PosSupervisorPinSheetProps) {
  const [pin, setPin] = useState('');
  const valid = /^\d{4,6}$/.test(pin);
  return (
    <BottomSheet
      visible={visible}
      onClose={() => {
        setPin('');
        onClose();
      }}
      title={copy.title}
    >
      <View className="gap-3">
        <VemtapText variant="caption" tone="secondary">
          {copy.body(reason)}
        </VemtapText>
        <Input
          label={copy.pinLabel}
          value={pin}
          onChangeText={text => setPin(text.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          secureTextEntry
          error={error ?? undefined}
        />
        <Button
          label={copy.approveCta}
          disabled={!valid}
          loading={isVerifying}
          onPress={() => onSubmit(pin)}
        />
      </View>
    </BottomSheet>
  );
}
