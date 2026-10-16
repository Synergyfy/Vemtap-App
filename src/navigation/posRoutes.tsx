import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, Linking, Share } from 'react-native';
import { strings } from '@constants/strings';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import { useOfflineQueueStore } from '@store/offlineQueueStore';
import { useActiveBranch } from '@features/business/hooks/useActiveBranch';
import {
  useMyBusiness,
  usePosDashboard,
} from '@features/business/hooks/useBusinessDashboardData';
import {
  usePosSettings,
  useOpenRegister,
  usePosBranchSummary,
  usePosSales,
  usePosTills,
  useRegisterStatus,
  useHoldSale,
  useCompleteSale,
  usePeripherals,
  useVerifyOverride,
  usePosSale,
  useRefundSale,
  useCloseRegister,
  useHeldSales,
  useZReport,
  posKeys,
  usePosCustomers,
  usePosCustomer,
  usePosCustomerRewards,
  useSetStock,
  useStockMovements,
  useUpdatePosSettings,
  useOverrideLog,
  useStaffPins,
  useCreatePeripheral,
  usePosSettingsSummary,
  useKitchenStream,
  useUpdateKitchenStatus,
  useSplitPreview,
  useCustomerDisplay,
  useSendTipRating,
  useGuestOrderingInfo,
  useOrderTracking,
  usePlaceGuestOrder,
} from '@features/business/hooks/usePos';
import { useAuthStore } from '@store/authStore';
import { showError, showSuccess } from '@components/shared/toast';
import {
  POS_SALE_QUEUE_KIND,
  queueOfflineSale,
  queuedOfflineSales,
  syncOfflineSales,
  requeueConflict,
  usePosSyncStore,
  type QueuedSalePayload,
} from '@features/business/services/posOfflineSales';
import {
  clock,
  drawerVarianceLabel,
  naira,
  personName,
  startOfTodayIso,
  totalsRows,
  initials,
  tenderLabel,
  titleCase,
  receiptShareText,
  toReceiptView,
  toLedgerRow,
  percentOf,
  when,
  type ReceiptView,
} from '@features/business/utils/posMappers';
import {
  PosHomeSalesOperationsScreen,
  type PosHomeView,
} from '@features/business/screens/PosHomeSalesOperationsScreen';
import {
  PosBranchTillSwitcherScreen,
  type PosBranchTillView,
} from '@features/business/screens/PosBranchTillSwitcherScreen';
import {
  PosNewSaleCatalogScreen,
  type CatalogItemView,
  type PosNewSaleCatalogView,
} from '@features/business/screens/PosNewSaleCatalogScreen';
import {
  useBranchCatalogue,
  useBranchCatalogueCategories,
} from '@features/business/hooks/useBranchCatalogue';
import { usePosTicketStore } from '@store/posTicketStore';
import { computeTicketTotals } from '@features/business/utils/posPricing';
import {
  posApi,
  type PosSettings,
  type NewSaleInput,
  type PosOverrideAction,
  type PosSale,
  type PosCustomer,
  type PosCustomerDetail,
  type PosCustomerRewards,
  type PosSettingsUpdate,
  type PeripheralType,
  type SplitMode,
  type SplitPreviewInput,
  type DisplayState,
} from '@api/posApi';
import { useDebounce } from '@hooks/useDebounce';
import {
  PosCurrentSaleCartScreen,
  type PosCurrentSaleCartView,
} from '@features/business/screens/PosCurrentSaleCartScreen';
import {
  PosTenderCheckoutScreen,
  type PosTenderCheckoutView,
  type TenderId,
} from '@features/business/screens/PosTenderCheckoutScreen';
import { PosSupervisorPinSheet } from '@features/business/components/PosSupervisorPinSheet';
import { ApiError } from '@api/ApiError';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { PosSaleCompletedScreen } from '@features/business/screens/PosSaleCompletedScreen';
import { DigitalEReceiptScreen } from '@features/business/screens/DigitalEReceiptScreen';
import { PosTransactionDetailsScreen } from '@features/business/screens/PosTransactionDetailsScreen';
import {
  PosTransactionsLedgerReceiptsScreen,
  type PosLedgerReceiptsView,
  type ReceiptFilter,
} from '@features/business/screens/PosTransactionsLedgerReceiptsScreen';
import {
  PosTransactionsLedgerShiftScreen,
  type PosLedgerShiftView,
} from '@features/business/screens/PosTransactionsLedgerShiftScreen';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
  PosCustomerLookupListScreen,
  type CustomerSegmentFilter,
  type PosCustomerCardView,
  type PosCustomerLookupListView,
} from '@features/business/screens/PosCustomerLookupListScreen';
import {
  PosCustomerLookupActiveScreen,
  type MatchedCustomerView,
} from '@features/business/screens/PosCustomerLookupActiveScreen';
import {
  PosCustomerLookupLoyaltyScreen,
  type PosLoyaltyView,
} from '@features/business/screens/PosCustomerLookupLoyaltyScreen';
import {
  PosCustomerDossierScreen,
  type PosDossierView,
} from '@features/business/screens/PosCustomerDossierScreen';
import { formatShortDate } from '@utils/formatters';
import {
  PosProductsInventoryScreen,
  type InventoryFilter,
  type InventoryItemView,
  type PosProductsInventoryView,
} from '@features/business/screens/PosProductsInventoryScreen';
import { useBusinessCatalogue } from '@features/business/hooks/useBusinessCatalogue';
import type { BusinessCatalogueItem } from '@api/catalogueApi';
import {
  PosProductShiftStockStatusScreen,
  type StockStatusView,
} from '@features/business/screens/PosProductShiftStockStatusScreen';
import { PosHomeOfflineModeScreen } from '@features/business/screens/PosHomeOfflineModeScreen';
import {
  PosOfflineBufferQueueScreen,
  type BufferFilter,
} from '@features/business/screens/PosOfflineBufferQueueScreen';
import {
  PosSyncReconciliationScreen,
  type SyncJournalEntry,
} from '@features/business/screens/PosSyncReconciliationScreen';
import { TaxesSurchargesScreen } from '@features/business/screens/TaxesSurchargesScreen';
import { PosReceiptCustomizationScreen } from '@features/business/screens/PosReceiptCustomizationScreen';
import { StaffPermissionsPasscodesScreen } from '@features/business/screens/StaffPermissionsPasscodesScreen';
import { PaymentHardwareSetupScreen } from '@features/business/screens/PaymentHardwareSetupScreen';
import {
  PosGeneralSettingsScreen,
  type PosGeneralSettingsView,
  type PosSettingLinkId,
} from '@features/business/screens/PosGeneralSettingsScreen';
import {
  MerchantPosKitchenStreamScreen,
  type KitchenAction,
  type KitchenTab,
  type MerchantPosKitchenStreamView,
} from '@features/business/screens/MerchantPosKitchenStreamScreen';
import {
  useKitchenRealtime,
  useCustomerDisplayRealtime,
  useGuestTrackingRealtime,
} from '@features/business/hooks/usePosRealtime';
import {
  SplitTheBillScreen,
  type SplitPersonDraft,
  type SplitTender,
} from '@features/business/screens/SplitTheBillScreen';
import {
  CustomerDisplayOrderTotalScreen,
  type CustomerDisplayTicketView,
} from '@features/business/screens/CustomerDisplayOrderTotalScreen';
import { CustomerDisplayTapQrPayScreen } from '@features/business/screens/CustomerDisplayTapQrPayScreen';
import { CustomerDisplayTipRatingScreen } from '@features/business/screens/CustomerDisplayTipRatingScreen';
import {
  PublicPosOrderMenuScreen,
  type PublicPosOrderMenuView,
} from '@features/business/screens/PublicPosOrderMenuScreen';
import { PublicPosCartReviewScreen } from '@features/business/screens/PublicPosCartReviewScreen';
import {
  PublicPosOrderTrackingScreen,
  type OrderTrackingView,
} from '@features/business/screens/PublicPosOrderTrackingScreen';
import { usePublicPosCartStore } from '@store/publicPosCartStore';
import type { BusinessStackParamList } from './types';
import { useBusinessNavigation } from './useBusinessNavigation';

/**
 * Route wrappers for the POS screens: each reads its hooks, maps the payload
 * to the screen's view model and wires navigation. Screens stay presentational.
 */

/** Number of sales waiting in this device's offline queue. */
export function useQueuedSaleCount() {
  return useOfflineQueueStore(
    state => state.queue.filter(item => item.kind === POS_SALE_QUEUE_KIND).length,
  );
}

export function PosHomeSalesOperationsRoute() {
  const navigation = useBusinessNavigation();
  const { activeBranchId, branches, isLive } = useActiveBranch();
  const business = useMyBusiness();
  const dashboard = usePosDashboard(activeBranchId);
  const register = useRegisterStatus();
  const today = usePosSales(
    { branchId: activeBranchId ?? undefined, dateFrom: startOfTodayIso(), limit: 1 },
    Boolean(activeBranchId),
  );
  const network = useNetworkStatus();
  const queuedCount = useQueuedSaleCount();

  const view = useMemo<PosHomeView | undefined>(() => {
    if (!isLive || !dashboard.data || !register.data) return undefined;
    const { session } = register.data;
    const refunds = today.data?.meta?.counts?.refunded ?? 0;
    const partial = today.data?.meta?.counts?.partial_refund ?? 0;
    const copy = strings.posHomeSalesOperations;
    return {
      storeName: business.data?.name ?? '',
      branches: branches.map(branch => ({
        id: branch.id,
        name: branch.name,
        current: branch.id === activeBranchId,
      })),
      activeBranchName: branches.find(branch => branch.id === activeBranchId)?.name ?? '',
      online: network.isConnected,
      queuedCount,
      shiftLabel: session ? `${copy.shiftOpened} ${clock(session.openedAt)}` : null,
      summary: {
        sales: naira(Number(dashboard.data.revenue ?? 0)),
        salesNote: copy.averageNote(naira(Number(dashboard.data.averageSaleValue ?? 0))),
        transactions: String(Number(dashboard.data.transactionCount ?? 0)),
        transactionsNote: copy.completedNote,
        pending: String(Number(dashboard.data.heldSalesCount ?? 0)),
        pendingNote: copy.heldNote,
        refunds: String(refunds + partial),
        refundsNote: copy.refundsNote(partial),
      },
      drawer: session
        ? {
            openingFloat: naira(session.openingCash),
            cashInTill: naira(session.expectedCash),
            balanceLabel: drawerVarianceLabel(session.variance),
          }
        : null,
    };
  }, [
    activeBranchId,
    branches,
    business.data?.name,
    dashboard.data,
    isLive,
    network.isConnected,
    queuedCount,
    register.data,
    today.data?.meta?.counts,
  ]);

  return (
    <PosHomeSalesOperationsScreen
      view={view}
      isLoading={dashboard.isLoading || register.isLoading}
      isError={dashboard.isError || register.isError}
      onRetry={() => {
        void dashboard.refetch();
        void register.refetch();
      }}
      onBack={navigation.goBack}
      onOpenSettings={() => navigation.navigate('PosGeneralSettings')}
      onSelectBranch={() => navigation.navigate('PosBranchTillSwitcher')}
      onSyncCheck={() => navigation.navigate('PosSyncReconciliation')}
      onQuickAction={actionId => {
        if (actionId === 'new-sale') navigation.navigate('PosNewSaleCatalog');
        if (actionId === 'transactions')
          navigation.navigate('PosTransactionsLedgerShift');
        if (actionId === 'customers') navigation.navigate('PosCustomerLookupList');
        if (actionId === 'products') navigation.navigate('PosProductsInventory');
      }}
      onOpenDrawer={() => navigation.navigate('PosBranchTillSwitcher')}
      onOpenControl={controlId => {
        if (controlId === 'public-mode') navigation.navigate('PublicPosOrderMenu');
        if (controlId === 'drawer') navigation.navigate('PosTransactionsLedgerShift');
        if (controlId === 'sync') navigation.navigate('PosSyncReconciliation');
      }}
    />
  );
}

