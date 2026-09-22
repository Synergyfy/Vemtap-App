import Config from 'react-native-config';
import { Platform } from 'react-native';

export const APP_ENV = (Config.APP_ENV ?? 'development') as
  | 'development'
  | 'staging'
  | 'production';

export const IS_PRODUCTION = APP_ENV === 'production';
export const IS_DEV = __DEV__;

export const API_BASE_URL = `${Config.API_BASE_URL ?? 'https://api.dev.vemtap.com'}/${
  Config.API_VERSION ?? 'v1'
}`;

export const API_TIMEOUT_MS = Number(Config.API_TIMEOUT_MS ?? 15000);

export const SENTRY_DSN = Config.SENTRY_DSN ?? '';
export const SENTRY_ENABLED = Config.SENTRY_ENABLED === 'true';

export const MIN_SUPPORTED_APP_VERSION = Config.MIN_SUPPORTED_APP_VERSION ?? '1.0.0';

export const APP_VERSION: string =
  Platform.select({ ios: '1.0.0', android: '1.0.0' }) ?? '1.0.0';

export const BUILD_NUMBER: string = Platform.select({ ios: '1', android: '1' }) ?? '1';

/** Refresh threshold for remote feature-flag cache (ms). */
export const FEATURE_FLAG_REFRESH_INTERVAL_MS = 60 * 60 * 1000;
