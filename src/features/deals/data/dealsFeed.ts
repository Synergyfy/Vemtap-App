import type { IconName } from '@components/ui/Icon';

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

const imgSteak =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBjiY_iENnE0_gULcgR0NDCqk6Kq3rgCPj9DF359T-LyeFJWB7z4VMHdARNHQeTTxaT4MiH_xMPLODviqw6_g4l50CwXnKwBrq6CQIuKBPTJ5PaasBnvsfniUvz2Oy9Vn5eguCjJ_CuTMKeUodWVLfHa5QV5UaTWJOtOFkXuzN4cYIDGKMq-sweeOEBfus9N8WLC_OkWiUkIw3S5qhnVtMq670laaL_UzGfesQ-k5inJfjattlJVEofGA';
const imgSneaker =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD0uBBlT-uAfF0xrF1R99Fygm4HWKLPrmL3WWpZt71dQGS3NkBlOQ4kU1osW9GuFYORifIsd4FKPUSG5g0t3TLX3YCVkdzeSvXt8QGqexEQ1P-sIUWyEygPSrdpBw8m264KPQ8HPkV4WdVLSEFg85dV-lo5N986QTpH7FkxewwUwqnLessEGS_HR1U8_BQumYABPPSiKY4F_J8kKkA5DPYDJSiPWrecAlMg5bja0jfXHc29cF55C8j7AQ';
const imgSpa =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuApSo_d-6tUpRdyPfedGt9FAOlIdJc5ZDlE8rU2ZXsK3L_Ngq-PkICWqvfgL4jRE5FKwg9eHcpFiQ6YSnP-Umn_itGHcmoD9cZnzcCU1GNk7vtchytPdKH2G5zC-nNqqtPDmUtp7UTnSn_qFQ5nlenJBVonmFpDAwZcJarDcov4sO9lX4TmZJexfLK08XOnsNsho-AhfccOs9h7pJEtq2JaTsp6Z0SEs_DgoMwbM3PQoV6Yqk-9EcDuEQ';
const imgColdBrew =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAlu--zdTIFndoE_re3e7d2ZWRT66DCUwWSFuJ_o8tTQxAb-n4vobtrAVj0tyo4lLPedtoxx3qS4vmvz3MoB2zsrcJt2r7XjjvW1Mzru9aaFm58dRac7fc_d_jJMIA-Hx5RlFed4TJNLfUIa1skDV2Cbrw8XHr7kGIaA4VSxbk39Z6TP2toIFsK6OzNPVSdR90_BJVYtz6xG_ECuBhxw9Xmqix6DishY1dkDV84M8iyKggHLOkw_25KZg';
const imgAtelier =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDwovKiEqsZikbIErXm_GIvn-5jIcj2O7_9XZeGCpI2q8vqe8fs3YH7RDViht3YQCVx8T_DI5T7Wk3Gpaov0fpXwKFxBQZBSfmWzi5xdJJi56seuVYTlueaC1q2Y2d9C5oGwYeJXvT2qO-UORd5dyKqH7El7RATjmLYqFOCL_-ewQnng3vHYqTa1rtrSW6m7D50oR6kr-KojQBFdG95UkpElNnXIRoiGAfo_hIf2CKXS7yUdoapisAitQ';
const imgGym =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBS9qJx2iVnmOvBVSdJUkx05ADwwb0MEKqrAT3WknZ81uF45n0AkMGAyvUfU4odSg8M7y4DXAvpHyQjEbOV0E7_MciEkE_bINj9qpiKbs4HNXWnAV9ffNRiIwSby0bMugn3_MhbOtYuY6w8wXqNcqC3OUqqsnuBPt2CKKsp7uEADyY-U2V0-ewWXR9BljHEu9ikkCtvDQRXadzl30xIkirEgxpd7NnGIC8gbxDyWOlQQCA7jTZJcU9daA';

