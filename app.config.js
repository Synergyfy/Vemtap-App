/**
 * Dynamic Expo config — static app.json cannot evaluate process.env.
 *
 * Injects the Android Google Maps key from EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID
 * (see .env.example). Empty key → LocationMapView uses the designed fallback.
 *
 * `extra.api` mirrors the API settings so a mis-built binary can be identified
 * from the runtime config (`expo-constants`) instead of guessing: the
 * EXPO_PUBLIC_* values themselves are inlined into the JS bundle at build time.
 */
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    api: {
      baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || '',
      version: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
      appEnv: process.env.EXPO_PUBLIC_APP_ENV || 'development',
    },
  },
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: {
        ...config.android?.config?.googleMaps,
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID || '',
      },
    },
  },
});
