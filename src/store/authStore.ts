import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@api/authApi';

/**
 * Auth store — holds the *public* session shape (user profile, auth status).
 * Tokens never live here: they are read from expo-secure-store on demand.
 *
 * `onboarding` is the state a freshly registered account sits in until the
 * location step finishes. Registration returns a real API session, but the app
 * must stay in `AuthStack` until `DiscoveringNearbyDeals` promotes the account
 * to `authenticated` — otherwise `RootNavigator` swaps the whole navigator out
 * mid-flow and the location screens are never reached.
 */
type AuthStatus = 'unknown' | 'onboarding' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: Session['user'] | null;
  status: AuthStatus;
  /** Set when the account is created but still owes us a location. */
  pendingOnboarding: boolean;
  setSession: (session: Session) => void;
  /** Registered + session stored, but location onboarding is still owed. */
  beginOnboarding: (session: Session) => void;
  /** Location step complete — promote to a fully authenticated session. */
  completeOnboarding: () => void;
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
        pendingOnboarding: false,
        // Sign-in and password registration authenticate immediately. Only the
        // customer OTP/PIN signup defers, via `beginOnboarding` — keying this off
        // `isNewUser` would strand a returning user who signed in.
        setSession: session =>
          set({ user: session.user, status: 'authenticated', pendingOnboarding: false }),
        beginOnboarding: session =>
          set({
            user: session.user,
            status: 'onboarding',
            pendingOnboarding: true,
          }),
        completeOnboarding: () =>
          set({ status: 'authenticated', pendingOnboarding: false }),
        setUser: user => set({ user }),
        clearSession: () =>
          set({ user: null, status: 'unauthenticated', pendingOnboarding: false }),
        markUnauthenticated: () =>
          set({ status: 'unauthenticated', pendingOnboarding: false }),
      }),
      {
        name: 'vemtap-auth',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: state => ({
          user: state.user,
          status: state.status,
          pendingOnboarding: state.pendingOnboarding,
        }),
      },
    ),
    { name: 'AuthStore' },
  ),
);

export const selectIsAuthenticated = (s: AuthState): boolean =>
  s.status === 'authenticated';

/** Registered, but still inside AuthStack until the location step completes. */
export const selectNeedsOnboarding = (s: AuthState): boolean => s.status === 'onboarding';
