import { IS_PRODUCTION } from '@constants/config';
import { logger } from '@utils/logger';

export type AnalyticsUser = { id: string; email?: string } | null;

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

type FirebaseAnalytics = Awaited<
  ReturnType<typeof import('@react-native-firebase/analytics').getAnalytics>
>;

/**
 * Analytics facade. Default implementation logs in dev and forwards to
 * Firebase Analytics. Swap implementations without touching feature code.
 */

let firebaseAnalytics: FirebaseAnalytics | null = null;

async function getFirebase() {
  if (!firebaseAnalytics) {
    try {
      const { getAnalytics } = await import('@react-native-firebase/analytics');
      firebaseAnalytics = getAnalytics();
    } catch {
      firebaseAnalytics = null;
    }
  }
  return firebaseAnalytics;
}

export const analytics = {
  async logEvent(name: string, params?: AnalyticsParams): Promise<void> {
    if (!IS_PRODUCTION) {
      logger.info('app', `analytics:${name}`, params);
    }
    try {
      const fb = await getFirebase();
      await fb?.logEvent(name, params as Record<string, never>);
    } catch {
      // Analytics must never crash the app.
    }
  },

  async setUserId(userId: string | null): Promise<void> {
    try {
      const fb = await getFirebase();
      await fb?.setUserId(userId);
    } catch {
      // no-op
    }
  },

  trackScreen(screenName: string): void {
    this.logEvent('screen_view', { screen_name: screenName }).catch(
      () => undefined,
    );
  },
};
