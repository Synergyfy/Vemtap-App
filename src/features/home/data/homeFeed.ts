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

const imgAvatar =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCg_httfgNB7CfMJOzfjKekJGnxgvueamRqqNg-Qyw7QV2HTVvlh6rZ845BYSp5dsQClaPlSKNd4B0_3aYGUcjlu-OUBeq56PilIeD6B9e1a0GFgvTtnkB0d8i16nw-kagt5rZUqAHNUNQUsH0WcGsyf8zaqNe1yx2Go9tQcdI6QPEzXRp2aZLqYGswotDnV391PXTZI3oVx9jzWC_ZogeqCUxsw3wWsr-xRkh4q33Ljntdo0P9MsadSA';
const imgSteak =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBjiY_iENnE0_gULcgR0NDCqk6Kq3rgCPj9DF359T-LyeFJWB7z4VMHdARNHQeTTxaT4MiH_xMPLODviqw6_g4l50CwXnKwBrq6CQIuKBPTJ5PaasBnvsfniUvz2Oy9Vn5eguCjJ_CuTMKeUodWVLfHa5QV5UaTWJOtOFkXuzN4cYIDGKMq-sweeOEBfus9N8WLC_OkWiUkIw3S5qhnVtMq670laaL_UzGfesQ-k5inJfjattlJVEofGA';
const imgSneaker =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD0uBBlT-uAfF0xrF1R99Fygm4HWKLPrmL3WWpZt71dQGS3NkBlOQ4kU1osW9GuFYORifIsd4FKPUSG5g0t3TLX3YCVkdzeSvXt8QGqexEQ1P-sIUWyEygPSrdpBw8m264KPQ8HPkV4WdVLSEFg85dV-lo5N986QTpH7FkxewwUwqnLessEGS_HR1U8_BQumYABPPSiKY4F_J8kKkA5DPYDJSiPWrecAlMg5bja0jfXHc29cF55C8j7AQ';
const imgSpa =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuApSo_d-6tUpRdyPfedGt9FAOlIdJc5ZDlE8rU2ZXsK3L_Ngq-PkICWqvfgL4jRE5FKwg9eHcpFiQ6YSnP-Umn_itGHcmoD9cZnzcCU1GNk7vtchytPdKH2G5zC-nNqqtPDmUtp7UTnSn_qFQ5nlenJBVonmFpDAwZcJarDcov4sO9lX4TmZJexfLK08XOnsNsho-AhfccOs9h7pJEtq2JaTsp6Z0SEs_DgoMwbM3PQoV6Yqk-9EcDuEQ';
const imgCoffee =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDhaveynjDuWtPu2JE7hXGvL4JUNYbbcSzUA_e17tE-fQ2ekG5_Bmpiq2FT5U99sDs4VVEYLgM9SedUAzXAR8xYGa2WmPIAVHHLHm5fWEAbFTRgkq4ECuGkRFZXPaj6susJy4hs1U_ga0O2fsnB6yIbLLXil_gLH47nnCpUvo7xTQfoLwPb2A56609PWjT7OTe4zOBInx0APBPGBDi49B3GWJHlIBCLXKmVZGsOCyGIC5X6_O31zQUZxw';
const imgEarbuds =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDsBRsob4EKwYByIQTuO6GU90ExWU8JCcctC-NI5iY3aL0_BBtl9xAuKFqqx4v7_XxO_okOz69Jm9Y2b95TR_r2yodhXvfvk3pm_iFVHJKv-iik8hEiWqN_y3Z9zGkpv-hJyXEQd7jWXrLYRnt0stkgx3WqeJF-EeIEbjGImZRDsRud1qdg_XSuY7GkTbDbYqr1G65ZgIIcXELZeFyOdb8nEw1xYeif19napJIH41m_t_YoWgG7xqaGGQ';
const imgBakery =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD1UnrRr6q7a_AFGUGaAzW7CxKa41ij-Dq7MSs6zrQOpdQ5byQvCedfk3LlXgxH4Dq1MlVnO4uBwcOTdXi97p32hcfnUPXlWW5g5UArur823YpM65b3neu5AJYhI1twGBIdh52pf5f9tQU5eKO_pZp2gwExAUGUfJ2R-tc77Rb4-SVHoacLVV0qMV1ub-0y8BJngW0H9AlpNkZ0Vxg_tVCdBdetLO8xZcVX5sNDW5Js16tO7lFbjSBQRA';
const imgGym =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBS9qJx2iVnmOvBVSdJUkx05ADwwb0MEKqrAT3WknZ81uF45n0AkMGAyvUfU4odSg8M7y4DXAvpHyQjEbOV0E7_MciEkE_bINj9qpiKbs4HNXWnAV9ffNRiIwSby0bMugn3_MhbOtYuY6w8wXqNcqC3OUqqsnuBPt2CKKsp7uEADyY-U2V0-ewWXR9BljHEu9ikkCtvDQRXadzl30xIkirEgxpd7NnGIC8gbxDyWOlQQCA7jTZJcU9daA';
const imgAtelier =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDwovKiEqsZikbIErXm_GIvn-5jIcj2O7_9XZeGCpI2q8vqe8fs3YH7RDViht3YQCVx8T_DI5T7Wk3Gpaov0fpXwKFxBQZBSfmWzi5xdJJi56seuVYTlueaC1q2Y2d9C5oGwYeJXvT2qO-UORd5dyKqH7El7RATjmLYqFOCL_-ewQnng3vHYqTa1rtrSW6m7D50oR6kr-KojQBFdG95UkpElNnXIRoiGAfo_hIf2CKXS7yUdoapisAitQ';
const imgColdBrew =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAlu--zdTIFndoE_re3e7d2ZWRT66DCUwWSFuJ_o8tTQxAb-n4vobtrAVj0tyo4lLPedtoxx3qS4vmvz3MoB2zsrcJt2r7XjjvW1Mzru9aaFm58dRac7fc_d_jJMIA-Hx5RlFed4TJNLfUIa1skDV2Cbrw8XHr7kGIaA4VSxbk39Z6TP2toIFsK6OzNPVSdR90_BJVYtz6xG_ECuBhxw9Xmqix6DishY1dkDV84M8iyKggHLOkw_25KZg';
const imgTote =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCl3DhxgtDFpU09y36kgIuvcv9jP98sFWO7v-7_DaTXaxzwZZu_4cAfj7zUCRbxqFHM7KWpgEnAraIT6NzaaMDeKwfmPJSixIOSUvCZYLK429TEailKfOgc0aN8yMPRSXkNU2eUaJCftiXfH2HuBgPQ1wyQG8FSLa5D9wXOhl7nsMiSWRlUVUEj0VOPm3_NhgKN2ORlYHY8rKI64KH0hc8OIuTxUF-_SZxjJ8DRDSMedAJGRhSChFmGxA';

