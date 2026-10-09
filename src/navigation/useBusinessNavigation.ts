import { useCallback, useMemo } from 'react';
import { historyBack } from '@navigation/useHistoryBack';
import {
  useNavigation,
  useNavigationState,
  type CompositeNavigationProp,
} from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type {
  AppStackParamList,
  BusinessStackParamList,
  BusinessTabParamList,
  BusinessTabRootParamList,
  RootStackParamList,
} from '@navigation/types';

/** The five bottom-tab destinations of the business shell. */
export type BusinessTabRootName = keyof BusinessTabRootParamList;

export type BusinessShellNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<BusinessTabParamList>,
  CompositeNavigationProp<
    NativeStackNavigationProp<BusinessTabParamList>,
    CompositeNavigationProp<
      NativeStackNavigationProp<AppStackParamList>,
      NativeStackNavigationProp<RootStackParamList>
    >
  >
>;

/**
 * Route \u2192 the tab that owns it. The business shell splits its screens across
 * five sibling stacks (Overview / Orders / Messages / Hub / More), so a route name
 * alone does not identify where it can be pushed: `CentralDealsManagement` lives
 * in the Hub stack, and a screen sitting in the More stack cannot push it by name.
 *
 * A NAVIGATE action only bubbles to *ancestors*, never to siblings, so those taps
 * were silently dropped ("was not handled by any navigator"). This table is the
 * single place that knows the mapping, and {@link useBusinessNavigation} uses it
 * to route cross-tab hops through the parent tab navigator.
 */
