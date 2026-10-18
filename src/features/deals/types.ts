export type DealGridRightBadge =
  | { kind: 'timer'; label: string }
  | { kind: 'text'; label: string; tone: 'primary' | 'dark'; icon?: 'bolt' };

export type DealGridItem = {
  id: string;
  image: { uri: string };
  leftBadge: { label: string; tone: 'discount' | 'promo' };
  rightBadge: DealGridRightBadge;
  merchant: string;
  statusIcon: 'verified' | 'hot' | 'none';
  title: string;
  price: string;
  priceWas: string;
  save: string;
  distance: string;
  claimLabel: string;
};

export type DealListRightBadge =
  | { kind: 'timer'; label: string }
  | { kind: 'text'; label: string; tone: 'primary' | 'muted' | 'discount' };

export type DealListItem = {
  id: string;
  image: { uri: string };
  leftBadge: { label: string; tone: 'discount' | 'promo' };
  rightBadge: DealListRightBadge;
  merchant: string;
  statusIcon: 'verified' | 'hot' | 'none';
  title: string;
  price: string;
  priceWas: string;
  save: string;
  location: string;
  meta: string;
  metaTone: 'tertiary' | 'secondary';
  likes: number;
  comments: number;
  claimLabel: string;
};

export type FeaturedDealOfDay = {
  id: string;
  image: { uri: string };
  topPick: string;
  specialPromo: string;
  endsLabel: string;
  merchant: string;
  distance: string;
  title: string;
  price: string;
  priceWas: string;
  save: string;
  stockLabel: string;
  likes: number;
  comments: number;
  claimLabel: string;
};
