import { strings } from '@constants/strings';
import type { Promotion, PromotionStats } from '@api/promotionsApi';

/**
 * Boost / campaign performance (`/{boosts,promotions}/:id` + `/stats`) in the
 * shape BoostPerformanceScreen renders.
 */

const perf = strings.boostWizard.performance;
const liveCopy = perf.live;

export interface PerformanceKpis {
  spend: {
    label: string;
    value: string;
    sub: string;
    percent: number;
    consumed: string;
    left: string;
  };
  redemptions: {
    label: string;
    value: string;
    sub: string;
    boxLabel: string;
    boxValue: string;
  };
  reach: { label: string; value: string; sub: string; delta?: string };
  cost: { label: string; value: string; sub: string; badge?: string };
}

export interface PerformanceView {
  backLabel: string;
  headerSub: string;
  badge: string;
  idLabel: string;
  name: string;
  sub: string;
  banner: string;
  pulseEyebrow: string;
  kpis: PerformanceKpis;
  funnel: readonly {
    id: string;
    label: string;
    value: string;
    percent: string;
    fill: number;
    verified?: boolean;
  }[];
  funnelCaption?: string;
  attributionTitle: string;
  attributionBody: string;
  rhythmSubtitle: string;
  /** Whether the rhythm carries views as well as claims per hour. */
  showViews: boolean;
  rhythm: readonly { id: string; label: string; views: number; claims: number }[];
  peak?: { index: number; tag: string; title: string; body: string; value: string };
  geoTitle: string;
  geoSubtitle: string;
  geo: readonly {
    id: string;
    name: string;
    meta?: string;
    percent: string;
    diners: string;
    note: string;
  }[];
  /** Live actions the campaign's status allows. */
  canAddBudget: boolean;
  /** Live: the ₦ amount the Add Budget button adds, and its label. */
  addBudgetAmount?: number;
  addBudgetLabel?: string;
  canPause: boolean;
  canResume: boolean;
  canEnd: boolean;
  endLabel: string;
  endedNote?: string;
}

/** Add Budget extends the run by this many days at its current daily spend. */
export const ADD_BUDGET_DAYS = 2;
/** The API's smallest budget (`MIN_CAMPAIGN_BUDGET`). */
const MIN_ADD_BUDGET = 2_000;
/** The API's longest run (`MAX_RUN_DAYS`). */
const MAX_RUN_DAYS = 90;

/**
 * What "Add Budget" adds: two more days at the run's current daily spend
 * (the API moves the end date out by amount ÷ daily spend). Undefined when
 * the run has no dates or budget, or the extra days would pass 90 days.
 */
export function budgetTopUp(
  promotion: Pick<Promotion, 'budget' | 'startDate' | 'endDate'>,
): { amount: number; days: number } | undefined {
  if (!promotion.startDate || !promotion.endDate) return undefined;
  const runDays =
    (Date.parse(promotion.endDate) - Date.parse(promotion.startDate)) / DAY_MS;
  const budget = Number(promotion.budget) || 0;
  if (!(runDays > 0) || budget <= 0) return undefined;
  const daily = budget / runDays;
  const amount = Math.max(MIN_ADD_BUDGET, Math.round(daily * ADD_BUDGET_DAYS));
  const days = Math.max(1, Math.round(amount / daily));
  if (runDays + amount / daily > MAX_RUN_DAYS) return undefined;
  return { amount, days };
}

function naira(value: number): string {
  return `₦${Math.round(value).toLocaleString('en-NG')}`;
}

function count(value: number): string {
  return value.toLocaleString('en-NG');
}

