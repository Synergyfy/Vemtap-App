import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'light'; // design system is light-only for now

interface UiState {
  themePreference: ThemePreference;
  isOfflineBannerVisible: boolean;
  toast: { message: string; type: 'info' | 'success' | 'error' } | null;
  setThemePreference: (preference: ThemePreference) => void;
  setOfflineBannerVisible: (visible: boolean) => void;
  showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
  hideToast: () => void;
}

export const useUiStore = create<UiState>()(
  devtools(
    persist(
      set => ({
        themePreference: 'light',
        isOfflineBannerVisible: false,
        toast: null,
        setThemePreference: () => {}, // light-only; no dark/system switching
        setOfflineBannerVisible: isOfflineBannerVisible =>
          set({ isOfflineBannerVisible }),
        showToast: (message, type = 'info') => set({ toast: { message, type } }),
        hideToast: () => set({ toast: null }),
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
