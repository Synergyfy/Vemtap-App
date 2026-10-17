import { strings } from '@constants/strings';
import {
  analyticsQuery,
  analyticsRange,
  parseLocalDate,
} from '@store/analyticsFilterStore';
import {
  bucketSeries,
  changeRatio,
  deltaView,
  heatmapView,
  labelForPreset,
  percent,
  presetForLabel,
  rangeDays,
  toBranchComparisonView,
  toBusinessOverviewView,
  toCustomersAnalyticsView,
  toDealsAnalyticsView,
  toLocationsAnalyticsView,
  toPerformanceView,
  toPosAnalyticsView,
} from '@features/business/utils/analyticsMappers';
import { isValidCustomRange } from '@features/business/screens/AnalyticsFilterSettingsSheet';
import {
  customersFixture,
  dealsFixture,
  locationsFixture,
  overviewFixture,
  posFixture,
} from './helpers/analyticsFixtures';

const bi = strings.businessIntelligence;

describe('analytics formatting helpers', () => {
  it('formats ratios as percentages', () => {
    expect(percent(0.425)).toBe('42.5%');
    expect(percent(0.5)).toBe('50%');
    expect(percent(0)).toBe('0%');
  });

  it('describes the change against the previous period', () => {
    expect(changeRatio({ current: 120, previous: 100 })).toBeCloseTo(0.2);
    expect(changeRatio({ current: 5, previous: 0 })).toBeNull();
    expect(deltaView({ current: 120, previous: 100 })).toEqual({
      label: bi.vsPrevious('+20%'),
      direction: 'up',
    });
    expect(deltaView({ current: 80, previous: 100 }).direction).toBe('down');
    expect(deltaView({ current: 5, previous: 0 }).label).toBe(bi.newThisPeriod);
    expect(deltaView({ current: 0, previous: 0 }).label).toBe(bi.noChange);
  });

  it('buckets long series into at most n sums', () => {
    const points = Array.from({ length: 30 }, () => 1);
    expect(bucketSeries(points, 4, value => value)).toEqual([8, 8, 8, 6]);
    expect(bucketSeries([1, 2, 3], 7, value => value)).toEqual([1, 2, 3]);
  });

  it('maps range chips to presets and back', () => {
    expect(presetForLabel('7D')).toBe('7d');
    expect(presetForLabel('YTD')).toBe('year');
    expect(presetForLabel('Nope')).toBeNull();
    expect(labelForPreset('30d', ['Today', '7D', '30D', 'Custom'])).toBe('30D');
    // A preset the strip has no chip for shows as Custom.
    expect(labelForPreset('90d', ['Today', '7D', '30D', 'Custom'])).toBe('Custom');
  });

  it('marks the busiest day × daypart as the peak', () => {
    const heat = heatmapView([
      { dow: 6, hour: 19, count: 12 },
      { dow: 6, hour: 20, count: 3 },
      { dow: 2, hour: 9, count: 2 },
    ]);
    expect(heat.columns[0]).toBe('Mon');
    expect(heat.rows.map(row => row.label)).toEqual(Object.values(bi.dayparts));
    // Saturday evening (column 5, row 2) holds 15 — the peak.
    expect(heat.rows[2].cells[5]).toBe(bi.peakCell);
    expect(heat.busiest).toEqual({ day: 'Saturday', daypart: 'Evening', count: 15 });
    expect(heat.quietest).toEqual({ day: 'Tuesday', daypart: 'Morning', count: 2 });
    expect(heat.rows[0].cells[1]).toBe('low');
  });

  it('is empty-safe', () => {
    const heat = heatmapView([]);
    expect(heat.busiest).toBeNull();
    expect(heat.rows.every(row => row.cells.every(cell => cell === 'lowest'))).toBe(true);
  });
});

describe('analytics window', () => {
  const now = new Date(2026, 9, 16, 15, 30);

  it('ends every preset at the next local midnight', () => {
    const week = analyticsRange({ preset: '7d', customFrom: null, customTo: null }, now);
    expect(week.from).toEqual(new Date(2026, 9, 10));
    expect(week.to).toEqual(new Date(2026, 9, 17));
    const today = analyticsRange(
      { preset: 'today', customFrom: null, customTo: null },
      now,
    );
    expect(today.from).toEqual(new Date(2026, 9, 16));
    const year = analyticsRange(
      { preset: 'year', customFrom: null, customTo: null },
      now,
    );
    expect(year.from).toEqual(new Date(2026, 0, 1));
  });

  it('uses an inclusive custom window and falls back when it is invalid', () => {
    const custom = analyticsRange(
      { preset: 'custom', customFrom: '2026-10-01', customTo: '2026-10-05' },
      now,
    );
    expect(custom).toEqual({ from: new Date(2026, 9, 1), to: new Date(2026, 9, 6) });
    const broken = analyticsRange(
      { preset: 'custom', customFrom: '2026-10-05', customTo: '2026-10-01' },
      now,
    );
    expect(broken.to).toEqual(new Date(2026, 9, 17));
  });

  it('builds a stable query with the branch only when one is chosen', () => {
    const base = { preset: '30d' as const, customFrom: null, customTo: null };
    expect(analyticsQuery({ ...base, branchId: null }, now)).not.toHaveProperty(
      'branchId',
    );
    expect(analyticsQuery({ ...base, branchId: 'b1' }, now).branchId).toBe('b1');
    expect(analyticsQuery({ ...base, branchId: null }, now)).toEqual(
      analyticsQuery({ ...base, branchId: null }, new Date(2026, 9, 16, 23, 59)),
    );
  });

  it('parses only real calendar dates', () => {
    expect(parseLocalDate('2026-02-30')).toBeNull();
    expect(parseLocalDate('2026-10-1')).toBeNull();
    expect(parseLocalDate('2026-10-01')).toEqual(new Date(2026, 9, 1));
    expect(isValidCustomRange('2026-10-01', '2026-10-31')).toBe(true);
    expect(isValidCustomRange('2026-10-31', '2026-10-01')).toBe(false);
    expect(isValidCustomRange('2025-01-01', '2026-10-31')).toBe(false);
    expect(rangeDays('2026-10-01T00:00:00Z', '2026-10-08T00:00:00Z')).toBe(7);
  });
});

