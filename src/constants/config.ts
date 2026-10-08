import { Platform } from 'react-native';
import { resolveApiBaseUrl } from '@constants/apiConfig';

const readEnv = (key: string, fallback: string): string => process.env[key] ?? fallback;

export const APP_ENV = readEnv('EXPO_PUBLIC_APP_ENV', 'development') as
  'development' | 'staging' | 'production';

export const IS_PRODUCTION = APP_ENV === 'production';
export const IS_DEV = __DEV__;

/**
 * See `src/constants/apiConfig.ts` for why a missing base URL is never replaced
 * with a guessed host: it has to fail loudly (see the guard in `src/api/client.ts`).
 */
const api = resolveApiBaseUrl(
  process.env.EXPO_PUBLIC_API_BASE_URL,
  process.env.EXPO_PUBLIC_API_VERSION,
  APP_ENV,
);

export const API_BASE_URL_ORIGIN = api.origin;
export const API_VERSION = api.version;
export const IS_API_CONFIGURED = api.configured;
export const API_BASE_URL = api.baseUrl;
/** Surfaced to the UI so a mis-built binary is self-explanatory. */
export const API_CONFIG_HINT = api.hint;

export const API_TIMEOUT_MS = Number(readEnv('EXPO_PUBLIC_API_TIMEOUT_MS', '15000'));

export const SENTRY_DSN = readEnv('EXPO_PUBLIC_SENTRY_DSN', '');
export const SENTRY_ENABLED = readEnv('EXPO_PUBLIC_SENTRY_ENABLED', 'false') === 'true';

export const MIN_SUPPORTED_APP_VERSION = readEnv(
  'EXPO_PUBLIC_MIN_SUPPORTED_APP_VERSION',
  '1.0.0',
);

export const APP_VERSION: string =
  Platform.select({ ios: '1.0.0', android: '1.0.0' }) ?? '1.0.0';

export const BUILD_NUMBER: string = Platform.select({ ios: '1', android: '1' }) ?? '1';

/** Refresh threshold for remote feature-flag cache (ms). */
export const FEATURE_FLAG_REFRESH_INTERVAL_MS = 60 * 60 * 1000;
