/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ['./App.tsx', './index.js', './src/**/*.{js,jsx,ts,tsx}'],
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
        },
        secondary: {
          DEFAULT: '#4A5E88',
          foreground: '#FFFFFF',
        },
        background: {
          DEFAULT: '#F9F9FF',
          dark: '#0B1220',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8FAFC',
          tint: '#EEF5FF',
          dark: '#141B2B',
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
        error: {
          DEFAULT: '#BA1A1A',
          foreground: '#FFFFFF',
          container: '#FFDAD6',
        },
        success: {
          DEFAULT: '#059669',
          foreground: '#FFFFFF',
          container: '#ECFDF5',
        },
        warning: {
          DEFAULT: '#D97706',
          foreground: '#FFFFFF',
          container: '#FEF3C7',
        },
        navy: '#0D254C',
      },
      fontFamily: {
        sans: ['Inter'],
        inter: ['Inter'],
      },
      fontSize: {
        caption: ['12px', { lineHeight: '16px' }],
        'label-sm': ['13px', { lineHeight: '16px' }],
        'label-md': ['14px', { lineHeight: '18px' }],
        'body-md': ['15px', { lineHeight: '22px' }],
        'button-md': ['16px', { lineHeight: '20px' }],
        'body-lg': ['17px', { lineHeight: '24px' }],
        'heading-sm': ['18px', { lineHeight: '24px' }],
        'heading-md': ['22px', { lineHeight: '28px' }],
        'heading-lg': ['26px', { lineHeight: '34px' }],
        'display-mobile': ['32px', { lineHeight: '40px' }],
        display: ['36px', { lineHeight: '44px' }],
      },
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
      screens: {
        tablet: '768px',
        'tablet-lg': '1024px',
      },
    },
  },
  plugins: [],
};
