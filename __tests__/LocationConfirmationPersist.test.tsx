import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { LocationConfirmationScreen } from '@features/location/screens/LocationConfirmationScreen';
import { useLocationStore } from '@store/locationStore';
import { DEFAULT_AREA } from '@constants/locations';
import { strings } from '@constants/strings';

const mockNav = { navigate: jest.fn(), goBack: jest.fn() };
const mockParams = { area: 'Maitama', coords: undefined as unknown };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNav,
  useRoute: () => ({ params: mockParams }),
}));

jest.mock('@components/shared/LocationMapView', () => ({
  LocationMapView: () => null,
}));

const resetStore = () =>
  useLocationStore.setState({ area: DEFAULT_AREA, coords: null, radiusKm: 5 });

const pressContinue = async () => {
  await fireEvent.press(screen.getByLabelText(strings.auth.confirmContinue));
};

describe('LocationConfirmationScreen persists the choice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
  });

  it('writes the district and coordinates a GPS read produced', async () => {
    mockParams.area = 'Jabi';
    mockParams.coords = { latitude: 9.1145, longitude: 7.4217 };

    await render(<LocationConfirmationScreen />);
    await pressContinue();

    const state = useLocationStore.getState();
    expect(state.area).toBe('Jabi');
    expect(state.coords).toEqual({ latitude: 9.1145, longitude: 7.4217 });
    expect(mockNav.navigate).toHaveBeenCalledWith('DiscoveringNearbyDeals');
  });

  it('writes a hand-picked district and drops stale coordinates', async () => {
    // Simulates: GPS ran earlier, then the user went back and picked another
    // district by hand — the old position must not survive that.
    useLocationStore
      .getState()
      .setCoords({ latitude: 9.1145, longitude: 7.4217 }, 'Jabi');
    mockParams.area = 'Garki';
    mockParams.coords = undefined;

    await render(<LocationConfirmationScreen />);
    await pressContinue();

    const state = useLocationStore.getState();
    expect(state.area).toBe('Garki');
    expect(state.coords).toBeNull();
  });

  it('keeps the radius already chosen rather than resetting it', async () => {
    useLocationStore.getState().setRadiusKm(12);
    mockParams.area = 'Maitama';
    mockParams.coords = { latitude: 9.1136, longitude: 7.4856 };

    await render(<LocationConfirmationScreen />);
    await pressContinue();

    expect(useLocationStore.getState().radiusKm).toBe(12);
  });

  it('does not write anything until the user continues', async () => {
    // Choosing the district on arrival must not be mistaken for confirming it;
    // "Change location" can still send the user back.
    mockParams.area = 'Wuse 2';
    mockParams.coords = undefined;

    await render(<LocationConfirmationScreen />);

    expect(useLocationStore.getState()).toMatchObject({
      area: DEFAULT_AREA,
      coords: null,
    });
    expect(mockNav.navigate).not.toHaveBeenCalled();
  });

  it('routes the same district it displays', async () => {
    mockParams.area = 'Maitama';
    mockParams.coords = { latitude: 9.1136, longitude: 7.4856 };

    await render(<LocationConfirmationScreen />);

    await waitFor(() => expect(screen.getByText(/Maitama/)).toBeTruthy());
    await pressContinue();
    expect(useLocationStore.getState().area).toBe('Maitama');
  });
});
