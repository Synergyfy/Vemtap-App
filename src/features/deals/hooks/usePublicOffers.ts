import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dealsApi, type Offer } from '@api/dealsApi';
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
 * `radius` is sent even without GPS, using the district centre. That is the
 * promise the radius control makes ("within 5 km"), and it means a manually
 * picked district narrows the feed the same way a GPS read does.
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

  // The filters are read here rather than passed in so Home and the Deals tab
  // share one application point — a second copy of this logic would let the two
  // feeds disagree about what "filtered" means.
  const criteria = useMemo(
    () => ({ categoryNames, minPrice, maxPrice, minDiscountPercent, availability }),
    [categoryNames, minPrice, maxPrice, minDiscountPercent, availability],
  );

  const query = useQuery({
    queryKey: ['offers', 'public', origin.latitude, origin.longitude, radiusKm, limit],
    queryFn: () =>
      dealsApi.listPublicOffers({
        limit,
        lat: origin.latitude,
        lng: origin.longitude,
        radius: radiusKm,
      }),
    // Applied in `select` rather than sent to the API: the raw payload stays
    // cached unfiltered, so clearing a filter is instant and never refetches.
    select: result => applyDealsFilters(result.data ?? [], criteria),
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
