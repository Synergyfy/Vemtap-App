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

/**
 * Soft elevation tokens, mirroring `tailwind.config.js` → `theme.boxShadow`.
 * Keep in sync. Applied through the plain `style` prop (never `className`) so
 * switching one on/off can't change a NativeWind className string, which
 * css-interop treats as an "upgrade" and remounts the component.
 *
 * iOS uses shadow* + elevation; Android honours elevation only.
 */
export const shadowTokens = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 14,
  },
  xl: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.17,
    shadowRadius: 20,
    elevation: 16,
  },
} as const;

export type ShadowToken = keyof typeof shadowTokens;