/** Copy + layout from vemtap_deals_discovery_grid_view_* code.html — fictional only. */
export const featuredDealOfDay: FeaturedDealOfDay = {
  id: 'featured-sunset-tasting',
  image: { uri: imgSteak },
  topPick: 'Top Pick',
  specialPromo: 'Special Promo',
  endsLabel: 'Ends in 8h',
  merchant: 'The Sky Lounge & Grill • Apo Legacy Tower',
  distance: '1.1 km',
  title: "Chef's 5-Course Sunset Tasting Menu & Wine Pairing",
  price: '₦22,500',
  priceWas: '₦45,000',
  save: 'Save ₦22,500',
  stockLabel: 'Limited to 30 vouchers',
  likes: 148,
  comments: 32,
  claimLabel: 'Claim Deal',
};

export const dealsGrid: DealGridItem[] = [
  {
    id: 'urban-grill-lunch',
    image: { uri: imgSteak },
    leftBadge: { label: '20% OFF', tone: 'discount' },
    rightBadge: { kind: 'timer', label: '4h' },
    merchant: 'Urban Grill • Apo',
    statusIcon: 'verified',
    title: 'Prime 3-Course Lunch Combo & Drinks',
    price: '₦9,600',
    priceWas: '₦12,000',
    save: 'Save ₦2,400',
    distance: '0.8 km',
    claimLabel: 'Claim',
  },
  {
    id: 'sole-district-streetwear',
    image: { uri: imgSneaker },
    leftBadge: { label: '30% OFF', tone: 'discount' },
    rightBadge: { kind: 'text', label: 'Hot', tone: 'primary' },
    merchant: 'Sole District Boutique',
    statusIcon: 'hot',
    title: 'Weekend Streetwear Drop & Sneakers',
    price: '₦28,000',
    priceWas: '₦40,000',
    save: 'Save ₦12,000',
    distance: '1.2 km',
    claimLabel: 'Claim',
  },
  {
    id: 'glow-spa-weekend',
    image: { uri: imgSpa },
    leftBadge: { label: '25% OFF', tone: 'discount' },
    rightBadge: { kind: 'text', label: 'Popular', tone: 'primary' },
    merchant: 'Glow & Serenity Spa',
    statusIcon: 'none',
    title: 'Weekend Glow Facial & Massage',
    price: '₦18,500',
    priceWas: '₦25,000',
    save: 'Save ₦6,500',
    distance: '2.4 km',
    claimLabel: 'Claim',
  },
  {
    id: 'cafe-neo-cold-brew',
    image: { uri: imgColdBrew },
    leftBadge: { label: 'BOGO Free', tone: 'promo' },
    rightBadge: { kind: 'text', label: '15% OFF', tone: 'primary' },
    merchant: 'Cafe Neo Artisanal',
    statusIcon: 'none',
    title: 'Cold Brew 1L & Pastry Box',
    price: '₦4,500',
    priceWas: '₦6,000',
    save: 'Save ₦1,500',
    distance: '3.1 km',
    claimLabel: 'Claim',
  },
  {
    id: 'velvet-stitch-tailoring',
    image: { uri: imgAtelier },
    leftBadge: { label: '35% OFF', tone: 'discount' },
    rightBadge: { kind: 'text', label: 'Featured', tone: 'primary' },
    merchant: 'Velvet Stitch Couture',
    statusIcon: 'verified',
    title: 'Bespoke Tailoring & Custom Fitting',
    price: '₦32,000',
    priceWas: '₦49,000',
    save: 'Save ₦17,000',
    distance: '1.8 km',
    claimLabel: 'Claim',
  },
  {
    id: 'pulse-fitness-pass',
    image: { uri: imgGym },
    leftBadge: { label: '40% OFF', tone: 'discount' },
    rightBadge: { kind: 'text', label: 'Limited', tone: 'dark', icon: 'bolt' },
    merchant: 'Pulse Fitness & Gym',
    statusIcon: 'verified',
    title: 'Monthly Pass + Personal Trainer',
    price: '₦15,000',
    priceWas: '₦25,000',
    save: 'Save ₦10,000',
    distance: '1.5 km',
    claimLabel: 'Claim',
  },
];

