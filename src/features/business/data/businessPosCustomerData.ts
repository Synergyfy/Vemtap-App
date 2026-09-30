import type { IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';

const copy = strings.posCustomerLookupList;

/** Segment chips above the till customer list (`pos_customer_lookup_2`). */
export const posCustomerSegments = [
  { id: 'all', label: copy.filterAll, icon: 'star' as IconName, active: true },
  { id: 'vip', label: copy.filterVip, icon: 'star' as IconName, active: false },
  { id: 'recent', label: copy.filterRecent, icon: 'schedule' as IconName, active: false },
  {
    id: 'claimed',
    label: copy.filterClaimed,
    icon: 'localOffer' as IconName,
    active: false,
  },
] as const;

export type PosCustomerCardTier = 'vip' | 'regular' | 'table' | 'new';

export interface PosCustomerCard {
  id: string;
  name: string;
  initials: string;
  phone: string;
  email?: string;
  tierLabel: string;
  tier: PosCustomerCardTier;
  pointsLabel: string;
  pointsValue: string;
  pendingPoints?: string;
  meta: string;
  lastVisit: string;
  dealTitle?: string;
  attachCta: string;
  dossierCta: string;
  expanded: boolean;
}

/** Till CRM list: the first patron is expanded with the claimed-deal offer. */
export const posCustomerCards: readonly PosCustomerCard[] = [
  {
    id: 'michael',
    name: 'Michael James',
    initials: 'MJ',
    phone: '+234 803 219 8831',
    email: 'michael.j@example.com',
    tierLabel: 'VIP Patron',
    tier: 'vip',
    pointsLabel: '2,450 VEMTAP Pts',
    pointsValue: '\u20a612,250 redeemable value',
    pendingPoints: '+276 pts pending ticket',
    meta: '14 total  \u00b7  \u20a6142,500  \u00b7  Today 11:20 AM',
    lastVisit: 'Today 11:20 AM',
    dealTitle: '20% Off Weekend Lunch Deal',
    attachCta: copy.attachActiveCta,
    dossierCta: copy.dossierCta,
    expanded: true,
  },
  {
    id: 'sarah',
    name: 'Sarah Adams',
    initials: 'SA',
    phone: '+234 812 443 0912',
    tierLabel: 'Deal Regular',
    tier: 'regular',
    pointsLabel: '1,120 Loyalty Pts',
    pointsValue: '8 visits \u2022 \u20a668,200 spend',
    meta: '8 visits  \u00b7  \u20a668,200 spend',
    lastVisit: 'Yesterday (Double Smash Burger ticket)',
    attachCta: copy.attachCta,
    dossierCta: copy.viewDossierCta,
    expanded: false,
  },
  {
    id: 'chidi',
    name: 'Dr. Chidi Okafor',
    initials: 'CO',
    phone: '+234 802 771 9044',
    tierLabel: 'Table Regular',
    tier: 'table',
    pointsLabel: '890 Loyalty Pts',
    pointsValue: '5 visits \u2022 \u20a654,000 spend',
    meta: '5 visits  \u2022  \u20a654,000 spend',
    lastVisit: '3 days ago (Table 04 Dinner)',
    attachCta: copy.attachCta,
    dossierCta: copy.viewDossierCta,
    expanded: false,
  },
  {
    id: 'amaka',
    name: 'Amaka Kalu',
    initials: 'AK',
    phone: '+234 818 902 3341',
    tierLabel: 'New Member',
    tier: 'new',
    pointsLabel: '150 Pts',
    pointsValue: '1 prior visit \u2022 First tap',
    meta: '1 prior visit \u2022 First tap',
    lastVisit: 'First tap',
    attachCta: copy.attachCta,
    dossierCta: copy.viewDossierCta,
    expanded: false,
  },
];

/** `pos_customer_lookup_loyalty` rewards. */
export const posLoyaltyRewards = [
  {
    id: 'cash-1000',
    title: strings.posCustomerLookupLoyalty.reward1Title,
    cost: strings.posCustomerLookupLoyalty.reward1Cost,
    body: strings.posCustomerLookupLoyalty.reward1Body,
    cta: strings.posCustomerLookupLoyalty.reward1Cta,
    icon: 'gift' as IconName,
    tone: 'brand' as const,
  },
  {
    id: 'weekend-lunch',
    title: strings.posCustomerLookupLoyalty.reward2Title,
    cost: strings.posCustomerLookupLoyalty.reward2Badge,
    body: strings.posCustomerLookupLoyalty.reward2Body,
    cta: strings.posCustomerLookupLoyalty.reward2Cta,
    icon: 'localOffer' as IconName,
    tone: 'success' as const,
  },
] as const;

/** `pos_customer_dossier` register perks. */
export const posDossierPerks = [
  {
    id: 'weekend-lunch',
    title: strings.posCustomerDossier.perk1Title,
    badge: strings.posCustomerDossier.perk1Badge,
    body: strings.posCustomerDossier.perk1Body,
    cta: strings.posCustomerDossier.perk1Cta,
    icon: 'dining' as IconName,
    tone: 'brand' as const,
  },
  {
    id: 'loyalty-cash',
    title: strings.posCustomerDossier.perk2Title,
    badge: null,
    body: strings.posCustomerDossier.perk2Body,
    cta: strings.posCustomerDossier.perk2Cta,
    icon: 'wallet' as IconName,
    tone: 'neutral' as const,
  },
] as const;

export interface PosDossierVisit {
  id: string;
  when: string;
  reference: string;
  total: string;
  items: string;
  tender: string;
}

/** Recent Wuse-branch tickets shown in the dossier. */
export const posDossierVisits: readonly PosDossierVisit[] = [
  {
    id: 'tk-108',
    when: 'Today, 11:20 AM',
    reference: '#TK-108',
    total: '\u20a627,251',
    items: '3 items: Ribeye, Smash Burger, Mojito',
    tender: 'Cash',
  },
  {
    id: 'tk-094',
    when: 'Oct 14, 01:15 PM',
    reference: '#TK-094',
    total: '\u20a619,200',
    items: '2 items: T-Bone, Craft Beer',
    tender: 'Card',
  },
  {
    id: 'tk-071',
    when: 'Oct 09, 08:30 PM',
    reference: '#TK-071',
    total: '\u20a68,500',
    items: '2 items: Charcoal Wings, Fries',
    tender: 'Transfer',
  },
];

export type PosStockState = 'active' | 'low' | 'inactive';

export interface PosInventoryItem {
  id: string;
  sku: string;
  station: string;
  name: string;
  price: string;
  stockLabel: string;
  stockValue: string;
  state: PosStockState;
  note: string;
}

/** `pos_products_inventory` catalogue rows with live till stock counts. */
export const posInventoryItems: readonly PosInventoryItem[] = [
  {
    id: 'wr-0294',
    sku: 'SKU: WR-0294',
    station: 'Grill Station',
    name: 'Woodfire Ribeye 250g',
    price: '\u20a616,000',
    stockLabel: '18 portions',
    stockValue: '18 in stock',
    state: 'active',
    note: '',
  },
  {
    id: 'db-1102',
    sku: 'SKU: DB-1102',
    station: 'Burger Station',
    name: 'Double Smash Burger',
    price: '\u20a66,500',
    stockLabel: '32 units',
    stockValue: '32 in stock',
    state: 'active',
    note: '',
  },
  {
    id: 'tf-8821',
    sku: 'SKU: TF-8821',
    station: 'Sides',
    name: 'Truffle Parm Fries',
    price: '\u20a63,200',
    stockLabel: '8 portions',
    stockValue: '8 in stock',
    state: 'low',
    note: 'Low Alert < 10',
  },
  {
    id: 'dr-4091',
    sku: 'SKU: DR-4091',
    station: 'Bar & Taps',
    name: 'Apo Craft Lager 500ml',
    price: '\u20a62,200',
    stockLabel: '0 kegs',
    stockValue: '0 in stock',
    state: 'inactive',
    note: 'Re-order sent',
  },
] as const;

/** Countdown chips in the shift stock control. */
export const posStockCountSteps = ['-5', '-1', '+1', '+5'] as const;

/** `pos_product_shift_stock_status` audit log. */
export const posShiftAuditLog = [
  { id: 'a1', label: 'Shift handoff verified by Chef Tunde', time: '14:10' },
  { id: 'a2', label: 'Stock replenished (+10) via Prep Station', time: '12:35' },
] as const;
