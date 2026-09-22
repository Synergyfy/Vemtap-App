import React from 'react';
import { Text as RNText, type TextProps } from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';

cssInterop(RNText, { className: 'style' });

type Variant =
  | 'display'
  | 'displayMobile'
  | 'headingLg'
  | 'headingMd'
  | 'headingSm'
  | 'bodyLg'
  | 'bodyMd'
  | 'labelMd'
  | 'labelSm'
  | 'caption'
  | 'button';

type Tone = 'default' | 'secondary' | 'tertiary' | 'inverse' | 'brand' | 'error' | 'success';

export interface VemtapTextProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  display: 'text-display font-bold tracking-tight',
  displayMobile: 'text-display-mobile font-bold tracking-tight',
  headingLg: 'text-heading-lg font-semibold tracking-tight',
  headingMd: 'text-heading-md font-semibold tracking-tight',
  headingSm: 'text-heading-sm font-semibold',
  bodyLg: 'text-body-lg',
  bodyMd: 'text-body-md',
  labelMd: 'text-label-md font-medium',
  labelSm: 'text-label-sm font-medium',
  caption: 'text-caption',
  button: 'text-button-md font-semibold',
};

const toneClasses: Record<Tone, string> = {
  default: 'text-text',
  secondary: 'text-text-secondary',
  tertiary: 'text-text-tertiary',
  inverse: 'text-text-inverse',
  brand: 'text-primary',
  error: 'text-error',
  success: 'text-success',
};

/**
 * Themed Text using Tailwind tokens from tailwind.config.js.
 * Supports dynamic font scaling — never hardcode pixel sizes inline.
 */
export function VemtapText({
  variant = 'bodyMd',
  tone = 'default',
  className,
  children,
  ...rest
}: VemtapTextProps) {
  return (
    <RNText
      allowFontScaling
      maxFontSizeMultiplier={1.8}
      className={cn(
        'font-sans',
        variantClasses[variant],
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </RNText>
  );
}

/** Alias so screens can `import { Text } from '@components/ui/Text'`. */
export const Text = VemtapText;
