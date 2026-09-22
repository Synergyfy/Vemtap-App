import React from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';
import { VemtapText } from '@components/ui/Text';

cssInterop(TextInput, { className: 'style' });
cssInterop(View, { className: 'style' });

export interface InputProps extends Omit<TextInputProps, 'className'> {
  label?: string;
  error?: string;
  containerClassName?: string;
  className?: string;
}

/** Text input styled to design-system field spec (52px, radius 14, focus ring). */
export const Input = React.forwardRef<
  React.ComponentRef<typeof TextInput>,
  InputProps
>(
  (
    { label, error, containerClassName, className, accessibilityLabel, ...rest },
    ref,
  ) => (
    <View className={cn('gap-1.5', containerClassName)}>
      {label ? (
        <VemtapText variant="labelMd" tone="secondary">
          {label}
        </VemtapText>
      ) : null}
      <TextInput
        ref={ref}
        accessibilityLabel={accessibilityLabel ?? label}
        aria-invalid={Boolean(error)}
        className={cn(
          'h-[52px] rounded-field border bg-surface px-4 text-body-md text-text',
          'placeholder:text-text-tertiary',
          error
            ? 'border-error'
            : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/15',
          className,
        )}
        {...rest}
      />
      {error ? (
        <VemtapText variant="labelSm" tone="error" accessibilityRole="alert">
          {error}
        </VemtapText>
      ) : null}
    </View>
  ),
);
