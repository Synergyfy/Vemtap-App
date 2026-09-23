/** Fictional Abuja area centers for location screens (design uses Apo District). */
export type AreaName = 'Apo' | 'Wuse 2' | 'Maitama' | 'Garki' | 'Jabi';

export type AreaCoord = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

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