export function PosBranchTillSwitcherRoute() {
  const navigation = useBusinessNavigation();
  const { activeBranchId, branches, setActiveBranch } = useActiveBranch();
  const business = useMyBusiness();
  const tills = usePosTills(activeBranchId);
  const summary = usePosBranchSummary();
  const register = useRegisterStatus();
  const openRegister = useOpenRegister();
  const user = useAuthStore(state => state.user);
  const copy = strings.posBranchTillSwitcher;

  const view = useMemo<PosBranchTillView | undefined>(() => {
    if (!tills.data || !summary.data || !register.data) return undefined;
    const { session } = register.data;
    const branchName = branches.find(branch => branch.id === activeBranchId)?.name ?? '';
    const activeTill = tills.data.data.find(till => till.id === session?.tillId);
    return {
      businessName: business.data?.name ?? '',
      currentBranchName: branchName,
      registerStatus: session
        ? activeTill
          ? copy.registerOpen(activeTill.name, clock(session.openedAt))
          : copy.registerOpenNoTill(clock(session.openedAt))
        : copy.registerClosed,
      staffName: personName(user ?? undefined, user?.email ?? ''),
      activeTillId: session?.tillId ?? null,
      hasOpenSession: Boolean(session),
      tills: tills.data.data.map(till => ({
        id: till.id,
        name: till.name,
        meta: till.occupant
          ? copy.tillOccupied(
              till.occupant.cashierName || till.code,
              clock(till.occupant.openedAt),
            )
          : copy.tillAvailable,
        status: till.status,
        amount: naira(till.todaySales),
        occupiedByOther: Boolean(
          till.occupant && till.occupant.sessionId !== session?.id,
        ),
      })),
      tillsBadge: copy.tillsBadge(tills.data.data.length, tills.data.limit ?? null),
      branches: summary.data.map(branch => ({
        id: branch.branchId,
        name: branch.name,
        address: branch.address,
        meta: copy.branchMeta(branch.tillCount, naira(branch.todaySales)),
        current: branch.branchId === activeBranchId,
      })),
    };
  }, [
    activeBranchId,
    branches,
    business.data?.name,
    copy,
    register.data,
    summary.data,
    tills.data,
    user,
  ]);

  return (
    <PosBranchTillSwitcherScreen
      view={view}
      isLoading={tills.isLoading || summary.isLoading}
      isError={tills.isError || summary.isError || register.isError}
      onRetry={() => {
        void tills.refetch();
        void summary.refetch();
        void register.refetch();
      }}
      isSubmitting={openRegister.isPending}
      onBack={navigation.goBack}
      onCancel={navigation.goBack}
      onConfirm={({ branchId, tillId, openingCash }) => {
        if (branchId) {
          setActiveBranch(branchId);
          showSuccess(copy.switchedToast);
        }
        if (!tillId) {
          navigation.goBack();
          return;
        }
        openRegister.mutate(
          { openingCash, tillId },
          {
            onSuccess: () => {
              showSuccess(copy.openedToast);
              navigation.goBack();
            },
            onError: error => showError(error.message),
          },
        );
      }}
    />
  );
}

/** `VAT 7.5% added at checkout`, `Prices include VAT` or `No tax configured`. */
export function taxNote(settings: PosSettings | undefined) {
  const copy = strings.posNewSaleCatalog;
  if (!settings?.taxEnabled) return copy.noTax;
  return settings.pricesIncludeTax
    ? copy.taxIncluded(settings.taxLabel)
    : copy.taxLabel(settings.taxLabel, settings.taxRate);
}

const LOW_STOCK = 5;

export function PosNewSaleCatalogRoute() {
  const navigation = useBusinessNavigation();
  const { activeBranchId, branches } = useActiveBranch();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const debouncedSearch = useDebounce(search.trim(), 300);
  const items = useBranchCatalogue(activeBranchId, {
    limit: 50,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(category !== 'all' ? { categoryId: category } : {}),
  });
  const categories = useBranchCatalogueCategories(activeBranchId);
  const settings = usePosSettings();
  const register = useRegisterStatus();
  const ticket = usePosTicketStore();
  const copy = strings.posNewSaleCatalog;

  const view = useMemo<PosNewSaleCatalogView | undefined>(() => {
    if (!items.data || !categories.data) return undefined;
    const totals = computeTicketTotals(ticket.lines, settings.data, {
      cartDiscount: ticket.cartDiscount,
      orderType: ticket.orderType,
      waiveServiceCharge: ticket.waiveServiceCharge,
    });
    const tillName = register.data?.session?.till?.name ?? null;
    return {
      registerLabel: copy.registerLabel(
        branches.find(branch => branch.id === activeBranchId)?.name ?? '',
        tillName,
      ),
      categories: categories.data.map(item => ({ id: item.id, label: item.name })),
      totalItems: items.data.total || items.data.data.length,
      items: items.data.data
        .filter(item => !item.isSuspended)
        .map<CatalogItemView>(item => {
          const stock = item.stockQuantity ?? null;
          const tone: CatalogItemView['stockTone'] =
            stock == null
              ? 'untracked'
              : stock <= 0 && !item.allowBackOrder
                ? 'out'
                : stock <= LOW_STOCK
                  ? 'low'
                  : 'ready';
          return {
            id: item.id,
            name: item.name,
            detail: item.shortDescription ?? item.category?.name ?? '',
            price: naira(Number(item.price ?? 0)),
            stockLabel:
              tone === 'untracked'
                ? copy.stockUntracked
                : tone === 'out'
                  ? copy.stockOut
                  : tone === 'low'
                    ? copy.stockLow(stock as number)
                    : copy.stockLeft(stock as number),
            stockTone: tone,
            inTicket:
              ticket.lines.find(line => line.productId === item.id)?.quantity ?? 0,
          };
        }),
      ticket: {
        itemCount: totals.itemCount,
        total: naira(totals.total),
        customerName: ticket.customer?.name ?? null,
        taxLabel: taxNote(settings.data),
      },
    };
  }, [
    activeBranchId,
    branches,
    categories.data,
    copy,
    items.data,
    register.data,
    settings.data,
    ticket,
  ]);

  return (
    <PosNewSaleCatalogScreen
      view={view}
      isLoading={items.isLoading || categories.isLoading}
      isError={items.isError || categories.isError}
      onRetry={() => {
        void items.refetch();
        void categories.refetch();
      }}
      search={search}
      category={category}
      onSearchChange={setSearch}
      onFilterCategory={setCategory}
      onBack={navigation.goBack}
      onAddItem={itemId => {
        const item = items.data?.data.find(entry => entry.id === itemId);
        if (!item) return;
        ticket.setContext({ branchId: activeBranchId });
        ticket.addItem({
          productId: item.id,
          name: item.name,
          unitPrice: Number(item.price ?? 0),
          detail: item.shortDescription ?? undefined,
          imageUrl: item.mainImage ?? undefined,
          stock: item.stockQuantity ?? null,
        });
      }}
      onOpenCustomer={() => navigation.navigate('PosCustomerLookupList')}
      onCharge={() => navigation.navigate('PosCurrentSaleCart')}
    />
  );
}

/** Shared: the till's ticket priced with the POS settings, as totals rows. */
export function useTicketTotals() {
  const settings = usePosSettings();
  const ticket = usePosTicketStore();
  return useMemo(() => {
    const totals = computeTicketTotals(ticket.lines, settings.data, {
      cartDiscount: ticket.cartDiscount,
      orderType: ticket.orderType,
      waiveServiceCharge: ticket.waiveServiceCharge,
    });
    const rows = totalsRows(
      totals,
      {
        label: settings.data?.taxLabel ?? 'VAT',
        rate: settings.data?.taxRate ?? 0,
        included: Boolean(settings.data?.pricesIncludeTax),
      },
      strings.posTotals,
    );
    return { totals, rows, settings: settings.data, ticket };
  }, [settings.data, ticket]);
}

export function PosCurrentSaleCartRoute() {
  const navigation = useBusinessNavigation();
  const { activeBranchId, branches } = useActiveBranch();
  const business = useMyBusiness();
  const { totals, rows, ticket } = useTicketTotals();
  const hold = useHoldSale();
  const copy = strings.posCurrentSaleCart;

  const view: PosCurrentSaleCartView = {
    storeLabel: [
      business.data?.name,
      branches.find(branch => branch.id === activeBranchId)?.name,
    ]
      .filter(Boolean)
      .join(' • '),
    tableLabel: ticket.tableNumber ? copy.tableLabel(ticket.tableNumber) : null,
    customer: ticket.customer
      ? {
          name: ticket.customer.name,
          tier: ticket.customer.tier ?? '',
          phone: ticket.customer.phone ?? '',
          points: copy.pointsLabel(ticket.customer.points ?? 0),
        }
      : null,
    lines: ticket.lines.map(line => ({
      id: line.productId,
      name: line.name,
      qty: line.quantity,
      unit: naira(line.unitPrice),
      lineTotal: naira(line.unitPrice * line.quantity - line.discount),
      discountNote:
        line.discount > 0 ? copy.lineDiscount(naira(line.discount)) : undefined,
      atStockLimit: line.stock != null && line.quantity >= line.stock,
    })),
    totals: rows,
    grandTotal: naira(totals.total),
    note: ticket.note,
    cartDiscount: ticket.cartDiscount ? String(ticket.cartDiscount) : '',
    takeaway: ticket.orderType === 'takeaway',
  };

  return (
    <PosCurrentSaleCartScreen
      view={view}
      isHolding={hold.isPending}
      onBack={navigation.goBack}
      onChangeCustomer={() => navigation.navigate('PosCustomerLookupActive')}
      onAddMore={() => navigation.navigate('PosNewSaleCatalog')}
      onChangeQty={ticket.setQuantity}
      onRemoveLine={ticket.removeLine}
      onNoteChange={ticket.setNote}
      onCartDiscountChange={ticket.setCartDiscount}
      onToggleTakeaway={takeaway =>
        ticket.setOrderType(takeaway ? 'takeaway' : 'dine_in')
      }
      onHold={() => {
        const branchId = ticket.branchId ?? activeBranchId;
        if (!branchId) return;
        hold.mutate(
          {
            branchId,
            customerId: ticket.customer?.id,
            note: ticket.note || undefined,
            discountAmount: totals.discount || undefined,
            orderType: ticket.orderType,
            items: ticket.lines.map(line => ({
              productId: line.productId,
              productName: line.name,
              unitPrice: line.unitPrice,
              quantity: line.quantity,
              totalPrice: line.unitPrice * line.quantity - line.discount,
            })),
          },
          {
            onSuccess: () => {
              ticket.clear();
              showSuccess(copy.parkedToast);
              navigation.navigate('PosTransactionsLedgerShift');
            },
            onError: error => showError(error.message),
          },
        );
      }}
      onCharge={() => navigation.navigate('PosTenderCheckout')}
    />
  );
}

/** True for the 403 the API returns when a supervisor approval is needed. */
export function needsSupervisor(error: unknown) {
  return (
    error instanceof ApiError &&
    error.status === 403 &&
    /supervisor|approval/i.test(error.message)
  );
}

/**
 * Supervisor PIN flow around one guarded action: run it, and on a "needs a
 * supervisor" refusal ask for a PIN, mint an override token and run it again.
 */
export function useSupervisorOverride(action: PosOverrideAction, reason: string) {
  const verify = useVerifyOverride();
  const [pending, setPending] = useState<((token: string) => void) | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sheet = (
    <PosSupervisorPinSheet
      visible={Boolean(pending)}
      reason={reason}
      isVerifying={verify.isPending}
      error={error}
      onClose={() => {
        setPending(null);
        setError(null);
      }}
      onSubmit={pin =>
        verify.mutate(
          { pin, action },
          {
            onSuccess: ({ overrideToken }) => {
              const retry = pending;
              setPending(null);
              setError(null);
              retry?.(overrideToken);
            },
            onError: failure => setError(failure.message),
          },
        )
      }
    />
  );

  /** Ask for a PIN, then call `retry` with the override token. */
  const requestApproval = (retry: (token: string) => void) => setPending(() => retry);
  return { sheet, requestApproval };
}