describe('analytics view models', () => {
  it('builds the business overview', () => {
    const view = toBusinessOverviewView(overviewFixture);
    expect(view.revenue.value).toBe('₦485,000');
    expect(view.revenue.delta.label).toBe(bi.vsPrevious('+21.3%'));
    expect(view.scope).toBe(bi.branchScope(2));
    expect(view.trend.labels).toHaveLength(7);
    expect(view.retention.map(row => row.value)).toEqual(['40%', '60%']);
    expect(view.insights.map(insight => insight.id)).toEqual(['busiest-day', 'top-deal']);
    expect(view.isEmpty).toBe(false);
  });

  it('builds the performance view with channel shares and team rows', () => {
    const view = toPerformanceView(overviewFixture);
    expect(view.metrics[0].value).toBe('₦485,000');
    expect(view.channels.map(row => row.percent)).toEqual([62, 38]);
    expect(view.team[0]).toMatchObject({ name: 'Ada Obi', initials: 'AO' });
    expect(view.hourly).toHaveLength(7);
    expect(view.hourly.find(slot => slot.label === '12p')?.value).toBe(18);
  });

  it('builds the customers view', () => {
    const view = toCustomersAnalyticsView(customersFixture);
    expect(view.total.value).toBe('120');
    expect(view.inactiveBody).toBe(bi.customers.inactiveBody('9'));
    // Share of all new customers: 8 of 14.
    expect(view.channels[0]).toMatchObject({ id: 'claim', percent: 57 });
    expect(view.frequencyHealthy).toBe(true);
    expect(view.growthLegend).toEqual([
      bi.customers.growthReturning('24'),
      bi.customers.growthNew('14'),
    ]);
  });

  it('flags a weak deal and leaves the boost panel empty without a boost', () => {
    const weak = {
      ...dealsFixture,
      deals: [dealsFixture.deals[0], { ...dealsFixture.deals[1], claimRate: 0.003 }],
    };
    const view = toDealsAnalyticsView(weak, null);
    expect(view.deals[0].badge).toBe(bi.deals.percentOff('20'));
    expect(view.deals[1].badge).toBe('₦7,200');
    expect(view.deals[0].belowAverage).toBe(false);
    expect(view.deals[1].belowAverage).toBe(true);
    expect(view.funnelCompletion).toBe(bi.deals.funnelCompletion('40%'));
    expect(view.boost).toBeNull();
  });

  it('builds the POS view with ranked peaks and tender labels', () => {
    const view = toPosAnalyticsView(posFixture);
    expect(view.peaks).toEqual([
      bi.pos.peak(1, '20:00', '₦98k'),
      bi.pos.peak(2, '14:00', '₦84k'),
    ]);
    expect(view.rhythm.filter(slot => slot.badge)).toHaveLength(2);
    expect(view.tenderRows[2].label).toBe(bi.pos.tenders.transfer);
    expect(view.kpis.find(kpi => kpi.id === 'variance')?.value).toBe('-₦500');
  });

  it('builds the locations view and branch comparison', () => {
    const locations = toLocationsAnalyticsView(locationsFixture);
    expect(locations.scopes[0].label).toBe(bi.locations.allBranches(2));
    expect(locations.scorecards[0].badge).toBe(bi.locations.badges.top);
    expect(locations.channels).toHaveLength(6);

    const comparison = toBranchComparisonView(locationsFixture);
    expect(comparison.best?.name).toBe('Wuse Flagship');
    expect(comparison.watch?.name).toBe('Garki Express');
    expect(comparison.branches[1].rating).toBe(0);
  });

  it('never labels a lone branch as best or watch', () => {
    const single = toBranchComparisonView({
      ...locationsFixture,
      branches: [locationsFixture.branches[1]],
    });
    expect(single.branches[0].status).toBe('steady');
    expect(single.best).toBeNull();
  });
});
