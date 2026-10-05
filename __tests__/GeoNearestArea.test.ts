import { haversineMeters, nearestArea } from '@utils/geo';
import { AREA_COORDS, AREA_NAMES, areaCoords } from '@constants/locations';

describe('haversineMeters', () => {
  test('is zero for identical coordinates', () => {
    const apo = areaCoords('Apo');
    expect(haversineMeters(apo, apo)).toBeCloseTo(0, 5);
  });

  test('is symmetric', () => {
    const apo = areaCoords('Apo');
    const jabi = areaCoords('Jabi');
    expect(haversineMeters(apo, jabi)).toBeCloseTo(haversineMeters(jabi, apo), 6);
  });

  test('matches a known Abuja distance within 5%', () => {
    // Same reference the deals mapper was validated against: Apo → Jabi is
    // 11.45 km, so the move out of `offerMapper` cannot have altered the maths.
    const metres = haversineMeters(areaCoords('Apo'), areaCoords('Jabi'));
    expect(metres / 1000).toBeGreaterThan(11.3);
    expect(metres / 1000).toBeLessThan(11.6);
  });
});

describe('nearestArea', () => {
  test('picks the district a centre belongs to', () => {
    for (const name of AREA_NAMES) {
      expect(nearestArea(areaCoords(name))).toBe(name);
    }
  });

  test('snaps a position between districts to the closer one', () => {
    // 1 km north of Apo's centre: still Apo, not Wuse 2.
    const justNorthOfApo = { latitude: 9.0855, longitude: 7.5186 };
    expect(nearestArea(justNorthOfApo)).toBe('Apo');

    // Directly south of Jabi's centre.
    const southOfJabi = { latitude: 9.1045, longitude: 7.4217 };
    expect(nearestArea(southOfJabi)).toBe('Jabi');
  });

  test('always returns a real district even far outside the city', () => {
    // The five districts are the whole model, so an out-of-city reading must
    // still land on one rather than produce an unusable label.
    const elsewhere = nearestArea({ latitude: 51.5074, longitude: -0.1278 });
    expect(AREA_NAMES).toContain(elsewhere);
    expect(AREA_COORDS[elsewhere]).toBeDefined();
  });
});
