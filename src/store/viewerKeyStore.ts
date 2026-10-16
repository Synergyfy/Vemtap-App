import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** A random, anonymous key: no device or account data in it. */
export function newViewerKey(): string {
  const random = Math.random().toString(36).slice(2, 12).padEnd(10, '0');
  return `v-${Date.now().toString(36)}-${random}`;
}

interface ViewerKeyState {
  /** Counts this install once per hour in promoted-deal reach. */
  key: string;
}

/**
 * The anonymous viewer key for promoted-deal analytics. Generated once and
 * kept across launches, so reach counts people rather than app opens.
 */
export const useViewerKeyStore = create<ViewerKeyState>()(
  persist(() => ({ key: newViewerKey() }), {
    name: 'vemtap-viewer-key',
    storage: createJSONStorage(() => AsyncStorage),
  }),
);
