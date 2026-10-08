import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_AREA, type AreaName, type GeoCoords } from '@constants/locations';

/**
 * The radius a fresh install starts on. Exported so the filter page's Reset
 * returns to the same default the store does, rather than restating the number
 * in a second place.
 */
export const DEFAULT_RADIUS_KM = 5;

/**
 * Consumer location store — the single source for the active discovery district
 * and radius.
 *
 * The district is chosen on the shared location-selection page and the radius is
 * tuned in the Change Location & Radius sheet. Both are opened from the consumer
 * top navbar, which Home and the Deals feed share, so keeping the values here
 * (rather than per screen) is what stops the two navbars from disagreeing.
 *
 * `coords` is the device's GPS position when the user chose "use my location",
 * and `null` when they picked a district by hand. The rule keeps the two halves
 * honest: **changing the district drops the coordinates**. Otherwise the label
 * could say "Maitama" while distances were still measured from wherever the
 * phone last reported — and no screen would have to remember to clear it,
 * because the clearing lives in the setter.
 *
 * Re-selecting the *same* district, or only changing the radius, keeps the
 * position: those do not contradict it. The radius sheet always submits area and
 * radius together, so a radius-only tweak would otherwise discard a reading the
 * user can no longer reproduce.
 */
interface LocationState {
  area: AreaName;
  /** GPS position behind the current district; null when chosen manually. */
  coords: GeoCoords | null;
  radiusKm: number;
  /** District pick — drops a GPS position belonging to some other district. */
  setArea: (area: AreaName) => void;
  /** GPS pick: records the position and the district it snapped to together. */
  setCoords: (coords: GeoCoords, area: AreaName) => void;
  setRadiusKm: (radiusKm: number) => void;
  /** Applies both in one commit, e.g. from the radius sheet. */
  setTargeting: (area: AreaName, radiusKm: number) => void;
}

export const useLocationStore = create<LocationState>()(
  devtools(
    persist(
      set => ({
        area: DEFAULT_AREA,
        coords: null,
        radiusKm: DEFAULT_RADIUS_KM,
        setArea: area =>
          set(state => ({
            area,
            coords: state.area === area ? state.coords : null,
          })),
        setCoords: (coords, area) => set({ coords, area }),
        setRadiusKm: radiusKm => set({ radiusKm }),
        setTargeting: (area, radiusKm) =>
          set(state => ({
            area,
            radiusKm,
            coords: state.area === area ? state.coords : null,
          })),
      }),
      {
        name: 'vemtap-location',
        storage: createJSONStorage(() => AsyncStorage),
      },
    ),
  ),
);
