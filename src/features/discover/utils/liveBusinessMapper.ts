import type { PublicBusinessDetail } from '@api/publicBusinessApi';
import { formatDistanceLabel } from '@features/deals/utils/offerMapper';
import { haversineMeters } from '@utils/geo';
import type { BusinessProfileSummary } from '@features/discover/data/discoverData';
import { strings } from '@constants/strings';

/**
 * A public business payload onto the Discover profile's view model.
 *
 * Three things this deliberately does **not** do, because the public business
 * endpoint does not supply them and a plausible-looking number would be a lie:
 *
 *  - no rating or review count (there is no public business-rating endpoint)
 *  - no "N active deals" count (the offers feed cannot be filtered by business)
 *  - no distance from the reader (the business has coordinates, so distance to
 *    it *is* real — but only when the reader's origin is known)
 *
 * Those become empty strings, and the profile omits the corresponding rows
 * instead of rendering a placeholder. The verification pill comes from
 * `isVerified`, which is the one signal the API actually reports.
 */

/** Neutral mark for a merchant that has not uploaded a logo. */
const FALLBACK_LOGO = require('@assets/images/vemtap-square-logo.png');

export type LiveBusinessProfile = BusinessProfileSummary & {
  /** Real coordinates, used to centre the profile map. */
  latitude?: number;
  longitude?: number;
  /** The merchant's own words, when they have written any. */
  description?: string;
  phone?: string;
  website?: string;
  whatsappNumber?: string;
  openingHours?: PublicBusinessDetail['openingHours'];
  isVerified?: boolean;
};

export function mapPublicBusinessToProfile(
  business: PublicBusinessDetail,
): LiveBusinessProfile {
  const category = business.category?.name ?? business.otherSubcategoryName ?? '';
  const location =
    [business.city, business.state].filter(Boolean).join(', ') || business.address || '';

  return {
    id: business.id,
    name: business.name,
    category,
    // Not one of the bundled Discover filters; only used by DiscoverScreen's own
    // filtering, which a live profile never participates in.
    categoryFilter: 'Food & Dining',
    imageUri: business.logoUrl ?? FALLBACK_LOGO,
    imageAlt: strings.businessProfile.imageAlt(business.name, category),
    // No public rating source — the profile hides the row rather than inventing
    // a score.
    rating: '',
    reviews: 0,
    // Only meaningful once the reader's position is known; the hook fills this in
    // when an origin is available.
    distance: '',
    location,
    // No per-business offer count available from the public feed.
    activeDealLabel: '',
    status: business.isVerified
      ? { label: strings.businessProfile.verified, icon: 'verified' as const }
      : { label: strings.businessProfile.active, icon: 'featured' as const },

    latitude: business.latitude ?? undefined,
    longitude: business.longitude ?? undefined,
    description: business.description ?? undefined,
    phone: business.phone ?? business.whatsappNumber ?? undefined,
    website: business.website ?? undefined,
    whatsappNumber: business.whatsappNumber ?? undefined,
    openingHours: business.openingHours ?? undefined,
    isVerified: business.isVerified,
  };
}

/**
 * Distance from the reader to the merchant, or '' when either position is
 * unknown. Kept here so the profile and the offers feed agree on the number.
 */
export function withReaderDistance(
  profile: LiveBusinessProfile,
  origin: { latitude: number; longitude: number } | null,
): LiveBusinessProfile {
  if (!origin || profile.latitude === undefined || profile.longitude === undefined) {
    return profile;
  }
  const metres = haversineMeters(origin, {
    latitude: profile.latitude,
    longitude: profile.longitude,
  });
  return { ...profile, distance: formatDistanceLabel(metres) };
}
