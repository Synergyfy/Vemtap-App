import type { Offer } from '@api/dealsApi';
import type { GeoCoords } from '@constants/locations';
import { haversineMeters } from '@utils/geo';
import { formatCurrency } from '@utils/formatters';
import { strings } from '@constants/strings';
import type {
  DealGridItem,
  DealListItem,
  FeaturedDealOfDay,
} from '@features/deals/data/dealsFeed';

/**
 * Maps API offers onto the view models the deal cards already consume.
 *
 * The feed endpoint returns no distance, so it is computed here from the
 * business coordinates against the discovery origin (the user's position, or the
 * centre of the district they picked). Images come from the first catalogue item that has one;
 * money arrives as numbers or numeric strings; the countdown is derived from
 * `endDate`, which is an absolute instant, so no timezone assumption is needed.
 */

/** Neutral 1x1 transparent PNG for offers whose items carry no image. */
const PLACEHOLDER_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

/**
 * Re-exported so existing callers keep one import site; the implementation now
 * lives in `@utils/geo`, shared with the location flow.
 */
export { haversineMeters } from '@utils/geo';

/**
 * Distance from the discovery origin to the offer's business, or null.
 *
 * The origin is a position rather than a district name because it is either the
 * user's real coordinates or the district centre they picked — `discoveryOrigin`
 * decides which, so the number here always matches the proximity filter the API
 * applied.
 */
export function offerDistanceMeters(offer: Offer, origin: GeoCoords): number | null {
  const { latitude, longitude } = offer.business ?? {};
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;

  return haversineMeters(origin, { latitude, longitude });
}

export function formatDistanceLabel(meters: number | null): string {
  if (meters === null) return '';
  const label =
    meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
  return strings.deals.distanceAway(label);
}

