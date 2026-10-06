import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicSearchApi } from '@api/publicSearchApi';
import { toNearbyBusiness } from '@features/home/hooks/useNearbyBusinesses';
import { mapOfferToHomeNearby } from '@features/home/utils/homeOfferMapper';
import { useLocationStore } from '@store/locationStore';
import { discoveryOrigin } from '@utils/geo';
import { useDebounce } from '@hooks/useDebounce';
import type { NearbyBusiness, NearbyDeal } from '@features/home/data/homeFeed';

/**
 * Search across deals, businesses and categories from one endpoint.
 *
 * `GET /public/search?q=…` is public and already groups results by entity, which
 * is what the design's placeholder asks for ("Search deals, businesses or
 * products"), so chips and the search bar share this one path rather than each
 * driving a different filter mechanism.
 *
 * Three limitations of the current API are respected rather than papered over:
 *
 *  - **No products group.** The placeholder mentions products, but the endpoint
 *    returns only deals, businesses and categories — and `GET /products` is empty
 *    server-side anyway. Nothing product-shaped is rendered.
 *  - **No location params.** `lat`, `lng` and `radius` are rejected with a 400 by
 *    the whitelist, so results are *global*: a search ignores the district the
 *    sections below it filter by. Distance is still printed from the local
 *    origin, because that is a local calculation, not a server one.
 *  - **No `uniqueCode` on business results**, so a result cannot be opened as a
 *    merchant profile — the code endpoint answers 404 for everything these
 *    payloads carry (see `useDealDetail` for the same gap on offer details).
 *    Business rows are therefore not pressable, matching Home's own section.
 *
 * Deliberately split in two: `useSearch` is plain input state with no query
 * client behind it, and `useSearchResults` owns the request. A text field that
 * could not render without a `QueryClientProvider` would be an awkward
 * dependency for every screen that merely shows a search bar.
 */

export const searchKeys = {
  results: (term: string) => ['public-search', term] as const,
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
  const origin = useMemo(() => discoveryOrigin(area, coords), [area, coords]);

  // Mapped once per fetch rather than on every render; `origin` only changes
  // when the reader moves district, so this does not thrash the cache.
  const select = useMemo(
    () => (result: Awaited<ReturnType<typeof publicSearchApi.search>>) => ({
      deals: result.deals.map(offer => mapOfferToHomeNearby(offer, origin)),
      businesses: result.businesses.map(toNearbyBusiness),
    }),
    [origin],
  );

  // The raw payload is cached and `select` maps it, so the transformation runs
  // once per fetch and the result is shared between callers of this term.
  const results = useQuery({
    queryKey: searchKeys.results(term),
    queryFn: () => publicSearchApi.search({ q: term, limit: LIMIT }),
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
    isError: results.isError,
    retry: results.refetch,
  };
}
