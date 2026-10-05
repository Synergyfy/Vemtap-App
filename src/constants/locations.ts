/** Fictional Abuja area centers for location screens (design uses Apo District). */
export type AreaName = 'Apo' | 'Wuse 2' | 'Maitama' | 'Garki' | 'Jabi';

export type AreaCoord = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

/** A bare position, without a map span. Shared by the store, nav params and geo. */
export type GeoCoords = { latitude: number; longitude: number };

const SPAN = { latitudeDelta: 0.04, longitudeDelta: 0.04 } as const;

export const AREA_COORDS: Record<AreaName, AreaCoord> = {
  Apo: { latitude: 9.0765, longitude: 7.5186, ...SPAN },
  'Wuse 2': { latitude: 9.087, longitude: 7.4805, ...SPAN },
  Maitama: { latitude: 9.1136, longitude: 7.4856, ...SPAN },
  Garki: { latitude: 9.0607, longitude: 7.4873, ...SPAN },
  Jabi: { latitude: 9.1145, longitude: 7.4217, ...SPAN },
};

export const DEFAULT_AREA: AreaName = 'Apo';

export function areaCoords(area: string): AreaCoord {
  return AREA_COORDS[area as AreaName] ?? AREA_COORDS[DEFAULT_AREA];
}

/**
 * The one owner of the selectable Abuja area list. Manual location search and
 * the home "Change Location & Radius" sheet both read this, so a new area (or a
 * corrected distance) can never drift between them.
 */
export const AREA_OPTIONS: readonly { name: AreaName; distance: string }[] = [
  { name: 'Apo', distance: '0.0 mi' },
  { name: 'Wuse 2', distance: '3.4 mi' },
  { name: 'Maitama', distance: '5.1 mi' },
  { name: 'Garki', distance: '2.8 mi' },
  { name: 'Jabi', distance: '4.9 mi' },
] as const;

export const AREA_NAMES: readonly AreaName[] = AREA_OPTIONS.map(area => area.name);

/** How each area is written in the home location sheet's popular pill row. */
export const AREA_PILL_LABELS: Record<AreaName, string> = {
  Apo: 'Apo',
  'Wuse 2': 'Wuse II',
  Maitama: 'Maitama',
  Garki: 'Garki',
  Jabi: 'Jabi',
};
