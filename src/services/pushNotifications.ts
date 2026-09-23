import { Platform } from 'react-native';
import { logger } from '@utils/logger';
import { analytics } from '@services/analytics';

type NotificationHandler = (payload: Record<string, string | undefined>) => void;

type NotificationsModule = typeof import('expo-notifications');

let navigationHandler: NotificationHandler | null = null;
let initialized = false;
let notificationsModule: NotificationsModule | null = null;

/**
 * expo-notifications remote push was removed from Expo Go (SDK 53+).
 * On Android Expo Go, getExpoPushTokenAsync/getDevicePushTokenAsync THROW.
 * Local channels + tap handling still work — gate push-token APIs only.
 * Detect Expo Go via the EXPO_GO env flag (injected by the Expo Go runtime)
 * without importing `expo` (that package's winter/fetch breaks Jest).
 */
function isPushTokenBlocked(): boolean {
  return process.env.EXPO_GO === '1' || process.env.EXPO_GO === 'true';
}

/**
 * Android development (Expo Go / __DEV__): skip ALL expo-notifications setup.
 * Remote push is unsupported in Expo Go (SDK 53+), and touching the module
 * surfaces several dismissible native/JS error dialogs on Android. Local
 * channels/listeners are only needed in production/dev-client builds.
 */
function shouldSkipPushSetup(): boolean {
  if (Platform.OS !== 'android') {
    return false;
  }
  if (isPushTokenBlocked()) {
    return true;
  }
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

/** Load the module lazily so a native failure never blocks App boot. */
async function loadNotifications(): Promise<NotificationsModule | null> {
  if (notificationsModule) {
    return notificationsModule;
  }
  try {
    notificationsModule = await import('expo-notifications');
    return notificationsModule;
  } catch (error) {
    logger.warn('push', 'expo-notifications unavailable', error);
    return null;
  }
}

/** Register the deep-link handler used when a notification is tapped. */
export function setNotificationNavigationHandler(handler: NotificationHandler): void {
  navigationHandler = handler;
}

/** Extract the data payload (as string map) from a notification. */
function toData(notification: {
  request: { content: { data?: Record<string, unknown> } };
}): Record<string, string | undefined> {
  return (notification.request.content.data ?? {}) as Record<string, string | undefined>;
}

/**
 * Request push permission (via Expo push service) and return the device token.
 * No-ops (returns null) inside Expo Go — remote push is unsupported there.
 * Wire the token to your backend via POST /devices after login.
 */
export async function requestPushPermission(): Promise<string | null> {
  if (shouldSkipPushSetup()) {
    logger.info(
      'push',
      'Push token skipped — Android dev/Expo Go does not support remote push',
    );
    return null;
  }
  if (isPushTokenBlocked()) {
    logger.info('push', 'Push token skipped — Expo Go does not support remote push');
    return null;
  }
  try {
    const Notifications = await loadNotifications();
    if (!Notifications) {
      return null;
    }
    let settings = await Notifications.getPermissionsAsync();
    if (!settings.granted) {
      settings = await Notifications.requestPermissionsAsync();
    }
    if (!settings.granted) {
      logger.info('push', 'Push permission denied');
      return null;
    }
    const token = await Notifications.getExpoPushTokenAsync();
    logger.info('push', 'Expo push token obtained');
    await analytics.logEvent('push_token_registered');
    return token.data;
  } catch (error) {
    logger.error('push', 'Failed to register for push', error);
    return null;
  }
}

/**
 * Call once from App mount. Every step is isolated so one failure
 * (missing native module, Expo Go push restrictions, etc.) cannot
 * prevent the app from rendering.
 */
export async function initPushNotifications(): Promise<void> {
  if (initialized) {
    return;
  }
  initialized = true;

  if (shouldSkipPushSetup()) {
    logger.info(
      'push',
      'Skipping push init on Android (dev/Expo Go) to avoid error dialogs',
    );
    return;
  }

  try {
    const Notifications = await loadNotifications();
    if (!Notifications) {
      return;
    }

    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
    } catch (error) {
      logger.warn('push', 'setNotificationHandler failed', error);
    }

    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
    } catch (error) {
      logger.warn('push', 'Android channel setup failed', error);
    }

    try {
      Notifications.addNotificationReceivedListener(notification => {
        logger.debug('push', 'Foreground notification', {
          title: notification.request.content.title ?? undefined,
        });
      });

      Notifications.addNotificationResponseReceivedListener(response => {
        navigationHandler?.(toData(response.notification));
      });
    } catch (error) {
      logger.warn('push', 'Notification listeners failed', error);
    }

    try {
      const initial = await Notifications.getLastNotificationResponseAsync();
      if (initial) {
        navigationHandler?.(toData(initial.notification));
      }
    } catch (error) {
      logger.warn('push', 'getLastNotificationResponseAsync failed', error);
    }
  } catch (error) {
    logger.warn('push', 'Push init failed', error);
  }
}
