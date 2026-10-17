import type { ImageSourcePropType } from 'react-native';

export type NearbyDeal = {
  id: string;
  image: { uri: string };
  badge: string;
  metaBadge?: { kind: 'schedule' | 'exclusive'; label: string };
  merchant: string;
  merchantShort: string;
  status: { kind: 'verified' | 'hot' | 'partner'; label: string };
  title: string;
  titleShort: string;
  price: string;
  priceWas: string;
  distance: string;
  distanceShort: string;
  likes: number;
  comments: number;
  liked?: boolean;
};

export type FeaturedDeal = {
  id: string;
  image: { uri: string };
  badge: string;
  endsLabel: string;
  merchant: string;
  status: { kind: 'verified'; label: string };
  title: string;
  price: string;
  priceWas: string;
  distance: string;
  likes: number;
  comments: number;
  liked?: boolean;
  /** Set when a live boost or campaign put this deal here. */
  campaignId?: string;
};

export type TrendingDeal = {
  id: string;
  image: { uri: string };
  badge: string;
  merchant: string;
  title: string;
  price: string;
  priceWas: string;
  distance: string;
  likes: number;
  comments: number;
  liked?: boolean;
};

export type NearbyBusiness = {
  id: string;
  image: ImageSourcePropType | { uri: string };
  name: string;
  category: string;
  distance: string;
  rating: string;
  ratingCount: string;
  meta: string;
};

export type PopularProduct = {
  id: string;
  image: { uri: string };
  badge?: { label: string; tone: 'discount' | 'hot' };
  merchant: string;
  title: string;
  price: string;
  priceWas?: string;
};