/** Keeps the customer display on the active till in step with the ticket. */
export function useMirrorTicketToDisplay(enabled = true) {
  const register = useRegisterStatus();
  const tillId = register.data?.session?.tillId ?? undefined;
  const lines = usePosTicketStore(state => state.lines);
  const cartDiscount = usePosTicketStore(state => state.cartDiscount);
  const orderType = usePosTicketStore(state => state.orderType);
  const waive = usePosTicketStore(state => state.waiveServiceCharge);
  const table = usePosTicketStore(state => state.tableNumber);
  const customer = usePosTicketStore(state => state.customer);
  useEffect(() => {
    if (!enabled || !tillId || !lines.length) return;
    const lineDiscount = lines.reduce((sum, line) => sum + line.discount, 0);
    posApi
      .putDisplayTicket(tillId, {
        lines: lines.map(line => ({
          name: line.name,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
        discountAmount: cartDiscount + lineDiscount || undefined,
        orderType,
        waiveServiceCharge: waive,
        tableNumber: table ?? undefined,
        customerName: customer?.name,
      })
      .catch(() => undefined);
  }, [cartDiscount, customer?.name, enabled, lines, orderType, table, tillId, waive]);
  return tillId;
}

export function PosTenderCheckoutRoute() {
  return <TenderCheckout />;
}

/** Offline terminal: the same checkout, always queueing on the device. */
export function PosOfflineCheckoutTerminalRoute() {
  return <TenderCheckout forceOffline />;
}

function TenderCheckout({ forceOffline = false }: { forceOffline?: boolean }) {
  const navigation = useBusinessNavigation();
  const { activeBranchId, branches } = useActiveBranch();
  const network = useNetworkStatus();
  const { totals, rows, settings, ticket } = useTicketTotals();
  const peripherals = usePeripherals(activeBranchId);
  const completeSale = useCompleteSale();
  const user = useAuthStore(state => state.user);
  const tillId = useMirrorTicketToDisplay();
  const copy = strings.posTenderCheckout;
  const override = useSupervisorOverride(
    'discount',
    strings.posSupervisorPin.reasons.discount,
  );
  const offline = forceOffline || !network.isConnected;

  const rails = settings?.tenderRails;
  const methods: TenderId[] = [
    ...(rails?.cash !== false ? (['cash'] as const) : []),
    ...(rails?.card !== false ? (['card'] as const) : []),
    ...(rails?.transfer?.enabled && rails.transfer.accountNumber
      ? (['transfer'] as const)
      : []),
    ...(!offline ? (['split'] as const) : []),
  ];
  const terminal = peripherals.data?.data.find(device => device.type === 'card_terminal');

  const view: PosTenderCheckoutView = {
    orderLabel: copy.orderLabel(
      branches.find(branch => branch.id === (ticket.branchId ?? activeBranchId))?.name ??
        '',
      ticket.tableNumber,
    ),
    orderTypeLabel:
      ticket.orderType === 'takeaway' ? copy.takeawayLabel : copy.dineInLabel,
    totalAmount: totals.total,
    lines: ticket.lines.map(line => ({
      id: line.productId,
      qty: `${line.quantity}×`,
      name: line.name,
      price: naira(line.unitPrice * line.quantity - line.discount),
    })),
    itemCount: totals.itemCount,
    totals: rows,
    customer: ticket.customer
      ? {
          name: ticket.customer.name,
          initials: initials(ticket.customer.name),
          points: copy.pointsBalance(
            (ticket.customer.points ?? 0).toLocaleString('en-NG'),
          ),
        }
      : null,
    methods,
    cardTerminal: terminal
      ? [terminal.name, terminal.model].filter(Boolean).join(' • ')
      : null,
    transfer:
      rails?.transfer?.enabled && rails.transfer.accountNumber
        ? {
            bankName: rails.transfer.bankName,
            accountNumber: rails.transfer.accountNumber,
            accountName: rails.transfer.accountName,
          }
        : null,
    offline,
  };

  const buildInput = (
    payment: { method: Exclude<TenderId, 'split'>; amountPaid: number },
    overrideToken?: string,
  ): NewSaleInput | null => {
    const branchId = ticket.branchId ?? activeBranchId;
    if (!branchId) return null;
    return {
      branchId,
      items: ticket.lines.map(line => ({
        productId: line.productId,
        quantity: line.quantity,
        discount: line.discount || undefined,
      })),
      payment: {
        method: payment.method,
        amountPaid: payment.amountPaid,
        change: Math.max(0, payment.amountPaid - totals.total) || undefined,
      },
      cartDiscountAmount: ticket.cartDiscount || undefined,
      customerId: ticket.customer?.id,
      notes: ticket.note || undefined,
      orderType: ticket.orderType,
      waiveServiceCharge: ticket.waiveServiceCharge || undefined,
      overrideToken,
    };
  };

  const finish = (saleId: string) => {
    if (tillId) void posApi.clearDisplay(tillId, saleId).catch(() => undefined);
    ticket.clear();
    navigation.navigate('PosSaleCompleted', { saleId });
  };

  const submit = (
    payment: { method: Exclude<TenderId, 'split'>; amountPaid: number },
    overrideToken?: string,
  ) => {
    const input = buildInput(payment, overrideToken);
    if (!input) return;
    if (offline) {
      const clientRef = queueOfflineSale(input, {
        total: totals.total,
        method: tenderLabel(payment.method),
        itemCount: totals.itemCount,
        itemNames: ticket.lines.map(line => line.name),
        cashierName: personName(user ?? undefined, user?.email ?? ''),
      });
      ticket.clear();
      showSuccess(copy.offlineSavedToast);
      navigation.navigate('PosSaleCompleted', { clientRef });
      return;
    }
    completeSale.mutate(input, {
      onSuccess: sale => finish(sale.id),
      onError: error => {
        if (needsSupervisor(error)) {
          override.requestApproval(token => submit(payment, token));
          return;
        }
        showError(error.message);
      },
    });
  };

  return (
    <>
      <PosTenderCheckoutScreen
        view={view}
        isSubmitting={completeSale.isPending}
        onBack={navigation.goBack}
        onOpenRewards={() =>
          ticket.customer &&
          navigation.navigate('PosCustomerLookupLoyalty', {
            customerId: ticket.customer.id,
          })
        }
        onCopyAccount={account => {
          Clipboard.setString(account);
          showSuccess(copy.copiedToast);
        }}
        onSplit={() => navigation.navigate('SplitTheBill')}
        onCompleteSale={payment => submit(payment)}
      />
      {override.sheet}
    </>
  );
}

/** Receipt view for a sale, labelled for the business's tax rate. */
export function useReceiptView(sale: PosSale | undefined): ReceiptView | undefined {
  const settings = usePosSettings();
  return useMemo(() => {
    if (!sale) return undefined;
    const copy = strings.posSaleCompleted;
    return toReceiptView(
      {
        ...sale,
        customer: sale.customer ?? null,
        branch: sale.branch ?? null,
        receipt: sale.receipt ?? null,
        items: sale.items.map(item => ({
          id: item.id,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          totalPrice: item.totalPrice,
          refundedQuantity: item.refundedQuantity,
        })),
        splitPayments: sale.splitPayments.map(part => ({
          method: part.method,
          amount: part.amount,
          payer: part.payer ?? null,
        })),
      },
      {
        totals: strings.posTotals,
        tendered: copy.tenderedLabel,
        change: copy.changeLabel,
        refundedNote: copy.refundedNote,
      },
      settings.data?.taxRate ?? 0,
    );
  }, [sale, settings.data?.taxRate]);
}

export function PosSaleCompletedRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessStackParamList, 'PosSaleCompleted'>>();
  const { saleId, clientRef } = route.params ?? {};
  const sale = usePosSale(saleId);
  const register = useRegisterStatus();
  const receipt = useReceiptView(sale.data);
  const queued = clientRef
    ? queuedOfflineSales().find(item => item.meta.clientRef === clientRef)
    : undefined;

  return (
    <PosSaleCompletedScreen
      receipt={receipt}
      offlineSale={
        queued
          ? {
              clientRef: queued.meta.clientRef,
              amount: naira(queued.meta.total),
              tender: queued.meta.method,
              itemNames: queued.meta.itemNames,
              when: clock(queued.meta.createdAt),
            }
          : undefined
      }
      tillLabel={register.data?.session?.till?.name ?? null}
      isLoading={sale.isLoading}
      isError={sale.isError}
      onRetry={() => void sale.refetch()}
      onViewReceipt={() => saleId && navigation.navigate('DigitalEReceipt', { saleId })}
      onSendToMobile={() =>
        receipt && void Share.share({ message: receiptShareText(receipt) })
      }
      onNewSale={() => navigation.navigate('PosNewSaleCatalog')}
    />
  );
}

const MANAGER_ROLES = ['owner', 'manager', 'admin'];

export function DigitalEReceiptRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessStackParamList, 'DigitalEReceipt'>>();
  const saleId = route.params?.saleId;
  const sale = usePosSale(saleId);
  const register = useRegisterStatus();
  const receipt = useReceiptView(sale.data);
  const tillId = register.data?.session?.tillId ?? undefined;

  return (
    <DigitalEReceiptScreen
      receipt={receipt}
      isLoading={sale.isLoading}
      isError={sale.isError || !saleId}
      onRetry={() => void sale.refetch()}
      canRate={Boolean(tillId && saleId)}
      onBack={navigation.goBack}
      onShare={() => receipt && void Share.share({ message: receiptShareText(receipt) })}
      onRateAndTip={() =>
        tillId &&
        saleId &&
        navigation.navigate('CustomerDisplayRating', { tillId, saleId })
      }
    />
  );
}

export function PosTransactionDetailsRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessStackParamList, 'PosTransactionDetails'>>();
  const saleId = route.params?.receiptId;
  const sale = usePosSale(saleId);
  const receipt = useReceiptView(sale.data);
  const refund = useRefundSale();
  const user = useAuthStore(state => state.user);
  const copy = strings.posTransactionDetails;
  const override = useSupervisorOverride(
    'refund',
    strings.posSupervisorPin.reasons.refund,
  );
  const canRefund = MANAGER_ROLES.includes((user?.role ?? '').toLowerCase());

  const doRefund = (reason: string, overrideToken?: string) => {
    if (!saleId) return;
    refund.mutate(
      { id: saleId, status: 'refunded', reason: reason || undefined, overrideToken },
      {
        onSuccess: () => showSuccess(copy.refundedToast),
        onError: error => {
          if (needsSupervisor(error)) {
            override.requestApproval(token => doRefund(reason, token));
            return;
          }
          showError(error.message);
        },
      },
    );
  };

  const session = sale.data?.registerSession;
  return (
    <>
      <PosTransactionDetailsScreen
        receipt={receipt}
        shiftLabel={
          session?.openedAt
            ? `${strings.posHomeSalesOperations.shiftOpened} ${clock(session.openedAt)}`
            : null
        }
        orderTypeLabel={
          sale.data
            ? sale.data.orderType === 'takeaway'
              ? strings.posTenderCheckout.takeawayLabel
              : strings.posTenderCheckout.dineInLabel
            : undefined
        }
        isLoading={sale.isLoading}
        isError={sale.isError || !saleId}
        onRetry={() => void sale.refetch()}
        isRefunding={refund.isPending}
        canRefund={canRefund}
        onBack={navigation.goBack}
        onCopyReference={reference => {
          Clipboard.setString(reference);
          showSuccess(copy.copiedToast);
        }}
        onOpenPatron={() =>
          sale.data?.customerId &&
          navigation.navigate('PosCustomerDossier', { customerId: sale.data.customerId })
        }
        onShare={() =>
          receipt && void Share.share({ message: receiptShareText(receipt) })
        }
        onViewEReceipt={() =>
          saleId && navigation.navigate('DigitalEReceipt', { saleId })
        }
        onRefund={reason => doRefund(reason)}
      />
      {override.sheet}
    </>
  );
}

const LEDGER_PAGE = 20;

const ledgerLabels = () => ({
  walkIn: strings.posLedger.walkIn,
  tendered: strings.posLedger.tendered,
});

