import * as Location from 'expo-location';

/**
 * Device position for the "use my location" actions.
 *
 * Deliberately a plain async function rather than a `use*` hook: both callers
 * invoke it from a press handler, where `react-hooks/rules-of-hooks` (airbnb)
 * would reject a hook name. Screens keep their own pending/error state.
 *
 * Two failure reasons are returned rather than thrown, because the screens
 * render them differently:
 *  - `denied`      → the user said no (or said no previously); offer the manual
 *                    area picker, since the OS will not prompt again.
 *  - `unavailable` → GPS/permission plumbing failed; a retry can work.
 */
export type CurrentLocationCoords = { latitude: number; longitude: number };

export type CurrentLocationResult =
  | { ok: true; coords: CurrentLocationCoords }
  | { ok: false; reason: 'denied' | 'unavailable' };

export async function requestCurrentLocation(): Promise<CurrentLocationResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      return { ok: false, reason: 'denied' };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = position.coords;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return { ok: false, reason: 'unavailable' };
    }

    return { ok: true, coords: { latitude, longitude } };
  } catch {
    // Anything the platform throws (GPS off, location services disabled,
    // timeout) is a retryable failure, not a crash.
    return { ok: false, reason: 'unavailable' };
  }
}
