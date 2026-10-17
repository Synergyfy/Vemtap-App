import type { ActivityRow } from '@api/activityApi';
import type { IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';
import { formatCurrency, formatWhen } from '@utils/formatters';

const copy = strings.accountScreens.activity;

export interface ActivityCardView {
  id: string;
  kind: ActivityRow['kind'];
  refId: string | null;
  icon: IconName;
  image: string | null;
  title: string;
  subtitle: string;
  meta: string;
  pill: string;
  pillTone: 'success' | 'neutral';
  rating: number | null;
  body: string | null;
  reply: string | null;
  businessName: string;
}

const ICONS: Record<ActivityRow['kind'], IconName> = {
  claim: 'localActivity',
  order: 'receipt',
  booking: 'eventAvailable',
  visit: 'storefront',
  review: 'rateReview',
  comment: 'rateReview',
};

/** One activity row as a card: who, what happened, when and where. */
export function toActivityCard(row: ActivityRow): ActivityCardView {
  const business = row.businessName?.trim() || copy.unknownBusiness;
  const amount = row.amount != null ? formatCurrency(row.amount) : '';
  const subtitle =
    row.kind === 'claim'
      ? copy.claimLine(
          row.title ?? '',
          copy.claimStatus[row.status ?? ''] ?? row.status ?? '',
        )
      : row.kind === 'order'
        ? copy.orderLine(amount)
        : row.kind === 'booking'
          ? copy.bookingLine(row.title ?? '')
          : row.kind === 'visit'
            ? copy.visitLine
            : copy.reviewLine(row.title ?? '');
  const pill =
    row.kind === 'claim'
      ? (copy.claimStatus[row.status ?? ''] ?? '')
      : row.kind === 'order'
        ? ((strings.ordersHub.orderStatusLabels as Record<string, string>)[
            row.status ?? ''
          ] ?? '')
        : copy.kindLabel[row.kind];
  return {
    id: `${row.kind}:${row.id}`,
    kind: row.kind,
    refId: row.refId ?? null,
    icon: ICONS[row.kind],
    image: row.image || row.businessLogo || null,
    title: business,
    subtitle,
    meta: [formatWhen(row.at), row.branchName].filter(Boolean).join(' • '),
    pill,
    pillTone:
      (row.kind === 'claim' && row.status === 'redeemed') ||
      (row.kind === 'order' && row.status === 'completed')
        ? 'success'
        : 'neutral',
    rating: row.rating ?? null,
    body: row.body?.trim() || null,
    reply: row.reply?.trim() || null,
    businessName: business,
  };
}

/** CSV export of the loaded timeline. */
export function activityCsvRows(rows: readonly ActivityRow[]) {
  return rows.map(row => [
    row.at,
    copy.kindLabel[row.kind],
    row.businessName ?? '',
    row.branchName ?? '',
    row.title ?? '',
    row.amount ?? '',
    row.status ?? '',
  ]);
}

export const ACTIVITY_CSV_HEADER = [
  'Date',
  'Type',
  'Business',
  'Branch',
  'Item',
  'Amount',
  'Status',
] as const;
