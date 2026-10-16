import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { createIdempotencyKey } from '@api/client';
import {
  posApi,
  type DisplayTicketInput,
  type GuestOrderInput,
  type HoldSaleInput,
  type KitchenStatus,
  type NewSaleInput,
  type PeripheralConnection,
  type PeripheralType,
  type PosCustomerSegment,
  type PosOverrideAction,
  type PosSalesQuery,
  type PosSettingsUpdate,
  type SplitPreviewInput,
} from '@api/posApi';
import { businessDashboardKeys } from '@features/business/hooks/useBusinessDashboardData';

/**
 * Business POS data. One key factory so a sale, refund or settings change can
 * invalidate exactly the views that show it.
 */
export const posKeys = {
  all: ['pos'] as const,
  settings: () => ['pos', 'settings'] as const,
  settingsSummary: () => ['pos', 'settings', 'summary'] as const,
  register: () => ['pos', 'register'] as const,
  zReport: () => ['pos', 'register', 'z-report'] as const,
  tills: (branchId: string | null) => ['pos', 'tills', branchId ?? 'all'] as const,
  branchSummary: () => ['pos', 'branches', 'summary'] as const,
  sales: (query: PosSalesQuery) => ['pos', 'sales', query] as const,
  sale: (id: string) => ['pos', 'sale', id] as const,
  held: (branchId: string | null) => ['pos', 'held', branchId ?? 'all'] as const,
  customers: (query: object) => ['pos', 'customers', query] as const,
  customer: (id: string) => ['pos', 'customer', id] as const,
  customerRewards: (id: string, branchId: string | null) =>
    ['pos', 'customer', id, 'rewards', branchId ?? 'all'] as const,
  stockMovements: (itemId: string) => ['pos', 'stock', itemId] as const,
  staffPins: () => ['pos', 'staff-pins'] as const,
  overrides: () => ['pos', 'staff-pins', 'overrides'] as const,
  peripherals: (branchId: string | null) =>
    ['pos', 'peripherals', branchId ?? 'all'] as const,
  kitchen: (branchId: string | null) => ['pos', 'kitchen', branchId ?? 'mine'] as const,
  display: (tillId: string) => ['pos', 'display', tillId] as const,
  tracking: (token: string) => ['pos', 'tracking', token] as const,
  guestOrdering: (branchId: string) => ['pos', 'guest-ordering', branchId] as const,
};

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export function usePosSettings() {
  return useQuery({
    queryKey: posKeys.settings(),
    queryFn: () => posApi.getSettings(),
    staleTime: 300_000,
  });
}

export function usePosSettingsSummary() {
  return useQuery({
    queryKey: posKeys.settingsSummary(),
    queryFn: () => posApi.getSettingsSummary(),
    staleTime: 60_000,
  });
}

export function useUpdatePosSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PosSettingsUpdate) => posApi.updateSettings(body),
    onSuccess: settings => {
      queryClient.setQueryData(posKeys.settings(), settings);
      void queryClient.invalidateQueries({ queryKey: posKeys.settingsSummary() });
    },
  });
}

// ---------------------------------------------------------------------------
// Register, tills, branches
// ---------------------------------------------------------------------------

export function useRegisterStatus() {
  return useQuery({
    queryKey: posKeys.register(),
    queryFn: () => posApi.getRegisterStatus(),
    staleTime: 30_000,
  });
}

export function useZReport(enabled = true) {
  return useQuery({
    queryKey: posKeys.zReport(),
    queryFn: () => posApi.getZReport(),
    enabled,
    retry: false,
    staleTime: 30_000,
  });
}

export function useOpenRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { openingCash: number; tillId?: string }) =>
      posApi.openRegister(body),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: posKeys.all }),
  });
}

export function useCloseRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { countedCash?: number }) => posApi.closeRegister(body),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: posKeys.all }),
  });
}

