import type { Offer } from '@api/dealsApi';
import type { GeoCoords } from '@constants/locations';
import {
  discountLabel,
  formatDistanceLabel,
  merchantLabel,
  offerCountdown,
  offerDistanceMeters,
  offerImage,
  priceLabels,
} from '@features/deals/utils/offerMapper';
import type {
  FeaturedDeal,
  NearbyDeal,
  TrendingDeal,
} from '@features/home/data/homeFeed';
import { strings } from '@constants/strings';

/**
 * Live offers onto the Home cards' view models.
 *
 * Home and the Deals feed render the same offers through different cards, and
 * the formatting rules (discount badge, price pair, distance) must not drift
 * between them — so those come from the shared mapper rather than being written
 * again here. What this file adds is only what Home's cards uniquely need: the
 * merchant/status split, the short titles the grid card truncates, and the
 * countdown badge the list card shows.
 *
 * `origin` is the same discovery origin the feed filtered by, so a distance
 * printed on a Home card describes the same point the API used.
 */

/**
 * The grid card shows one line, and the discount badge beside it already reads
 * "20% OFF", so the title drops a leading discount phrase instead of printing it
 * twice. Only a prefix is removed — no wording is invented, and a title without
 * one is returned unchanged.
 */
export function shortTitle(name: string): string {
  const stripped = name.replace(/^(\d+%\s*off|\u20a6[\d,]+\s*off)\s+/i, '').trim();
  return stripped.length > 0 ? stripped : name;
}

function distance(offer: Offer, origin: GeoCoords): string {
  return formatDistanceLabel(offerDistanceMeters(offer, origin));
}

/**
 * Home's cards show a status pill. The API exposes no verification flag on an
 * offer, so a steep discount is the honest signal available — a fabricated
 * "Verified" would be a claim we cannot stand behind.
 */
function statusPill(offer: Offer): NearbyDeal['status'] {
  return (offer.discountPercent ?? 0) >= 50
    ? { kind: 'hot', label: strings.home.hot }
    : { kind: 'verified', label: strings.deals.dealLive };
}

export function mapOfferToHomeFeatured(offer: Offer, origin: GeoCoords): FeaturedDeal {
  const prices = priceLabels(offer);

  return {
    id: offer.id,
    image: { uri: offerImage(offer) },
    badge: discountLabel(offer),
    endsLabel: offerCountdown(offer.endDate) ?? strings.deals.endsIn('today'),
    merchant: merchantLabel(offer),
    status: { kind: 'verified', label: strings.deals.dealLive },
    title: offer.name,
    price: prices.price,
    priceWas: prices.priceWas,
    distance: distance(offer, origin),
    likes: 0,
    comments: 0,
  };
}

export function mapOfferToHomeNearby(offer: Offer, origin: GeoCoords): NearbyDeal {
  const prices = priceLabels(offer);
  const merchant = merchantLabel(offer);
  const countdown = offerCountdown(offer.endDate);
  const [name] = merchant.split(' • ');

  return {
    id: offer.id,
    image: { uri: offerImage(offer) },
    badge: discountLabel(offer),
    // Only a live countdown earns the schedule badge; the design's other kind
    // ("exclusive") has no server-side signal, so it is never faked.
    metaBadge: countdown ? { kind: 'schedule', label: countdown } : undefined,
    merchant,
    merchantShort: name ?? '',
    status: statusPill(offer),
    title: offer.name,
    titleShort: shortTitle(offer.name),
    price: prices.price,
    priceWas: prices.priceWas,
    distance: distance(offer, origin),
    distanceShort: distance(offer, origin),
    likes: 0,
    comments: 0,
  };
}

export function mapOfferToHomeTrending(offer: Offer, origin: GeoCoords): TrendingDeal {
  const prices = priceLabels(offer);

  return {
    id: offer.id,
    image: { uri: offerImage(offer) },
    badge: discountLabel(offer),
    merchant: merchantLabel(offer),
    title: offer.name,
    price: prices.price,
    priceWas: prices.priceWas,
    distance: distance(offer, origin),
    likes: 0,
    comments: 0,
  };
}
