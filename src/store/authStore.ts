import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@api/authApi';

/**
 * Auth store — holds the *public* session shape (user profile, auth status).
 * Tokens never live here: they are read from expo-secure-store on demand.
 */

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
        storage: createJSONStorage(() => AsyncStorage),
        partialize: state => ({ user: state.user, status: state.status }),
      },
    ),
    { name: 'AuthStore' },
  ),
);

export const selectIsAuthenticated = (s: AuthState): boolean =>
  s.status === 'authenticated';
