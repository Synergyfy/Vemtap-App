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
      <View className="relative justify-center">
        {leadingIcon ? (
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
            'h-[52px] rounded-field border bg-surface text-body-md text-text',
            leadingIcon ? 'pl-11 pr-4' : 'px-4',
            trailingIcon ? 'pr-12' : null,
            'placeholder:text-text-tertiary',
            error
              ? 'border-error'
              : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/15',
            className,
          )}
          // Android TextInput can ignore className padding under an absolute
          // leading icon — force inset so typed text never sits under the icon.
          style={
            Platform.OS === 'android' && (leadingIcon || trailingIcon)
              ? [
                  {
                    paddingLeft: leadingIcon ? 44 : 16,
                    paddingRight: trailingIcon ? 48 : 16,
                  },
                  style,
                ]
              : style
          }
          underlineColorAndroid="transparent"
          {...rest}
        />
        {trailingIcon ? (
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
