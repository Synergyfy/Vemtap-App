import { strings } from '@constants/strings';
import type { BusinessOfferAdmin } from '@api/catalogueApi';
import {
  businessOffersAdminSchema,
  dealGroupStatsSchema,
  dealLedgerPageSchema,
  offersSummarySchema,
  updateCatalogueOfferInputSchema,
} from '@api/catalogueApi';
import {
  dealDraftToReview,
  dealDiscountLabel,
  dealStatusLine,
  dealTabFor,
  offerToCentralDealRow,
  toDealPerformanceView,
} from '@features/business/utils/dealPresentation';
import {
  dealDraftToCreateInput,
  dealDraftToUpdateInput,
  offerRowToDealDraft,
} from '@features/business/utils/catalogueDraftMappers';

/**
 * Deals & Promotions: the tab a deal files under, the labels its card and
 * detail show, and the edit round-trip. Pure functions, so the list, its tab
 * counts and the detail screen cannot disagree.
 */

const NOW = new Date('2026-10-15T12:00:00Z');
// Real ids are UUIDs; the update schema validates them.
const ITEM_1 = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
const ITEM_2 = '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed';

const deal = (overrides: Partial<BusinessOfferAdmin> = {}): BusinessOfferAdmin => ({
  id: 'offer-1',
  dealGroupId: 'group-1',
  name: 'Lunch Combo',
  description: 'Rice and chicken',
  status: 'active',
  branchId: 'branch-1',
  pricingType: 'percentage_discount',
  discountValue: 20,
  fixedPrice: null,
  calculatedPrice: 8000,
  originalPrice: 10000,
  quantity: 40,
  claimedCount: 10,
  redeemedCount: 4,
  itemIds: [ITEM_1, ITEM_2],
  items: [
    { id: ITEM_1, name: 'Jollof Bowl', price: 6000, mainImage: 'jollof.jpg' },
    { id: ITEM_2, name: 'Zobo', price: 4000, mainImage: null },
  ],
  branches: [
    {
      offerId: 'offer-1',
      branchId: 'branch-1',
      branchName: 'Wuse',
      status: 'active',
      calculatedPrice: 8000,
      quantity: 20,
      claimedCount: 6,
      redeemedCount: 3,
    },
    {
      offerId: 'offer-2',
      branchId: 'branch-2',
      branchName: 'Garki',
      status: 'active',
      calculatedPrice: 8500,
      quantity: 20,
      claimedCount: 4,
      redeemedCount: 1,
    },
  ],
  terms: ['Dine-in only', 'Show the voucher'],
  claimSteps: ['Show the voucher'],
  maxClaimsPerCustomer: 1,
  allowGifting: true,
  startDate: '2026-10-01T00:00:00.000Z',
  endDate: '2026-10-21T00:00:00.000Z',
  ...overrides,
});

describe('dealTabFor', () => {
  it('files live, upcoming, ended and paused deals', () => {
    expect(dealTabFor(deal(), NOW)).toBe('active');
    expect(dealTabFor(deal({ startDate: '2026-10-20T00:00:00Z' }), NOW)).toBe(
      'scheduled',
    );
    expect(dealTabFor(deal({ endDate: '2026-10-10T00:00:00Z' }), NOW)).toBe('expired');
    expect(dealTabFor(deal({ status: 'inactive' }), NOW)).toBe('drafts');
  });

  it('files a paused deal past its end date as ended, not a draft', () => {
    expect(
      dealTabFor(deal({ status: 'inactive', endDate: '2026-10-01T00:00:00Z' }), NOW),
    ).toBe('expired');
  });

  it('treats a deal with no dates as running', () => {
    expect(dealTabFor(deal({ startDate: null, endDate: null }), NOW)).toBe('active');
  });
});

describe('deal labels', () => {
  it('words the status line for each state', () => {
    expect(dealStatusLine(deal(), NOW)).toBe('Ends in 6 days');
    expect(dealStatusLine(deal({ endDate: '2026-10-15T20:00:00Z' }), NOW)).toBe(
      'Ends in 1 day',
    );
    expect(dealStatusLine(deal({ endDate: null }), NOW)).toBe('Runs until paused');
    expect(dealStatusLine(deal({ status: 'inactive' }), NOW)).toBe('Paused');
  });

  it('labels each pricing type', () => {
    expect(dealDiscountLabel(deal())).toBe('20% OFF');
    expect(
      dealDiscountLabel(
        deal({ pricingType: 'fixed_discount_amount', discountValue: 1500 }),
      ),
    ).toBe('₦1,500 OFF');
    expect(
      dealDiscountLabel(deal({ pricingType: 'fixed_discount_price', fixedPrice: 5000 })),
    ).toBe('₦5,000');
    expect(dealDiscountLabel(deal({ pricingType: 'sum' }))).toBe('Bundle');
  });
});

