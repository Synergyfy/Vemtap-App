import { strings } from '@constants/strings';
import {
  criteriaToSelection,
  insightToDetailsView,
  relativeAgo,
  segmentPickerOptions,
  segmentToCard,
  selectionToCriteria,
} from '@features/business/utils/segmentMappers';
import {
  campaignName,
  draftToSaveInput,
  eligibleAssetToContentItem,
  estimateRange,
  promotionToCampaignCard,
} from '@features/business/utils/campaignMappers';
import type { CampaignDraft } from '@store/campaignDraftStore';
import type { Promotion } from '@api/promotionsApi';

const options = segmentPickerOptions({
  deals: [
    { id: 'deal-1', name: 'Lunch Combo' },
    { id: 'deal-2', name: 'Weekend Feast' },
  ],
  menuItems: [{ id: 'item-1', name: 'Jollof' }],
  branches: [],
});

describe('segment criteria mapping', () => {
  it('turns ticked builder criteria into the API rule set', () => {
    expect(
      selectionToCriteria(
        {
          criteria: ['claimed', 'dishes', 'ticket', 'dormant'],
          pickers: { claimed: 1, dormant: 2 },
        },
        options,
      ),
    ).toEqual({
      deals: { offerIds: ['deal-2'] },
      menu: { itemIds: ['item-1'] },
      spend: { minAverageTicket: 20_000 },
      recency: { notVisitedForDays: 90 },
    });
  });

  it('leaves out a criterion with nothing to pick instead of sending it empty', () => {
    // No branches: an empty `branchIds` would match nobody.
    expect(selectionToCriteria({ criteria: ['branch'], pickers: {} }, options)).toEqual(
      {},
    );
  });

  it('reopens a saved rule set on the same choices', () => {
    const criteria = selectionToCriteria(
      { criteria: ['claimed', 'dormant'], pickers: { claimed: 1, dormant: 1 } },
      options,
    );
    expect(criteriaToSelection(criteria, options)).toEqual({
      criteria: ['claimed', 'dormant'],
      pickers: { claimed: 1, dormant: 1 },
    });
  });

  it('describes a dynamic segment by its rules on its card', () => {
    const card = segmentToCard({
      id: 's1',
      name: 'Lapsed regulars',
      type: 'dynamic',
      size: 1234,
      criteria: { recency: { notVisitedForDays: 60 } },
    });
    expect(card.size).toBe('1,234');
    expect(card.detail).toBe(strings.customerSegments.live.rules.recency);
    expect(card.badge).toBe(strings.customerSegments.live.dynamicBadge);
  });

  it('maps insights onto every figure the details page shows', () => {
    const now = Date.parse('2026-10-15T12:00:00Z');
    const view = insightToDetailsView(
      {
        segmentId: 's1',
        name: 'Lapsed',
        type: 'dynamic',
        size: 4,
        reachableByPush: 3,
        reachableBySms: 2,
        reachableByEmail: 0,
        totalSpend: 45000,
        avgOrderValue: 7500,
        visitFrequency: 3,
        spendDelta: 0.184,
        aovDelta: null,
        branchSplit: [{ branchId: 'b1', name: 'Wuse', percent: 100 }],
        favourites: [{ itemId: 'i1', name: 'Jollof', orders: 4 }],
        samplePatrons: [
          {
            userId: 'u1',
            name: 'Ada Obi',
            avatarUrl: null,
            lastVisit: null,
            spend: 30000,
          },
        ],
      },
      { lastComputedAt: '2026-10-15T11:48:00Z', criteria: null, description: null },
      now,
    );
    expect(view.spend).toBe('₦45,000');
    expect(view.spendDelta).toBe('+18.4%');
    expect(view.aovDelta).toBeUndefined();
    expect(view.channels[0].value).toBe('3 / 4 (75%)');
    expect(view.patrons[0].initials).toBe('AO');
    expect(view.updated).toBe('Updated 12m ago');
    expect(view.privacyTitle).toBeUndefined();
  });

  it('formats elapsed time compactly', () => {
    const now = Date.parse('2026-10-15T12:00:00Z');
    expect(relativeAgo('2026-10-15T11:59:50Z', now)).toBe('just now');
    expect(relativeAgo('2026-10-15T09:00:00Z', now)).toBe('3h ago');
    expect(relativeAgo('2026-10-13T12:00:00Z', now)).toBe('2d ago');
  });
});