export function PosTransactionsLedgerReceiptsRoute() {
  const navigation = useBusinessNavigation();
  const { activeBranchId, branches } = useActiveBranch();
  const network = useNetworkStatus();
  const queuedCount = useQueuedSaleCount();
  const register = useRegisterStatus();
  const user = useAuthStore(state => state.user);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ReceiptFilter>('all');
  const [limit, setLimit] = useState(LEDGER_PAGE);
  const debounced = useDebounce(search.trim(), 300);
  const sales = usePosSales(
    {
      branchId: activeBranchId ?? undefined,
      dateFrom: startOfTodayIso(),
      limit,
      ...(filter !== 'all' ? { status: filter } : {}),
      ...(debounced ? { search: debounced } : {}),
    },
    Boolean(activeBranchId),
  );
  const copy = strings.posTransactionsLedgerReceipts;

  const view = useMemo<PosLedgerReceiptsView | undefined>(() => {
    if (!sales.data) return undefined;
    const counts = sales.data.meta?.counts ?? {};
    const completed = counts.completed ?? 0;
    const partial = counts.partial_refund ?? 0;
    const refunded = counts.refunded ?? 0;
    const till = register.data?.session?.till?.name;
    return {
      branchName: branches.find(branch => branch.id === activeBranchId)?.name ?? '',
      online: network.isConnected,
      registerLine: register.data?.session
        ? [till, personName(user ?? undefined, user?.email ?? '')]
            .filter(Boolean)
            .join(' • ')
        : null,
      grossValue: naira(sales.data.meta?.grossTotal ?? 0),
      grossMeta: copy.grossMeta(completed + partial + refunded, partial + refunded),
      queuedCount,
      filters: [
        { id: 'all', label: copy.filterAll, count: completed + partial + refunded },
        { id: 'completed', label: copy.filterCompleted, count: completed },
        { id: 'partial_refund', label: copy.filterPartial, count: partial },
        { id: 'refunded', label: copy.filterRefunded, count: refunded },
      ],
      rows: sales.data.data.map(sale => toLedgerRow(sale, ledgerLabels())),
      hasMore: sales.data.data.length < (sales.data.total ?? 0),
    };
  }, [
    activeBranchId,
    branches,
    copy,
    network.isConnected,
    queuedCount,
    register.data,
    sales.data,
    user,
  ]);

  return (
    <PosTransactionsLedgerReceiptsScreen
      view={view}
      isLoading={sales.isLoading}
      isError={sales.isError}
      isFetchingMore={sales.isFetching && Boolean(sales.data)}
      onRetry={() => void sales.refetch()}
      search={search}
      filter={filter}
      onBack={navigation.goBack}
      onSyncLedger={() => {
        void syncOfflineSales()
          .catch(error => showError((error as Error).message))
          .finally(() => void sales.refetch());
      }}
      onSearchChange={text => {
        setSearch(text);
        setLimit(LEDGER_PAGE);
      }}
      onSelectFilter={next => {
        setFilter(next);
        setLimit(LEDGER_PAGE);
      }}
      onOpenReceipt={saleId =>
        navigation.navigate('PosTransactionDetails', { receiptId: saleId })
      }
      onLoadMore={() => setLimit(current => current + LEDGER_PAGE)}
    />
  );
}

export function PosTransactionsLedgerShiftRoute() {
  const navigation = useBusinessNavigation();
  const queryClient = useQueryClient();
  const { activeBranchId, branches } = useActiveBranch();
  const register = useRegisterStatus();
  const session = register.data?.session ?? null;
  const zReport = useZReport(Boolean(session));
  const sales = usePosSales({ sessionId: session?.id, limit: 50 }, Boolean(session));
  const held = useHeldSales(activeBranchId);
  const closeRegister = useCloseRegister();
  const ticket = usePosTicketStore();
  const copy = strings.posTransactionsLedgerShift;

  const view = useMemo<PosLedgerShiftView | undefined>(() => {
    if (!register.data || !held.data) return undefined;
    if (session && (!sales.data || !zReport.data)) return undefined;
    const report = zReport.data;
    const mixTotal = Object.values(report?.paymentBreakdown ?? {}).reduce(
      (a, b) => a + b,
      0,
    );
    const branchName = branches.find(branch => branch.id === activeBranchId)?.name ?? '';
    return {
      scopeLabel: copy.scopeLabel(
        branchName,
        session
          ? [
              session.till?.name,
              `${strings.posHomeSalesOperations.shiftOpened} ${clock(session.openedAt)}`,
            ]
              .filter(Boolean)
              .join(' · ')
          : null,
      ),
      shiftOpen: Boolean(session),
      shiftSales: naira(report?.totalSales ?? 0),
      shiftMeta: copy.shiftMeta(report?.transactionCount ?? 0),
      mix: Object.entries(report?.paymentBreakdown ?? {}).map(([method, amount]) => ({
        id: method,
        label: tenderLabel(method),
        percent: percentOf(amount, mixTotal),
      })),
      drawer: report
        ? [
            {
              id: 'opening',
              label: copy.drawer.opening,
              value: naira(report.openingCash),
            },
            { id: 'cash', label: copy.drawer.cashSales, value: naira(report.cashSales) },
            { id: 'drops', label: copy.drawer.drops, value: naira(report.cashDrops) },
            {
              id: 'expected',
              label: copy.drawer.expected,
              value: naira(report.expectedCash),
            },
          ]
        : [],
      rows: (sales.data?.data ?? []).map(sale => toLedgerRow(sale, ledgerLabels())),
      held: held.data.map(item => {
        const customer = item.customer ? personName(item.customer) : null;
        return {
          id: item.id,
          label: copy.heldLabel(customer),
          total: naira(item.total),
          meta: copy.heldMeta(when(item.heldAt), personName(item.cashier ?? undefined)),
          items: item.items
            .map(line => `${line.quantity}× ${line.productName}`)
            .join(', '),
        };
      }),
      expectedCash: report?.expectedCash ?? 0,
    };
  }, [
    activeBranchId,
    branches,
    copy,
    held.data,
    register.data,
    sales.data,
    session,
    zReport.data,
  ]);

  return (
    <PosTransactionsLedgerShiftScreen
      view={view}
      isLoading={
        register.isLoading || held.isLoading || sales.isLoading || zReport.isLoading
      }
      isError={register.isError || held.isError || sales.isError || zReport.isError}
      onRetry={() => {
        void register.refetch();
        void held.refetch();
      }}
      isClosing={closeRegister.isPending}
      onBack={navigation.goBack}
      onOpenScope={() => navigation.navigate('PosBranchTillSwitcher')}
      onOpenDetails={saleId =>
        navigation.navigate('PosTransactionDetails', { receiptId: saleId })
      }
      onOpenRegister={() => navigation.navigate('PosBranchTillSwitcher')}
      onResumeTicket={heldId => {
        const item = held.data?.find(entry => entry.id === heldId);
        if (!item) return;
        ticket.setContext({ branchId: item.branchId });
        ticket.loadHeld({
          heldSaleId: item.id,
          lines: item.items.map(line => ({
            productId: line.productId,
            name: line.productName,
            unitPrice: line.unitPrice,
            quantity: line.quantity,
            discount: Math.max(0, line.unitPrice * line.quantity - line.totalPrice),
          })),
          customer: item.customer?.id
            ? {
                id: item.customer.id,
                name: personName(item.customer),
                phone: item.customer.phone,
              }
            : null,
          orderType: item.orderType,
          cartDiscount: 0,
          note: item.note,
        });
        void posApi
          .deleteHeldSale(item.id)
          .then(() =>
            queryClient.invalidateQueries({ queryKey: posKeys.held(activeBranchId) }),
          );
        showSuccess(copy.resumedToast);
        navigation.navigate('PosCurrentSaleCart');
      }}
      onDiscardTicket={heldId =>
        void posApi
          .deleteHeldSale(heldId)
          .then(() => {
            showSuccess(copy.discardedToast);
            return queryClient.invalidateQueries({
              queryKey: posKeys.held(activeBranchId),
            });
          })
          .catch(error => showError((error as Error).message))
      }
      onCloseShift={countedCash =>
        closeRegister.mutate(
          { countedCash },
          {
            onSuccess: closed =>
              showSuccess(copy.closedToast(drawerVarianceLabel(closed.variance))),
            onError: error => showError(error.message),
          },
        )
      }
    />
  );
}

export function toCustomerCard(customer: PosCustomer): PosCustomerCardView {
  const copy = strings.posCustomerLookupList;
  const name = personName(customer, customer.phone || customer.email);
  const vip = customer.segments.includes('vip');
  return {
    id: customer.id,
    name,
    initials: initials(name),
    contact: [customer.phone, customer.email].filter(Boolean).join('  •  '),
    tier: vip ? copy.vipTier(customer.tier) : customer.tier,
    vip,
    isNew: customer.segments.includes('new'),
    points: copy.pointsLabel(
      customer.pointsBalance.toLocaleString('en-NG'),
      customer.tier,
    ),
    visits: copy.visitsValue(customer.totalVisits),
    spend: naira(customer.totalSpent),
    lastVisit: when(customer.lastVisitAt),
  };
}

/** Attach a customer to the till's ticket. */
export function attachCustomer(customer: PosCustomer) {
  usePosTicketStore.getState().setCustomer({
    id: customer.id,
    name: personName(customer, customer.phone),
    phone: customer.phone,
    tier: customer.tier,
    points: customer.pointsBalance,
  });
}

const CUSTOMER_PAGE = 20;

export function PosCustomerLookupListRoute() {
  const navigation = useBusinessNavigation();
  const { activeBranchId, branches } = useActiveBranch();
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState<CustomerSegmentFilter>('all');
  const [limit, setLimit] = useState(CUSTOMER_PAGE);
  const debounced = useDebounce(search.trim(), 300);
  const customers = usePosCustomers({
    limit,
    ...(debounced ? { search: debounced } : {}),
    ...(segment !== 'all' ? { segment } : {}),
  });
  const hasActiveSale = usePosTicketStore(state => state.lines.length > 0);
  const copy = strings.posCustomerLookupList;

  const view = useMemo<PosCustomerLookupListView | undefined>(() => {
    if (!customers.data) return undefined;
    const counts = customers.data.segmentCounts;
    return {
      branchName: branches.find(branch => branch.id === activeBranchId)?.name ?? '',
      hasActiveSale,
      segments: [
        { id: 'all', label: copy.filterAll, count: counts?.all ?? 0 },
        { id: 'vip', label: copy.filterVip, count: counts?.vip ?? 0 },
        { id: 'new', label: copy.filterNew, count: counts?.new ?? 0 },
        { id: 'lapsed', label: copy.filterLapsed, count: counts?.lapsed ?? 0 },
      ],
      customers: customers.data.data.map(toCustomerCard),
      hasMore: customers.data.data.length < (customers.data.total ?? 0),
    };
  }, [activeBranchId, branches, copy, customers.data, hasActiveSale]);

  return (
    <PosCustomerLookupListScreen
      view={view}
      isLoading={customers.isLoading}
      isError={customers.isError}
      isFetchingMore={customers.isFetching && Boolean(customers.data)}
      onRetry={() => void customers.refetch()}
      search={search}
      segment={segment}
      onBack={navigation.goBack}
      onOpenCrmHub={() => navigation.navigate('CustomerCrmDirectory')}
      onSearchChange={text => {
        setSearch(text);
        setLimit(CUSTOMER_PAGE);
      }}
      onSelectSegment={next => {
        setSegment(next);
        setLimit(CUSTOMER_PAGE);
      }}
      onAttach={customerId => {
        const customer = customers.data?.data.find(item => item.id === customerId);
        if (!customer) return;
        attachCustomer(customer);
        showSuccess(copy.attachedToast(personName(customer, customer.phone)));
        navigation.navigate(hasActiveSale ? 'PosCurrentSaleCart' : 'PosNewSaleCatalog');
      }}
      onOpenDossier={customerId =>
        navigation.navigate('PosCustomerDossier', { customerId })
      }
      onLoadMore={() => setLimit(current => current + CUSTOMER_PAGE)}
    />
  );
}

