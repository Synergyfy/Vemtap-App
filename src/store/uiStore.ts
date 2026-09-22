import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'vemtap-non-sensitive' });

const zustandStorage = {
  getItem: (name: string): string | null => storage.getString(name) ?? null,
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.remove(name);
  },
};

export type ThemePreference = 'system' | 'light' | 'dark';

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
        themePreference: 'system',
        isOfflineBannerVisible: false,
        toast: null,
        setThemePreference: themePreference => set({ themePreference }),
        setOfflineBannerVisible: isOfflineBannerVisible =>
          set({ isOfflineBannerVisible }),
        showToast: (message, type = 'info') => set({ toast: { message, type } }),
        hideToast: () => set({ toast: null }),
      }),
      {
        name: 'vemtap-ui',
        storage: createJSONStorage(() => zustandStorage),
        partialize: state => ({ themePreference: state.themePreference }),
      },
    ),
    { name: 'UiStore' },
  ),
);
