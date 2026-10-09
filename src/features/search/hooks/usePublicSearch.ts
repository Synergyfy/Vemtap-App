import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicSearchApi } from '@api/publicSearchApi';
import { toNearbyBusiness } from '@features/home/hooks/useNearbyBusinesses';
import { mapOfferToHomeNearby } from '@features/home/utils/homeOfferMapper';
import { toPopularProduct } from '@features/home/utils/productMapper';
import { useLocationStore } from '@store/locationStore';
import { discoveryOrigin } from '@utils/geo';
import { useDebounce } from '@hooks/useDebounce';
import type {
  NearbyBusiness,
  NearbyDeal,
  PopularProduct,
} from '@features/home/data/homeFeed';

/**
 * Search across deals, businesses, products and categories from one endpoint.
 *
 * `GET /public/search` is public and groups results by entity, which is what the
 * design's search bar asks for ("Search deals, businesses or products"). The
 * request now carries `lat`/`lng`/`radius`, so the results are narrowed to the
 * same discovery origin the Home and Deals sections below filter by — a search
 * no longer ignores the district it sits in.
 *
 * Remaining honesty note: business results carry no `uniqueCode`, so a result
 * cannot be opened as a merchant profile — the code endpoint answers 404 for
 * what these payloads carry. Business rows are therefore not pressable,
 * matching Home's own section.
 *
 * Deliberately split in two: `useSearch` is plain input state with no query
 * client behind it, and `useSearchResults` owns the request. A text field that
 * could not render without a `QueryClientProvider` would be an awkward
 * dependency for every screen that merely shows a search bar.
 */

export const searchKeys = {
  results: (term: string, lat: number, lng: number, radius: number) =>
    ['public-search', term, lat, lng, radius] as const,
};

/**
 * The chip labels are display copy with an emoji prefix ("🍔 Food"), while the
 * query is plain text. Only the prefix is removed — "Food" stays "Food" — so
 * nothing about the label is reworded.
 */
export function chipSearchTerm(label: string): string {
  return label.replace(/^[^\p{L}\p{N}]+/u, '').trim();
}

export interface UseSearch {
  /** What the text input currently holds, emoji-free chips included. */
  query: string;
  setQuery: (value: string) => void;
  /** The trimmed query. */
  term: string;
  /** `term` after the debounce — what is safe to request. */
  debounced: string;
  /** True as soon as there is anything typed, before the debounce settles. */
  active: boolean;
  /** True while the input has moved on but the request has not caught up. */
  debouncePending: boolean;
}

/**
 * Input state and debounce only, so the Home tab and the Deals tab cannot drift
 * apart on debounce length or on what counts as "searching".
 *
 * The debounce is the shared `useDebounce` default rather than a number picked
 * per screen.
 */
export function useSearch(): UseSearch {
  const [query, setQuery] = useState('');
  const term = useMemo(() => query.trim(), [query]);
  const debounced = useDebounce(term);
  const active = term.length > 0;

  return {
    query,
    setQuery,
    term,
    debounced,
    active,
    // The input has moved on but the request has not caught up yet.
    debouncePending: active && debounced !== term,
  };
}

export interface SearchResultsData {
  deals: NearbyDeal[];
  businesses: NearbyBusiness[];
  products: PopularProduct[];
  /** A request is owed or in flight — drives the searching state. */
  searching: boolean;
  isError: boolean;
  retry: () => void;
}

const LIMIT = 20;

/**
 * The request behind the results panel. Only mounted while a query is active,
 * so an idle screen never issues one.
 */
export function useSearchResults(
  term: string,
  debouncePending: boolean,
): SearchResultsData {
  const area = useLocationStore(state => state.area);
  const coords = useLocationStore(state => state.coords);
  const radiusKm = useLocationStore(state => state.radiusKm);
  const origin = useMemo(() => discoveryOrigin(area, coords), [area, coords]);

  // Mapped once per fetch rather than on every render; `origin` only changes
  // when the reader moves district, so this does not thrash the cache.
  const select = useMemo(
    () => (result: Awaited<ReturnType<typeof publicSearchApi.search>>) => ({
      deals: result.deals.map(offer => mapOfferToHomeNearby(offer, origin)),
      businesses: result.businesses.map(toNearbyBusiness),
      products: result.products.map(toPopularProduct),
    }),
    [origin],
  );

  // The raw payload is cached and `select` maps it, so the transformation runs
  // once per fetch and the result is shared between callers of this term.
  // Origin and radius are part of the key: moving, or widening the radius, must
  // refetch rather than serve the previous district's results.
  const results = useQuery({
    queryKey: searchKeys.results(term, origin.latitude, origin.longitude, radiusKm),
    queryFn: () =>
      publicSearchApi.search({
        q: term,
        limit: LIMIT,
        lat: origin.latitude,
        lng: origin.longitude,
        radius: radiusKm,
      }),
    select,
    enabled: term.length > 0,
    staleTime: 60_000,
  });

  // A disabled query reports itself as pending with an idle fetch status; only
  // an actually-running request counts, otherwise an empty input would show a
  // spinner forever.
  const inFlight = results.isPending && results.fetchStatus !== 'idle';

  return {
    searching: debouncePending || inFlight,
    deals: results.data?.deals ?? [],
    businesses: results.data?.businesses ?? [],
    products: results.data?.products ?? [],
    isError: results.isError,
    retry: results.refetch,
  };
}
