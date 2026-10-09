import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { dealsApi, type Offer, type OfferFeed } from '@api/dealsApi';
import { useLocationStore } from '@store/locationStore';
import { useDealsFilterStore } from '@store/dealsFilterStore';
import { discoveryOrigin } from '@utils/geo';
import { applyDealsFilters } from '@features/deals/utils/dealsFilter';
import {
  mapOfferToFeatured,
  mapOfferToGridItem,
  mapOfferToListItem,
  type MappedFeed,
} from '@features/deals/utils/offerMapper';

/**
 * The live offers feed, filtered to what is actually nearby.
 *
 * The origin is the user's real position when they used "use my location", and
 * the centre of the district they picked otherwise, so the same origin drives
 * both the `lat`/`lng`/`radius` the API filters on and the distance printed on
 * each card. Origin and radius are part of the query key: moving the device or
 * widening the radius has to refetch, otherwise the feed would keep serving
 * results for the previous position.
 *
 * Phase 2 moved price and discount narrowing to the server (`minPrice`,
 * `maxPrice`, `minDiscount`), so the loaded page is no longer an arbitrary
 * subset that the client then thins out. Only two refinements stay client-side:
 *
 *  - **Category** — the design asks for multi-select, the API takes one
 *    `categoryId`, and the feed carries `categoryName`, so names are matched
 *    against the loaded page.
 *  - **Availability** — the API exposes no availability signal.
 *
 * Pagination is cursor-based: `nextCursor` from the response is fed back as
 * `cursor`, and pages accumulate in one infinite query. `popular`/`featured`
 * sorts return no cursor, so `hasNextPage` simply stops the chain there.
 */
export function usePublicOffersFeed(limit = 20) {
  const area = useLocationStore(state => state.area);
  const coords = useLocationStore(state => state.coords);
  const radiusKm = useLocationStore(state => state.radiusKm);
  const categoryNames = useDealsFilterStore(state => state.categoryNames);
  const minPrice = useDealsFilterStore(state => state.minPrice);
  const maxPrice = useDealsFilterStore(state => state.maxPrice);
  const minDiscountPercent = useDealsFilterStore(state => state.minDiscountPercent);
  const availability = useDealsFilterStore(state => state.availability);

  const origin = useMemo(() => discoveryOrigin(area, coords), [area, coords]);

  // The client-side criteria still applied to the raw payload. Price/discount
  // are null on purpose: the server already applied them.
  const criteria = useMemo(
    () => ({
      categoryNames,
      minPrice: null,
      maxPrice: null,
      minDiscountPercent: null,
      availability,
    }),
    [categoryNames, availability],
  );

  const query = useInfiniteQuery<
    OfferFeed,
    Error,
    Offer[],
    readonly unknown[],
    string | undefined
  >({
    queryKey: [
      'offers',
      'public',
      origin.latitude,
      origin.longitude,
      radiusKm,
      limit,
      minPrice,
      maxPrice,
      minDiscountPercent,
    ],
    queryFn: ({ pageParam }) =>
      dealsApi.listPublicOffers({
        limit,
        lat: origin.latitude,
        lng: origin.longitude,
        radius: radiusKm,
        minPrice: minPrice ?? undefined,
        maxPrice: maxPrice ?? undefined,
        minDiscount: minDiscountPercent ?? undefined,
        cursor: pageParam,
      }),
    initialPageParam: undefined,
    getNextPageParam: last =>
      last.hasNextPage && last.nextCursor ? last.nextCursor : undefined,
    // Applied in `select` rather than sent to the API: the raw payload stays
    // cached unfiltered, so clearing a category/availability filter is instant
    // and never refetches.
    select: result =>
      applyDealsFilters(
        result.pages.flatMap(page => page.data ?? []),
        criteria,
      ),
    staleTime: 60_000,
  });

  const offers: Offer[] = query.data ?? [];

  return {
    ...query,
    offers,
    feed: {
      // The label the navbar shows; distances come from `origin`.
      area,
      featured: offers[0] ? mapOfferToFeatured(offers[0], origin) : null,
      list: offers.map(offer => mapOfferToListItem(offer, origin)),
      grid: offers.map(offer => mapOfferToGridItem(offer, origin)),
    } satisfies MappedFeed,
  };
}

/**
 * Engagement counts for a single offer. The public engagement endpoint is one
 * request per offer, so this is fetched per rendered row and cached per offerId
 * rather than fanned out for the whole feed. A batch endpoint would remove the
 * N+1.
 */
export function useDealEngagement(offerId: string | null) {
  return useQuery({
    queryKey: ['offers', 'engagement', offerId],
    queryFn: () => dealsApi.getEngagement(offerId as string),
    enabled: Boolean(offerId),
    staleTime: 60_000,
  });
}
