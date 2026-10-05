import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { LocationPermissionScreen } from '@features/location/screens/LocationPermissionScreen';
import { requestCurrentLocation } from '@features/location/utils/currentLocation';
import { strings } from '@constants/strings';

const mockNav = { navigate: jest.fn(), goBack: jest.fn() };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNav,
}));

jest.mock('@features/location/utils/currentLocation', () => ({
  requestCurrentLocation: jest.fn(),
}));

const pressUseMyLocation = async () => {
  await fireEvent.press(screen.getByLabelText(strings.auth.locationUseMyLocation));
};

describe('LocationPermissionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('snaps the real position to its district and passes the coordinates on', async () => {
    // Jabi's centre — the whole point is that this is no longer hardcoded to
    // 'Apo' the way the placeholder handler was.
    (requestCurrentLocation as jest.Mock).mockResolvedValue({
      ok: true,
      coords: { latitude: 9.1145, longitude: 7.4217 },
    });

    await render(<LocationPermissionScreen />);
    await pressUseMyLocation();

    await waitFor(
      () =>
        expect(mockNav.navigate).toHaveBeenCalledWith('LocationConfirmation', {
          area: 'Jabi',
          coords: { latitude: 9.1145, longitude: 7.4217 },
        }),
      { timeout: 3000 },
    );
  });

  it('shows the finding state while the position is being requested', async () => {
    // Held open so the intermediate state is observable — a promise that
    // settles immediately would flip straight past it.
    let settle!: (value: unknown) => void;
    (requestCurrentLocation as jest.Mock).mockReturnValue(
      new Promise(resolve => {
        settle = resolve;
      }),
    );

    await render(<LocationPermissionScreen />);
    await pressUseMyLocation();

    // A busy Button swaps its label for a spinner, so the copy is asserted
    // through its accessibility label rather than rendered text.
    expect(screen.getByLabelText(strings.auth.locationFinding)).toBeTruthy();

    settle({ ok: true, coords: { latitude: 9.0765, longitude: 7.5186 } });
    await waitFor(() => expect(mockNav.navigate).toHaveBeenCalled(), {
      timeout: 3000,
    });
  });

  it('explains a refusal and leaves the way to manual selection open', async () => {
    (requestCurrentLocation as jest.Mock).mockResolvedValue({
      ok: false,
      reason: 'denied',
    });

    await render(<LocationPermissionScreen />);
    await pressUseMyLocation();

    await waitFor(() =>
      expect(screen.getByText(strings.auth.locationDenied)).toBeTruthy(),
    );
    expect(mockNav.navigate).not.toHaveBeenCalled();

    // Retrying stays possible: only an in-flight or completed attempt locks
    // the button, because the OS may have refused without asking at all.
    const button = screen.getByLabelText(strings.auth.locationUseMyLocation);
    expect(button.props.accessibilityState?.disabled).toBe(false);
    expect(screen.getByText(strings.auth.locationEnterManually)).toBeTruthy();
  });

  it('surfaces an unavailable fix with its own message', async () => {
    (requestCurrentLocation as jest.Mock).mockResolvedValue({
      ok: false,
      reason: 'unavailable',
    });

    await render(<LocationPermissionScreen />);
    await pressUseMyLocation();

    await waitFor(() =>
      expect(screen.getByText(strings.auth.locationUnavailable)).toBeTruthy(),
    );
    expect(screen.queryByText(strings.auth.locationDenied)).toBeNull();
    expect(mockNav.navigate).not.toHaveBeenCalled();
  });

  it('leaves the permission prompt out of the initial render', async () => {
    // The design's default state: no failure copy before anyone presses.
    await render(<LocationPermissionScreen />);

    expect(screen.queryByText(strings.auth.locationDenied)).toBeNull();
    expect(screen.queryByText(strings.auth.locationUnavailable)).toBeNull();
    expect(requestCurrentLocation).not.toHaveBeenCalled();
  });
});
