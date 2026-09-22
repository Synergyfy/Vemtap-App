import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { logger } from '@utils/logger';
import { analytics } from '@services/analytics';

type NotificationHandler = (payload: Record<string, string | undefined>) => void;

let navigationHandler: NotificationHandler | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Register the deep-link handler used when a notification is tapped. */
export function setNotificationNavigationHandler(handler: NotificationHandler): void {
  navigationHandler = handler;
}

/** Extract the data payload (as string map) from a notification. */
function toData(
  notification: Notifications.Notification,
): Record<string, string | undefined> {
  return notification.request.content.data as Record<string, string | undefined>;
}

/**
 * Request push permission (via Expo push service) and return the device token.
 * Wire the token to your backend via POST /devices after login.
 */
export async function requestPushPermission(): Promise<string | null> {
  try {
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

/** Call once from index.js / App mount for foreground + tap handling. */
export async function initPushNotifications(): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    Notifications.addNotificationReceivedListener(notification => {
      logger.debug('push', 'Foreground notification', {
        title: notification.request.content.title ?? undefined,
      });
    });

    Notifications.addNotificationResponseReceivedListener(response => {
      navigationHandler?.(toData(response.notification));
    });

    const initial = await Notifications.getLastNotificationResponseAsync();
    if (initial) {
      navigationHandler?.(toData(initial.notification));
    }
  } catch (error) {
    logger.warn('push', 'Push init failed', error);
  }
}
