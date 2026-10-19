import { enterShell } from '@navigation/shellSwitch';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useStartNewDeal } from '@navigation/useStartNewDeal';
import { Alert, Clipboard, Linking } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFocusEffect, useRoute, type RouteProp } from '@react-navigation/native';
import { strings } from '@constants/strings';
import { useTabBarStore } from '@store/tabBarStore';
import { useHideTabBarOnFocus } from '@navigation/useHideTabBarOnFocus';
import {
  BusinessTabBar,
  type BusinessTabBadge,
} from '@features/business/components/BusinessTabBar';
import { BusinessDashboardOverviewScreen } from '@features/business/screens/BusinessDashboardOverviewScreen';
import { BusinessOrdersHubScreen } from '@features/business/screens/BusinessOrdersHubScreen';
import { OrderDetailScreen } from '@features/business/screens/BusinessOrderDetailScreen';
import { BusinessBookingDetailScreen } from '@features/business/screens/BusinessBookingDetailScreen';
import { useBooking } from '@features/booking/hooks/useBookings';
import { BusinessBookingsHubScreen } from '@features/business/screens/BusinessBookingsHubScreen';
import {
  BusinessPosOrdersViewScreen,
  presentPosSaleRow,
} from '@features/business/screens/BusinessPosOrdersViewScreen';
import {
  usePosSales,
  useRegisterStatus,
  usePeripherals,
  usePosSettings,
  useUpdatePosSettings,
} from '@features/business/hooks/usePos';
import { startOfTodayIso } from '@features/business/utils/posMappers';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import {
  BusinessMessagesHomeScreen,
  toBusinessMessageThreadView,
} from '@features/business/screens/BusinessMessagesHomeScreen';
import {
  BusinessConversationScreen,
  toBusinessConversationMessage,
} from '@features/business/screens/BusinessConversationScreen';
import { BusinessHubCentralManagementScreen } from '@features/business/screens/BusinessHubCentralManagementScreen';
import { BusinessMoreHubScreen } from '@features/business/screens/BusinessMoreHubScreen';
import { BusinessManagementHubScreen } from '@features/business/screens/BusinessManagementHubScreen';
import { BusinessProfilePreviewScreen } from '@features/business/screens/BusinessProfilePreviewScreen';
import { AddProductPricingVariantsScreen } from '@features/business/screens/AddProductPricingVariantsScreen';
import { AddProductBranchAvailabilityScreen } from '@features/business/screens/AddProductBranchAvailabilityScreen';
import { ReviewProductSummaryScreen } from '@features/business/screens/ReviewProductSummaryScreen';
import { CentralDealsManagementScreen } from '@features/business/screens/CentralDealsManagementScreen';
import { DealDetailsPerformanceScreen } from '@features/business/screens/DealDetailsPerformanceScreen';
import {
  DealRedemptionLedgerScreen,
  type DealLedgerPeriod,
  type DealLedgerStatusFilter,
} from '@features/business/screens/DealRedemptionLedgerScreen';
import { CreateDealStep1DiscountStrategyScreen } from '@features/business/screens/CreateDealStep1DiscountStrategyScreen';
import { CreateDealStep2LimitsGiftingRulesScreen } from '@features/business/screens/CreateDealStep2LimitsGiftingRulesScreen';
import { CreateDealStep3ParticipatingBranchesScheduleScreen } from '@features/business/screens/CreateDealStep3ParticipatingBranchesScheduleScreen';
import { CreateDealStep4ReviewLaunchScreen } from '@features/business/screens/CreateDealStep4ReviewLaunchScreen';
import { CentralCatalogueScreen } from '@features/business/screens/CentralCatalogueScreen';
import { ServicesCategoriesManagementScreen } from '@features/business/screens/ServicesCategoriesManagementScreen';
import { AddProductBasicsMediaScreen } from '@features/business/screens/AddProductBasicsMediaScreen';
import {
  LocationsBranchesScreen,
  branchToLocationRow,
} from '@features/business/screens/LocationsBranchesScreen';
import { WuseBranchDetailsScreen } from '@features/business/screens/WuseBranchDetailsScreen';
import { LoyaltyProgrammeConfigurationScreen } from '@features/business/screens/LoyaltyProgrammeConfigurationScreen';
import { LoyaltyRewardsRulesScreen } from '@features/business/screens/LoyaltyRewardsRulesScreen';
import { StaffTeamAccessDirectoryScreen } from '@features/business/screens/StaffTeamAccessDirectoryScreen';
import { InviteStaffPermissionsScreen } from '@features/business/screens/InviteStaffPermissionsScreen';
import { BusinessReviewsReputationScreen } from '@features/business/screens/BusinessReviewsReputationScreen';
import { BusinessNotificationsCenterScreen } from '@features/business/screens/BusinessNotificationsCenterScreen';
import { BusinessSubscriptionBillingScreen } from '@features/business/screens/BusinessSubscriptionBillingScreen';
import { BusinessVerificationTrustScreen } from '@features/business/screens/BusinessVerificationTrustScreen';
import { BusinessSupportHelpScreen } from '@features/business/screens/BusinessSupportHelpScreen';
import { BusinessSettingsScreen } from '@features/business/screens/BusinessSettingsScreen';
import { SwitchToCustomerScreen } from '@features/business/screens/SwitchToCustomerScreen';
import {
  useBusinessDashboard,
  useMyBusiness,
  usePosDashboard,
  toStatNumber,
  useUnreadNotificationsCount as useBusinessUnreadCount,
} from '@features/business/hooks/useBusinessDashboardData';
import { useActiveBranch } from '@features/business/hooks/useActiveBranch';
import { branchPlanErrorMessage } from '@api/planErrors';
import {
  useBranchDetail,
  useCreateBranch,
  useUpdateBranch,
} from '@features/business/hooks/useBranchMutations';
import {
  useBusinessHubData,
  useLoyaltyBusinessStats,
} from '@features/business/hooks/useBusinessHubData';
import { ApiError } from '@api/ApiError';
import {
  useDiscoveryPresence,
  useUpdateDiscoverySetting,
} from '@features/business/hooks/useBusinessNetwork';
import { useUpdateBusinessProfile } from '@features/business/hooks/useUpdateBusinessProfile';
import { useBusinessImageUpload } from '@features/business/hooks/useBusinessImageUpload';
import { NewMessageCustomerSheet } from '@features/business/components/NewMessageCustomerSheet';
import {
  BusinessEditProfileScreen,
  type BusinessProfileFormValue,
} from '@features/business/screens/BusinessEditProfileScreen';
import { BusinessProfileScreen } from '@features/discover/screens/BusinessProfileScreen';
import type { MyBusiness } from '@api/businessDashboardApi';
import { toSettingsView } from '@features/business/utils/settingsMappers';
import { useOfflineQueueStore } from '@store/offlineQueueStore';
import { POS_SALE_QUEUE_KIND } from '@features/business/services/posOfflineSales';
import {
  useInviteStaff,
  useRemoveTeamMember,
  useResendTeamInvite,
  useTeamMembers,
} from '@features/business/hooks/useTeam';
import type { InviteStaffInput } from '@api/teamApi';
import {
  useBranchRewards,
  useBusinessPointLogs,
  useCreateReward,
  useDeleteReward,
  useLoyaltyRules,
  useUpdateLoyaltyRules,
  useUpdateReward,
} from '@features/business/hooks/useLoyalty';
import {
  useBusinessReviews,
  useBusinessReviewsSummary,
  useModerateBusinessReview,
  useReplyToBusinessReview,
} from '@features/business/hooks/useBusinessReviews';
import {
  useBusinessProductComments,
  useBusinessProductCommentsSummary,
  useRemoveProductComment,
  useReplyToProductComment,
} from '@features/business/hooks/useBusinessProductComments';
import type { ProductCommentReplyFilter } from '@api/productCommentsApi';
import type { BusinessReviewStatus } from '@api/dealsApi';
import {
  useAskSupportBot,
  useCreateSupportTicket,
  useReplySupportTicket,
  useSupportFaqs,
  useSupportTicket,
  useSupportTickets,
} from '@features/business/hooks/useSupport';
import {
  presentLoyaltyProgramme,
  presentRewards,
} from '@features/business/utils/loyaltyMappers';
import {
  presentBusinessReviews,
  presentProductComments,
  REVIEW_SOURCES,
  type ReviewSource,
  type ReviewFilterKey,
} from '@features/business/utils/reviewMappers';
import {
  presentSupportTickets,
  presentSupportTree,
  presentTicketThread,
} from '@features/business/utils/supportMappers';
import {
  inviteFormToInput,
  presentStaffDirectory,
  type InviteStaffForm,
  type StaffFilterKey,
} from '@features/business/utils/teamMappers';
import {
  useBusinessThreadMessages,
  useBusinessThreads,
  useMarkBusinessThreadRead,
  useSendBusinessReply,
  useStartBusinessThread,
} from '@features/business/hooks/useBusinessMessaging';
import { useBusinessMessagingRealtime } from '@features/business/hooks/useBusinessMessagingRealtime';
import {
  emitMessagingTyping,
  joinMessagingThread,
  leaveMessagingThread,
  setActiveMessagingThread,
} from '@api/messagingSocket';
import {
  presentOrder,
  presentOrderDetail,
  useBusinessOrderCounts,
  useBusinessOrderDetail,
  useBusinessOrders,
  useUpdateOrderStatus,
} from '@features/business/hooks/useBusinessOrders';
import {
  presentBooking,
  useBusinessBookings,
  useUpdateBookingStatus,
} from '@features/business/hooks/useBusinessBookings';
import { useAuthStore } from '@store/authStore';
import { ErrorState, LoadingState, showError, showSuccess } from '@components/shared';
import { BusinessScreenLayout } from '@features/business/components/BusinessPrimitives';
import { useCatalogueDraftStore } from '@store/catalogueDraftStore';
import {
  useCatalogueCategories,
  useDeleteCatalogueCategory,
  usePublishCatalogueItem,
  useReorderCatalogueCategories,
  useUpdateCatalogueCategory,
  useUpdateCatalogueItemDetails,
  useUpdateCatalogueItemStatus,
  useDeleteCatalogueItem,
} from '@features/business/hooks/useCatalogueMutations';
import {
  dealsManagementKeys,
  useDealGroups,
  useDealGroupStats,
  useDealLedger,
  useDealsSummary,
  useSetDealGroupStatus,
  useUpdateDealGroup,
} from '@features/business/hooks/useDealsManagement';
import {
  offerToCentralDealRow,
  toDealPerformanceView,
} from '@features/business/utils/dealPresentation';
import { offerRowToDealDraft } from '@features/business/utils/catalogueDraftMappers';
import { formatNaira } from '@features/business/data/businessSetupData';
import { usePullToRefresh } from '@hooks/usePullToRefresh';
import { useDealReviewLaunch } from '@features/business/hooks/useDealReviewLaunch';
import { useDealStep1 } from '@features/business/hooks/useDealStep1';
import { DealItemPickerSheet } from '@features/business/components/DealItemPickerSheet';
import { CategoryReorderSheet } from '@features/business/components/CategoryReorderSheet';
import { PromptDialog } from '@features/business/components/PromptDialog';
import { catalogueApi } from '@api/catalogueApi';
import {
  ALL_BRANCHES_SCOPE,
  useBusinessCatalogue,
} from '@features/business/hooks/useBusinessCatalogue';
import {
  catalogueCategoryToRow,
  catalogueItemToCentralRow,
  catalogueItemToServiceRow,
} from '@features/business/utils/catalogueHubRowMappers';
import { endSession } from '@features/auth/endSession';
import { navigationRef } from '@navigation/navigationRef';
import { BusinessMoreHubOperationsScreen } from '@features/business/screens/BusinessMoreHubOperationsScreen';
import { TypeDensityProvider } from '@theme/TypeDensityProvider';
import { useSwitchRole } from '@features/auth/hooks/useSwitchRole';
import {
  useBusinessNotifications,
  useMarkAllNotificationsRead,
} from '@features/accountHub/hooks/useNotifications';
import { resolveNotificationUrl } from '@navigation/notificationRoutes';
import {
  useOpenAddOns,
  useOpenPlanScreen,
  useOpenVerificationCenter,
} from '@features/business/hooks/useOpenPlanScreen';
import {
  useActiveSubscription,
  useBillingHistory,
  useCancelSubscription,
  useMyAddons,
  usePaymentMethod,
} from '@features/business/hooks/useSubscriptions';
import type { ActiveSubscription, BillingPeriod } from '@api/subscriptionsApi';
import type { BillingPlanSummary } from '@features/business/screens/BusinessSubscriptionBillingScreen';
import { formatDay } from '@features/business/verificationDisplay';
import { formatCurrency } from '@utils/formatters';
import { appVersion } from '@utils/appVersion';
import { useSwitchPreview } from '@features/accountHub/hooks/useActivity';
import { claimPassParams } from '@navigation/claimPassLink';
import type { MoreRowStatus } from '@features/business/screens/BusinessMoreHubScreen';
import { useVerificationStatus } from '@features/business/hooks/useVerification';
import {
  BoostBudgetScheduleRoute,
  BoostEngineRoute,
  BoostGoalAudienceRoute,
  BoostPerformanceRoute,
  BoostPreviewPaymentRoute,
  BoostWalletRoute,
  CampaignCreateAudienceRoute,
  CampaignCreateBudgetRoute,
  CampaignCreateContentRoute,
  CampaignCreateObjectiveRoute,
  CampaignCreateScheduleRoute,
  CampaignReviewLaunchRoute,
  CampaignsHubRoute,
  CreateCustomSegmentRoute,
  CustomerSegmentsRoute,
  SegmentActionsRoute,
  SegmentAudienceDetailsRoute,
} from './growthRoutes';
import {
  CustomerDisplayOrderRoute,
  CustomerDisplayPaymentRoute,
  CustomerDisplayRatingRoute,
  DigitalEReceiptRoute,
  MerchantPosKitchenStreamRoute,
  PaymentHardwareSetupRoute,
  PosBranchTillSwitcherRoute,
  PosCurrentSaleCartRoute,
  PosCustomerDossierRoute,
  PosCustomerLookupActiveRoute,
  PosCustomerLookupListRoute,
  PosCustomerLookupLoyaltyRoute,
  PosGeneralSettingsRoute,
  PosHomeOfflineModeRoute,
  PosHomeSalesOperationsRoute,
  PosNewSaleCatalogRoute,
  PosOfflineBufferQueueRoute,
  PosOfflineCheckoutTerminalRoute,
  PosProductShiftStockStatusRoute,
  PosProductsInventoryRoute,
  PosReceiptCustomizationRoute,
  PosSaleCompletedRoute,
  PosSyncReconciliationRoute,
  PosTenderCheckoutRoute,
  PosTransactionDetailsRoute,
  PosTransactionsLedgerReceiptsRoute,
  PosTransactionsLedgerShiftRoute,
  PublicPosCartReviewRoute,
  PublicPosOrderMenuRoute,
  PublicPosOrderTrackingRoute,
  SplitTheBillRoute,
  StaffPermissionsPasscodesRoute,
  TaxesSurchargesRoute,
} from './posRoutes';
import {
  AnalyticsExportReportRoute,
  BranchComparisonRoute,
  BusinessAnalyticsRoute,
  BusinessCustomerIntelligenceRoute,
  BusinessPerformanceAnalyticsRoute,
  CustomersAnalyticsRoute,
  DealsAnalyticsRoute,
  LocationsAnalyticsRoute,
  PosAnalyticsRoute,
} from './analyticsRoutes';
import { BusinessQrRoute, LocationQrRoute } from './qrRoutes';
import { CustomerCrmDirectoryRoute, CustomerProfileDossierRoute } from './crmRoutes';
import {
  BusinessDiscoveryFeedRoute,
  BusinessNetworkDashboardRoute,
  BusinessNetworkInfoRoute,
  BusinessNetworkIntroHubRoute,
  MyBusinessNetworkRoute,
  MyReferralsRoute,
  NetworkMilestonesRoute,
  ReferralDetailRoute,
} from './networkRoutes';
import {
  ServiceAvailabilityStep,
  ServiceBasicsStep,
  ServiceBookingRulesFlow,
  ServicePricingStep,
  ServiceReviewStep,
  type ServiceBookingRulesFlowProps,
  type ServiceFlowNavigation,
} from './serviceFlowRoutes';
import { useBusinessNavigation } from './useBusinessNavigation';
import type { BusinessTabParamList } from './types';

