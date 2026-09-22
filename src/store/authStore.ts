import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';
import type { Session } from '@api/authApi';

/**
 * Auth store — holds the *public* session shape (user profile, auth status).
 * Tokens never live here: they are read from react-native-keychain on demand.
 */

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

interface AuthState {
  user: Session['user'] | null;
  status: 'unknown' | 'authenticated' | 'unauthenticated';
  setSession: (session: Session) => void;
  setUser: (user: Session['user']) => void;
  clearSession: () => void;
  markUnauthenticated: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      set => ({
        user: null,
        status: 'unknown',
        setSession: session => set({ user: session.user, status: 'authenticated' }),
        setUser: user => set({ user }),
        clearSession: () => set({ user: null, status: 'unauthenticated' }),
        markUnauthenticated: () => set({ status: 'unauthenticated' }),
      }),
      {
        name: 'vemtap-auth',
        storage: createJSONStorage(() => zustandStorage),
        partialize: state => ({ user: state.user, status: state.status }),
      },
    ),
    { name: 'AuthStore' },
  ),
);

export const selectIsAuthenticated = (s: AuthState): boolean =>
  s.status === 'authenticated';
