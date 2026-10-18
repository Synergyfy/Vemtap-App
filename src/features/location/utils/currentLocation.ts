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

/** The parts of a device position's address the setup screens show. */
export interface ResolvedAddress {
  line: string;
  street?: string;
  district?: string;
  city?: string;
  state?: string;
}

/**
 * Address for a device position via the platform geocoder; `null` when it has
 * nothing (no network, no match) so callers keep what the owner typed.
 */
export async function reverseGeocode(
  coords: CurrentLocationCoords,
): Promise<ResolvedAddress | null> {
  try {
    const [place] = await Location.reverseGeocodeAsync(coords);
    if (!place) return null;
    const street =
      [place.streetNumber, place.street].filter(Boolean).join(' ') || undefined;
    const district = place.district ?? place.subregion ?? undefined;
    const city = place.city ?? undefined;
    const state = place.region ?? undefined;
    const line = [street ?? place.name, district, city].filter(Boolean).join(', ');
    return line ? { line, street, district, city, state } : null;
  } catch {
    return null;
  }
}
