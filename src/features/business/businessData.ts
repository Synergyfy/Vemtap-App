import type { ImageSourcePropType } from 'react-native';
import type { IconName } from '@components/ui/Icon';

const imgGrillSteak = require('../../../assets/images/saved-urban-grill.jpg');
const imgTruffleBurger = require('../../../assets/images/urban-burger.svg');

export interface BusinessPillar {
  id: string;
  icon: IconName;
  title: string;
  tag: string;
  body: string;
  iconTone: 'brand' | 'tertiary' | 'success' | 'neutral' | 'secondary';
}

export interface BranchSummary {
  id: string;
  name: string;
  businessLine: string;
  imageUri: string;
  isPrimary: boolean;
  address: string;
  phone: string;
  openStatus: string;
  hours: string;
}

export interface CatalogItem {
  id: string;
  kind: 'product' | 'service';
  category: string;
  title: string;
  image?: ImageSourcePropType;
  priceSummary: string;
  priceNote?: string;
  multiPrice?: boolean;
  availability: string;
  availabilityIcon: IconName;
  availabilityTone: 'success' | 'secondary';
  meta: string;
}

/** Storefront/brand imagery from the design HTML (fictional merchant). */
export const businessIntroImages = {
  storefront:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB7VJ8JNjHJ0uS4JHqrmLKsEC0tCKPx4ED6YqbemmgcD8vUTLqn4md1wtoEZCmWb_S_gjqvHJ-Rpicyf2UtmxW9WFZNZeQvCRrNUr-je58febAvDU0YfWhvC9qnydKO5Q6gWO9mfGF3S2VS7F8FgfQ2lVj428tVpSL6sOY66VgbNAEODyqSHGZ4vIV1vXHf9vj7V7Df0jtacbhCeEX0hG1XK6joz3Dzt5zSQ86y3j51DyAtsp_DOaX74Q',
  founder:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAypQNsk6dBsi36LWSaNNqDgRQRvC2cFSY7427uY3wIIeDGRq_7nJiFRTR5SZvl7DXY8JZV5Z7hG9PjVoPxkqROuoPK1MovTomS60L9pgPPBhQIi5yMw7XmtY9eIyKBz-sm5JzEf4t-C5wcEmv0hjxfro-xt7xR1XFVcYtqitLk3538EpJmaAbPjDNsNFE3xe_mnMP6Q7twls8ClCBQ20kkZesYAIEnrQMxyyh6IJgDansPWEdsJHoJjw',
} as const;

export const businessBrandingImages = {
  cover:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB6Bmp2JXF0_L9X5Y8f-viSlV4zmpflw50Wewkumd3pttDJ7MxzlQhqYL5HmRZQFb_DQkazYpgOc2tNmSvjUEoH05XniatWUFuM7GbW_tfHS84uYYrkIoH1G5vwQeijYdBp7qpzA88DlKhosyHtVPBLDamn6p3k67H33ceY6PUX7UQokHWh7MeNyNuDcWlAZIZNQoFV2HiGalkELPTXNLaLlWYo8O9bvmRlEygFUlAluWPpjQBi7nuvCA',
  gallery: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB6cGT5T73djW8zj1lJUr4qoC538qxZPKnX7DBfGQr5gKnGSBth8v5Cb08HwMc0mvDGz8buSsvlxQtOiGaB593yvPiIQCIBC0zwAsl6FAk9C6x_-E75GmjIKFNIRG9xwJFXFPaSoAl7NY5rFfPDe5rwOsJkDHC9GdOExv8C_urKt67FZIbgvyrYvlsok0PRo2WjUW5b7Dbp07C4PvpN2wr5oDqeZCsGEhmw0aaqaWBhXBWLSSfRAIZqgg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDmrRtVAOLR9hiYWqgEok0KgFl3L_Dde0E-W6KZAkX4vMPoAOagxYg8FGsryD-ISsD7DObhvuiGEsm904AoKxRnuU69uf39U_l97z1daI2tAjfP9IvdkeoTgEi-t-06owQYvHmDuBhgNlNIhK1Cc-mEtcYMnWwlijsLHZIaAnX72B56bhaGT9JG59qKX4Xez8-omegcmHJIGDU0y5RWyOULzry5MnZ48dY72WuEDj55c5NzsOSGX_1CDw',
  ],
  feed: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzjzOBwUpuQS_1AMCsRI7RpDfjlmJc58sI3hufN6uvd-7Kpbd3-dptWv6AwPOxtcKj1CPBZLlQ_VXuQs8Kn-yDL1gKWpHbqJN_7LKO4qayEqcRTvW7qIFrarALWy4y0hY8SMLtWNniLJux1Rqbtvgrvq0ZUAe1_FYG6zQ6cAtpf3EHJtQTjQ8XV-IA8o2fTZpOlLNsSypHrjceNqMYzQechet-WjVxubRp7mm25hhlG3ysQBboAmo9Eg',
} as const;

