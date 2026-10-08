import { featuredDeal } from '@features/home/data/homeFeed';
import { strings } from '@constants/strings';

export type DiscoverCategory =
  | 'All'
  | 'Food & Dining'
  | 'Beauty & Wellness'
  | 'Fashion & Apparel'
  | 'Electronics'
  | 'Fitness & Health'
  | 'Supermarkets'
  | 'Services';

export interface BusinessProfileSummary {
  id: string;
  name: string;
  category: string;
  categoryFilter: Exclude<DiscoverCategory, 'All'>;
  imageUri: string;
  imageAlt: string;
  rating: string;
  reviews: number;
  distance: string;
  location: string;
  activeDealLabel: string;
  status: {
    label: string;
    icon: 'verified' | 'featured' | 'exclusive';
  };
  /** 9-character code used to fetch the live profile via GET /public/businesses/code/:code */
  branchCode: string;
}

export const discoverCategories: readonly DiscoverCategory[] =
  strings.discoverFeed.categories;

export const businesses: readonly BusinessProfileSummary[] = [
  {
    id: 'urban-grill',
    name: strings.discoverFeed.businesses.urbanGrill.name,
    category: strings.discoverFeed.businesses.urbanGrill.category,
    categoryFilter: 'Food & Dining',
    imageUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCzyZN6TCyT9Y7SXehS0lBf6jPgb7r1FOxCfjStuBDzCIjbc5FTJ4PWgv0Smq0juGeyxCQ_arOnHXmm1rP5VR6kPv1xh2S5p8goKg_hhQIXk2QTJH9JM8ETDEvCIaj_aw9pNgwCRS-ErYvWQRlnGmj2brPLLGchrUJWaNRU75OdnHIkr7C5JOmq5yYYqwn1tFBLn8fs8Eio7PZ2vX6OD26P5a9Waow-JeBh3MvBJQzMX4YOSQJXnYXPHQ',
    imageAlt: strings.discoverFeed.businesses.urbanGrill.imageAlt,
    rating: strings.discoverFeed.businesses.urbanGrill.rating,
    reviews: strings.discoverFeed.businesses.urbanGrill.reviews,
    distance: strings.discoverFeed.businesses.urbanGrill.distance,
    location: strings.discoverFeed.businesses.urbanGrill.location,
    activeDealLabel: strings.discoverFeed.businesses.urbanGrill.deal,
    status: {
      label: strings.discoverFeed.statuses.verifiedPartner,
      icon: 'verified',
    },
    branchCode: 'URBANGRLL',
  },
  {
    id: 'glow-serenity',
    name: strings.discoverFeed.businesses.glowSerenity.name,
    category: strings.discoverFeed.businesses.glowSerenity.category,
    categoryFilter: 'Beauty & Wellness',
    imageUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD12KhKwa_t67ebHn03hDHeo3R_i4Yb9kW5hTx3TV6pPBPnZ6CSph1CTJSnAAkCkEywtN1QQYXCp4-bKYCG5eICRwkchdABl2RUE9D4Y7W6jOTduudJl2BZlHJO6q1btnZKbiKDLklZgIUpp3G99Jd9wFaBnPsHOeQcTCC7640bnnE8Rd8FYYeeNFs0YuKEQJFYYkT86WGsjnSIeh4qOD-tED-5E16KydNEcJv-5Hu--Y8IfZuoSbY_tg',
    imageAlt: strings.discoverFeed.businesses.glowSerenity.imageAlt,
    rating: strings.discoverFeed.businesses.glowSerenity.rating,
    reviews: strings.discoverFeed.businesses.glowSerenity.reviews,
    distance: strings.discoverFeed.businesses.glowSerenity.distance,
    location: strings.discoverFeed.businesses.glowSerenity.location,
    activeDealLabel: strings.discoverFeed.businesses.glowSerenity.deal,
    status: {
      label: strings.discoverFeed.statuses.featuredPartner,
      icon: 'featured',
    },
    branchCode: 'GLOWSERE',
  },
  {
    id: 'sole-district',
    name: strings.discoverFeed.businesses.soleDistrict.name,
    category: strings.discoverFeed.businesses.soleDistrict.category,
    categoryFilter: 'Fashion & Apparel',
    imageUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuADvM0qDZ-vAe-BHbjqtqO44dHzEtVILVk1JKpxEYkQC5ROQSEEyquW_U3cG6UhlfsBndz50c8E0WxVl6YOkdPBgsYjGHZchTQGYmKt_RJ80uS00R6YVAI22lXkrT6KkMs8terj9EmjPr6d58DC5ifsmVVclO5w14F0r_uPjZdy4o6oVDxD1tPbMd_VR6Wa29-Qjvf_KJMhaIoAtitEEEOcyiXqQUcLzYdTQQDWyFLQog84C5cd07aL5Q',
    imageAlt: strings.discoverFeed.businesses.soleDistrict.imageAlt,
    rating: strings.discoverFeed.businesses.soleDistrict.rating,
    reviews: strings.discoverFeed.businesses.soleDistrict.reviews,
    distance: strings.discoverFeed.businesses.soleDistrict.distance,
    location: strings.discoverFeed.businesses.soleDistrict.location,
    activeDealLabel: strings.discoverFeed.businesses.soleDistrict.deal,
    status: {
      label: strings.discoverFeed.statuses.vemtapExclusive,
      icon: 'exclusive',
    },
    branchCode: 'SOLEDIST',
  },
  {
    id: 'sky-lounge',
    name: strings.discoverFeed.businesses.skyLounge.name,
    category: strings.discoverFeed.businesses.skyLounge.category,
    categoryFilter: 'Food & Dining',
    imageUri: featuredDeal.image.uri,
    imageAlt: strings.discoverFeed.businesses.skyLounge.imageAlt,
    rating: strings.discoverFeed.businesses.skyLounge.rating,
    reviews: strings.discoverFeed.businesses.skyLounge.reviews,
    distance: strings.discoverFeed.businesses.skyLounge.distance,
    location: strings.discoverFeed.businesses.skyLounge.location,
    activeDealLabel: strings.discoverFeed.businesses.skyLounge.deal,
    status: {
      label: strings.discoverFeed.statuses.verifiedPartner,
      icon: 'verified',
    },
    branchCode: 'SKYLOUNG',
  },
  {
    id: 'cafe-neo',
    name: strings.discoverFeed.businesses.cafeNeo.name,
    category: strings.discoverFeed.businesses.cafeNeo.category,
    categoryFilter: 'Food & Dining',
    imageUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAKALWLmugB8h16Cj6547bTcbIywv9-7xo0SJoXd31xQkILkSfhfLw2-w2sUhPfZUbt3TQI4zhBXUbPM9jimmsMM0VEvWQXsUbpNGsIFKayrfEEJquYDQYMbBGdwTMsrrjKj05uVrJzHf_xMmAPSw5kzleQIlkhrZCJmlRKG3vwq8DQF3nHHTh4USSqa_i-de0RpihN_-HXiCZoKeeRshLhOXN7sYW7POMhPDcAz2ucfDrlkMu9foGgOg',
    imageAlt: strings.discoverFeed.businesses.cafeNeo.imageAlt,
    rating: strings.discoverFeed.businesses.cafeNeo.rating,
    reviews: strings.discoverFeed.businesses.cafeNeo.reviews,
    distance: strings.discoverFeed.businesses.cafeNeo.distance,
    location: strings.discoverFeed.businesses.cafeNeo.location,
    activeDealLabel: strings.discoverFeed.businesses.cafeNeo.deal,
    status: {
      label: strings.discoverFeed.statuses.verifiedPartner,
      icon: 'verified',
    },
    branchCode: 'CAFENEO',
  },
];
