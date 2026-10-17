import type {
  AnalyticsBranch,
  AnalyticsComparison,
  AnalyticsCustomers,
  AnalyticsDeals,
  AnalyticsHeatCell,
  AnalyticsLocations,
  AnalyticsOverview,
  AnalyticsPos,
} from '@api/businessAnalyticsApi';
import type { Promotion } from '@api/promotionsApi';
import type { IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';
import type { AnalyticsPreset } from '@store/analyticsFilterStore';
import { formatCompactNaira, formatCurrency } from '@utils/formatters';
import { initials, titleCase } from '@features/business/utils/posMappers';

/**
 * View models for the analytics screens. The API sends raw numbers; every
 * label, percentage and naira string the screens print is built here so the
 * screens stay presentational and the arithmetic is tested once.
 */

const bi = strings.businessIntelligence;

export const naira = (amount: number) => formatCurrency(amount);
export const count = (value: number) => Math.round(value).toLocaleString('en-NG');

/** `0.425` → `42.5%`; whole numbers drop the decimal. */
export function percent(ratio: number): string {
  const value = Math.round(ratio * 1000) / 10;
  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}%`;
}

/** Change vs the previous period as a signed percentage, or `null` with no base. */
export function changeRatio(comparison: AnalyticsComparison): number | null {
  if (comparison.previous === 0) return null;
  return (comparison.current - comparison.previous) / Math.abs(comparison.previous);
}

export interface DeltaView {
  label: string;
  direction: 'up' | 'down' | 'flat';
}

/** `+18.4% vs previous period`, `No change…`, or `New this period`. */
export function deltaView(comparison: AnalyticsComparison): DeltaView {
  const change = changeRatio(comparison);
  if (change === null) {
    return comparison.current > 0
      ? { label: bi.newThisPeriod, direction: 'up' }
      : { label: bi.noChange, direction: 'flat' };
  }
  if (Math.abs(change) < 0.0005) return { label: bi.noChange, direction: 'flat' };
  const sign = change > 0 ? '+' : '';
  return {
    label: bi.vsPrevious(`${sign}${percent(change)}`),
    direction: change > 0 ? 'up' : 'down',
  };
}

/** Bar height as 0–100 of the largest value, never 0 for a non-zero value. */
export function relative(value: number, max: number): number {
  if (max <= 0 || value <= 0) return 0;
  return Math.max(4, Math.round((value / max) * 100));
}

/** Range chip label ↔ preset, shared by every analytics surface. */
const PRESET_BY_LABEL: Record<string, AnalyticsPreset> = {
  Today: 'today',
  '7D': '7d',
  '30D': '30d',
  '90D': '90d',
  YTD: 'year',
  Custom: 'custom',
};

export function presetForLabel(label: string): AnalyticsPreset | null {
  return PRESET_BY_LABEL[label] ?? null;
}

export function labelForPreset(
  preset: AnalyticsPreset,
  options: readonly string[],
): string {
  const match = options.find(option => PRESET_BY_LABEL[option] === preset);
  return match ?? options.find(option => option === 'Custom') ?? '';
}

/* -------------------------------------------------------------------------- */
/* Shared builders                                                            */
/* -------------------------------------------------------------------------- */

export interface CompareRowView {
  id: string;
  label: string;
  value: string;
  percent: number;
}

const DAYPARTS = [
  { key: 'morning', label: bi.dayparts.morning, hours: [6, 7, 8, 9, 10, 11] },
  { key: 'midday', label: bi.dayparts.midday, hours: [12, 13, 14, 15, 16] },
  { key: 'evening', label: bi.dayparts.evening, hours: [17, 18, 19, 20, 21] },
  { key: 'late', label: bi.dayparts.late, hours: [22, 23, 0, 1, 2, 3, 4, 5] },
] as const;

/** Monday-first, as the designs read. */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export interface HeatmapView {
  columns: string[];
  rows: { label: string; cells: string[] }[];
  /** Busiest and quietest day × daypart, `null` when there is no activity. */
  busiest: { day: string; daypart: string; count: number } | null;
  quietest: { day: string; daypart: string; count: number } | null;
  total: number;
}

/**
 * Buckets the API's day × hour counts into dayparts with heat levels; the
 * single busiest cell is marked with the peak label.
 */
export function heatmapView(cells: readonly AnalyticsHeatCell[]): HeatmapView {
  const grid = DAYPARTS.map(part =>
    WEEK_ORDER.map(dow =>
      cells
        .filter(
          cell =>
            cell.dow === dow && (part.hours as readonly number[]).includes(cell.hour),
        )
        .reduce((sum, cell) => sum + cell.count, 0),
    ),
  );
  const flat = grid.flat();
  const max = Math.max(0, ...flat);
  const total = flat.reduce((sum, value) => sum + value, 0);
  const level = (value: number) => {
    if (max === 0 || value === 0) return 'lowest';
    const share = value / max;
    if (share >= 1) return bi.peakCell;
    if (share >= 0.66) return 'high';
    if (share >= 0.33) return 'mid';
    return 'low';
  };

  let busiest: HeatmapView['busiest'] = null;
  let quietest: HeatmapView['quietest'] = null;
  grid.forEach((row, partIndex) =>
    row.forEach((value, dayIndex) => {
      const day = bi.weekdays[WEEK_ORDER[dayIndex] ?? 0];
      const daypart = DAYPARTS[partIndex].label;
      if (value > 0 && (!busiest || value > busiest.count)) {
        busiest = { day, daypart, count: value };
      }
      // Quiet = the lowest non-zero window, ignoring the small hours.
      if (
        value > 0 &&
        DAYPARTS[partIndex].key !== 'late' &&
        (!quietest || value < quietest.count)
      ) {
        quietest = { day, daypart, count: value };
      }
    }),
  );

  return {
    columns: WEEK_ORDER.map(dow => bi.weekdaysShort[dow]),
    rows: DAYPARTS.map((part, index) => ({
      label: part.label,
      cells: grid[index].map(level),
    })),
    busiest,
    quietest,
    total,
  };
}

/** Up to `buckets` evenly sized sums of a series, labelled 1…n. */
export function bucketSeries<T>(
  points: readonly T[],
  buckets: number,
  pick: (point: T) => number,
): number[] {
  if (points.length <= buckets) return points.map(pick);
  const size = Math.ceil(points.length / buckets);
  const out: number[] = [];
  for (let i = 0; i < points.length; i += size) {
    out.push(points.slice(i, i + size).reduce((sum, point) => sum + pick(point), 0));
  }
  return out;
}

const hourLabel = (hour: number) => `${String(hour).padStart(2, '0')}:00`;
const shortHour = (hour: number) =>
  hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour - 12}p`;

function minutesLabel(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}:${String(m).padStart(2, '0')}`;
}

/* -------------------------------------------------------------------------- */
/* Business overview (VEMTAP Intelligence · Business)                         */
/* -------------------------------------------------------------------------- */

export interface BusinessOverviewView {
  snapshot: string;
  scope: string;
  revenue: { value: string; note: string; delta: DeltaView };
  orders: { value: string; note: string };
  interactions: { value: string; note: string };
  activityTotal: string;
  activity: { id: string; label: string; value: string }[];
  trend: {
    labels: string[];
    series: Record<'Revenue' | 'Orders' | 'Visits' | 'Customers', number[]>;
    peak: Record<'Revenue' | 'Orders' | 'Visits' | 'Customers', string>;
  };
  retention: CompareRowView[];
  repeatRate: string;
  sourcesSubtitle: string;
  sources: CompareRowView[];
  insights: { id: string; title: string; body: string }[];
  isEmpty: boolean;
}

export function toBusinessOverviewView(data: AnalyticsOverview): BusinessOverviewView {
  const copy = bi.business;
  const labels =
    data.series.length <= 7 ? data.series.map(point => point.date.slice(5)) : [];
  const bucketCount = data.series.length <= 7 ? data.series.length : 4;
  const series = {
    Revenue: bucketSeries(data.series, bucketCount, point => point.revenue),
    Orders: bucketSeries(data.series, bucketCount, point => point.orders),
    Visits: bucketSeries(data.series, bucketCount, point => point.visits),
    Customers: bucketSeries(data.series, bucketCount, point => point.customers),
  };
  const trendLabels = labels.length
    ? labels
    : series.Revenue.map((_, index) => bi.customers.growthWeek(index + 1));
  const peakOf = (values: number[], format: (value: number) => string) =>
    copy.trendPeak(format(Math.max(0, ...values)));

  const activeCustomers = data.customers.new + data.customers.returning;
  const sourceTotal = data.sources.reduce((sum, row) => sum + row.count, 0);
  const sourceLabels = copy.sources as Record<string, string>;

  const insights: BusinessOverviewView['insights'] = [];
  const revenueTotal = data.weekdays.reduce((sum, day) => sum + day.revenue, 0);
  const busiest = [...data.weekdays].sort((a, b) => b.revenue - a.revenue)[0];
  if (busiest && busiest.revenue > 0) {
    insights.push({
      id: 'busiest-day',
      title: copy.busiestDay(bi.weekdays[busiest.dow] ?? ''),
      body: copy.busiestDayBody(
        percent(busiest.revenue / revenueTotal),
        naira(busiest.revenue),
      ),
    });
  }
  if (data.topDeal && data.topDeal.claims > 0) {
    insights.push({
      id: 'top-deal',
      title: copy.topDeal(data.topDeal.name),
      body: copy.topDealBody(percent(data.topDeal.share), count(data.topDeal.claims)),
    });
  }

  return {
    snapshot: bi.snapshot(data.range.days),
    scope: bi.branchScope(data.branchCount),
    revenue: {
      value: naira(data.revenue.current),
      note: copy.revenuePrevious(naira(data.revenue.previous)),
      delta: deltaView(data.revenue),
    },
    orders: {
      value: count(data.orders.current),
      note: copy.ordersNote(naira(data.averageOrderValue.current)),
    },
    interactions: {
      value: count(data.interactions.current),
      note: copy.interactionsNote,
    },
    activityTotal: count(
      data.activity.claims +
        data.activity.visits +
        data.activity.newCustomers +
        data.activity.returningCustomers,
    ),
    activity: [
      { id: 'views', label: copy.activity.views, value: count(data.activity.dealViews) },
      { id: 'new', label: copy.activity.new, value: count(data.activity.newCustomers) },
      {
        id: 'returning',
        label: copy.activity.returning,
        value: count(data.activity.returningCustomers),
      },
      { id: 'claims', label: copy.activity.claims, value: count(data.activity.claims) },
      {
        id: 'checkins',
        label: copy.activity.checkins,
        value: count(data.activity.visits),
      },
    ],
    trend: {
      labels: trendLabels,
      series,
      peak: {
        Revenue: peakOf(series.Revenue, value => formatCompactNaira(value)),
        Orders: peakOf(series.Orders, count),
        Visits: peakOf(series.Visits, count),
        Customers: peakOf(series.Customers, count),
      },
    },
    retention: [
      {
        id: 'new',
        label: copy.retentionNew,
        value: percent(activeCustomers ? data.customers.new / activeCustomers : 0),
        percent: relative(data.customers.new, activeCustomers),
      },
      {
        id: 'returning',
        label: copy.retentionReturning,
        value: percent(activeCustomers ? data.customers.returning / activeCustomers : 0),
        percent: relative(data.customers.returning, activeCustomers),
      },
    ],
    repeatRate: copy.repeatRate(percent(data.customers.repeatRate)),
    sourcesSubtitle: copy.sourceSubtitle(count(sourceTotal)),
    sources: data.sources.map(row => ({
      id: row.id,
      label: sourceLabels[row.id] ?? titleCase(row.id),
      value: count(row.count),
      percent: relative(row.count, sourceTotal),
    })),
    insights,
    isEmpty: data.orders.current === 0 && data.interactions.current === 0,
  };
}

/* -------------------------------------------------------------------------- */
/* Business performance                                                       */
/* -------------------------------------------------------------------------- */

export interface MetricCellView {
  label: string;
  value: string;
  note: string;
  direction: DeltaView['direction'];
  icon: IconName;
}

export interface PerformanceView {
  metrics: MetricCellView[];
  revenueSeries: { label: string; value: number; previous: number; amount: string }[];
  channels: CompareRowView[];
  topItems: { id: string; name: string; meta: string; value: string }[];
  hourly: { label: string; value: number }[];
  team: {
    id: string;
    name: string;
    initials: string;
    role: string;
    trailing: string;
  }[];
}

export function toPerformanceView(data: AnalyticsOverview): PerformanceView {
  const copy = strings.businessAnalyticsPerformance;
  const metric = (
    label: string,
    value: string,
    comparison: AnalyticsComparison,
    icon: IconName,
  ): MetricCellView => {
    const delta = deltaView(comparison);
    return { label, value, note: delta.label, direction: delta.direction, icon };
  };
  const buckets = Math.min(7, data.series.length);
  const current = bucketSeries(data.series, buckets, point => point.revenue);
  const previous = bucketSeries(data.series, buckets, point => point.previousRevenue);
  const channelTotal = data.channels.reduce((sum, row) => sum + row.revenue, 0);
  const channelLabel: Record<string, string> = {
    pos: copy.channelPos,
    orders: copy.channelOrders,
  };
  // Opening hours only: two-hour slots from 8am to 10pm.
  const hourly = [];
  for (let hour = 8; hour < 22; hour += 2) {
    const value = data.hourly
      .filter(slot => slot.hour === hour || slot.hour === hour + 1)
      .reduce((sum, slot) => sum + slot.orders, 0);
    hourly.push({ label: shortHour(hour), value });
  }

  return {
    metrics: [
      metric(copy.revenueLabel, naira(data.revenue.current), data.revenue, 'payments'),
      metric(copy.ordersLabel, count(data.orders.current), data.orders, 'receipt'),
      metric(
        copy.aovLabel,
        naira(data.averageOrderValue.current),
        data.averageOrderValue,
        'shoppingBag',
      ),
      metric(
        copy.redemptionLabel,
        count(data.activity.redemptions),
        { current: data.activity.redemptions, previous: 0 },
        'redeem',
      ),
    ],
    revenueSeries: current.map((value, index) => ({
      label: `${index + 1}`,
      value,
      previous: previous[index] ?? 0,
      amount: formatCompactNaira(value),
    })),
    channels: data.channels.map(row => ({
      id: row.id,
      label: channelLabel[row.id] ?? titleCase(row.id),
      value: naira(row.revenue),
      percent: relative(row.revenue, channelTotal),
    })),
    topItems: data.topItems.map((item, index) => ({
      id: `${index}-${item.name}`,
      name: item.name,
      meta: copy.itemMeta(count(item.quantity), percent(item.dealShare)),
      value: naira(item.revenue),
    })),
    hourly,
    team: data.team.map(member => ({
      id: member.userId,
      name: member.name || copy.staffFallbackRole,
      initials: initials(member.name || copy.staffFallbackRole),
      role: member.role ? titleCase(member.role) : copy.staffFallbackRole,
      trailing: `${count(member.tickets)} · ${naira(member.sales)}`,
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* Customers                                                                  */
/* -------------------------------------------------------------------------- */

export interface CustomerIntelligenceView {
  metrics: MetricCellView[];
  segments: { id: string; name: string; count: string; share: string; icon: IconName }[];
  topCustomers: {
    id: string;
    name: string;
    initials: string;
    visits: string;
    spend: string;
    tier: string;
    tierTone: 'brand' | 'tertiary' | 'neutral';
  }[];
  heatmap: HeatmapView;
  growth: { label: string; newValue: number; returningValue: number }[];
  insights: {
    id: 'loyalty' | 'churn';
    title: string;
    body: string;
    cta: string;
    icon: IconName;
  }[];
}

const SEGMENT_ICON: Record<string, IconName> = {
  vip: 'starFilled',
  regular: 'crown',
  new: 'personAdd',
  lapsed: 'alert',
};

const tierTone = (tier: string): 'brand' | 'tertiary' | 'neutral' => {
  const key = tier.toLowerCase();
  if (key === 'platinum' || key === 'diamond') return 'brand';
  if (key === 'gold') return 'tertiary';
  return 'neutral';
};

export function toCustomerIntelligenceView(
  data: AnalyticsCustomers,
): CustomerIntelligenceView {
  const copy = strings.customerIntelligenceAnalytics;
  const delta = (comparison: AnalyticsComparison) => deltaView(comparison);
  const segmentOrder = ['vip', 'regular', 'new', 'lapsed'] as const;

  const insights: CustomerIntelligenceView['insights'] = [];
  if (data.repeatRate.current > 0) {
    insights.push({
      id: 'loyalty',
      icon: 'crown',
      title: copy.insightLoyalty(percent(data.repeatRate.current)),
      body: copy.insightLoyaltyBody,
      cta: copy.insightLoyaltyCta,
    });
  }
  if (data.segments.lapsed.count > 0) {
    insights.push({
      id: 'churn',
      icon: 'alert',
      title: copy.insightChurn(count(data.segments.lapsed.count)),
      body: copy.insightChurnBody,
      cta: copy.insightChurnCta,
    });
  }

  const total = delta(data.total);
  const repeat = delta(data.repeatRate);
  const dormant = delta(data.dormant);

  return {
    metrics: [
      {
        label: copy.totalCustomersLabel,
        value: count(data.total.current),
        note: total.label,
        direction: total.direction,
        icon: 'group',
      },
      {
        label: copy.repeatRateLabel,
        value: percent(data.repeatRate.current),
        note: repeat.label,
        direction: repeat.direction,
        icon: 'repeatCustomers',
      },
      {
        label: copy.avgSpendLabel,
        value: naira(data.averageSpend),
        note: bi.snapshot(data.range.days),
        direction: 'flat',
        icon: 'payments',
      },
      {
        label: copy.churnRiskLabel,
        value: count(data.dormant.current),
        note: dormant.label,
        // More dormant customers is the bad direction.
        direction:
          dormant.direction === 'up'
            ? 'down'
            : dormant.direction === 'down'
              ? 'up'
              : 'flat',
        icon: 'personPin',
      },
    ],
    segments: segmentOrder.map(id => ({
      id,
      name: copy.segments[id],
      count: copy.segmentCount(count(data.segments[id].count)),
      share: percent(data.segments[id].share),
      icon: SEGMENT_ICON[id],
    })),
    topCustomers: data.topCustomers.map(customer => ({
      id: customer.userId,
      name: customer.name,
      initials: initials(customer.name),
      visits: copy.visits(count(customer.visits)),
      spend: naira(customer.spend),
      tier: customer.tier,
      tierTone: tierTone(customer.tier),
    })),
    heatmap: heatmapView(data.heatmap),
    growth: data.growth.map((week, index) => ({
      label: bi.customers.growthWeek(index + 1),
      newValue: week.new,
      returningValue: week.returning,
    })),
    insights,
  };
}

export interface CustomersAnalyticsView {
  total: { value: string; note: string };
  active: { value: string; note: string };
  newCustomers: string;
  returning: string;
  dormantCount: number;
  inactiveBody: string;
  growth: { id: string; label: string; returning: number; new: number }[];
  growthLegend: [string, string];
  touchpoints: { id: string; label: string; value: string }[];
  channels: CompareRowView[];
  retention: { id: string; label: string; value: string }[];
  frequencyBadge: string;
  frequencyHealthy: boolean;
  segmentsCount: string;
  segments: { id: string; label: string; badge?: string; value: string }[];
}

export function toCustomersAnalyticsView(
  data: AnalyticsCustomers,
): CustomersAnalyticsView {
  const copy = bi.customers;
  const channelTotal = data.acquisition.reduce((sum, row) => sum + row.count, 0);
  const totalNew = data.growth.reduce((sum, week) => sum + week.new, 0);
  const totalReturning = data.growth.reduce((sum, week) => sum + week.returning, 0);
  const healthy = data.visitsPerActiveCustomer >= 2;

  return {
    total: { value: count(data.total.current), note: deltaView(data.total).label },
    active: {
      value: count(data.active.current),
      note: copy.activeNote(
        percent(data.total.current ? data.active.current / data.total.current : 0),
      ),
    },
    newCustomers: count(data.new.current),
    returning: count(data.returning),
    dormantCount: data.dormant.current,
    inactiveBody:
      data.dormant.current > 0
        ? copy.inactiveBody(count(data.dormant.current))
        : copy.inactiveNone,
    growth: data.growth.map((week, index) => ({
      id: week.weekStart,
      label: copy.growthWeek(index + 1),
      returning: week.returning,
      new: week.new,
    })),
    growthLegend: [
      copy.growthReturning(count(totalReturning)),
      copy.growthNew(count(totalNew)),
    ],
    touchpoints: [
      {
        id: 'orders',
        label: copy.touchpoints.orders,
        value: count(data.touchpoints.orders),
      },
      {
        id: 'visits',
        label: copy.touchpoints.visits,
        value: count(data.touchpoints.visits),
      },
      {
        id: 'claims',
        label: copy.touchpoints.claims,
        value: count(data.touchpoints.claims),
      },
      {
        id: 'saves',
        label: copy.touchpoints.saves,
        value: count(data.touchpoints.saves),
      },
      {
        id: 'chats',
        label: copy.touchpoints.chats,
        value: count(data.touchpoints.chats),
      },
      {
        id: 'reviews',
        label: copy.touchpoints.reviews,
        value: count(data.touchpoints.reviews),
      },
      {
        id: 'points',
        label: copy.touchpoints.points,
        value: count(data.touchpoints.pointsIssued),
      },
    ],
    channels: [...data.acquisition]
      .sort((a, b) => b.count - a.count)
      .map(row => ({
        id: row.kind,
        label: copy.channels[row.kind] ?? titleCase(row.kind),
        value: count(row.count),
        percent: relative(row.count, channelTotal),
      })),
    retention: [
      {
        id: 'first',
        label: copy.retention.first,
        value: copy.firstValue(count(data.new.current)),
      },
      {
        id: 'repeat',
        label: copy.retention.repeat,
        value: copy.repeatValue(percent(data.repeatRate.current)),
      },
      {
        id: 'frequency',
        label: copy.retention.frequency,
        value: copy.frequencyValue(String(data.visitsPerActiveCustomer)),
      },
    ],
    frequencyBadge: healthy ? copy.frequencyHealthy : copy.frequencyLow,
    frequencyHealthy: healthy,
    segmentsCount: copy.segmentsCount(4),
    segments: (['vip', 'regular', 'new', 'lapsed'] as const).map(id => ({
      id,
      label: copy.segments[id],
      badge:
        id === 'vip' ? copy.segmentTop : id === 'lapsed' ? copy.segmentChurn : undefined,
      value: copy.segmentValue(
        count(data.segments[id].count),
        naira(data.segments[id].spend),
      ),
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* Deals                                                                      */
/* -------------------------------------------------------------------------- */

export interface DealsAnalyticsView {
  kpis: { id: string; label: string; value: string; note: string }[];
  deals: {
    id: string;
    name: string;
    badge: string | null;
    status: string;
    live: boolean;
    views: string;
    claims: string;
    claimRate: string;
    basket: string;
    opportunities: { label: string; value: string }[];
    belowAverage: boolean;
  }[];
  matrix: { id: string; label: string; basket: string; views: string; claims: string }[];
  funnel: { id: string; label: string; value: string; percent: number }[];
  funnelCompletion: string;
  boost: { name: string; rows: { id: string; label: string; value: string }[] } | null;
}

function dealBadge(deal: AnalyticsDeals['deals'][number]): string | null {
  const copy = bi.deals;
  if (deal.discountValue && /percent/i.test(deal.pricingType ?? '')) {
    return copy.percentOff(String(deal.discountValue));
  }
  if (deal.price != null && deal.price > 0) return naira(deal.price);
  return deal.offerType ? titleCase(deal.offerType) : null;
}

export function toDealsAnalyticsView(
  data: AnalyticsDeals,
  boost?: Promotion | null,
): DealsAnalyticsView {
  const copy = bi.deals;
  const { totals, funnel } = data;
  const claims = deltaView(totals.claims);
  const top = data.deals.slice(0, 3);
  const topViews = top.reduce((sum, deal) => sum + deal.views, 0);
  const topClaims = top.reduce((sum, deal) => sum + deal.claims, 0);
  const funnelMax = Math.max(funnel.views, funnel.saves, funnel.claims, funnel.redeemed);

  return {
    kpis: [
      {
        id: 'views',
        label: copy.kpis.views,
        value: count(totals.views),
        note: copy.viewsNote,
      },
      {
        id: 'claims',
        label: copy.kpis.claims,
        value: count(totals.claims.current),
        note: claims.label,
      },
      {
        id: 'rate',
        label: copy.kpis.rate,
        value: percent(totals.claimRate),
        note: copy.rateNote,
      },
      {
        id: 'pipeline',
        label: copy.kpis.pipeline,
        value: copy.pipelineValue(totals.live),
        note: copy.pipelineNote(totals.ended),
      },
    ],
    deals: data.deals.map(deal => ({
      id: deal.id,
      name: deal.name,
      badge: dealBadge(deal),
      status: deal.live ? copy.liveBadge : copy.endedBadge,
      live: deal.live,
      views: count(deal.views),
      claims: count(deal.claims),
      claimRate: percent(deal.claimRate),
      basket: deal.redeemed ? naira(deal.averageBasket) : '—',
      opportunities: [
        { label: copy.opportunities.views, value: count(deal.views) },
        { label: copy.opportunities.likes, value: count(deal.likes) },
        { label: copy.opportunities.saves, value: count(deal.saves) },
        { label: copy.opportunities.redeemed, value: count(deal.redeemed) },
      ],
      belowAverage:
        deal.views > 0 && totals.claimRate > 0 && deal.claimRate < totals.claimRate / 2,
    })),
    matrix: top.map(deal => ({
      id: deal.id,
      label: deal.name,
      basket: copy.matrixBasket(deal.redeemed ? naira(deal.averageBasket) : '—'),
      views: copy.matrixViews(
        count(deal.views),
        percent(topViews ? deal.views / topViews : 0),
      ),
      claims: copy.matrixClaims(
        count(deal.claims),
        percent(topClaims ? deal.claims / topClaims : 0),
      ),
    })),
    funnel: [
      {
        id: 'views',
        label: copy.funnel.views,
        value: count(funnel.views),
        percent: relative(funnel.views, funnelMax),
      },
      {
        id: 'saves',
        label: copy.funnel.saves,
        value: count(funnel.saves),
        percent: relative(funnel.saves, funnelMax),
      },
      {
        id: 'claims',
        label: copy.funnel.claims,
        value: count(funnel.claims),
        percent: relative(funnel.claims, funnelMax),
      },
      {
        id: 'redeemed',
        label: copy.funnel.redeemed,
        value: count(funnel.redeemed),
        percent: relative(funnel.redeemed, funnelMax),
      },
    ],
    funnelCompletion: copy.funnelCompletion(
      percent(funnel.claims ? funnel.redeemed / funnel.claims : 0),
    ),
    boost: boost
      ? {
          name: boost.name,
          rows: [
            { id: 'name', label: copy.boost.name, value: boost.name },
            { id: 'spent', label: copy.boost.spent, value: naira(boost.spent) },
            {
              id: 'remaining',
              label: copy.boost.remaining,
              value: naira(boost.remaining),
            },
            {
              id: 'reach',
              label: copy.boost.reach,
              value: count(boost.impressions ?? 0),
            },
            { id: 'clicks', label: copy.boost.clicks, value: count(boost.clicks ?? 0) },
            {
              id: 'claims',
              label: copy.boost.claims,
              value: count(boost.conversions ?? 0),
            },
          ],
        }
      : null,
  };
}

/* -------------------------------------------------------------------------- */
/* POS                                                                        */
/* -------------------------------------------------------------------------- */

export interface PosAnalyticsView {
  syncMeta: string;
  kpis: { id: string; label: string; value: string; note: string }[];
  rhythm: { id: string; label: string; value: number; badge?: string }[];
  peaks: string[];
  tenders: CompareRowView[];
  tenderRows: { id: string; label: string; amount: string; value: string }[];
  items: { id: string; name: string; sold: string; amount: string }[];
  cashiers: { id: string; name: string; till: string | undefined; value: string }[];
  isEmpty: boolean;
}

export function toPosAnalyticsView(data: AnalyticsPos): PosAnalyticsView {
  const copy = bi.pos;
  const ticketsChange = data.tickets.current - data.tickets.previous;
  const open = data.hourly.filter(slot => slot.hour >= 8 && slot.hour <= 23);
  const ranked = [...data.hourly]
    .filter(slot => slot.sales > 0)
    .sort((a, b) => b.sales - a.sales);
  const peakHours = new Set(ranked.slice(0, 2).map(slot => slot.hour));
  const tenderTotal = data.tenders.reduce((sum, row) => sum + row.amount, 0);
  const tenderLabel = (method: string) => copy.tenders[method] ?? titleCase(method);

  return {
    syncMeta: copy.syncMeta(data.drawer.sessions),
    kpis: [
      {
        id: 'sales',
        label: copy.kpis.sales,
        value: naira(data.sales.current),
        note: deltaView(data.sales).label,
      },
      {
        id: 'tickets',
        label: copy.kpis.tickets,
        value: count(data.tickets.current),
        note: copy.ticketsDelta(`${ticketsChange > 0 ? '+' : ''}${count(ticketsChange)}`),
      },
      {
        id: 'aov',
        label: copy.kpis.aov,
        value: naira(data.averageTicket.current),
        note: deltaView(data.averageTicket).label,
      },
      {
        id: 'items',
        label: copy.kpis.items,
        value: count(data.itemsSold),
        note: copy.itemsNote(String(data.itemsPerTicket)),
      },
      {
        id: 'refunds',
        label: copy.kpis.refunds,
        value: copy.refundsValue(data.refunds.count),
        note: copy.refundsNote(percent(data.refunds.rate)),
      },
      {
        id: 'variance',
        label: copy.kpis.variance,
        value: naira(data.drawer.variance),
        note: copy.varianceNote(data.drawer.countedSessions, data.drawer.sessions),
      },
    ],
    rhythm: open.map(slot => ({
      id: String(slot.hour),
      label: shortHour(slot.hour),
      value: slot.sales,
      badge: peakHours.has(slot.hour) ? copy.peakBadge : undefined,
    })),
    peaks: ranked
      .slice(0, 2)
      .map((slot, index) =>
        copy.peak(index + 1, hourLabel(slot.hour), formatCompactNaira(slot.sales)),
      ),
    tenders: data.tenders.map(row => ({
      id: row.method,
      label: tenderLabel(row.method),
      value: percent(row.share),
      percent: relative(row.amount, tenderTotal),
    })),
    tenderRows: data.tenders.map(row => ({
      id: row.method,
      label: tenderLabel(row.method),
      amount: naira(row.amount),
      value: copy.tenderCount(count(row.count)),
    })),
    items: data.topItems.map((item, index) => ({
      id: `${index}-${item.name}`,
      name: item.name,
      sold: copy.itemsSold(count(item.quantity)),
      amount: naira(item.revenue),
    })),
    cashiers: data.cashiers.map(cashier => ({
      id: cashier.userId,
      name: cashier.name || titleCase(cashier.role ?? ''),
      till: cashier.tillName ?? undefined,
      value: copy.auditValue(
        count(cashier.tickets),
        naira(cashier.sales),
        minutesLabel(cashier.activeMinutes),
      ),
    })),
    isEmpty: data.tickets.current === 0 && data.refunds.count === 0,
  };
}

/* -------------------------------------------------------------------------- */
/* Locations and branch comparison                                            */
/* -------------------------------------------------------------------------- */

export interface LocationsAnalyticsView {
  scopes: { id: string | null; label: string }[];
  network: { value: string; note: string };
  ribbon: { id: string; label: string; value: string; icon: IconName }[];
  share: CompareRowView[];
  scorecards: {
    id: string;
    name: string;
    meta: string;
    badge: string | null;
    share: string;
    revenue: string;
    metrics: { id: string; label: string; value: string }[];
  }[];
  channels: CompareRowView[];
  heatmap: HeatmapView;
  insights: { id: 'busiest' | 'quiet'; title: string; body: string }[];
}

export function toLocationsAnalyticsView(
  data: AnalyticsLocations,
): LocationsAnalyticsView {
  const copy = bi.locations;
  const fastest = [...data.branches]
    .map(branch => ({ id: branch.branchId, change: changeRatio(branch.revenue) }))
    .filter(entry => entry.change !== null && entry.change > 0)
    .sort((a, b) => (b.change ?? 0) - (a.change ?? 0))[0];
  const heatmap = heatmapView(data.heatmap);
  const { busiest, quietest } = heatmap;

  const channels: CompareRowView[] = [];
  data.branches.forEach(branch => {
    const total = branch.posTickets + branch.onlineOrders + branch.claims;
    if (!total) return;
    (
      [
        ['pos', branch.posTickets],
        ['online', branch.onlineOrders],
        ['claims', branch.claims],
      ] as const
    ).forEach(([key, value]) => {
      if (!value) return;
      channels.push({
        id: `${branch.branchId}-${key}`,
        label: copy.channel(branch.name, copy.channelNames[key]),
        value: percent(value / total),
        percent: Math.round((value / total) * 100),
      });
    });
  });

  return {
    scopes: [
      { id: null, label: copy.allBranches(data.totals.branches) },
      ...data.branches.map(branch => ({ id: branch.branchId, label: branch.name })),
    ],
    network: {
      value: naira(data.totals.revenue.current),
      note: deltaView(data.totals.revenue).label,
    },
    ribbon: [
      {
        id: 'outlets',
        label: copy.ribbon.outlets,
        value: count(data.totals.branches),
        icon: 'storefront',
      },
      {
        id: 'orders',
        label: copy.ribbon.orders,
        value: count(data.totals.orders),
        icon: 'receipt',
      },
      {
        id: 'views',
        label: copy.ribbon.views,
        value: count(data.totals.dealViews),
        icon: 'visibility',
      },
    ],
    share: data.branches.map(branch => ({
      id: branch.branchId,
      label: branch.name,
      value: naira(branch.revenue.current),
      percent: Math.round(branch.revenueShare * 100),
    })),
    scorecards: data.branches.map((branch, index) => ({
      id: branch.branchId,
      name: branch.name,
      meta: [
        branch.isMainBranch ? copy.mainBranch : null,
        branch.isActive ? null : copy.inactive,
        branch.address,
      ]
        .filter(Boolean)
        .join(' · '),
      badge:
        index === 0 && branch.revenue.current > 0
          ? copy.badges.top
          : fastest?.id === branch.branchId
            ? copy.badges.fastest
            : null,
      share: copy.share(percent(branch.revenueShare)),
      revenue: naira(branch.revenue.current),
      metrics: [
        { id: 'visits', label: copy.metrics.visits, value: count(branch.visits) },
        { id: 'claims', label: copy.metrics.claims, value: count(branch.claims) },
        { id: 'pos', label: copy.metrics.pos, value: count(branch.posTickets) },
      ],
    })),
    channels,
    heatmap,
    insights: [
      ...(busiest
        ? [
            {
              id: 'busiest' as const,
              title: copy.busiestTitle,
              body: copy.busiestBody(busiest.day, busiest.daypart, count(busiest.count)),
            },
          ]
        : []),
      ...(quietest && busiest && quietest.count < busiest.count
        ? [
            {
              id: 'quiet' as const,
              title: copy.quietTitle,
              body: copy.quietBody(quietest.day, quietest.daypart),
            },
          ]
        : []),
    ],
  };
}

export type BranchStatus = 'best' | 'steady' | 'watch';

export interface BranchComparisonView {
  count: string;
  best: { name: string; revenue: string } | null;
  watch: { name: string; revenue: string } | null;
  branches: {
    id: string;
    name: string;
    code: string;
    revenue: string;
    orders: string;
    aov: string;
    rating: number;
    percentOfBest: number;
    status: BranchStatus;
    note: string;
  }[];
}

function branchNote(branch: AnalyticsBranch): string {
  const copy = strings.locationsBranchComparison;
  if (branch.revenue.current === 0) return copy.noteNone;
  const change = changeRatio(branch.revenue);
  if (change === null) return copy.noteNew;
  if (Math.abs(change) < 0.005) return copy.noteFlat;
  return change > 0 ? copy.noteUp(percent(change)) : copy.noteDown(percent(-change));
}

export function toBranchComparisonView(data: AnalyticsLocations): BranchComparisonView {
  const rows = data.branches;
  const multi = rows.length > 1;
  const statusOf = (branch: AnalyticsBranch, index: number): BranchStatus => {
    if (multi && index === 0 && branch.revenue.current > 0) return 'best';
    const change = changeRatio(branch.revenue);
    if (
      multi &&
      (branch.percentOfBest < 50 ||
        (change !== null && change <= -0.1) ||
        branch.revenue.current === 0)
    ) {
      return 'watch';
    }
    return 'steady';
  };
  const branches = rows.map((branch, index) => ({
    id: branch.branchId,
    name: branch.name,
    code: branch.code ?? '',
    revenue: naira(branch.revenue.current),
    orders: count(branch.orders.current),
    aov: naira(branch.averageOrderValue),
    rating: branch.rating ?? 0,
    percentOfBest: branch.percentOfBest,
    status: statusOf(branch, index),
    note: branchNote(branch),
  }));
  const best = branches.find(branch => branch.status === 'best');
  const watch = [...branches].reverse().find(branch => branch.status === 'watch');
  return {
    count: count(rows.length),
    best: best ? { name: best.name, revenue: best.revenue } : null,
    watch: watch ? { name: watch.name, revenue: watch.revenue } : null,
    branches,
  };
}

/* -------------------------------------------------------------------------- */
/* Export scope                                                               */
/* -------------------------------------------------------------------------- */

/** `1 Oct – 30 Oct 2026` for an exclusive `to`. */
export function rangeLabel(from: string, to: string): string {
  const start = new Date(from);
  const end = new Date(new Date(to).getTime() - 1);
  const day = (date: Date, withYear: boolean) =>
    date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      ...(withYear ? { year: 'numeric' } : {}),
    });
  const sameDay = start.toDateString() === end.toDateString();
  return sameDay ? day(start, true) : `${day(start, false)} – ${day(end, true)}`;
}

export function rangeDays(from: string, to: string): number {
  return Math.max(
    1,
    Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000),
  );
}