/**
 * The business app lives inside AppStack, so tab routes need the AppStack prop and
 * root-level routes (the business onboarding flow) need the Root prop.
 */

/** More-hub rows: direct More-stack pushes, or a hop to a sibling tab stack. */

const Tab = createBottomTabNavigator<BusinessTabParamList>();
const OverviewStack = createNativeStackNavigator<BusinessTabParamList>();
const OrdersStack = createNativeStackNavigator<BusinessTabParamList>();
const MessagesStack = createNativeStackNavigator<BusinessTabParamList>();
const HubStack = createNativeStackNavigator<BusinessTabParamList>();
const MoreStack = createNativeStackNavigator<BusinessTabParamList>();

const stackOptions = { headerShown: false } as const;

function BusinessOverviewRoute() {
  const startNewDeal = useStartNewDeal();
  const navigation = useBusinessNavigation();
  const openPlanScreen = useOpenPlanScreen();
  return (
    <BusinessDashboardOverviewScreen
      onOpenAnalytics={() => navigation.navigate('BusinessAnalytics')}
      onOpenOrders={() => navigation.navigate('BusinessOrders')}
      onOpenMessages={() => navigation.navigate('BusinessMessages')}
      onOpenNotifications={() => navigation.navigate('BusinessNotifications')}
      // Quick shortcuts + the rows/cards that share their handlers.
      onOpenScanner={() => navigation.navigate('PosCustomerLookupActive')}
      onOpenPos={() => navigation.navigate('PosHomeSalesOperations')}
      onCreateDeal={startNewDeal}
      onAddProduct={() => navigation.navigate('AddProductBasicsMedia')}
      onOpenClaims={() => navigation.navigate('CentralDealsManagement')}
      onBoostDeal={() => navigation.navigate('BoostEngine')}
      onOpenPosSync={() => navigation.navigate('PosSyncReconciliation')}
      onAddBranch={() => navigation.navigate('LocationsBranches')}
      onManageLocations={() => navigation.navigate('LocationsBranches')}
      onOpenReport={() => navigation.navigate('AnalyticsExportReport')}
      onOpenPlan={openPlanScreen}
    />
  );
}

/**
 * Orders <-> Bookings switcher. Both surfaces live in this screen: the
 * Bookings tab renders the shared booking feed inline instead of pushing the
 * standalone bookings screen.
 */
function BusinessOrdersSurfaceRoute() {
  const navigation = useBusinessNavigation();
  const { branches, activeBranchId, setActiveBranch } = useActiveBranch();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [bookingDay, setBookingDay] = useState<string | undefined>(undefined);
  const [bookingFilter, setBookingFilter] = useState<{
    status?: string;
    date?: string;
  }>({});
  const ordersQuery = useBusinessOrders({
    type: 'order',
    status,
    branchId: activeBranchId ?? undefined,
  });
  const bookingsQuery = useBusinessBookings({
    branchId: activeBranchId ?? undefined,
    date: bookingDay,
    status: bookingFilter.status,
  });
  const counts = useBusinessOrderCounts(activeBranchId);
  const updateStatus = useUpdateOrderStatus();
  const updateBookingStatus = useUpdateBookingStatus();

  return (
    <BusinessOrdersHubScreen
      branches={branches}
      activeBranchId={activeBranchId ?? undefined}
      onChangeBranch={setActiveBranch}
      onAddBranch={() => navigation.navigate('LocationsBranches')}
      onOpenPosOrders={() => navigation.navigate('BusinessPosOrders')}
      onOpenOrder={orderId => navigation.navigate('BusinessOrderDetail', { orderId })}
      onSelectStatus={setStatus}
      onUpdateOrderStatus={(id, nextStatus) =>
        updateStatus.mutate({ id, status: nextStatus })
      }
      orders={ordersQuery.isSuccess ? ordersQuery.data.data.map(presentOrder) : undefined}
      orderCounts={counts.counts}
      orderTotal={counts.orderTotal}
      bookingTotal={counts.bookingTotal}
      bookings={
        bookingsQuery.isSuccess ? bookingsQuery.data.data.map(presentBooking) : undefined
      }
      onSelectDay={setBookingDay}
      onSelectFilter={setBookingFilter}
      onOpenBooking={bookingId =>
        navigation.navigate('BusinessBookingDetail', { bookingId })
      }
      onCheckIn={bookingId =>
        updateBookingStatus.mutate({ id: bookingId, status: 'completed' })
      }
    />
  );
}

function BusinessOrderDetailRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessTabParamList, 'BusinessOrderDetail'>>();
  const orderId = route.params?.orderId;
  const orderQuery = useBusinessOrderDetail(orderId);
  const updateStatus = useUpdateOrderStatus();

  const setStatus = (status: string) => {
    if (orderId) updateStatus.mutate({ id: orderId, status });
  };

  return (
    <OrderDetailScreen
      onBack={navigation.goBack}
      detail={orderQuery.isSuccess ? presentOrderDetail(orderQuery.data) : undefined}
      isError={orderQuery.isError}
      onRetry={() => orderQuery.refetch()}
      onAcceptOrder={() => setStatus('processing')}
      onDeclineOrder={() => setStatus('rejected')}
      onMarkProcessing={() => setStatus('processing')}
      onMarkReady={() => setStatus('ready')}
      onConfirmPayment={() => setStatus('completed')}
      onAdjustRefund={() => setStatus('refunded')}
      onCallCustomer={() => {
        const phone = orderQuery.data?.customer?.phone;
        if (phone) {
          Linking.openURL(`tel:${phone}`).catch(() => undefined);
        }
      }}
      onOpenChat={() => navigation.navigate('BusinessMessages')}
      onOpenBranchSwitcher={() => navigation.navigate('LocationsBranches')}
    />
  );
}

function BusinessBookingDetailRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessTabParamList, 'BusinessBookingDetail'>>();
  const bookingId = route.params?.bookingId;
  const bookingQuery = useBooking(bookingId);
  const updateStatus = useUpdateBookingStatus();
  const startThread = useStartBusinessThread();
  const booking = bookingQuery.data;

  return (
    <BusinessBookingDetailScreen
      onBack={navigation.goBack}
      booking={booking}
      isError={bookingQuery.isError}
      onRetry={() => bookingQuery.refetch()}
      updating={updateStatus.isPending}
      onChangeStatus={status => {
        if (!bookingId) return;
        updateStatus.mutate(
          { id: bookingId, status },
          {
            onSuccess: () => showSuccess(strings.businessBookingDetail.updated),
            onError: () => showError(strings.businessBookingDetail.updateFailed),
          },
        );
      }}
      onCallCustomer={() => {
        const phone = booking?.customer?.phone;
        if (!phone) {
          showError(strings.businessBookingDetail.noPhone);
          return;
        }
        Linking.openURL(`tel:${phone}`).catch(() => undefined);
      }}
      onChatCustomer={() => {
        const customerId = booking?.customer?.id;
        if (!customerId || !booking?.branchId || startThread.isPending) return;
        startThread.mutate(
          { customerId, branchId: booking.branchId },
          {
            onSuccess: thread =>
              navigation.navigate('BusinessConversation', { threadId: thread.id }),
            onError: () =>
              showError(strings.businessMessages.newMessageSheet.startFailed),
          },
        );
      }}
    />
  );
}

function BusinessBookingsRoute() {
  const navigation = useBusinessNavigation();
  const { branches, activeBranchId, setActiveBranch } = useActiveBranch();
  const [day, setDay] = useState<string | undefined>(undefined);
  const [filter, setFilter] = useState<{ status?: string; date?: string }>({});
  const bookingsQuery = useBusinessBookings({
    branchId: activeBranchId ?? undefined,
    date: day,
    status: filter.status,
  });
  const counts = useBusinessOrderCounts(activeBranchId);
  const updateStatus = useUpdateBookingStatus();

  const activeBranchName = branches.find(branch => branch.id === activeBranchId)?.name;

  return (
    <BusinessBookingsHubScreen
      branchName={activeBranchName}
      bookings={
        bookingsQuery.isSuccess ? bookingsQuery.data.data.map(presentBooking) : undefined
      }
      orderTotal={counts.orderTotal}
      bookingTotal={counts.bookingTotal}
      onOpenBranchSwitcher={() => setActiveBranch(activeBranchId ?? '')}
      onOpenOrders={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('BusinessOrdersHome');
        }
      }}
      onSelectDay={setDay}
      onSelectFilter={setFilter}
      onCheckIn={id => updateStatus.mutate({ id, status: 'completed' })}
      onOpenBooking={bookingId =>
        navigation.navigate('BusinessBookingDetail', { bookingId })
      }
    />
  );
}

function BusinessPosOrdersRoute() {
  const navigation = useBusinessNavigation();
  const { activeBranchId, branches } = useActiveBranch();
  const posQuery = usePosDashboard(activeBranchId);
  const sales = usePosSales(
    { branchId: activeBranchId ?? undefined, dateFrom: startOfTodayIso(), limit: 50 },
    Boolean(activeBranchId),
  );
  const register = useRegisterStatus();
  const network = useNetworkStatus();
  return (
    <BusinessPosOrdersViewScreen
      pos={posQuery.data}
      orders={sales.data ? sales.data.data.map(presentPosSaleRow) : undefined}
      branchName={branches.find(branch => branch.id === activeBranchId)?.name}
      tillName={register.data?.session?.till?.name ?? undefined}
      online={network.isConnected}
      onBack={navigation.goBack}
      // Opening a transaction hands the terminal over to the customer-facing
      // table display, which continues through payment, rating and receipt.
      onOpenOrder={() => navigation.navigate('CustomerDisplayOrder')}
      onPrintReceipt={() => navigation.navigate('DigitalEReceipt')}
    />
  );
}

function BusinessMessagesRoute() {
  const navigation = useBusinessNavigation();
  const { activeBranchId, branches } = useActiveBranch();
  const threadsQuery = useBusinessThreads(activeBranchId);

  const threads = threadsQuery.isSuccess
    ? threadsQuery.data.map(toBusinessMessageThreadView)
    : undefined;
  const activeBranchName = branches.find(branch => branch.id === activeBranchId)?.name;
  const [composing, setComposing] = useState(false);
  const startThread = useStartBusinessThread();

  return (
    <>
      <BusinessMessagesHomeScreen
        threads={threads}
        isLoading={threadsQuery.isLoading}
        isError={threadsQuery.isError}
        onRetry={() => {
          threadsQuery.refetch();
        }}
        branchName={activeBranchName}
        onOpenBranchSwitcher={() => navigation.navigate('LocationsBranches')}
        onOpenThread={threadId =>
          navigation.navigate('BusinessConversation', { threadId })
        }
        onNewMessage={() => setComposing(true)}
      />
      <NewMessageCustomerSheet
        visible={composing}
        onClose={() => setComposing(false)}
        branchId={activeBranchId ?? undefined}
        startingUserId={
          startThread.isPending ? (startThread.variables?.customerId ?? null) : null
        }
        onPick={customer => {
          if (!activeBranchId) return;
          startThread.mutate(
            { customerId: customer.userId, branchId: activeBranchId },
            {
              onSuccess: thread => {
                setComposing(false);
                navigation.navigate('BusinessConversation', { threadId: thread.id });
              },
              onError: () =>
                showError(strings.businessMessages.newMessageSheet.startFailed),
            },
          );
        }}
      />
    </>
  );
}

function BusinessConversationRoute() {
  // The chat is a full-height canvas: the footer would otherwise sit between the
  // composer and the keyboard once the window shrinks on Android.
  useHideTabBarOnFocus();

  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessTabParamList, 'BusinessConversation'>>();
  const threadId = route.params?.threadId;
  const { activeBranchId } = useActiveBranch();
  const threadsQuery = useBusinessThreads(activeBranchId);
  const messagesQuery = useBusinessThreadMessages(threadId, activeBranchId);
  const sendReply = useSendBusinessReply();
  const { mutate: markThreadRead } = useMarkBusinessThreadRead();

  const thread = threadsQuery.data?.find(item => item.id === threadId);
  const headerThread = thread ? toBusinessMessageThreadView(thread) : undefined;

  useEffect(() => {
    if (!threadId) return;
    setActiveMessagingThread(threadId);
    joinMessagingThread(threadId);
    return () => {
      setActiveMessagingThread(null);
      leaveMessagingThread(threadId);
    };
  }, [threadId]);

  useEffect(() => {
    if (!threadId || !activeBranchId) return;
    markThreadRead({ threadId, branchId: activeBranchId });
  }, [activeBranchId, markThreadRead, threadId]);

  if (!threadId) return null;

  const messages = messagesQuery.isSuccess
    ? messagesQuery.data.map(toBusinessConversationMessage)
    : undefined;

  return (
    <BusinessConversationScreen
      onBack={navigation.goBack}
      customerId={headerThread?.customerId}
      thread={
        headerThread
          ? {
              name: headerThread.name,
              time: headerThread.time,
              context: headerThread.context,
              contextIcon: headerThread.contextIcon,
            }
          : undefined
      }
      messages={messages}
      isLoading={messagesQuery.isLoading}
      isSending={sendReply.isPending}
      onTyping={isTyping => emitMessagingTyping(threadId, isTyping)}
      onSend={content => {
        if (!activeBranchId) return;
        sendReply.mutate({
          threadId,
          branchId: activeBranchId,
          payload: { content },
        });
      }}
      onSendMedia={(content, mediaUrl) => {
        if (!activeBranchId) return;
        sendReply.mutate({
          threadId,
          branchId: activeBranchId,
          payload: { content, mediaUrl },
        });
      }}
    />
  );
}

/** Every Business-tab module id resolves to exactly one destination. */
function BusinessHubRoute() {
  const navigation = useBusinessNavigation();
  const { branches, activeBranchId, setActiveBranch } = useActiveBranch();
  const { view } = useBusinessHubData(activeBranchId);

  const openExternal = (url: string) => {
    if (url) Linking.openURL(url).catch(() => undefined);
  };

  return (
    <BusinessHubCentralManagementScreen
      hub={view}
      branches={branches}
      activeBranchId={activeBranchId ?? undefined}
      onChangeBranch={setActiveBranch}
      onOpenDeals={() =>
        navigation.navigate('CentralDealsManagement', { layout: 'hero' })
      }
      onOpenCatalogue={() =>
        navigation.navigate('CentralCatalogue', { layout: 'directory' })
      }
      onOpenCrm={() => navigation.navigate('CustomerCrmDirectory')}
      onOpenLoyalty={() => navigation.navigate('LoyaltyProgramme')}
      onOpenLocations={() => navigation.navigate('LocationsBranches')}
      onOpenStaff={() => navigation.navigate('StaffDirectory')}
      onEditProfile={() => navigation.navigate('BusinessEditProfile')}
      onOpenLocationSwitcher={() => navigation.navigate('BusinessManagementHub')}
      onPreviewStorefront={() => navigation.navigate('BusinessStorefrontPreview')}
      onCall={() => openExternal(view.phone ? `tel:${view.phone}` : '')}
      onOpenWebsite={() =>
        openExternal(
          view.website
            ? /^https?:\/\//i.test(view.website)
              ? view.website
              : `https://${view.website}`
            : '',
        )
      }
      onOpenReader={() => navigation.navigate('PaymentHardwareSetup')}
    />
  );
}

