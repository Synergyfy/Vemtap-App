import { useEffect } from 'react';
import { useAuthStore } from '@store/authStore';
import { getSecureItem } from '@utils/secureStorage';
import { logger } from '@utils/logger';

/**
 * Reconciles the persisted auth status against secure storage on cold start.
 *
 * The auth store is persisted, so a crash or an interrupted signup can leave
 * `status: 'authenticated'` on disk with no token behind it. `RootNavigator`
 * trusts that flag, which would mount `AppStack` with no usable session and
 * leave the app unusable with no way back to the signup flow.
 *
 * A registered-but-not-yet-onboarded account (`status: 'onboarding'`) is left
 * alone: its token is already stored, and it must stay in `AuthStack` until the
 * location step completes.
 */
export function useAuthBootstrap(): void {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = await getSecureItem('accessToken');
        if (cancelled) return;

        const { status, markUnauthenticated } = useAuthStore.getState();
        if (status === 'onboarding') return;

        if (!token && status === 'authenticated') {
          logger.warn('auth', 'Persisted session has no token — signing out');
          markUnauthenticated();
        }
      } catch (error) {
        // Never let a storage read trap the app on the splash screen.
        logger.warn('auth', 'Session bootstrap failed', error);
      }
    })().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);
}
