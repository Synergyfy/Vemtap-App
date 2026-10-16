/**
 * Fixture data for the operations-dense More hub variant (`business_more_hub_3`).
 * Screens read from here so POS tiles and analytics rows are never inlined
 * twice.
 */
import type { IconName } from '@components/ui/Icon';

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
