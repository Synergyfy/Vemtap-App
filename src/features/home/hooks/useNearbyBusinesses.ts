import { useQuery } from '@tanstack/react-query';
import { dealsApi, type PublicBusiness } from '@api/dealsApi';
import type { NearbyBusiness } from '@features/home/data/homeFeed';
import { strings } from '@constants/strings';

/**
 * Businesses near the reader, from the public discovery list.
 *
 * Two honesty notes about the live data:
 *
 *  - `GET /public/businesses` returns no coordinates, so **distance cannot be
 *    computed** and the row omits it rather than guessing from the address. The
 *    offer feed does carry coordinates, so a business can still be reached from
 *    the offer that belongs to it.
 *  - It exposes no rating or review count either, so no score is shown. What it
 *    does report is `isVerified`, which is used for the row's trailing badge.
 */

/** Neutral mark for a business that has not uploaded a logo. */
const FALLBACK_LOGO = require('@assets/images/vemtap-square-logo.png');

export const homeBusinessKeys = {
  nearby: () => ['businesses', 'public'] as const,
};

/**
 * `select` maps the API payload to the card view model in the cache, so the
 * transformation runs once per fetch rather than on every render.
 */
export function useNearbyBusinesses(limit = 8) {
  return useQuery<PublicBusiness[], Error, NearbyBusiness[]>({
    queryKey: homeBusinessKeys.nearby(),
    queryFn: () => dealsApi.listPublicBusinesses(),
    select: businesses => businesses.slice(0, limit).map(toNearbyBusiness),
    staleTime: 300_000,
  });
}

export function toNearbyBusiness(business: PublicBusiness): NearbyBusiness {
  return {
    id: business.id,
    image: business.logoUrl ? { uri: business.logoUrl } : FALLBACK_LOGO,
    name: business.name,
    category: business.categoryName ?? '',
    // Not reported by the endpoint; the card omits the row.
    distance: '',
    rating: '',
    ratingCount: '',
    meta: business.isVerified
      ? strings.businessProfile.verified
      : [business.city, business.state].filter(Boolean).join(', '),
  };
}