function percentOf(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

const DAY_MS = 86_400_000;

function bannerFor(promotion: Promotion, now: number): string {
  const { banner } = liveCopy;
  switch (promotion.status) {
    case 'Active': {
      if (!promotion.startDate || !promotion.endDate) return banner.activeOpen;
      const start = new Date(promotion.startDate).getTime();
      const end = new Date(promotion.endDate).getTime();
      const days = Math.max(1, Math.round((end - start) / DAY_MS));
      const day = Math.min(days, Math.max(1, Math.floor((now - start) / DAY_MS) + 1));
      const left = Math.max(0, Math.ceil((end - now) / DAY_MS));
      return banner.active(day, days, left, shortDate(promotion.endDate));
    }
    case 'Pending':
      return promotion.awaitingPayment || !promotion.startDate
        ? banner.awaitingPayment
        : banner.pending(shortDate(promotion.startDate));
    case 'Paused':
      return banner.paused;
    case 'Draft':
      return banner.draft;
    default:
      return banner.ended(promotion.endDate ? shortDate(promotion.endDate) : '');
  }
}

/** Claims and views per hour folded into the six 4-hour slots the chart shows. */
function rhythmSlots(rhythm: PromotionStats['rhythm']) {
  const totals = liveCopy.rhythmSlots.map(() => 0);
  const views = liveCopy.rhythmSlots.map(() => 0);
  for (const entry of rhythm) {
    const slot = Math.min(5, Math.max(0, Math.floor(entry.hour / 4)));
    totals[slot] += entry.claims;
    views[slot] += entry.views ?? 0;
  }
  const max = Math.max(0, ...totals);
  const maxViews = Math.max(0, ...views);
  return { totals, max, views, maxViews };
}

/** "+14.2%" / "−8%": the change from `before` to `now`, one decimal. */
function signedChange(now: number, before: number): string {
  const change = Math.round(((now - before) / before) * 1000) / 10;
  return `${change >= 0 ? '+' : '\u2212'}${Math.abs(change)}%`;
}

export function statsToPerformanceView(
  kind: 'boost' | 'promotion',
  promotion: Promotion,
  stats: PromotionStats,
  now: number = Date.now(),
): PerformanceView {
  const { kpis } = stats;
  const stage = (id: string) => stats.funnel.find(entry => entry.id === id)?.value ?? 0;
  const impressions = stage('impressions');
  const claims = stage('claims');
  const redeemed = stage('redeemed');

  const funnel = stats.funnel.map(entry => {
    const verified = entry.id === 'redeemed';
    // The redeemed stage is a share of claims (walk-in rate); the rest of reach.
    const share = verified
      ? percentOf(entry.value, claims)
      : percentOf(entry.value, impressions);
    return {
      id: entry.id,
      label: entry.label,
      value: count(entry.value),
      percent: `${share}%`,
      fill: verified ? share : impressions > 0 ? Math.min(100, share) : 0,
      verified: verified || undefined,
    };
  });

  const { totals, max, views, maxViews } = rhythmSlots(stats.rhythm);
  const costPerClaim = claims > 0 ? kpis.spent / claims : null;
  const benchmark = stats.benchmark?.costPerClaim;
  // Against the platform average: positive = cheaper.
  const versusBenchmark =
    costPerClaim !== null && benchmark
      ? Math.round(((benchmark - costPerClaim) / benchmark) * 100)
      : null;
  const totalClaims = totals.reduce((sum, value) => sum + value, 0);
  const peakIndex = max > 0 ? totals.indexOf(max) : -1;

  const branchClaims = stats.byBranch.reduce((sum, branch) => sum + branch.claims, 0);
  const { status } = promotion;
  const launched = Boolean(promotion.launchedAt);
  const topUp = budgetTopUp(promotion);

  return {
    backLabel: kind === 'boost' ? liveCopy.backToBoosts : liveCopy.backToCampaigns,
    headerSub: liveCopy.headerSub,
    badge: kind === 'boost' ? liveCopy.boostBadge : liveCopy.campaignBadge,
    idLabel: liveCopy.idLabel(promotion.id),
    name: promotion.name,
    sub: strings.campaignsHub.live.status[
      (
        {
          Active: 'active',
          Pending: 'scheduled',
          Paused: 'paused',
          Draft: 'draft',
          Ended: 'ended',
        } as const
      )[status]
    ],
    banner: bannerFor(promotion, now),
    pulseEyebrow: liveCopy.pulseEyebrow,
    kpis: {
      spend: {
        label: perf.kpis[0].label,
        value: naira(kpis.spent),
        sub: liveCopy.budget(naira(kpis.budget)),
        percent: kpis.percentConsumed,
        consumed: liveCopy.consumed(kpis.percentConsumed),
        left: liveCopy.left(naira(kpis.left)),
      },
      redemptions: {
        label: perf.kpis[1].label,
        value: count(kpis.redemptions),
        sub: liveCopy.redemptionsSub,
        boxLabel: perf.kpis[1].boxLabel,
        boxValue: naira(kpis.grossRevenue),
      },
      reach: {
        label: perf.kpis[2].label,
        value: count(kpis.reach),
        sub: liveCopy.reachSub,
        // Only against a run that was measured (reach before events was 0).
        delta:
          stats.previous && stats.previous.reach > 0
            ? liveCopy.reachDelta(signedChange(kpis.reach, stats.previous.reach))
            : undefined,
      },
      cost: {
        label: liveCopy.costPerClaim,
        value: claims > 0 ? naira(kpis.spent / claims) : '—',
        sub:
          benchmark && costPerClaim !== null
            ? liveCopy.benchmark(naira(benchmark))
            : kpis.returnOnSpend !== null && kpis.returnOnSpend !== undefined
              ? liveCopy.returnOnSpend(kpis.returnOnSpend.toFixed(1))
              : liveCopy.noClaimsYet,
        badge:
          versusBenchmark === null || versusBenchmark === 0
            ? undefined
            : versusBenchmark > 0
              ? liveCopy.cheaper(versusBenchmark)
              : liveCopy.pricier(-versusBenchmark),
      },
    },
    funnel,
    funnelCaption:
      claims > 0 ? liveCopy.funnelCaption(`${percentOf(redeemed, claims)}%`) : undefined,
    attributionTitle: liveCopy.attributionTitle,
    attributionBody: liveCopy.attributionBody,
    // With views recorded the chart is the design's views-vs-claims one.
    rhythmSubtitle: maxViews > 0 ? perf.rhythmSubtitle : liveCopy.rhythmSubtitle,
    showViews: maxViews > 0,
    rhythm: liveCopy.rhythmSlots.map((label, index) => ({
      id: `slot-${index}`,
      label,
      views: maxViews > 0 ? Math.round((views[index] / maxViews) * 100) : 0,
      claims: max > 0 ? Math.round((totals[index] / max) * 100) : 0,
    })),
    peak:
      peakIndex >= 0
        ? {
            index: peakIndex,
            tag: liveCopy.peakTag,
            title: liveCopy.peakTitle(liveCopy.rhythmSlots[peakIndex]),
            body: liveCopy.peakBody(totals[peakIndex]),
            value: `${percentOf(totals[peakIndex], totalClaims)}%`,
          }
        : undefined,
    geoTitle: liveCopy.geoTitle,
    geoSubtitle: liveCopy.geoSubtitle,
    geo: stats.byBranch.map(branch => ({
      id: branch.branchId,
      name: branch.name,
      percent: `${Math.round(percentOf(branch.claims, branchClaims))}%`,
      diners: liveCopy.geoClaims(branch.claims),
      note: '',
    })),
    canAddBudget:
      launched && (status === 'Active' || status === 'Paused') && Boolean(topUp),
    addBudgetAmount: topUp?.amount,
    addBudgetLabel: topUp
      ? liveCopy.addBudget(naira(topUp.amount), topUp.days)
      : undefined,
    canPause: status === 'Active',
    canResume: status === 'Paused',
    canEnd: launched && status !== 'Ended',
    endLabel: liveCopy.endCta(naira(kpis.left)),
    endedNote: status === 'Ended' ? liveCopy.endedNote : undefined,
  };
}
