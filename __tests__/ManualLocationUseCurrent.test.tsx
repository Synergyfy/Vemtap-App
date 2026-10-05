import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ManualLocationSearchScreen } from '@features/location/screens/ManualLocationSearchScreen';
import { requestCurrentLocation } from '@features/location/utils/currentLocation';
import { strings } from '@constants/strings';

const mockNav = { navigate: jest.fn(), goBack: jest.fn() };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNav,
}));

jest.mock('@features/location/utils/currentLocation', () => ({
  requestCurrentLocation: jest.fn(),
}));

jest.mock('@components/shared/LocationMapView', () => ({
  LocationMapView: () => null,
}));

const pressUseCurrent = async () => {
  await fireEvent.press(screen.getByText(strings.auth.manualUseCurrent));
};

describe('ManualLocationSearchScreen — use current location', () => {
  beforeEach(() => jest.clearAllMocks());

  it('hands the snapped district and its coordinates to the host shell', async () => {
    // Signed-in shell: the navbar passes `onSelected`, which writes the store.
    (requestCurrentLocation as jest.Mock).mockResolvedValue({
      ok: true,
      coords: { latitude: 9.0607, longitude: 7.4873 },
    });
    const onSelected = jest.fn();

    await render(<ManualLocationSearchScreen onSelected={onSelected} />);
    await pressUseCurrent();

    // Garki's centre — not the previous hardcoded 'Apo'.
    await waitFor(() =>
      expect(onSelected).toHaveBeenCalledWith('Garki', {
        latitude: 9.0607,
        longitude: 7.4873,
      }),
    );
    expect(screen.getByText('Garki')).toBeTruthy();
  });

  it('routes a GPS read through the signup navigator with coordinates', async () => {
    (requestCurrentLocation as jest.Mock).mockResolvedValue({
      ok: true,
      coords: { latitude: 9.1145, longitude: 7.4217 },
    });

    await render(<ManualLocationSearchScreen />);
    await pressUseCurrent();

    await waitFor(() =>
      expect(mockNav.navigate).toHaveBeenCalledWith('LocationConfirmation', {
        area: 'Jabi',
        coords: { latitude: 9.1145, longitude: 7.4217 },
      }),
    );
  });

  it('keeps the district list usable when the position cannot be read', async () => {
    (requestCurrentLocation as jest.Mock).mockResolvedValue({
      ok: false,
      reason: 'denied',
    });
    const onSelected = jest.fn();

    await render(<ManualLocationSearchScreen onSelected={onSelected} />);
    await pressUseCurrent();

    await waitFor(() =>
      expect(screen.getByText(strings.auth.manualUseCurrentError)).toBeTruthy(),
    );
    expect(onSelected).not.toHaveBeenCalled();
    expect(mockNav.navigate).not.toHaveBeenCalled();

    // The suggestion list is still the way forward.
    await fireEvent.press(screen.getByText('Jabi'));
    await fireEvent.press(screen.getByLabelText(strings.auth.manualContinueWith('Jabi')));
    // Omitted rather than passed: a hand pick carries no coordinates at all,
    // which is what makes the store drop an older GPS reading.
    await waitFor(() => expect(onSelected).toHaveBeenCalledWith('Jabi'));
  });

  it('passes no coordinates for a hand-picked district', async () => {
    // Absent coords is what tells the store to drop an older GPS reading, so
    // the label and the position it came from can never disagree.
    const onSelected = jest.fn();

    await render(<ManualLocationSearchScreen onSelected={onSelected} />);
    await fireEvent.press(screen.getByText('Wuse 2'));
    await fireEvent.press(
      screen.getByLabelText(strings.auth.manualContinueWith('Wuse 2')),
    );

    expect(onSelected).toHaveBeenCalledWith('Wuse 2');
    expect(onSelected.mock.calls[0]).toHaveLength(1);
    expect(requestCurrentLocation).not.toHaveBeenCalled();
  });
});
