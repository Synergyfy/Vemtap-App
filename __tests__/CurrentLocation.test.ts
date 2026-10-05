import * as Location from 'expo-location';
import { requestCurrentLocation } from '@features/location/utils/currentLocation';

const grant = () =>
  (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
    status: 'granted',
    granted: true,
    canAskAgain: true,
    expires: 'never',
  });

const refuse = () =>
  (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
    status: 'denied',
    granted: false,
    canAskAgain: false,
    expires: 'never',
  });

describe('requestCurrentLocation', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns the device position once permission is granted', async () => {
    grant();

    const result = await requestCurrentLocation();

    expect(result).toEqual({
      ok: true,
      coords: { latitude: 9.0765, longitude: 7.5186 },
    });
    expect(Location.getCurrentPositionAsync).toHaveBeenCalledTimes(1);
  });

  test('does not ask for a position when permission is refused', async () => {
    refuse();

    const result = await requestCurrentLocation();

    expect(result).toEqual({ ok: false, reason: 'denied' });
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  test('treats a platform failure as retryable, not a crash', async () => {
    grant();
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValueOnce(
      new Error('Location unavailable'),
    );

    const result = await requestCurrentLocation();

    expect(result).toEqual({ ok: false, reason: 'unavailable' });
  });

  test('rejects a nonsensical coordinate instead of passing it on', async () => {
    grant();
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce({
      coords: { latitude: Number.NaN, longitude: Number.NaN },
      timestamp: 0,
    });

    const result = await requestCurrentLocation();

    expect(result).toEqual({ ok: false, reason: 'unavailable' });
  });

  test('treats a throwing permission request as unavailable', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockRejectedValueOnce(
      new Error('location services are off'),
    );

    const result = await requestCurrentLocation();

    expect(result).toEqual({ ok: false, reason: 'unavailable' });
  });
});
