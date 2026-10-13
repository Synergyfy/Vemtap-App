import {
  AREA_COORDS,
  areaCoords,
  type AreaName,
  type GeoCoords,
} from '@constants/locations';

/**
 * Shared geometry for anything that compares two coordinates.
 *
 * The deals feed already needed great-circle distance, so it lived in
 * `offerMapper` — but now the location flow needs the same maths to pick the
 * district a GPS reading falls in. One implementation, imported by both (AGENTS
 * rule 17), keeps the two from drifting.
 */

const EARTH_RADIUS_M = 6_371_000;

/** Great-circle distance in metres between two coordinates. */
export function haversineMeters(from: GeoCoords, to: GeoCoords): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * The district a GPS reading belongs to.
 *
 * The app models discovery areas as a fixed set of Abuja districts
 * (`AreaName`), so a real coordinate is only ever an *input* — it picks the
 * closest district centre rather than being stored as a place name. Coordinates
 * far outside the city still snap to the nearest one, which is what the feed
 * needs to show *something* instead of an empty targeting label.
 */
export function nearestArea(point: GeoCoords): AreaName {
  let best: AreaName = 'Apo';
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const [name, center] of Object.entries(AREA_COORDS) as [AreaName, GeoCoords][]) {
    const distance = haversineMeters(point, center);
    if (distance < bestDistance) {
      best = name;
      bestDistance = distance;
    }
  }

  return best;
}

/**
 * Where discovery is measured from: the user's real position when they used
 * "use my location", otherwise the centre of the district they picked.
 *
 * Both the feed's proximity filter and the distance on a deal card have to
 * agree, so they read this one function rather than each deciding for
 * themselves — otherwise a card could say "0.4 km" while the API had filtered
 * against a different origin.
 */
export function discoveryOrigin(area: string, coords: GeoCoords | null): GeoCoords {
  if (coords) return coords;
  const { latitude, longitude } = areaCoords(area);
  return { latitude, longitude };
}