function BusinessManagementHubRoute() {
  const navigation = useBusinessNavigation();
  const { branches, activeBranchId, setActiveBranch } = useActiveBranch();
  const { view } = useBusinessHubData(activeBranchId);
  return (
    <BusinessManagementHubScreen
      branches={branches}
      activeBranchId={activeBranchId}
      hub={view}
      onNotifications={() => navigation.navigate('BusinessNotifications')}
      onChangeBranch={setActiveBranch}
      onOpenModule={id => {
        const moduleRoutes: Record<
          string,
          | 'CentralDealsManagement'
          | 'CentralCatalogue'
          | 'CustomerCrmDirectory'
          | 'LoyaltyProgramme'
          | 'LocationsBranches'
          | 'StaffDirectory'
          | 'BusinessProfilePreview'
          | 'DealsFlashRadar'
          | 'CampaignsDealsManagement'
          | 'BusinessHubCatalogue'
        > = {
          deals: 'CentralDealsManagement',
          'deals-flash': 'DealsFlashRadar',
          'deals-campaigns': 'CampaignsDealsManagement',
          catalogue: 'CentralCatalogue',
          'catalogue-hub': 'BusinessHubCatalogue',
          crm: 'CustomerCrmDirectory',
          loyalty: 'LoyaltyProgramme',
          locations: 'LocationsBranches',
          staff: 'StaffDirectory',
          profile: 'BusinessProfilePreview',
        };
        const route = moduleRoutes[id];
        if (route) navigation.navigate(route);
      }}
    />
  );
}

function BusinessProfilePreviewRoute() {
  const navigation = useBusinessNavigation();
  // Read live so the amenity toggles reflect what is actually saved; a save
  // built from the design defaults would overwrite them.
  const myBusiness = useMyBusiness();
  const images = useBusinessImageUpload();
  const openEdit = () => navigation.navigate('BusinessEditProfile');
  const openStorefront = () => navigation.navigate('BusinessStorefrontPreview');
  return (
    <BusinessProfilePreviewScreen
      // Keyed on the saved list so the toggles reset to it once it loads.
      key={(myBusiness.data?.amenities ?? []).join('|') || 'none'}
      initialAmenities={myBusiness.data?.amenities ?? undefined}
      onBack={navigation.goBack}
      onChangeCover={() => images.change('cover')}
      onEditAvatar={() => images.change('logo')}
      uploading={images.busy}
      onPublicPreview={openStorefront}
      onPublicStorefront={openStorefront}
      onEditProfile={openEdit}
      onManageContacts={openEdit}
      onAddSocial={openEdit}
      onCopyValue={value => {
        Clipboard.setString(value);
        showSuccess(strings.businessProfilePreview.copied);
      }}
      onSaveChanges={navigation.goBack}
      onDiscardChanges={navigation.goBack}
    />
  );
}

/** The saved profile as the edit form's starting values. */
function profileFormValue(business?: MyBusiness): BusinessProfileFormValue {
  const socials = business?.socials ?? {};
  return {
    name: business?.name ?? '',
    about: business?.description ?? '',
    phone: business?.phone ?? '',
    whatsappNumber: business?.whatsappNumber ?? '',
    officialEmail: business?.officialEmail ?? '',
    website: business?.website ?? '',
    address: business?.address ?? '',
    instagram: socials.instagram ?? '',
    facebook: socials.facebook ?? '',
    tiktok: socials.tiktok ?? '',
    x: socials.x ?? '',
  };
}

function BusinessEditProfileRoute() {
  const navigation = useBusinessNavigation();
  const myBusiness = useMyBusiness();
  const update = useUpdateBusinessProfile();
  const images = useBusinessImageUpload();
  const copy = strings.businessEditProfile;

  if (!myBusiness.data) {
    return (
      <BusinessScreenLayout header={{ title: copy.title, onBack: navigation.goBack }}>
        {myBusiness.isError ? (
          <ErrorState
            description={copy.loadFailed}
            onRetry={() => myBusiness.refetch()}
          />
        ) : (
          <LoadingState />
        )}
      </BusinessScreenLayout>
    );
  }

  const business = myBusiness.data;
  return (
    <BusinessEditProfileScreen
      // Mounted once the profile has loaded, so the form starts from it.
      initialValue={profileFormValue(business)}
      logoUri={business.logoUrl || undefined}
      coverUri={business.coverImage || undefined}
      onBack={navigation.goBack}
      saving={update.isPending}
      onChangeImage={kind => images.change(kind)}
      uploading={images.busy}
      onPreviewStorefront={() => navigation.navigate('BusinessStorefrontPreview')}
      onSave={value => {
        const trim = (text: string) => text.trim();
        update.mutate(
          {
            name: trim(value.name),
            description: trim(value.about),
            phone: trim(value.phone),
            whatsappNumber: trim(value.whatsappNumber),
            officialEmail: trim(value.officialEmail),
            website: trim(value.website),
            address: trim(value.address),
            // All four links are sent, a cleared one as '', merged over any
            // other saved links (e.g. LinkedIn) so those are kept.
            socials: {
              ...(business.socials ?? {}),
              instagram: trim(value.instagram),
              facebook: trim(value.facebook),
              tiktok: trim(value.tiktok),
              x: trim(value.x),
            },
          },
          {
            onSuccess: () => {
              showSuccess(copy.saved);
              navigation.goBack();
            },
            onError: () => showError(copy.saveFailed),
          },
        );
      }}
    />
  );
}

function BusinessStorefrontPreviewRoute() {
  const navigation = useBusinessNavigation();
  const myBusiness = useMyBusiness();
  const code = myBusiness.data?.uniqueCode ?? undefined;
  if (!code) {
    return (
      <BusinessScreenLayout
        header={{
          title: strings.businessEditProfile.previewStorefront,
          onBack: navigation.goBack,
        }}
      >
        {myBusiness.isError ? (
          <ErrorState onRetry={() => myBusiness.refetch()} />
        ) : (
          <LoadingState />
        )}
      </BusinessScreenLayout>
    );
  }
  // The customer storefront itself, for the owner's own code.
  return <BusinessProfileScreen code={code} onBack={navigation.goBack} preview />;
}

const ALL_DEAL_SCOPE = 'all';
const DEALS_REFRESH_KEYS = [[...dealsManagementKeys.all]];

/**
 * An edit is abandoned when the owner backs out of the wizard to the deals
 * list or a deal's detail. Clear it there, so a later "create deal" from any
 * entry point never updates the old deal instead.
 */
function useDiscardUnsavedDealEdit() {
  const resetDeal = useCatalogueDraftStore(state => state.resetDeal);
  useFocusEffect(
    useCallback(() => {
      if (useCatalogueDraftStore.getState().deal.editingDealGroupId) resetDeal();
    }, [resetDeal]),
  );
}

/** Pause / resume a whole deal (every branch) with the shared toasts. */
function useDealStatusToggle() {
  const setStatus = useSetDealGroupStatus();
  const copy = strings.centralDeals;
  return (dealGroupId: string, status: 'active' | 'inactive') =>
    setStatus.mutate(
      { dealGroupId, status },
      {
        onSuccess: () =>
          showSuccess(status === 'active' ? copy.resumedToast : copy.pausedToast),
        onError: () => showError(copy.statusError),
      },
    );
}

function CentralDealsManagementRoute() {
  const route = useRoute<RouteProp<BusinessTabParamList, 'CentralDealsManagement'>>();
  return <LiveDealsList layout={route.params?.layout ?? 'hero'} />;
}

/** The owner's deals in any of the three list treatments. */
function LiveDealsList({ layout }: { layout: 'hero' | 'compact' | 'discovery' }) {
  const navigation = useBusinessNavigation();
  const { branches, isLive: hasLiveBranches } = useActiveBranch();
  const [scope, setScope] = useState(ALL_DEAL_SCOPE);
  const branchId = scope === ALL_DEAL_SCOPE ? null : scope;
  const groups = useDealGroups(branchId);
  const summary = useDealsSummary(branchId);
  const toggleStatus = useDealStatusToggle();
  const refresh = usePullToRefresh(DEALS_REFRESH_KEYS);
  const loadDealForEdit = useCatalogueDraftStore(state => state.loadDealForEdit);
  const resetDeal = useCatalogueDraftStore(state => state.resetDeal);
  useDiscardUnsavedDealEdit();

  const rows = groups.data ?? [];
  const findRow = (dealGroupId: string) =>
    rows.find(row => (row.dealGroupId ?? row.id) === dealGroupId);
  const scopeOptions = hasLiveBranches
    ? [
        {
          label: strings.centralCatalogue.allLocationsCount(branches.length),
          value: ALL_DEAL_SCOPE,
        },
        ...branches.map(branch => ({
          label: branch.name,
          value: branch.id,
          meta: branch.address || undefined,
        })),
      ]
    : undefined;

  return (
    <CentralDealsManagementScreen
      layout={layout}
      scope={scope}
      scopeOptions={scopeOptions}
      onChangeScope={setScope}
      deals={rows.map(row => offerToCentralDealRow(row))}
      isLoading={groups.isLoading}
      isError={groups.isError}
      onRetry={() => groups.refetch()}
      refreshControl={refresh.refreshControl}
      netRevenue={summary.data ? formatNaira(summary.data.netRevenue30d ?? 0) : undefined}
      pulse={
        summary.data
          ? {
              activeDeals: String(summary.data.activeDeals ?? 0),
              claimsToday: String(summary.data.claimsToday ?? 0),
              redeemedToday: String(summary.data.redeemedToday ?? 0),
            }
          : undefined
      }
      onNotifications={() => navigation.navigate('BusinessNotifications')}
      onCreateDeal={() => {
        resetDeal();
        navigation.navigate('CreateDealStep1');
      }}
      onSearch={() => undefined}
      onFilter={() => undefined}
      // Same target the compact/discovery deals layouts use — the boost wizard has
      // no `dealId` param, so the campaign hub is the honest entry point.
      onBoostDeal={() => navigation.navigate('CampaignsHub')}
      onEditDeal={dealGroupId => {
        const row = findRow(dealGroupId);
        if (!row) return;
        loadDealForEdit(offerRowToDealDraft(row));
        navigation.navigate('CreateDealStep1');
      }}
      onPauseDeal={dealGroupId => toggleStatus(dealGroupId, 'inactive')}
      onResumeDeal={dealGroupId => toggleStatus(dealGroupId, 'active')}
      onDealActions={dealGroupId => toggleStatus(dealGroupId, 'inactive')}
      onViewLedger={() =>
        navigation.navigate('DealRedemptionLedger', branchId ? { branchId } : undefined)
      }
      onOpenDeal={dealGroupId =>
        navigation.navigate('DealDetailsPerformance', { dealGroupId })
      }
    />
  );
}

function DealDetailsPerformanceRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessTabParamList, 'DealDetailsPerformance'>>();
  const dealGroupId = route.params?.dealGroupId;
  // Same query (and cache) as the deals list's "all locations" scope.
  const groups = useDealGroups(null);
  const stats = useDealGroupStats(dealGroupId);
  const toggleStatus = useDealStatusToggle();
  const updateGroup = useUpdateDealGroup();
  const loadDealForEdit = useCatalogueDraftStore(state => state.loadDealForEdit);
  const refresh = usePullToRefresh(DEALS_REFRESH_KEYS);
  useDiscardUnsavedDealEdit();
  const copy = strings.dealPerformance;

  const row = dealGroupId
    ? (groups.data ?? []).find(
        candidate => (candidate.dealGroupId ?? candidate.id) === dealGroupId,
      )
    : undefined;

  // Every entry point passes a deal; without one there is nothing to show.
  if (!dealGroupId) {
    return (
      <DealDetailsPerformanceScreen
        onBack={navigation.goBack}
        isError
        onRetry={navigation.goBack}
      />
    );
  }

  const endDeal = () =>
    Alert.alert(copy.endConfirmTitle, copy.endConfirmBody, [
      { text: copy.cancel, style: 'cancel' },
      {
        text: copy.endConfirm,
        style: 'destructive',
        // Ending stops it at every branch and closes its window, so it files
        // under Expired; vouchers already claimed stay redeemable.
        onPress: () =>
          updateGroup.mutate(
            {
              dealGroupId,
              input: { status: 'inactive', endDate: new Date().toISOString() },
            },
            {
              onSuccess: () => showSuccess(copy.endedToast),
              onError: () => showError(strings.centralDeals.statusError),
            },
          ),
      },
    ]);

  return (
    <DealDetailsPerformanceScreen
      onBack={navigation.goBack}
      view={row ? toDealPerformanceView(row, stats.data) : undefined}
      isLoading={groups.isLoading}
      isError={groups.isError || (!groups.isLoading && !row)}
      onRetry={() => groups.refetch()}
      refreshControl={refresh.refreshControl}
      onBoostDeal={() => navigation.navigate('CampaignsHub')}
      onPause={() => toggleStatus(dealGroupId, 'inactive')}
      onResume={() => toggleStatus(dealGroupId, 'active')}
      onEdit={() => {
        if (!row) return;
        loadDealForEdit(offerRowToDealDraft(row));
        navigation.navigate('CreateDealStep1');
      }}
      onEnd={endDeal}
      onViewLedger={() =>
        navigation.navigate('DealRedemptionLedger', {
          dealGroupId,
          dealName: row?.name ?? undefined,
        })
      }
    />
  );
}

const LEDGER_DEFAULT_PERIOD: DealLedgerPeriod = '30';

function DealRedemptionLedgerRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessTabParamList, 'DealRedemptionLedger'>>();
  const { branches, isLive: hasLiveBranches } = useActiveBranch();
  const [status, setStatus] = useState<DealLedgerStatusFilter>('all');
  const [period, setPeriod] = useState<DealLedgerPeriod>(LEDGER_DEFAULT_PERIOD);
  const [branch, setBranch] = useState(route.params?.branchId ?? ALL_DEAL_SCOPE);
  const [dealGroupId, setDealGroupId] = useState(route.params?.dealGroupId);
  const refresh = usePullToRefresh(DEALS_REFRESH_KEYS);

  // Days → a stable start-of-day `from`, so the query key does not change
  // every render.
  const from =
    period === 'all'
      ? undefined
      : (() => {
          const start = new Date();
          start.setHours(0, 0, 0, 0);
          start.setDate(start.getDate() - (Number(period) - 1));
          return start.toISOString();
        })();
  const ledger = useDealLedger({
    status: status === 'all' ? undefined : status,
    branchId: branch === ALL_DEAL_SCOPE ? undefined : branch,
    dealGroupId,
    from,
  });
  const pages = ledger.data?.pages ?? [];
  const ledgerCopy = strings.dealLedger;

  return (
    <DealRedemptionLedgerScreen
      onBack={navigation.goBack}
      rows={pages.flatMap(page => page.data)}
      totals={pages[0]?.totals}
      status={status}
      onChangeStatus={setStatus}
      period={period}
      onChangePeriod={setPeriod}
      branch={branch}
      branchOptions={
        hasLiveBranches
          ? [
              { label: ledgerCopy.allBranches, value: ALL_DEAL_SCOPE },
              ...branches.map(option => ({ label: option.name, value: option.id })),
            ]
          : []
      }
      onChangeBranch={setBranch}
      dealName={dealGroupId ? route.params?.dealName : undefined}
      onClearDeal={() => setDealGroupId(undefined)}
      isLoading={ledger.isLoading}
      isError={ledger.isError}
      onRetry={() => ledger.refetch()}
      hasMore={Boolean(ledger.hasNextPage)}
      isLoadingMore={ledger.isFetchingNextPage}
      onLoadMore={() => ledger.fetchNextPage()}
      isFiltered={
        status !== 'all' ||
        period !== LEDGER_DEFAULT_PERIOD ||
        branch !== ALL_DEAL_SCOPE ||
        Boolean(dealGroupId)
      }
      onResetFilters={() => {
        setStatus('all');
        setPeriod(LEDGER_DEFAULT_PERIOD);
        setBranch(ALL_DEAL_SCOPE);
        setDealGroupId(undefined);
      }}
      refreshControl={refresh.refreshControl}
    />
  );
}

/**
 * The four-step create-deal wizard in the hub stack. Mirrors the
 * `BusinessSetup` deal routes: each step merges its slice into the shared
 * deal draft store, and step 4 publishes through
 * `usePublishCatalogueOffer` (falling back to every live branch when the
 * draft carries none). Publishing exits back to the hub home.
 */
