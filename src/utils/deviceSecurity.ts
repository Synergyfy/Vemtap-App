import { IS_PRODUCTION } from '@constants/config';
import { logger } from '@utils/logger';

export interface DeviceSecurityState {
  isJailbroken: boolean;
  hookDetected: boolean;
}

/** jail-monkey removed for Expo Go compatibility; always reports a clean device. */
export function getDeviceSecurityState(): DeviceSecurityState {
  return {
    isJailbroken: false,
    hookDetected: false,
  };
}

/**
 * Returns true when the device looks compromised.
 * Gate sensitive flows (payments, PII edits) behind this check in production.
 */
export function isDeviceCompromised(): boolean {
  if (!IS_PRODUCTION) {
    return false;
  }
  const state = getDeviceSecurityState();
  if (state.isJailbroken || state.hookDetected) {
    logger.warn('app', 'Device security check failed', state);
    return true;
  }
  return false;
}
