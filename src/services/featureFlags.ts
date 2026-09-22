import {
  FEATURE_FLAG_REFRESH_INTERVAL_MS,
  IS_PRODUCTION,
  APP_VERSION,
  MIN_SUPPORTED_APP_VERSION,
} from '@constants/config';
import { logger } from '@utils/logger';
import { compareVersions } from '@utils/validators';

const LOCAL_DEFAULTS: Record<string, boolean | number | string> = {
  enable_new_home: false,
  enable_payments_v2: false,
  force_update_prompt: false,
};

type RemoteConfig = Awaited<
  ReturnType<typeof import('@react-native-firebase/remote-config').getRemoteConfig>
>;

/** Public RemoteConfig type omits instance methods; runtime instance has them (RemoteConfigInternal). */
type RemoteConfigRuntime = RemoteConfig & {
  setDefaults(defaults: Record<string, boolean | number | string>): Promise<unknown>;
  fetch(): Promise<void>;
  activate(): Promise<boolean>;
  getValue(key: string): {
    asBoolean(): boolean;
    asNumber(): number;
    asString(): string;
  };
};

let cachedFlags: Record<string, boolean | number | string> = { ...LOCAL_DEFAULTS };
let lastFetch = 0;
let remoteConfig: RemoteConfigRuntime | null = null;

async function getRemoteConfig() {
  if (!remoteConfig) {
    try {
      const mod = await import('@react-native-firebase/remote-config');
      remoteConfig = mod.getRemoteConfig() as RemoteConfigRuntime;
    } catch {
      remoteConfig = null;
    }
  }
  return remoteConfig;
}

/** Fetch + activate remote flags (no-op when Firebase isn't configured yet). */
export async function refreshFeatureFlags(force = false): Promise<void> {
  const now = Date.now();
  if (!force && now - lastFetch < FEATURE_FLAG_REFRESH_INTERVAL_MS) {
    return;
  }
  try {
    const rc = await getRemoteConfig();
    if (!rc) {
      lastFetch = now;
      return;
    }
    await rc.setDefaults(LOCAL_DEFAULTS);
    await rc.fetch();
    await rc.activate();
    cachedFlags = Object.fromEntries(
      Object.keys(LOCAL_DEFAULTS).map(key => {
        const value = rc.getValue(key);
        return [
          key,
          typeof LOCAL_DEFAULTS[key] === 'number'
            ? value.asNumber()
            : typeof LOCAL_DEFAULTS[key] === 'boolean'
              ? value.asBoolean()
              : value.asString(),
        ];
      }),
    );
    lastFetch = now;
    logger.debug('flags', 'Feature flags refreshed', cachedFlags);
  } catch (error) {
    logger.warn('flags', 'Feature flag refresh failed; using local defaults', error);
  }
}

export function getFeatureFlag<K extends keyof typeof LOCAL_DEFAULTS>(
  key: K,
): (typeof LOCAL_DEFAULTS)[K] {
  return cachedFlags[key] as (typeof LOCAL_DEFAULTS)[K];
}

export function isFeatureEnabled(key: string, fallback = false): boolean {
  const value = cachedFlags[key];
  return typeof value === 'boolean' ? value : fallback;
}

/**
 * Force-update gate: block usage when the installed build is below the
 * server-advertised minimum (fetched via remote config `min_supported_version`).
 */
export function shouldForceUpdate(currentVersion = APP_VERSION): boolean {
  const min =
    typeof cachedFlags.min_supported_version === 'string'
      ? cachedFlags.min_supported_version
      : MIN_SUPPORTED_APP_VERSION;
  return compareVersions(currentVersion, min) < 0;
}

/** Dev/test helper — never call in production feature code. */
export function __setFeatureFlagsForTest(
  flags: Record<string, boolean | number | string>,
): void {
  if (!IS_PRODUCTION) {
    cachedFlags = { ...cachedFlags, ...flags };
  }
}
