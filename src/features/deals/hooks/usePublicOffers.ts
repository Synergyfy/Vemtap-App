import { useQuery } from '@tanstack/react-query';
import { dealsApi, type Offer } from '@api/dealsApi';
import { useLocationStore } from '@store/locationStore';
import {
  mapOfferToFeatured,
  mapOfferToGridItem,
  mapOfferToListItem,
  type MappedFeed,
} from '@features/deals/utils/offerMapper';

/**
 * The live offers feed. Distance is derived client-side from the selected
 * district, so the selected area is part of the query key and changing it
 * refetches rather than showing stale distances.
 */
export function usePublicOffersFeed(limit = 20) {
  const area = useLocationStore(state => state.area);

  const query = useQuery({
    queryKey: ['offers', 'public', area, limit],
    queryFn: () => dealsApi.listPublicOffers({ limit }),
    staleTime: 60_000,
  });

  const offers: Offer[] = query.data?.data ?? [];

  return {
    ...query,
    offers,
    feed: {
      area,
      featured: offers[0] ? mapOfferToFeatured(offers[0], area) : null,
      list: offers.map(offer => mapOfferToListItem(offer, area)),
      grid: offers.map(offer => mapOfferToGridItem(offer, area)),
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
