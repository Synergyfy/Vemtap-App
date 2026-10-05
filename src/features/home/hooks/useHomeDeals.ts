import { useMemo } from 'react';
import { usePublicOffersFeed } from '@features/deals/hooks/usePublicOffers';
import { discoveryOrigin } from '@utils/geo';
import { useLocationStore } from '@store/locationStore';
import {
  mapOfferToHomeFeatured,
  mapOfferToHomeNearby,
  mapOfferToHomeTrending,
} from '@features/home/utils/homeOfferMapper';
import type {
  FeaturedDeal,
  NearbyDeal,
  TrendingDeal,
} from '@features/home/data/homeFeed';

/**
 * Home's three deal sections, from the same live feed the Deals tab reads.
 *
 * One offer can only sit in one section, so the featured card takes the first
 * offer and the rest are shared between "deals near you" and "trending". Trending
 * is ordered by how many times an offer has been claimed — the only popularity
 * signal the API actually exposes — rather than being a second copy of the same
 * list in a different order.
 *
 * Sections come back empty rather than padded: with a narrow radius the API can
 * legitimately return one offer, and a section showing the same offer twice
 * would be worse than a section that is not there.
 */
export function useHomeDeals(limit = 20) {
  const area = useLocationStore(state => state.area);
  const coords = useLocationStore(state => state.coords);
  const origin = useMemo(() => discoveryOrigin(area, coords), [area, coords]);

  const { offers, isLoading, isError, refetch } = usePublicOffersFeed(limit);

  return useMemo(() => {
    const [first, ...rest] = offers;

    const trending = [...rest]
      .sort((a, b) => b.claimedCount - a.claimedCount)
      .slice(0, 8)
      .map(offer => mapOfferToHomeTrending(offer, origin));

    return {
      featured: first ? mapOfferToHomeFeatured(first, origin) : null,
      nearby: rest.map(offer => mapOfferToHomeNearby(offer, origin)),
      trending,
      isLoading,
      isError,
      refetch,
    } satisfies {
      featured: FeaturedDeal | null;
      nearby: NearbyDeal[];
      trending: TrendingDeal[];
      isLoading: boolean;
      isError: boolean;
      refetch: () => void;
    };
  }, [offers, origin, isLoading, isError, refetch]);
}