export function toMatchedCustomer(
  detail: PosCustomerDetail,
  rewards: PosCustomerRewards | undefined,
): MatchedCustomerView {
  const copy = strings.posCustomerLookupActive;
  const name = personName(detail, detail.phone);
  return {
    id: detail.id,
    name,
    initials: initials(name),
    phone: detail.phone,
    tier: detail.tier,
    points: copy.pointsLabel(detail.pointsBalance.toLocaleString('en-NG')),
    stats: [
      {
        id: 'visits',
        label: copy.visitsLabel,
        value: String(detail.totalVisits),
        note: copy.visitsNote,
      },
      {
        id: 'spend',
        label: copy.spendLabel,
        value: naira(detail.totalSpent),
        note: copy.spendNote,
      },
      {
        id: 'avg',
        label: copy.avgLabel,
        value: naira(detail.averageOrderValue),
        note: copy.avgNote,
      },
    ],
    lastVisit: detail.lastVisitAt ? copy.lastVisitLabel(when(detail.lastVisitAt)) : '',
    rewards: (rewards?.data ?? []).slice(0, 3).map(reward => ({
      id: reward.id,
      title: reward.name,
      body: copy.rewardBody(reward.pointsRequired),
      badge: reward.affordable ? copy.rewardReady : copy.rewardShort(reward.pointsShort),
      affordable: reward.affordable,
    })),
  };
}

/** wa.me link for a Nigerian number written locally (0803…) or with +234. */
export function whatsappUrl(phone: string) {
  const digits = phone.replace(/\D/g, '');
  const international = digits.startsWith('0') ? `234${digits.slice(1)}` : digits;
  return `https://wa.me/${international}`;
}

export function PosCustomerLookupActiveRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessStackParamList, 'PosCustomerLookupActive'>>();
  const { activeBranchId } = useActiveBranch();
  const ticket = usePosTicketStore();
  const [search, setSearch] = useState(ticket.customer?.phone ?? '');
  const debounced = useDebounce(search.trim(), 400);
  const searching = debounced.length >= 4;
  const results = usePosCustomers({
    search: searching ? debounced : undefined,
    limit: 1,
  });
  const matchId =
    route.params?.customerId ??
    (searching ? results.data?.data[0]?.id : ticket.customer?.id);
  const detail = usePosCustomer(matchId);
  const rewards = usePosCustomerRewards(matchId, activeBranchId);
  const copy = strings.posCustomerLookupActive;

  const match = detail.data ? toMatchedCustomer(detail.data, rewards.data) : null;
  return (
    <PosCustomerLookupActiveScreen
      search={search}
      match={match}
      isSearching={results.isFetching || detail.isLoading}
      ticketLabel={copy.ticketLabel(
        ticket.lines.reduce((sum, line) => sum + line.quantity, 0),
      )}
      onBack={navigation.goBack}
      onSearchChange={setSearch}
      onOpenRewards={() =>
        matchId &&
        navigation.navigate('PosCustomerLookupLoyalty', { customerId: matchId })
      }
      onViewReceipts={() =>
        matchId && navigation.navigate('PosCustomerDossier', { customerId: matchId })
      }
      onSendWhatsApp={() =>
        match?.phone && void Linking.openURL(whatsappUrl(match.phone))
      }
      onAttach={() => {
        if (!detail.data) return;
        attachCustomer(detail.data);
        showSuccess(copy.attachedToast(match?.name ?? ''));
        navigation.goBack();
      }}
    />
  );
}

export function PosCustomerLookupLoyaltyRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessStackParamList, 'PosCustomerLookupLoyalty'>>();
  const { activeBranchId } = useActiveBranch();
  const ticketCustomer = usePosTicketStore(state => state.customer);
  const customerId = route.params?.customerId ?? ticketCustomer?.id;
  const detail = usePosCustomer(customerId);
  const rewards = usePosCustomerRewards(customerId, activeBranchId);
  const [issued, setIssued] = useState<{ rewardId: string; code: string } | null>(null);
  const issue = useMutation({
    mutationFn: (rewardId: string) =>
      posApi.generateRedemptionCode({ rewardId, branchId: activeBranchId as string }),
    onSuccess: (result, rewardId) => setIssued({ rewardId, code: result.code }),
    onError: error => showError(error.message),
  });
  const copy = strings.posCustomerLookupLoyalty;

  const view = useMemo<PosLoyaltyView | undefined>(() => {
    if (!detail.data || !rewards.data) return undefined;
    const name = personName(detail.data, detail.data.phone);
    return {
      name,
      initials: initials(name),
      phone: detail.data.phone,
      tier: detail.data.tier,
      balance: detail.data.pointsBalance.toLocaleString('en-NG'),
      stats: [
        { label: copy.visitsLabel, value: String(detail.data.totalVisits) },
        { label: copy.spendLabel, value: naira(detail.data.totalSpent) },
        { label: copy.averageLabel, value: naira(detail.data.averageOrderValue) },
      ],
      rewards: rewards.data.data.map(reward => ({
        id: reward.id,
        title: reward.name,
        cost: copy.rewardCost(reward.pointsRequired),
        body: reward.affordable ? copy.rewardReady : copy.rewardShort(reward.pointsShort),
        affordable: reward.affordable,
      })),
      attached: ticketCustomer?.id === detail.data.id,
    };
  }, [copy, detail.data, rewards.data, ticketCustomer?.id]);

  return (
    <PosCustomerLookupLoyaltyScreen
      view={view}
      isLoading={Boolean(customerId) && (detail.isLoading || rewards.isLoading)}
      isError={detail.isError || rewards.isError}
      onRetry={() => {
        void detail.refetch();
        void rewards.refetch();
      }}
      issued={issued}
      issuingRewardId={issue.isPending ? (issue.variables ?? null) : null}
      onBack={navigation.goBack}
      onChangeCustomer={() => navigation.navigate('PosCustomerLookupActive')}
      onIssueCode={rewardId => activeBranchId && issue.mutate(rewardId)}
      onAttach={() => {
        if (!detail.data) return;
        attachCustomer(detail.data);
        showSuccess(strings.posCustomerLookupActive.attachedToast(view?.name ?? ''));
      }}
    />
  );
}

export function PosCustomerDossierRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessStackParamList, 'PosCustomerDossier'>>();
  const { activeBranchId } = useActiveBranch();
  const customerId = route.params?.customerId;
  const detail = usePosCustomer(customerId);
  const rewards = usePosCustomerRewards(customerId, activeBranchId);
  const copy = strings.posCustomerDossier;

  const view = useMemo<PosDossierView | undefined>(() => {
    if (!detail.data) return undefined;
    const name = personName(detail.data, detail.data.phone);
    return {
      name,
      initials: initials(name),
      phone: detail.data.phone,
      email: detail.data.email,
      tier: detail.data.tier,
      since: detail.data.firstVisitAt
        ? copy.since(formatShortDate(detail.data.firstVisitAt))
        : '',
      stats: [
        {
          id: 'points',
          label: copy.pointsLabel,
          value: detail.data.pointsBalance.toLocaleString('en-NG'),
          note: copy.pointsNote,
        },
        {
          id: 'spend',
          label: copy.spendLabel,
          value: naira(detail.data.totalSpent),
          note: copy.spendNote,
        },
        {
          id: 'avg',
          label: copy.avgLabel,
          value: naira(detail.data.averageOrderValue),
          note: copy.avgNote,
        },
      ],
      rewards: (rewards.data?.data ?? []).slice(0, 3).map(reward => ({
        id: reward.id,
        title: reward.name,
        body: copy.rewardBody(reward.pointsRequired, reward.pointsShort),
        affordable: reward.affordable,
      })),
      visits: detail.data.recentPurchases.map(visit => ({
        id: visit.id,
        reference: visit.receipt,
        when: when(visit.date),
        total: naira(visit.total),
        items: visit.itemNames.join(', '),
        tender: tenderLabel(visit.paymentMethod),
      })),
    };
  }, [copy, detail.data, rewards.data]);

  return (
    <PosCustomerDossierScreen
      view={view}
      isLoading={detail.isLoading}
      isError={detail.isError || !customerId}
      onRetry={() => void detail.refetch()}
      onBack={navigation.goBack}
      onAttachToSale={() => {
        if (!detail.data) return;
        attachCustomer(detail.data);
        showSuccess(strings.posCustomerLookupActive.attachedToast(view?.name ?? ''));
        navigation.navigate('PosCurrentSaleCart');
      }}
      onOpenRewards={() =>
        customerId && navigation.navigate('PosCustomerLookupLoyalty', { customerId })
      }
      onOpenVisit={saleId =>
        navigation.navigate('PosTransactionDetails', { receiptId: saleId })
      }
      onOpenCrm={() => navigation.navigate('CustomerCrmDirectory')}
    />
  );
}

export function toInventoryItem(item: BusinessCatalogueItem): InventoryItemView {
  const stock = item.stockQuantity ?? null;
  const low = item.minStock ?? LOW_STOCK;
  return {
    id: item.id,
    name: item.name,
    sku: item.sku ?? '',
    category: item.category?.name ?? '',
    price: naira(Number(item.price ?? 0)),
    stock,
    state: stock == null ? 'untracked' : stock <= 0 ? 'out' : stock <= low ? 'low' : 'ok',
  };
}

export function PosProductsInventoryRoute() {
  const navigation = useBusinessNavigation();
  const { activeBranchId, branches } = useActiveBranch();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<InventoryFilter>('all');
  const debounced = useDebounce(search.trim(), 300);
  const catalogue = useBusinessCatalogue({
    itemType: 'product',
    limit: 100,
    ...(debounced ? { search: debounced } : {}),
  });
  const setStock = useSetStock();
  const queryClient = useQueryClient();
  const copy = strings.posProductsInventory;

  const view = useMemo<PosProductsInventoryView | undefined>(() => {
    if (!catalogue.data) return undefined;
    const all = catalogue.data.data.map(toInventoryItem);
    return {
      branchName: branches.find(branch => branch.id === activeBranchId)?.name ?? '',
      counts: {
        all: all.length,
        low: all.filter(item => item.state === 'low').length,
        out: all.filter(item => item.state === 'out').length,
      },
      items: filter === 'all' ? all : all.filter(item => item.state === filter),
    };
  }, [activeBranchId, branches, catalogue.data, filter]);

  return (
    <PosProductsInventoryScreen
      view={view}
      isLoading={catalogue.isLoading}
      isError={catalogue.isError}
      onRetry={() => void catalogue.refetch()}
      search={search}
      filter={filter}
      savingItemId={setStock.isPending ? (setStock.variables?.itemId ?? null) : null}
      onBack={navigation.goBack}
      onSearchChange={setSearch}
      onSelectFilter={setFilter}
      onAdjustStock={(itemId, next) =>
        setStock.mutate(
          { itemId, quantity: next, reason: copy.adjustReason },
          {
            onSuccess: () =>
              void queryClient.invalidateQueries({ queryKey: ['catalogue'] }),
            onError: error => showError(error.message),
          },
        )
      }
      onOpenItem={itemId => navigation.navigate('PosProductShiftStockStatus', { itemId })}
    />
  );
}

