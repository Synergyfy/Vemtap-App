import { useMemo } from 'react';
import { usePublicOffersFeed } from '@features/deals/hooks/usePublicOffers';
import { useSponsoredOffers } from '@features/deals/hooks/useSponsoredOffers';
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
 * How many deals the Featured Deals rail rotates through. The rail shows one
 * card at a time, so this is the size of the rotation rather than a count of
 * cards on screen.
 */
const FEATURED_COUNT = 3;

/**
 * Home's three deal sections, from the same live feed the Deals tab reads.
 *
 * One offer can only sit in one section, so the featured rail takes the first
 * FEATURED_COUNT offers and the rest are shared between "deals near you" and
 * "trending". Trending is ordered by how many times an offer has been claimed —
 * the only popularity signal the API actually exposes — rather than being a
 * second copy of the same list in a different order.
 *
 * Promoted deals (live boosts and campaigns for the `home` placement) lead
 * the featured rail and are taken out of the other sections.
 *
 * Sections come back empty rather than padded: with a narrow radius the API can
 * legitimately return fewer than FEATURED_COUNT offers, and a section showing
 * the same offer twice would be worse than a section that is not there.
 */
export function useHomeDeals(limit = 20) {
  const area = useLocationStore(state => state.area);
  const coords = useLocationStore(state => state.coords);
  const origin = useMemo(() => discoveryOrigin(area, coords), [area, coords]);

  const { offers, isLoading, isError, refetch } = usePublicOffersFeed(limit);
  const sponsored = useSponsoredOffers('home', FEATURED_COUNT);

  return useMemo(() => {
    const promoted = sponsored.slice(0, FEATURED_COUNT);
    const promotedIds = new Set(promoted.map(entry => entry.offer.id));
    const organic = offers.filter(offer => !promotedIds.has(offer.id));
    const organicFeatured = Math.max(0, FEATURED_COUNT - promoted.length);
    const featuredOffers = organic.slice(0, organicFeatured);
    const rest = organic.slice(organicFeatured);

    const trending = [...rest]
      .sort((a, b) => b.claimedCount - a.claimedCount)
      .slice(0, 8)
      .map(offer => mapOfferToHomeTrending(offer, origin));

    return {
      featured: [
        ...promoted.map(entry => ({
          ...mapOfferToHomeFeatured(entry.offer, origin),
          campaignId: entry.campaignId,
        })),
        ...featuredOffers.map(offer => mapOfferToHomeFeatured(offer, origin)),
      ],
      nearby: rest.map(offer => mapOfferToHomeNearby(offer, origin)),
      trending,
      isLoading,
      isError,
      refetch,
    } satisfies {
      featured: FeaturedDeal[];
      nearby: NearbyDeal[];
      trending: TrendingDeal[];
      isLoading: boolean;
      isError: boolean;
      refetch: () => void;
    };
  }, [offers, sponsored, origin, isLoading, isError, refetch]);
}
