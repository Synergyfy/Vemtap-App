import React from 'react';
import { Platform, Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';
import { VemtapText } from '@components/ui/Text';

cssInterop(TextInput, { className: 'style' });
cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface InputProps extends Omit<TextInputProps, 'className'> {
  label?: string;
  error?: string;
  containerClassName?: string;
  className?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onTrailingIconPress?: () => void;
  trailingIconLabel?: string;
}

/** Text input styled to design-system field spec (52px, radius 14, focus ring). */
export const Input = React.forwardRef<React.ComponentRef<typeof TextInput>, InputProps>(
  (
    {
      label,
      error,
      containerClassName,
      className,
      leadingIcon,
      trailingIcon,
      onTrailingIconPress,
      trailingIconLabel,
      accessibilityLabel,
      style,
      ...rest
    },
    ref,
  ) => (
    <View className={cn('gap-1.5', containerClassName)}>
      {label ? (
        <VemtapText variant="labelMd" tone="secondary">
          {label}
        </VemtapText>
      ) : null}
      <View
        className={cn(
          Platform.OS === 'android'
            ? 'h-[52px] flex-row items-center overflow-hidden rounded-field border bg-surface'
            : 'relative justify-center',
          error ? 'border-error' : 'border-border',
          className,
        )}
      >
        {Platform.OS === 'android' && leadingIcon ? (
          <View className="pl-4 pr-1">{leadingIcon}</View>
        ) : null}
        {Platform.OS !== 'android' && leadingIcon ? (
          <View
            className="absolute bottom-0 left-4 top-0 z-10 justify-center"
            pointerEvents="none"
          >
            {leadingIcon}
          </View>
        ) : null}
        <TextInput
          ref={ref}
          accessibilityLabel={accessibilityLabel ?? label}
          aria-invalid={Boolean(error)}
          className={cn(
            Platform.OS === 'android'
              ? 'h-full min-w-0 flex-1 border-0 bg-transparent text-body-md text-text'
              : 'h-[52px] rounded-field border bg-surface text-body-md text-text',
            Platform.OS === 'android'
              ? leadingIcon
                ? 'pl-1 pr-4'
                : 'px-4'
              : leadingIcon
                ? 'pl-11 pr-4'
                : 'px-4',
            Platform.OS === 'android' && trailingIcon ? 'pr-0' : null,
            'placeholder:text-text-tertiary',
            className,
          )}
          style={
            Platform.OS === 'android'
              ? [{ textAlignVertical: 'center', includeFontPadding: false }, style]
              : style
          }
          underlineColorAndroid="transparent"
          {...rest}
        />
        {Platform.OS === 'android' && trailingIcon ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={trailingIconLabel}
            hitSlop={8}
            disabled={!onTrailingIconPress}
            className="px-4"
            onPress={onTrailingIconPress}
          >
            {trailingIcon}
          </Pressable>
        ) : null}
        {Platform.OS !== 'android' && trailingIcon ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={trailingIconLabel}
            hitSlop={8}
            disabled={!onTrailingIconPress}
            className={cn(
              'absolute bottom-0 right-0 top-0 z-10 items-center justify-center px-4',
              !onTrailingIconPress && 'opacity-100',
            )}
            onPress={onTrailingIconPress}
          >
            {trailingIcon}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <VemtapText variant="labelSm" tone="error" accessibilityRole="alert">
          {error}
        </VemtapText>
      ) : null}
    </View>
  ),
);
