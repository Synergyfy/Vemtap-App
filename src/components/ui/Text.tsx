import React from 'react';
import { Text as RNText, type TextProps } from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';
import {
  textVariants,
  typeMetrics,
  typeSizeClassPattern,
  type TextVariant,
} from '@theme/typography';
import { useTypeDensity } from '@theme/TypeDensityProvider';

cssInterop(RNText, { className: 'style' });

type Variant = TextVariant;

type Tone =
  'default' | 'secondary' | 'tertiary' | 'inverse' | 'brand' | 'error' | 'success';

export interface VemtapTextProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}

const fontWeightClasses = {
  display: 'font-sans-bold',
  displayMobile: 'font-sans-bold',
  headingXl: 'font-sans-semibold',
  headingLg: 'font-sans-semibold',
  headingMd: 'font-sans-semibold',
  headingSm: 'font-sans-semibold',
  bodyLg: 'font-sans',
  bodyMd: 'font-sans',
  labelMd: 'font-sans-medium',
  labelSm: 'font-sans-medium',
  micro: 'font-sans',
  caption: 'font-sans',
  button: 'font-sans-semibold',
} as const satisfies Record<Variant, string>;

const trackingClasses = {
  display: 'tracking-tight',
  displayMobile: 'tracking-tight',
  headingXl: 'tracking-tight',
  headingLg: 'tracking-tight',
  headingMd: 'tracking-tight',
} as const satisfies Partial<Record<Variant, string>>;

/**
 * Size comes from the shared type scale in `src/theme/typography.ts`, which is
 * also what generates the Tailwind `text-*` utilities — so a scale change
 * updates every screen at once. Under the `compact` density the size utility
 * is dropped and the compact metrics are applied numerically instead.
 */
const toneClasses: Record<Tone, string> = {
  default: 'text-text',
  secondary: 'text-text-secondary',
  tertiary: 'text-text-tertiary',
  inverse: 'text-text-inverse',
  brand: 'text-primary',
  error: 'text-error',
  success: 'text-success',
};

/** Drops only the scale's own size utilities so a density can take over. */
function stripSizeClasses(className?: string): string | undefined {
  if (!className) return className;
  return className
    .split(/\s+/)
    .filter(token => token && !typeSizeClassPattern.test(token))
    .join(' ');
}

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
  const density = useTypeDensity();
  const scaled = density !== 'default';
  const token = textVariants[variant];
  const sizeClass = scaled ? undefined : `text-${token}`;

  return (
    <RNText
      allowFontScaling
      maxFontSizeMultiplier={1.8}
      className={cn(
        'font-sans',
        fontWeightClasses[variant],
        trackingClasses[variant as keyof typeof trackingClasses],
        sizeClass,
        toneClasses[tone],
        scaled ? stripSizeClasses(className) : className,
      )}
      {...rest}
      style={scaled ? [rest.style, typeMetrics(token, density)] : rest.style}
    >
      {children}
    </RNText>
  );
}

/** Alias so screens can `import { Text } from '@components/ui/Text'`. */
export const Text = VemtapText;
