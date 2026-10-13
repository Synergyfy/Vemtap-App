import type { Offer } from '@api/dealsApi';

/**
 * The client-side refinements the offers feed applies itself.
 *
 * Category and availability are here because the API cannot express them the
 * way the design needs: the offers endpoint takes a single `categoryId` while
 * the filter page is multi-select over `categoryName`, and there is no
 * availability signal at all. The offers carry `categoryName`, `startDate` and
 * `endDate`, so both dimensions are answerable from the loaded page.
 *
 * Price and discount used to live here too. Phase 2 added `minPrice`,
 * `maxPrice` and `minDiscount` server-side, so `usePublicOffersFeed` sends them
 * with the request and only passes `null` through this util — the fields stay
 * supported for callers (and tests) that refine a local list.
 *
 * That makes these refinements a refinement of the loaded page rather than a
 * server query — consistent with the cursor-paginated feed they decorate.
 */

export interface DealsFilterCriteria {
  /** Taxonomy names, matched against an offer's `categoryName`. */
  categoryNames: string[];
  minPrice: number | null;
  maxPrice: number | null;
  minDiscountPercent: number | null;
  availability: string[];
}

export const ENDING_SOON_MS = 24 * 60 * 60 * 1000;

/** Availability keys the API can actually answer for. */
const SIGNALLED_AVAILABILITY = new Set(['now', 'ending']);

/**
 * `calculatedPrice` arrives as a string ("200.00") or not at all. A missing
 * price must read as "unknown", never as zero — `Number(null)` is `0`, which
 * would make a priceless offer look like the cheapest one in the feed.
 */
export function offerPrice(offer: Offer): number | null {
  const raw = offer.calculatedPrice;
  if (raw === null || raw === undefined || raw === '') return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function matchesAvailability(offer: Offer, keys: string[], now: number): boolean {
  const signalled = keys.filter(key => SIGNALLED_AVAILABILITY.has(key));
  // Selecting only an unsupported key ("walk-ins", "weekend") leaves the
  // availability constraint empty rather than emptying the feed — the API
  // exposes no signal for either, so there is nothing to filter on.
  if (signalled.length === 0) return true;

  const start = Date.parse(offer.startDate ?? '');
  const end = Date.parse(offer.endDate ?? '');
  return signalled.some(key => {
    if (key === 'now') {
      const started = Number.isNaN(start) || start <= now;
      const notEnded = Number.isNaN(end) || end >= now;
      return offer.status === 'active' && !offer.isExpired && started && notEnded;
    }
    return !Number.isNaN(end) && end >= now && end - now <= ENDING_SOON_MS;
  });
}

export function applyDealsFilters(
  offers: Offer[],
  criteria: DealsFilterCriteria,
  now: number = Date.now(),
): Offer[] {
  const { categoryNames, minPrice, maxPrice, minDiscountPercent, availability } =
    criteria;
  const categories = new Set(categoryNames.map(name => name.trim()).filter(Boolean));

  return offers.filter(offer => {
    if (categories.size > 0 && !categories.has((offer.categoryName ?? '').trim())) {
      return false;
    }

    if (minPrice !== null || maxPrice !== null) {
      const price = offerPrice(offer);
      // An offer with no readable price is kept rather than hidden: dropping it
      // would silently remove deals the price filter knows nothing about.
      if (price !== null) {
        if (minPrice !== null && price < minPrice) return false;
        if (maxPrice !== null && price > maxPrice) return false;
      }
    }

    if (
      minDiscountPercent !== null &&
      (offer.discountPercent ?? 0) < minDiscountPercent
    ) {
      return false;
    }

    return matchesAvailability(offer, availability, now);
  });
}
