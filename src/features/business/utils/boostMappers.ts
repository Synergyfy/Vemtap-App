import { strings } from '@constants/strings';
import type {
  AdWalletCard,
  AdWalletInvoice,
  AdWalletPrepack,
  AdWalletTransaction,
} from '@api/adWalletApi';
import type { PromotionEligibleAsset, SavePromotionInput } from '@api/promotionsApi';
import type { IconName } from '@components/ui/Icon';
import type { BoostDraft, BoostDraftAsset } from '@store/boostDraftStore';

/**
 * The Boost wizard and Boost Wallet ↔ `/boosts` and `/ad-wallet`. Goal,
 * audience-scope, placement and budget-tier ids are shared with the API.
 */

const wizard = strings.boostWizard;
const walletLive = wizard.wallet.live;

/** The goal step's scope labels, in the API's order. */
export const BOOST_AUDIENCE_SCOPE_IDS = ['nearby', 'districts', 'clusters'] as const;

/** Lunch-rush window the budget step's dayparting toggle stands for. */
export const BOOST_DAYPART_WINDOWS = ['lunch'] as const;

export function formatNaira(value: number | null | undefined): string {
  return `₦${Math.round(value ?? 0).toLocaleString('en-NG')}`;
}

export function eligibleAssetToBoostAsset(
  asset: PromotionEligibleAsset,
): BoostDraftAsset {
  return {
    type: asset.type,
    id: asset.id,
    title: asset.title,
    price: asset.price,
    wasPrice: asset.wasPrice,
    priorClaims: asset.priorClaims,
  };
}

/** `20% OFF` for a discounted asset, else its type ("Deal", "Product"…). */
export function boostAssetBadge(asset: BoostDraftAsset): string {
  if (asset.price && asset.wasPrice && asset.wasPrice > asset.price) {
    return `${Math.round((1 - asset.price / asset.wasPrice) * 100)}% OFF`;
  }
  return strings.campaignsHub.live.assetTypes[asset.type].badge;
}

/** The areas and audience a boost is limited to, for its reach forecast. */
export function boostForecastTargeting(
  draft: Pick<BoostDraft, 'audienceScope' | 'areas' | 'audienceType'>,
): { clusterIds?: string[]; audienceType?: string } {
  return {
    ...(draft.audienceScope !== 'nearby' && draft.areas.length
      ? { clusterIds: draft.areas.map(area => area.id) }
      : {}),
    ...(draft.audienceType ? { audienceType: draft.audienceType } : {}),
  };
}

/** The whole boost draft as a `SaveCampaignDto`. */
export function boostDraftToSaveInput(
  draft: BoostDraft,
  branchId?: string,
): SavePromotionInput {
  return {
    name: draft.asset?.title ?? wizard.live.untitled,
    goalId: draft.goalId,
    assets: draft.asset ? [{ type: draft.asset.type, id: draft.asset.id }] : [],
    audience: {
      strategy: draft.audienceScope,
      radiusKm: draft.radiusKm,
      ...(branchId ? { branchIds: [branchId] } : {}),
      ...boostForecastTargeting(draft),
    },
    placements: draft.placements,
    schedule: {
      durationDays: draft.durationDays,
      instantLaunch: true,
      dayparting: draft.dayparting,
      windows: draft.dayparting ? [...BOOST_DAYPART_WINDOWS] : [],
    },
    budgetMode: 'total',
    budget: draft.budget,
  };
}

/** A prepack as a wallet top-up card. */
export function prepackToCard(prepack: AdWalletPrepack) {
  return {
    id: prepack.id,
    badge: `₦${Math.round(prepack.amount / 1000)}k`,
    title: prepack.label,
    bonus:
      prepack.bonus > 0
        ? walletLive.bonus(formatNaira(prepack.bonus))
        : walletLive.noBonus,
    tier: prepack.tier ?? undefined,
  };
}

const TRANSACTION_ICON: Record<string, IconName> = {
  topup: 'creditCard',
  bonus: 'redeem',
  reserve: 'campaign',
  spend: 'campaign',
  release: 'undo',
  adjustment: 'tune',
};

/** A wallet transaction as a history row. */
export function transactionToRow(transaction: AdWalletTransaction) {
  const type = transaction.type as keyof typeof walletLive.types;
  const credit = transaction.direction === 'credit';
  const date = new Date(transaction.createdAt).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return {
    id: transaction.id,
    title:
      transaction.description?.trim() || (walletLive.types[type] ?? transaction.type),
    meta: transaction.reference ? `${date} • ${transaction.reference}` : date,
    amount: `${credit ? '+' : '-'}${formatNaira(transaction.amount)}`,
    status: walletLive.types[type] ?? transaction.type,
    icon: TRANSACTION_ICON[transaction.type] ?? 'receiptLong',
    credit,
  };
}

