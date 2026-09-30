import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_AREA, type AreaName } from '@constants/locations';

/**
 * Consumer location store — the single source for the active discovery district
 * and radius.
 *
 * The district is chosen on the shared location-selection page and the radius is
 * tuned in the Change Location & Radius sheet. Both are opened from the consumer
 * top navbar, which Home and the Deals feed share, so keeping the values here
 * (rather than per screen) is what stops the two navbars from disagreeing.
 */
interface LocationState {
  area: AreaName;
  radiusKm: number;
  setArea: (area: AreaName) => void;
  setRadiusKm: (radiusKm: number) => void;
  /** Applies both in one commit, e.g. from the radius sheet. */
  setTargeting: (area: AreaName, radiusKm: number) => void;
}

export const useLocationStore = create<LocationState>()(
  devtools(
    persist(
      set => ({
        area: DEFAULT_AREA,
        radiusKm: 5,
        setArea: area => set({ area }),
        setRadiusKm: radiusKm => set({ radiusKm }),
        setTargeting: (area, radiusKm) => set({ area, radiusKm }),
      }),
      {
        name: 'vemtap-location',
        storage: createJSONStorage(() => AsyncStorage),
      },
    ),
  ),
);
