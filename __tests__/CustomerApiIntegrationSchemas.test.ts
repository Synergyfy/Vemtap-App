import { myClaimsPageSchema } from '@api/claimApi';
import { savedPageSchema, savedRowSchema } from '@api/savedApi';
import {
  createDealReviewSchema,
  dealReviewDetailSchema,
  dealReviewsPageSchema,
  updateDealReviewSchema,
} from '@api/dealsApi';

/**
 * Schemas for the Phase 1 customer endpoints (`GET /me/claims`, the Saved Hub
 * and deal review CRUD). Shapes mirror the backend DTOs — notably the Saved
 * page envelope wrapping every row as `{ id, type, savedAt, item }`, and the
 * claim row's server-computed effective status.
 */

describe('myClaimsPageSchema', () => {
  const CLAIM = {
    id: 'claim-1',
    claimCode: 'VEM4-1YVXBYLZA-S2DT',
    status: 'ACTIVE',
    expiresAt: '2026-10-15T19:26:05.899Z',
    claimedAt: '2026-10-08T19:26:05.899Z',
    redeemedAt: null,
    offer: {
      id: 'offer-1',
      name: 'Apo Lunch Combo',
      mainImage: null,
      calculatedPrice: 8500,
      originalPrice: 10000,
      discountPercent: 15,
      pricingType: 'percentage_discount',
      discountValue: 15,
      businessId: 'business-1',
      businessName: 'Patrick Ventures',
      businessLogo: null,
      branchId: 'branch-1',
      branchName: 'Apo Branch',
      branchAddress: 'Apo Roundabout, Apo',
      endDate: '2026-11-07T18:33:30.087Z',
    },
  };

  test('parses the documented page payload', () => {
    const parsed = myClaimsPageSchema.safeParse({
      data: [CLAIM],
      total: 1,
      page: 1,
      limit: 10,
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.data[0].status).toBe('ACTIVE');
    expect(parsed.data.data[0].redeemedAt).toBeNull();
    expect(parsed.data.data[0].offer.businessName).toBe('Patrick Ventures');
  });

  test('accepts the empty state as a first-class answer', () => {
    const parsed = myClaimsPageSchema.safeParse({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    expect(parsed.success).toBe(true);
  });

  test('rejects an unknown effective status', () => {
    const parsed = myClaimsPageSchema.safeParse({
      data: [{ ...CLAIM, status: 'PENDING' }],
      total: 1,
    });

    expect(parsed.success).toBe(false);
  });
});

describe('savedPageSchema', () => {
  const DEAL_ROW = {
    id: 'save-1',
    type: 'DEAL',
    savedAt: '2026-10-08T10:00:00.000Z',
    item: {
      offerId: 'offer-1',
      name: 'Burger + Wings Combo',
      mainImage: null,
      businessName: 'Patrick Ventures',
      businessLogo: null,
      branchName: 'Main Branch',
      branchAddress: null,
      calculatedPrice: 11600,
      originalPrice: 14500,
      discountPercent: 20,
      endDate: null,
      isExpired: false,
    },
  };

  const BUSINESS_ROW = {
    id: 'save-2',
    type: 'BUSINESS',
    savedAt: '2026-10-08T09:00:00.000Z',
    item: {
      id: 'business-1',
      name: 'Glow & Serenity Spa',
      logoUrl: null,
      categoryName: 'Wellness & Spa',
      address: null,
      city: 'Abuja',
      isVerified: true,
      slug: 'QFN2OX8BJ',
      branchCode: null,
    },
  };

  const SERVICE_ROW = {
    id: 'save-3',
    type: 'SERVICE',
    savedAt: '2026-10-08T08:00:00.000Z',
    item: {
      id: 'service-1',
      name: 'Deep Hydration Facial',
      mainImage: null,
      price: 16000,
      priceType: 'fixed',
      priceRangeMin: null,
      priceRangeMax: null,
      duration: '90 min',
      businessId: 'business-1',
      businessName: 'Glow & Serenity Spa',
      branchId: null,
      branchName: null,
      isBookable: true,
    },
  };

  test('wraps every store in the same page envelope', () => {
    const parsed = savedPageSchema.safeParse({
      data: [DEAL_ROW, BUSINESS_ROW, SERVICE_ROW],
      total: 3,
      page: 1,
      limit: 10,
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.data.map(row => row.type)).toEqual([
      'DEAL',
      'BUSINESS',
      'SERVICE',
    ]);
  });

  test('discriminates the item payload by type', () => {
    const deal = savedRowSchema.parse(DEAL_ROW);
    const business = savedRowSchema.parse(BUSINESS_ROW);

    if (deal.type === 'DEAL') {
      // A BUSINESS-only field must not leak onto a DEAL item.
      expect('logoUrl' in deal.item).toBe(false);
      expect(deal.item.offerId).toBe('offer-1');
    }
    if (business.type === 'BUSINESS') {
      // The Saved Hub links profiles with this code field.
      expect(business.item.slug).toBe('QFN2OX8BJ');
    }
  });

  test('rejects an unknown saved type', () => {
    const parsed = savedPageSchema.safeParse({
      data: [{ ...DEAL_ROW, type: 'COLLECTION' }],
      total: 1,
    });

    expect(parsed.success).toBe(false);
  });
});

describe('deal review schemas', () => {
  test('parses the list envelope, which omits `limit`', () => {
    const parsed = dealReviewsPageSchema.safeParse({
      reviews: [
        {
          id: 'review-1',
          reviewerName: 'Chidi O.',
          comment: 'Great deal!',
          rating: 5,
          likesCount: 3,
          createdAt: '2026-10-08T10:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.reviews[0].rating).toBe(5);
  });

  test('parses detail with the author flag', () => {
    const parsed = dealReviewDetailSchema.safeParse({
      id: 'review-1',
      offerId: 'offer-1',
      reviewerName: 'Chidi O.',
      comment: 'Great deal!',
      rating: null,
      likesCount: 0,
      status: 'approved',
      isAuthor: true,
      createdAt: '2026-10-08T10:00:00.000Z',
      updatedAt: '2026-10-08T10:00:00.000Z',
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.isAuthor).toBe(true);
    expect(parsed.data.rating).toBeNull();
  });

  test('bounds the create rating to 1–5 and requires a comment', () => {
    expect(createDealReviewSchema.safeParse({ comment: 'Nice', rating: 5 }).success).toBe(
      true,
    );
    expect(createDealReviewSchema.safeParse({ comment: 'Nice', rating: 6 }).success).toBe(
      false,
    );
    expect(createDealReviewSchema.safeParse({ rating: 4 }).success).toBe(false);
  });

  test('rejects an out-of-range patch rating', () => {
    expect(updateDealReviewSchema.safeParse({ rating: 3 }).success).toBe(true);
    expect(updateDealReviewSchema.safeParse({ rating: 0 }).success).toBe(false);
  });
});
