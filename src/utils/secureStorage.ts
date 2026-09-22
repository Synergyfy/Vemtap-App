/**
 * Secure storage wrapper around react-native-keychain.
 *
 * Auth tokens and other secrets live ONLY here (iOS Keychain / Android Keystore).
 * Never persist them in AsyncStorage, MMKV, Zustand persist, or Redux.
 */

import * as Keychain from 'react-native-keychain';

const SERVICE = 'com.vemtap.app.secure';

export type SecureStorageKey =
  | 'accessToken'
  | 'refreshToken'
  | 'userPin'
  | 'biometricSession';

type StoredPair = { accessToken: string; refreshToken?: string };

function assertSecret(key: string): void {
  if (typeof key !== 'string' || key.length === 0) {
    throw new Error('SecureStorage: key must be a non-empty string');
  }
}

export async function setSecureItem(key: SecureStorageKey, value: string): Promise<void> {
  assertSecret(key);
  if (value == null) {
    throw new Error('SecureStorage: value is required');
  }

  await Keychain.setGenericPassword(key, value, {
    service: `${SERVICE}.${key}`,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
  });
}

export async function getSecureItem(key: SecureStorageKey): Promise<string | null> {
  assertSecret(key);
  const result = await Keychain.getGenericPassword({
    service: `${SERVICE}.${key}`,
  });

  if (!result) {
    return null;
  }

  return result.password;
}

export async function removeSecureItem(key: SecureStorageKey): Promise<void> {
  assertSecret(key);
  await Keychain.resetGenericPassword({ service: `${SERVICE}.${key}` });
}

/** Atomically persist the auth token pair (called once per refresh cycle). */
export async function setTokenPair(tokens: StoredPair): Promise<void> {
  await Promise.all([
    setSecureItem('accessToken', tokens.accessToken),
    tokens.refreshToken !== undefined
      ? setSecureItem('refreshToken', tokens.refreshToken)
      : Promise.resolve(),
  ]);
}

export async function getTokenPair(): Promise<StoredPair | null> {
  const [accessToken, refreshToken] = await Promise.all([
    getSecureItem('accessToken'),
    getSecureItem('refreshToken'),
  ]);

  if (!accessToken) {
    return null;
  }

  return { accessToken, refreshToken: refreshToken ?? undefined };
}

/** Wipe every known secure key (sign-out / account switch). */
export async function clearSecureStorage(): Promise<void> {
  const keys: SecureStorageKey[] = [
    'accessToken',
    'refreshToken',
    'userPin',
    'biometricSession',
  ];
  await Promise.all(keys.map(key => removeSecureItem(key)));
}

export async function hasStoredSession(): Promise<boolean> {
  const token = await getSecureItem('accessToken');
  return token != null && token.length > 0;
}
