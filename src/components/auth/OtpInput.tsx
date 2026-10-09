import React, { useMemo, useRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { VemtapText } from '@components/ui/Text';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(TextInput, { className: 'style' });

const DEFAULT_OTP_LENGTH = 6;

export type OtpInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  accessibilityLabel?: string;
  autoFocus?: boolean;
  /** Cell count. Owner registration uses a 4-character code; customers use 6. */
  length?: number;
};

/**
 * One-time-code entry backed by a hidden input, so the OS can autofill
 * the code. Shared by registration verification and PIN reset.
 */
export function OtpInput({
  value,
  onChangeText,
  accessibilityLabel,
  autoFocus = false,
  length = DEFAULT_OTP_LENGTH,
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);

  const digits = useMemo(
    () => Array.from({ length }, (_, i) => value[i] ?? ''),
    [length, value],
  );
  const activeIndex = Math.min(value.length, length - 1);
  const cellIds = useMemo(
    () => Array.from({ length }, (_, i) => `otp-cell-${length}-${i}`),
    [length],
  );
  const resolvedAccessibilityLabel =
    accessibilityLabel ?? `${length}-digit verification code`;

  return (
    <Pressable
      className="my-2 w-full items-center"
      onPress={() => inputRef.current?.focus()}
      accessibilityRole="none"
    >
      <View className="w-full max-w-[345px] flex-row justify-between gap-1.5">
        {cellIds.map((cellId, i) => {
          const d = digits[i];
          const isActive = i === activeIndex && value.length < length;
          const isFilled = Boolean(d);
          return (
            <View
              key={cellId}
              className={
                isActive
                  ? 'h-14 min-w-0 max-w-[52px] flex-1 items-center justify-center overflow-hidden rounded-xl bg-surface-canvas shadow-md'
                  : isFilled
                    ? 'h-14 min-w-0 max-w-[52px] flex-1 items-center justify-center rounded-xl bg-surface-subtle shadow-sm'
                    : 'h-14 min-w-0 max-w-[52px] flex-1 items-center justify-center rounded-xl bg-surface-container-low shadow-sm'
              }
            >
              {isActive ? (
                <View className="h-6 w-0.5 rounded-full bg-primary" />
              ) : isFilled ? (
                <VemtapText className="font-sans-semibold text-heading-md text-primary">
                  {d}
                </VemtapText>
              ) : (
                <VemtapText className="text-heading-md text-text-tertiary">•</VemtapText>
              )}
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        caretHidden
        className="absolute h-14 w-full opacity-0"
        accessibilityLabel={resolvedAccessibilityLabel}
        autoFocus={autoFocus}
      />
    </Pressable>
  );
}