export function usePosTills(branchId: string | null) {
  return useQuery({
    queryKey: posKeys.tills(branchId),
    queryFn: () => posApi.getTills(branchId),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useCreateTill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      branchId: string;
      name: string;
      code?: string;
      deviceLabel?: string;
    }) => posApi.createTill(body),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['pos', 'tills'] }),
  });
}

export function usePosBranchSummary() {
  return useQuery({
    queryKey: posKeys.branchSummary(),
    queryFn: () => posApi.getBranchSummary(),
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Sales
// ---------------------------------------------------------------------------

export function usePosSales(query: PosSalesQuery, enabled = true) {
  return useQuery({
    queryKey: posKeys.sales(query),
    queryFn: () => posApi.getSales(query),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function usePosSale(saleId: string | undefined) {
  return useQuery({
    queryKey: posKeys.sale(saleId ?? ''),
    queryFn: () => posApi.getSale(saleId as string),
    enabled: Boolean(saleId),
  });
}

/** Rings up a sale. One idempotency key per attempt guards double taps. */
export function useCompleteSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: NewSaleInput) =>
      posApi.completeSale(body, { idempotencyKey: createIdempotencyKey() }),
    onSuccess: sale => {
      queryClient.setQueryData(posKeys.sale(sale.id), sale);
      void queryClient.invalidateQueries({ queryKey: ['pos', 'sales'] });
      void queryClient.invalidateQueries({ queryKey: posKeys.register() });
      void queryClient.invalidateQueries({ queryKey: ['business', 'pos-dashboard'] });
    },
  });
}

export function useRefundSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: Parameters<typeof posApi.refundSale>[1] & { id: string }) =>
      posApi.refundSale(id, body),
    onSuccess: sale => {
      queryClient.setQueryData(posKeys.sale(sale.id), sale);
      void queryClient.invalidateQueries({ queryKey: ['pos', 'sales'] });
    },
  });
}

export function useHeldSales(branchId: string | null) {
  return useQuery({
    queryKey: posKeys.held(branchId),
    queryFn: () => posApi.getHeldSales(branchId),
    staleTime: 30_000,
  });
}

export function useHoldSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: HoldSaleInput) => posApi.holdSale(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pos', 'held'] });
      void queryClient.invalidateQueries({
        queryKey: businessDashboardKeys.posDashboard(''),
      });
    },
  });
}

export function useSplitPreview(input: SplitPreviewInput | null) {
  return useQuery({
    queryKey: ['pos', 'split-preview', input],
    queryFn: () => posApi.previewSplit(input as SplitPreviewInput),
    enabled: Boolean(input && input.lines.length && input.people.length >= 2),
    placeholderData: keepPreviousData,
    retry: false,
  });
}

// ---------------------------------------------------------------------------
// Customers and stock
// ---------------------------------------------------------------------------

export function usePosCustomers(query: {
  search?: string;
  segment?: PosCustomerSegment;
  branchId?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: posKeys.customers(query),
    queryFn: () => posApi.getCustomers({ limit: 20, ...query }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function usePosCustomer(customerId: string | undefined) {
  return useQuery({
    queryKey: posKeys.customer(customerId ?? ''),
    queryFn: () => posApi.getCustomer(customerId as string),
    enabled: Boolean(customerId),
  });
}

export function usePosCustomerRewards(
  customerId: string | undefined,
  branchId: string | null,
) {
  return useQuery({
    queryKey: posKeys.customerRewards(customerId ?? '', branchId),
    queryFn: () => posApi.getCustomerRewards(customerId as string, branchId),
    enabled: Boolean(customerId),
  });
}

export function useStockMovements(itemId: string | undefined) {
  return useQuery({
    queryKey: posKeys.stockMovements(itemId ?? ''),
    queryFn: () => posApi.getStockMovements(itemId as string),
    enabled: Boolean(itemId),
  });
}

export function useSetStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      quantity,
      reason,
    }: {
      itemId: string;
      quantity: number;
      reason?: string;
    }) => posApi.setStock(itemId, { quantity, reason }),
    onSuccess: (_result, { itemId }) => {
      void queryClient.invalidateQueries({ queryKey: posKeys.stockMovements(itemId) });
      void queryClient.invalidateQueries({ queryKey: ['catalogue'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Staff PINs and peripherals
// ---------------------------------------------------------------------------

export function useStaffPins() {
  return useQuery({
    queryKey: posKeys.staffPins(),
    queryFn: () => posApi.getStaffPins(),
    staleTime: 60_000,
  });
}

export function useOverrideLog() {
  return useQuery({
    queryKey: posKeys.overrides(),
    queryFn: () => posApi.getOverrides({ limit: 20 }),
    staleTime: 60_000,
  });
}

export function useVerifyOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      pin: string;
      action: PosOverrideAction;
      referenceId?: string;
    }) => posApi.verifyOverride(body),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: posKeys.overrides() }),
  });
}