export const homeAvatar = { uri: imgAvatar };

export const featuredDeal: FeaturedDeal = {
  id: 'featured-sky-lounge',
  image: { uri: imgSteak },
  badge: '50% OFF',
  endsLabel: 'Ends Tonight',
  merchant: 'The Sky Lounge & Grill • Maitama',
  status: { kind: 'verified', label: 'Partner' },
  title: "50% Off Chef's 5-Course Tasting Menu",
  price: '₦24,500',
  priceWas: '₦49,000',
  distance: '2.4 km away • Maitama Heights',
  likes: 620,
  comments: 76,
};

export const nearbyDeals: NearbyDeal[] = [
  {
    id: 'urban-grill',
    image: { uri: imgSteak },
    badge: '20% OFF',
    metaBadge: { kind: 'schedule', label: 'Expires in 4h' },
    merchant: 'Urban Grill & Bistro • Apo District',
    merchantShort: 'Urban Grill',
    status: { kind: 'verified', label: 'Verified' },
    title: '20% Off Prime Lunch Combo',
    titleShort: 'Prime Lunch Combo',
    price: '₦9,600',
    priceWas: '₦12,000',
    distance: '0.8 km away • Apo Boulevard',
    distanceShort: '0.8 km',
    likes: 248,
    comments: 32,
  },
  {
    id: 'sole-district',
    image: { uri: imgSneaker },
    badge: '30% OFF',
    metaBadge: { kind: 'exclusive', label: 'Exclusive' },
    merchant: 'Sole District Boutique • Garki Area',
    merchantShort: 'Sole District',
    status: { kind: 'hot', label: 'Hot' },
    title: 'Weekend Sneaker Drop & Apparel',
    titleShort: 'Sneaker Drop & Tees',
    price: '₦28,000',
    priceWas: '₦40,000',
    distance: '1.2 km away • Area 11 Commercial Arcade',
    distanceShort: '1.2 km',
    likes: 412,
    comments: 58,
  },
  {
    id: 'cafe-neo',
    image: { uri: imgCoffee },
    badge: 'BOGO',
    merchant: 'Cafe Neo • Central Area',
    merchantShort: 'Cafe Neo',
    status: { kind: 'verified', label: 'Verified' },
    title: 'Buy 1 Get 1 Latte',
    titleShort: 'Buy 1 Get 1 Latte',
    price: '₦3,200',
    priceWas: '₦6,400',
    distance: '600m away • Wuse Market',
    distanceShort: '600m',
    likes: 320,
    comments: 44,
  },
  {
    id: 'glow-spa',
    image: { uri: imgSpa },
    badge: '25% OFF',
    merchant: 'Glow & Serenity Spa • Maitama',
    merchantShort: 'Glow Spa',
    status: { kind: 'verified', label: 'Verified' },
    title: 'Weekend Facial & Sauna Pass',
    titleShort: 'Facial & Sauna Pass',
    price: '₦18,500',
    priceWas: '₦25,000',
    distance: '1.4 km away • Maitama Courts',
    distanceShort: '1.4 km',
    likes: 184,
    comments: 19,
  },
];

