import Constants from 'expo-constants';

/** The installed app's version ("1.4.0"), or null when Expo does not report one. */
export function appVersion(): string | null {
  return Constants.expoConfig?.version ?? null;
}