export function PosProductShiftStockStatusRoute() {
  const navigation = useBusinessNavigation();
  const route =
    useRoute<RouteProp<BusinessStackParamList, 'PosProductShiftStockStatus'>>();
  const itemId = route.params?.itemId;
  const { activeBranchId } = useActiveBranch();
  const catalogue = useBusinessCatalogue({ itemType: 'product', limit: 100 });
  const movements = useStockMovements(itemId);
  const setStock = useSetStock();
  const queryClient = useQueryClient();
  const ticket = usePosTicketStore();
  const copy = strings.posProductShiftStockStatus;
  const item = catalogue.data?.data.find(entry => entry.id === itemId);

  const view = useMemo<StockStatusView | undefined>(() => {
    if (!item) return undefined;
    const row = toInventoryItem(item);
    return {
      name: row.name,
      meta: copy.meta(row.sku, row.category),
      price: row.price,
      stock: row.stock,
      state: row.state,
      stateLabel: strings.posProductsInventory.stateLabel[row.state](row.stock ?? 0),
      history: (movements.data?.data ?? []).map(entry => ({
        id: entry.id,
        title: copy.movement(
          titleCase(entry.type.toLowerCase()),
          entry.quantityChange,
          entry.newQuantity,
        ),
        detail: copy.movementBy(entry.reason, personName(entry.user ?? undefined)),
        when: when(entry.createdAt),
      })),
    };
  }, [copy, item, movements.data]);

  const save = (quantity: number, reason: string) =>
    itemId &&
    setStock.mutate(
      { itemId, quantity, reason },
      {
        onSuccess: () => {
          showSuccess(copy.savedToast);
          void queryClient.invalidateQueries({ queryKey: ['catalogue'] });
        },
        onError: error => showError(error.message),
      },
    );

  return (
    <PosProductShiftStockStatusScreen
      view={view}
      isLoading={catalogue.isLoading}
      isError={catalogue.isError || (!catalogue.isLoading && !item)}
      onRetry={() => void catalogue.refetch()}
      isSaving={setStock.isPending}
      onBack={navigation.goBack}
      onSaveCount={count => save(count, copy.countReason)}
      onMarkSoldOut={() => save(0, copy.soldOutReason)}
      onAddToSale={() => {
        if (!item) return;
        ticket.setContext({ branchId: activeBranchId });
        ticket.addItem({
          productId: item.id,
          name: item.name,
          unitPrice: Number(item.price ?? 0),
          stock: item.stockQuantity ?? null,
        });
        navigation.navigate('PosCurrentSaleCart');
      }}
      onOpenGovernance={() => navigation.navigate('CentralCatalogue')}
    />
  );
}

/** Queued offline sales, reactive to the device queue. */
export function useQueuedSales(): QueuedSalePayload[] {
  const queue = useOfflineQueueStore(state => state.queue);
  return useMemo(
    () =>
      queue
        .filter(item => item.kind === POS_SALE_QUEUE_KIND)
        .map(item => item.payload as QueuedSalePayload),
    [queue],
  );
}

/** Push the device queue now and report the outcome. */
export function useSyncNow() {
  const [isSyncing, setSyncing] = useState(false);
  const sync = () => {
    setSyncing(true);
    syncOfflineSales()
      .then(outcomes => {
        const done = outcomes.filter(
          item => item.status === 'synced' || item.status === 'duplicate',
        ).length;
        showSuccess(strings.posHomeOfflineMode.syncedToast(done));
      })
      .catch(error => showError((error as Error).message))
      .finally(() => setSyncing(false));
  };
  return { isSyncing, sync };
}

export function PosHomeOfflineModeRoute() {
  const navigation = useBusinessNavigation();
  const { activeBranchId, branches } = useActiveBranch();
  const network = useNetworkStatus();
  const queued = useQueuedSales();
  const lastPushAt = usePosSyncStore(state => state.lastPushAt);
  const register = useRegisterStatus();
  const dashboard = usePosDashboard(activeBranchId);
  const catalogue = useBranchCatalogue(activeBranchId, { limit: 50 });
  const user = useAuthStore(state => state.user);
  const { isSyncing, sync } = useSyncNow();

  return (
    <PosHomeOfflineModeScreen
      view={{
        online: network.isConnected,
        branchName: branches.find(branch => branch.id === activeBranchId)?.name ?? '',
        shiftLine: register.data?.session
          ? [personName(user ?? undefined), register.data.session.till?.name]
              .filter(Boolean)
              .join(' • ')
          : '',
        queuedCount: queued.length,
        queuedAmount: naira(queued.reduce((sum, item) => sum + item.meta.total, 0)),
        lastSync: lastPushAt ? when(lastPushAt) : null,
        menuCount: catalogue.data?.data.length ?? 0,
        tally: dashboard.data
          ? {
              sales: naira(Number(dashboard.data.revenue ?? 0)),
              transactions: String(Number(dashboard.data.transactionCount ?? 0)),
              held: String(Number(dashboard.data.heldSalesCount ?? 0)),
            }
          : null,
      }}
      isSyncing={isSyncing}
      onBack={navigation.goBack}
      onRetrySync={sync}
      onOpenAction={actionId => {
        if (actionId === 'new-sale') navigation.navigate('PosNewSaleCatalog');
        if (actionId === 'queue') navigation.navigate('PosOfflineBufferQueue');
        if (actionId === 'products') navigation.navigate('PosNewSaleCatalog');
      }}
    />
  );
}

export function PosOfflineBufferQueueRoute() {
  const navigation = useBusinessNavigation();
  const network = useNetworkStatus();
  const queued = useQueuedSales();
  const [filter, setFilter] = useState<BufferFilter>('all');
  const { isSyncing, sync } = useSyncNow();
  const methodOf = (item: QueuedSalePayload) => item.input.payment.method;
  const visible =
    filter === 'all' ? queued : queued.filter(item => methodOf(item) === filter);

  return (
    <PosOfflineBufferQueueScreen
      view={{
        online: network.isConnected,
        pendingCount: queued.length,
        volume: naira(queued.reduce((sum, item) => sum + item.meta.total, 0)),
        counts: {
          all: queued.length,
          cash: queued.filter(item => methodOf(item) === 'cash').length,
          card: queued.filter(item => methodOf(item) === 'card').length,
          transfer: queued.filter(item => methodOf(item) === 'transfer').length,
        },
        sales: visible.map(item => ({
          id: item.meta.clientRef,
          total: naira(item.meta.total),
          method: item.meta.method,
          when: when(item.meta.createdAt),
          items: item.meta.itemNames.join(', '),
          cashier: item.meta.cashierName,
        })),
      }}
      filter={filter}
      isSyncing={isSyncing}
      onBack={navigation.goBack}
      onSelectFilter={setFilter}
      onSyncNow={sync}
      onReturnToRegister={() => navigation.navigate('PosNewSaleCatalog')}
    />
  );
}

export function PosSyncReconciliationRoute() {
  const navigation = useBusinessNavigation();
  const network = useNetworkStatus();
  const queued = useQueuedSales();
  const outcomes = usePosSyncStore(state => state.outcomes);
  const lastPushAt = usePosSyncStore(state => state.lastPushAt);
  const dismiss = usePosSyncStore(state => state.dismiss);
  const { isSyncing, sync } = useSyncNow();
  const copy = strings.posSyncReconciliation;

  const journal: SyncJournalEntry[] = outcomes.map(item => ({
    id: item.clientRef,
    status: item.status,
    title: copy.entryTitle(naira(item.total), item.method),
    detail: item.error ?? item.itemNames.join(', '),
    when: copy.entryWhen(when(item.createdAt), item.receiptNumber),
    canRequeue: item.status === 'conflict' && Boolean(item.input),
  }));

  return (
    <PosSyncReconciliationScreen
      view={{
        online: network.isConnected,
        waiting: queued.length,
        synced: outcomes.filter(
          item => item.status === 'synced' || item.status === 'duplicate',
        ).length,
        needsReview: outcomes.filter(item => item.status === 'conflict').length,
        lastPush: lastPushAt ? when(lastPushAt) : copy.neverPushed,
        journal,
      }}
      isSyncing={isSyncing}
      onBack={navigation.goBack}
      onForceSync={sync}
      onRequeue={id => {
        if (requeueConflict(id)) showSuccess(copy.requeuedToast);
      }}
      onDismiss={dismiss}
      onOpenSale={id => {
        const saleId = outcomes.find(item => item.clientRef === id)?.saleId;
        if (saleId) navigation.navigate('PosTransactionDetails', { receiptId: saleId });
      }}
    />
  );
}

/** Settings screens: the saved settings, a save that toasts, and who may edit. */
export function usePosSettingsRoute(savedToast: string) {
  const settings = usePosSettings();
  const update = useUpdatePosSettings();
  const user = useAuthStore(state => state.user);
  const canEdit = MANAGER_ROLES.includes((user?.role ?? '').toLowerCase());
  const save = (body: PosSettingsUpdate, onDone?: () => void) =>
    update.mutate(body, {
      onSuccess: () => {
        showSuccess(savedToast);
        onDone?.();
      },
      onError: error => showError(error.message),
    });
  return { settings, update, canEdit, save };
}

export function TaxesSurchargesRoute() {
  const navigation = useBusinessNavigation();
  const { settings, update, canEdit, save } = usePosSettingsRoute(
    strings.taxesSurcharges.updatedToast,
  );
  return (
    <TaxesSurchargesScreen
      key={settings.dataUpdatedAt}
      settings={settings.data}
      isLoading={settings.isLoading}
      isError={settings.isError}
      onRetry={() => void settings.refetch()}
      isSaving={update.isPending}
      canEdit={canEdit}
      onBack={navigation.goBack}
      onApply={body => save(body)}
    />
  );
}

export function PosReceiptCustomizationRoute() {
  const navigation = useBusinessNavigation();
  const business = useMyBusiness();
  const { settings, update, canEdit, save } = usePosSettingsRoute(
    strings.posReceiptCustomization.savedToast,
  );
  const latest = usePosSales({ limit: 1 });
  const latestSale = usePosSale(latest.data?.data[0]?.id);
  const sample = useReceiptView(latestSale.data);
  return (
    <PosReceiptCustomizationScreen
      key={settings.dataUpdatedAt}
      settings={settings.data}
      businessName={business.data?.name ?? ''}
      sample={sample ?? null}
      isLoading={settings.isLoading}
      isError={settings.isError}
      onRetry={() => void settings.refetch()}
      isSaving={update.isPending}
      canEdit={canEdit}
      onBack={navigation.goBack}
      onSave={body => save(body)}
    />
  );
}

export function StaffPermissionsPasscodesRoute() {
  const navigation = useBusinessNavigation();
  const copy = strings.staffPermissionsPasscodes;
  const { settings, update, canEdit, save } = usePosSettingsRoute(copy.savedToast);
  const pins = useStaffPins();
  const overrides = useOverrideLog();
  const queryClient = useQueryClient();
  const refreshPins = () =>
    void queryClient.invalidateQueries({ queryKey: posKeys.staffPins() });

  return (
    <StaffPermissionsPasscodesScreen
      key={settings.dataUpdatedAt}
      settings={settings.data}
      team={pins.data?.data.map(member => ({
        userId: member.userId,
        name: member.name,
        initials: initials(member.name),
        role: member.role,
        hasPin: member.hasPin,
        isSupervisor: member.isSupervisor,
        locked: Boolean(member.lockedUntil),
      }))}
      overrides={
        overrides.data
          ? {
              total: overrides.data.total ?? 0,
              recent: overrides.data.data.map(entry => ({
                id: entry.id,
                title: copy.overrideTitle(
                  copy.actions[entry.action as keyof typeof copy.actions] ??
                    titleCase(entry.action),
                  entry.supervisorName,
                ),
                detail: copy.overrideDetail(entry.requestedByName, entry.reason),
                when: when(entry.createdAt),
              })),
            }
          : undefined
      }
      isLoading={settings.isLoading || pins.isLoading}
      isError={settings.isError || pins.isError}
      onRetry={() => {
        void settings.refetch();
        void pins.refetch();
      }}
      isSaving={update.isPending}
      canEdit={canEdit}
      onBack={navigation.goBack}
      onSave={body => save(body)}
      onSetPin={(userId, pin, isSupervisor) =>
        void posApi
          .setStaffPin(userId, { pin, isSupervisor })
          .then(() => {
            showSuccess(copy.pinSavedToast);
            refreshPins();
          })
          .catch(error => showError((error as Error).message))
      }
      onRemovePin={userId =>
        void posApi
          .removeStaffPin(userId)
          .then(() => {
            showSuccess(copy.pinRemovedToast);
            refreshPins();
          })
          .catch(error => showError((error as Error).message))
      }
    />
  );
}

