/**
 * Design-system color tokens (mirrors tailwind.config.js theme). Keep in sync.
 * Source of truth: stitch_vemtap_design_system/vemtap_native_mobile/DESIGN.md.
 */
export const colors = {
  primary: '#066CF4',
  primary600: '#0559CA',
  primaryContainer: '#066CF4',
  primaryFixed: '#D9E2FF',
  primaryFixedDim: '#B0C6FF',
  secondaryFixed: '#D8E2FF',
  secondary: '#4A5E88',
  tertiary: '#A13900',
  outline: '#727786',
  surface: '#FFFFFF',
  surfaceMuted: '#F8FAFC',
  surfaceTint: '#EEF5FF',
  surfaceContainerLow: '#F1F3FF',
  surfaceContainer: '#E9EDFF',
  surfaceContainerHigh: '#E1E8FD',
  surfaceContainerHighest: '#DCE2F7',
  surfaceDark: '#141B2B',
  background: '#F9F9FF',
  text: '#111827',
  textSecondary: '#4B5563',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  borderActive: '#BFDBFE',
  tertiaryContainer: '#C94A03',
  tertiaryFixed: '#FFB599',
  inverseSurface: '#293040',
  inverseOnSurface: '#EDF0FF',
  onSecondaryContainer: '#435881',
  onSurfaceVariant: '#424655',
  onSecondaryFixed: '#001A41',
  badgeDiscountBg: '#ECFDF5',
  badgeDiscountText: '#059669',
  error: '#BA1A1A',
  success: '#059669',
  warning: '#D97706',
  navy: '#0D254C',
} as const;

export type ColorTokens = typeof colors;
