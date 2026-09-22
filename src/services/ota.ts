import { logger } from '@utils/logger';

/**
 * OTA updates.
 *
 * NOTE: Microsoft App Center / CodePush was retired (2025). For bare RN,
 * evaluate one of:
 *   - Self-hosted CodePush server (community forks)
 *   - Expo Updates (works in bare workflow)
 *   - react-native-ota-hot-update
 *
 * This module is the integration seam — implement `checkForUpdate` with your
 * chosen provider without touching feature code.
 */
export interface OtaUpdateState {
  available: boolean;
  version?: string;
  mandatory?: boolean;
  downloadUrl?: string;
}

export async function checkForOtaUpdate(): Promise<OtaUpdateState> {
  logger.debug('app', 'OTA check stub — configure a provider in services/ota.ts');
  return { available: false };
}

export async function applyOtaUpdate(): Promise<boolean> {
  logger.warn('app', 'OTA apply called without a configured provider');
  return false;
}
