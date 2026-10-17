import type { ImageSourcePropType } from 'react-native';

export type FeaturedUrgencyIcon = 'schedule' | 'bolt' | 'trendingUp' | 'timer' | 'bakery';

export type FeaturedListing = {
  id: string;
  /** Hero artwork — the design leads every card with a 176pt image. */
  image: ImageSourcePropType;
  /** Discount badge, e.g. `20% OFF`. */
  discount: string;
  /**
   * Sponsorship label, e.g. `Promoted`. Only listings served by `/sponsored`
   * (a live boost or campaign) carry it; organic feed listings leave it
   * undefined, so the card never claims a promotion that was not paid for.
   */
  promotion?: string;
  /** The live boost or campaign that placed this listing, when promoted. */
  campaignId?: string;
  distance: string;
  /** Raw metres for sorting/range-filtering; undefined when unknown. */
  distanceMeters?: number | null;
  place: string;
  urgency: string;
  /** Only a live countdown earns a badge; see `mapOfferToFeaturedListing`. */
  urgencyIcon?: FeaturedUrgencyIcon;
  merchant: string;
  /** Offers carry no rating, so live listings leave both undefined. */
  rating?: string;
  ratingCount?: number;
  title: string;
  body: string;
  priceWas: string;
  price: string;
  save: string;
};