const TAB_FOR_ROUTE = new Map<string, BusinessTabRootName>([
  ['BusinessOverviewHome', 'BusinessOverview'],
  ['BusinessOrdersHome', 'BusinessOrders'],
  ['BusinessOrderDetail', 'BusinessOrders'],
  ['BusinessBookings', 'BusinessOrders'],
  ['BusinessPosOrders', 'BusinessOrders'],
  ['CustomerDisplayOrder', 'BusinessOrders'],
  ['CustomerDisplayPayment', 'BusinessOrders'],
  ['CustomerDisplayRating', 'BusinessOrders'],
  ['SplitTheBill', 'BusinessOrders'],
  ['DigitalEReceipt', 'BusinessOrders'],
  ['PosHomeOfflineMode', 'BusinessOrders'],
  ['PosBranchTillSwitcher', 'BusinessOrders'],
  ['PosHomeSalesOperations', 'BusinessOrders'],
  ['PosNewSaleCatalog', 'BusinessOrders'],
  ['PosCurrentSaleCart', 'BusinessOrders'],
  ['PosTenderCheckout', 'BusinessOrders'],
  ['PosSaleCompleted', 'BusinessOrders'],
  ['PosReceiptCustomization', 'BusinessOrders'],
  ['PosCustomerLookupActive', 'BusinessOrders'],
  ['PosCustomerLookupList', 'BusinessOrders'],
  ['PosCustomerLookupLoyalty', 'BusinessOrders'],
  ['PosCustomerDossier', 'BusinessOrders'],
  ['PosProductsInventory', 'BusinessOrders'],
  ['PosProductShiftStockStatus', 'BusinessOrders'],
  ['PosTransactionsLedgerShift', 'BusinessOrders'],
  ['PosTransactionsLedgerReceipts', 'BusinessOrders'],
  ['PosTransactionDetails', 'BusinessOrders'],
  ['PosOfflineCheckoutTerminal', 'BusinessOrders'],
  ['PosOfflineBufferQueue', 'BusinessOrders'],
  ['PosSyncReconciliation', 'BusinessOrders'],
  ['PublicPosOrderMenu', 'BusinessOrders'],
  ['PublicPosCartReview', 'BusinessOrders'],
  ['PublicPosOrderTracking', 'BusinessOrders'],
  ['MerchantPosKitchenStream', 'BusinessOrders'],
  ['PosGeneralSettings', 'BusinessOrders'],
  ['PaymentHardwareSetup', 'BusinessOrders'],
  ['TaxesSurcharges', 'BusinessOrders'],
  ['StaffPermissionsPasscodes', 'BusinessOrders'],
  ['BusinessMessagesHome', 'BusinessMessages'],
  ['BusinessConversation', 'BusinessMessages'],
  ['BusinessHubHome', 'BusinessHub'],
  ['BusinessManagementHub', 'BusinessHub'],
  ['BusinessProfilePreview', 'BusinessHub'],
  ['CentralDealsManagement', 'BusinessHub'],
  ['DealsFlashRadar', 'BusinessHub'],
  ['CampaignsDealsManagement', 'BusinessHub'],
  ['BusinessHubCatalogue', 'BusinessHub'],
  ['DealDetailsPerformance', 'BusinessHub'],
  ['CreateDealLocationAssignment', 'BusinessHub'],
  ['DealLocationAssignmentPricing', 'BusinessHub'],
  ['ProductLocationAssignment', 'BusinessHub'],
  ['BranchAvailabilityLocationPricing', 'BusinessHub'],
  ['CentralCatalogue', 'BusinessHub'],
  ['ServicesCategories', 'BusinessHub'],
  ['AddProductBasicsMedia', 'BusinessHub'],
  ['LocationsBranches', 'BusinessHub'],
  ['WuseBranchDetails', 'BusinessHub'],
  ['CustomerCrmDirectory', 'BusinessHub'],
  ['CustomerProfileDossier', 'BusinessHub'],
  ['LoyaltyProgramme', 'BusinessHub'],
  ['LoyaltyRewards', 'BusinessHub'],
  ['StaffDirectory', 'BusinessHub'],
  ['InviteStaff', 'BusinessHub'],
  ['BusinessCustomerIntelligence', 'BusinessHub'],
  ['BusinessPerformanceAnalytics', 'BusinessHub'],
  ['BranchComparison', 'BusinessHub'],
  ['BusinessReviewsReputation', 'BusinessHub'],
  ['BusinessMoreHome', 'BusinessMore'],
  ['BusinessNotifications', 'BusinessMore'],
  ['BusinessSubscriptionBilling', 'BusinessMore'],
  ['BusinessVerificationTrust', 'BusinessMore'],
  ['BusinessSupportHelp', 'BusinessMore'],
  ['BusinessSettings', 'BusinessMore'],
  ['SwitchToCustomer', 'BusinessMore'],
  ['CampaignsHub', 'BusinessMore'],
  ['CustomerSegments', 'BusinessMore'],
  ['BoostEngine', 'BusinessMore'],
  ['BusinessAnalytics', 'BusinessMore'],
  ['CustomersAnalytics', 'BusinessMore'],
  ['DealsAnalytics', 'BusinessMore'],
  ['LocationsAnalytics', 'BusinessMore'],
  ['PosAnalytics', 'BusinessMore'],
  ['AnalyticsExportReport', 'BusinessMore'],
  ['BoostGoalAudience', 'BusinessMore'],
  ['BoostBudgetSchedule', 'BusinessMore'],
  ['BoostPreviewPayment', 'BusinessMore'],
  ['BoostPerformance', 'BusinessMore'],
  ['BoostWallet', 'BusinessMore'],
  ['CampaignCreateObjective', 'BusinessMore'],
  ['CampaignCreateContent', 'BusinessMore'],
  ['CampaignCreateAudience', 'BusinessMore'],
  ['CampaignCreateSchedule', 'BusinessMore'],
  ['CampaignCreateBudget', 'BusinessMore'],
  ['CampaignReviewLaunch', 'BusinessMore'],
  ['SegmentActions', 'BusinessMore'],
  ['CreateCustomSegment', 'BusinessMore'],
  ['SegmentAudienceDetails', 'BusinessMore'],
  ['BusinessQr', 'BusinessMore'],
  ['LocationQr', 'BusinessMore'],
  ['BusinessDiscoveryFeed', 'BusinessMore'],
  ['BusinessNetworkIntroHub', 'BusinessMore'],
  ['MyBusinessNetwork', 'BusinessMore'],
  ['NetworkMilestones', 'BusinessMore'],
  ['BusinessNetworkInfo', 'BusinessMore'],
  ['MyReferrals', 'BusinessMore'],
  ['ReferralDetail', 'BusinessMore'],
  ['BusinessNetworkDashboard', 'BusinessMore'],
  ['BusinessMoreHubOperations', 'BusinessMore'],
]);

const TAB_SET = new Set<string>([
  'BusinessOverview',
  'BusinessOrders',
  'BusinessMessages',
  'BusinessHub',
  'BusinessMore',
]);

/** True when the route is a business-shell screen that lives in a sibling stack. */
export function isCrossStackBusinessRoute(route: string): boolean {
  return TAB_FOR_ROUTE.has(route);
}

/** The route → owning-tab table, exported so tests can assert its coverage. */
export const businessTabForRoute: ReadonlyMap<string, BusinessTabRootName> =
  TAB_FOR_ROUTE;

export interface BusinessNavigationHelpers {
  /**
   * Navigates to any business-shell route, switching tabs when the target lives
   * in a different stack. Routes outside the shell (AppStack / RootStack) and the
   * tab roots themselves are passed straight through.
   */
  navigate: <K extends keyof BusinessTabParamList>(
    screen: K,
    params?: BusinessTabParamList[K],
  ) => void;
  push: <K extends keyof BusinessStackParamList>(
    screen: K,
    params?: BusinessStackParamList[K],
  ) => void;
  /** Swaps the current entry for a shell route, keeping the cross-tab rewrite. */
  replace: <K extends keyof BusinessStackParamList>(
    screen: K,
    params?: BusinessStackParamList[K],
  ) => void;
  /** The active bottom-tab destination of the shell. */
  currentTab: BusinessTabRootName;
  goBack: () => void;
  setParams: (params: object) => void;
  canGoBack: () => boolean;
  reset: (state?: object) => void;
  dispatch: (action: never) => void;
  getParent: () => BusinessShellNavigation | undefined;
  /** The untouched navigator, for the rare call that must bypass the rewrite. */
  raw: BusinessShellNavigation;
}