function CreateDealStep1Route() {
  const navigation = useBusinessNavigation();
  const step1 = useDealStep1(() => navigation.navigate('CreateDealStep2'));
  return (
    <>
      <CreateDealStep1DiscountStrategyScreen
        onBack={navigation.goBack}
        {...step1.screenProps}
      />
      <DealItemPickerSheet {...step1.pickerProps} />
    </>
  );
}

function CreateDealStep2Route() {
  const navigation = useBusinessNavigation();
  const setDeal = useCatalogueDraftStore(state => state.setDeal);
  const deal = useCatalogueDraftStore(state => state.deal);
  const initial = deal.editingDealGroupId
    ? {
        totalVouchers: Number(deal.totalVouchers) || 50,
        claimFrequency: deal.claimFrequency,
        maxClaimsPerMonth: deal.maxClaimsPerMonth,
        acceptGifting: deal.acceptGifting,
      }
    : undefined;
  const commit = (value: {
    totalVouchers: number;
    claimFrequency: 'once' | 'multiple';
    maxClaimsPerMonth: number;
    acceptGifting: boolean;
  }) => {
    // Editing writes back only what changed: an uncapped deal must not pick up
    // the slider's default voucher count just by passing through this step.
    setDeal({
      ...(!initial || value.totalVouchers !== initial.totalVouchers
        ? { totalVouchers: String(value.totalVouchers) }
        : {}),
      claimFrequency: value.claimFrequency,
      maxClaimsPerMonth: value.maxClaimsPerMonth,
      acceptGifting: value.acceptGifting,
    });
    navigation.navigate('CreateDealStep3');
  };
  return (
    <CreateDealStep2LimitsGiftingRulesScreen
      onBack={navigation.goBack}
      initialValue={initial}
      onContinue={commit}
      onSave={commit}
    />
  );
}

function CreateDealStep3Route() {
  const navigation = useBusinessNavigation();
  const setDeal = useCatalogueDraftStore(state => state.setDeal);
  const deal = useCatalogueDraftStore(state => state.deal);
  return (
    <CreateDealStep3ParticipatingBranchesScheduleScreen
      onBack={navigation.goBack}
      initialValue={
        deal.editingDealGroupId
          ? { claimSteps: deal.claimSteps, terms: deal.terms }
          : undefined
      }
      onSave={value => {
        setDeal(value);
        navigation.navigate('CreateDealStep4');
      }}
    />
  );
}

function CreateDealStep4Route() {
  const navigation = useBusinessNavigation();
  const launch = useDealReviewLaunch({
    onLaunched: () => navigation.navigate('BusinessHubHome'),
    onDrafted: () => navigation.navigate('BusinessHubHome'),
    onEdited: () => navigation.navigate('CentralDealsManagement', { layout: 'hero' }),
  });

  return (
    <CreateDealStep4ReviewLaunchScreen
      mode={launch.isEditing ? 'edit' : 'create'}
      review={launch.review}
      phase={launch.phase}
      isBusy={launch.isBusy}
      onBack={navigation.goBack}
      onEditOffer={() => navigation.navigate('CreateDealStep1')}
      onEditRules={() => navigation.navigate('CreateDealStep2')}
      onEditBranches={() => navigation.navigate('CreateDealStep3')}
      onLaunch={launch.launch}
      onSaveDraft={launch.saveDraft}
      onSave={() => navigation.navigate('BusinessHubHome')}
    />
  );
}

function ProductPricingRoute() {
  const navigation = useBusinessNavigation();
  const setProduct = useCatalogueDraftStore(state => state.setProduct);
  const draft = useCatalogueDraftStore(state => state.product);
  return (
    <AddProductPricingVariantsScreen
      initialValue={{
        regularPrice: draft.regularPrice,
        compareAtPrice: draft.compareAtPrice,
        costPerItem: draft.costPrice,
        variants: draft.variants,
        sku: draft.sku,
        lowStockThreshold: draft.lowStockThreshold,
        continueWhenOutOfStock: draft.backorder,
      }}
      onBack={navigation.goBack}
      onContinue={value => {
        setProduct({
          regularPrice: value.regularPrice,
          compareAtPrice: value.compareAtPrice,
          costPrice: value.costPerItem,
          variants: value.variants,
          sku: value.sku,
          lowStockThreshold: value.lowStockThreshold,
          backorder: value.continueWhenOutOfStock,
        });
        navigation.navigate('ProductAvailability');
      }}
    />
  );
}

function ProductAvailabilityRoute() {
  const navigation = useBusinessNavigation();
  const setProduct = useCatalogueDraftStore(state => state.setProduct);
  const draft = useCatalogueDraftStore(state => state.product);
  return (
    <AddProductBranchAvailabilityScreen
      initialValue={{
        selectedBranchIds: draft.branchIds,
        ...(draft.pricingMode === 'unified' || draft.pricingMode === 'custom'
          ? { pricingMode: draft.pricingMode }
          : {}),
        fulfillment: draft.fulfillmentModes,
      }}
      onBack={navigation.goBack}
      onContinue={value => {
        setProduct({
          branchIds: value.selectedBranchIds,
          pricingMode: value.pricingMode,
          fulfillmentModes: value.fulfillment,
        });
        navigation.navigate('ProductReview');
      }}
    />
  );
}

function ProductReviewRoute() {
  const navigation = useBusinessNavigation();
  const draft = useCatalogueDraftStore(state => state.product);
  const resetProduct = useCatalogueDraftStore(state => state.resetProduct);
  const publish = usePublishCatalogueItem();
  const submit = (status: 'active' | 'inactive') => {
    if (!draft.branchIds.length) {
      showError('Pick at least one branch for this product.');
      return;
    }
    publish.mutate(
      { kind: 'product', status },
      {
        onSuccess: () => {
          showSuccess(
            status === 'active' ? 'Product published.' : 'Product saved as draft.',
          );
          resetProduct();
          navigation.navigate('CentralCatalogue');
        },
        onError: error =>
          showError(
            error instanceof Error ? error.message : 'Could not publish the product.',
          ),
      },
    );
  };
  return (
    <ReviewProductSummaryScreen
      draft={draft}
      publishing={publish.isPending}
      onBack={navigation.goBack}
      onPublish={() => submit('active')}
      onSaveDraft={() => submit('inactive')}
      onEditMedia={() => navigation.navigate('AddProductBasicsMedia')}
      onEditBasics={() => navigation.navigate('AddProductBasicsMedia')}
      onEditDescription={() => navigation.navigate('AddProductBasicsMedia')}
      onEditPricing={() => navigation.navigate('ProductPricing')}
      onEditBranches={() => navigation.navigate('ProductAvailability')}
      onEditFulfillment={() => navigation.navigate('ProductAvailability')}
    />
  );
}

function CentralCatalogueRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessTabParamList, 'CentralCatalogue'>>();
  const layout = route.params?.layout ?? 'directory';
  const updateItemStatus = useUpdateCatalogueItemStatus();
  const updateDetails = useUpdateCatalogueItemDetails();
  const deleteItem = useDeleteCatalogueItem();
  const { branches, isLive: hasLiveBranches } = useActiveBranch();
  // The catalogue is central: it opens on every location, like the design.
  const [scope, setScope] = useState(ALL_BRANCHES_SCOPE);
  const catalogue = useBusinessCatalogue({}, scope);
  const categories = useCatalogueCategories();
  const [editing, setEditing] = useState<{
    id: string;
    name: string;
    price: string;
  } | null>(null);
  // Shown inside the sheet rather than toasted — a Modal covers a toast.
  const [itemError, setItemError] = useState<string | null>(null);
  const items = catalogue.data?.data ?? [];
  const itemsPerCategory = new Map<string, number>();
  items.forEach(item => {
    const categoryId = item.categoryId ?? item.category?.id;
    if (categoryId) {
      itemsPerCategory.set(categoryId, (itemsPerCategory.get(categoryId) ?? 0) + 1);
    }
  });
  const scopeOptions = hasLiveBranches
    ? [
        {
          label: strings.centralCatalogue.allLocationsCount(branches.length),
          value: ALL_BRANCHES_SCOPE,
        },
        ...branches.map(branch => ({
          label: branch.name,
          value: branch.id,
          meta: branch.address || undefined,
        })),
      ]
    : undefined;
  return (
    <>
      <CentralCatalogueScreen
        layout={layout}
        scope={scope}
        scopeOptions={scopeOptions}
        onNotifications={() => navigation.navigate('BusinessNotifications')}
        onQuickSwitch={() => undefined}
        onSearch={() => undefined}
        onChangeScope={setScope}
        onAddProduct={() => navigation.navigate('AddProductBasicsMedia')}
        onAddService={() => navigation.navigate('ServicesCategories')}
        onEditItem={itemId => {
          const item = items.find(candidate => candidate.id === itemId);
          if (!item) return;
          setEditing({
            id: itemId,
            name: item.name,
            price: item.price != null ? String(item.price) : '',
          });
        }}
        onToggleStock={(itemId, value) =>
          // Returned so the screen can flip the switch back when the save fails.
          updateItemStatus
            .mutateAsync({ itemId, status: value ? 'active' : 'inactive' })
            .then(() => showSuccess(value ? 'Item is live.' : 'Item paused.'))
            .catch((error: unknown) => {
              showError('Could not update the item.');
              throw error;
            })
        }
        onSheetAction={(actionId, itemId) => {
          if (actionId === 'delete') {
            deleteItem.mutate(itemId, {
              onSuccess: () => showSuccess('Item deleted permanently.'),
              onError: () => showError('Could not delete the item.'),
            });
          } else if (actionId === 'archive' || actionId === 'pause') {
            updateItemStatus.mutate(
              { itemId, status: 'inactive' },
              {
                onSuccess: () => showSuccess('Item paused.'),
                onError: () => showError('Could not pause the item.'),
              },
            );
          } else {
            showError('This item action is not yet available.');
          }
        }}
        items={items
          .filter(item => item.itemType !== 'service')
          .map(catalogueItemToCentralRow)}
        services={items
          .filter(item => item.itemType === 'service')
          .map(catalogueItemToServiceRow)}
        categories={(categories.data ?? []).map(category =>
          catalogueCategoryToRow(category, itemsPerCategory.get(category.id) ?? 0),
        )}
      />
      <PromptDialog
        visible={Boolean(editing)}
        title="Edit item"
        fields={[
          { key: 'name', label: 'Name', value: editing?.name ?? '' },
          {
            key: 'price',
            label: 'Price (₦)',
            value: editing?.price ?? '',
            keyboardType: 'decimal-pad',
          },
        ]}
        confirmLabel="Save"
        error={itemError}
        onChangeField={() => setItemError(null)}
        onCancel={() => {
          setItemError(null);
          setEditing(null);
        }}
        onConfirm={values => {
          if (!editing) return;
          const parsedPrice = Number(values.price.replace(/[^\d.]/g, ''));
          updateDetails.mutate(
            {
              itemId: editing.id,
              name: values.name.trim() || undefined,
              price: Number.isFinite(parsedPrice) ? parsedPrice : undefined,
            },
            {
              onSuccess: () => {
                showSuccess('Item updated.');
                setItemError(null);
                setEditing(null);
              },
              onError: () => setItemError('Could not update the item.'),
            },
          );
        }}
      />
    </>
  );
}

function ServicesCategoriesRoute() {
  const navigation = useBusinessNavigation();
  const updateItemStatus = useUpdateCatalogueItemStatus();
  const updateDetails = useUpdateCatalogueItemDetails();
  const updateCategory = useUpdateCatalogueCategory();
  const deleteCategory = useDeleteCatalogueCategory();
  const reorderCategories = useReorderCatalogueCategories();
  const services = useBusinessCatalogue({ itemType: 'service' });
  const categories = useCatalogueCategories();
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  // Shown inside the sheet rather than toasted — a Modal covers a toast.
  const [renameError, setRenameError] = useState<string | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<{
    id: string;
    name: string;
    price: string;
  } | null>(null);
  const [reordering, setReordering] = useState(false);
  const [rulesFor, setRulesFor] = useState<ServiceBookingRulesFlowProps['service']>(null);
  const serviceItems = services.data?.data ?? [];
  const categoryItems = (categories.data ?? []).map(c => ({ id: c.id, name: c.name }));
  return (
    <>
      <ServicesCategoriesManagementScreen
        onNotifications={() => navigation.navigate('BusinessNotifications')}
        onAddService={() => {
          // A new service starts from an empty draft, not the last one.
          useCatalogueDraftStore.getState().resetService();
          navigation.navigate('AddServiceBasics');
        }}
        onAddCategory={async () => {
          try {
            await catalogueApi.createCatalogueCategory('New Category');
            showSuccess('Category created.');
          } catch {
            showError('Could not create the category.');
          }
        }}
        onEditService={serviceId => {
          const service = serviceItems.find(candidate => candidate.id === serviceId);
          if (!service) return;
          setEditingService({
            id: serviceId,
            name: service.name,
            price: service.price != null ? String(service.price) : '',
          });
        }}
        onServiceAction={(actionId, serviceId) => {
          if (actionId === 'delete') {
            updateItemStatus.mutate(
              { itemId: serviceId, status: 'archived' },
              {
                onSuccess: () => showSuccess('Service archived.'),
                onError: () => showError('Could not archive the service.'),
              },
            );
          } else if (actionId === 'archive' || actionId === 'pause') {
            updateItemStatus.mutate(
              { itemId: serviceId, status: 'inactive' },
              {
                onSuccess: () => showSuccess('Service paused.'),
                onError: () => showError('Could not pause the service.'),
              },
            );
          } else if (actionId === 'calendarEdit') {
            const service = serviceItems.find(candidate => candidate.id === serviceId);
            if (service) {
              setRulesFor({
                id: service.id,
                name: service.name,
                bookingRules: service.bookingRules,
              });
            }
          } else {
            showError('This service action is not yet available.');
          }
        }}
        onEditCategory={categoryId => {
          const category = (categories.data ?? []).find(
            candidate => candidate.id === categoryId,
          );
          if (!category) return;
          setRenaming({ id: categoryId, name: category.name });
        }}
        onArchiveCategory={categoryId => {
          deleteCategory.mutate(categoryId, {
            onSuccess: () => showSuccess('Category archived.'),
            onError: () => showError('Could not archive the category.'),
          });
        }}
        onReorderCategory={() => {
          setReordering(true);
        }}
        services={serviceItems.map(catalogueItemToServiceRow)}
        categories={(categories.data ?? []).map(catalogueCategoryToRow)}
      />
      <CategoryReorderSheet
        visible={reordering}
        categories={categoryItems}
        onClose={() => setReordering(false)}
        onSubmit={orderedIds =>
          reorderCategories.mutate(orderedIds, {
            onSuccess: () => showSuccess('Category order updated.'),
            onError: () => showError('Could not reorder categories.'),
          })
        }
      />
      <PromptDialog
        visible={Boolean(renaming)}
        title="Rename category"
        fields={[{ key: 'name', label: 'Name', value: renaming?.name ?? '' }]}
        confirmLabel="Save"
        error={renameError}
        onChangeField={() => setRenameError(null)}
        onCancel={() => {
          setRenameError(null);
          setRenaming(null);
        }}
        onConfirm={values => {
          if (!renaming) return;
          const name = values.name.trim();
          if (!name) {
            setRenameError('A category needs a name.');
            return;
          }
          updateCategory.mutate(
            { categoryId: renaming.id, name },
            {
              onSuccess: () => {
                showSuccess('Category renamed.');
                setRenameError(null);
                setRenaming(null);
              },
              // Inline, not a toast: the sheet is a Modal and covers it.
              onError: () => setRenameError('Could not rename the category.'),
            },
          );
        }}
      />
      <PromptDialog
        visible={Boolean(editingService)}
        title="Edit service"
        fields={[
          { key: 'name', label: 'Name', value: editingService?.name ?? '' },
          {
            key: 'price',
            label: 'Price (₦)',
            value: editingService?.price ?? '',
            keyboardType: 'decimal-pad',
          },
        ]}
        confirmLabel="Save"
        error={serviceError}
        onChangeField={() => setServiceError(null)}
        onCancel={() => {
          setServiceError(null);
          setEditingService(null);
        }}
        onConfirm={values => {
          if (!editingService) return;
          const parsedPrice = Number(values.price.replace(/[^\d.]/g, ''));
          updateDetails.mutate(
            {
              itemId: editingService.id,
              name: values.name.trim() || undefined,
              price: Number.isFinite(parsedPrice) ? parsedPrice : undefined,
            },
            {
              onSuccess: () => {
                showSuccess('Service updated.');
                setServiceError(null);
                setEditingService(null);
              },
              onError: () => setServiceError('Could not update the service.'),
            },
          );
        }}
      />
      <ServiceBookingRulesFlow service={rulesFor} onClose={() => setRulesFor(null)} />
    </>
  );
}

