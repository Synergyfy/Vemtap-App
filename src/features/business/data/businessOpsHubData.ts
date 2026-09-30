/**
 * Fixture data for the operations-dense More hub variant (`business_more_hub_3`)
 * and the offline POS home (`pos_home_offline_mode_active`). Screens read from
 * here so POS tiles, analytics rows and the local till tally are never inlined
 * twice.
 */
import type { IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';

const copy = {
  hub: strings.businessMoreHubOperations,
  offline: strings.posHomeOfflineMode,
} as const;

/* -------------------------------------------------------------------------- */
/* Operations hub: POS tiles                                                  */
/* -------------------------------------------------------------------------- */

export interface HubPosTile {
  id: string;
  label: string;
  hint: string | null;
  icon: IconName;
}

export const hubPosTiles: readonly HubPosTile[] = [
  { id: 'new-sale', label: 'New Sale', hint: 'Launch quick register', icon: 'cartPlus' },
  { id: 'pos-home', label: 'POS Home', hint: null, icon: 'desktopClassic' },
  { id: 'products', label: 'Products', hint: '142 SKUs', icon: 'inventory' },
  { id: 'customers', label: 'Customers', hint: 'Till lookup', icon: 'group' },
  { id: 'transactions', label: 'Transactions', hint: '38 today', icon: 'receipt' },
  { id: 'offline', label: 'Offline Mode', hint: 'Ready (0 buf)', icon: 'wifiAlert' },
  { id: 'sync', label: 'Sync Till', hint: 'Instant push', icon: 'sync' },
  { id: 'public-pos', label: 'Public POS', hint: 'Dual-screen', icon: 'television' },
] as const;

/** The offline POS tile carries an alert tone; everything else is neutral. */
export const hubPosTileAlert: Record<string, boolean> = {
  offline: true,
};

export const hubPosTileAction: Record<string, 'primary' | 'neutral'> = {
  'new-sale': 'primary',
  'public-pos': 'neutral',
};

export interface HubLinkRow {
  id: string;
  title: string;
  body: string;
  icon: IconName;
  badge?: string;
  badgeTone?: 'discount' | 'brand' | 'neutral';
}

export const hubAnalyticsRows: readonly HubLinkRow[] = [
  {
    id: 'business',
    title: 'Business Analytics',
    body: 'Gross GMV, profit margins & item velocity',
    icon: 'chartBox',
  },
  {
    id: 'customers',
    title: 'Customer Intelligence',
    body: 'Cohort retention, repeat rates & lifetime value',
    icon: 'donutLarge',
  },
  {
    id: 'deals',
    title: 'Deals Performance',
    body: 'Voucher redemptions, footfall lift & attribution',
    icon: 'localOffer',
  },
  {
    id: 'locations',
    title: 'Locations Comparison',
    body: 'Wuse vs. Maitama multi-branch benchmarks',
    icon: 'storeMallDirectory',
  },
  {
    id: 'till',
    title: 'POS Till Reports',
    body: 'Shift z-reports, cash vs. card tally & payouts',
    icon: 'accountCash',
  },
] as const;

export const hubMarketingRows: readonly HubLinkRow[] = [
  {
    id: 'boost',
    title: 'Boost Promoted Deals',
    body: '3x feed placement in Wuse zone',
    icon: 'fire',
    badge: 'HOT',
    badgeTone: 'discount',
  },
  {
    id: 'campaigns',
    title: 'Campaigns',
    body: 'WhatsApp & SMS blasts',
    icon: 'inboxArrowDown',
  },
  { id: 'segments', title: 'Segments', body: 'VIPs, Lapsed & New', icon: 'group' },
] as const;

export const hubQrRows: readonly HubLinkRow[] = [
  {
    id: 'master-qr',
    title: 'Business Master QR',
    body: 'Primary profile card & instant follow code',
    icon: 'storefront',
  },
  {
    id: 'location-qr',
    title: 'Location-Specific QR',
    body: 'Table tents 1–24 & bar counter stickers',
    icon: 'tableBar',
  },
  {
    id: 'discovery',
    title: 'Storefront Discovery',
    body: 'Public consumer feed visibility & distance pin',
    icon: 'travelExplore',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Offline POS home                                                           */
/* -------------------------------------------------------------------------- */

export const offlineTally = [
  {
    id: 'sales',
    label: copy.offline.salesLabel,
    value: copy.offline.salesValue,
    note: copy.offline.salesNote,
    icon: 'payments' as IconName,
  },
  {
    id: 'transactions',
    label: copy.offline.transactionsLabel,
    value: copy.offline.transactionsValue,
    note: copy.offline.transactionsNote,
    icon: 'receipt' as IconName,
  },
  {
    id: 'pending',
    label: copy.offline.pendingLabel,
    value: copy.offline.pendingValue,
    note: copy.offline.pendingNote,
    icon: 'tableBar' as IconName,
  },
  {
    id: 'refunds',
    label: copy.offline.refundsLabel,
    value: copy.offline.refundsValue,
    note: copy.offline.refundsNote,
    icon: 'assignment' as IconName,
  },
] as const;

/** Queued transaction count drives the sync panel and the buffer copy. */
export const offlineQueuedCount = 4;
export const offlineQueuedAmount = '₦28,400';

/** `Shift Active` bar so the design's header context is stated once. */
export const offlineShift = {
  cashier: 'Emeka O.',
  till: 'Till 01',
  mode: 'Standalone',
} as const;