export const trendingDeals: TrendingDeal[] = [
  {
    id: 'trending-spa',
    image: { uri: imgSpa },
    badge: '25% OFF',
    merchant: 'Glow & Serenity Spa',
    title: 'Weekend Glow Facial & Sauna',
    price: '₦18,500',
    priceWas: '₦25,000',
    distance: '1.4 km away',
    likes: 184,
    comments: 19,
  },
  {
    id: 'trending-coffee',
    image: { uri: imgCoffee },
    badge: '50% OFF',
    merchant: 'Cafe Neo Artisan',
    title: 'Buy 1 Get 1 Free Roast Coffee',
    price: '₦3,200',
    priceWas: '₦6,400',
    distance: '600m away',
    likes: 320,
    comments: 44,
  },
  {
    id: 'trending-buds',
    image: { uri: imgEarbuds },
    badge: '37% OFF',
    merchant: 'Gadget Hub Abuja',
    title: 'Wireless Noise-Canceling Buds',
    price: '₦22,000',
    priceWas: '₦35,000',
    distance: '2.1 km away',
    likes: 95,
    comments: 12,
  },
];

export const nearbyBusinesses: NearbyBusiness[] = [
  {
    id: 'bakery',
    image: { uri: imgBakery },
    name: 'Artisan Bakery & Cafe',
    category: 'Bakery & Cafe',
    distance: '0.5 km away',
    rating: '4.9',
    ratingCount: '(128)',
    meta: '4 Active Deals',
  },
  {
    id: 'pulse',
    image: { uri: imgGym },
    name: 'Pulse Fitness & Wellness',
    category: 'Health & Gym',
    distance: '1.1 km away',
    rating: '4.8',
    ratingCount: '(94)',
    meta: '2 Active Deals',
  },
  {
    id: 'velvet',
    image: { uri: imgAtelier },
    name: 'Velvet Stitch Couture',
    category: 'Tailoring & Fashion',
    distance: '1.8 km away',
    rating: '5.0',
    ratingCount: '(62)',
    meta: 'Special Offers',
  },
];

export const popularProducts: PopularProduct[] = [
  {
    id: 'cold-brew',
    image: { uri: imgColdBrew },
    badge: { label: '15% voucher', tone: 'discount' },
    merchant: 'Cafe Neo',
    title: 'Cold Brew (1L)',
    price: '₦4,500',
  },
  {
    id: 'tote',
    image: { uri: imgTote },
    badge: { label: 'Hot Deal', tone: 'hot' },
    merchant: 'Sole District',
    title: 'Leather Tote Bag',
    price: '₦34,000',
    priceWas: '₦45,000',
  },
];