/** Add Service steps in the hub: done → back to the services list. */
function useHubServiceFlowNavigation(): ServiceFlowNavigation {
  const navigation = useBusinessNavigation();
  return {
    goBack: navigation.goBack,
    next: step =>
      navigation.navigate(
        step === 'pricing'
          ? 'AddServiceDurationPricing'
          : step === 'availability'
            ? 'AddServiceAvailabilityRules'
            : 'ReviewServiceSummary',
      ),
    done: status => {
      showSuccess(status === 'active' ? 'Service published.' : 'Service saved as draft.');
      useCatalogueDraftStore.getState().resetService();
      navigation.navigate('ServicesCategories');
    },
  };
}

function AddServiceBasicsRoute() {
  return <ServiceBasicsStep nav={useHubServiceFlowNavigation()} />;
}

function AddServiceDurationPricingRoute() {
  return <ServicePricingStep nav={useHubServiceFlowNavigation()} />;
}

function AddServiceAvailabilityRulesRoute() {
  return <ServiceAvailabilityStep nav={useHubServiceFlowNavigation()} />;
}

function ReviewServiceSummaryRoute() {
  return <ServiceReviewStep nav={useHubServiceFlowNavigation()} />;
}

function AddProductBasicsMediaRoute() {
  const navigation = useBusinessNavigation();
  const publish = usePublishCatalogueItem();
  return (
    <AddProductBasicsMediaScreen
      onBack={navigation.goBack}
      onContinue={value => {
        useCatalogueDraftStore.getState().setProduct({
          name: value.title,
          brand: value.producer,
          description: value.description,
          attributes: value.attributes,
          condition: value.condition,
          galleryImages: value.gallery,
          mainImage: value.mainImage,
        });
        navigation.navigate('ProductPricing');
      }}
      onSaveDraft={value => {
        useCatalogueDraftStore.getState().setProduct({
          name: value.title,
          brand: value.producer,
          description: value.description,
          attributes: value.attributes,
          condition: value.condition,
          galleryImages: value.gallery,
          mainImage: value.mainImage,
        });
        const { product } = useCatalogueDraftStore.getState();
        if (!product.branchIds.length) {
          showError('Select branches first, then save the draft.');
          return;
        }
        publish.mutate(
          { kind: 'product', status: 'inactive' },
          {
            onSuccess: () => {
              showSuccess('Draft saved.');
              navigation.goBack();
            },
            onError: error =>
              showError(error instanceof Error ? error.message : 'Failed to save draft.'),
          },
        );
      }}
      onChangeCategory={() => undefined}
    />
  );
}

function LocationsBranchesRoute() {
  const navigation = useBusinessNavigation();
  const openPlanScreen = useOpenPlanScreen();
  const myBusiness = useMyBusiness();
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  // Held in the sheet rather than toasted: see `reportSheetError`.
  const [addError, setAddError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  // Set only by a plan refusal, so the notice never appears for an unrelated
  // failure (a bad name, a network drop) that the toast already explains.
  const [planBlocked, setPlanBlocked] = useState(false);

  const liveBranches = myBusiness.data?.branches ?? [];
  const editing = liveBranches.find(branch => branch.id === editingId);

  const callBranch = (branchId: string) => {
    const phone = liveBranches.find(branch => branch.id === branchId)?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => undefined);
      return;
    }
    showError('No phone number is saved for this location.');
  };

  /**
   * The failure text for the open sheet, and — when the plan is the reason — the
   * persistent callout behind it.
   *
   * Deliberately *not* a toast: the sheet is a `Modal`, and the toast renders
   * beneath it, so a save that was rejected used to look like nothing had
   * happened. The banner inside the sheet is the only place the user is
   * actually looking while it is open.
   */
  const reportSheetError = (
    error: unknown,
    fallback: string,
    setSheetError: (message: string | null) => void,
  ) => {
    const planCopy = branchPlanErrorMessage(error);
    if (planCopy) {
      setPlanBlocked(true);
      setSheetError(planCopy);
      return;
    }
    setSheetError(error instanceof Error ? error.message : fallback);
  };

  return (
    <>
      <LocationsBranchesScreen
        branches={myBusiness.data ? liveBranches.map(branchToLocationRow) : undefined}
        isLoading={myBusiness.isLoading}
        isError={myBusiness.isError && !myBusiness.data}
        onRetry={() => myBusiness.refetch()}
        planBlocked={planBlocked}
        onOpenPlan={openPlanScreen}
        onDismissPlanNotice={() => setPlanBlocked(false)}
        onNotifications={() => navigation.navigate('BusinessNotifications')}
        onAddLocation={() => {
          setAddError(null);
          setAdding(true);
        }}
        onChangeScope={() => undefined}
        onViewDetails={branchId => navigation.navigate('WuseBranchDetails', { branchId })}
        onEditLocation={branchId => {
          setEditError(null);
          setEditingId(branchId);
        }}
        onMoreBranchOptions={() => showError('Location options are not available yet.')}
        onCallBranch={callBranch}
        onReactivate={branchId =>
          updateBranch.mutate(
            { branchId, isActive: true },
            {
              onSuccess: () => showSuccess('Location is live again.'),
              onError: error =>
                showError(
                  error instanceof Error
                    ? error.message
                    : 'Could not reactivate the location.',
                ),
            },
          )
        }
      />

      <PromptDialog
        visible={adding}
        title="Add Location"
        confirmLabel="Create"
        error={addError}
        onChangeField={() => setAddError(null)}
        fields={[
          { key: 'name', label: 'Location name', value: '' },
          { key: 'address', label: 'Address', value: '' },
          { key: 'phone', label: 'Phone', value: '' },
        ]}
        onCancel={() => {
          setAddError(null);
          setAdding(false);
        }}
        onConfirm={values => {
          const name = values.name.trim();
          if (!name) {
            // In the sheet, not a toast — see `reportSheetError`.
            setAddError('A location needs a name.');
            return;
          }
          createBranch.mutate(
            {
              name,
              // Empty inputs are dropped rather than sent as '', so the backend
              // inherits the business-level phone/email instead of blanking it.
              ...(values.address.trim() ? { address: values.address.trim() } : {}),
              ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
            },
            {
              onSuccess: () => {
                showSuccess('Location created.');
                setAddError(null);
                setAdding(false);
                // The plan is no longer stopping the merchant, so the notice
                // would be stale.
                setPlanBlocked(false);
              },
              onError: error =>
                reportSheetError(
                  error,
                  strings.locationsBranches.createFailed,
                  setAddError,
                ),
            },
          );
        }}
      />

      <PromptDialog
        visible={Boolean(editing)}
        title="Edit Location"
        confirmLabel="Save"
        error={editError}
        onChangeField={() => setEditError(null)}
        fields={[
          { key: 'name', label: 'Location name', value: editing?.name ?? '' },
          { key: 'address', label: 'Address', value: editing?.address ?? '' },
          { key: 'phone', label: 'Phone', value: editing?.phone ?? '' },
        ]}
        onCancel={() => {
          setEditError(null);
          setEditingId(null);
        }}
        onConfirm={values => {
          if (!editing) return;
          const name = values.name.trim();
          if (!name) {
            setEditError('A location needs a name.');
            return;
          }
          updateBranch.mutate(
            {
              branchId: editing.id,
              name,
              address: values.address.trim(),
              phone: values.phone.trim(),
            },
            {
              onSuccess: () => {
                showSuccess('Location updated.');
                setEditError(null);
                setEditingId(null);
              },
              onError: error =>
                reportSheetError(
                  error,
                  strings.locationsBranches.editFailed,
                  setEditError,
                ),
            },
          );
        }}
      />
    </>
  );
}

function WuseBranchDetailsRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessTabParamList, 'WuseBranchDetails'>>();
  const branchId = route.params?.branchId ?? null;
  const branchQuery = useBranchDetail(branchId);
  const updateBranch = useUpdateBranch();
  const { setActiveBranch } = useActiveBranch();
  const branch = branchQuery.data;

  const toggleActive = (isActive: boolean) => {
    if (!branch) return;
    updateBranch.mutate(
      { branchId: branch.id, isActive },
      {
        onSuccess: () => {
          showSuccess(isActive ? 'Location is live again.' : 'Location paused.');
          navigation.goBack();
        },
        // The backend refuses to pause a business's last active location, and
        // that is a rule about the business rather than a fault — so its own
        // sentence is shown rather than a generic failure.
        onError: error =>
          showError(error instanceof Error ? error.message : strings.errors.server),
      },
    );
  };

  return (
    <WuseBranchDetailsScreen
      branch={branch}
      isLoading={branchQuery.isLoading}
      error={branchQuery.isError}
      onBack={navigation.goBack}
      onRetry={() => branchQuery.refetch()}
      onCallBranch={() => {
        if (branch?.phone) {
          Linking.openURL(`tel:${branch.phone}`).catch(() => undefined);
        }
      }}
      onSwitchOperatingView={() => {
        if (branch) {
          setActiveBranch(branch.id);
          navigation.goBack();
        }
      }}
      onConfirmDeactivate={() => toggleActive(false)}
      onConfirmReactivate={() => toggleActive(true)}
    />
  );
}

function LoyaltyProgrammeRoute() {
  const navigation = useBusinessNavigation();
  const { branches, activeBranchId, setActiveBranch } = useActiveBranch();
  const myBusiness = useMyBusiness();
  /**
   * Rules are read for the branch the picker is scoped to, so the programme
   * edits the row the owner is looking at — the same scope the rest of the app
   * uses (`useActiveBranch`), not a second selection that could drift from it.
   */
  const rules = useLoyaltyRules(activeBranchId);
  const stats = useLoyaltyBusinessStats(activeBranchId);
  const activity = useBusinessPointLogs(myBusiness.data?.id);
  const updateRules = useUpdateLoyaltyRules(activeBranchId);
  const copy = strings.loyaltyProgramme;

  const view = useMemo(
    () =>
      rules.data
        ? presentLoyaltyProgramme({
            rule: rules.data,
            businessName: myBusiness.data?.name,
            stats: stats.data,
            branches,
            logs: activity.data?.data,
          })
        : undefined,
    [rules.data, myBusiness.data?.name, stats.data, activity.data, branches],
  );

  const reportFailure = useCallback(
    (error: unknown) =>
      showError(error instanceof Error ? error.message : copy.error.title),
    [copy.error.title],
  );

  return (
    <LoyaltyProgrammeConfigurationScreen
      view={view}
      scope={activeBranchId}
      isLoading={rules.isLoading}
      isError={rules.isError}
      onRetry={() => void rules.refetch()}
      onNotifications={() => navigation.navigate('BusinessNotifications')}
      onChangeScope={setActiveBranch}
      onToggleEnabled={enabled =>
        updateRules.mutate(
          { isActive: enabled },
          { onSuccess: () => showSuccess(copy.saved), onError: reportFailure },
        )
      }
      onSaveRules={patch =>
        updateRules.mutate(patch, {
          onSuccess: () => showSuccess(copy.saved),
          onError: reportFailure,
        })
      }
      onTabChange={key => {
        if (key === 'rewards') navigation.navigate('LoyaltyRewards');
      }}
    />
  );
}

function LoyaltyRewardsRoute() {
  const navigation = useBusinessNavigation();
  const { branches, activeBranchId } = useActiveBranch();
  const myBusiness = useMyBusiness();
  const rewards = useBranchRewards(activeBranchId);
  const activity = useBusinessPointLogs(myBusiness.data?.id);
  const createReward = useCreateReward();
  const updateReward = useUpdateReward(activeBranchId);
  const deleteReward = useDeleteReward();
  const copy = strings.loyaltyRewards;

  const view = useMemo(
    () =>
      rewards.data
        ? presentRewards({
            rewards: rewards.data,
            logs: activity.data?.data,
            branches,
            activeBranchId,
          })
        : undefined,
    [rewards.data, activity.data, branches, activeBranchId],
  );

  const reportFailure = useCallback(
    (error: unknown) =>
      showError(error instanceof Error ? error.message : copy.error.title),
    [copy.error.title],
  );

  return (
    <LoyaltyRewardsRulesScreen
      view={view}
      isLoading={rewards.isLoading}
      isError={rewards.isError}
      onRetry={() => void rewards.refetch()}
      onBack={navigation.goBack}
      onMoreActions={() => undefined}
      onCreateReward={input =>
        createReward.mutate(input, {
          onSuccess: () => showSuccess(copy.createdToast),
          onError: reportFailure,
        })
      }
      onEditReward={(rewardId, patch) =>
        updateReward.mutate(
          { rewardId, patch },
          {
            onSuccess: () => showSuccess(copy.savedToast),
            onError: reportFailure,
          },
        )
      }
      onTogglePause={(rewardId, next) =>
        updateReward.mutate(
          { rewardId, patch: { isActive: next } },
          {
            onSuccess: () => showSuccess(copy.savedToast),
            onError: reportFailure,
          },
        )
      }
      onDeleteReward={rewardId =>
        deleteReward.mutate(rewardId, {
          onSuccess: () => showSuccess(copy.removedToast),
          onError: reportFailure,
        })
      }
    />
  );
}

function StaffDirectoryRoute() {
  const navigation = useBusinessNavigation();
  const { activeBranchId, branches } = useActiveBranch();
  const user = useAuthStore(state => state.user);
  const [scope, setScope] = useState<string>('all');
  const [filter, setFilter] = useState<StaffFilterKey>('all');
  const allBranches = scope === 'all';
  const team = useTeamMembers(allBranches ? { allBranches: true } : { branchId: scope });
  const resend = useResendTeamInvite();
  const removeMember = useRemoveTeamMember();
  const copy = strings.staffDirectory;

  const branchOptions = useMemo(
    () => branches.map(branch => ({ id: branch.id, name: branch.name })),
    [branches],
  );

  const view = useMemo(
    () =>
      team.data
        ? presentStaffDirectory({
            members: team.data,
            branches: branchOptions,
            currentUserId: user?.id,
          })
        : undefined,
    [team.data, branchOptions, user?.id],
  );

  /**
   * Writes scope to the row's own branch, not to the viewer's scope: the
   * backend looks the member up with `{ id, branchId }`, so an owner reading
   * "All Locations" would get a 404 from their own branch id.
   */
  const branchIdOf = useCallback(
    (memberId: string) =>
      team.data?.find(member => member.id === memberId)?.branchId || activeBranchId || '',
    [team.data, activeBranchId],
  );

  const reportFailure = useCallback(
    (error: unknown) =>
      showError(error instanceof Error ? error.message : copy.error.title),
    [copy.error.title],
  );

  const confirmRemove = useCallback(
    (memberId: string) => {
      Alert.alert(copy.removeTitle, copy.removeBody, [
        { text: copy.removeKeep, style: 'cancel' },
        {
          text: copy.removeConfirm,
          style: 'destructive',
          onPress: () =>
            removeMember.mutate(
              { memberId, branchId: branchIdOf(memberId) },
              {
                onSuccess: () => showSuccess(copy.removed),
                onError: reportFailure,
              },
            ),
        },
      ]);
    },
    [copy, removeMember, branchIdOf, reportFailure],
  );

  return (
    <StaffTeamAccessDirectoryScreen
      view={view}
      scope={scope}
      filter={filter}
      isLoading={team.isLoading}
      isError={team.isError}
      onRetry={() => void team.refetch()}
      onNotifications={() => navigation.navigate('BusinessNotifications')}
      onChangeScope={setScope}
      onFilterChange={setFilter}
      onInvite={() => navigation.navigate('InviteStaff')}
      onOpenPermissions={memberId => {
        const member = team.data?.find(row => row.id === memberId);
        Alert.alert(
          [member?.firstName, member?.lastName].filter(Boolean).join(' '),
          member?.permissions.length
            ? member.permissions.join(' · ')
            : copy.permissionsGrantedNone,
        );
      }}
      onResendInvite={memberId =>
        resend.mutate(
          { memberId, branchId: branchIdOf(memberId) },
          {
            onSuccess: () => showSuccess(copy.resentToast),
            onError: reportFailure,
          },
        )
      }
      onCancelInvite={confirmRemove}
      onMoreMemberOptions={confirmRemove}
    />
  );
}

