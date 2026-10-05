import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dealsApi, type Offer } from '@api/dealsApi';
import { useLocationStore } from '@store/locationStore';
import { discoveryOrigin } from '@utils/geo';
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

  const origin = useMemo(() => discoveryOrigin(area, coords), [area, coords]);

  const query = useQuery({
    queryKey: ['offers', 'public', origin.latitude, origin.longitude, radiusKm, limit],
    queryFn: () =>
      dealsApi.listPublicOffers({
        limit,
        lat: origin.latitude,
        lng: origin.longitude,
        radius: radiusKm,
      }),
    staleTime: 60_000,
  });

  const offers: Offer[] = query.data?.data ?? [];

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