/** List-mode feed from vemtap_deals_discovery_unfiltered_featured/code.html. */
export const dealsList: DealListItem[] = [
  {
    id: 'list-urban-grill-lunch',
    image: { uri: imgSteak },
    leftBadge: { label: '20% OFF', tone: 'discount' },
    rightBadge: { kind: 'timer', label: 'Ends in 4h' },
    merchant: 'Urban Grill & Bistro • Apo Boulevard',
    statusIcon: 'verified',
    title: 'Prime 3-Course Lunch Combo & Drinks',
    price: '₦9,600',
    priceWas: '₦12,000',
    save: 'Save ₦2,400',
    location: '0.8 km away • Apo District',
    meta: 'Expires today 6:00 PM',
    metaTone: 'tertiary',
    likes: 248,
    comments: 32,
    claimLabel: 'Claim Deal',
  },
  {
    id: 'list-sole-district-streetwear',
    image: { uri: imgSneaker },
    leftBadge: { label: '30% OFF', tone: 'discount' },
    rightBadge: { kind: 'text', label: 'Exclusive Deal', tone: 'primary' },
    merchant: 'Sole District Boutique • Area 11 Arcade',
    statusIcon: 'hot',
    title: 'Weekend Streetwear Drop & Sneaker Special',
    price: '₦28,000',
    priceWas: '₦40,000',
    save: 'Save ₦12,000',
    location: '1.2 km away • Garki',
    meta: 'Valid until Sunday',
    metaTone: 'secondary',
    likes: 412,
    comments: 58,
    claimLabel: 'Claim Deal',
  },
  {
    id: 'list-glow-spa-weekend',
    image: { uri: imgSpa },
    leftBadge: { label: '25% OFF', tone: 'discount' },
    rightBadge: { kind: 'text', label: 'Popular', tone: 'muted' },
    merchant: 'Glow & Serenity Spa • Maitama Heights',
    statusIcon: 'none',
    title: 'Full Weekend Glow Facial, Sauna & Massage',
    price: '₦18,500',
    priceWas: '₦25,000',
    save: 'Save ₦6,500',
    location: '2.4 km away • Maitama',
    meta: 'Appointment needed',
    metaTone: 'secondary',
    likes: 184,
    comments: 19,
    claimLabel: 'Claim Deal',
  },
  {
    id: 'list-cafe-neo-cold-brew',
    image: { uri: imgColdBrew },
    leftBadge: { label: 'Buy 1 Get 1 Free', tone: 'promo' },
    rightBadge: { kind: 'text', label: '15% OFF', tone: 'discount' },
    merchant: 'Cafe Neo Artisanal • Wuse II',
    statusIcon: 'none',
    title: 'Signature Cold Brew 1L & Pastry Box',
    price: '₦4,500',
    priceWas: '₦6,000',
    save: 'Save ₦1,500',
    location: '3.1 km away • Wuse II',
    meta: 'Walk-in welcome',
    metaTone: 'secondary',
    likes: 97,
    comments: 14,
    claimLabel: 'Claim Deal',
  },
];

export const dealsFilterCategories: {
  label: string;
  icon: IconName;
}[] = [
  { label: 'Food & Drinks', icon: 'restaurant' },
  { label: 'Beauty & Spa', icon: 'spa' },
  { label: 'Fashion & Apparel', icon: 'fashion' },
  { label: 'Electronics & Gadgets', icon: 'devices' },
  { label: 'Health & Fitness', icon: 'fitness' },
  { label: 'Groceries & Supermarket', icon: 'groceries' },
  { label: 'Home & Living', icon: 'homeLiving' },
  { label: 'Automotive & Services', icon: 'automotive' },
];