function InviteStaffRoute() {
  const navigation = useBusinessNavigation();
  const { activeBranchId, branches } = useActiveBranch();
  const invite = useInviteStaff();
  const copy = strings.inviteStaff;

  const branchOptions = useMemo(
    () => branches.map(branch => ({ id: branch.id, name: branch.name })),
    [branches],
  );

  const sendError = invite.error
    ? invite.error instanceof ApiError
      ? invite.error.message
      : strings.errors.server
    : null;

  const send = (form: InviteStaffForm) => {
    let input: InviteStaffInput;
    try {
      input = inviteFormToInput(form);
    } catch {
      showError(copy.errors.form);
      return;
    }

    invite.mutate(input, {
      onSuccess: () => {
        showSuccess(copy.sent);
        navigation.goBack();
      },
    });
  };

  return (
    <InviteStaffPermissionsScreen
      branches={branchOptions}
      defaultBranchId={activeBranchId}
      isSending={invite.isPending}
      sendError={sendError}
      onSend={send}
      onBack={navigation.goBack}
      onCancel={navigation.goBack}
      onMoreActions={() => undefined}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Analytics & intelligence routes (Business hub)                            */
/* -------------------------------------------------------------------------- */

/**
 * `central_deals_management_2` — the flash-radar treatment. Separate destination
 * so it keeps its own back-stack entry; the screen component is shared.
 */
function DealsFlashRadarRoute() {
  return <LiveDealsList layout="compact" />;
}

/** `central_deals_management_3` — the campaigns & deals treatment. */
function CampaignsDealsManagementRoute() {
  return <LiveDealsList layout="discovery" />;
}

/** `central_products_services_catalogue_2` — the business-hub catalogue. */
function BusinessHubCatalogueRoute() {
  const navigation = useBusinessNavigation();
  return (
    <CentralCatalogueScreen
      layout="businessHub"
      onNotifications={() => navigation.navigate('BusinessNotifications')}
      onQuickSwitch={() => undefined}
      onSearch={() => undefined}
      onChangeScope={() => navigation.navigate('LocationsBranches')}
      onAddProduct={() => navigation.navigate('AddProductBasicsMedia')}
      onAddService={() => navigation.navigate('ServicesCategories')}
      onEditItem={() => undefined}
      onToggleStock={() => undefined}
      onSheetAction={() => undefined}
    />
  );
}

function BusinessReviewsReputationRoute() {
  const navigation = useBusinessNavigation();
  const requestedSource =
    useRoute<RouteProp<BusinessTabParamList, 'BusinessReviewsReputation'>>().params
      ?.source;
  /**
   * Deal reviews and product comments share one screen. Each keeps its own
   * filter, because each filter is a query: "Pending" asks for the moderation
   * queue, "Needs reply" for the unanswered comments.
   */
  const [source, setSource] = useState<ReviewSource>(requestedSource ?? 'deals');
  // A notification tap can land here while the screen is already open.
  useEffect(() => {
    if (requestedSource) setSource(requestedSource);
  }, [requestedSource]);
  const [dealFilter, setDealFilter] = useState<ReviewFilterKey>('all');
  const [productFilter, setProductFilter] = useState<ProductCommentReplyFilter>('all');
  const onDeals = source === 'deals';

  const reviews = useBusinessReviews(
    dealFilter === 'all' ? undefined : (dealFilter as BusinessReviewStatus),
  );
  const summary = useBusinessReviewsSummary();
  const moderate = useModerateBusinessReview();
  const reply = useReplyToBusinessReview();
  const comments = useBusinessProductComments(productFilter, !onDeals);
  const commentSummary = useBusinessProductCommentsSummary(!onDeals);
  const replyToComment = useReplyToProductComment();
  const removeComment = useRemoveProductComment();
  const copy = strings.businessReviewsReputation;

  const list = onDeals ? reviews : comments;
  const totals = onDeals ? summary : commentSummary;
  const activeReply = onDeals ? reply : replyToComment;

  // Both endpoints have to answer: the score comes from the summary, the rows
  // from the list, and a business with no reviews yet still deserves the empty
  // state rather than an error.
  const view = useMemo(() => {
    if (onDeals) {
      return reviews.data && summary.data
        ? presentBusinessReviews({
            reviews: reviews.data,
            summary: summary.data,
            filter: dealFilter,
          })
        : undefined;
    }
    return comments.data && commentSummary.data
      ? presentProductComments({
          comments: comments.data,
          summary: commentSummary.data,
          filter: productFilter,
        })
      : undefined;
  }, [
    onDeals,
    reviews.data,
    summary.data,
    dealFilter,
    comments.data,
    commentSummary.data,
    productFilter,
  ]);

  const reportFailure = useCallback(
    (error: unknown) =>
      showError(error instanceof Error ? error.message : copy.error.title),
    [copy.error.title],
  );

  return (
    <BusinessReviewsReputationScreen
      view={view}
      sources={REVIEW_SOURCES}
      source={source}
      onChangeSource={setSource}
      filter={onDeals ? dealFilter : productFilter}
      onChangeFilter={key =>
        onDeals ? setDealFilter(key) : setProductFilter(key as ProductCommentReplyFilter)
      }
      isLoading={list.isLoading || totals.isLoading}
      isError={list.isError || totals.isError}
      onRetry={() => {
        void list.refetch();
        void totals.refetch();
      }}
      onBack={navigation.goBack}
      onModerate={(reviewId, action) => {
        if (onDeals) {
          moderate.mutate({ reviewId, action }, { onError: reportFailure });
        } else if (action === 'delete') {
          removeComment.mutate(reviewId, { onError: reportFailure });
        }
      }}
      onReply={(reviewId, text) => {
        if (onDeals) {
          reply.reset();
          reply.mutate({ reviewId, reply: text });
        } else {
          replyToComment.reset();
          replyToComment.mutate({ commentId: reviewId, reply: text });
        }
      }}
      isReplying={activeReply.isPending}
      replyError={
        activeReply.error
          ? activeReply.error instanceof ApiError
            ? activeReply.error.message
            : copy.replyFailed
          : null
      }
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Customer display routes (POS stack)                                        */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Account, trust & support routes (More stack)                               */
/* -------------------------------------------------------------------------- */

function BusinessNotificationsRoute() {
  const navigation = useBusinessNavigation();
  const openPlanScreen = useOpenPlanScreen();
  const openVerificationCenter = useOpenVerificationCenter();
  const { data: feed } = useBusinessNotifications();
  const markAllRead = useMarkAllNotificationsRead();

  // Same allowlist as the consumer side, mapped onto the business stacks.
  // Navigating to `BusinessNotifications` here — the screen the row lives on —
  // would push a duplicate of the list onto itself every tap.
  const openNotification = (id: string) => {
    const actionUrl = feed?.data.find(row => row.id === id)?.actionUrl;
    const target = resolveNotificationUrl(actionUrl);
    if (target?.kind === 'plan') {
      openPlanScreen();
      return;
    }
    if (target?.kind === 'verification') {
      openVerificationCenter();
      return;
    }
    if (target?.kind === 'order') {
      navigation.navigate('BusinessOrders', {
        screen: 'BusinessOrderDetail',
        params: { orderId: target.id },
      });
      return;
    }
    if (target?.kind === 'message') {
      navigation.navigate('BusinessMessages', {
        screen: 'BusinessConversation',
        params: { threadId: target.id },
      });
      return;
    }
    if (target?.kind === 'reviews') {
      navigation.navigate('BusinessHub', {
        screen: 'BusinessReviewsReputation',
        params: { source: target.source },
      });
    }
  };

  return (
    <BusinessNotificationsCenterScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onMarkAllRead={() => markAllRead.mutate()}
      onOpenCategory={() => undefined}
      onOpenNotification={openNotification}
      onConfigureDispatch={() => undefined}
    />
  );
}

const billingCopy = strings.businessSubscriptionBilling;

function billingPlanSummary(
  subscription: ActiveSubscription | undefined,
  autoRenews: boolean,
): BillingPlanSummary | null {
  if (!subscription?.plan) return null;
  const period = (['monthly', 'quarterly', 'yearly'] as const).includes(
    subscription.billingPeriod as BillingPeriod,
  )
    ? (subscription.billingPeriod as BillingPeriod)
    : 'monthly';
  const { isFree } = subscription.plan;
  const endDay = formatDay(
    subscription.isTrial ? subscription.trialEndsAt : subscription.endDate,
  );
  const status: BillingPlanSummary['status'] = subscription.isTrial
    ? 'trial'
    : isFree
      ? 'free'
      : subscription.status === 'active'
        ? 'active'
        : subscription.status === 'canceled'
          ? 'canceled'
          : 'expired';
  return {
    name: subscription.plan.name,
    price: formatCurrency(isFree ? 0 : subscription.plan.monthlyPrice),
    period: isFree ? 'monthly' : period,
    status,
    dateLabel:
      isFree || !endDay
        ? null
        : subscription.isTrial
          ? billingCopy.trialEndsOn(endDay)
          : autoRenews
            ? billingCopy.renewsOn(endDay)
            : billingCopy.endsOn(endDay),
    daysLeftLabel:
      subscription.isTrial && subscription.daysRemaining !== null
        ? billingCopy.daysLeft(subscription.daysRemaining)
        : null,
    autoRenews,
    isFree,
  };
}

function BusinessSubscriptionBillingRoute() {
  const navigation = useBusinessNavigation();
  const openPlanScreen = useOpenPlanScreen();
  const subscription = useActiveSubscription();
  const paymentMethod = usePaymentMethod();
  const billing = useBillingHistory();
  const myAddons = useMyAddons();
  const myBusiness = useMyBusiness();
  const cancel = useCancelSubscription();
  const openAddOns = useOpenAddOns();

  const card = paymentMethod.data?.card;
  const confirmCancel = () =>
    Alert.alert(billingCopy.cancelTitle, billingCopy.cancelBody, [
      { text: billingCopy.cancelKeep, style: 'cancel' },
      {
        text: billingCopy.cancelConfirm,
        style: 'destructive',
        onPress: () =>
          cancel.mutate(undefined, {
            onSuccess: () => showSuccess(billingCopy.cancelled),
            onError: error =>
              showError(error instanceof Error ? error.message : billingCopy.error.title),
          }),
      },
    ]);

  return (
    <BusinessSubscriptionBillingScreen
      plan={billingPlanSummary(
        subscription.data ?? undefined,
        paymentMethod.data?.autoRenews ?? false,
      )}
      isVerified={myBusiness.data?.isVerified ?? false}
      card={
        card?.last4
          ? {
              brand: card.brand ? card.brand.toUpperCase() : 'Card',
              last4: card.last4,
              expMonth: card.expMonth,
              expYear: card.expYear,
            }
          : null
      }
      addOns={(myAddons.data ?? [])
        .filter(item => item.status === 'active')
        .map(item => ({
          id: item.id,
          name: item.addon?.name ?? '',
          detail: item.addon?.description ?? null,
          price: formatCurrency(item.totalPaid),
          expiresLabel: formatDay(item.expiresAt)
            ? billingCopy.addOnExpires(formatDay(item.expiresAt) as string)
            : null,
        }))}
      history={(billing.data?.data ?? []).map(row => ({
        id: row.id,
        title:
          billingCopy.purposes[row.purpose ?? ''] ?? billingCopy.purposes.subscription,
        date: formatDay(row.createdAt) ?? '',
        amount: formatCurrency(row.amount, row.currency),
        status: row.status,
        statusLabel: billingCopy.paymentStatuses[row.status] ?? row.status,
      }))}
      loading={subscription.isLoading}
      error={subscription.isError}
      cancelling={cancel.isPending}
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onManagePlan={openPlanScreen}
      onCancelTier={confirmCancel}
      onBrowseAddOns={openAddOns}
    />
  );
}

function BusinessVerificationTrustRoute() {
  const navigation = useBusinessNavigation();
  const openVerificationCenter = useOpenVerificationCenter();
  const status = useVerificationStatus();
  const myBusiness = useMyBusiness();
  const branches = myBusiness.data?.branches ?? [];
  return (
    <BusinessVerificationTrustScreen
      status={status.data}
      businessName={myBusiness.data?.name}
      location={myBusiness.data?.city}
      branchNames={branches.map(branch => branch.name)}
      loading={status.isLoading}
      error={status.isError}
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onOpenVerification={openVerificationCenter}
      onManageLocations={() => navigation.navigate('LocationsBranches')}
    />
  );
}

function BusinessSupportHelpRoute() {
  const navigation = useBusinessNavigation();
  /**
   * The search term and the open ticket are route state, not screen state: both
   * of them decide which query runs (the FAQ key carries the search, the thread
   * is only fetched for the ticket that is open).
   */
  const [search, setSearch] = useState('');
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const [botAnswer, setBotAnswer] = useState<{ body: string; source: string } | null>(
    null,
  );

  const tree = useSupportFaqs(search.trim() || undefined);
  const tickets = useSupportTickets();
  const thread = useSupportTicket(openTicketId);
  const createTicket = useCreateSupportTicket();
  const reply = useReplySupportTicket();
  const askBot = useAskSupportBot();
  const copy = strings.businessSupportHelp;

  const view = useMemo(
    () =>
      tree.data
        ? {
            tree: presentSupportTree({
              tree: tree.data,
              search: search.trim() || undefined,
            }),
            tickets: presentSupportTickets(tickets.data),
            thread: openTicketId ? presentTicketThread(thread.data) : null,
          }
        : undefined,
    [tree.data, tickets.data, thread.data, openTicketId, search],
  );

  const reportFailure = useCallback(
    (error: unknown) =>
      showError(error instanceof Error ? error.message : copy.error.title),
    [copy.error.title],
  );

  return (
    <BusinessSupportHelpScreen
      tree={view?.tree}
      tickets={view?.tickets}
      thread={view?.thread}
      threadLoading={thread.isLoading}
      botAnswer={botAnswer}
      botPending={askBot.isPending}
      botFailed={askBot.isError}
      isLoading={tree.isLoading || tickets.isLoading}
      isError={tree.isError || tickets.isError}
      onRetry={() => {
        void tree.refetch();
        void tickets.refetch();
      }}
      onBack={navigation.goBack}
      onSearch={setSearch}
      onAskBot={query => {
        setBotAnswer(null);
        askBot.mutate(
          { query },
          {
            onSuccess: response =>
              setBotAnswer({ body: response.content, source: response.source }),
            onError: reportFailure,
          },
        );
      }}
      onCreateTicket={input => createTicket.mutate(input, { onError: reportFailure })}
      onReply={(ticketId, message) =>
        reply.mutate({ ticketId, message }, { onError: reportFailure })
      }
      onOpenTicket={setOpenTicketId}
      onCloseThread={() => setOpenTicketId(null)}
    />
  );
}

function BusinessSettingsRoute() {
  const navigation = useBusinessNavigation();
  const copy = strings.businessSettings;
  const user = useAuthStore(state => state.user);
  const { branches, activeBranchId } = useActiveBranch();
  const myBusiness = useMyBusiness();
  const posSettings = usePosSettings();
  const discovery = useDiscoveryPresence();
  const peripherals = usePeripherals(activeBranchId);
  const updatePos = useUpdatePosSettings();
  const updateDiscovery = useUpdateDiscoverySetting();
  const updateBusiness = useUpdateBusinessProfile();
  const [notice, setNotice] = useState<string | null>(null);
  const isOwner = String(user?.role ?? '').toLowerCase() === 'owner';

  const view = useMemo(
    () =>
      myBusiness.data
        ? toSettingsView({
            business: myBusiness.data,
            branchName:
              branches.find(branch => branch.id === activeBranchId)?.name ?? null,
            pos: posSettings.data ?? null,
            discovery: discovery.data?.settings ?? null,
            peripherals: peripherals.data?.data ?? [],
            ownerEmail: user?.email ?? '',
            twoFactorEnabled: Boolean(user?.twoFactorEnabled),
          })
        : undefined,
    [
      myBusiness.data,
      branches,
      activeBranchId,
      posSettings.data,
      discovery.data,
      peripherals.data,
      user?.email,
      user?.twoFactorEnabled,
    ],
  );

  const fail = (error: unknown) =>
    setNotice(error instanceof ApiError ? error.message : copy.saveFailed);

  return (
    <BusinessSettingsScreen
      view={view}
      isError={myBusiness.isError}
      onRetry={() => void myBusiness.refetch()}
      canEdit={isOwner}
      notice={notice}
      onBack={navigation.goBack}
      onChangeBranch={() => navigation.navigate('LocationsBranches')}
      onChangeHours={() =>
        navigation.navigate('WuseBranchDetails', {
          branchId: activeBranchId ?? undefined,
        })
      }
      onOpenHardware={() => navigation.navigate('PaymentHardwareSetup')}
      onOpenSecurity={() => {
        // Password and 2FA live on the account Settings screen, outside the
        // business shell, so it is opened through the root navigator.
        if (navigationRef?.isReady()) {
          navigationRef.navigate('AppStack', { screen: 'Settings' });
        }
      }}
      onToggle={(id, value) => {
        setNotice(null);
        if (id === 'refundRequiresPin' || id === 'voidRequiresPin') {
          updatePos.mutate({ permissions: { [id]: value } }, { onError: fail });
        } else if (id === 'selfOrderingEnabled' || id === 'printKitchenChits') {
          updatePos.mutate({ [id]: value }, { onError: fail });
        } else if (discovery.data) {
          updateDiscovery.mutate(
            { branchId: discovery.data.branch.id, patch: { [id]: value } },
            { onError: fail },
          );
        }
      }}
      onSetLive={live => {
        setNotice(null);
        updateBusiness.mutate({ isVisible: live }, { onError: fail });
      }}
      onSignOut={signOut}
    />
  );
}

function SwitchToCustomerRoute() {
  const navigation = useBusinessNavigation();
  const switchRole = useSwitchRole();
  const user = useAuthStore(state => state.user);
  const { data: myBusiness } = useMyBusiness();
  const preview = useSwitchPreview();

  const customerName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  const customerMeta = user?.email || user?.phone || undefined;

  /** Switch to the customer token, then land on `then` in the customer app. */
  const switchThen = (then: { screen: string; params?: object }) =>
    switchRole.mutate('customer', {
      onSuccess: () => {
        // The customer app (AppStack) replaces the business shell on the root
        // stack, so back cannot cross into the dashboard just left.
        const target = { screen: then.screen, params: then.params } as never;
        if (enterShell('AppStack', target)) return;
        navigation.raw.navigate('AppStack', target);
      },
      onError: error =>
        Alert.alert(
          strings.switchToCustomer.error.title,
          error.message || strings.switchToCustomer.error.body,
        ),
    });

  return (
    <SwitchToCustomerScreen
      merchantName={myBusiness?.name}
      customerName={customerName || undefined}
      customerMeta={customerMeta}
      preview={preview.data}
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onConfirmSwitch={() =>
        switchThen({ screen: 'Tabs', params: { screen: 'Account' } })
      }
      onStayInBusiness={navigation.goBack}
      // The claimed deal is customer-side: switch first, then open its pass.
      onOpenDeal={offerId =>
        switchThen({ screen: 'Tabs', params: claimPassParams(offerId) })
      }
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Growth & QR routes                                                         */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* VEMTAP Intelligence routes                                                  */
/* -------------------------------------------------------------------------- */

/** Route → analytics tab key, so the shell's nav strip stays in sync. */

/* -------------------------------------------------------------------------- */
/* Boost routes                                                               */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Create Campaign wizard routes                                              */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Segment routes                                                             */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Business Network routes                                                    */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Operations hub + offline POS home                                          */
/* -------------------------------------------------------------------------- */

/**
 * `business_more_hub_3` — the POS-tile, operations-dense More hub.
 *
 * This hub links into three different tab stacks (Orders for POS, Business for
 * CRM/catalogue/analytics, More for the rest). A nested `navigate` only
 * resolves inside the *current* stack, so every cross-stack target is addressed
 * through its owning tab rather than by screen name.
 */
/**
 * "Sign Out of Business" — the shared session teardown, then leave the shell.
 *
 * `endSession` covers secure storage, the query cache, the auth store and the
 * realtime socket, the same as an expiry, so a manual sign-out cannot drift
 * from one.
 *
 * BusinessTabs is a root sibling of AppStack/AuthStack, so flipping the
 * session only swaps the stack *underneath* the shell; without a root reset
 * the user would sit in a signed-out business dashboard, and back would
 * reopen it. The reset waits a frame so RootNavigator has re-rendered
 * AuthStack into the root before we target it.
 */
const signOut = () => {
  const store = useAuthStore.getState();
  const leaveBusinessShell = () => {
    requestAnimationFrame(() => {
      if (navigationRef?.isReady()) {
        navigationRef.resetRoot({ index: 0, routes: [{ name: 'AuthStack' }] });
      }
    });
  };

  if (store.status === 'authenticated') {
    // Same teardown an expiry performs, then back to the auth stack.
    endSession()
      .catch(() => undefined)
      .finally(() => leaveBusinessShell());
  } else {
    store.markUnauthenticated();
    leaveBusinessShell();
  }
};

function BusinessMoreHubOperationsRoute() {
  const navigation = useBusinessNavigation();
  const { activeBranchId, branches } = useActiveBranch();
  const business = useMyBusiness();
  const subscription = useActiveSubscription();
  const catalogue = useBusinessCatalogue({ limit: 1 });
  const posDashboard = usePosDashboard(activeBranchId);
  const queuedSales = useOfflineQueueStore(
    state => state.queue.filter(item => item.kind === POS_SALE_QUEUE_KIND).length,
  );
  const hints = strings.businessOpsHubHints;
  const tileHints = {
    ...(catalogue.data ? { products: hints.skus(String(catalogue.data.total)) } : {}),
    ...(posDashboard.data
      ? {
          transactions: hints.today(
            String(toStatNumber(posDashboard.data.transactionCount) ?? 0),
          ),
        }
      : {}),
    offline: queuedSales > 0 ? hints.offlineQueued(queuedSales) : hints.offlineReady,
  };

  // Tile id -> the tab and screen that own it.
  /*
   * Every destination is spelled out per branch rather than looked up from a
   * map, so TypeScript can verify the (tab, screen) pairing at each call site —
   * a `Record<string, {tab, screen}>` erases that correlation and would let a
   * screen be paired with a tab that does not own it.
   */
  const goToPosTile = (tileId: string) => {
    switch (tileId) {
      // The POS register home owns the offline-mode screen as its own section.
      case 'pos-home':
        navigation.navigate('BusinessOrders', { screen: 'PosHomeSalesOperations' });
        break;
      case 'offline':
        navigation.navigate('BusinessOrders', { screen: 'PosHomeOfflineMode' });
        break;
      case 'sync':
        navigation.navigate('BusinessOrders', { screen: 'PosSyncReconciliation' });
        break;
      case 'transactions':
        navigation.navigate('BusinessOrders', {
          screen: 'PosTransactionsLedgerReceipts',
        });
        break;
      case 'new-sale':
        navigation.navigate('BusinessOrders', { screen: 'CustomerDisplayOrder' });
        break;
      // The till CRM list and till catalogue are the register-side surfaces;
      // the central CRM/catalogue stay one tab-level hand-off away.
      case 'customers':
        navigation.navigate('BusinessOrders', { screen: 'PosCustomerLookupList' });
        break;
      case 'products':
        navigation.navigate('BusinessOrders', { screen: 'PosProductsInventory' });
        break;
      // The guest-facing public POS surfaces: kitchen stream for the merchant,
      // the browse menu for the diner's own device.
      case 'public-pos':
        navigation.navigate('BusinessOrders', { screen: 'MerchantPosKitchenStream' });
        break;
      case 'public-menu':
        navigation.navigate('BusinessOrders', { screen: 'PublicPosOrderMenu' });
        break;
      default:
        break;
    }
  };

  const goToRow = (rowId: string) => {
    switch (rowId) {
      // Business hub stack
      case 'customers':
        navigation.navigate('BusinessHub', { screen: 'BusinessCustomerIntelligence' });
        break;
      case 'deals':
      case 'business':
      case 'till':
        navigation.navigate('BusinessHub', { screen: 'BusinessPerformanceAnalytics' });
        break;
      case 'locations':
        navigation.navigate('BusinessHub', { screen: 'BranchComparison' });
        break;
      case 'reviews':
        navigation.navigate('BusinessHub', { screen: 'BusinessReviewsReputation' });
        break;
      // More stack
      case 'boost':
        navigation.navigate('BusinessMore', { screen: 'BoostEngine' });
        break;
      case 'campaigns':
        navigation.navigate('BusinessMore', { screen: 'CampaignsHub' });
        break;
      case 'segments':
        navigation.navigate('BusinessMore', { screen: 'CustomerSegments' });
        break;
      case 'master-qr':
        navigation.navigate('BusinessMore', { screen: 'BusinessQr' });
        break;
      case 'location-qr':
        navigation.navigate('BusinessMore', { screen: 'LocationQr' });
        break;
      case 'discovery':
        navigation.navigate('BusinessMore', { screen: 'BusinessDiscoveryFeed' });
        break;
      case 'notifications':
        navigation.navigate('BusinessMore', { screen: 'BusinessNotifications' });
        break;
      case 'billing':
        navigation.navigate('BusinessMore', { screen: 'BusinessSubscriptionBilling' });
        break;
      case 'verification':
        navigation.navigate('BusinessMore', { screen: 'BusinessVerificationTrust' });
        break;
      case 'support':
        navigation.navigate('BusinessMore', { screen: 'BusinessSupportHelp' });
        break;
      case 'settings':
        navigation.navigate('BusinessMore', { screen: 'BusinessSettings' });
        break;
      default:
        break;
    }
  };

  return (
    <BusinessMoreHubOperationsScreen
      tileHints={tileHints}
      identity={
        business.data
          ? {
              name: business.data.name,
              plan: subscription.data?.plan?.name,
              branch: branches.find(branch => branch.id === activeBranchId)?.name,
            }
          : undefined
      }
      netSales={
        posDashboard.data
          ? formatCurrency(toStatNumber(posDashboard.data.revenue) ?? 0)
          : undefined
      }
      onBack={navigation.goBack}
      onOpenNotifications={() => navigation.navigate('BusinessNotifications')}
      onOpenProfile={() => undefined}
      onOpenPosTile={goToPosTile}
      onOpenRow={goToRow}
      onSwitchToCustomer={() => navigation.navigate('SwitchToCustomer')}
      onSignOut={signOut}
    />
  );
}

/** `pos_home_offline_mode_active` — the local till running without a network. */

/* -------------------------------------------------------------------------- */
/* POS sale-flow routes                                                       */
/* -------------------------------------------------------------------------- */

function BusinessMoreRoute() {
  // Direct More-stack navigation for the account/trust/support screens, and a
  // root hop for the surfaces that live in the Business hub stack. Going through
  // the root for a sibling stack does not bubble, so each row takes the
  // shortest correct path.
  const navigation = useBusinessNavigation();
  const { branches, activeBranchId, setActiveBranch } = useActiveBranch();
  const { view } = useBusinessHubData(activeBranchId);
  const subscription = useActiveSubscription();
  const verification = useVerificationStatus();
  const unread = useBusinessUnreadCount();
  const moreCopy = strings.businessMore;

  const rowStatus: Partial<Record<string, MoreRowStatus>> = {};
  if (view) {
    rowStatus.reviews = {
      meta:
        view.reviews.total > 0 && view.reviews.average !== null
          ? moreCopy.reviewsMeta(view.reviews.average.toFixed(1), view.reviews.total)
          : moreCopy.noReviewsMeta,
    };
  }
  if (unread.data) {
    rowStatus.notifications = {
      badge: moreCopy.unreadBadge(unread.data),
      badgeTone: 'brand',
    };
  }
  const sub = subscription.data;
  if (sub?.plan) {
    const day = formatDay(sub.isTrial ? sub.trialEndsAt : sub.endDate);
    rowStatus.billing = {
      meta: moreCopy.billingMeta(
        sub.plan.name,
        sub.plan.isFree ? '' : moreCopy.perMonth(formatCurrency(sub.plan.monthlyPrice)),
        day ? (sub.isTrial ? moreCopy.trialEndsOn(day) : moreCopy.renewsOn(day)) : null,
      ),
    };
  }
  if (verification.data) {
    rowStatus.verification = {
      badge: moreCopy.verificationBadge[verification.data.status],
      badgeTone: verification.data.isVerified ? 'success' : 'neutral',
    };
  }

  return (
    <BusinessMoreHubScreen
      hub={view}
      planName={sub?.plan?.name}
      rowStatus={rowStatus}
      appVersion={appVersion()}
      branches={branches}
      activeBranchId={activeBranchId ?? undefined}
      onChangeBranch={setActiveBranch}
      onAddBranch={() => navigation.navigate('BusinessManagementHub')}
      onOpenRow={id => {
        switch (id) {
          case 'reviews':
            navigation.navigate('BusinessHub', {
              screen: 'BusinessReviewsReputation',
            });
            break;
          case 'insights':
            navigation.navigate('BusinessHub', {
              screen: 'BusinessPerformanceAnalytics',
            });
            break;
          // The five-way VEMTAP Intelligence hub (shared analytics shell).
          case 'intelligence':
            navigation.navigate('BusinessAnalytics');
            break;
          // Marketing & Growth and QR & Storefront Discovery open their own
          // grouped hub, which in turn links across campaigns/boost/segments.
          case 'boost':
            navigation.navigate('CampaignsHub');
            break;
          case 'master-qr':
            navigation.navigate('BusinessQr');
            break;
          case 'network':
            navigation.navigate('BusinessNetworkIntroHub');
            break;
          case 'pos-launch':
            navigation.navigate('BusinessMoreHubOperations');
            break;
          case 'notifications':
            navigation.navigate('BusinessNotifications');
            break;
          case 'billing':
            navigation.navigate('BusinessSubscriptionBilling');
            break;
          case 'verification':
            navigation.navigate('BusinessVerificationTrust');
            break;
          case 'support':
            navigation.navigate('BusinessSupportHelp');
            break;
          case 'settings':
            navigation.navigate('BusinessSettings');
            break;
          default:
            break;
        }
      }}
      onSwitchToCustomer={() => navigation.navigate('SwitchToCustomer')}
      onSignOut={signOut}
    />
  );
}

/**
 * Business-facing app shell. Owns the one business bottom navigation
 * (`BusinessTabBar`) and wraps every business screen in the compact density so
 * type sizes stay consistent across the whole business side.
 */
function BusinessOverviewTabNavigator() {
  return (
    <OverviewStack.Navigator screenOptions={stackOptions}>
      <OverviewStack.Screen
        name="BusinessOverviewHome"
        component={BusinessOverviewRoute}
      />
    </OverviewStack.Navigator>
  );
}

function BusinessOrdersTabNavigator() {
  return (
    <OrdersStack.Navigator screenOptions={stackOptions}>
      <OrdersStack.Screen
        name="BusinessOrdersHome"
        component={BusinessOrdersSurfaceRoute}
      />
      <OrdersStack.Screen
        name="BusinessOrderDetail"
        component={BusinessOrderDetailRoute}
      />
      <OrdersStack.Screen
        name="BusinessBookingDetail"
        component={BusinessBookingDetailRoute}
      />
      <OrdersStack.Screen name="BusinessBookings" component={BusinessBookingsRoute} />
      <OrdersStack.Screen name="BusinessPosOrders" component={BusinessPosOrdersRoute} />
      <OrdersStack.Screen
        name="CustomerDisplayOrder"
        component={CustomerDisplayOrderRoute}
      />
      <OrdersStack.Screen
        name="CustomerDisplayPayment"
        component={CustomerDisplayPaymentRoute}
      />
      <OrdersStack.Screen
        name="CustomerDisplayRating"
        component={CustomerDisplayRatingRoute}
      />
      <OrdersStack.Screen name="SplitTheBill" component={SplitTheBillRoute} />
      <OrdersStack.Screen name="DigitalEReceipt" component={DigitalEReceiptRoute} />
      <OrdersStack.Screen name="PosHomeOfflineMode" component={PosHomeOfflineModeRoute} />
      <OrdersStack.Screen
        name="PosBranchTillSwitcher"
        component={PosBranchTillSwitcherRoute}
      />
      <OrdersStack.Screen
        name="PosHomeSalesOperations"
        component={PosHomeSalesOperationsRoute}
      />
      <OrdersStack.Screen name="PosNewSaleCatalog" component={PosNewSaleCatalogRoute} />
      <OrdersStack.Screen name="PosCurrentSaleCart" component={PosCurrentSaleCartRoute} />
      <OrdersStack.Screen name="PosTenderCheckout" component={PosTenderCheckoutRoute} />
      <OrdersStack.Screen name="PosSaleCompleted" component={PosSaleCompletedRoute} />
      <OrdersStack.Screen
        name="PosReceiptCustomization"
        component={PosReceiptCustomizationRoute}
      />
      <OrdersStack.Screen
        name="PosCustomerLookupActive"
        component={PosCustomerLookupActiveRoute}
      />
      <OrdersStack.Screen
        name="PosCustomerLookupList"
        component={PosCustomerLookupListRoute}
      />
      <OrdersStack.Screen
        name="PosCustomerLookupLoyalty"
        component={PosCustomerLookupLoyaltyRoute}
      />
      <OrdersStack.Screen name="PosCustomerDossier" component={PosCustomerDossierRoute} />
      <OrdersStack.Screen
        name="PosProductsInventory"
        component={PosProductsInventoryRoute}
      />
      <OrdersStack.Screen
        name="PosProductShiftStockStatus"
        component={PosProductShiftStockStatusRoute}
      />
      <OrdersStack.Screen
        name="PosTransactionsLedgerShift"
        component={PosTransactionsLedgerShiftRoute}
      />
      <OrdersStack.Screen
        name="PosTransactionsLedgerReceipts"
        component={PosTransactionsLedgerReceiptsRoute}
      />
      <OrdersStack.Screen
        name="PosTransactionDetails"
        component={PosTransactionDetailsRoute}
      />
      <OrdersStack.Screen
        name="PosOfflineCheckoutTerminal"
        component={PosOfflineCheckoutTerminalRoute}
      />
      <OrdersStack.Screen
        name="PosOfflineBufferQueue"
        component={PosOfflineBufferQueueRoute}
      />
      <OrdersStack.Screen
        name="PosSyncReconciliation"
        component={PosSyncReconciliationRoute}
      />
      <OrdersStack.Screen name="PublicPosOrderMenu" component={PublicPosOrderMenuRoute} />
      <OrdersStack.Screen
        name="PublicPosCartReview"
        component={PublicPosCartReviewRoute}
      />
      <OrdersStack.Screen
        name="PublicPosOrderTracking"
        component={PublicPosOrderTrackingRoute}
      />
      <OrdersStack.Screen
        name="MerchantPosKitchenStream"
        component={MerchantPosKitchenStreamRoute}
      />
      <OrdersStack.Screen name="PosGeneralSettings" component={PosGeneralSettingsRoute} />
      <OrdersStack.Screen
        name="PaymentHardwareSetup"
        component={PaymentHardwareSetupRoute}
      />
      <OrdersStack.Screen name="TaxesSurcharges" component={TaxesSurchargesRoute} />
      <OrdersStack.Screen
        name="StaffPermissionsPasscodes"
        component={StaffPermissionsPasscodesRoute}
      />
    </OrdersStack.Navigator>
  );
}

function BusinessMessagesTabNavigator() {
  return (
    <MessagesStack.Navigator screenOptions={stackOptions}>
      <MessagesStack.Screen
        name="BusinessMessagesHome"
        component={BusinessMessagesRoute}
      />
      <MessagesStack.Screen
        name="BusinessConversation"
        component={BusinessConversationRoute}
      />
    </MessagesStack.Navigator>
  );
}

function BusinessHubTabNavigator() {
  return (
    <HubStack.Navigator screenOptions={stackOptions}>
      <HubStack.Screen name="BusinessHubHome" component={BusinessHubRoute} />
      <HubStack.Screen
        name="BusinessManagementHub"
        component={BusinessManagementHubRoute}
      />
      <HubStack.Screen
        name="BusinessProfilePreview"
        component={BusinessProfilePreviewRoute}
      />
      <HubStack.Screen name="BusinessEditProfile" component={BusinessEditProfileRoute} />
      <HubStack.Screen
        name="BusinessStorefrontPreview"
        component={BusinessStorefrontPreviewRoute}
      />
      <HubStack.Screen
        name="CentralDealsManagement"
        component={CentralDealsManagementRoute}
      />
      <HubStack.Screen name="DealsFlashRadar" component={DealsFlashRadarRoute} />
      <HubStack.Screen
        name="CampaignsDealsManagement"
        component={CampaignsDealsManagementRoute}
      />
      <HubStack.Screen
        name="BusinessHubCatalogue"
        component={BusinessHubCatalogueRoute}
      />
      <HubStack.Screen
        name="DealDetailsPerformance"
        component={DealDetailsPerformanceRoute}
      />
      <HubStack.Screen
        name="DealRedemptionLedger"
        component={DealRedemptionLedgerRoute}
      />
      <HubStack.Screen name="CreateDealStep1" component={CreateDealStep1Route} />
      <HubStack.Screen name="CreateDealStep2" component={CreateDealStep2Route} />
      <HubStack.Screen name="CreateDealStep3" component={CreateDealStep3Route} />
      <HubStack.Screen name="CreateDealStep4" component={CreateDealStep4Route} />
      <HubStack.Screen name="ProductPricing" component={ProductPricingRoute} />
      <HubStack.Screen name="ProductAvailability" component={ProductAvailabilityRoute} />
      <HubStack.Screen name="ProductReview" component={ProductReviewRoute} />
      <HubStack.Screen name="CentralCatalogue" component={CentralCatalogueRoute} />
      <HubStack.Screen name="ServicesCategories" component={ServicesCategoriesRoute} />
      <HubStack.Screen
        name="AddProductBasicsMedia"
        component={AddProductBasicsMediaRoute}
      />
      <HubStack.Screen name="AddServiceBasics" component={AddServiceBasicsRoute} />
      <HubStack.Screen
        name="AddServiceDurationPricing"
        component={AddServiceDurationPricingRoute}
      />
      <HubStack.Screen
        name="AddServiceAvailabilityRules"
        component={AddServiceAvailabilityRulesRoute}
      />
      <HubStack.Screen
        name="ReviewServiceSummary"
        component={ReviewServiceSummaryRoute}
      />
      <HubStack.Screen name="LocationsBranches" component={LocationsBranchesRoute} />
      <HubStack.Screen name="WuseBranchDetails" component={WuseBranchDetailsRoute} />
      <HubStack.Screen
        name="CustomerCrmDirectory"
        component={CustomerCrmDirectoryRoute}
      />
      <HubStack.Screen
        name="CustomerProfileDossier"
        component={CustomerProfileDossierRoute}
      />
      <HubStack.Screen name="LoyaltyProgramme" component={LoyaltyProgrammeRoute} />
      <HubStack.Screen name="LoyaltyRewards" component={LoyaltyRewardsRoute} />
      <HubStack.Screen name="StaffDirectory" component={StaffDirectoryRoute} />
      <HubStack.Screen name="InviteStaff" component={InviteStaffRoute} />
      <HubStack.Screen
        name="BusinessCustomerIntelligence"
        component={BusinessCustomerIntelligenceRoute}
      />
      <HubStack.Screen
        name="BusinessPerformanceAnalytics"
        component={BusinessPerformanceAnalyticsRoute}
      />
      <HubStack.Screen name="BranchComparison" component={BranchComparisonRoute} />
      <HubStack.Screen
        name="BusinessReviewsReputation"
        component={BusinessReviewsReputationRoute}
      />
    </HubStack.Navigator>
  );
}

function BusinessMoreTabNavigator() {
  return (
    <MoreStack.Navigator screenOptions={stackOptions}>
      <MoreStack.Screen name="BusinessMoreHome" component={BusinessMoreRoute} />
      <MoreStack.Screen
        name="BusinessNotifications"
        component={BusinessNotificationsRoute}
      />
      <MoreStack.Screen
        name="BusinessSubscriptionBilling"
        component={BusinessSubscriptionBillingRoute}
      />
      <MoreStack.Screen
        name="BusinessVerificationTrust"
        component={BusinessVerificationTrustRoute}
      />
      <MoreStack.Screen name="BusinessSupportHelp" component={BusinessSupportHelpRoute} />
      <MoreStack.Screen name="BusinessSettings" component={BusinessSettingsRoute} />
      <MoreStack.Screen name="SwitchToCustomer" component={SwitchToCustomerRoute} />
      <MoreStack.Screen name="CampaignsHub" component={CampaignsHubRoute} />
      <MoreStack.Screen name="CustomerSegments" component={CustomerSegmentsRoute} />
      <MoreStack.Screen name="BoostEngine" component={BoostEngineRoute} />
      {/* VEMTAP Intelligence */}
      <MoreStack.Screen name="BusinessAnalytics" component={BusinessAnalyticsRoute} />
      <MoreStack.Screen name="CustomersAnalytics" component={CustomersAnalyticsRoute} />
      <MoreStack.Screen name="DealsAnalytics" component={DealsAnalyticsRoute} />
      <MoreStack.Screen name="LocationsAnalytics" component={LocationsAnalyticsRoute} />
      <MoreStack.Screen name="PosAnalytics" component={PosAnalyticsRoute} />
      <MoreStack.Screen
        name="AnalyticsExportReport"
        component={AnalyticsExportReportRoute}
      />
      {/* Boost */}
      <MoreStack.Screen name="BoostGoalAudience" component={BoostGoalAudienceRoute} />
      <MoreStack.Screen name="BoostBudgetSchedule" component={BoostBudgetScheduleRoute} />
      <MoreStack.Screen name="BoostPreviewPayment" component={BoostPreviewPaymentRoute} />
      <MoreStack.Screen name="BoostPerformance" component={BoostPerformanceRoute} />
      <MoreStack.Screen name="BoostWallet" component={BoostWalletRoute} />
      {/* Create Campaign wizard */}
      <MoreStack.Screen
        name="CampaignCreateObjective"
        component={CampaignCreateObjectiveRoute}
      />
      <MoreStack.Screen
        name="CampaignCreateContent"
        component={CampaignCreateContentRoute}
      />
      <MoreStack.Screen
        name="CampaignCreateAudience"
        component={CampaignCreateAudienceRoute}
      />
      <MoreStack.Screen
        name="CampaignCreateSchedule"
        component={CampaignCreateScheduleRoute}
      />
      <MoreStack.Screen
        name="CampaignCreateBudget"
        component={CampaignCreateBudgetRoute}
      />
      <MoreStack.Screen
        name="CampaignReviewLaunch"
        component={CampaignReviewLaunchRoute}
      />
      {/* Customer segments */}
      <MoreStack.Screen name="SegmentActions" component={SegmentActionsRoute} />
      <MoreStack.Screen name="CreateCustomSegment" component={CreateCustomSegmentRoute} />
      <MoreStack.Screen
        name="SegmentAudienceDetails"
        component={SegmentAudienceDetailsRoute}
      />
      <MoreStack.Screen name="BusinessQr" component={BusinessQrRoute} />
      <MoreStack.Screen name="LocationQr" component={LocationQrRoute} />
      <MoreStack.Screen
        name="BusinessDiscoveryFeed"
        component={BusinessDiscoveryFeedRoute}
      />
      <MoreStack.Screen
        name="BusinessNetworkIntroHub"
        component={BusinessNetworkIntroHubRoute}
      />
      <MoreStack.Screen name="MyBusinessNetwork" component={MyBusinessNetworkRoute} />
      <MoreStack.Screen name="NetworkMilestones" component={NetworkMilestonesRoute} />
      <MoreStack.Screen name="BusinessNetworkInfo" component={BusinessNetworkInfoRoute} />
      <MoreStack.Screen name="MyReferrals" component={MyReferralsRoute} />
      <MoreStack.Screen name="ReferralDetail" component={ReferralDetailRoute} />
      <MoreStack.Screen
        name="BusinessNetworkDashboard"
        component={BusinessNetworkDashboardRoute}
      />
      <MoreStack.Screen
        name="BusinessMoreHubOperations"
        component={BusinessMoreHubOperationsRoute}
      />
    </MoreStack.Navigator>
  );
}

/**
 * Live bottom-bar badges. Orders shows how many orders are still `new`
 * (awaiting acceptance); Messages shows the unread message count from the
 * dashboard payload. Both stay hidden while the API hasn't answered, so the
 * footer can never display a designed/fake number.
 */
function BusinessTabBarWithLiveBadges(
  props: React.ComponentProps<typeof BusinessTabBar>,
) {
  const { activeBranchId } = useActiveBranch();
  const isTabBarHidden = useTabBarStore(state => state.isTabBarHidden);
  const counts = useBusinessOrderCounts(activeBranchId);
  const dashboard = useBusinessDashboard(activeBranchId, Boolean(activeBranchId));

  // A focused screen that wants the full canvas (the chat) has taken over the
  // footer, so it is rendered away entirely rather than left floating over or
  // squeezed above the keyboard.
  if (isTabBarHidden) return null;

  const badges: Partial<Record<string, BusinessTabBadge>> = {};

  if (counts.counts.new > 0) {
    badges.BusinessOrders = { count: counts.counts.new, tone: 'brand' };
  }

  /** `unreadMessages` is the branch-side counter — broadcasts never badge. */
  const unreadMessages = dashboard.data?.unreadMessages ?? 0;
  if (unreadMessages > 0) {
    badges.BusinessMessages = { count: unreadMessages, tone: 'error' };
  }

  return <BusinessTabBar {...props} badges={badges} />;
}

export function BusinessTabNavigator() {
  // One socket + one realtime bridge for the whole business shell: the inbox,
  // the open thread, and the live Messages tab badge all stay in sync.
  const { activeBranchId } = useActiveBranch();
  useBusinessMessagingRealtime(activeBranchId);

  return (
    <TypeDensityProvider density="compact">
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={props => <BusinessTabBarWithLiveBadges {...props} />}
      >
        <Tab.Screen
          name="BusinessOverview"
          component={BusinessOverviewTabNavigator}
          options={{ title: 'Overview' }}
        />
        <Tab.Screen
          name="BusinessOrders"
          component={BusinessOrdersTabNavigator}
          options={{ title: 'Orders' }}
        />
        <Tab.Screen
          name="BusinessMessages"
          component={BusinessMessagesTabNavigator}
          options={{ title: 'Messages' }}
        />
        <Tab.Screen
          name="BusinessHub"
          component={BusinessHubTabNavigator}
          options={{ title: 'Business' }}
        />
        <Tab.Screen
          name="BusinessMore"
          component={BusinessMoreTabNavigator}
          options={{ title: 'More' }}
        />
      </Tab.Navigator>
    </TypeDensityProvider>
  );
}
