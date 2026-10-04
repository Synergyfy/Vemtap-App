import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { VemtapText } from '@components/ui/Text';
import { Icon } from '@components/ui/Icon';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(TextInput, { className: 'style' });

const styles = StyleSheet.create({
  filledPinBackground: { opacity: 1 },
  filledPinDot: { opacity: 1, transform: [{ scale: 1.25 }] },
  hiddenPinState: { opacity: 0 },
  pinCaret: {
    width: 2,
    height: 24,
    borderRadius: 1,
    backgroundColor: colors.primary,
  },
});

const PIN_LENGTH = 6;
const PIN_SLOT_IDS = Array.from({ length: PIN_LENGTH }, (_, i) => `pin-${i + 1}`);

export type PinInputProps = {
  value: string;
  onPinChange: (value: string) => void;
  label: string;
  counter?: string;
  match?: 'match' | 'mismatch' | null;
  pinVisible: boolean;
  onToggleVisibility: () => void;
  showToggle?: boolean;
};

/**
 * Six-box numeric PIN entry with a blinking caret, optional counter and
 * match/mismatch state. Shared by customer registration and PIN reset so the
 * PIN affordance is only implemented once.
 */
export function PinInput({
  value,
  onPinChange,
  label,
  counter,
  match,
  pinVisible,
  onToggleVisibility,
  showToggle,
}: PinInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const caretOpacity = useRef(new Animated.Value(1)).current;
  const caretActive = focused && value.length < PIN_LENGTH;

  useEffect(() => {
    if (!caretActive) {
      caretOpacity.setValue(1);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(caretOpacity, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(caretOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [caretActive, caretOpacity]);

  return (
    <View className="gap-2 pt-1">
      <View className="flex-row items-center justify-between">
        <VemtapText className="font-sans-medium text-label-sm text-text-secondary">
          {label}
          <VemtapText className="text-error"> *</VemtapText>
        </VemtapText>
        {counter ? (
          <VemtapText className="text-caption text-text-tertiary">{counter}</VemtapText>
        ) : null}
        {match === 'match' ? (
          <View className="flex-row items-center gap-1">
            <Icon name="checkCircle" size={16} color={colors.badgeDiscountText} />
            <VemtapText className="font-sans-semibold text-caption text-badge-discount-text">
              {strings.auth.profilePinMatches}
            </VemtapText>
          </View>
        ) : null}
        {match === 'mismatch' ? (
          <View className="flex-row items-center gap-1">
            <Icon name="close" size={16} color={colors.error} />
            <VemtapText className="font-sans-semibold text-caption text-error">
              {strings.auth.profilePinMismatch}
            </VemtapText>
          </View>
        ) : null}
        {showToggle ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={pinVisible ? strings.auth.hidePin : strings.auth.showPin}
            hitSlop={8}
            onPress={onToggleVisibility}
            className="h-9 w-9 items-center justify-center"
          >
            <Icon
              name={pinVisible ? 'visibilityOff' : 'visibility'}
              size={19}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
      <Pressable onPress={() => inputRef.current?.focus()}>
        <View className="flex-row gap-2">
          {PIN_SLOT_IDS.map((slotId, i) => {
            const filled = i < value.length;
            const isCaretSlot = caretActive && i === value.length;
            return (
              <View
                key={slotId}
                className="h-12 flex-1 items-center justify-center overflow-hidden rounded-xl bg-surface-canvas shadow-sm"
              >
                <View
                  pointerEvents="none"
                  className="absolute inset-0 rounded-xl bg-surface-tint"
                  style={filled ? styles.filledPinBackground : styles.hiddenPinState}
                />
                {isCaretSlot ? (
                  <Animated.View
                    testID={`pin-caret-${slotId}`}
                    style={[styles.pinCaret, { opacity: caretOpacity }]}
                  />
                ) : filled && pinVisible ? (
                  <VemtapText variant="headingMd" className="text-heading-md">
                    {value[i]}
                  </VemtapText>
                ) : (
                  <>
                    <View className="h-2.5 w-2.5 rounded-full bg-surface-dim" />
                    <View
                      pointerEvents="none"
                      className="absolute h-2.5 w-2.5 rounded-full bg-primary"
                      style={filled ? styles.filledPinDot : styles.hiddenPinState}
                    />
                  </>
                )}
              </View>
            );
          })}
        </View>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={t => onPinChange(t.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="number-pad"
          secureTextEntry={!pinVisible}
          maxLength={PIN_LENGTH}
          className="absolute h-12 w-full opacity-0"
          accessibilityLabel={label}
        />
      </Pressable>
    </View>
  );
}
