/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ['./App.tsx', './index.js', './src/**/*.{js,jsx,ts,tsx}'],
  // Text.tsx builds its size classes from the shared scale, so the size
  // utilities are not always visible as literals during content scanning.
  safelist: Object.keys(require('./src/theme/typography').typeScale).map(
    token => `text-${token}`,
  ),
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#066CF4',
          50: '#EEF5FF',
          100: '#D9E8FF',
          200: '#BBD7FF',
          300: '#8DBEFF',
          400: '#4A96FF',
          500: '#066CF4',
          600: '#0559CA',
          700: '#00429B',
          800: '#003070',
          900: '#001F4D',
          foreground: '#FFFFFF',
          container: '#066CF4',
          'on-container': '#FCFAFF',
          fixed: '#D9E2FF',
        },
        secondary: {
          DEFAULT: '#4A5E88',
          foreground: '#FFFFFF',
          container: '#BACFFF',
          fixed: '#D8E2FF',
        },
        tertiary: {
          DEFAULT: '#A13900',
          container: '#C94A03',
          'on-container': '#FFFAF9',
          fixed: '#FFB599',
        },
        'inverse-surface': '#293040',
        'inverse-on-surface': '#EDF0FF',
        'on-secondary-container': '#435881',
        background: {
          DEFAULT: '#F9F9FF',
          dark: '#0B1220',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8FAFC',
          tint: '#EEF5FF',
          dark: '#141B2B',
          'tint-blue': '#EEF5FF',
          subtle: '#F8FAFC',
          canvas: '#FFFFFF',
          'container-lowest': '#FFFFFF',
          'container-low': '#F1F3FF',
          container: '#E9EDFF',
          'container-high': '#E1E8FD',
          'container-highest': '#DCE2F7',
          dim: '#D3DAEF',
          bright: '#F9F9FF',
        },
        text: {
          DEFAULT: '#111827',
          secondary: '#4B5563',
          tertiary: '#9CA3AF',
          inverse: '#F9FAFB',
        },
        border: {
          DEFAULT: '#E5E7EB',
          active: '#BFDBFE',
          dark: '#293040',
        },
        success: {
          DEFAULT: '#059669',
          foreground: '#FFFFFF',
          container: '#ECFDF5',
        },
        error: {
          DEFAULT: '#BA1A1A',
          foreground: '#FFFFFF',
          container: '#FFDAD6',
        },
        warning: {
          DEFAULT: '#D97706',
          foreground: '#FFFFFF',
          container: '#FEF3C7',
        },
        'on-surface': '#141B2B',
        'on-background': '#141B2B',
        outline: '#727786',
        'outline-variant': '#C2C6D7',
        'badge-discount-bg': '#ECFDF5',
        'badge-discount-text': '#059669',
        navy: '#0D254C',
      },
      fontFamily: {
        sans: ['Inter'],
        'sans-medium': ['Inter-Medium'],
        'sans-semibold': ['Inter-SemiBold'],
        'sans-bold': ['Inter-Bold'],
        inter: ['Inter'],
      },
      // Text sizes come from the single source of truth: src/theme/typography.ts
      fontSize: Object.fromEntries(
        Object.entries(require('./src/theme/typography').typeScale).map(
          ([token, metric]) => [
            token,
            [`${metric.size}px`, { lineHeight: `${metric.lineHeight}px` }],
          ],
        ),
      ),
      spacing: {
        gutter: '1rem',
        screen: '1.5rem',
        '2xs': '0.25rem',
      },
      borderRadius: {
        field: '14px',
        cta: '16px',
        card: '16px',
        'card-lg': '20px',
      },
      maxWidth: {
        screen: '393px',
        'screen-lg': '768px',
      },
      // Soft, flat elevation only — never hard/3D pop-out shadows.
      // Default scale = reduced (all screens). onboard-* = stronger, first 3 onboarding screens only.
      // Cards need enough drop to read against bg-background (#F9F9FF) without looking heavy.
      boxShadow: {
        xs: '0 1px 3px rgba(15, 23, 42, 0.08)',
        sm: '0 2px 6px rgba(15, 23, 42, 0.12)',
        DEFAULT: '0 3px 8px rgba(15, 23, 42, 0.13)',
        md: '0 4px 12px rgba(15, 23, 42, 0.15)',
        lg: '0 6px 16px rgba(15, 23, 42, 0.16)',
        xl: '0 8px 20px rgba(15, 23, 42, 0.17)',
        '2xl': '0 10px 24px rgba(15, 23, 42, 0.19)',
        inner: 'inset 0 1px 3px rgba(15, 23, 42, 0.07)',
        none: 'none',
        'onboard-sm': '0 3px 10px rgba(15, 23, 42, 0.18)',
        'onboard-md': '0 6px 20px rgba(15, 23, 42, 0.22)',
        'onboard-lg': '0 10px 28px rgba(15, 23, 42, 0.26)',
        'onboard-xl': '0 14px 36px rgba(15, 23, 42, 0.30)',
      },
      // Android `elevation` for every boxShadow key above (keys must match 1:1).
      // NativeWind reads theme("elevation")[boxShadowKey] when emitting `-rn-elevation`.
      // Values MUST be unitless numeric strings — never `'2px'` (Android ignores those).
      // Android-only: iOS uses boxShadow blur/opacity above; bump these to strengthen
      // Android shadows without changing iOS. Without an entry, NativeWind falls back
      // to blur radius (wrong for our soft scale; can emit `px` for onboard-*).
      elevation: {
        xs: '3',
        sm: '6',
        DEFAULT: '8',
        md: '12',
        lg: '14',
        xl: '16',
        '2xl': '18',
        inner: '0',
        none: '0',
        'onboard-sm': '6',
        'onboard-md': '9',
        'onboard-lg': '12',
        'onboard-xl': '16',
      },
      screens: {
        tablet: '768px',
        'tablet-lg': '1024px',
      },
    },
  },
  plugins: [],
};