export function usePeripherals(branchId: string | null) {
  return useQuery({
    queryKey: posKeys.peripherals(branchId),
    queryFn: () => posApi.getPeripherals(branchId),
    staleTime: 60_000,
  });
}

export function useCreatePeripheral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      branchId: string;
      tillId?: string;
      type: PeripheralType;
      name: string;
      model?: string;
      connection: PeripheralConnection;
      address?: string;
    }) => posApi.createPeripheral(body),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['pos', 'peripherals'] }),
  });
}

// ---------------------------------------------------------------------------
// Kitchen and customer display
// ---------------------------------------------------------------------------

export function useKitchenStream(branchId: string | null) {
  return useQuery({
    queryKey: posKeys.kitchen(branchId),
    queryFn: () => posApi.getKitchenStream(branchId ? { branchId } : {}),
    placeholderData: keepPreviousData,
    // The socket pushes changes; this is only the safety net.
    refetchInterval: 60_000,
  });
}

export function useUpdateKitchenStatus(branchId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: KitchenStatus | 'cancelled';
    }) => posApi.updateKitchenStatus(orderId, { status }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: posKeys.kitchen(branchId) }),
  });
}

export function useCustomerDisplay(tillId: string | undefined) {
  return useQuery({
    queryKey: posKeys.display(tillId ?? ''),
    queryFn: () => posApi.getDisplay(tillId as string),
    enabled: Boolean(tillId),
  });
}

export function usePushDisplayTicket(tillId: string | undefined) {
  return useMutation({
    mutationFn: (body: DisplayTicketInput) =>
      posApi.putDisplayTicket(tillId as string, body),
  });
}

export function useSendTipRating(tillId: string | undefined) {
  return useMutation({
    mutationFn: (body: { saleId?: string; tipAmount: number; rating?: number }) =>
      posApi.sendTipRating(tillId as string, body),
  });
}

// ---------------------------------------------------------------------------
// Guest (public) ordering
// ---------------------------------------------------------------------------

export function useGuestOrderingInfo(branchId: string | undefined) {
  return useQuery({
    queryKey: posKeys.guestOrdering(branchId ?? ''),
    queryFn: () => posApi.getGuestOrderingInfo(branchId as string),
    enabled: Boolean(branchId),
    staleTime: 60_000,
  });
}

export function usePlaceGuestOrder() {
  return useMutation({
    mutationFn: (body: GuestOrderInput) =>
      posApi.placeGuestOrder(body, { idempotencyKey: createIdempotencyKey() }),
  });
}

export function useOrderTracking(token: string | undefined) {
  return useQuery({
    queryKey: posKeys.tracking(token ?? ''),
    queryFn: () => posApi.trackOrder(token as string),
    enabled: Boolean(token),
    // The socket pushes status changes; this keeps a stale screen honest.
    refetchInterval: 30_000,
  });
}
