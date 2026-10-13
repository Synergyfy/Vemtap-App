import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { notificationsApi } from '@api/notificationsApi';
import { requestPushPermission } from '@services/pushNotifications';
import { useAuthStore } from '@store/authStore';
import { logger } from '@utils/logger';

/**
 * Ties this device's push token to the signed-in account.
 *
 * A token that is minted but never sent is an address nobody can write to, so
 * every notification is skipped in the worker while the app looks configured.
 * Registration therefore has to be an effect of *being signed in*, not a one-off
 * at launch: the token is minted before sign-in (the permission prompt needs no
 * session) and the account only exists after it.
 *
 * Re-runs are cheap and idempotent — the backend upserts on the token — but they
 * are still guarded, because a re-run per foreground is what turns a background
 * signal into a request storm. The prompt itself is never re-shown: a user who
 * declined the system prompt is asked once, and `getExpoPushTokenAsync` would
 * otherwise keep failing on a denied permission.
 *
 * Registration clears on sign-out. Leaving the token behind means the account
 * that left keeps being pushed to on a phone that is no longer theirs, and the
 * server has no way to tell that apart from a legitimate device.
 */
export function usePushTokenRegistration(): void {
  const accountKey = useAuthStore(state => state.user?.uniqueCode);
  const isAuthenticated = useAuthStore(state => Boolean(state.user));

  const registeredFor = useRef<string | null>(null);
  const inFlight = useRef(false);

  const register = useCallback(async () => {
    // Guard the mutation, not the account: a token acquired earlier in the
    // session still belongs to whichever account is signed in now.
    if (inFlight.current) return;
    if (!useAuthStore.getState().user) return;

    inFlight.current = true;
    try {
      const token = await requestPushPermission();
      if (!token) {
        // Expo Go, a denied prompt, or a build with no EAS project id. All
        // expected — the app stays usable without push, so this is informational.
        registeredFor.current = null;
        return;
      }
      await notificationsApi.registerPushToken(token, {
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
      });
      registeredFor.current = useAuthStore.getState().user?.uniqueCode ?? null;
      logger.info('push', 'Push token registered with the account');
    } catch (error) {
      logger.warn('push', 'Push token registration failed', error);
    } finally {
      inFlight.current = false;
    }
  }, []);

  const clear = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      // No token argument: a logout revokes every device on the account, not
      // just the one that happened to sign out.
      await notificationsApi.clearPushToken();
      registeredFor.current = null;
    } catch (error) {
      // Best-effort. The session is already gone, so a failed revoke must not
      // block sign-out — it leaves a stale row that the next registration
      // for that account upserts over.
      logger.warn('push', 'Push token clear failed', error);
    } finally {
      inFlight.current = false;
    }
  }, []);

  // Register when an account appears, and when the active account changes — a
  // role switch (owner <-> customer) is a different account on the same phone,
  // so the token has to move with it.
  useEffect(() => {
    if (!isAuthenticated || !accountKey) return;
    if (registeredFor.current === accountKey) return;
    register();
  }, [isAuthenticated, accountKey, register]);

  // Revoke on the way out. Reading the store directly rather than depending on
  // `isAuthenticated` means this fires on unmount too, which is what covers a
  // cold sign-out during a background teardown.
  useEffect(() => {
    if (isAuthenticated) return;
    if (registeredFor.current === null) return;
    clear();
  }, [isAuthenticated, clear]);
}