describe('offerToCentralDealRow', () => {
  it('maps a grouped deal onto its card', () => {
    const row = offerToCentralDealRow(deal(), NOW);
    expect(row).toMatchObject({
      dealGroupId: 'group-1',
      title: 'Lunch Combo',
      subtitle: 'Jollof Bowl, Zobo',
      price: '₦8,000',
      wasPrice: '₦10,000',
      branches: 'Wuse, Garki',
      status: 'Ends in 6 days',
      tab: 'active',
      isPaused: false,
      meterLabel: '10 claimed · 4 redeemed',
      meterValue: '10/40',
      percent: 25,
      image: { uri: 'jollof.jpg', alt: 'Lunch Combo' },
    });
  });

  it('shows no struck price when there is no saving, and offers Resume when paused', () => {
    const row = offerToCentralDealRow(
      deal({ originalPrice: 8000, status: 'inactive' }),
      NOW,
    );
    expect(row.wasPrice).toBe('');
    expect(row.isPaused).toBe(true);
    expect(row.tab).toBe('drafts');
  });
});

describe('toDealPerformanceView', () => {
  it('combines the deal row with its stats', () => {
    const stats = dealGroupStatsSchema.parse({
      name: 'Lunch Combo',
      status: 'active',
      views: 120,
      claims: 10,
      redeemed: 4,
      activeUnclaimed: 5,
      redemptionRate: 0.4,
      revenue: '32000.00',
      daysLeft: 6,
      remaining: 30,
      byBranch: [
        {
          offerId: 'offer-1',
          branchId: 'branch-1',
          branchName: 'Wuse',
          status: 'active',
          claims: 6,
          redeemed: 3,
          revenue: 24000,
        },
        {
          offerId: 'offer-2',
          branchId: 'branch-2',
          branchName: 'Garki',
          status: 'inactive',
          claims: 4,
          redeemed: 1,
          revenue: 8500,
        },
      ],
    });
    const view = toDealPerformanceView(deal(), stats, NOW);

    expect(view.pricing.map(tile => [tile.role, tile.value])).toEqual([
      ['original', '₦10,000'],
      ['deal', '₦8,000'],
      ['savings', '20% (-₦2,000)'],
      ['fee', '0% (Direct)'],
    ]);
    expect(view.metrics[1].value).toBe('₦32,000');
    expect(view.rateValue).toBe('40%');
    expect(view.daysLeft).toBe('6 Days Left');
    expect(view.capValue).toBe('30 of 40 left');
    expect(view.branchesCount).toBe('1 of 2 branches');
    expect(view.branches[1]).toMatchObject({
      name: 'Garki',
      price: '₦8,500',
      active: false,
    });
    expect(view.copyFields.map(field => field.eyebrow)).toEqual([
      'Description',
      'Terms & Conditions',
      'Claim Flow Instructions',
    ]);
  });

  it('hides End once the deal has ended', () => {
    const view = toDealPerformanceView(
      deal({ endDate: '2026-10-01T00:00:00Z' }),
      undefined,
      NOW,
    );
    expect(view.canEnd).toBe(false);
    expect(view.daysLeft).toBeNull();
  });
});

describe('edit round-trip', () => {
  it('loads a deal into the wizard draft', () => {
    const draft = offerRowToDealDraft(deal());
    expect(draft).toMatchObject({
      editingDealGroupId: 'group-1',
      strategy: 'percentage',
      discountRate: 20,
      totalVouchers: '40',
      claimFrequency: 'once',
      acceptGifting: true,
      branchIds: ['branch-1', 'branch-2'],
      basePrice: 10000,
      // claim steps live inside terms on create; split them back out
      terms: ['Dine-in only'],
      claimSteps: [{ id: 'step-1', value: 'Show the voucher' }],
    });
  });

  it('leaves pricing alone when the owner did not change it', () => {
    const fixedPrice = offerRowToDealDraft(
      deal({ pricingType: 'fixed_discount_price', discountValue: null }),
    );
    const input = dealDraftToUpdateInput({ ...fixedPrice, name: 'Renamed' });

    expect(input.name).toBe('Renamed');
    expect(input).not.toHaveProperty('pricingType');
    expect(input).not.toHaveProperty('discountValue');
    expect(input).not.toHaveProperty('branchId');
    expect(updateCatalogueOfferInputSchema.safeParse(input).success).toBe(true);
  });

  it('sends pricing once the owner changes it', () => {
    const draft = offerRowToDealDraft(deal());
    const input = dealDraftToUpdateInput({ ...draft, discountRate: 30 });
    expect(input).toMatchObject({
      pricingType: 'percentage_discount',
      discountValue: 30,
    });
  });

  it('publishes a new deal to every selected branch', () => {
    const draft = offerRowToDealDraft(deal());
    expect(
      dealDraftToCreateInput(draft, 'branch-1', ['branch-1', 'branch-2']),
    ).toMatchObject({
      branchId: 'branch-1',
      branchIds: ['branch-1', 'branch-2'],
    });
    expect(
      dealDraftToCreateInput(draft, 'branch-1', ['branch-1']).branchIds,
    ).toBeUndefined();
  });
});

