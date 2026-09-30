import type { IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';

const settings = strings.posGeneralSettings;
const hardware = strings.paymentHardwareSetup;

/* -------------------------------------------------------------------------- */
/* pos_general_settings                                                       */
/* -------------------------------------------------------------------------- */

export const posSettingsTelemetry = [
  {
    id: 'printer',
    title: settings.telemetryPrinter,
    meta: settings.telemetryPrinterMeta,
    icon: 'printerPos' as IconName,
  },
  {
    id: 'offline',
    title: settings.telemetryOffline,
    meta: settings.telemetryOfflineMeta,
    icon: 'database' as IconName,
  },
  {
    id: 'public',
    title: settings.telemetryPublic,
    meta: settings.telemetryPublicMeta,
    icon: 'wifi' as IconName,
  },
] as const;

export interface PosSettingsLink {
  id: string;
  title: string;
  body: string;
  icon: IconName;
  iconTone: 'brand' | 'tertiary';
  chips: { label: string; tone: 'success' | 'brand' | 'warning' | 'neutral' }[];
  route: string;
}

/** The four settings groups, each row pointing at its own destination. */
export const posSettingsLinks: readonly PosSettingsLink[] = [
  {
    id: 'receipt',
    title: 'Receipt & Order Customization',
    body: 'Store logo, footer notes, auto-print triggers, kitchen chits, paper width (80mm vs 58mm).',
    icon: 'receiptLong',
    iconTone: 'brand',
    chips: [
      { label: '80mm Wide', tone: 'neutral' },
      { label: 'Logo Enabled', tone: 'success' },
    ],
    route: 'PosReceiptCustomization',
  },
  {
    id: 'printers',
    title: 'Printers & Kitchen Displays',
    body: 'Epson TM-T88VI (ESC/POS), Sunmi V2 Pro mobile handheld, KDS IP display routing stream.',
    icon: 'printerPos',
    iconTone: 'brand',
    chips: [{ label: 'KDS Online (192.168.1.140)', tone: 'success' }],
    route: 'PaymentHardwareSetup',
  },
  {
    id: 'scanner',
    title: 'Barcode & QR Scanner',
    body: 'Rear camera auto-focus, continuous sound chimes, Honeywell Voyager 1200g USB tether.',
    icon: 'barcodeScan',
    iconTone: 'tertiary',
    chips: [
      { label: 'Beep on scan', tone: 'neutral' },
      { label: 'Honeywell Active', tone: 'success' },
    ],
    route: 'PaymentHardwareSetup',
  },
  {
    id: 'payments',
    title: 'Payment Methods & Tender Rails',
    body: 'Cash drawer auto-kick, Moniepoint & OPay card sync, dynamic bank transfer webhooks, split bills.',
    icon: 'wallet',
    iconTone: 'brand',
    chips: [
      { label: 'Moniepoint POS', tone: 'neutral' },
      { label: 'Instant Transfer', tone: 'brand' },
    ],
    route: 'PaymentHardwareSetup',
  },
  {
    id: 'taxes',
    title: 'Taxes & Surcharges',
    body: 'Statutory VAT (7.5%), Table Service Charge (5.0%), Dine-in vs Takeaway exemption overrides.',
    icon: 'percent',
    iconTone: 'tertiary',
    chips: [
      { label: 'VAT 7.5%', tone: 'neutral' },
      { label: 'Service 5%', tone: 'brand' },
    ],
    route: 'TaxesSurcharges',
  },
  {
    id: 'public-pos',
    title: 'Public POS & Self-Ordering',
    body: 'Table QR auto-assignment, instant kitchen chit alert, guest dine-in order restrictions.',
    icon: 'pointOfSale',
    iconTone: 'brand',
    chips: [{ label: '24 Tables Live', tone: 'success' }],
    route: 'PublicPosOrderMenu',
  },
  {
    id: 'offline',
    title: 'Offline Storage & Cloud Sync',
    body: 'Local SQLite 500-order capacity buffer, sync interval (30s), collision auto-resolution.',
    icon: 'cloudQueue',
    iconTone: 'tertiary',
    chips: [
      { label: '30s Auto-Sync', tone: 'neutral' },
      { label: 'Up to date', tone: 'success' },
    ],
    route: 'PosSyncReconciliation',
  },
  {
    id: 'workflow',
    title: 'Order Workflow & Kitchen Stream',
    body: 'Auto-accept orders toggle, prep time defaults (15-20 min), kitchen bell sound chimes.',
    icon: 'potMix',
    iconTone: 'brand',
    chips: [
      { label: 'Default: 18 min', tone: 'neutral' },
      { label: 'Auto-Accept On', tone: 'success' },
    ],
    route: 'MerchantPosKitchenStream',
  },
  {
    id: 'security',
    title: 'Staff POS Permissions & Supervisor PINs',
    body: 'Void/refund manager authorizations, open drawer without sale, discount caps (max 15%), till handoff sign-in.',
    icon: 'verifiedUser',
    iconTone: 'tertiary',
    chips: [
      { label: 'Supervisor PIN Enforced', tone: 'success' },
      { label: '4 Cashiers Active', tone: 'neutral' },
    ],
    route: 'StaffPermissionsPasscodes',
  },
] as const;

/** Section grouping for the settings hub, in design order. */
export const posSettingsGroups = [
  {
    id: 'hardware',
    title: settings.hardwareTitle,
    badge: settings.hardwareBadge,
    linkIds: ['receipt', 'printers', 'scanner'],
  },
  {
    id: 'payments',
    title: settings.paymentsTitle,
    badge: settings.paymentsBadge,
    linkIds: ['payments', 'taxes'],
  },
  {
    id: 'operations',
    title: settings.operationsTitle,
    badge: settings.operationsBadge,
    linkIds: ['public-pos', 'offline', 'workflow'],
  },
  {
    id: 'security',
    title: settings.securityTitle,
    badge: settings.securityBadge,
    linkIds: ['security'],
  },
] as const;

/* -------------------------------------------------------------------------- */
/* payment_hardware_setup                                                     */
/* -------------------------------------------------------------------------- */

export const posTerminalChannels = [
  { id: 'receipt', label: hardware.receiptBadge, icon: 'printerPos' as IconName },
  { id: 'push', label: hardware.pushBadge, icon: 'contactlessPay' as IconName },
  { id: 'drawer', label: hardware.drawerBadge, icon: 'wallet' as IconName },
] as const;

export interface PosTenderRail {
  id: string;
  title: string;
  badge: string | null;
  body: string;
  icon: IconName;
  accent: 'success' | 'brand' | 'tertiary';
  statusDot: boolean;
  switches: { id: string; title: string; body: string; on: boolean }[];
  detail?: {
    label: string;
    value: string;
    valueTone?: 'brand' | 'success' | 'tertiary';
    actions?: { id: string; label: string; primary?: boolean }[];
  };
  feature?: { title: string; value: string };
  warning?: string;
}

/** The five tender rails, each with its own switches and detail rows. */
export const posTenderRails: readonly PosTenderRail[] = [
  {
    id: 'cash',
    title: hardware.cashTitle,
    badge: hardware.cashBadge,
    body: hardware.cashBody,
    icon: 'cash',
    accent: 'success',
    statusDot: false,
    switches: [
      {
        id: 'cash-kick',
        title: hardware.cashDrawerTitle,
        body: hardware.cashDrawerBody,
        on: true,
      },
      {
        id: 'cash-exact',
        title: hardware.exactTenderTitle,
        body: hardware.exactTenderBody,
        on: false,
      },
    ],
  },
  {
    id: 'card',
    title: hardware.cardTitle,
    badge: null,
    body: hardware.cardBody,
    icon: 'contactlessPay',
    accent: 'brand',
    statusDot: true,
    switches: [
      {
        id: 'card-push',
        title: hardware.autoPushTitle,
        body: hardware.autoPushBody,
        on: true,
      },
    ],
    detail: {
      label: hardware.moniepointTitle,
      value: hardware.moniepointMeta,
      valueTone: 'brand',
      actions: [
        { id: 'moniepoint', label: hardware.moniepointAction, primary: true },
        { id: 'opay', label: hardware.opayAction },
        { id: 'sunmi', label: hardware.sunmiAction },
      ],
    },
  },
  {
    id: 'bank',
    title: hardware.bankTitle,
    badge: hardware.bankBadge,
    body: hardware.bankBody,
    icon: 'bank',
    accent: 'tertiary',
    statusDot: false,
    switches: [
      {
        id: 'bank-webhook',
        title: hardware.autoConfirmTitle,
        body: hardware.autoConfirmBody,
        on: true,
      },
    ],
    detail: {
      label: hardware.bankAccountLabel,
      value: hardware.bankAccountValue,
      actions: [{ id: 'copy-account', label: 'Copy' }],
    },
  },
  {
    id: 'one-tap',
    title: hardware.oneTapTitle,
    badge: hardware.oneTapBadge,
    body: hardware.oneTapBody,
    icon: 'qrCode',
    accent: 'brand',
    statusDot: false,
    switches: [],
    feature: { title: hardware.oneTapFeature, value: hardware.oneTapFeatureValue },
  },
  {
    id: 'house-tab',
    title: hardware.houseTabTitle,
    badge: null,
    body: hardware.houseTabBody,
    icon: 'briefcase',
    accent: 'tertiary',
    statusDot: false,
    switches: [
      {
        id: 'house-tab',
        title: hardware.houseTabTitle,
        body: hardware.houseTabBody,
        on: true,
      },
    ],
    warning: hardware.houseTabWarning,
  },
] as const;

export interface PosPeripheral {
  id: string;
  title: string;
  model: string;
  meta: string;
  icon: IconName;
  badge: string | null;
  badgeTone: 'success' | 'neutral';
  body?: string;
  signal?: string;
  cta?: string;
  switchId?: string;
}

/** Connected peripherals grouped by class. */
export const posPeripheralGroups = [
  {
    id: 'printers',
    title: hardware.printersTitle,
    meta: hardware.printersMeta,
    items: [
      {
        id: 'counter-printer',
        title: hardware.counterPrinterTitle,
        model: hardware.counterPrinterModel,
        meta: hardware.counterPrinterMeta,
        icon: 'receiptLong' as IconName,
        badge: null,
        badgeTone: 'neutral' as const,
        body: null,
        signal: hardware.signalLabel,
        cta: hardware.testFeedCta,
        switchId: null,
      },
      {
        id: 'kitchen-printer',
        title: hardware.kitchenTitle,
        model: hardware.kitchenModel,
        meta: hardware.kitchenMeta,
        icon: 'potMix' as IconName,
        badge: hardware.activeSyncBadge,
        badgeTone: 'success' as const,
        body: hardware.kitchenBody,
        signal: null,
        cta: hardware.pairCta,
        switchId: null,
      },
    ],
  },
  {
    id: 'drawer',
    title: hardware.drawerTitle,
    meta: hardware.drawerTriggerLabel,
    items: [
      {
        id: 'cash-drawer',
        title: hardware.drawerTitle,
        model: hardware.readyBadge,
        meta: hardware.drawerMeta,
        icon: 'wallet' as IconName,
        badge: hardware.readyBadge,
        badgeTone: 'success' as const,
        body: null,
        signal: null,
        cta: hardware.testDrawerCta,
        switchId: null,
      },
    ],
  },
  {
    id: 'scanners',
    title: hardware.scannerTitle,
    meta: hardware.scannerModel,
    items: [
      {
        id: 'phone-camera',
        title: hardware.fallbackTitle,
        model: hardware.scannerModel,
        meta: hardware.fallbackBody,
        icon: 'camera' as IconName,
        badge: null,
        badgeTone: 'neutral' as const,
        body: null,
        signal: null,
        cta: null,
        switchId: 'phone-camera',
      },
    ],
  },
] as const;
