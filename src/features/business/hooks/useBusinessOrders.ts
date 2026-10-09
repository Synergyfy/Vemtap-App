import { useQueries, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ordersApi,
  type BusinessOrdersList,
  type BusinessOrdersQuery,
  type CatalogueOrder,
} from '@api/ordersApi';

export const businessOrderKeys = {
  all: ['businessOrders'] as const,
  list: (query: BusinessOrdersQuery) =>
    [...businessOrderKeys.all, 'list', query] as const,
  detail: (id: string) => [...businessOrderKeys.all, 'detail', id] as const,
};

export function useBusinessOrders(query: BusinessOrdersQuery = {}) {
  return useQuery<BusinessOrdersList>({
    queryKey: businessOrderKeys.list(query),
    queryFn: () => ordersApi.listBusinessOrders(query),
    staleTime: 30_000,
  });
}

export function useBusinessOrderDetail(id?: string | null) {
  return useQuery<CatalogueOrder>({
    queryKey: businessOrderKeys.detail(id ?? ''),
    queryFn: () => ordersApi.getOrder(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateOrderStatus(id, status),
    onSuccess: updated => {
      queryClient.invalidateQueries({ queryKey: businessOrderKeys.all });
      queryClient.setQueryData(businessOrderKeys.detail(updated.id), updated);
    },
  });
}

// ---------------------------------------------------------------------------
// Presentation
// ---------------------------------------------------------------------------

export type OrderChannelTone = 'brand' | 'neutral' | 'warning' | 'success' | 'muted';

export interface PresentedOrder {
  id: string;
  reference: string;
  status: string;
  channel: string;
  channelTone: OrderChannelTone;
  fulfilment: string;
  time: string;
  urgent: boolean;
  customer: string;
  items: string;
  amount: string;
  payment: string;
  cta?: string;
  ctaStyle?: 'primary' | 'neutral' | 'link';
  /** Status the CTA applies via `PATCH /catalogue/orders/:id/status`. */
  nextStatus?: string;
  muted: boolean;
}

interface StatusPresentation {
  channel: string;
  tone: OrderChannelTone;
  cta?: string;
  ctaStyle?: 'primary' | 'neutral' | 'link';
  nextStatus?: string;
  urgent?: boolean;
  muted?: boolean;
}

const STATUS_PRESENTATION: Record<string, StatusPresentation> = {
  new: {
    channel: 'New',
    tone: 'brand',
    cta: 'Accept',
    ctaStyle: 'primary',
    nextStatus: 'processing',
    urgent: true,
  },
  processing: {
    channel: 'Processing',
    tone: 'warning',
    cta: 'Mark Ready',
    ctaStyle: 'link',
    nextStatus: 'ready',
  },
  ready: {
    channel: 'Ready',
    tone: 'success',
    cta: 'Handover',
    ctaStyle: 'link',
    nextStatus: 'completed',
  },
  completed: { channel: 'Completed', tone: 'muted', muted: true },
  cancelled: { channel: 'Cancelled', tone: 'muted', muted: true },
  rejected: { channel: 'Rejected', tone: 'muted', muted: true },
  refunded: { channel: 'Refunded', tone: 'muted', muted: true },
  partial_refund: {
    channel: 'Partially Refunded',
    tone: 'muted',
    muted: true,
  },
};

const FALLBACK_PRESENTATION: StatusPresentation = {
  channel: 'Order',
  tone: 'neutral',
};

/** `4m ago` / `2h ago` / `Yesterday`; empty when the timestamp is unreadable. */
export function relativeOrderTime(iso?: string | null): string {
  if (!iso) return '';
  const timestamp = Date.parse(iso);
  if (!Number.isFinite(timestamp)) return '';

  const minutes = Math.floor(Math.max(0, Date.now() - timestamp) / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
}

function formatOrderAmount(value: unknown): string {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return '—';
  return `₦${number.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

/** Turns a wire order into the fields the Orders hub renders. */
export function presentOrder(order: CatalogueOrder): PresentedOrder {
  const status = (order.status ?? 'new').toLowerCase();
  const presentation = STATUS_PRESENTATION[status] ?? FALLBACK_PRESENTATION;

  const items = order.items ?? [];
  const itemCount = items.length;
  const firstName = items[0]?.name?.trim();
  const extra = Math.max(0, itemCount - 1);
  const itemSummary =
    itemCount === 0
      ? 'No items'
      : itemCount === 1
        ? `1 item${firstName ? ` (${firstName})` : ''}`
        : `${itemCount} items${firstName ? ` (${firstName} + ${extra})` : ''}`;

  const customerName = [order.customer?.firstName, order.customer?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  const fulfilment = order.tableNumber
    ? `Table ${order.tableNumber}`
    : order.bookingDate
      ? 'Scheduled'
      : order.notes
        ? order.notes
        : 'Pickup';

  // The wire has no payment field; the device tells POS apart from online.
  const payment = order.deviceId
    ? 'POS Terminal · In-Store'
    : 'In-App Order · Pay Online';

  return {
    id: order.id,
    reference: `#${order.id.slice(0, 8).toUpperCase()}`,
    status,
    channel: presentation.channel,
    channelTone: presentation.tone,
    fulfilment,
    time: relativeOrderTime(order.createdAt),
    urgent: presentation.urgent ?? false,
    customer: customerName || 'Walk-In Guest',
    items: itemSummary,
    amount: formatOrderAmount(order.totalAmount),
    payment,
    cta: presentation.cta,
    ctaStyle: presentation.ctaStyle,
    nextStatus: presentation.nextStatus,
    muted: presentation.muted ?? false,
  };
}

// ---------------------------------------------------------------------------
// Order detail
// ---------------------------------------------------------------------------

export interface OrderDetailLine {
  id: string;
  name: string;
  image?: string;
  quantity: number;
  unitPriceLabel: string;
  lineTotalLabel: string;
}

export type OrderDetailTimelineState = 'done' | 'active' | 'pending';

export interface OrderDetailTimelineStep {
  id: string;
  title: string;
  body: string;
  time: string;
  state: OrderDetailTimelineState;
}

export interface OrderDetailView {
  id: string;
  reference: string;
  branchName: string;
  status: string;
  statusLabel: string;
  statusTitle: string;
  statusTime: string;
  showTriage: boolean;
  /** True once the kitchen has the ticket (status beyond `new`). */
  kitchenAccepted: boolean;
  customer: {
    name: string;
    phone: string;
    email: string;
    avatar?: string;
  };
  notes?: string;
  items: OrderDetailLine[];
  itemsCountLabel: string;
  subtotalLabel: string;
  totalLabel: string;
  loyaltyAwarded: boolean;
  fulfilment: { branch: string; station: string; note: string };
  timeline: OrderDetailTimelineStep[];
  canMarkProcessing: boolean;
  canMarkReady: boolean;
  canComplete: boolean;
  canRefund: boolean;
}

const DETAIL_STATUS_LABELS: Record<
  string,
  { label: string; title: string; rank: number }
> = {
  new: {
    label: 'New Incoming Order',
    title: 'Awaiting Kitchen Acceptance',
    rank: 0,
  },
  processing: {
    label: 'In Progress',
    title: 'Being prepared by the kitchen',
    rank: 1,
  },
  ready: { label: 'Ready', title: 'Waiting for customer handover', rank: 2 },
  completed: { label: 'Completed', title: 'Order completed', rank: 3 },
  cancelled: { label: 'Cancelled', title: 'Order cancelled', rank: -1 },
  rejected: { label: 'Rejected', title: 'Order rejected', rank: -1 },
  refunded: { label: 'Refunded', title: 'Order refunded', rank: -1 },
  partial_refund: {
    label: 'Partially Refunded',
    title: 'Part of this order was refunded',
    rank: -1,
  },
};

const TIMELINE_STEPS = [
  { id: 'placed', title: 'Order Placed', body: 'Order received by the business' },
  { id: 'accepted', title: 'Accepted', body: 'Kitchen confirmed the ticket' },
  { id: 'ready', title: 'Ready', body: 'Packed and waiting for handover' },
  { id: 'completed', title: 'Completed', body: 'Handed over to the customer' },
];

/** Turns a wire order into everything the detail screen renders. */
export function presentOrderDetail(order: CatalogueOrder): OrderDetailView {
  const status = (order.status ?? 'new').toLowerCase();
  const meta = DETAIL_STATUS_LABELS[status] ?? DETAIL_STATUS_LABELS.new;

  const items: OrderDetailLine[] = (order.items ?? []).map(line => ({
    id: line.id ?? line.itemId ?? line.name ?? 'line',
    name: line.name?.trim() || 'Item',
    image: line.image ?? undefined,
    quantity: line.quantity ?? 1,
    unitPriceLabel: formatOrderAmount(line.unitPrice),
    lineTotalLabel: formatOrderAmount(line.totalPrice),
  }));

  const totalQuantity = items.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = (order.items ?? []).reduce((sum, line) => {
    const value =
      typeof line.totalPrice === 'number' ? line.totalPrice : Number(line.totalPrice);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  const customerName = [order.customer?.firstName, order.customer?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  const station = order.tableNumber ? `Table ${order.tableNumber}` : 'Counter';
  const fulfilmentNote = order.bookingDate
    ? `Scheduled for ${order.bookingDate}${order.bookingTime ? ` at ${order.bookingTime}` : ''}`
    : order.notes
      ? order.notes
      : 'Pay at Business Location (Counter Pickup)';

  const timeline = TIMELINE_STEPS.map((step, index) => {
    const reached = meta.rank >= index;
    const isLatest = meta.rank === index;
    const state: OrderDetailTimelineState = reached
      ? isLatest && meta.rank < TIMELINE_STEPS.length - 1
        ? 'active'
        : 'done'
      : 'pending';
    return {
      ...step,
      state,
      time:
        index === 0
          ? relativeOrderTime(order.createdAt)
          : isLatest
            ? relativeOrderTime(order.updatedAt)
            : '',
    };
  });

  return {
    id: order.id,
    reference: `#${order.id.slice(0, 8).toUpperCase()}`,
    branchName: order.branch?.name?.trim() || 'Main Branch',
    status,
    statusLabel: meta.label,
    statusTitle: meta.title,
    statusTime: relativeOrderTime(order.updatedAt ?? order.createdAt),
    showTriage: status === 'new',
    kitchenAccepted: meta.rank >= 1,
    customer: {
      name: customerName || 'Walk-In Guest',
      phone: order.customer?.phone ?? '',
      email: order.customer?.email ?? '',
      avatar: order.customer?.avatar ?? undefined,
    },
    notes: order.notes ?? undefined,
    items,
    itemsCountLabel: `${items.length} item${items.length === 1 ? '' : 's'}, ${totalQuantity} qty`,
    subtotalLabel: formatOrderAmount(subtotal),
    totalLabel: formatOrderAmount(order.totalAmount),
    loyaltyAwarded: order.loyaltyAwarded === true,
    fulfilment: {
      branch: order.branch?.name?.trim() || 'Main Branch',
      station,
      note: fulfilmentNote,
    },
    timeline,
    canMarkProcessing: status === 'new',
    canMarkReady: status === 'processing',
    canComplete: status === 'ready',
    canRefund: status === 'completed',
  };
}

// ---------------------------------------------------------------------------
// Counts
// ---------------------------------------------------------------------------

const COUNT_STATUSES = ['new', 'processing', 'ready', 'completed', 'cancelled'] as const;

export interface BusinessOrderCounts {
  counts: Record<(typeof COUNT_STATUSES)[number], number>;
  orderTotal: number;
  bookingTotal: number;
  isLoading: boolean;
}

/**
 * Per-status totals for the tab/filter chips. Each probe asks for `limit=1` and
 * reads `total`, so the badges stay honest without a dedicated stats endpoint.
 */
export function useBusinessOrderCounts(branchId?: string | null): BusinessOrderCounts {
  const statusQueries = useQueries({
    queries: COUNT_STATUSES.map(status => ({
      queryKey: [
        ...businessOrderKeys.all,
        'count',
        'order',
        status,
        branchId ?? 'all',
      ] as const,
      queryFn: () =>
        ordersApi.listBusinessOrders({
          status,
          type: 'order',
          branchId: branchId ?? undefined,
          page: 1,
          limit: 1,
        }),
      select: (data: BusinessOrdersList) => data.total ?? data.data.length,
      staleTime: 30_000,
    })),
  });

  const totalQueries = useQueries({
    queries: (['order', 'booking'] as const).map(type => ({
      queryKey: [
        ...businessOrderKeys.all,
        'count',
        type,
        'all',
        branchId ?? 'all',
      ] as const,
      queryFn: () =>
        ordersApi.listBusinessOrders({
          type,
          branchId: branchId ?? undefined,
          page: 1,
          limit: 1,
        }),
      select: (data: BusinessOrdersList) => data.total ?? data.data.length,
      staleTime: 30_000,
    })),
  });

  const counts = Object.fromEntries(
    COUNT_STATUSES.map((status, index) => [status, statusQueries[index]?.data ?? 0]),
  ) as BusinessOrderCounts['counts'];

  return {
    counts,
    orderTotal: totalQueries[0]?.data ?? 0,
    bookingTotal: totalQueries[1]?.data ?? 0,
    isLoading:
      statusQueries.some(query => query.isLoading) ||
      totalQueries.some(query => query.isLoading),
  };
}