export const introPillars: BusinessPillar[] = [
  {
    id: 'discover',
    icon: 'nearMe',
    title: 'Get Discovered Locally',
    tag: 'Priority Feed',
    body: 'Reach verified shoppers within walking distance actively browsing real-time district deals.',
    iconTone: 'brand',
  },
  {
    id: 'deals',
    icon: 'bolt',
    title: 'Deals & Flash Drops',
    tag: 'Demand Boost',
    body: 'Launch instant, time-boxed vouchers to instantly ignite footfall during off-peak hours.',
    iconTone: 'tertiary',
  },
  {
    id: 'commission',
    icon: 'payments',
    title: 'Zero Commission Sales',
    tag: '0% Take Rate',
    body: 'Direct consumer settlement. VEMTAP never taxes your in-store register sales or service appointments.',
    iconTone: 'success',
  },
  {
    id: 'qr',
    icon: 'qrCodeScanner',
    title: 'Instant QR & Tap Passes',
    tag: '1-Sec Check-in',
    body: 'Tamper-proof digital vouchers validated with a fast smartphone camera scan or NFC tap.',
    iconTone: 'neutral',
  },
  {
    id: 'menu',
    icon: 'restaurant',
    title: 'Showcase Menu & Services',
    tag: 'Visual Catalog',
    body: 'Highlight signature dishes, treatment menus, and store collections with direct booking inquiry.',
    iconTone: 'brand',
  },
  {
    id: 'chat',
    icon: 'message',
    title: 'Direct In-App Chat',
    tag: 'Real-Time',
    body: 'Chat directly with customers, confirm reservation times, and curate bespoke custom orders.',
    iconTone: 'secondary',
  },
  {
    id: 'loyalty',
    icon: 'loyalty',
    title: 'Smart Retention & Perks',
    tag: 'Auto-Loyalty',
    body: 'Turn one-time walk-ins into repeat regulars with automated digital punch-cards and loyalty tiers.',
    iconTone: 'tertiary',
  },
  {
    id: 'insights',
    icon: 'insights',
    title: 'Live Business Insights',
    tag: 'Analytics',
    body: 'Monitor district impressions, voucher conversions, and peak walk-in hours in a unified cockpit.',
    iconTone: 'brand',
  },
];

export const primaryCategories = [
  'Restaurant & Dining',
  'Spa & Wellness',
  'Fashion & Apparel',
  'Groceries & Market',
  'Local Services & Repair',
] as const;

export const subcategorySpecialties = [
  'Grill & Steakhouse',
  'Bistro & Cafe',
  'Fast Casual',
  'Fine Dining',
  'Bakery',
] as const;

export interface SocialPresence {
  id: string;
  label: string;
  handle: string;
  icon: IconName;
  iconTone: 'neutral' | 'success';
  verified: boolean;
}

export const socialPresences: SocialPresence[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@urbangrill_lagos',
    icon: 'camera',
    iconTone: 'neutral',
    verified: true,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp Direct',
    handle: 'wa.me/2348035559821',
    icon: 'whatsapp',
    iconTone: 'success',
    verified: true,
  },
  {
    id: 'x',
    label: 'X (Twitter)',
    handle: '@urbangrillng',
    icon: 'localOffer',
    iconTone: 'neutral',
    verified: false,
  },
];

