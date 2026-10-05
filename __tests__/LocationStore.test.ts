import { useLocationStore } from '@store/locationStore';
import { DEFAULT_AREA } from '@constants/locations';

const COORDS = { latitude: 9.1145, longitude: 7.4217 };

const reset = () =>
  useLocationStore.setState({ area: DEFAULT_AREA, coords: null, radiusKm: 5 });

describe('locationStore coordinates', () => {
  beforeEach(reset);

  test('setCoords records the position and the district it snapped to', () => {
    useLocationStore.getState().setCoords(COORDS, 'Jabi');
    const state = useLocationStore.getState();

    expect(state.coords).toEqual(COORDS);
    expect(state.area).toBe('Jabi');
    expect(state.radiusKm).toBe(5);
  });

  test('a hand-picked district drops the GPS position', () => {
    // Otherwise the label could read "Maitama" while distances were still
    // measured from wherever the phone last reported.
    useLocationStore.getState().setCoords(COORDS, 'Jabi');
    useLocationStore.getState().setArea('Maitama');

    const state = useLocationStore.getState();
    expect(state.area).toBe('Maitama');
    expect(state.coords).toBeNull();
  });

  test('setTargeting (radius sheet pick) also drops the position', () => {
    useLocationStore.getState().setCoords(COORDS, 'Jabi');
    useLocationStore.getState().setTargeting('Garki', 12);

    const state = useLocationStore.getState();
    expect(state.area).toBe('Garki');
    expect(state.radiusKm).toBe(12);
    expect(state.coords).toBeNull();
  });

  test('a radius tweak through the sheet keeps the position', () => {
    // The sheet always submits area and radius together, so a radius-only
    // change must not discard a reading the user cannot reproduce.
    useLocationStore.getState().setCoords(COORDS, 'Jabi');
    useLocationStore.getState().setTargeting('Jabi', 10);

    const state = useLocationStore.getState();
    expect(state.coords).toEqual(COORDS);
    expect(state.radiusKm).toBe(10);
  });

  test('re-selecting the same district keeps the position', () => {
    useLocationStore.getState().setCoords(COORDS, 'Jabi');
    useLocationStore.getState().setArea('Jabi');

    expect(useLocationStore.getState().coords).toEqual(COORDS);
  });

  test('changing only the radius keeps the position it was measured from', () => {
    useLocationStore.getState().setCoords(COORDS, 'Jabi');
    useLocationStore.getState().setRadiusKm(3);

    const state = useLocationStore.getState();
    expect(state.coords).toEqual(COORDS);
    expect(state.area).toBe('Jabi');
    expect(state.radiusKm).toBe(3);
  });
});
