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
  /** The logo. */
  imageUri: string;
  /** The uploaded banner, when the business has one. */
  coverUri?: string;
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