function capitalize(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

/** "Visa •••• 4242" (or the short "Visa •• 4242" for tight rows). */
export function savedCardLabel(card: AdWalletCard, short = false): string {
  const brand = capitalize(card.brand?.trim() ?? '') || walletLive.card.brandFallback;
  const last4 = card.last4 ?? '????';
  return short
    ? walletLive.card.shortLabel(brand, last4)
    : walletLive.card.label(brand, last4);
}

/** "Expires 08/27", or undefined when Paystack sent no expiry. */
export function savedCardExpiry(card: AdWalletCard): string | undefined {
  if (!card.expMonth || !card.expYear) return undefined;
  return walletLive.card.expiry(card.expMonth.padStart(2, '0'), card.expYear.slice(-2));
}

function invoiceDate(invoice: AdWalletInvoice): string {
  return new Date(invoice.date).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function invoiceFields(invoice: AdWalletInvoice) {
  const { invoices } = walletLive;
  return {
    invoiceNo: invoice.invoiceNo ?? invoice.id.slice(0, 8).toUpperCase(),
    date: invoiceDate(invoice),
    campaign: invoice.campaign?.name?.trim() || invoices.untitled,
    kind: invoices.kinds[invoice.campaign?.kind ?? ''] ?? invoices.kinds.promotion,
    method: invoice.paymentMethod ?? '',
    amount: formatNaira(invoice.amount),
    status: invoice.status,
  };
}

/** An invoice as a list row. */
export function invoiceToRow(invoice: AdWalletInvoice) {
  const fields = invoiceFields(invoice);
  return {
    id: invoice.id,
    invoiceNo: fields.invoiceNo,
    title: fields.campaign,
    meta: walletLive.invoices.meta(fields.date, fields.invoiceNo),
    amount: fields.amount,
    status: fields.method || fields.status,
  };
}

/** One invoice as shareable text. */
export function invoiceText(invoice: AdWalletInvoice): string {
  return walletLive.invoices.text(invoiceFields(invoice));
}

/** Invoices as CSV rows (`wallet.live.invoices.headers` order). */
export function invoicesToCsvRows(invoices: readonly AdWalletInvoice[]) {
  return invoices.map(invoice => {
    const fields = invoiceFields(invoice);
    return [
      fields.invoiceNo,
      invoice.date.slice(0, 10),
      fields.campaign,
      fields.kind,
      fields.method,
      invoice.amount,
      fields.status,
    ];
  });
}

/** Everything the Preview & Payment step shows, live or from the design. */
export interface BoostPreviewView {
  feed: {
    distance: string;
    business: string;
    name: string;
    price?: string;
    was?: string;
    save?: string;
    cta: string;
    /** Engagement line under the card; sample only. */
    stats?: readonly string[];
  };
  spotlight: { title: string; sub: string; caption?: string };
  push: { title: string; body: string };
  trustNote?: string;
  params: readonly {
    id: string;
    label: string;
    value: string;
    detail?: string;
    icon: IconName;
  }[];
  total: { value: string; note: string; pace: string };
  methods: readonly {
    id: string;
    title: string;
    chip?: string;
    body: string;
    note?: string;
  }[];
  termsSuffix: string;
  cta: string;
}

const previewCopy = wizard.preview;

export const prototypeBoostPreviewView: BoostPreviewView = {
  feed: {
    distance: previewCopy.feedDistance,
    business: previewCopy.feedBusiness,
    name: previewCopy.feedName,
    price: previewCopy.feedPrice,
    was: previewCopy.feedWas,
    save: previewCopy.feedSave,
    cta: previewCopy.feedCta,
    stats: [previewCopy.feedLikes, previewCopy.feedShares, previewCopy.feedSpeed],
  },
  spotlight: {
    title: previewCopy.spotlightTitle,
    sub: previewCopy.spotlightSub,
    caption: previewCopy.spotlightCaption,
  },
  push: { title: previewCopy.pushTitle, body: previewCopy.pushBody },
  trustNote: previewCopy.trustNote,
  params: previewCopy.params,
  total: {
    value: previewCopy.totalValue,
    note: previewCopy.totalNote,
    pace: previewCopy.totalPace,
  },
  methods: previewCopy.methods,
  termsSuffix: previewCopy.termsSuffix,
  cta: previewCopy.cta,
};

function shortDate(date: Date): string {
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

/** The live draft as the Preview & Payment view. */
export function boostDraftToPreviewView(
  draft: BoostDraft,
  context: {
    businessName: string;
    branchName: string;
    walletSpendable?: number;
    /** The saved card ("Visa •• 4242"), which pays the shortfall with no checkout. */
    savedCard?: string;
    now?: Date;
  },
): BoostPreviewView {
  const { live } = wizard;
  const { asset } = draft;
  const name = asset?.title ?? live.untitled;
  const price = asset?.price ?? undefined;
  const was =
    asset?.wasPrice && price && asset.wasPrice > price ? asset.wasPrice : undefined;
  const start = context.now ?? new Date();
  const end = new Date(start.getTime() + draft.durationDays * 86_400_000);
  const distance = strings.boostEngine.live.previewDistance(draft.radiusKm);
  const total = formatNaira(draft.budget);
  const goalTitle =
    wizard.goalStep.goals.find(goal => goal.id === draft.goalId)?.title ?? draft.goalId;
  const placementTitles = draft.placements
    .map(id => wizard.goalStep.placements.find(placement => placement.id === id)?.title)
    .filter(Boolean)
    .join(', ');
  const spendable = context.walletSpendable;
  const shortfall = spendable === undefined ? 0 : Math.max(0, draft.budget - spendable);
  const walletMethod = previewCopy.methods[0];

  return {
    feed: {
      distance,
      business: context.businessName,
      name,
      price: price !== undefined ? formatNaira(price) : undefined,
      was: was !== undefined ? formatNaira(was) : undefined,
      save:
        was !== undefined && price !== undefined
          ? live.feedSave(formatNaira(was - price))
          : undefined,
      cta: live.feedCta(price !== undefined ? formatNaira(price) : undefined),
    },
    spotlight: {
      title: live.spotlightTitle(
        name,
        price !== undefined ? formatNaira(price) : undefined,
      ),
      sub: live.spotlightSub(context.businessName, distance),
    },
    push: {
      title: live.pushTitle(
        asset ? boostAssetBadge(asset) : undefined,
        context.businessName,
      ),
      body: live.pushBody(
        name,
        price !== undefined ? formatNaira(price) : undefined,
        distance,
      ),
    },
    params: [
      {
        id: 'asset',
        label: previewCopy.params[0].label,
        value: name,
        icon: 'localOffer',
      },
      {
        id: 'objective',
        label: previewCopy.params[1].label,
        value: goalTitle,
        icon: 'campaign',
      },
      {
        id: 'radius',
        label: previewCopy.params[2].label,
        value:
          draft.audienceScope !== 'nearby' && draft.areas.length
            ? live.areasValue(draft.areas.map(area => area.name))
            : live.radiusValue(draft.radiusKm, context.branchName),
        icon: 'radar',
      },
      {
        id: 'schedule',
        label: previewCopy.params[3].label,
        value: live.paramsSchedule(draft.durationDays, shortDate(start), shortDate(end)),
        detail: draft.dayparting ? live.lunchOnly : live.allDay,
        icon: 'schedule',
      },
      {
        id: 'placements',
        label: previewCopy.params[4].label,
        value: placementTitles,
        icon: 'dashboardCustomize',
      },
    ],
    total: {
      value: total,
      note: previewCopy.totalNote,
      pace: live.totalPace(formatNaira(draft.budget / Math.max(1, draft.durationDays))),
    },
    methods: [
      {
        id: 'wallet',
        title: walletMethod.title,
        chip: walletMethod.chip,
        body:
          spendable === undefined
            ? live.walletLoading
            : shortfall > 0
              ? live.walletShort(formatNaira(shortfall))
              : live.walletBody(
                  formatNaira(spendable),
                  formatNaira(spendable - draft.budget),
                ),
        note: walletMethod.note,
      },
      {
        id: 'card',
        title: context.savedCard ?? live.cardTitle,
        chip: live.cardChip,
        body: context.savedCard ? live.savedCardBody : live.cardBody,
      },
    ],
    termsSuffix: live.termsSuffix(total),
    cta: live.cta(total),
  };
}

/** Wallet transactions as statement rows (`wallet.live.statement.headers` order). */
export function transactionsToStatementRows(
  transactions: readonly AdWalletTransaction[],
) {
  return transactions.map(transaction => {
    const type = transaction.type as keyof typeof walletLive.types;
    const signed =
      transaction.direction === 'debit' ? -transaction.amount : transaction.amount;
    return [
      transaction.createdAt.slice(0, 10),
      walletLive.types[type] ?? transaction.type,
      transaction.description ?? '',
      transaction.reference ?? '',
      signed,
      transaction.balanceAfter,
      transaction.reservedAfter,
    ];
  });
}
