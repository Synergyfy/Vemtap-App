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

/** Which side of a dual-role account the app is currently showing. */
export type ActiveMode = 'customer' | 'business';

interface AuthState {
  user: Session['user'] | null;
  status: AuthStatus;
  /** Set when the account is created but still owes us a location. */
  pendingOnboarding: boolean;
  /**
   * Last-used side. Only meaningful for dual-role accounts; a pure customer
   * account is always coerced to 'customer'.
   */
  activeMode: ActiveMode;
  /** True once the account has an owner side (DB role Owner or a business). */
  ownerAccount: boolean;
  /**
   * Branch selected on any business surface (Overview/Orders/More share it so
   * they can never disagree). Null means "not chosen yet" — the hook resolves
   * the main branch.
   */
  activeBranchId: string | null;
  /**
   * Role the stored access token actually carries. The API authorises on the
   * token, so this — not `user.role` — decides whether a CUSTOMER-scoped call
   * will succeed. `user.role` can drift ahead of the token (an interrupted
   * switch leaves customer mode with an owner token), which is exactly how a
   * Discover bookmark ended up firing `POST /businesses/:id/save` against a
   * 403. Kept in step by `useLogin`/`useSwitchRole` alongside every token
   * write, and read back by `useCustomerTokenSync` to repair a bad one.
   */
  tokenRole: string | null;
  setSession: (session: Session) => void;
  /** Registered + session stored, but location onboarding is still owed. */
  beginOnboarding: (session: Session) => void;
  /** Location step complete — promote to a fully authenticated session. */
  completeOnboarding: () => void;
  setUser: (user: Session['user']) => void;
  /** Flip the active side after `POST /auth/switch-role` succeeds. */
  applyRoleSwitch: (user: Session['user'], mode: ActiveMode) => void;
  setActiveMode: (mode: ActiveMode) => void;
  setActiveBranch: (branchId: string | null) => void;
  /** Record the role carried by the token just written to secure store. */
  setTokenRole: (role: string | null) => void;
  clearSession: () => void;
  markUnauthenticated: () => void;
}

const isOwnerUser = (user: Session['user'] | null): boolean =>
  user?.role?.toLowerCase() === 'owner' || Boolean(user?.businessId);

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      set => ({
        user: null,
        status: 'unknown',
        pendingOnboarding: false,
        // Consumer-first default: a fresh owner login lands in the business
        // app, while customers are always coerced to 'customer' below.
        activeMode: 'business',
        ownerAccount: false,
        activeBranchId: null,
        tokenRole: null,
        // Sign-in and password registration authenticate immediately. Only the
        // customer OTP/PIN signup defers, via `beginOnboarding` — keying this off
        // `isNewUser` would strand a returning user who signed in.
        setSession: session =>
          set(state => {
            const ownerAccount = state.ownerAccount || isOwnerUser(session.user);
            return {
              user: session.user,
              status: 'authenticated',
              pendingOnboarding: false,
              ownerAccount,
              // Preserve the last-used side only while the account actually has
              // an owner side; customers can never be in business mode.
              activeMode: ownerAccount ? state.activeMode : 'customer',
              // The login response's role is the token's role.
              tokenRole: session.user.role ?? null,
            };
          }),
        beginOnboarding: session =>
          set({
            user: session.user,
            status: 'onboarding',
            pendingOnboarding: true,
            ownerAccount: true,
            activeMode: 'business',
            tokenRole: session.user.role ?? null,
          }),
        completeOnboarding: () =>
          set({ status: 'authenticated', pendingOnboarding: false }),
        setUser: user => set({ user }),
        applyRoleSwitch: (user, mode) =>
          set({
            user,
            activeMode: mode,
            ownerAccount: true,
            // The switch always reissues the token for `mode`.
            tokenRole: mode === 'customer' ? 'Customer' : 'Owner',
          }),
        setActiveMode: mode => set({ activeMode: mode }),
        setActiveBranch: branchId => set({ activeBranchId: branchId }),
        setTokenRole: role => set({ tokenRole: role }),
        clearSession: () =>
          set({
            user: null,
            status: 'unauthenticated',
            pendingOnboarding: false,
            ownerAccount: false,
            activeMode: 'business',
            activeBranchId: null,
            tokenRole: null,
          }),
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
          activeMode: state.activeMode,
          ownerAccount: state.ownerAccount,
          activeBranchId: state.activeBranchId,
          tokenRole: state.tokenRole,
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
