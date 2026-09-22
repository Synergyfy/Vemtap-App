import { shouldForceUpdate, refreshFeatureFlags } from '@services/featureFlags';
import { APP_VERSION } from '@constants/config';
import { logger } from '@utils/logger';

export interface ForceUpdateState {
  required: boolean;
  currentVersion: string;
}

/**
 * Checks remote minimum-version on cold start / foreground.
 * Present a blocking modal from App root when `required` is true.
 */
export async function checkForceUpdate(): Promise<ForceUpdateState> {
  await refreshFeatureFlags();
  const required = shouldForceUpdate(APP_VERSION);
  if (required) {
    logger.warn('flags', 'Force update required', { current: APP_VERSION });
  }
  return { required, currentVersion: APP_VERSION };
}
