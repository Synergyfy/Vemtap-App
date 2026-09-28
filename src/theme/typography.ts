/**
 * Canonical type scale — the single source of truth for every text size.
 *
 * Sizing notes: the 11–18px steps form a dense ladder and are held at the
 * accessibility floor (do not shrink `micro`/`caption` further — they become
 * illegible on low-density Android screens). The display end is deliberately
 * compact (titles land at 20–27px rather than 22–30px) and every line height
 * is tightened so blocks of copy leave breathing room on short devices.
 *
 * Consumed by:
 *  - `tailwind.config.js` (generates the `text-*` utilities)
 *  - `src/components/ui/Text.tsx` (the `variant` prop)
 *  - StyleSheet-based RN styles (inputs, native tab bar labels) that need
 *    numeric font sizes instead of classNames.
 *
 * Change a value here and every screen updates. Do not add raw pixel font
 * sizes to screens, and do not add a second copy of these numbers.
 */
export const typeScale = {
  micro: { size: 11, lineHeight: 13 },
  caption: { size: 12, lineHeight: 15 },
  'label-sm': { size: 13, lineHeight: 16 },
  'label-md': { size: 14, lineHeight: 17 },
  'body-md': { size: 15, lineHeight: 20 },
  'button-md': { size: 16, lineHeight: 19 },
  'body-lg': { size: 17, lineHeight: 22 },
  'heading-sm': { size: 18, lineHeight: 23 },
  'heading-md': { size: 20, lineHeight: 25 },
  'heading-lg': { size: 24, lineHeight: 31 },
  'heading-xl': { size: 27, lineHeight: 33 },
  'display-mobile': { size: 29, lineHeight: 36 },
  display: { size: 33, lineHeight: 40 },
} as const;

export type TypeScaleToken = keyof typeof typeScale;

/**
 * Compact density — used by dense hubs (currently the Account tab) where the
 * default scale reads as crowded. Body/label sizes are held at the same
 * legibility floor; the gain comes from tighter line heights and smaller
 * headings, so copy stays readable while blocks of text reclaim vertical space.
 */
export const compactTypeScale = {
  micro: { size: 11, lineHeight: 12 },
  caption: { size: 12, lineHeight: 14 },
  'label-sm': { size: 13, lineHeight: 15 },
  'label-md': { size: 14, lineHeight: 16 },
  'body-md': { size: 15, lineHeight: 19 },
  'button-md': { size: 16, lineHeight: 18 },
  'body-lg': { size: 17, lineHeight: 21 },
  'heading-sm': { size: 18, lineHeight: 22 },
  'heading-md': { size: 19, lineHeight: 24 },
  'heading-lg': { size: 22, lineHeight: 28 },
  'heading-xl': { size: 24, lineHeight: 29 },
  'display-mobile': { size: 26, lineHeight: 32 },
  display: { size: 29, lineHeight: 36 },
} as const satisfies Record<TypeScaleToken, { size: number; lineHeight: number }>;

export type TypeMetrics = { size: number; lineHeight: number };

/**
 * Dense density — the tightest tier, for single screens that are still
 * information-dense inside an already-compact hub (currently Rewards &
 * Loyalty). Body/label sizes sit on the same legibility floor as `compact`;
 * the extra room comes from leading and from trimming the heading end again.
 */
export const denseTypeScale = {
  micro: { size: 11, lineHeight: 12 },
  caption: { size: 12, lineHeight: 14 },
  'label-sm': { size: 13, lineHeight: 15 },
  'label-md': { size: 14, lineHeight: 16 },
  'body-md': { size: 15, lineHeight: 19 },
  'button-md': { size: 16, lineHeight: 18 },
  'body-lg': { size: 17, lineHeight: 20 },
  'heading-sm': { size: 18, lineHeight: 21 },
  'heading-md': { size: 19, lineHeight: 23 },
  'heading-lg': { size: 21, lineHeight: 26 },
  'heading-xl': { size: 23, lineHeight: 28 },
  'display-mobile': { size: 25, lineHeight: 30 },
  display: { size: 28, lineHeight: 34 },
} as const satisfies Record<TypeScaleToken, TypeMetrics>;

/**
 * Comfortable density — same sizes as `compact` but with looser line heights,
 * for text-heavy screens that read as vertically cramped on Android. Used by
 * the customer dashboard (Account) flow, where headings and rows sit close
 * together and need extra leading rather than smaller glyphs.
 */
export const comfortableTypeScale = {
  micro: { size: 11, lineHeight: 14 },
  caption: { size: 12, lineHeight: 16 },
  'label-sm': { size: 13, lineHeight: 18 },
  'label-md': { size: 14, lineHeight: 20 },
  'body-md': { size: 15, lineHeight: 22 },
  'button-md': { size: 16, lineHeight: 21 },
  'body-lg': { size: 17, lineHeight: 24 },
  'heading-sm': { size: 18, lineHeight: 25 },
  'heading-md': { size: 19, lineHeight: 27 },
  'heading-lg': { size: 22, lineHeight: 31 },
  'heading-xl': { size: 24, lineHeight: 33 },
  'display-mobile': { size: 26, lineHeight: 35 },
  display: { size: 29, lineHeight: 39 },
} as const satisfies Record<TypeScaleToken, TypeMetrics>;

export type TypeDensity = 'default' | 'compact' | 'comfortable' | 'dense';

export const typeScales: Record<TypeDensity, Record<TypeScaleToken, TypeMetrics>> = {
  default: typeScale,
  compact: compactTypeScale,
  comfortable: comfortableTypeScale,
  dense: denseTypeScale,
};

/** Matches only the scale's own size utilities (never colour/text tones). */
export const typeSizeClassPattern = new RegExp(
  `^text-(${Object.keys(typeScale).join('|')})$`,
);

/** Named `VemtapText` variants that map 1:1 onto the scale above. */
export const textVariants = {
  display: 'display',
  displayMobile: 'display-mobile',
  headingXl: 'heading-xl',
  headingLg: 'heading-lg',
  headingMd: 'heading-md',
  headingSm: 'heading-sm',
  bodyLg: 'body-lg',
  bodyMd: 'body-md',
  labelMd: 'label-md',
  labelSm: 'label-sm',
  micro: 'micro',
  caption: 'caption',
  button: 'button-md',
} as const;

export type TextVariant = keyof typeof textVariants;

/**
 * Numeric font size/line height for RN styles that cannot use classNames
 * (TextInput, and React Navigation's native tab bar label style).
 */
export function typeMetrics(
  token: TypeScaleToken,
  density: TypeDensity = 'default',
): {
  fontSize: number;
  lineHeight: number;
} {
  const { size, lineHeight } = typeScales[density][token];
  return { fontSize: size, lineHeight };
}