const draft: CampaignDraft = {
  objectiveId: 'deal',
  assets: [{ type: 'deal', id: 'd1', title: 'Lunch Combo' }],
  strategy: 'segments',
  cohorts: ['vip'],
  segmentIds: ['seg-1'],
  branchIds: ['b1'],
  radiusKm: 5,
  durationDays: 7,
  instantLaunch: true,
  dayparting: false,
  windows: ['lunch'],
  weekdays: ['fri', 'sat', 'sun'],
  autoRenew: false,
  budgetMode: 'total',
  total: 35_000,
  funding: 'wallet',
};

describe('campaign draft mapping', () => {
  it('names the campaign after its objective and lead asset', () => {
    expect(campaignName(draft)).toBe('Promote a Deal: Lunch Combo');
  });

  it('builds the SaveCampaignDto the API validates', () => {
    expect(draftToSaveInput(draft)).toEqual({
      name: 'Promote a Deal: Lunch Combo',
      objective: 'deal',
      assets: [{ type: 'deal', id: 'd1' }],
      audience: {
        strategy: 'segments',
        cohorts: ['vip'],
        segmentIds: ['seg-1'],
        branchIds: ['b1'],
        radiusKm: 5,
      },
      schedule: {
        durationDays: 7,
        instantLaunch: true,
        dayparting: false,
        // Windows only count with dayparting on.
        windows: [],
        weekdays: [5, 6, 0],
        autoRenew: false,
      },
      budgetMode: 'total',
      budget: 35_000,
    });
  });

  it('sends a daily budget as the per-day amount', () => {
    const input = draftToSaveInput({ ...draft, budgetMode: 'daily', total: 35_000 });
    expect(input.dailyBudget).toBe(5_000);
    expect(input.budget).toBeUndefined();
  });

  it('drops segment targeting when the strategy is everyone nearby', () => {
    const input = draftToSaveInput({ ...draft, strategy: 'nearby' });
    expect(input.audience?.cohorts).toEqual([]);
    expect(input.audience?.segmentIds).toEqual([]);
  });
});

describe('campaign hub mapping', () => {
  const base: Promotion = {
    id: 'p1',
    name: 'Promote a Deal: Lunch Combo',
    status: 'Active',
    objective: 'deal',
    assets: [{ type: 'deal', id: 'd1' }],
    audience: { strategy: 'nearby', radiusKm: 3 },
    budget: 35_000,
    spent: 5_000,
    remaining: 30_000,
    launchedAt: '2026-10-14T10:00:00Z',
    endDate: '2026-10-18T10:00:00Z',
    impressions: 1200,
    clicks: 80,
  };

  it('shows a live campaign with its days left, spend and a pause action', () => {
    const card = promotionToCampaignCard(base, Date.parse('2026-10-15T10:00:00Z'));
    expect(card.status).toBe('live');
    expect(card.statusLabel).toBe('Active • 3 Days Left');
    expect(card.cta).toBe(strings.campaignsHub.pauseCta);
    expect(card.stats.map(stat => stat.value)).toEqual(['1,200', '80', '₦5,000']);
  });

  it('offers resume on a paused campaign and no stats on an unlaunched draft', () => {
    expect(promotionToCampaignCard({ ...base, status: 'Paused' }).cta).toBe(
      strings.campaignsHub.live.resumeCta,
    );
    const draftCard = promotionToCampaignCard({
      ...base,
      status: 'Draft',
      launchedAt: null,
    });
    expect(draftCard.status).toBe('draft');
    expect(draftCard.stats).toEqual([]);
    expect(draftCard.cta).toBeUndefined();
  });

  it('flags a card-funded campaign waiting on Paystack', () => {
    const card = promotionToCampaignCard({
      ...base,
      status: 'Pending',
      awaitingPayment: true,
    });
    expect(card.statusLabel).toBe(strings.campaignsHub.live.status.awaitingPayment);
  });

  it('renders a priceless profile asset without a price', () => {
    const item = eligibleAssetToContentItem({
      type: 'profile',
      id: 'b1',
      title: 'Mama Put',
      image: null,
      price: null,
      wasPrice: null,
      priorClaims: null,
    });
    expect(item.price).toBe('');
    expect(item.group).toBe('profile');
  });

  it('formats forecast bands compactly', () => {
    expect(estimateRange(6000, 9500)).toBe('6k – 9.5k');
    expect(estimateRange(45, 70)).toBe('45 – 70');
  });
});
