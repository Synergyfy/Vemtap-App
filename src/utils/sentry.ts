import { SENTRY_DSN, SENTRY_ENABLED, APP_ENV, IS_PRODUCTION } from '@constants/config';
import * as Sentry from '@sentry/react-native';

/** Initialize Sentry once, before the root component mounts (index.js). */
export function initSentry(): void {
  if (!SENTRY_ENABLED || !SENTRY_DSN) {
    return;
  }
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: APP_ENV,
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30_000,
    tracesSampleRate: IS_PRODUCTION ? 0.2 : 1.0,
    sendDefaultPii: false,
    /* eslint-disable no-param-reassign -- Sentry beforeSend must mutate the event to strip PII */
    beforeSend(event) {
      // Strip anything that could contain PII / breadcrumbs with auth headers.
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers.Authorization;
          delete event.request.headers.authorization;
        }
      }
      return event;
    },
    /* eslint-enable no-param-reassign */
  });
}

export { Sentry };
