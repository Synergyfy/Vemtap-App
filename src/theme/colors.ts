/** Design-system color tokens (mirrors tailwind.config.js theme). Keep in sync. */
export const colors = {
  primary: '#066CF4',
  primary600: '#0558C7',
  surface: '#F9F9FF',
  background: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  error: '#DC2626',
  success: '#16A34A',
  navy: '#0F172A',
} as const;

export type ColorTokens = typeof colors;
