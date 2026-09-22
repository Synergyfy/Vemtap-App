import { Platform } from 'react-native';
import type { RemoteMessage } from '@react-native-firebase/messaging';
import { logger } from '@utils/logger';
import { analytics } from '@services/analytics';

type NotificationHandler = (payload: Record<string, string | undefined>) => void;

type FirebaseMessaging = Awaited<
  ReturnType<typeof import('@react-native-firebase/messaging').getMessaging>
>;

let messaging: FirebaseMessaging | null = null;
let navigationHandler: NotificationHandler | null = null;

async function getMessagingInstance() {
  if (!messaging) {
    try {
      const mod = await import('@react-native-firebase/messaging');
      messaging = mod.getMessaging();
    } catch {
      messaging = null;
    }
  }
  return messaging;
}

/** Register the deep-link handler used when a notification is tapped. */
export function setNotificationNavigationHandler(handler: NotificationHandler): void {
  navigationHandler = handler;
}

/**
 * Request FCM permission and return the device token.
 * Wire the token to your backend via POST /devices after login.
 */
export async function requestPushPermission(): Promise<string | null> {
  try {
    const m = await getMessagingInstance();
    if (!m) {
      logger.warn('push', 'Firebase messaging unavailable (missing config?)');
      return null;
    }
    const authStatus = await m.requestPermission();
    const enabled =
      authStatus === 1 || authStatus === 2; // AUTHORIZED or PROVISIONAL
    if (!enabled) {
      return null;
    }
    const token = await m.getToken();
    logger.info('push', 'FCM token obtained');
    await analytics.logEvent('push_token_registered');
    return token;
  } catch (error) {
    logger.error('push', 'Failed to register for push', error);
    return null;
  }
}

/** Call once from index.js / App mount for foreground + tap handling. */
export async function initPushNotifications(): Promise<void> {
  try {
    const m = await getMessagingInstance();
    if (!m) {
      return;
    }

    if (Platform.OS === 'android') {
      // Channel creation handled natively by RN Firebase defaults.
    }

    m.onMessage(async (remoteMessage: RemoteMessage) => {
      logger.debug('push', 'Foreground message', remoteMessage.notification?.title);
      // Local display handled by system for data-only messages via notifee
      // if you add it later; for now foreground banners are a no-op.
    });

    m.onNotificationOpenedApp((remoteMessage: RemoteMessage) => {
      const data = remoteMessage.data as Record<string, string | undefined>;
      navigationHandler?.(data);
    });

    const initial = await m.getInitialNotification();
    if (initial) {
      const data = initial.data as Record<string, string | undefined>;
      navigationHandler?.(data);
    }
  } catch (error) {
    logger.warn('push', 'Push init failed', error);
  }
}
