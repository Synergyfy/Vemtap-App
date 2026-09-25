import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type GestureResponderEvent,
} from 'react-native';
import { cssInterop } from 'nativewind';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@utils/cn';
import { VemtapText } from '@components/ui/Text';

cssInterop(Pressable, { className: 'style' });

const buttonVariants = tv({
  base: [
    'flex-row items-center justify-center rounded-cta',
    'min-h-[52px] px-6',
    'active:scale-[0.98]',
  ],
  variants: {
    variant: {
      primary: ['bg-primary active:bg-primary-600'],
      secondary: ['border border-border-active bg-surface-tint active:bg-primary-100'],
      outline: ['border border-border bg-transparent active:bg-surface-muted'],
      ghost: ['bg-transparent active:bg-surface-muted'],
      destructive: ['bg-error active:opacity-90'],
      success: ['bg-success active:opacity-90'],
    },
    size: {
      sm: ['min-h-[44px] rounded-field px-4'],
      md: ['min-h-[52px] px-6'],
      lg: ['min-h-[56px] px-8'],
    },
    fullWidth: {
      true: ['w-full'],
      false: [],
    },
    isDisabled: {
      true: ['opacity-50', 'active:scale-100 active:opacity-50'],
      false: [],
    },
    isBusy: {
      true: ['opacity-80'],
      false: [],
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    fullWidth: true,
    isDisabled: false,
    isBusy: false,
  },
});

const labelVariants = tv({
  base: ['shrink text-center font-sans-semibold text-button-md'],
  variants: {
    variant: {
      primary: 'text-primary-foreground',
      secondary: 'text-primary',
      outline: 'text-text',
      ghost: 'text-text',
      destructive: 'text-error-foreground',
      success: 'text-success-foreground',
    },
  },
  defaultVariants: { variant: 'primary' },
});

export interface ButtonProps
  extends Omit<PressableProps, 'disabled'>, VariantProps<typeof buttonVariants> {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  labelNumberOfLines?: number;
}

/**
 * Reusable CTA button. Visual variants live in the tailwind-variants config;
 * callers override layout via `className` without fighting state styles.
 *
 * Accessibility: role=button, disabled/busy state, dynamic font scaling.
 */
export function Button({
  label,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  className,
  labelClassName,
  labelNumberOfLines = 2,
  onPress,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (isDisabled) {
        return;
      }
      onPress?.(event);
    },
    [isDisabled, onPress],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={label}
      disabled={isDisabled}
      onPress={handlePress}
      className={cn(
        buttonVariants({ variant, size, fullWidth, isDisabled, isBusy: loading }),
        className,
      )}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFFFFF' : '#066CF4'}
          accessibilityLabel="Loading"
        />
      ) : (
        <>
          {leftIcon || null}
          <VemtapText
            className={cn(labelVariants({ variant }), labelClassName)}
            numberOfLines={labelNumberOfLines}
          >
            {label}
          </VemtapText>
          {rightIcon || null}
        </>
      )}
    </Pressable>
  );
}
