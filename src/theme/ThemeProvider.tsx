import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { colorScheme } from 'nativewind';
import { useUiStore, type ThemePreference } from '@store/uiStore';

type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: ResolvedTheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * VEMTAP design system ships light tokens only for onboarding.
 * Always resolve to light so OS dark mode / stale persisted values can
 * never paint the app black.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const setPreference = useUiStore(state => state.setThemePreference);

  const theme: ResolvedTheme = 'light';

  colorScheme.set(theme);

  const toggleTheme = useCallback(() => {
    setPreference('light');
  }, [setPreference]);

  const value = useMemo(
    () => ({ theme, preference: 'light' as ThemePreference, setPreference, toggleTheme }),
    [setPreference, theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