describe('deals API schemas', () => {
  it('parses grouped admin rows with string decimals', () => {
    const [row] = businessOffersAdminSchema.parse([
      {
        ...deal(),
        calculatedPrice: '8000.00',
        originalPrice: '10000.00',
        items: [{ id: ITEM_1, name: 'Jollof Bowl', price: '6000.00', mainImage: null }],
      },
    ]);
    expect(row.calculatedPrice).toBe(8000);
    expect(row.originalPrice).toBe(10000);
    expect(row.items?.[0].price).toBe(6000);
  });

  it('parses the summary and a ledger page', () => {
    expect(offersSummarySchema.parse({ netRevenue30d: '8500.00' }).netRevenue30d).toBe(
      8500,
    );

    const page = dealLedgerPageSchema.parse({
      data: [
        {
          id: 'c1',
          claimCode: 'VEM-1',
          status: 'redeemed',
          customerName: 'Ada O.',
          contact: 'ad***@mail.com',
          dealName: 'Lunch Combo',
          dealGroupId: 'group-1',
          offerId: 'offer-1',
          branchId: 'branch-1',
          branchName: 'Wuse',
          amount: '8000.00',
          discountGiven: 2000,
          claimedAt: '2026-10-14T10:00:00Z',
          redeemedAt: '2026-10-14T12:00:00Z',
          expiresAt: null,
          activityAt: '2026-10-14T12:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totals: {
        claims: 3,
        redeemed: 1,
        expired: 1,
        netRevenue: '8000.00',
        discountGiven: 2000,
      },
    });
    expect(page.data[0].amount).toBe(8000);
    expect(page.totals.netRevenue).toBe(8000);
  });
});

describe('dealDraftToReview (wizard Step 4)', () => {
  const branches = [
    { id: 'branch-1', name: 'Wuse', address: 'Aminu Kano Cres' },
    { id: 'branch-2', name: 'Garki', address: null },
  ];
  const draft = () => offerRowToDealDraft(deal());

  it('reviews the deal exactly as it will publish', () => {
    const review = dealDraftToReview(draft(), branches, NOW);
    expect(review).toMatchObject({
      title: 'Lunch Combo',
      discountBadge: '20% OFF',
      strategySummary: 'Percentage Discount (20% Off)',
      originalPrice: '₦10,000',
      memberPrice: '₦8,000',
      savings: 'Instant savings of ₦2,000',
      vouchers: '40 Vouchers',
      claimLimit: '1 Per Customer',
      giftingTitle: 'Gifting Allowed',
      duration: '20 Days Window',
      durationNote: 'Oct 1 – Oct 21',
      claimSteps: ['Show the voucher'],
      terms: ['Dine-in only'],
      blocker: undefined,
    });
    expect(review.branches.map(branch => branch.name)).toEqual(['Wuse', 'Garki']);
  });

  it('prices an amount-off deal and shows an uncapped one as unlimited', () => {
    const review = dealDraftToReview(
      { ...draft(), strategy: 'fixed', discountRate: 1500, totalVouchers: undefined },
      branches,
      NOW,
    );
    expect(review).toMatchObject({
      discountBadge: '₦1,500 OFF',
      memberPrice: '₦8,500',
      vouchers: 'Unlimited',
    });
  });

  it('hides the price maths when the item price is unknown', () => {
    const review = dealDraftToReview({ ...draft(), basePrice: undefined }, branches, NOW);
    expect(review.originalPrice).toBeUndefined();
    expect(review.memberPrice).toBeUndefined();
  });

  it('lists every branch when none were picked, as publish does', () => {
    const review = dealDraftToReview({ ...draft(), branchIds: [] }, branches, NOW);
    expect(review.branches).toHaveLength(2);
    expect(review.branchesNote).toBe('All 2 branches');
  });

  it('explains why a deal cannot launch yet', () => {
    expect(
      dealDraftToReview(
        { ...draft(), itemIds: [], sourceProductId: undefined },
        branches,
        NOW,
      ).blocker,
    ).toBe(strings.businessCreateDeal.step4.noItemBlocker);
    expect(dealDraftToReview({ ...draft(), branchIds: [] }, [], NOW).blocker).toMatch(
      /Add a branch/,
    );
  });
});
