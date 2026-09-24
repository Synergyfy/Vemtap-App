import { dealsGrid, dealsList, featuredDealOfDay } from '@features/deals/data/dealsFeed';
import { featuredDeal, nearbyDeals, trendingDeals } from '@features/home/data/homeFeed';
import { glowProfileDeals } from '@features/discover/data/glowSerenityData';
import {
  urbanNearbyDeals,
  urbanProfileDeals,
} from '@features/discover/data/urbanGrillData';

export type ResolvedDeal = {
  id: string;
  image: { uri: string };
  merchant: string;
  location: string;
  title: string;
  price: string;
  priceWas: string;
  save: string;
  badge: string;
  distance: string;
  description: string;
  address: string;
  likes: number;
  comments: number;
};

const fallbackAddress = 'Plot 422, Cadastral Zone, Apo';
const naira = (value: number) => `₦${value.toLocaleString('en-NG')}`;

const gridDeals: ResolvedDeal[] = dealsGrid.map(deal => ({
  id: deal.id,
  image: deal.image,
  merchant: deal.merchant.split(' • ')[0],
  location: deal.merchant.split(' • ')[1] ?? 'Apo, Abuja',
  title: deal.title,
  price: deal.price,
  priceWas: deal.priceWas,
  save: deal.save,
  badge: deal.leftBadge.label,
  distance: deal.distance,
  description:
    'Enjoy this limited-time local offer at the venue. Terms, availability and redemption conditions apply.',
  address: fallbackAddress,
  likes: 248,
  comments: 32,
}));

const listDeals: ResolvedDeal[] = dealsList.map(deal => ({
  id: deal.id,
  image: deal.image,
  merchant: deal.merchant.split(' • ')[0],
  location: deal.merchant.split(' • ')[1] ?? 'Apo, Abuja',
  title: deal.title,
  price: deal.price,
  priceWas: deal.priceWas,
  save: deal.save,
  badge: deal.leftBadge.label,
  distance: deal.location.split(' • ')[0] ?? deal.location,
  description:
    'Enjoy this limited-time local offer at the venue. Terms, availability and redemption conditions apply.',
  address: fallbackAddress,
  likes: deal.likes,
  comments: deal.comments,
}));

const homeDeals: ResolvedDeal[] = [
  {
    id: featuredDeal.id,
    image: featuredDeal.image,
    merchant: featuredDeal.merchant.split(' • ')[0],
    location: featuredDeal.merchant.split(' • ')[1] ?? 'Apo, Abuja',
    title: featuredDeal.title,
    price: featuredDeal.price,
    priceWas: featuredDeal.priceWas,
    save: `Save ${featuredDeal.priceWas}`,
    badge: featuredDeal.badge,
    distance: featuredDeal.distance,
    description: 'A curated local offer with limited availability.',
    address: fallbackAddress,
    likes: featuredDeal.likes,
    comments: featuredDeal.comments,
  },
  ...nearbyDeals.map(deal => ({
    id: deal.id,
    image: deal.image,
    merchant: deal.merchant.split(' • ')[0],
    location: deal.merchant.split(' • ')[1] ?? 'Apo, Abuja',
    title: deal.title,
    price: deal.price,
    priceWas: deal.priceWas,
    save: `Save ${deal.priceWas}`,
    badge: deal.badge,
    distance: deal.distance,
    description:
      'Discover this local offer and reserve it for later use. Redemption conditions apply at the venue.',
    address: fallbackAddress,
    likes: deal.likes,
    comments: deal.comments,
  })),
  ...trendingDeals.map(deal => ({
    id: deal.id,
    image: deal.image,
    merchant: deal.merchant.split(' • ')[0],
    location: 'Apo, Abuja',
    title: deal.title,
    price: deal.price,
    priceWas: deal.priceWas,
    save: `Save ${deal.priceWas}`,
    badge: deal.badge,
    distance: deal.distance,
    description:
      'Discover this local offer and reserve it for later use. Redemption conditions apply at the venue.',
    address: fallbackAddress,
    likes: deal.likes,
    comments: deal.comments,
  })),
];

const urbanDeals: ResolvedDeal[] = [...urbanProfileDeals, ...urbanNearbyDeals].map(
  deal => ({
    id: deal.id,
    image: { uri: deal.imageUri },
    merchant: 'Urban Grill & Bistro',
    location: 'Apo, Abuja',
    title: deal.title,
    price: naira(deal.price),
    priceWas: naira(deal.originalPrice),
    save: deal.save || deal.discount,
    badge: deal.badge || deal.discount,
    distance: '0.8 km',
    description: deal.description,
    address: fallbackAddress,
    likes: 248,
    comments: 32,
  }),
);

const glowDeals: ResolvedDeal[] = glowProfileDeals.map(deal => ({
  id: deal.id,
  image: { uri: deal.imageUri },
  merchant: 'Glow & Serenity Spa',
  location: 'Maitama, Abuja',
  title: deal.title,
  price: naira(deal.price),
  priceWas: naira(deal.originalPrice),
  save: deal.save || deal.discount,
  badge: deal.badge || deal.discount,
  distance: '2.4 km',
  description: deal.description,
  address: 'Maitama Heights, Abuja',
  likes: 184,
  comments: 19,
}));

const featuredDiscoveryDeal: ResolvedDeal = {
  id: featuredDealOfDay.id,
  image: featuredDealOfDay.image,
  merchant: featuredDealOfDay.merchant.split(' • ')[0],
  location: featuredDealOfDay.merchant.split(' • ')[1] ?? 'Apo, Abuja',
  title: featuredDealOfDay.title,
  price: featuredDealOfDay.price,
  priceWas: featuredDealOfDay.priceWas,
  save: featuredDealOfDay.save,
  badge: '50% OFF',
  distance: featuredDealOfDay.distance,
  description: 'A curated local tasting experience with limited availability.',
  address: fallbackAddress,
  likes: featuredDealOfDay.likes,
  comments: featuredDealOfDay.comments,
};

const allDeals = [
  ...gridDeals,
  ...listDeals,
  ...homeDeals,
  ...urbanDeals,
  ...glowDeals,
  featuredDiscoveryDeal,
];

export function resolveDeal(dealId: string): ResolvedDeal {
  return allDeals.find(deal => deal.id === dealId) ?? gridDeals[0];
}
