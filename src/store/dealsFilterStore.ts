import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Consumer deal filters — the single source for what the Home and Deals feeds
 * narrow down to.
 *
 * Radius is deliberately **not** here. It lives in `locationStore`, which the
 * shared navbar pill and the feed already read, so a second copy would let the
 * pill and the feed disagree about the same number. The filter page writes
 * radius through `setRadiusKm` instead.
 *
 * Price and discount are request parameters now (Phase 2 added `minPrice`,
 * `maxPrice` and `minDiscount` to the offers feed); category and availability
 * remain client-side refinements. Category is matched by name because the
 * offers feed carries `categoryName` while the design asks for multi-select and
 * the API accepts only a single `categoryId`; availability has no server
 * parameter at all.
 */
export interface DealsFilterState {
  /** Taxonomy names, matched against an offer's `categoryName`. */
  categoryNames: string[];
  minPrice: number | null;
  maxPrice: number | null;
  minDiscountPercent: number | null;
  availability: string[];
  setCategories: (names: string[]) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  setMinDiscount: (percent: number | null) => void;
  setAvailability: (keys: string[]) => void;
  reset: () => void;
}

type FilterValues = Pick<
  DealsFilterState,
  'categoryNames' | 'minPrice' | 'maxPrice' | 'minDiscountPercent' | 'availability'
>;

const EMPTY_FILTERS: FilterValues = {
  categoryNames: [],
  minPrice: null,
  maxPrice: null,
  minDiscountPercent: null,
  availability: [],
};

export const useDealsFilterStore = create<DealsFilterState>()(
  devtools(
    persist(
      set => ({
        ...EMPTY_FILTERS,
        setCategories: categoryNames => set({ categoryNames }),
        setPriceRange: (minPrice, maxPrice) => set({ minPrice, maxPrice }),
        setMinDiscount: minDiscountPercent => set({ minDiscountPercent }),
        setAvailability: availability => set({ availability }),
        reset: () => set({ ...EMPTY_FILTERS }),
      }),
      {
        name: 'vemtap-deals-filters',
        storage: createJSONStorage(() => AsyncStorage),
      },
    ),
  ),
);
