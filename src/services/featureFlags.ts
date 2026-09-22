import {
  FEATURE_FLAG_REFRESH_INTERVAL_MS,
  IS_PRODUCTION,
  APP_VERSION,
  MIN_SUPPORTED_APP_VERSION,
} from '@constants/config';
import { compareVersions } from '@utils/validators';

const LOCAL_DEFAULTS: Record<string, boolean | number | string> = {
  enable_new_home: false,
  enable_payments_v2: false,
  force_update_prompt: false,
};

let cachedFlags: Record<string, boolean | number | string> = { ...LOCAL_DEFAULTS };
let lastFetch = 0;

/**
 * Placeholder kept for API compatibility: without a remote flags backend the
 * local defaults are always used. Replace with a real fetch when available.
 */
export async function refreshFeatureFlags(force = false): Promise<void> {
  const now = Date.now();
  if (!force && now - lastFetch < FEATURE_FLAG_REFRESH_INTERVAL_MS) {
    return;
  }
  lastFetch = now;
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
 * configured minimum version.
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