export function PaymentHardwareSetupRoute() {
  const navigation = useBusinessNavigation();
  const copy = strings.paymentHardwareSetup;
  const { activeBranchId } = useActiveBranch();
  const { settings, update, canEdit, save } = usePosSettingsRoute(copy.savedToast);
  const devices = usePeripherals(activeBranchId);
  const createDevice = useCreatePeripheral();
  const queryClient = useQueryClient();

  return (
    <PaymentHardwareSetupScreen
      key={settings.dataUpdatedAt}
      settings={settings.data}
      devices={devices.data?.data.map(device => {
        const type = device.type as PeripheralType;
        return {
          id: device.id,
          type,
          name: device.name,
          meta: copy.deviceMeta(
            copy.types[type] ?? titleCase(device.type),
            device.model,
            copy.connections[device.connection as keyof typeof copy.connections] ??
              device.connection,
            device.address,
          ),
          status: device.status,
        };
      })}
      isLoading={settings.isLoading || devices.isLoading}
      isError={settings.isError || devices.isError}
      onRetry={() => {
        void settings.refetch();
        void devices.refetch();
      }}
      isSaving={update.isPending}
      canEdit={canEdit}
      onBack={navigation.goBack}
      onSaveRails={body => save(body)}
      onAddDevice={input =>
        activeBranchId &&
        createDevice.mutate(
          { branchId: activeBranchId, ...input },
          {
            onSuccess: () => showSuccess(copy.deviceAddedToast),
            onError: error => showError(error.message),
          },
        )
      }
      onRemoveDevice={id =>
        void posApi
          .deletePeripheral(id)
          .then(() => {
            showSuccess(copy.deviceRemovedToast);
            return queryClient.invalidateQueries({ queryKey: ['pos', 'peripherals'] });
          })
          .catch(error => showError((error as Error).message))
      }
    />
  );
}

export function PosGeneralSettingsRoute() {
  const navigation = useBusinessNavigation();
  const { activeBranchId, branches } = useActiveBranch();
  const business = useMyBusiness();
  const settings = usePosSettings();
  const summary = usePosSettingsSummary();
  const network = useNetworkStatus();
  const queuedCount = useQueuedSaleCount();
  const copy = strings.posGeneralSettings;

  const view = useMemo<PosGeneralSettingsView | undefined>(() => {
    if (!settings.data || !summary.data) return undefined;
    const s = settings.data;
    const sum = summary.data;
    const rails = [
      s.tenderRails.cash,
      s.tenderRails.card,
      s.tenderRails.transfer.enabled,
      s.tenderRails.oneTap,
      s.tenderRails.houseTab.enabled,
    ].filter(Boolean).length;
    return {
      venue: business.data?.name ?? '',
      branch: branches.find(branch => branch.id === activeBranchId)?.name ?? '',
      online: network.isConnected,
      values: {
        receipt: copy.values.receiptWidth(sum.receiptWidth),
        hardware: copy.values.devices(sum.peripheralCount),
        payments: copy.values.railsCount(rails),
        taxes:
          [sum.taxLabel, sum.serviceChargeLabel].filter(Boolean).join(' • ') ||
          copy.values.noTax,
        'public-pos': s.rushPause
          ? copy.values.paused
          : s.selfOrderingEnabled
            ? copy.values.selfOrderingOn
            : copy.values.selfOrderingOff,
        kitchen: copy.values.kitchen,
        offline: copy.values.queued(queuedCount),
        tills: copy.values.tills(sum.tillCount, sum.activeCashiers),
        security: sum.supervisorPinRequired
          ? copy.values.supervisorOn(sum.staffPinCount)
          : copy.values.supervisorOff,
      },
      telemetry: [
        {
          id: 'offline',
          label: copy.telemetry.offline,
          value: copy.telemetry.offlineValue(queuedCount, sum.offlineBufferLimit),
        },
        {
          id: 'sync',
          label: copy.telemetry.sync,
          value: copy.telemetry.syncValue(sum.autoSyncIntervalSec),
        },
        { id: 'tables', label: copy.telemetry.tables, value: String(sum.tableCount) },
      ],
    };
  }, [
    activeBranchId,
    branches,
    business.data?.name,
    copy,
    network.isConnected,
    queuedCount,
    settings.data,
    summary.data,
  ]);

  const openSetting = (id: PosSettingLinkId) => {
    switch (id) {
      case 'receipt':
        navigation.navigate('PosReceiptCustomization');
        break;
      case 'hardware':
      case 'payments':
        navigation.navigate('PaymentHardwareSetup');
        break;
      case 'taxes':
      case 'public-pos':
        navigation.navigate('TaxesSurcharges');
        break;
      case 'kitchen':
        navigation.navigate('MerchantPosKitchenStream');
        break;
      case 'offline':
        navigation.navigate('PosSyncReconciliation');
        break;
      case 'tills':
        navigation.navigate('PosBranchTillSwitcher');
        break;
      case 'security':
        navigation.navigate('StaffPermissionsPasscodes');
        break;
    }
  };

  return (
    <PosGeneralSettingsScreen
      view={view}
      isLoading={settings.isLoading || summary.isLoading}
      isError={settings.isError || summary.isError}
      onRetry={() => {
        void settings.refetch();
        void summary.refetch();
      }}
      onBack={navigation.goBack}
      onOpenSetting={openSetting}
    />
  );
}

const KITCHEN_NEXT: Record<
  KitchenAction,
  'processing' | 'ready' | 'completed' | 'cancelled'
> = {
  accept: 'processing',
  ready: 'ready',
  complete: 'completed',
  reject: 'cancelled',
};

export function MerchantPosKitchenStreamRoute() {
  const navigation = useBusinessNavigation();
  const { activeBranchId, branches } = useActiveBranch();
  const [tab, setTab] = useState<KitchenTab>('new');
  const stream = useKitchenStream(activeBranchId);
  const updateStatus = useUpdateKitchenStatus(activeBranchId);
  useKitchenRealtime(activeBranchId);
  const copy = strings.merchantPosKitchenStream;

  const view = useMemo<MerchantPosKitchenStreamView | undefined>(() => {
    if (!stream.data) return undefined;
    const { counts } = stream.data;
    return {
      branchLabel: branches.find(branch => branch.id === activeBranchId)?.name ?? '',
      counts: {
        new: counts.new,
        processing: counts.processing,
        ready: counts.ready,
        completed: counts.completed,
      },
      orders: stream.data.data
        .filter(order => order.status === tab)
        .map(order => ({
          id: order.id,
          reference: order.reference,
          tableLabel: copy.tableLabel(order.tableNumber ?? null),
          guest: copy.guestLabel(order.guestName ?? null),
          guestPhone: order.guestPhone ?? null,
          elapsed: copy.elapsed(order.elapsedMinutes),
          lines: order.lines.map((line, index) => ({
            id: `${order.id}-${index}`,
            qty: String(line.quantity),
            name: line.name,
            price: naira(line.lineTotal),
          })),
          note: order.notes ?? null,
          total: naira(order.totalAmount),
          paid: order.paid,
        })),
      stats: {
        active: String(counts.new + counts.processing + counts.ready),
        avgPrep: copy.avgPrepValue(stream.data.averagePrepMinutes ?? null),
        unpaid: naira(stream.data.unpaidTotal),
      },
    };
  }, [activeBranchId, branches, copy, stream.data, tab]);

  return (
    <MerchantPosKitchenStreamScreen
      view={view}
      isLoading={stream.isLoading}
      isError={stream.isError}
      onRetry={() => void stream.refetch()}
      tab={tab}
      busyOrderId={
        updateStatus.isPending ? (updateStatus.variables?.orderId ?? null) : null
      }
      onBack={navigation.goBack}
      onSelectTab={setTab}
      onAction={(orderId, action) =>
        updateStatus.mutate(
          { orderId, status: KITCHEN_NEXT[action] },
          {
            onSuccess: () => showSuccess(copy.statusToast[action]),
            onError: error => showError(error.message),
          },
        )
      }
      onCallGuest={phone => void Linking.openURL(`tel:${phone}`)}
      onReturnToRegister={() => navigation.navigate('PosNewSaleCatalog')}
    />
  );
}

let splitPersonSeq = 0;
const newSplitPerson = (): SplitPersonDraft => ({
  key: `person-${(splitPersonSeq += 1)}`,
  name: '',
  lineIds: [],
  amount: '',
  tender: 'cash',
});

export function SplitTheBillRoute() {
  const navigation = useBusinessNavigation();
  const { activeBranchId } = useActiveBranch();
  const { totals, rows, settings, ticket } = useTicketTotals();
  const completeSale = useCompleteSale();
  const tillId = useMirrorTicketToDisplay();
  const [mode, setMode] = useState<SplitMode>('equal');
  const [people, setPeople] = useState<SplitPersonDraft[]>(() => [
    newSplitPerson(),
    newSplitPerson(),
  ]);
  const copy = strings.splitTheBill;
  const debouncedPeople = useDebounce(people, 300);

  const input = useMemo<SplitPreviewInput | null>(() => {
    if (!ticket.lines.length) return null;
    return {
      mode,
      lines: ticket.lines.map(line => ({
        id: line.productId,
        name: line.name,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      })),
      people: debouncedPeople.map((person, index) => ({
        name: person.name.trim() || copy.personPlaceholder(index + 1),
        ...(mode === 'by_item' ? { lineIds: person.lineIds } : {}),
        ...(mode === 'custom'
          ? { amount: Number(person.amount.replace(/[^\d.]/g, '')) || 0 }
          : {}),
      })),
      discountAmount: totals.discount || undefined,
      orderType: ticket.orderType,
      waiveServiceCharge: ticket.waiveServiceCharge || undefined,
    };
  }, [
    copy,
    debouncedPeople,
    mode,
    ticket.lines,
    ticket.orderType,
    ticket.waiveServiceCharge,
    totals.discount,
  ]);
  const preview = useSplitPreview(input);

  const rails = settings?.tenderRails;
  const tenders: SplitTender[] = [
    ...(rails?.cash !== false ? (['cash'] as const) : []),
    ...(rails?.card !== false ? (['card'] as const) : []),
    ...(rails?.transfer?.enabled ? (['transfer'] as const) : []),
  ];

  const settle = () => {
    const branchId = ticket.branchId ?? activeBranchId;
    if (!branchId || !preview.data) return;
    const splitDetails = preview.data.people
      .map((share, index) => ({
        method: people[index]?.tender ?? 'cash',
        amount: share.amount,
        payer: share.name,
      }))
      .filter(part => part.amount > 0);
    completeSale.mutate(
      {
        branchId,
        items: ticket.lines.map(line => ({
          productId: line.productId,
          quantity: line.quantity,
          discount: line.discount || undefined,
        })),
        payment: { method: 'split', amountPaid: preview.data.total, splitDetails },
        cartDiscountAmount: ticket.cartDiscount || undefined,
        customerId: ticket.customer?.id,
        orderType: ticket.orderType,
        waiveServiceCharge: ticket.waiveServiceCharge || undefined,
      },
      {
        onSuccess: sale => {
          if (tillId) void posApi.clearDisplay(tillId, sale.id).catch(() => undefined);
          ticket.clear();
          showSuccess(copy.settledToast);
          navigation.navigate('PosSaleCompleted', { saleId: sale.id });
        },
        onError: error => showError(error.message),
      },
    );
  };

  return (
    <SplitTheBillScreen
      lines={ticket.lines.map(line => ({
        id: line.productId,
        name: line.name,
        qty: line.quantity,
        price: naira(line.unitPrice * line.quantity),
      }))}
      mode={mode}
      people={people}
      shares={
        preview.data
          ? preview.data.people.map(share => ({
              amount: naira(share.amount),
              detail: copy.shareDetail(
                share.tax ? naira(share.tax) : '',
                share.serviceCharge ? naira(share.serviceCharge) : '',
              ),
            }))
          : null
      }
      totals={rows}
      grandTotal={naira(preview.data?.total ?? totals.total)}
      error={preview.error ? preview.error.message : null}
      tenders={tenders}
      isSubmitting={completeSale.isPending}
      onBack={navigation.goBack}
      onChangeMode={setMode}
      onChangePerson={(key, patch) =>
        setPeople(current =>
          current.map(person => (person.key === key ? { ...person, ...patch } : person)),
        )
      }
      onAddPerson={() => setPeople(current => [...current, newSplitPerson()])}
      onRemovePerson={key =>
        setPeople(current => current.filter(person => person.key !== key))
      }
      onSettle={settle}
    />
  );
}

