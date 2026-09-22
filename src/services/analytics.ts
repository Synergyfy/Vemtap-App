import { IS_PRODUCTION } from '@constants/config';
import { logger } from '@utils/logger';

export type AnalyticsUser = { id: string; email?: string } | null;

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

/**
 * Analytics facade. Logs in dev and is a no-op otherwise.
 * Swap in a real provider (e.g. Segment, Amplitude) without touching feature code.
 */

export const analytics = {
  async logEvent(name: string, params?: AnalyticsParams): Promise<void> {
    if (!IS_PRODUCTION) {
      logger.info('app', `analytics:${name}`, params);
    }
  },

  async setUserId(userId: string | null): Promise<void> {
    if (!IS_PRODUCTION) {
      logger.info('app', 'analytics:identify', { userId });
    }
  },

  trackScreen(screenName: string): void {
    this.logEvent('screen_view', { screen_name: screenName }).catch(() => undefined);
  },
};
