/**
 * Dynamic Expo config — static app.json cannot evaluate process.env.
 * Injects the Android Google Maps key from EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID
 * (see .env.example). Empty key → LocationMapView uses the designed fallback.
 */
module.exports = ({ config }) => ({
  ...config,
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