/** The till this display follows: the route param, else the register's till. */
function useDisplayTillId(paramTillId: string | undefined) {
  const register = useRegisterStatus();
  return paramTillId ?? register.data?.session?.tillId ?? undefined;
}

export function toDisplayTicketView(
  state: DisplayState,
): CustomerDisplayTicketView | null {
  const { ticket } = state;
  if (!ticket) return null;
  return {
    venue: state.venue.name,
    tableLabel: ticket.tableNumber
      ? strings.customerDisplayOrderTotal.tableLabel(ticket.tableNumber)
      : null,
    lines: ticket.lines.map((line, index) => ({
      id: `${index}-${line.name}`,
      label: `${line.quantity}× ${line.name}`,
      value: naira(line.lineTotal),
    })),
    totals: totalsRows(
      {
        subtotal: ticket.subtotal,
        discount: ticket.discountAmount,
        tax: ticket.tax,
        serviceCharge: ticket.serviceCharge,
        packagingFee: ticket.packagingFee,
      },
      { label: state.taxLabel, rate: 0, included: false },
      strings.posTotals,
    ).map(row => (row.id === 'tax' ? { ...row, label: state.taxLabel } : row)),
    total: naira(ticket.total),
  };
}

export function CustomerDisplayOrderRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessStackParamList, 'CustomerDisplayOrder'>>();
  const tillId = useDisplayTillId(route.params?.tillId);
  const display = useCustomerDisplay(tillId);
  useCustomerDisplayRealtime(tillId, {
    onPaid: saleId =>
      tillId &&
      navigation.navigate('CustomerDisplayRating', {
        tillId,
        saleId: saleId ?? undefined,
      }),
  });

  return (
    <CustomerDisplayOrderTotalScreen
      venue={display.data?.venue.name}
      ticket={display.data ? toDisplayTicketView(display.data) : undefined}
      isLoading={display.isLoading || !tillId}
      isError={display.isError || (!tillId && !display.isLoading)}
      onRetry={() => void display.refetch()}
      onPay={() => tillId && navigation.navigate('CustomerDisplayPayment', { tillId })}
    />
  );
}

export function CustomerDisplayPaymentRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessStackParamList, 'CustomerDisplayPayment'>>();
  const tillId = useDisplayTillId(route.params?.tillId);
  const display = useCustomerDisplay(tillId);
  useCustomerDisplayRealtime(tillId, {
    onPaid: saleId =>
      tillId &&
      navigation.navigate('CustomerDisplayRating', {
        tillId,
        saleId: saleId ?? undefined,
      }),
  });
  const state = display.data;
  const transfer = state?.transfer;

  return (
    <CustomerDisplayTapQrPayScreen
      view={{
        total: state?.ticket ? naira(state.ticket.total) : null,
        tableLabel: state?.ticket?.tableNumber
          ? strings.customerDisplayOrderTotal.tableLabel(state.ticket.tableNumber)
          : null,
        methods: (['cash', 'card', 'transfer', 'oneTap'] as const).map(id => ({
          id,
          enabled: Boolean(state?.paymentMethods[id]),
        })),
        transfer:
          transfer && transfer.accountNumber
            ? {
                bankName: transfer.bankName,
                accountNumber: transfer.accountNumber,
                accountName: transfer.accountName,
              }
            : null,
      }}
      onBack={navigation.goBack}
    />
  );
}

export function CustomerDisplayRatingRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessStackParamList, 'CustomerDisplayRating'>>();
  const tillId = useDisplayTillId(route.params?.tillId);
  const saleId = route.params?.saleId;
  const sale = usePosSale(saleId);
  const send = useSendTipRating(tillId);
  const [done, setDone] = useState(false);
  const backToOrder = () =>
    tillId && navigation.navigate('CustomerDisplayOrder', { tillId });

  return (
    <CustomerDisplayTipRatingScreen
      billTotal={sale.data?.total ?? null}
      isSubmitting={send.isPending}
      done={done}
      onSubmit={feedback =>
        send.mutate(
          { saleId, tipAmount: feedback.tipAmount, rating: feedback.rating },
          { onSuccess: () => setDone(true), onError: error => showError(error.message) },
        )
      }
      onSkip={backToOrder}
      onFinish={backToOrder}
    />
  );
}

export function PublicPosOrderMenuRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessStackParamList, 'PublicPosOrderMenu'>>();
  const { activeBranchId } = useActiveBranch();
  const branchId = route.params?.branchId ?? activeBranchId ?? undefined;
  const cart = usePublicPosCartStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const debounced = useDebounce(search.trim(), 300);
  const info = useGuestOrderingInfo(branchId);
  const items = useBranchCatalogue(branchId ?? null, {
    limit: 50,
    ...(debounced ? { search: debounced } : {}),
    ...(category !== 'all' ? { categoryId: category } : {}),
  });
  const categories = useBranchCatalogueCategories(branchId ?? null);
  const copy = strings.publicPosMenu;
  const tableNumber = route.params?.tableNumber ?? cart.tableNumber;

  useEffect(() => {
    if (branchId) cart.setContext({ branchId, tableNumber: route.params?.tableNumber });
    // Only when the branch or table the guest scanned changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, route.params?.tableNumber]);

  const view = useMemo<PublicPosOrderMenuView | undefined>(() => {
    if (!info.data || !items.data || !categories.data) return undefined;
    const count = cart.lines.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = cart.lines.reduce(
      (sum, line) => sum + line.unitPrice * line.quantity,
      0,
    );
    return {
      venue: info.data.businessName,
      branch: info.data.branchName,
      tableLabel: tableNumber ? copy.tableLabel(tableNumber) : null,
      acceptingOrders: info.data.acceptingOrders,
      prepLabel: copy.prepLabel(info.data.prepMinutes),
      categories: categories.data.map(item => ({ id: item.id, label: item.name })),
      items: items.data.data
        .filter(item => !item.isSuspended && item.itemType !== 'service')
        .map(item => ({
          id: item.id,
          name: item.name,
          detail: item.shortDescription ?? '',
          price: naira(Number(item.price ?? 0)),
          inCart: cart.lines.find(line => line.itemId === item.id)?.quantity ?? 0,
          soldOut:
            item.stockQuantity != null && item.stockQuantity <= 0 && !item.allowBackOrder,
        })),
      cart: { count, total: naira(subtotal) },
    };
  }, [cart.lines, categories.data, copy, info.data, items.data, tableNumber]);

  return (
    <PublicPosOrderMenuScreen
      view={view}
      isLoading={info.isLoading || items.isLoading}
      isError={info.isError || items.isError || !branchId}
      onRetry={() => {
        void info.refetch();
        void items.refetch();
      }}
      search={search}
      category={category}
      onBack={navigation.goBack}
      onSearchChange={setSearch}
      onSelectCategory={setCategory}
      onAddItem={itemId => {
        const item = items.data?.data.find(entry => entry.id === itemId);
        if (item)
          cart.add({
            itemId: item.id,
            name: item.name,
            unitPrice: Number(item.price ?? 0),
          });
      }}
      onReviewOrder={() =>
        navigation.navigate('PublicPosCartReview', {
          branchId,
          tableNumber: tableNumber ?? undefined,
        })
      }
    />
  );
}

export function PublicPosCartReviewRoute() {
  const navigation = useBusinessNavigation();
  const cart = usePublicPosCartStore();
  const info = useGuestOrderingInfo(cart.branchId ?? undefined);
  const place = usePlaceGuestOrder();
  const [error, setError] = useState<string | null>(null);
  const pricing = info.data?.pricing;
  const totals = computeTicketTotals(
    cart.lines.map(line => ({
      unitPrice: line.unitPrice,
      quantity: line.quantity,
      discount: 0,
    })),
    pricing
      ? {
          taxEnabled: pricing.taxEnabled,
          taxRate: pricing.taxRate,
          pricesIncludeTax: pricing.pricesIncludeTax,
          serviceChargeEnabled: pricing.serviceChargeEnabled,
          serviceChargeRate: pricing.serviceChargeRate,
        }
      : undefined,
  );

  return (
    <PublicPosCartReviewScreen
      tableLabel={
        cart.tableNumber ? strings.publicPosMenu.tableLabel(cart.tableNumber) : null
      }
      lines={cart.lines.map(line => ({
        id: line.itemId,
        name: line.name,
        qty: line.quantity,
        price: naira(line.unitPrice * line.quantity),
      }))}
      totals={totalsRows(
        totals,
        {
          label: pricing?.taxLabel ?? 'VAT',
          rate: pricing?.taxRate ?? 0,
          included: Boolean(pricing?.pricesIncludeTax),
        },
        strings.posTotals,
      )}
      total={naira(totals.total)}
      name={cart.name}
      phone={cart.phone}
      notes={cart.notes}
      error={error}
      isSubmitting={place.isPending}
      onBack={navigation.goBack}
      onAddFood={navigation.goBack}
      onChangeQty={cart.setQuantity}
      onEditName={name => cart.setGuest({ name })}
      onEditPhone={phone => cart.setGuest({ phone })}
      onEditNotes={notes => cart.setGuest({ notes })}
      onSubmitOrder={() => {
        if (!cart.branchId) return;
        const [firstName, ...rest] = cart.name.trim().split(/\s+/);
        setError(null);
        place.mutate(
          {
            branchId: cart.branchId,
            firstName,
            lastName: rest.join(' ') || firstName,
            phone: cart.phone.trim(),
            tableNumber: cart.tableNumber ?? undefined,
            notes: cart.notes.trim() || undefined,
            items: cart.lines.map(line => ({
              itemId: line.itemId,
              quantity: line.quantity,
            })),
          },
          {
            onSuccess: order => {
              cart.placed(order.trackingToken ?? null);
              navigation.navigate('PublicPosOrderTracking', {
                trackingToken: order.trackingToken ?? undefined,
              });
            },
            onError: failure => setError(failure.message),
          },
        );
      }}
    />
  );
}

export function PublicPosOrderTrackingRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessStackParamList, 'PublicPosOrderTracking'>>();
  const lastToken = usePublicPosCartStore(state => state.trackingToken);
  const token = route.params?.trackingToken ?? lastToken ?? undefined;
  const tracking = useOrderTracking(token);
  const trackingData = tracking.data;
  useGuestTrackingRealtime(token);
  const copy = strings.publicPosOrderTracking;

  const view = useMemo<OrderTrackingView | undefined>(() => {
    const data = trackingData;
    if (!data) return undefined;
    const status = data.cancelled ? 'cancelled' : data.status;
    return {
      headline: copy.headline[status as keyof typeof copy.headline] ?? copy.headline.new,
      body: data.cancelled
        ? copy.cancelledBody
        : copy.body(
            data.venue.businessName || data.venue.branchName,
            data.tableNumber ?? null,
          ),
      readyBy: copy.readyBy(clock(data.estimatedReadyAt)),
      cancelled: data.cancelled,
      steps: data.steps.map(step => ({
        status: step.status,
        label:
          copy.steps[step.status as keyof typeof copy.steps] ?? titleCase(step.status),
        at: clock(step.at),
        reached: step.reached,
      })),
      reference: data.reference,
      tableLabel: data.tableNumber ? copy.tableLabel(data.tableNumber) : null,
      server: data.server ? copy.serverLabel(data.server.firstName) : null,
      lines: data.lines.map((line, index) => ({
        id: `${index}-${line.name}`,
        label: `${line.quantity}× ${line.name}`,
        value: naira(line.lineTotal),
      })),
      total: naira(data.totalAmount),
    };
  }, [copy, trackingData]);

  return (
    <PublicPosOrderTrackingScreen
      view={view}
      isLoading={tracking.isLoading}
      isError={tracking.isError || !token}
      onRetry={() => void tracking.refetch()}
      onBack={navigation.goBack}
      onReopenMenu={() => navigation.navigate('PublicPosOrderMenu')}
    />
  );
}
