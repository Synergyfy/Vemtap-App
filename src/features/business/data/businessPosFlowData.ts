/**
 * Fixture data for the POS sale-flow surfaces: branch/till routing, the store
 * operations hub, the register catalog, the current-sale cart, tender checkout,
 * the completed-sale receipt and the receipt/hardware customizer.
 */
import type { IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';

const copy = {
  switcher: strings.posBranchTillSwitcher,
  home: strings.posHomeSalesOperations,
  catalog: strings.posNewSaleCatalog,
  cart: strings.posCurrentSaleCart,
  tender: strings.posTenderCheckout,
  completed: strings.posSaleCompleted,
  customize: strings.posReceiptCustomization,
} as const;

/* -------------------------------------------------------------------------- */
/* Branch & till routing                                                      */
/* -------------------------------------------------------------------------- */

export type TillStatus = 'active' | 'idle' | 'available';

export interface PosTill {
  id: string;
  name: string;
  meta: string;
  status: TillStatus;
  statusLabel: string;
  amount: string;
}

export const tillStatusLabel: Record<TillStatus, string> = {
  active: 'Active',
  idle: 'Idle',
  available: 'Available',
};

export const tillStatusTone: Record<TillStatus, 'success' | 'brand' | 'neutral'> = {
  active: 'success',
  idle: 'neutral',
  available: 'brand',
};

export const posTills: readonly PosTill[] = [
  {
    id: 'till-01',
    name: 'Till #01 – Main Counter Register',
    meta: 'Occupied by Current Session • Active',
    status: 'active',
    statusLabel: 'Active',
    amount: '₦342,850',
  },
  {
    id: 'till-02',
    name: 'Till #02 – Patio & Bar Register',
    meta: 'Idle • 0 active sales',
    status: 'idle',
    statusLabel: 'Idle',
    amount: '₦0.00',
  },
  {
    id: 'till-03',
    name: 'Till #03 – Takeout / Curbside',
    meta: 'Available for Assignment',
    status: 'available',
    statusLabel: 'Available for Assignment',
    amount: '₦18,400',
  },
] as const;

export interface PosBranch {
  id: string;
  name: string;
  address: string;
  distance: string;
  meta: string;
  current: boolean;
}

export const posBranches: readonly PosBranch[] = [
  {
    id: 'wuse',
    name: 'Wuse Branch (Flagship)',
    address: 'Aminu Kano Cres, Wuse II',
    distance: 'Current',
    meta: '2 Tills Active • ₦342,850 today',
    current: true,
  },
  {
    id: 'maitama',
    name: 'Maitama Heights Branch',
    address: 'Plot 14 Amazon Street, Maitama',
    distance: '3.2 km',
    meta: '3 Tills Online • Tunde B. on Till #01',
    current: false,
  },
  {
    id: 'garki',
    name: 'Garki Area 11 Branch',
    address: 'Commercial Arcade, Area 11',
    distance: '5.8 km',
    meta: '1 Till Online (Limited Counter Mode)',
    current: false,
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Store operations hub                                                       */
/* -------------------------------------------------------------------------- */

export const posBranchChoices: readonly {
  id: string;
  name: string;
  distance: string;
  current: boolean;
}[] = [
  { id: 'wuse', name: 'Wuse Branch (Current)', distance: '', current: true },
  { id: 'maitama', name: 'Maitama Heights Branch', distance: '4.2 km', current: false },
  { id: 'garki', name: 'Garki Area 11 Kiosk', distance: '8.1 km', current: false },
] as const;

export interface PosQuickAction {
  id: string;
  label: string;
  hint: string;
  shortcut?: string;
  icon: IconName;
}

export const posQuickActions: readonly PosQuickAction[] = [
  {
    id: 'new-sale',
    label: 'New Sale',
    hint: 'Ring up walk-in or table order',
    shortcut: 'F1 Short',
    icon: 'addCircle',
  },
  {
    id: 'transactions',
    label: 'Transactions',
    hint: 'View shift sales & receipts',
    icon: 'receiptLong',
  },
  {
    id: 'customers',
    label: 'Customers',
    hint: 'Identify patron & reward points',
    icon: 'accountSearch',
  },
  {
    id: 'products',
    label: 'Products',
    hint: 'Browse menu & branch prices',
    icon: 'inventory',
  },
] as const;

export const posOperationalSummary = [
  {
    id: 'sales',
    label: "Today's Sales",
    value: '₦342,850',
    note: '142 tickets gross',
    icon: 'payments' as IconName,
  },
  {
    id: 'transactions',
    label: 'Transactions',
    value: '142',
    note: '100% successful',
    icon: 'doneAll' as IconName,
  },
  {
    id: 'pending',
    label: 'Pending Orders',
    value: '3',
    note: 'Kitchen • Table 4, 9, Pickup',
    icon: 'roomService' as IconName,
  },
  {
    id: 'voids',
    label: 'Refunds / Voids',
    value: '₦0.00',
    note: '0 voids today',
    icon: 'closeCircleOutline' as IconName,
  },
] as const;

export const posDrawerSummary = [
  { id: 'float', label: 'Opening Float', value: '₦50,000' },
  { id: 'cash', label: 'Cash in Till', value: '₦92,400' },
] as const;

export const posDrawerBalance = {
  label: 'Drawer Balance',
  value: 'Balanced (±0)',
} as const;

export const posRegisterControls = [
  {
    id: 'public-mode',
    title: 'Customer Public Mode',
    subtitle: 'Toggle self-ordering kiosk for diner table',
    icon: 'touchApp' as IconName,
  },
  {
    id: 'drawer',
    title: 'Cash Drawer & Shift Status',
    subtitle: 'View Drawer',
    icon: 'pointOfSale' as IconName,
  },
] as const;

export const posShift = { id: '402', time: '08:30 AM' } as const;

/* -------------------------------------------------------------------------- */
/* Register catalog                                                           */
/* -------------------------------------------------------------------------- */

export interface CatalogItem {
  id: string;
  name: string;
  detail: string;
  price: string;
  wasPrice?: string;
  /** Stock or queue note, e.g. `Stock: 18 left`. */
  stock: string;
  /** `ready`, `high`, `low` or `deal` — drives the badge tone. */
  stockTone: 'ready' | 'high' | 'low' | 'deal';
  dealLabel?: string;
  verified?: boolean;
}

export const catalogItems: readonly CatalogItem[] = [
  {
    id: 'ribeye',
    name: 'Woodfire Ribeye Steak',
    detail: '250g Prime Angus • Kitchen Cooked',
    price: '₦16,000',
    stock: 'Stock: 18 left',
    stockTone: 'ready',
  },
  {
    id: 'lunch-pass',
    name: 'Prime Lunch Combo Pass',
    detail: 'Meal + Drink',
    price: '₦9,600',
    wasPrice: '₦12,000',
    stock: 'Special Promo Active',
    stockTone: 'deal',
    dealLabel: '20% OFF',
    verified: true,
  },
  {
    id: 'smash-burger',
    name: 'Double Smash Burger & Fries',
    detail: 'Brioche Bun • House Truffle Mayo',
    price: '₦6,500',
    stock: 'Stock: 32 left',
    stockTone: 'ready',
    dealLabel: 'Deal Eligible',
  },
  {
    id: 'bbq-wings',
    name: 'Charcoal BBQ Wings (6 pcs)',
    detail: 'Spicy Hickory Glaze • Creamy Dip',
    price: '₦4,800',
    stock: 'Stock: 14 left',
    stockTone: 'ready',
  },
  {
    id: 'fries',
    name: 'Truffle Parmesan Fries',
    detail: 'Fresh Cut • Aged Reggiano • Dip',
    price: '₦3,200',
    stock: 'High Stock',
    stockTone: 'high',
  },
  {
    id: 'mojito',
    name: 'Passionfruit Mojito',
    detail: 'Fresh Mint • Cane Sugar • Sparkling',
    price: '₦3,500',
    stock: 'Bar Queue: Low',
    stockTone: 'low',
  },
  {
    id: 'cold-tap',
    name: 'Cold Tap',
    detail: 'Craft Draft Beer 500ml',
    price: '₦2,200',
    stock: 'Keg Level: 64%',
    stockTone: 'ready',
  },
] as const;

export const catalogStockTone: Record<
  CatalogItem['stockTone'],
  'success' | 'brand' | 'warning'
> = {
  ready: 'success',
  high: 'brand',
  low: 'warning',
  deal: 'brand',
};

export const posActiveOrder = {
  id: 'UG-1084',
  items: 3,
  amount: '₦25,700',
  charge: '₦27,628',
} as const;

/* -------------------------------------------------------------------------- */
/* Current sale cart                                                          */
/* -------------------------------------------------------------------------- */

export interface CartLine {
  id: string;
  name: string;
  unit: string;
  qty: number;
  unitPrice: string;
  lineTotal: string;
  note?: string;
  discountNote?: string;
  station?: string;
}

export const cartLines: readonly CartLine[] = [
  {
    id: 'ribeye',
    name: 'Woodfire Ribeye Steak (250g)',
    unit: '₦16,000',
    qty: 1,
    unitPrice: '₦16,000',
    lineTotal: '₦16,000',
    note: 'Medium Rare, extra peppercorn sauce',
  },
  {
    id: 'smash',
    name: 'Double Smash Burger',
    unit: '₦6,500',
    qty: 1,
    unitPrice: '₦5,850',
    lineTotal: '₦5,850',
    discountNote: '10% Member Perk applied (-₦650)',
  },
  {
    id: 'mojito',
    name: 'Passionfruit Mojito',
    unit: '₦3,500',
    qty: 1,
    unitPrice: '₦3,500',
    lineTotal: '₦3,500',
    station: 'Chilled • Bar Station',
  },
] as const;

export const cartTotals = [
  {
    id: 'subtotal',
    label: copy.cart.subtotalLabel,
    value: '₦26,000',
    tone: 'default' as const,
  },
  {
    id: 'discount',
    label: copy.cart.memberDiscountLabel,
    value: '-₦650',
    tone: 'discount' as const,
  },
  { id: 'vat', label: copy.cart.vatLabel, value: '₦1,901', tone: 'default' as const },
] as const;

export const cartGrandTotal = '₦27,251';

export const cartCustomer = {
  name: 'Michael James',
  tier: 'VIP Patron',
  phone: '+234 803 219 8831',
  points: '2,450',
  earns: '+276',
} as const;

/* -------------------------------------------------------------------------- */
/* Tender checkout                                                            */
/* -------------------------------------------------------------------------- */

export const tenderOrder = {
  id: 'TK-108',
  table: 'Table 04',
  branch: 'Wuse Branch',
  due: '₦27,628',
  items: 3,
} as const;

export const tenderLines: readonly {
  id: string;
  qty: string;
  name: string;
  price: string;
}[] = [
  { id: 'ribeye', qty: '1×', name: 'Prime Ribeye Steak (400g)', price: '₦18,500' },
  { id: 'fries', qty: '1×', name: 'Truffle Parmesan Fries', price: '₦4,200' },
  { id: 'beer', qty: '2×', name: 'Cold Craft Draft Beer', price: '₦3,000' },
] as const;

export const tenderVat = { label: copy.tender.vatLabel, value: '₦1,928' } as const;

export const tenderCash = {
  presets: ['Exact', '₦28,000', '₦30,000', '₦40,000'] as const,
  tendered: '₦30,000',
  change: '₦2,372',
} as const;

export const tenderBank = {
  bank: 'Access Bank • Urban Grill Till 1',
  account: '0123849182',
} as const;

/* -------------------------------------------------------------------------- */
/* Completed sale receipt                                                     */
/* -------------------------------------------------------------------------- */

export const completedSale = {
  tillLabel: 'Till #01',
  receiptId: '#RC-94021',
  date: 'Today, Oct 17, 2024 • 02:45 PM',
  tender: 'Cash Tender',
  amount: '₦27,251',
  cashier: 'Emeka Okafor',
  customer: 'Michael James',
  phone: '+234 803 219 8831',
  points: '+276',
} as const;

export const completedLines: readonly {
  id: string;
  qty: string;
  name: string;
  note?: string;
  noteLabel?: string;
  price: string;
  wasPrice?: string;
}[] = [
  {
    id: 'ribeye',
    qty: '1×',
    name: 'Woodfire Ribeye Steak',
    note: 'Cut: 250g, Medium Rare',
    price: '₦16,000',
  },
  {
    id: 'smash',
    qty: '1×',
    name: 'Double Smash Burger & Fries',
    note: '10% Deal Applied (-₦650)',
    noteLabel: 'deal',
    wasPrice: '₦6,500',
    price: '₦5,850',
  },
  {
    id: 'mojito',
    qty: '1×',
    name: 'Passionfruit Mojito',
    note: 'Standard (Ice level: regular)',
    price: '₦3,500',
  },
] as const;

export const completedTotals = [
  {
    id: 'subtotal',
    label: copy.completed.subtotalLabel,
    value: '₦26,000',
    tone: 'default' as const,
  },
  {
    id: 'discount',
    label: copy.completed.discountLabel,
    value: '-₦650',
    tone: 'discount' as const,
  },
  {
    id: 'vat',
    label: copy.completed.vatLabel,
    value: '₦1,901',
    tone: 'default' as const,
  },
] as const;

export const completedCashBreakdown = [
  { id: 'cash', label: copy.completed.cashLabel, value: '₦30,000' },
  { id: 'change', label: copy.completed.changeLabel, value: '₦2,749' },
] as const;

/* -------------------------------------------------------------------------- */
/* Receipt customization                                                     */
/* -------------------------------------------------------------------------- */

export const receiptPreview = {
  address: 'Victoria Island, Plot 14 Admiralty Way, Lagos',
  tel: 'Tel: +234 (0) 812 900 4421',
  tin: 'TIN-8894102-NG',
  txn: 'TXN #88204-POS1',
  stamp: '14:32 • 28 OCT 2024',
  server: 'Server: Adebayo O.',
  phone: 'Phone: +234 ••• ••• 4410',
  subtotal: '₦20,400.00',
  vat: '₦1,530.00',
  consumptionTax: '₦1,020.00',
  total: '₦22,950.00',
  auth: 'AUTH #994012',
  points: 230,
} as const;

export const receiptPreviewLines: readonly {
  id: string;
  qty: string;
  name: string;
  note: string;
  price: string;
}[] = [
  {
    id: 'ribeye',
    qty: '1x',
    name: 'Woodfire Ribeye Steak',
    note: 'Medium Rare • Herb Butter Jus',
    price: '₦16,000.00',
  },
  {
    id: 'cooler',
    qty: '2x',
    name: 'Hibiscus Smoked Cooler',
    note: 'Signature Mocktail',
    price: '₦4,400.00',
  },
] as const;
