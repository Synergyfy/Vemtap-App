import { strings } from '@constants/strings';
import type { Promotion, PromotionStats } from '@api/promotionsApi';

/**
 * Boost / campaign performance (`/{boosts,promotions}/:id` + `/stats`) in the
 * shape BoostPerformanceScreen renders. The same view also carries the
 * design's sample figures, so the screen has one rendering path.
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
  /** Views bars are only in the sample; the API reports claims per hour. */
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
  canPause: boolean;
  canResume: boolean;
  canEnd: boolean;
  endLabel: string;
  endedNote?: string;
}

/** The design's sample campaign. */
export const prototypePerformanceView: PerformanceView = {
  backLabel: perf.backToHub,
  headerSub: perf.headerSub,
  badge: perf.dealBadge,
  idLabel: perf.dealId,
  name: perf.dealName,
  sub: perf.dealSub,
  banner: perf.liveBanner,
  pulseEyebrow: perf.pulseEyebrow,
  kpis: {
    spend: perf.kpis[0],
    redemptions: perf.kpis[1],
    reach: perf.kpis[2],
    cost: perf.kpis[3],
  },
  funnel: perf.funnel,
  funnelCaption: perf.funnelCaption,
  attributionTitle: perf.attributionTitle,
  attributionBody: perf.attributionBody,
  rhythmSubtitle: perf.rhythmSubtitle,
  showViews: true,
  rhythm: perf.rhythm,
  peak: {
    index: 2,
    tag: perf.rhythm[2].peak,
    title: perf.peakTitle,
    body: perf.peakBody,
    value: perf.peakValue,
  },
  geoTitle: perf.geoTitle,
  geoSubtitle: perf.geoSubtitle,
  geo: perf.geo,
  canAddBudget: true,
  canPause: true,
  canResume: false,
  canEnd: true,
  endLabel: perf.endCta,
};

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

/** Claims per hour folded into the six 4-hour slots the chart shows. */
function rhythmSlots(rhythm: PromotionStats['rhythm']) {
  const totals = liveCopy.rhythmSlots.map(() => 0);
  for (const { hour, claims } of rhythm) {
    const slot = Math.min(5, Math.max(0, Math.floor(hour / 4)));
    totals[slot] += claims;
  }
  const max = Math.max(0, ...totals);
  return { totals, max };
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

  const { totals, max } = rhythmSlots(stats.rhythm);
  const totalClaims = totals.reduce((sum, value) => sum + value, 0);
  const peakIndex = max > 0 ? totals.indexOf(max) : -1;

  const branchClaims = stats.byBranch.reduce((sum, branch) => sum + branch.claims, 0);
  const { status } = promotion;
  const launched = Boolean(promotion.launchedAt);

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
      },
      cost: {
        label: liveCopy.costPerClaim,
        value: claims > 0 ? naira(kpis.spent / claims) : '—',
        sub:
          kpis.returnOnSpend !== null && kpis.returnOnSpend !== undefined
            ? liveCopy.returnOnSpend(kpis.returnOnSpend.toFixed(1))
            : liveCopy.noClaimsYet,
      },
    },
    funnel,
    funnelCaption:
      claims > 0 ? liveCopy.funnelCaption(`${percentOf(redeemed, claims)}%`) : undefined,
    attributionTitle: liveCopy.attributionTitle,
    attributionBody: liveCopy.attributionBody,
    rhythmSubtitle: liveCopy.rhythmSubtitle,
    showViews: false,
    rhythm: liveCopy.rhythmSlots.map((label, index) => ({
      id: `slot-${index}`,
      label,
      views: 0,
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
    // A launched campaign's budget is fixed server-side; there is nothing to add to.
    canAddBudget: false,
    canPause: status === 'Active',
    canResume: status === 'Paused',
    canEnd: launched && status !== 'Ended',
    endLabel: liveCopy.endCta(naira(kpis.left)),
    endedNote: status === 'Ended' ? liveCopy.endedNote : undefined,
  };
}
