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
  campaignForecastTargeting,
  draftToSaveInput,
  eligibleAssetToContentItem,
  estimateRange,
  promotionToCampaignCard,
} from '@features/business/utils/campaignMappers';
import {
  budgetTopUp,
  statsToPerformanceView,
} from '@features/business/utils/campaignPerformanceMappers';
import {
  boostDraftToPreviewView,
  boostDraftToSaveInput,
  boostForecastTargeting,
  prepackToCard,
  transactionToRow,
} from '@features/business/utils/boostMappers';
import type { BoostDraft } from '@store/boostDraftStore';
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

  it('maps the saved, district, interaction and points criteria', () => {
    const withDistricts = segmentPickerOptions({
      deals: [{ id: 'deal-1', name: 'Lunch Combo' }],
      menuItems: [],
      branches: [],
      districts: [
        { id: 'd-apo', name: 'Apo' },
        { id: 'd-wuse', name: 'Wuse 2' },
      ],
    });
    const selection = {
      criteria: ['claimed', 'saved', 'district', 'interacted', 'points', 'dormant'],
      pickers: { district: 1, dormant: 1 },
    };
    const criteria = selectionToCriteria(selection, withDistricts);
    expect(criteria).toEqual({
      // The picked deal stays a claim rule; saved covers any deal.
      deals: { offerIds: ['deal-1'], savedNotRedeemed: true },
      location: { homeDistrictIds: ['d-wuse'] },
      recency: { interactedWithinDays: 14, notVisitedForDays: 60 },
      loyalty: { minPoints: 500 },
    });

    const reopened = criteriaToSelection(criteria, withDistricts);
    expect([...reopened.criteria].sort()).toEqual([...selection.criteria].sort());
    expect(reopened.pickers).toEqual({ district: 1, dormant: 1 });
  });

  it('labels each new rule on a segment card, not as its neighbour', () => {
    const detail = (criteria: object) =>
      segmentToCard({ id: 's', name: 'S', type: 'dynamic', size: 1, criteria }).detail;
    const { rules } = strings.customerSegments.live;
    expect(detail({ deals: { savedNotRedeemed: true } })).toBe(rules.saved);
    expect(detail({ location: { homeDistrictIds: ['d'] } })).toBe(rules.district);
    expect(detail({ recency: { interactedWithinDays: 14 } })).toBe(rules.interacted);
    expect(detail({ loyalty: { minPoints: 500 } })).toBe(rules.loyalty);
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

  it('shows the opt-out notice with the real count when someone is excluded', () => {
    const view = insightToDetailsView({
      segmentId: 's1',
      name: 'Lapsed',
      type: 'dynamic',
      size: 10,
      reachableByPush: 6,
      reachableBySms: 5,
      reachableByEmail: 2,
      excludedFromPromotions: 3,
      totalSpend: 0,
      avgOrderValue: 0,
      visitFrequency: 0,
      spendDelta: null,
      aovDelta: null,
      branchSplit: [],
      favourites: [],
      samplePatrons: [],
    });
    expect(view.privacyTitle).toBe('3 customers excluded from promotional broadcasts');
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
  districtIds: [],
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
  saveCard: false,
};

describe('campaign draft mapping', () => {
  it('forecasts a campaign within its districts', () => {
    expect(campaignForecastTargeting({ districtIds: ['d-wuse'] })).toEqual({
      clusterIds: ['d-wuse'],
    });
    expect(campaignForecastTargeting({ districtIds: [] })).toEqual({});
  });

  it('sends chosen districts in place of the radius', () => {
    expect(
      draftToSaveInput({ ...draft, districtIds: ['d-wuse'] }).audience,
    ).toMatchObject({ clusterIds: ['d-wuse'] });
    expect(draftToSaveInput(draft).audience).not.toHaveProperty('clusterIds');
  });

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

describe('campaign performance mapping', () => {
  const promotion: Promotion = {
    id: '0b9a4f1e-1c2d-4e5f-8a9b-0c1d2e3f4a5b',
    name: 'Promote a Deal: Lunch Combo',
    status: 'Active',
    assets: [],
    budget: 20_000,
    spent: 12_450,
    remaining: 7_550,
    launchedAt: '2026-10-13T08:00:00Z',
    startDate: '2026-10-13T08:00:00Z',
    endDate: '2026-10-18T08:00:00Z',
  };
  const stats = {
    id: promotion.id,
    status: 'Active' as const,
    kpis: {
      budget: 20_000,
      spent: 12_450,
      left: 7_550,
      percentConsumed: 62,
      redemptions: 40,
      grossRevenue: 614_400,
      reach: 10_840,
      returnOnSpend: 49.35,
    },
    funnel: [
      { id: 'impressions', label: 'Impressions', value: 10_000 },
      { id: 'taps', label: 'Taps & views', value: 4_000 },
      { id: 'saves', label: 'Saves', value: 1_000 },
      { id: 'claims', label: 'Claims', value: 100 },
      { id: 'redeemed', label: 'Redeemed', value: 40 },
    ],
    rhythm: [
      { hour: 9, claims: 10 },
      { hour: 13, claims: 60 },
      { hour: 14, claims: 20 },
      { hour: 19, claims: 10 },
    ],
    byBranch: [
      { branchId: 'b1', name: 'Wuse II', claims: 75 },
      { branchId: 'b2', name: 'Garki', claims: 25 },
    ],
    series: [],
  };

  it('maps stats onto the executive pulse, funnel, rhythm and branches', () => {
    const view = statsToPerformanceView(
      'promotion',
      promotion,
      stats,
      Date.parse('2026-10-15T10:00:00Z'),
    );
    expect(view.banner).toBe('Campaign Active • Day 3 of 5 • Ending in 3 days (18 Oct)');
    expect(view.kpis.spend.value).toBe('₦12,450');
    expect(view.kpis.cost.value).toBe('₦125');
    // Redeemed is a share of claims (the walk-in rate), the rest of reach.
    expect(view.funnel.find(stage => stage.id === 'taps')?.percent).toBe('40%');
    expect(view.funnel.find(stage => stage.id === 'redeemed')?.percent).toBe('40%');
    // 12–4pm holds 80 of 100 claims.
    expect(view.peak?.index).toBe(3);
    expect(view.peak?.value).toBe('80%');
    expect(view.geo.map(branch => branch.percent)).toEqual(['75%', '25%']);
    expect(view.canPause).toBe(true);
    // ₦20,000 over 5 days: two more days is ₦8,000.
    expect(view.canAddBudget).toBe(true);
    expect(view.addBudgetAmount).toBe(8_000);
    expect(view.addBudgetLabel).toBe('Add ₦8,000 Budget • Extend 2 Days');
    expect(view.showViews).toBe(false);
  });

  it('compares reach with the previous run and cost with the platform', () => {
    const perfLive = strings.boostWizard.performance.live;
    const view = statsToPerformanceView('boost', promotion, {
      ...stats,
      // 12,450 / 100 claims = ₦124.50 against a ₦250 average.
      previous: {
        id: 'c-0',
        name: 'Run 1',
        endDate: '2026-10-06T08:00:00.000Z',
        reach: 9_492,
        claims: 80,
        redemptions: 30,
        spent: 10_000,
        costPerClaim: 125,
      },
      benchmark: { costPerClaim: 250, campaigns: 12 },
    });
    expect(view.kpis.reach.delta).toBe(perfLive.reachDelta('+14.2%'));
    expect(view.kpis.cost.sub).toBe(perfLive.benchmark('₦250'));
    expect(view.kpis.cost.badge).toBe(perfLive.cheaper(50));

    const worse = statsToPerformanceView('boost', promotion, {
      ...stats,
      kpis: { ...stats.kpis, reach: 5_000 },
      previous: {
        id: 'c-0',
        name: 'Run 1',
        reach: 10_000,
        claims: 1,
        redemptions: 0,
        spent: 1,
        costPerClaim: 1,
      },
      // ₦124.50 against ₦83 is 50% higher.
      benchmark: { costPerClaim: 83, campaigns: 12 },
    });
    expect(worse.kpis.reach.delta).toBe(perfLive.reachDelta('\u221250%'));
    expect(worse.kpis.cost.badge).toBe(perfLive.pricier(50));
  });

  it('hides the comparisons when there is nothing to compare with', () => {
    const view = statsToPerformanceView('boost', promotion, {
      ...stats,
      previous: {
        id: 'c-0',
        name: 'Run 1',
        reach: 0,
        claims: 0,
        redemptions: 0,
        spent: 0,
        costPerClaim: null,
      },
      benchmark: null,
    });
    expect(view.kpis.reach.delta).toBeUndefined();
    expect(view.kpis.cost.badge).toBeUndefined();
    expect(view.kpis.cost.sub).toBe(
      strings.boostWizard.performance.live.returnOnSpend('49.4'),
    );
    expect(view.showViews).toBe(false);
  });

  it('draws views next to claims once views are recorded', () => {
    const view = statsToPerformanceView('boost', promotion, {
      ...stats,
      rhythm: [
        { hour: 13, views: 200, claims: 60 },
        { hour: 19, views: 50, claims: 10 },
      ],
    });
    expect(view.showViews).toBe(true);
    expect(view.rhythmSubtitle).toBe(strings.boostWizard.performance.rhythmSubtitle);
    // 12–4pm is the busiest slot for both.
    expect(view.rhythm[3]).toMatchObject({ views: 100, claims: 100 });
    expect(view.rhythm[4]).toMatchObject({ views: 25 });
  });

  it('offers resume on a paused campaign and nothing on an ended one', () => {
    const paused = statsToPerformanceView(
      'boost',
      { ...promotion, status: 'Paused' },
      stats,
    );
    expect(paused.canResume).toBe(true);
    expect(paused.canPause).toBe(false);
    const ended = statsToPerformanceView(
      'boost',
      { ...promotion, status: 'Ended' },
      stats,
    );
    expect(ended.canEnd).toBe(false);
    expect(ended.endedNote).toBeDefined();
    expect(paused.canAddBudget).toBe(true);
    expect(ended.canAddBudget).toBe(false);
  });

  it('adds at least the API minimum, and nothing past 90 days', () => {
    const run = (budget: number, days: number) => ({
      budget,
      startDate: '2026-10-01T00:00:00Z',
      endDate: new Date(
        Date.parse('2026-10-01T00:00:00Z') + days * 86_400_000,
      ).toISOString(),
    });
    // ₦500/day: two days would be ₦1,000, so ₦2,000 buys four.
    expect(budgetTopUp(run(3_500, 7))).toEqual({ amount: 2_000, days: 4 });
    expect(budgetTopUp(run(89_000, 89))).toBeUndefined();
    expect(
      budgetTopUp({ budget: 10_000, startDate: null, endDate: null }),
    ).toBeUndefined();
  });
});

describe('boost mapping', () => {
  const boostDraft: BoostDraft = {
    asset: { type: 'deal', id: 'd1', title: 'Jollof Combo', price: 4000, wasPrice: 5000 },
    goalId: 'claims',
    audienceScope: 'nearby',
    areas: [],
    radiusKm: 5,
    placements: ['feed', 'push'],
    durationDays: 7,
    dayparting: true,
    budget: 35_000,
    funding: 'wallet',
  };

  it('builds the SaveCampaignDto a boost launch needs (one asset, a goal)', () => {
    expect(boostDraftToSaveInput(boostDraft, 'branch-1')).toEqual({
      name: 'Jollof Combo',
      goalId: 'claims',
      assets: [{ type: 'deal', id: 'd1' }],
      audience: { strategy: 'nearby', radiusKm: 5, branchIds: ['branch-1'] },
      placements: ['feed', 'push'],
      schedule: {
        durationDays: 7,
        instantLaunch: true,
        dayparting: true,
        windows: ['lunch'],
      },
      budgetMode: 'total',
      budget: 35_000,
    });
  });

  it('forecasts with the same areas and audience the boost is saved with', () => {
    const areas = [{ id: 'd-wuse', name: 'Wuse 2' }];
    expect(
      boostForecastTargeting({
        audienceScope: 'districts',
        areas,
        audienceType: 'regulars',
      }),
    ).toEqual({ clusterIds: ['d-wuse'], audienceType: 'regulars' });
    expect(boostForecastTargeting({ audienceScope: 'nearby', areas })).toEqual({});
  });

  it('sends district areas and the audience type, never areas for nearby', () => {
    const areas = [{ id: 'd-wuse', name: 'Wuse 2' }];
    expect(
      boostDraftToSaveInput({
        ...boostDraft,
        audienceScope: 'districts',
        areas,
        audienceType: 'walkins',
      }).audience,
    ).toMatchObject({
      strategy: 'districts',
      clusterIds: ['d-wuse'],
      audienceType: 'walkins',
    });
    expect(
      boostDraftToSaveInput({ ...boostDraft, audienceScope: 'nearby', areas }).audience,
    ).not.toHaveProperty('clusterIds');
  });

  it('previews the real listing, schedule and wallet shortfall', () => {
    const view = boostDraftToPreviewView(boostDraft, {
      businessName: 'Mama Put',
      branchName: 'Wuse II',
      walletSpendable: 20_000,
      now: new Date('2026-10-16T10:00:00Z'),
    });
    expect(view.feed.price).toBe('₦4,000');
    expect(view.feed.save).toBe('Save ₦1,000');
    expect(view.push.title).toBe('20% OFF at Mama Put!');
    expect(view.params.find(param => param.id === 'schedule')?.value).toBe(
      '7 Days (16 Oct – 23 Oct)',
    );
    expect(view.methods[0].body).toBe('Short by ₦15,000; pay the rest by card.');
    expect(view.methods.map(method => method.id)).toEqual(['wallet', 'card']);
    expect(view.trustNote).toBeUndefined();
  });

  it('labels wallet activity by direction and type', () => {
    const row = transactionToRow({
      id: 't1',
      type: 'release',
      amount: 3200,
      direction: 'credit',
      description: null,
      reference: null,
      balanceAfter: 10_000,
      reservedAfter: 0,
      createdAt: '2026-10-12T10:00:00Z',
    });
    expect(row.amount).toBe('+₦3,200');
    expect(row.title).toBe(strings.boostWizard.wallet.live.types.release);
    expect(
      prepackToCard({ id: '25k', amount: 25_000, bonus: 2_000, label: '₦25,000 Top-Up' })
        .bonus,
    ).toBe('+₦2,000 bonus ad credit');
  });
});
