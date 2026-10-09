import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@api/authApi';
import { useAuthStore } from '@store/authStore';
import { getSecureItem, setTokenPair } from '@utils/secureStorage';
import { logger } from '@utils/logger';

/**
 * Keeps the stored token in step with the side the app is showing.
 *
 * A dual-role account holds two sessions: an owner token for the business app
 * and a customer token for the consumer one. Switching persists the new token,
 * but a switch that is interrupted — app killed mid-request, a failed call, a
 * crash between the token write and the store update — leaves `activeMode`
 * claiming one side while the token authorises the other.
 *
 * The consequence is silent and confusing: customer screens sit behind
 * CUSTOMER-scoped endpoints, so an owner token turns every one of them into a
 * 403. Bookmarks appear inert (the toggle 403s, so the icon never flips) while
 * the Saved Items Hub shows whatever the last customer-mode fetch cached.
 *
 * This runs the switch again whenever the two disagree. It is read-only unless
 * something is actually wrong, so it is safe to call on every foreground.
 */
export function useCustomerTokenSync(): void {
  const queryClient = useQueryClient();
  const activeMode = useAuthStore(state => state.activeMode);
  const ownerAccount = useAuthStore(state => state.ownerAccount);
  const accountKey = useAuthStore(state => state.user?.uniqueCode);

  // A repair already in flight must not be started again — the dependency array
  // below can re-run while a request is open, and a second switch would race the
  // first for the same token slot.
  const inFlight = useRef(false);

  const repair = useMutation({
    mutationFn: async () => {
      const session = await authApi.switchRole({ role: 'Customer' });
      await setTokenPair({ accessToken: session.access_token });
      return session;
    },
    onSuccess: session => {
      useAuthStore.getState().applyRoleSwitch(session.user, 'customer');
      // Anything fetched under the wrong session is now suspect — the Saved Hub
      // in particular can be showing another side's rows from its cache.
      queryClient.invalidateQueries();
    },
    onSettled: () => {
      inFlight.current = false;
    },
  });

  // The effect below keys off `runSync`, and a mutation's object identity
  // changes with every state update (idle → pending → error). Depending on it
  // directly made each of those re-run the effect, so a finished repair
  // scheduled another one — an endless re-issue loop. The mutation is read live
  // through a ref instead, which keeps `runSync` stable.
  const repairRef = useRef(repair);
  repairRef.current = repair;

  const runSync = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const token = await getSecureItem('accessToken');
      if (!token) return;

      // Read the token's role at call time: a foreground restore can land
      // between the state snapshot this closure was created with and now.
      if (useAuthStore.getState().tokenRole === 'Customer') return;

      logger.info('auth', 'Customer mode with a non-customer token — reissuing');
      await repairRef.current.mutateAsync();
    } catch (error) {
      logger.warn('auth', 'Customer token sync failed', error);
    } finally {
      // Only clear when the mutation was never started (an early return above
      // would otherwise leave the latch set forever and block later syncs).
      if (repairRef.current.isIdle) inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    if (activeMode !== 'customer' || !ownerAccount || !accountKey) return;

    void runSync();

    // A token can revert underneath us (expiry + refresh), so re-check on
    // foreground rather than trusting the mount-time read.
    const subscription = AppState.addEventListener('change', next => {
      if (next === 'active') void runSync();
    });

    return () => {
      subscription.remove();
    };
  }, [activeMode, ownerAccount, accountKey, runSync]);
}
