import React from 'react';
import { Text as RNText, type TextProps } from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';

cssInterop(RNText, { className: 'style' });

type Variant =
  | 'display'
  | 'displayMobile'
  | 'headingXl'
  | 'headingLg'
  | 'headingMd'
  | 'headingSm'
  | 'bodyLg'
  | 'bodyMd'
  | 'labelMd'
  | 'labelSm'
  | 'micro'
  | 'caption'
  | 'button';

type Tone =
  'default' | 'secondary' | 'tertiary' | 'inverse' | 'brand' | 'error' | 'success';

export interface VemtapTextProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  display: 'font-sans-bold text-display tracking-tight',
  displayMobile: 'font-sans-bold text-display-mobile tracking-tight',
  headingXl: 'font-sans-semibold text-heading-xl tracking-tight',
  headingLg: 'font-sans-semibold text-heading-lg tracking-tight',
  headingMd: 'font-sans-semibold text-heading-md tracking-tight',
  headingSm: 'font-sans-semibold text-heading-sm',
  bodyLg: 'font-sans text-body-lg',
  bodyMd: 'font-sans text-body-md',
  labelMd: 'font-sans-medium text-label-md',
  labelSm: 'font-sans-medium text-label-sm',
  micro: 'font-sans text-micro',
  caption: 'font-sans text-caption',
  button: 'font-sans-semibold text-button-md',
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
      className={cn('font-sans', variantClasses[variant], toneClasses[tone], className)}
      {...rest}
    >
      {children}
    </RNText>
  );
}

/** Alias so screens can `import { Text } from '@components/ui/Text'`. */
export const Text = VemtapText;