function toAmount(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function offerImage(offer: Offer): string {
  const withImage = offer.items.find(item => item.mainImage);
  return withImage?.mainImage ?? PLACEHOLDER_IMAGE;
}

/** Remaining time until `endDate`, e.g. "Ends in 4h". Null when unknown/over. */
export function offerCountdown(
  endDate: string | null | undefined,
  now = Date.now(),
): string | null {
  if (!endDate) return null;
  const end = Date.parse(endDate);
  if (Number.isNaN(end)) return null;

  const remaining = end - now;
  if (remaining <= 0) return null;

  const totalHours = Math.floor(remaining / 3_600_000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = Math.floor(remaining / 60_000) % 60;

  if (days > 0) return strings.deals.endsInDays(days, hours);
  if (totalHours > 0) return strings.deals.endsInHours(totalHours);
  return strings.deals.endsInMinutes(minutes);
}

/** Exported for the Home cards, which render the same badge in their own layout. */
export function discountLabel(offer: Offer): string {
  if (typeof offer.discountPercent === 'number' && offer.discountPercent > 0) {
    return strings.deals.percentOff(offer.discountPercent);
  }
  const off = toAmount(offer.percentageOff);
  return off ? strings.deals.amountOff(formatCurrency(off)) : strings.deals.specialOffer;
}

/** A "hot" badge for steep discounts; the API exposes no verification flag on offers. */
function statusIcon(offer: Offer): DealGridItem['statusIcon'] {
  return (offer.discountPercent ?? 0) >= 50 ? 'hot' : 'none';
}

/** Exported for the Home cards. */
export function merchantLabel(offer: Offer): string {
  const name = offer.business?.name ?? offer.branchName ?? '';
  const city = offer.business?.city;
  return city ? `${name} • ${city}` : name;
}

export function priceLabels(offer: Offer): {
  price: string;
  priceWas: string;
  save: string;
} {
  const current = toAmount(offer.calculatedPrice);
  const original = toAmount(offer.originalPrice);

  if (current === null && original === null) {
    return { price: '', priceWas: '', save: '' };
  }
  if (current === null) {
    return {
      price: formatCurrency(original ?? 0),
      priceWas: '',
      save: offerCountdown(offer.endDate) ?? '',
    };
  }

  const saved = original !== null ? original - current : null;
  return {
    price: formatCurrency(current),
    priceWas: original !== null && original > current ? formatCurrency(original) : '',
    save:
      saved !== null && saved > 0
        ? `Save ${formatCurrency(saved)}`
        : (offerCountdown(offer.endDate) ?? ''),
  };
}

function expiryLabel(offer: Offer): { meta: string; metaTone: DealListItem['metaTone'] } {
  if (offer.isExpired) {
    return { meta: strings.deals.dealExpired, metaTone: 'tertiary' };
  }
  const countdown = offerCountdown(offer.endDate);
  return countdown
    ? { meta: countdown, metaTone: 'tertiary' }
    : {
        meta:
          offer.status === 'active'
            ? strings.deals.dealAvailableNow
            : strings.deals.dealUnavailable,
        metaTone: 'secondary',
      };
}

export function mapOfferToListItem(
  offer: Offer,
  origin: GeoCoords,
  engagement?: { likesCount: number; reviewsCount: number },
): DealListItem {
  const countdown = offerCountdown(offer.endDate);
  const prices = priceLabels(offer);
  const expiry = expiryLabel(offer);

  return {
    id: offer.id,
    image: { uri: offerImage(offer) },
    leftBadge: { label: discountLabel(offer), tone: 'discount' },
    rightBadge: countdown
      ? { kind: 'timer', label: countdown }
      : {
          kind: 'text',
          label:
            offer.status === 'active' ? strings.deals.dealLive : strings.deals.dealPaused,
          tone: 'muted',
        },
    merchant: merchantLabel(offer),
    statusIcon: statusIcon(offer),
    title: offer.name,
    price: prices.price,
    priceWas: prices.priceWas,
    save: prices.save,
    location: formatDistanceLabel(offerDistanceMeters(offer, origin)),
    meta: expiry.meta,
    metaTone: expiry.metaTone,
    likes: engagement?.likesCount ?? 0,
    comments: engagement?.reviewsCount ?? 0,
    claimLabel: strings.deals.claimDeal,
  };
}

export function mapOfferToGridItem(offer: Offer, origin: GeoCoords): DealGridItem {
  const countdown = offerCountdown(offer.endDate);
  const prices = priceLabels(offer);

  return {
    id: offer.id,
    image: { uri: offerImage(offer) },
    leftBadge: { label: discountLabel(offer), tone: 'discount' },
    rightBadge: countdown
      ? { kind: 'timer', label: countdown }
      : {
          kind: 'text',
          label:
            offer.status === 'active' ? strings.deals.dealLive : strings.deals.dealPaused,
          tone: 'primary',
        },
    merchant: merchantLabel(offer),
    statusIcon: statusIcon(offer),
    title: offer.name,
    price: prices.price,
    priceWas: prices.priceWas,
    save: prices.save,
    distance: formatDistanceLabel(offerDistanceMeters(offer, origin)),
    claimLabel: strings.deals.claimDeal,
  };
}

export function mapOfferToFeatured(offer: Offer, origin: GeoCoords): FeaturedDealOfDay {
  const countdown = offerCountdown(offer.endDate);
  const prices = priceLabels(offer);
  const limit = offer.remainingLimit ?? offer.totalLimit;

  return {
    id: offer.id,
    image: { uri: offerImage(offer) },
    topPick: strings.deals.topPick,
    specialPromo: discountLabel(offer),
    endsLabel: countdown ?? strings.deals.endsIn('today'),
    merchant: merchantLabel(offer),
    distance: formatDistanceLabel(offerDistanceMeters(offer, origin)),
    title: offer.name,
    price: prices.price,
    priceWas: prices.priceWas,
    save: prices.save,
    stockLabel: limit ? strings.deals.limitedVouchersCount(limit) : '',
    likes: 0,
    comments: 0,
    claimLabel: strings.deals.claimDeal,
  };
}

/** The three view models the deals screen renders, derived from one feed. */
export type MappedFeed = {
  area: string;
  featured: FeaturedDealOfDay | null;
  list: DealListItem[];
  grid: DealGridItem[];
};