/**
 * Navigation for the business shell's route wrappers.
 *
 * Every cross-stack hop goes through the parent tab navigator
 * (`navigate(tab, { screen })`), which is the only navigator that can see both
 * stacks. Without this, ~350 links, buttons, tabs and filters across the shell
 * resolved against a sibling stack and were silently discarded at runtime
 * (AGENTS rule 21).
 */
export function useBusinessNavigation(): BusinessNavigationHelpers {
  const navigation = useNavigation<BusinessShellNavigation>();

  // Read the business tab straight off the root stack's `BusinessTabs` route.
  // Walking up to the parent and reading its active route is the only version
  // that holds here: these wrappers sit inside per-tab nested stacks, so
  // `useNavigationState` would report the stack's own route (`BusinessOrdersHome`),
  // not the tab (`BusinessOrders`).
  const currentTab = useNavigationState(state => {
    if (!state?.routes) {
      return 'BusinessOverview' as BusinessTabRootName;
    }
    type RouteNode = {
      name?: string;
      index?: number;
      routes?: RouteNode[];
      state?: RouteNode;
    };
    let node: RouteNode | undefined = state as RouteNode | undefined;
    while (node?.routes) {
      const active: RouteNode | undefined = node.routes[node.index ?? 0];
      if (!active) {
        break;
      }
      if (active.name === 'BusinessTabs') {
        const businessState = active.state as
          { routes?: { name?: string }[]; index?: number } | undefined;
        const tabRoute = businessState?.routes?.[businessState.index ?? 0];
        return (tabRoute?.name ?? 'BusinessOverview') as BusinessTabRootName;
      }
      node = active.state ?? undefined;
    }
    return 'BusinessOverview' as BusinessTabRootName;
  });

  const navigate = useCallback<BusinessNavigationHelpers['navigate']>(
    ((screen: string, params?: object) => {
      if (TAB_SET.has(screen)) {
        (navigation.navigate as (a: string, b?: object) => void)(screen, params);
        return;
      }
      const tab = TAB_FOR_ROUTE.get(screen);
      if (!tab) {
        (navigation.navigate as (a: string, b?: object) => void)(screen, params);
        return;
      }
      // Same stack or already on the owning tab: navigate directly.
      if (tab === currentTab) {
        (navigation.navigate as (a: string, b?: object) => void)(screen, params);
        return;
      }
      // Sibling stack: hop through the parent tab navigator, which is the only
      // navigator that can see both. A NAVIGATE action never reaches siblings.
      (navigation.navigate as unknown as (a: string, b: object) => void)(tab, {
        screen,
        params,
      });
    }) as BusinessNavigationHelpers['navigate'],
    [currentTab, navigation],
  );

  const replace = useCallback<BusinessNavigationHelpers['replace']>(
    ((screen: string, params?: object) => {
      const tab = TAB_FOR_ROUTE.get(screen);
      if (!tab || tab === currentTab) {
        (navigation.replace as (a: string, b?: object) => void)(screen, params);
        return;
      }
      navigate(screen as never, params as never);
    }) as BusinessNavigationHelpers['replace'],
    [currentTab, navigate, navigation],
  );

  const push = useCallback<BusinessNavigationHelpers['push']>(
    ((screen: string, params?: object) => {
      if (TAB_FOR_ROUTE.has(screen)) {
        navigate(screen as never, params as never);
        return;
      }
      (navigation.push as (a: string, b?: object) => void)(screen, params);
    }) as BusinessNavigationHelpers['push'],
    [navigate, navigation],
  );

  return useMemo(
    () => ({
      navigate,
      push,
      replace,
      currentTab,
      // Cross-tab aware: returns to the screen the user actually navigated
      // from, even when that lives in another tab. Falls back to the navigator's
      // own goBack() when nothing is recorded (no history, or a unit test that
      // mounts the shell without the tracker).
      goBack: () => {
        if (!historyBack(navigation as never)) navigation.goBack();
      },
      setParams: params => navigation.setParams(params as never),
      canGoBack: () => navigation.canGoBack(),
      reset: state => navigation.reset(state as never),
      dispatch: action => navigation.dispatch(action),
      getParent: () => navigation.getParent() as never,
      raw: navigation,
    }),
    [currentTab, navigate, navigation, push, replace],
  );
}
