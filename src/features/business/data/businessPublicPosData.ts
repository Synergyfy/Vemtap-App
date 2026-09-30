import type { IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';

const cart = strings.publicPosCartReview;
const menu = strings.publicPosMenu;
const stream = strings.merchantPosKitchenStream;

/* -------------------------------------------------------------------------- */
/* public_pos_live_order_tracking                                             */
/* -------------------------------------------------------------------------- */

export type PosPrepState = 'done' | 'active' | 'pending';

export interface PosPrepStep {
  id: string;
  title: string;
  body: string;
  time: string;
  state: PosPrepState;
  icon: IconName;
}

/** The four-stage prep timeline the guest watches. */
export const publicPosPrepSteps: readonly PosPrepStep[] = [
  {
    id: 'received',
    title: 'Order Received',
    body: 'Ticket sent to POS & Kitchen Stream',
    time: '14:32',
    state: 'done',
    icon: 'checkCircle',
  },
  {
    id: 'queued',
    title: 'Accepted & In Queue',
    body: 'Confirmed by Cashier Emeka O.',
    time: '14:33',
    state: 'active',
    icon: 'restaurant',
  },
  {
    id: 'preparing',
    title: 'Preparing in Kitchen',
    body: 'Line chef is grilling and plating',
    time: '',
    state: 'pending',
    icon: 'potMix',
  },
  {
    id: 'served',
    title: 'Ready & Served',
    body: 'Food being brought to Table 04',
    time: '',
    state: 'pending',
    icon: 'roomService',
  },
];

export interface PublicPosOrderLine {
  id: string;
  qty: string;
  name: string;
  price: string;
  modifier: string;
}

/** Line items shared by the tracking summary and the kitchen stream. */
export const publicPosOrderLines: readonly PublicPosOrderLine[] = [
  {
    id: 'ribeye',
    qty: '1\u00d7',
    name: 'Woodfire Ribeye Steak',
    price: '\u20a616,000',
    modifier: 'Medium rare',
  },
  {
    id: 'burger',
    qty: '1\u00d7',
    name: 'Double Smash Burger',
    price: '\u20a66,500',
    modifier: 'No pickles',
  },
  {
    id: 'mojito',
    qty: '1\u00d7',
    name: 'Passionfruit Mojito',
    price: '\u20a63,500',
    modifier: 'Chilled, extra ice',
  },
];

/* -------------------------------------------------------------------------- */
/* public_pos_cart_review_submit_order                                         */
/* -------------------------------------------------------------------------- */

export interface PublicPosCartLine {
  id: string;
  name: string;
  price: string;
  quantity: number;
  note: string | null;
  icon: IconName;
}

/** The guest tray under review, with per-line kitchen notes. */
export const publicPosCartLines: readonly PublicPosCartLine[] = [
  {
    id: 'ribeye',
    name: 'Woodfire Ribeye Steak (250g)',
    price: '\u20a616,000',
    quantity: 1,
    note: 'Medium rare, extra peppercorn sauce',
    icon: 'grill',
  },
  {
    id: 'burger',
    name: 'Double Smash Burger',
    price: '\u20a66,500',
    quantity: 1,
    note: 'No pickles, extra napkins please',
    icon: 'burger',
  },
  {
    id: 'mojito',
    name: 'Passionfruit Mojito',
    price: '\u20a63,500',
    quantity: 1,
    note: null,
    icon: 'glassCocktail',
  },
];

export const publicPosBillRows = [
  { id: 'subtotal', label: cart.subtotalLabel, value: '\u20a626,000', rate: null },
  {
    id: 'service',
    label: cart.serviceLabel,
    value: '\u20a61,950',
    rate: cart.serviceRate,
  },
] as const;

/* -------------------------------------------------------------------------- */
/* public_pos_order_from_urban_grill_bistro                                   */
/* -------------------------------------------------------------------------- */

export const publicPosMenuCategories = [
  { id: 'combos', label: menu.categoryCombos, icon: 'localOffer' as IconName },
  { id: 'grills', label: menu.categoryGrills, icon: 'grill' as IconName },
  { id: 'mains', label: menu.categoryMains, icon: 'burger' as IconName },
  { id: 'sides', label: menu.categorySides, icon: 'food' as IconName },
  { id: 'drinks', label: menu.categoryDrinks, icon: 'glassCocktail' as IconName },
] as const;

export type PublicPosMenuLayout = 'feature' | 'wide' | 'row' | 'tile';

export interface PublicPosMenuItem {
  id: string;
  name: string;
  body: string;
  price: string;
  wasPrice: string | null;
  layout: PublicPosMenuLayout;
  badge: string | null;
  badgeTone: 'warning' | 'success' | 'neutral' | 'brand';
  cta: string;
  special: boolean;
}

/** The five menu entries the design shows, in order. */
export const publicPosMenuItems: readonly PublicPosMenuItem[] = [
  {
    id: 'ribeye',
    name: 'Woodfire Ribeye Steak (250g)',
    body: '250g Prime cut, chimichurri or truffle jus. Served with roasted bone marrow essence.',
    price: '\u20a616,000',
    wasPrice: null,
    layout: 'feature',
    badge: menu.itemPriceLabel,
    badgeTone: 'neutral',
    cta: menu.addCta,
    special: true,
  },
  {
    id: 'combo',
    name: 'Prime Lunch Combo Pass',
    body: "Ribeye/burger + Truffle fries + Mojito. The bistro's most beloved lunchtime trio.",
    price: '\u20a69,600',
    wasPrice: '\u20a612,000',
    layout: 'feature',
    badge: menu.dealBadge,
    badgeTone: 'success',
    cta: menu.addPlusCta,
    special: false,
  },
  {
    id: 'burger',
    name: 'Double Smash Burger',
    body: 'Double beef patty, cheddar, house secret sauce, brioche.',
    price: '\u20a66,500',
    wasPrice: null,
    layout: 'wide',
    badge: null,
    badgeTone: 'neutral',
    cta: menu.addCta,
    special: false,
  },
  {
    id: 'wings',
    name: 'Charcoal BBQ Wings (6pcs)',
    body: 'Smoky glaze, ranch dip. Cooked over open embers.',
    price: '\u20a64,800',
    wasPrice: null,
    layout: 'wide',
    badge: menu.prepBadge,
    badgeTone: 'warning',
    cta: menu.addCta,
    special: false,
  },
  {
    id: 'fries',
    name: 'Truffle Parmesan Fries',
    body: 'Freshly cut, shaved parmesan, garlic aioli.',
    price: '\u20a63,200',
    wasPrice: null,
    layout: 'tile',
    badge: null,
    badgeTone: 'neutral',
    cta: menu.addCta,
    special: false,
  },
  {
    id: 'mojito',
    name: 'Passionfruit Mojito',
    body: 'Fresh mint, crushed lime, sparkling soda.',
    price: '\u20a63,500',
    wasPrice: null,
    layout: 'tile',
    badge: menu.nonAlcBadge,
    badgeTone: 'neutral',
    cta: menu.addCta,
    special: false,
  },
];

/* -------------------------------------------------------------------------- */
/* merchant_pos_live_orders_kitchen_stream                                     */
/* -------------------------------------------------------------------------- */

export const merchantPosStreamTabs = [
  { id: 'new', label: stream.tabNew, count: '1' },
  { id: 'preparing', label: stream.tabPreparing, count: '2' },
  { id: 'ready', label: stream.tabReady, count: '1' },
  { id: 'completed', label: stream.tabCompleted, count: null },
] as const;

export interface MerchantPosStreamLine {
  id: string;
  qty: string;
  name: string;
  note: string;
  price: string;
}

/** Kitchen-side line notes differ from the guest's, so they are their own list. */
export const merchantPosStreamLines: readonly MerchantPosStreamLine[] = [
  {
    id: 'ribeye',
    qty: '1',
    name: 'Woodfire Ribeye Steak (250g)',
    note: 'Medium rare \u2022 Extra peppercorn sauce',
    price: '\u20a616,000',
  },
  {
    id: 'burger',
    qty: '1',
    name: 'Double Smash Burger',
    note: 'No pickles \u2022 Toasted brioche',
    price: '\u20a66,500',
  },
  {
    id: 'mojito',
    qty: '1',
    name: 'Passionfruit Mojito',
    note: 'Standard ice \u2022 Fresh mint',
    price: '\u20a63,500',
  },
] as const;

export const merchantPosStreamFooterStats = [
  {
    id: 'active',
    label: stream.activeLabel,
    value: stream.activeValue,
    icon: 'bolt' as IconName,
  },
  {
    id: 'prep',
    label: stream.avgPrepLabel,
    value: stream.avgPrepValue,
    icon: 'schedule' as IconName,
  },
  {
    id: 'alerts',
    label: stream.alertsLabel,
    value: stream.alertsValue,
    icon: 'volumeHigh' as IconName,
  },
] as const;
