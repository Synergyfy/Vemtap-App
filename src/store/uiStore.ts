import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'light'; // design system is light-only for now

/**
 * App-wide UI flags.
 *
 * Toasts deliberately do not live here any more. They were `showToast` /
 * `hideToast` pairs, and because nothing ever called `hideToast` every message
 * stayed on screen for the life of the session. Popups are now owned by
 * `@components/shared/toast`, which dismisses itself.
 */
interface UiState {
  themePreference: ThemePreference;
  isOfflineBannerVisible: boolean;
  setThemePreference: (preference: ThemePreference) => void;
  setOfflineBannerVisible: (visible: boolean) => void;
}

export const useUiStore = create<UiState>()(
  devtools(
    persist(
      set => ({
        themePreference: 'light',
        isOfflineBannerVisible: false,
        setThemePreference: () => {}, // light-only; no dark/system switching
        setOfflineBannerVisible: isOfflineBannerVisible =>
          set({ isOfflineBannerVisible }),
      }),
      {
        name: 'vemtap-ui',
        storage: createJSONStorage(() => AsyncStorage),
        // Only persist non-theme UI flags. Never rehydrate an old dark/system theme.
        partialize: () => ({}),
      },
    ),
    { name: 'UiStore' },
  ),
);