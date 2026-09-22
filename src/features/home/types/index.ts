export type Deal = {
  id: string;
  title: string;
  discountPercent: number;
  distanceMeters: number;
  businessName: string;
};

export type DealStatus = 'available' | 'claimed' | 'expired';
