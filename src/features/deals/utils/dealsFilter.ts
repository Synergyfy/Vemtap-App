import type { Offer } from '@api/dealsApi';

/**
 * The filters the offers feed applies itself.
 *
 * Everything here is client-side because the API cannot express it: the public
 * offers endpoint takes `categoryId` (a single UUID) but not a list, and rejects
 * `minPrice`, `maxPrice` and `minDiscount` outright. The offers do carry
 * `categoryName`, `calculatedPrice`, `discountPercent` and their start/end dates,
 * so all four dimensions are answerable from what the feed already loaded.
 *
 * That makes these filters a refinement of the loaded page rather than a server
 * query — the same page the app has always shown, since nothing paginates.
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