export const branchSummaries: BranchSummary[] = [
  {
    id: 'wuse',
    name: '1 — Wuse Branch',
    businessLine: 'Urban Grill & Bistro • Wuse 2, Abuja',
    imageUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDtfIdm0PJVpxgX9T0BGdNmwL_60wcP11Yoi8jOWp41Is39-kA5h1AxEP8yQOtQIzODYy_k2YqsZO0uOUJmnPcLasfJ_qdstZ7MfQ8kj7mYUeBO1WpXVl0CA6ORZG4oNNcIgfFm8E6zy45GybxpJs9fMXxEaaEP9cRSSZ1ZPYm6K9w3LoHBAbrOP9WDmZquq2SJGqm4wDFlFI8aM5bpokbcVBhUPzllqqpzQeu-jNZaG0NzCXgs3t9zOA',
    isPrimary: true,
    address: 'Plot 1428 Adetokunbo Ademola Cres',
    phone: '+234 803 555 9821',
    openStatus: 'Open today',
    hours: '· 8:00 AM – 10:00 PM (Mon–Sun)',
  },
  {
    id: 'garki',
    name: '2 — Garki Branch',
    businessLine: 'Urban Grill & Bistro • Area 11 Arcade, Garki',
    imageUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuANJsmk1CZ7kqu-LkWt0xVGy3vQvAAan2Uh7Ae-lqlm1Rb8RiLOXtVOsxfmEPOizvnkLCegPcvq3NuOtbzguW_cqVTZV7750yTTpjC89dxUFwN3hFP4roCjyXSypNYEmwIgel6-zKkx9izBn56_TuVnPMWYVUx2G_5Axi-hkLlDfm8UQlIel1tu2ulnv3nGiT3Vtm8zhh7UaXbbP83y0fenbLPpvzRNj0A7mbkLzZpE7qRna9LuP2INkg',
    isPrimary: false,
    address: 'Suite 4B, Garki Mall',
    phone: '+234 803 555 9825',
    openStatus: 'Open today',
    hours: '· 9:00 AM – 9:30 PM (Mon–Sat)',
  },
];

export const roleTitles = [
  'Branch Manager',
  'Head Chef',
  'Store Supervisor',
  'Salon Director',
  'Lead Host',
] as const;

export const catalogItems: CatalogItem[] = [
  {
    id: 'ribeye',
    kind: 'product',
    category: 'Food & Dining • Grill',
    title: 'Woodfire Aged Ribeye Steak',
    image: imgGrillSteak,
    priceSummary: '₦12,000 (Wuse) • ₦12,500 (Garki)',
    multiPrice: true,
    availability: 'Available at 2/2 branches',
    availabilityIcon: 'storefront',
    availabilityTone: 'success',
    meta: 'Inventory: 48 units',
  },
  {
    id: 'truffle-burger',
    kind: 'product',
    category: 'Food & Dining • Gourmet',
    title: 'Artisanal Prime Truffle Burger',
    image: imgTruffleBurger,
    priceSummary: '₦9,600',
    priceNote: 'Uniform price',
    availability: 'Wuse Branch only',
    availabilityIcon: 'locationOn',
    availabilityTone: 'secondary',
    meta: 'Ready in 20 mins',
  },
  {
    id: 'tasting',
    kind: 'service',
    category: 'Dine-in Experience',
    title: 'Executive Table Reservation & Tasting',
    priceSummary: '₦25,000',
    priceNote: 'per person • 90 mins',
    availability: 'Available at all branches',
    availabilityIcon: 'verified',
    availabilityTone: 'success',
    meta: 'Pre-booking required',
  },
];

export const countryFlags = { nigeria: '🇳🇬' } as const;

/** Wuse 2, Abuja — from where_is_your_business_located/code.html. */
export const primaryBranchRegion = {
  latitude: 9.0765,
  longitude: 7.3986,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
} as const;
