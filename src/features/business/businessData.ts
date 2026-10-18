import type { ImageSourcePropType } from 'react-native';
import type { IconName } from '@components/ui/Icon';

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

export interface SocialPresence {
  id: string;
  label: string;
  handle: string;
  icon: IconName;
  iconTone: 'neutral' | 'success';
  verified: boolean;
}

export const roleTitles = [
  'Branch Manager',
  'Head Chef',
  'Store Supervisor',
  'Salon Director',
  'Lead Host',
] as const;

export const countryFlags = { nigeria: '🇳🇬' } as const;

/** Wuse 2, Abuja — from where_is_your_business_located/code.html. */
export const primaryBranchRegion = {
  latitude: 9.0765,
  longitude: 7.3986,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
} as const;
