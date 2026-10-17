import type {
  CustomerCard,
  CustomerDirectory,
  CustomerDossier,
  CustomerSegmentFilter,
} from '@api/businessCustomersApi';
import type { IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';
import { formatShortDate, formatWhen } from '@utils/formatters';
import { count, naira, percent } from './analyticsMappers';
import { initials } from './posMappers';

const crm = strings.customerCrm;
const dossierCopy = strings.customerDossier;

type Tone = 'brand' | 'success' | 'tertiary' | 'warning' | 'neutral';

const SEGMENT_TONE: Record<string, Tone> = {
  frequent: 'brand',
  returning: 'success',
  new: 'warning',
  inactive: 'neutral',
  occasional: 'tertiary',
};

const INTERACTION_ICON: Record<string, IconName> = {
  pos: 'pointOfSale',
  order: 'receipt',
  visit: 'schedule',
  booking: 'reservation',
  claim: 'localOffer',
  chat: 'message',
};

export interface CustomerRowView {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
  segment: string;
  segmentTone: Tone;
  contact: string;
  stats: { value: string; label: string }[];
  firstSeen: string;
  lastSeen: string;
  context: string;
  contextTone: 'default' | 'success';
  icon: IconName;
}

export function toCustomerRow(card: CustomerCard): CustomerRowView {
  const segment = crm.segments[card.segment] ?? crm.segments.occasional;
  const contact = [card.phone, card.email].filter(Boolean).join(' · ');
  const interaction = crm.interaction[card.lastInteraction.kind];
  return {
    id: card.userId,
    name: card.name,
    initials: initials(card.name),
    avatarUrl: card.avatarUrl,
    segment: crm.segmentLine(segment, card.tier),
    segmentTone: SEGMENT_TONE[card.segment] ?? 'neutral',
    contact: contact || crm.noContact,
    stats: [
      { value: count(card.visits), label: crm.stats.visits },
      { value: count(card.orders), label: crm.stats.orders },
      { value: count(card.claims), label: crm.stats.deals },
      { value: count(card.pointsBalance), label: crm.stats.points },
    ],
    firstSeen: crm.firstSeen(formatShortDate(card.firstSeenAt)),
    lastSeen: crm.lastSeen(formatWhen(card.lastSeenAt)),
    context: interaction ? interaction(card.lastInteraction.reference ?? '') : '',
    contextTone: card.lastInteraction.kind === 'claim' ? 'success' : 'default',
    icon: INTERACTION_ICON[card.lastInteraction.kind] ?? 'schedule',
  };
}

export interface CustomerDirectoryView {
  rows: CustomerRowView[];
  total: number;
  showing: string;
  filters: { key: CustomerSegmentFilter; label: string; count: string }[];
  insightTitle: string;
  insightBody: string;
}

export function toCustomerDirectoryView(
  pages: readonly CustomerDirectory[],
): CustomerDirectoryView {
  const first = pages[0];
  const rows = pages.flatMap(page => page.data.map(toCustomerRow));
  const counts = first?.meta.segmentCounts;
  const insight = first?.meta.insight;
  const total = first?.total ?? 0;
  return {
    rows,
    total,
    showing: crm.showingLabel(count(rows.length), count(total)),
    filters: crm.filters.map(filter => ({
      key: filter.key,
      label: filter.label,
      count: count(counts?.[filter.key] ?? 0),
    })),
    insightTitle:
      insight && insight.frequentCustomers > 0
        ? crm.insightsTitle(
            count(insight.frequentCustomers),
            percent(insight.frequentSpendShare),
          )
        : crm.insightsEmpty,
    insightBody: insight ? crm.insightsBody(count(insight.dormant)) : '',
  };
}

export interface CustomerDossierView {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
  tierLine: string;
  code: string;
  phone: string | null;
  email: string | null;
  preferred: string;
  metrics: { label: string; figure: string; sub: string; icon: IconName }[];
  firstInteraction: string;
  latestInteraction: string;
  purchases: {
    id: string;
    title: string;
    badge: string;
    items: string;
    amount: string;
    when: string;
  }[];
  claims: {
    id: string;
    title: string;
    status: string;
    tone: 'brand' | 'success' | 'neutral';
    code: string;
    saved: string | null;
    where: string;
  }[];
  ledger: { id: string; text: string; when: string; positive: boolean }[];
  note: { body: string; author: string; tags: string[] } | null;
}

export function toCustomerDossierView(dossier: CustomerDossier): CustomerDossierView {
  const kind = (value: string) => dossierCopy.interactionKinds[value] ?? value;
  const segment = crm.segments[dossier.segment] ?? crm.segments.occasional;
  const latestRef = dossier.lastInteraction.reference;
  return {
    id: dossier.userId,
    name: dossier.name,
    initials: initials(dossier.name),
    avatarUrl: dossier.avatarUrl,
    tierLine: dossierCopy.tierLine(segment, dossier.tier),
    code: dossier.userId.slice(0, 8).toUpperCase(),
    phone: dossier.phone,
    email: dossier.email,
    preferred: dossier.preferredBranch
      ? `${dossierCopy.preferredPrefix}${dossier.preferredBranch.name}`
      : dossierCopy.noPreferred,
    metrics: [
      {
        label: dossierCopy.metrics.visits,
        figure: count(dossier.visits),
        sub: dossierCopy.visitsSub(String(dossier.metrics.visitsPerMonth)),
        icon: 'calendar',
      },
      {
        label: dossierCopy.metrics.orders,
        figure: count(dossier.orders),
        sub: dossierCopy.ordersSub(naira(dossier.spend)),
        icon: 'receipt',
      },
      {
        label: dossierCopy.metrics.deals,
        figure: dossierCopy.dealsFigure(count(dossier.claims)),
        sub: dossierCopy.dealsSub(percent(dossier.metrics.redemptionRate)),
        icon: 'loyalty',
      },
      {
        label: dossierCopy.metrics.loyalty,
        figure: dossierCopy.loyaltyFigure(count(dossier.pointsBalance)),
        sub: dossierCopy.loyaltySub(dossier.tier),
        icon: 'trophy',
      },
    ],
    firstInteraction: dossierCopy.interactionValue(
      formatShortDate(dossier.firstInteraction.at),
      kind(dossier.firstInteraction.kind),
    ),
    latestInteraction: dossierCopy.interactionValue(
      formatWhen(dossier.lastSeenAt),
      latestRef
        ? `${kind(dossier.lastInteraction.kind)} ${latestRef}`
        : kind(dossier.lastInteraction.kind),
    ),
    purchases: dossier.recentPurchases.map(purchase => ({
      id: purchase.id,
      title: (dossierCopy.purchaseTitle[purchase.kind] ?? (ref => ref))(
        purchase.reference,
      ),
      badge: dossierCopy.purchaseBadge[purchase.kind] ?? purchase.kind,
      items: purchase.items,
      amount: naira(purchase.total),
      when: formatWhen(purchase.at),
    })),
    claims: dossier.recentClaims.map(claim => ({
      id: claim.id,
      title: claim.offerName,
      status: dossierCopy.voucherStatus[claim.status] ?? claim.status,
      tone:
        claim.status === 'redeemed'
          ? 'success'
          : claim.status === 'claimed'
            ? 'brand'
            : 'neutral',
      code: `${dossierCopy.voucherCodePrefix}${claim.claimCode}`,
      saved: claim.saved > 0 ? dossierCopy.voucherSaved(naira(claim.saved)) : null,
      where: claim.branchName ? dossierCopy.voucherWhere(claim.branchName) : '',
    })),
    ledger: dossier.loyaltyLedger.map(entry => ({
      id: entry.id,
      text: dossierCopy.ledgerEntry(
        `${entry.points > 0 ? '+' : ''}${count(entry.points)}`,
        entry.reason ?? '',
      ),
      when: formatShortDate(entry.at),
      positive: entry.points >= 0,
    })),
    note: dossier.note
      ? {
          body: dossier.note.note,
          author: dossierCopy.notesAuthor(
            dossier.note.updatedBy ?? '',
            formatShortDate(dossier.note.updatedAt),
          ),
          tags: dossier.note.tags,
        }
      : null,
  };
}
