import React, { useState } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  useNavigation,
  useRoute,
  type CompositeNavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { strings } from '@constants/strings';
import { BusinessTabBar } from '@features/business/components/BusinessTabBar';
import { BusinessDashboardOverviewScreen } from '@features/business/screens/BusinessDashboardOverviewScreen';
import { BusinessOrdersHubScreen } from '@features/business/screens/BusinessOrdersHubScreen';
import { OrderDetailScreen } from '@features/business/screens/BusinessOrderDetailScreen';
import { BusinessBookingsHubScreen } from '@features/business/screens/BusinessBookingsHubScreen';
import { BusinessPosOrdersViewScreen } from '@features/business/screens/BusinessPosOrdersViewScreen';
import { BusinessMessagesHomeScreen } from '@features/business/screens/BusinessMessagesHomeScreen';
import { BusinessHubCentralManagementScreen } from '@features/business/screens/BusinessHubCentralManagementScreen';
import { BusinessMoreHubScreen } from '@features/business/screens/BusinessMoreHubScreen';
import { BusinessManagementHubScreen } from '@features/business/screens/BusinessManagementHubScreen';
import { BusinessProfilePreviewScreen } from '@features/business/screens/BusinessProfilePreviewScreen';
import { CentralDealsManagementScreen } from '@features/business/screens/CentralDealsManagementScreen';
import { DealDetailsPerformanceScreen } from '@features/business/screens/DealDetailsPerformanceScreen';
import { CreateDealLocationAssignmentScreen } from '@features/business/screens/CreateDealLocationAssignmentScreen';
import { DealLocationAssignmentPricingScreen } from '@features/business/screens/DealLocationAssignmentPricingScreen';
import { LocationAssignmentBranchPricingScreen } from '@features/business/screens/LocationAssignmentBranchPricingScreen';
import { BranchAvailabilityLocationPricingScreen } from '@features/business/screens/BranchAvailabilityLocationPricingScreen';
import { CentralCatalogueScreen } from '@features/business/screens/CentralCatalogueScreen';
import { ServicesCategoriesManagementScreen } from '@features/business/screens/ServicesCategoriesManagementScreen';
import { AddProductBasicsMediaScreen } from '@features/business/screens/AddProductBasicsMediaScreen';
import { LocationsBranchesScreen } from '@features/business/screens/LocationsBranchesScreen';
import { WuseBranchDetailsScreen } from '@features/business/screens/WuseBranchDetailsScreen';
import { CustomerCrmDirectoryScreen } from '@features/business/screens/CustomerCrmDirectoryScreen';
import { CustomerProfileDossierScreen } from '@features/business/screens/CustomerProfileDossierScreen';
import { LoyaltyProgrammeConfigurationScreen } from '@features/business/screens/LoyaltyProgrammeConfigurationScreen';
import { LoyaltyRewardsRulesScreen } from '@features/business/screens/LoyaltyRewardsRulesScreen';
import { StaffTeamAccessDirectoryScreen } from '@features/business/screens/StaffTeamAccessDirectoryScreen';
import { InviteStaffPermissionsScreen } from '@features/business/screens/InviteStaffPermissionsScreen';
import { CustomerIntelligenceAnalyticsScreen } from '@features/business/screens/CustomerIntelligenceAnalyticsScreen';
import { BusinessAnalyticsPerformanceScreen } from '@features/business/screens/BusinessAnalyticsPerformanceScreen';
import { LocationsBranchComparisonScreen } from '@features/business/screens/LocationsBranchComparisonScreen';
import { BusinessReviewsReputationScreen } from '@features/business/screens/BusinessReviewsReputationScreen';
import { CustomerDisplayOrderTotalScreen } from '@features/business/screens/CustomerDisplayOrderTotalScreen';
import { CustomerDisplayTapQrPayScreen } from '@features/business/screens/CustomerDisplayTapQrPayScreen';
import { CustomerDisplayTipRatingScreen } from '@features/business/screens/CustomerDisplayTipRatingScreen';
import { SplitTheBillScreen } from '@features/business/screens/SplitTheBillScreen';
import { DigitalEReceiptScreen } from '@features/business/screens/DigitalEReceiptScreen';
import { BusinessNotificationsCenterScreen } from '@features/business/screens/BusinessNotificationsCenterScreen';
import { BusinessSubscriptionBillingScreen } from '@features/business/screens/BusinessSubscriptionBillingScreen';
import { BusinessVerificationTrustScreen } from '@features/business/screens/BusinessVerificationTrustScreen';
import { BusinessSupportHelpScreen } from '@features/business/screens/BusinessSupportHelpScreen';
import { BusinessSettingsScreen } from '@features/business/screens/BusinessSettingsScreen';
import { SwitchToCustomerScreen } from '@features/business/screens/SwitchToCustomerScreen';
import { CampaignsHubScreen } from '@features/business/screens/CampaignsHubScreen';
import { CustomerSegmentsScreen } from '@features/business/screens/CustomerSegmentsScreen';
import { BoostEngineScreen } from '@features/business/screens/BoostEngineScreen';
import {
  BusinessAnalyticsVemtapIntelligenceScreen,
  CustomersAnalyticsVemtapIntelligenceScreen,
  DealsAnalyticsVemtapIntelligenceScreen,
  LocationsAnalyticsVemtapIntelligenceScreen,
  PosAnalyticsVemtapIntelligenceScreen,
  AnalyticsFilterSettingsSheet,
  ExportAnalyticsReportScreen,
  BoostGoalAudienceScreen,
  BoostBudgetScheduleScreen,
  BoostPreviewPaymentScreen,
  BoostPerformanceScreen,
  BoostWalletScreen,
  CampaignStep1ObjectiveScreen,
  CampaignStep2ContentScreen,
  CampaignStep3AudienceScreen,
  CampaignStep4ScheduleScreen,
  CampaignStep5BudgetScreen,
  CampaignStep6ReviewScreen,
  SegmentActionsSheet,
  CreateCustomSegmentScreen,
  SegmentAudienceDetailsScreen,
} from '@features/business/screens';
import { BusinessQrScreen } from '@features/business/screens/BusinessQrScreen';
import { LocationQrScreen } from '@features/business/screens/LocationQrScreen';
import { BusinessDiscoveryFeedScreen } from '@features/business/screens/BusinessDiscoveryFeedScreen';
import { BusinessMoreHubOperationsScreen } from '@features/business/screens/BusinessMoreHubOperationsScreen';
import { PosHomeOfflineModeScreen } from '@features/business/screens/PosHomeOfflineModeScreen';
import { PosBranchTillSwitcherScreen } from '@features/business/screens/PosBranchTillSwitcherScreen';
import { PosHomeSalesOperationsScreen } from '@features/business/screens/PosHomeSalesOperationsScreen';
import { PosNewSaleCatalogScreen } from '@features/business/screens/PosNewSaleCatalogScreen';
import { PosCurrentSaleCartScreen } from '@features/business/screens/PosCurrentSaleCartScreen';
import { PosTenderCheckoutScreen } from '@features/business/screens/PosTenderCheckoutScreen';
import { PosSaleCompletedScreen } from '@features/business/screens/PosSaleCompletedScreen';
import { PosReceiptCustomizationScreen } from '@features/business/screens/PosReceiptCustomizationScreen';
import { PosCustomerLookupActiveScreen } from '@features/business/screens/PosCustomerLookupActiveScreen';
import { PosCustomerLookupListScreen } from '@features/business/screens/PosCustomerLookupListScreen';
import { PosCustomerLookupLoyaltyScreen } from '@features/business/screens/PosCustomerLookupLoyaltyScreen';
import { PosCustomerDossierScreen } from '@features/business/screens/PosCustomerDossierScreen';
import { PosProductsInventoryScreen } from '@features/business/screens/PosProductsInventoryScreen';
import { PosProductShiftStockStatusScreen } from '@features/business/screens/PosProductShiftStockStatusScreen';
import { PosTransactionsLedgerShiftScreen } from '@features/business/screens/PosTransactionsLedgerShiftScreen';
import { PosTransactionsLedgerReceiptsScreen } from '@features/business/screens/PosTransactionsLedgerReceiptsScreen';
import { PosTransactionDetailsScreen } from '@features/business/screens/PosTransactionDetailsScreen';
import { PosOfflineCheckoutTerminalScreen } from '@features/business/screens/PosOfflineCheckoutTerminalScreen';
import { PosOfflineBufferQueueScreen } from '@features/business/screens/PosOfflineBufferQueueScreen';
import { PosSyncReconciliationScreen } from '@features/business/screens/PosSyncReconciliationScreen';
import { PublicPosOrderMenuScreen } from '@features/business/screens/PublicPosOrderMenuScreen';
import { PublicPosCartReviewScreen } from '@features/business/screens/PublicPosCartReviewScreen';
import { PublicPosOrderTrackingScreen } from '@features/business/screens/PublicPosOrderTrackingScreen';
import { MerchantPosKitchenStreamScreen } from '@features/business/screens/MerchantPosKitchenStreamScreen';
import { PosGeneralSettingsScreen } from '@features/business/screens/PosGeneralSettingsScreen';
import { PaymentHardwareSetupScreen } from '@features/business/screens/PaymentHardwareSetupScreen';
import { TaxesSurchargesScreen } from '@features/business/screens/TaxesSurchargesScreen';
import { StaffPermissionsPasscodesScreen } from '@features/business/screens/StaffPermissionsPasscodesScreen';
import { BusinessNetworkIntroHubScreen } from '@features/business/screens/BusinessNetworkIntroHubScreen';
import { MyBusinessNetworkScreen } from '@features/business/screens/MyBusinessNetworkScreen';
import { NetworkMilestonesScreen } from '@features/business/screens/NetworkMilestonesScreen';
import { BusinessNetworkInfoScreen } from '@features/business/screens/BusinessNetworkInfoScreen';
import { MyReferralsScreen } from '@features/business/screens/MyReferralsScreen';
import { ReferralDetailScreen } from '@features/business/screens/ReferralDetailScreen';
import { BusinessNetworkActiveDashboardScreen } from '@features/business/screens/BusinessNetworkActiveDashboardScreen';
import { InviteABusinessSheet } from '@features/business/screens/InviteABusinessSheet';
import { TypeDensityProvider } from '@theme/TypeDensityProvider';
import type {
  AppStackParamList,
  BusinessStackParamList,
  BusinessTabParamList,
  RootStackParamList,
} from './types';

/**
 * The business app lives inside AppStack, so tab routes need the AppStack prop and
 * root-level routes (the business onboarding flow) need the Root prop.
 */
type AppStackNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<BusinessTabParamList>,
  CompositeNavigationProp<
    NativeStackNavigationProp<AppStackParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

type OrdersStackNavigation = NativeStackNavigationProp<BusinessTabParamList>;
type MoreNavigation = NativeStackNavigationProp<BusinessStackParamList>;

/** More-hub rows: direct More-stack pushes, or a hop to a sibling tab stack. */
type MoreHubNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<BusinessStackParamList>,
  CompositeNavigationProp<
    BottomTabNavigationProp<BusinessTabParamList>,
    CompositeNavigationProp<
      NativeStackNavigationProp<AppStackParamList>,
      NativeStackNavigationProp<RootStackParamList>
    >
  >
>;

const Tab = createBottomTabNavigator<BusinessTabParamList>();
const OverviewStack = createNativeStackNavigator<BusinessTabParamList>();
const OrdersStack = createNativeStackNavigator<BusinessTabParamList>();
const MessagesStack = createNativeStackNavigator<BusinessTabParamList>();
const HubStack = createNativeStackNavigator<BusinessTabParamList>();
const MoreStack = createNativeStackNavigator<BusinessTabParamList>();

const stackOptions = { headerShown: false } as const;

function BusinessOverviewRoute() {
  const navigation = useNavigation<AppStackNavigation>();
  return (
    <BusinessDashboardOverviewScreen
      onOpenOrders={() =>
        navigation.navigate('BusinessTabs', { screen: 'BusinessOrders' })
      }
      onOpenMessages={() =>
        navigation.navigate('BusinessTabs', { screen: 'BusinessMessages' })
      }
      onManageLocations={() =>
        navigation.navigate('BusinessTabs', { screen: 'BusinessHub' })
      }
      onAddBranch={() => navigation.navigate('BusinessTabs', { screen: 'BusinessHub' })}
    />
  );
}

/**
 * Orders <-> Bookings switcher. Both surfaces live in the same stack, so the
 * switcher returns to the existing Orders screen instead of pushing a second
 * copy: `navigate` on a route already in the stack pops back to it.
 */
function BusinessOrdersSurfaceRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <BusinessOrdersHubScreen
      onOpenBookings={() => navigation.navigate('BusinessBookings')}
      onOpenPosOrders={() => navigation.navigate('BusinessPosOrders')}
      onOpenOrder={orderId =>
        navigation.navigate('BusinessOrderDetail', { orderId: orderId ?? 'vg-94021' })
      }
      onAcceptOrder={() => undefined}
      onSendToKitchen={() => undefined}
    />
  );
}

function BusinessOrderDetailRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <OrderDetailScreen
      onBack={navigation.goBack}
      onMarkProcessing={() => undefined}
      onMarkReady={() => undefined}
      onConfirmPayment={() => undefined}
      onAdjustRefund={() => undefined}
      onOpenChat={() => navigation.navigate('BusinessMessages')}
    />
  );
}

function BusinessBookingsRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <BusinessBookingsHubScreen
      // Returns to the Orders surface already sitting below in this stack, so
      // switching never pushes a duplicate screen. If Bookings was opened
      // directly (deep link) there is nothing to pop, so navigate instead.
      onOpenOrders={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('BusinessOrdersHome');
        }
      }}
      onCheckIn={() => undefined}
    />
  );
}

function BusinessPosOrdersRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <BusinessPosOrdersViewScreen
      onBack={navigation.goBack}
      // Opening a transaction hands the terminal over to the customer-facing
      // table display, which continues through payment, rating and receipt.
      onOpenOrder={() => navigation.navigate('CustomerDisplayOrder')}
      onPrintReceipt={() => navigation.navigate('DigitalEReceipt')}
    />
  );
}

function BusinessMessagesRoute() {
  const navigation = useNavigation<AppStackNavigation>();
  return (
    <BusinessMessagesHomeScreen
      onNewMessage={() =>
        navigation.navigate('BusinessTabs', { screen: 'BusinessMessages' })
      }
    />
  );
}

type HubNavigation = NativeStackNavigationProp<BusinessTabParamList>;

/** Every Business-tab module id resolves to exactly one destination. */
function BusinessHubRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <BusinessHubCentralManagementScreen
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
      onEditProfile={() => navigation.navigate('BusinessProfilePreview')}
      onOpenLocationSwitcher={() => navigation.navigate('BusinessManagementHub')}
    />
  );
}

function BusinessManagementHubRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <BusinessManagementHubScreen
      onNotifications={() => undefined}
      onChangeBranch={() => undefined}
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
  const navigation = useNavigation<HubNavigation>();
  return (
    <BusinessProfilePreviewScreen
      onBack={navigation.goBack}
      onMoreActions={() => undefined}
      onChangeCover={() => undefined}
      onEditAvatar={() => undefined}
      onPublicPreview={() => undefined}
      onPublicStorefront={() => undefined}
      onEditProfile={() => undefined}
      onManageContacts={() => undefined}
      onCopyValue={() => undefined}
      onAddSocial={() => undefined}
      onSaveChanges={navigation.goBack}
      onDiscardChanges={navigation.goBack}
    />
  );
}

function CentralDealsManagementRoute() {
  const navigation = useNavigation<HubNavigation>();
  const route = useRoute<RouteProp<BusinessTabParamList, 'CentralDealsManagement'>>();
  const layout = route.params?.layout ?? 'hero';
  return (
    <CentralDealsManagementScreen
      layout={layout}
      onNotifications={() => undefined}
      onCreateDeal={() => navigation.navigate('CreateDealLocationAssignment')}
      onSearch={() => undefined}
      onFilter={() => undefined}
      onChangeScope={() => undefined}
      onBoostDeal={() => undefined}
      onEditDeal={() => navigation.navigate('DealLocationAssignmentPricing')}
      onPauseDeal={() => undefined}
      onDealActions={() => undefined}
      onViewLedger={() => undefined}
      onOpenDeal={() => navigation.navigate('DealDetailsPerformance')}
    />
  );
}

function DealDetailsPerformanceRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <DealDetailsPerformanceScreen
      onBack={navigation.goBack}
      onMoreActions={() => undefined}
      onBoostDeal={() => undefined}
      onPause={() => undefined}
      onEdit={() => undefined}
      onEnd={() => undefined}
      onPreviewCustomerView={() => undefined}
      onEditLocationAssignment={() =>
        navigation.navigate('DealLocationAssignmentPricing')
      }
    />
  );
}

function CreateDealLocationAssignmentRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <CreateDealLocationAssignmentScreen
      onBack={navigation.goBack}
      onMoreActions={() => undefined}
      onReviewLaunch={navigation.goBack}
      onSaveDraft={navigation.goBack}
      onManageMerchantTier={() => undefined}
    />
  );
}

function DealLocationAssignmentPricingRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <DealLocationAssignmentPricingScreen
      onBack={navigation.goBack}
      onMoreActions={() => undefined}
      onSave={navigation.goBack}
      onCancel={navigation.goBack}
    />
  );
}

function ProductLocationAssignmentRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <LocationAssignmentBranchPricingScreen
      onBack={navigation.goBack}
      // Product step 3: branch availability + customer-facing location pricing.
      onSave={() => navigation.navigate('BranchAvailabilityLocationPricing')}
    />
  );
}

function BranchAvailabilityLocationPricingRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <BranchAvailabilityLocationPricingScreen
      onBack={navigation.goBack}
      onMoreActions={() => undefined}
      onSaveContinue={navigation.goBack}
    />
  );
}

function CentralCatalogueRoute() {
  const navigation = useNavigation<HubNavigation>();
  const route = useRoute<RouteProp<BusinessTabParamList, 'CentralCatalogue'>>();
  const layout = route.params?.layout ?? 'directory';
  return (
    <CentralCatalogueScreen
      layout={layout}
      onNotifications={() => undefined}
      onQuickSwitch={() => undefined}
      onSearch={() => undefined}
      onChangeScope={() => undefined}
      onAddProduct={() => navigation.navigate('AddProductBasicsMedia')}
      onAddService={() => navigation.navigate('ServicesCategories')}
      onEditItem={() => undefined}
      onToggleStock={() => undefined}
      onSheetAction={() => undefined}
    />
  );
}

function ServicesCategoriesRoute() {
  return (
    <ServicesCategoriesManagementScreen
      onNotifications={() => undefined}
      onAddService={() => undefined}
      onAddCategory={() => undefined}
      onEditService={() => undefined}
      onServiceAction={() => undefined}
      onEditCategory={() => undefined}
      onArchiveCategory={() => undefined}
      onReorderCategory={() => undefined}
    />
  );
}

function AddProductBasicsMediaRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <AddProductBasicsMediaScreen
      onBack={navigation.goBack}
      onContinue={() => navigation.navigate('ProductLocationAssignment')}
      onSaveDraft={navigation.goBack}
      onChangeCategory={() => undefined}
      onAddMedia={() => undefined}
    />
  );
}

function LocationsBranchesRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <LocationsBranchesScreen
      onNotifications={() => undefined}
      onAddLocation={() => undefined}
      onChangeScope={() => undefined}
      onViewDetails={() => navigation.navigate('WuseBranchDetails')}
      onEditLocation={() => undefined}
      onMoreBranchOptions={() => undefined}
      onCallBranch={() => undefined}
      onReactivate={() => undefined}
    />
  );
}

function WuseBranchDetailsRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <WuseBranchDetailsScreen
      onBack={navigation.goBack}
      onMoreActions={() => undefined}
      onEdit={() => undefined}
      onCallManager={() => undefined}
      onCopyCoordinates={() => undefined}
      onDirections={() => undefined}
      onOpenStat={() => undefined}
      onSwitchOperatingView={navigation.goBack}
      onConfirmDeactivate={navigation.goBack}
    />
  );
}

function CustomerCrmDirectoryRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <CustomerCrmDirectoryScreen
      onNotifications={() => undefined}
      onScanCode={() => undefined}
      onSearch={() => undefined}
      onFilter={() => undefined}
      onChangeScope={() => undefined}
      onExport={() => undefined}
      onMessageCustomer={() => undefined}
      onViewProfile={() => navigation.navigate('CustomerProfileDossier')}
      onOpenAnalytics={() => undefined}
    />
  );
}

function CustomerProfileDossierRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <CustomerProfileDossierScreen
      onBack={navigation.goBack}
      onMoreActions={() => undefined}
      onCall={() => undefined}
      onCopyEmail={() => undefined}
      onSendMessage={() => undefined}
      onCustomDeal={() => undefined}
      onLogVisit={() => undefined}
      onViewOrder={() => undefined}
      onViewVoucher={() => undefined}
      onAddNote={() => undefined}
    />
  );
}

function LoyaltyProgrammeRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <LoyaltyProgrammeConfigurationScreen
      onNotifications={() => undefined}
      onChangeBranch={() => undefined}
      onSave={() => undefined}
      onPreviewPass={() => undefined}
      onViewPass={() => undefined}
      onAddRule={() => undefined}
      onEditRule={() => navigation.navigate('LoyaltyRewards')}
    />
  );
}

function LoyaltyRewardsRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <LoyaltyRewardsRulesScreen
      onBack={navigation.goBack}
      onMoreActions={() => undefined}
      onEditRules={() => undefined}
      onTogglePause={() => undefined}
      onEditPolicies={() => undefined}
      onViewLedger={() => undefined}
    />
  );
}

function StaffDirectoryRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <StaffTeamAccessDirectoryScreen
      onNotifications={() => undefined}
      onChangeScope={() => undefined}
      onInvite={() => navigation.navigate('InviteStaff')}
      onOpenPermissions={() => navigation.navigate('InviteStaff')}
      onAssignBranch={() => undefined}
      onViewPayout={() => undefined}
      onResendInvite={() => undefined}
      onCancelInvite={() => undefined}
      onMoreMemberOptions={() => undefined}
    />
  );
}

function InviteStaffRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <InviteStaffPermissionsScreen
      onBack={navigation.goBack}
      onMoreActions={() => undefined}
      onSend={navigation.goBack}
      onCancel={navigation.goBack}
      onChangeBranch={() => undefined}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Analytics & intelligence routes (Business hub)                            */
/* -------------------------------------------------------------------------- */

function BusinessCustomerIntelligenceRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <CustomerIntelligenceAnalyticsScreen
      onBack={navigation.goBack}
      onMoreOptions={() => undefined}
      onOpenSegment={() => undefined}
      onOpenCustomer={() => navigation.navigate('CustomerCrmDirectory')}
      onViewAllCustomers={() => navigation.navigate('CustomerCrmDirectory')}
      onOpenLoyalty={() => navigation.navigate('LoyaltyProgramme')}
      onCreateDeal={() => navigation.navigate('CreateDealLocationAssignment')}
      onExport={() => undefined}
      onOpenLoyaltyProgramme={() => navigation.navigate('LoyaltyProgramme')}
      onOpenDeals={() => navigation.navigate('CentralDealsManagement')}
    />
  );
}

function BusinessPerformanceAnalyticsRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <BusinessAnalyticsPerformanceScreen
      onBack={navigation.goBack}
      onMoreOptions={() => undefined}
      onOpenTab={tabKey =>
        tabKey === 'customers'
          ? navigation.navigate('BusinessCustomerIntelligence')
          : tabKey === 'locations'
            ? navigation.navigate('BranchComparison')
            : undefined
      }
      onSwitchReport={() => undefined}
      onOpenItem={() => navigation.navigate('CentralCatalogue')}
      onOpenStaff={() => navigation.navigate('StaffDirectory')}
    />
  );
}

/**
 * `central_deals_management_2` — the flash-radar treatment. Separate destination
 * so it keeps its own back-stack entry; the screen component is shared.
 */
function DealsFlashRadarRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <CentralDealsManagementScreen
      layout="compact"
      onNotifications={() => undefined}
      onCreateDeal={() => navigation.navigate('CreateDealLocationAssignment')}
      onSearch={() => undefined}
      onFilter={() => undefined}
      onChangeScope={() => navigation.navigate('LocationsBranches')}
      onBoostDeal={() => navigation.navigate('CampaignsHub')}
      onEditDeal={() => navigation.navigate('DealLocationAssignmentPricing')}
      onPauseDeal={() => undefined}
      onDealActions={() => undefined}
      onViewLedger={() => undefined}
      onOpenDeal={() => navigation.navigate('DealDetailsPerformance')}
    />
  );
}

/** `central_deals_management_3` — the campaigns & deals treatment. */
function CampaignsDealsManagementRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <CentralDealsManagementScreen
      layout="discovery"
      onNotifications={() => undefined}
      onCreateDeal={() => navigation.navigate('CreateDealLocationAssignment')}
      onSearch={() => undefined}
      onFilter={() => undefined}
      onChangeScope={() => navigation.navigate('LocationsBranches')}
      onBoostDeal={() => navigation.navigate('CampaignsHub')}
      onEditDeal={() => navigation.navigate('DealLocationAssignmentPricing')}
      onPauseDeal={() => undefined}
      onDealActions={() => undefined}
      onViewLedger={() => undefined}
      onOpenDeal={() => navigation.navigate('DealDetailsPerformance')}
    />
  );
}

/** `central_products_services_catalogue_2` — the business-hub catalogue. */
function BusinessHubCatalogueRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <CentralCatalogueScreen
      layout="businessHub"
      onNotifications={() => undefined}
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

function BranchComparisonRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <LocationsBranchComparisonScreen
      onBack={navigation.goBack}
      onChangeBranchFilter={() => navigation.navigate('LocationsBranches')}
      onOpenBranch={() => navigation.navigate('WuseBranchDetails')}
      onExport={() => undefined}
    />
  );
}

function BusinessReviewsReputationRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <BusinessReviewsReputationScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onApplyFilter={() => undefined}
      onReply={() => undefined}
      onSendThankYouPerk={() => undefined}
      onExport={() => undefined}
      onConfigureRequests={() => undefined}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Customer display routes (POS stack)                                        */
/* -------------------------------------------------------------------------- */

function CustomerDisplayOrderRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <CustomerDisplayOrderTotalScreen
      onEditOrder={navigation.goBack}
      onSplitBill={() => navigation.navigate('SplitTheBill')}
      onAskStaff={() => undefined}
      onAddMoreItems={() => undefined}
    />
  );
}

function CustomerDisplayPaymentRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <CustomerDisplayTapQrPayScreen
      onBack={navigation.goBack}
      onChangeMethod={() => navigation.navigate('CustomerDisplayOrder')}
      onContactlessStarted={() => undefined}
      onQrScanned={() => navigation.navigate('CustomerDisplayRating')}
      onAskStaff={() => undefined}
    />
  );
}

function CustomerDisplayRatingRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <CustomerDisplayTipRatingScreen
      onBack={navigation.goBack}
      onSubmitRating={() => undefined}
      onSubmitTip={() => navigation.navigate('DigitalEReceipt')}
      onFinish={() => navigation.navigate('BusinessPosOrders')}
      onSkip={() => navigation.navigate('DigitalEReceipt')}
    />
  );
}

function SplitTheBillRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <SplitTheBillScreen
      onBack={navigation.goBack}
      onChangeMode={() => undefined}
      onAssignItem={() => undefined}
      onPayShare={() => navigation.navigate('CustomerDisplayPayment')}
    />
  );
}

function DigitalEReceiptRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <DigitalEReceiptScreen
      onBack={navigation.goBack}
      onShare={() => undefined}
      onSave={() => undefined}
      onRateAndTip={() => navigation.navigate('CustomerDisplayRating')}
      onOrderAgain={() => navigation.navigate('BusinessPosOrders')}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Account, trust & support routes (More stack)                               */
/* -------------------------------------------------------------------------- */

function BusinessNotificationsRoute() {
  const navigation = useNavigation<MoreNavigation>();
  return (
    <BusinessNotificationsCenterScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onMarkAllRead={() => undefined}
      onOpenCategory={() => undefined}
      onOpenNotification={() => undefined}
      onConfigureDispatch={() => undefined}
    />
  );
}

function BusinessSubscriptionBillingRoute() {
  const navigation = useNavigation<MoreNavigation>();
  return (
    <BusinessSubscriptionBillingScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onManagePlan={() => undefined}
      onCancelTier={() => undefined}
      onChangeCard={() => undefined}
      onAddFallback={() => undefined}
      onOpenAddOn={() => undefined}
      onBrowseAddOns={() => undefined}
      onDownloadInvoice={() => undefined}
    />
  );
}

function BusinessVerificationTrustRoute() {
  const navigation = useNavigation<MoreNavigation>();
  return (
    <BusinessVerificationTrustScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onOpenPillar={() => undefined}
      onOpenCertificate={() => undefined}
      onContactCompliance={() => undefined}
    />
  );
}

function BusinessSupportHelpRoute() {
  const navigation = useNavigation<MoreNavigation>();
  return (
    <BusinessSupportHelpScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onOpenChannel={() => undefined}
      onScheduleCall={() => undefined}
      onStartChat={() => undefined}
      onOpenCategory={() => undefined}
      onOpenArticle={() => undefined}
      onBookTechnician={() => undefined}
    />
  );
}

function BusinessSettingsRoute() {
  const navigation = useNavigation<MoreNavigation>();
  return (
    <BusinessSettingsScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onChangeBranch={() => undefined}
      onChangeHours={() => undefined}
      onOpenRow={() => undefined}
      onToggleRow={() => undefined}
    />
  );
}

function SwitchToCustomerRoute() {
  const navigation = useNavigation<MoreNavigation>();
  return (
    <SwitchToCustomerScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onConfirmSwitch={() =>
        navigation.getParent()?.navigate('Tabs', { screen: 'Account' })
      }
      onStayInBusiness={() => navigation.goBack()}
      onOpenDeal={() => undefined}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Growth & QR routes                                                         */
/* -------------------------------------------------------------------------- */

function CampaignsHubRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <CampaignsHubScreen
      onBack={navigation.goBack}
      onOpenNotifications={() => navigation.navigate('BusinessNotifications')}
      onCreateCampaign={() => navigation.navigate('CampaignCreateObjective')}
      onApplyFilter={() => undefined}
      onOpenSubTab={tabKey => {
        if (tabKey === 'Boost') navigation.navigate('BoostEngine');
        if (tabKey === 'Segments') navigation.navigate('CustomerSegments');
        if (tabKey === 'Insights') navigation.navigate('BusinessPerformanceAnalytics');
      }}
      onPauseCampaign={() => navigation.navigate('BoostPerformance')}
      onEditSetup={() => navigation.navigate('BoostGoalAudience')}
      onPreviewPush={() => navigation.navigate('BoostPreviewPayment')}
      onOpenRetentionPlaybook={() => navigation.navigate('CustomerSegments')}
      onExport={() => undefined}
      onViewCampaign={() => navigation.navigate('BoostPerformance')}
    />
  );
}

function CustomerSegmentsRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <CustomerSegmentsScreen
      onBack={navigation.goBack}
      onOpenNotifications={() => navigation.navigate('BusinessNotifications')}
      onNewSegment={() => navigation.navigate('CreateCustomSegment')}
      onOpenSubTab={tabKey => {
        if (tabKey === 'Boost') navigation.navigate('BoostEngine');
        if (tabKey === 'Campaigns') navigation.navigate('CampaignsHub');
        if (tabKey === 'Insights') navigation.navigate('BusinessPerformanceAnalytics');
      }}
      onChangeScope={() => undefined}
      onChangeWindow={() => undefined}
      onOpenSegment={() => navigation.navigate('SegmentAudienceDetails')}
      onRunSegmentAction={() => navigation.navigate('SegmentActions')}
      onConfigureMatrix={() => undefined}
      onSaveCohort={() => undefined}
      onOpenProfile={() => undefined}
    />
  );
}

function BoostEngineRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <BoostEngineScreen
      onBack={navigation.goBack}
      onOpenNotifications={() => navigation.navigate('BusinessNotifications')}
      onOpenSubTab={tabKey => {
        if (tabKey === 'Campaigns') navigation.navigate('CampaignsHub');
        if (tabKey === 'Segments') navigation.navigate('CustomerSegments');
        if (tabKey === 'Insights') navigation.navigate('BusinessPerformanceAnalytics');
      }}
      onChangeDeal={() => navigation.navigate('CentralDealsManagement')}
      onLaunch={() => navigation.navigate('BoostGoalAudience')}
      onViewHistory={() => navigation.navigate('BoostPerformance')}
      onClaimDeal={() => undefined}
      onOpenProfile={() => undefined}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* VEMTAP Intelligence routes                                                  */
/* -------------------------------------------------------------------------- */

/** Route → analytics tab key, so the shell's nav strip stays in sync. */
const analyticsTabByRoute: Record<string, string> = {
  BusinessAnalytics: 'business',
  CustomersAnalytics: 'customers',
  DealsAnalytics: 'deals',
  LocationsAnalytics: 'locations',
  PosAnalytics: 'pos',
};

function BusinessAnalyticsRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  const [filterOpen, setFilterOpen] = useState(false);
  const openExport = () => navigation.navigate('AnalyticsExportReport');
  return (
    <View className="flex-1">
      <BusinessAnalyticsVemtapIntelligenceScreen
        onBack={navigation.goBack}
        onMoreOptions={() => undefined}
        onOpenFilters={() => setFilterOpen(true)}
        onExport={openExport}
        onTabChange={tabKey => {
          const route = Object.keys(analyticsTabByRoute).find(
            key => analyticsTabByRoute[key] === tabKey,
          );
          if (route) navigation.navigate(route as never);
        }}
      />
      <AnalyticsFilterSettingsSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={() => undefined}
      />
    </View>
  );
}

function CustomersAnalyticsRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  const [filterOpen, setFilterOpen] = useState(false);
  return (
    <View className="flex-1">
      <CustomersAnalyticsVemtapIntelligenceScreen
        onBack={navigation.goBack}
        onMoreOptions={() => undefined}
        onOpenFilters={() => setFilterOpen(true)}
        onExport={() => navigation.navigate('AnalyticsExportReport')}
        onTabChange={tabKey => {
          const route = Object.keys(analyticsTabByRoute).find(
            key => analyticsTabByRoute[key] === tabKey,
          );
          if (route) navigation.navigate(route as never);
        }}
      />
      <AnalyticsFilterSettingsSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={() => undefined}
      />
    </View>
  );
}

function DealsAnalyticsRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  const [filterOpen, setFilterOpen] = useState(false);
  return (
    <View className="flex-1">
      <DealsAnalyticsVemtapIntelligenceScreen
        onBack={navigation.goBack}
        onMoreOptions={() => undefined}
        onOpenFilters={() => setFilterOpen(true)}
        onExport={() => navigation.navigate('AnalyticsExportReport')}
        onTabChange={tabKey => {
          const route = Object.keys(analyticsTabByRoute).find(
            key => analyticsTabByRoute[key] === tabKey,
          );
          if (route) navigation.navigate(route as never);
        }}
      />
      <AnalyticsFilterSettingsSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={() => undefined}
      />
    </View>
  );
}

function LocationsAnalyticsRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  const [filterOpen, setFilterOpen] = useState(false);
  return (
    <View className="flex-1">
      <LocationsAnalyticsVemtapIntelligenceScreen
        onBack={navigation.goBack}
        onMoreOptions={() => undefined}
        onOpenFilters={() => setFilterOpen(true)}
        onExport={() => navigation.navigate('AnalyticsExportReport')}
        onTabChange={tabKey => {
          const route = Object.keys(analyticsTabByRoute).find(
            key => analyticsTabByRoute[key] === tabKey,
          );
          if (route) navigation.navigate(route as never);
        }}
      />
      <AnalyticsFilterSettingsSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={() => undefined}
      />
    </View>
  );
}

function PosAnalyticsRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  const [filterOpen, setFilterOpen] = useState(false);
  return (
    <View className="flex-1">
      <PosAnalyticsVemtapIntelligenceScreen
        onBack={navigation.goBack}
        onMoreOptions={() => undefined}
        onOpenFilters={() => setFilterOpen(true)}
        onExport={() => navigation.navigate('AnalyticsExportReport')}
        onTabChange={tabKey => {
          const route = Object.keys(analyticsTabByRoute).find(
            key => analyticsTabByRoute[key] === tabKey,
          );
          if (route) navigation.navigate(route as never);
        }}
      />
      <AnalyticsFilterSettingsSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={() => undefined}
      />
    </View>
  );
}

function AnalyticsExportReportRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <ExportAnalyticsReportScreen onClose={navigation.goBack} onExport={() => undefined} />
  );
}

/* -------------------------------------------------------------------------- */
/* Boost routes                                                               */
/* -------------------------------------------------------------------------- */

function BoostGoalAudienceRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <BoostGoalAudienceScreen
      onBack={navigation.goBack}
      onHelp={() => navigation.navigate('BusinessSupportHelp')}
      onChangeAsset={() => navigation.navigate('CentralDealsManagement')}
      onContinue={selection =>
        navigation.navigate('BoostBudgetSchedule', {
          goalId: selection.goalId,
          audienceScope: selection.audienceScope,
          radiusKm: selection.radiusKm,
          placements: selection.placements,
        })
      }
    />
  );
}

function BoostBudgetScheduleRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <BoostBudgetScheduleScreen
      onBack={navigation.goBack}
      onEditSchedule={() => undefined}
      onContinue={selection =>
        navigation.navigate('BoostPreviewPayment', {
          budget: selection.budget,
          days: selection.days,
          dayparting: selection.dayparting,
        })
      }
    />
  );
}

function BoostPreviewPaymentRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <BoostPreviewPaymentScreen
      onBack={navigation.goBack}
      onEditParameters={() => undefined}
      onLaunch={() => navigation.replace('BoostPerformance')}
      onSaveDraft={() => navigation.navigate('BoostEngine')}
      onOpenWallet={() => navigation.navigate('BoostWallet')}
    />
  );
}

function BoostPerformanceRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <BoostPerformanceScreen
      onBack={navigation.goBack}
      onShare={() => navigation.navigate('AnalyticsExportReport')}
      onAddBudget={() => navigation.navigate('BoostBudgetSchedule')}
      onPause={() => undefined}
      onEndCampaign={() => undefined}
      onOpenWallet={() => navigation.navigate('BoostWallet')}
    />
  );
}

function BoostWalletRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <BoostWalletScreen
      onBack={navigation.goBack}
      onStatement={() => undefined}
      onFilterHistory={() => undefined}
      onViewLedger={() => undefined}
      onTopUp={() => undefined}
      onCopyAccount={() => undefined}
      onTaxInvoices={() => undefined}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Create Campaign wizard routes                                              */
/* -------------------------------------------------------------------------- */

function CampaignCreateObjectiveRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <CampaignStep1ObjectiveScreen
      onBack={navigation.goBack}
      onContinue={objectiveId =>
        navigation.navigate('CampaignCreateContent', { objectiveId })
      }
      onSaveDraft={() => navigation.navigate('CampaignsHub')}
    />
  );
}

function CampaignCreateContentRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  const route = useRoute<RouteProp<BusinessTabParamList, 'CampaignCreateContent'>>();
  return (
    <CampaignStep2ContentScreen
      onBack={navigation.goBack}
      onContinue={assetIds =>
        navigation.navigate('CampaignCreateAudience', {
          objectiveId: route.params?.objectiveId,
          assetIds,
        })
      }
      onSaveDraft={() => navigation.navigate('CampaignsHub')}
    />
  );
}

function CampaignCreateAudienceRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  const route = useRoute<RouteProp<BusinessTabParamList, 'CampaignCreateAudience'>>();
  const { objectiveId, assetIds, segmentId } = route.params ?? {};
  return (
    <CampaignStep3AudienceScreen
      onBack={navigation.goBack}
      presetSegmentId={segmentId}
      onContinue={selection =>
        navigation.navigate('CampaignCreateSchedule', {
          objectiveId,
          assetIds,
          segmentId,
          radius: selection.radius,
        })
      }
    />
  );
}

function CampaignCreateScheduleRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  const route = useRoute<RouteProp<BusinessTabParamList, 'CampaignCreateSchedule'>>();
  const { objectiveId, assetIds, segmentId, radius } = route.params ?? {};
  return (
    <CampaignStep4ScheduleScreen
      onBack={navigation.goBack}
      onContinue={schedule =>
        navigation.navigate('CampaignCreateBudget', {
          objectiveId,
          assetIds,
          segmentId,
          radius,
          durationDays: schedule.durationDays,
        })
      }
    />
  );
}

function CampaignCreateBudgetRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  const route = useRoute<RouteProp<BusinessTabParamList, 'CampaignCreateBudget'>>();
  const { objectiveId, assetIds, segmentId, radius, durationDays } = route.params ?? {};
  return (
    <CampaignStep5BudgetScreen
      onBack={navigation.goBack}
      initialDays={durationDays}
      onContinue={budget =>
        navigation.navigate('CampaignReviewLaunch', {
          objectiveId,
          assetIds,
          segmentId,
          radius,
          total: budget.total,
          daily: budget.daily,
          durationDays,
        })
      }
    />
  );
}

function CampaignReviewLaunchRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  const route = useRoute<RouteProp<BusinessTabParamList, 'CampaignReviewLaunch'>>();
  const params = route.params ?? {};
  return (
    <CampaignStep6ReviewScreen
      onBack={navigation.goBack}
      onLaunch={() => navigation.replace('CampaignsHub')}
      onSaveDraft={() => navigation.navigate('CampaignsHub')}
      objectiveId={params.objectiveId}
      objectiveTitle={
        params.objectiveTitle ??
        strings.campaignWizard.step1.objectives.find(
          option => option.id === params.objectiveId,
        )?.title
      }
      radiusLabel={
        params.radius
          ? `${params.radius} km around Flagship`
          : `${strings.campaignWizard.step3.radii[1].label} around Flagship`
      }
      totalLabel={params.total ? `₦${params.total.toLocaleString('en-NG')}` : undefined}
      dailyLabel={
        params.daily ? `₦${params.daily.toLocaleString('en-NG')} / active day` : undefined
      }
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Segment routes                                                             */
/* -------------------------------------------------------------------------- */

function SegmentActionsRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  const route = useRoute<RouteProp<BusinessTabParamList, 'SegmentActions'>>();
  return (
    <SegmentActionsSheet
      visible
      segmentName={route.params?.segmentName}
      onClose={navigation.goBack}
      onCreateCampaign={segmentId =>
        navigation.replace('CampaignCreateAudience', { segmentId })
      }
      onComposeMessage={() => navigation.navigate('BusinessMessagesHome')}
      onPromoteDeal={() => navigation.navigate('CentralDealsManagement')}
      onOpenCrm={() => navigation.navigate('CustomerCrmDirectory')}
    />
  );
}

function CreateCustomSegmentRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <CreateCustomSegmentScreen
      onClose={navigation.goBack}
      onCancel={navigation.goBack}
      onSave={() => navigation.replace('CustomerSegments')}
    />
  );
}

function SegmentAudienceDetailsRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <SegmentAudienceDetailsScreen
      onClose={navigation.goBack}
      onUseSegment={() => navigation.navigate('SegmentActions')}
      onEditRules={() => navigation.navigate('CreateCustomSegment')}
      onOpenCustomer={() => navigation.navigate('CustomerProfileDossier')}
      onOpenCrm={() => navigation.navigate('CustomerCrmDirectory')}
    />
  );
}

function BusinessQrRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <BusinessQrScreen
      onBack={navigation.goBack}
      onOpenNotifications={() => navigation.navigate('BusinessNotifications')}
      onOpenSubTab={tabKey => {
        if (tabKey === 'Analytics') navigation.navigate('BusinessPerformanceAnalytics');
        if (tabKey === 'Hub') navigation.navigate('BusinessDiscoveryFeed');
      }}
      onShare={() => undefined}
      onDownloadKit={() => undefined}
      onOrderStandee={() => undefined}
      onSendToSocials={() => undefined}
      onCopyCode={() => undefined}
      onSelectRouting={() => undefined}
      onCustomizeStandee={() => undefined}
      onOpenLocationQrs={() => navigation.navigate('LocationQr')}
      onOpenProfile={() => undefined}
    />
  );
}

function LocationQrRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <LocationQrScreen
      onBack={navigation.goBack}
      onOpenNotifications={() => navigation.navigate('BusinessNotifications')}
      onOpenSubTab={tabKey => {
        if (tabKey === 'Analytics') navigation.navigate('BusinessPerformanceAnalytics');
        if (tabKey === 'Hub') navigation.navigate('BusinessDiscoveryFeed');
      }}
      onNewPoint={() => undefined}
      onFilterBranch={() => undefined}
      onOpenPoint={() => undefined}
      onViewTag={() => undefined}
      onPrintSticker={() => undefined}
      onShare={() => undefined}
      onSavePng={() => undefined}
      onExportAll={() => undefined}
      onOrderAcrylics={() => undefined}
      onOpenRule={() => undefined}
      onOpenProfile={() => undefined}
    />
  );
}

function BusinessDiscoveryFeedRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <BusinessDiscoveryFeedScreen
      onBack={navigation.goBack}
      onOpenNotifications={() => navigation.navigate('BusinessNotifications')}
      onOpenSubTab={tabKey => {
        if (tabKey === 'Campaigns') navigation.navigate('CampaignsHub');
        if (tabKey === 'QR & Tap') navigation.navigate('BusinessQr');
        if (tabKey === 'Analytics') navigation.navigate('BusinessPerformanceAnalytics');
      }}
      onPreviewConsumerFeed={() => undefined}
      onEditFeedCard={() => undefined}
      onOpenIndexRow={() => undefined}
      onToggleControl={() => undefined}
      onOpenZone={() => undefined}
      onBoostFeed={() => navigation.navigate('BoostEngine')}
      onOpenProfile={() => undefined}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Business Network routes                                                    */
/* -------------------------------------------------------------------------- */

function BusinessNetworkIntroHubRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <BusinessNetworkIntroHubScreen
      onBack={navigation.goBack}
      onOpenHelp={() => navigation.navigate('BusinessSupportHelp')}
      onOpenProfile={() => undefined}
      onOpenSubTab={tabKey => {
        if (tabKey === 'Boost') navigation.navigate('BoostEngine');
        if (tabKey === 'Campaigns') navigation.navigate('CampaignsHub');
        if (tabKey === 'Segments') navigation.navigate('CustomerSegments');
      }}
      onGetReferralLink={() => navigation.navigate('MyBusinessNetwork')}
      onReadMore={() => navigation.navigate('BusinessNetworkInfo')}
      onOpenNearby={() => undefined}
    />
  );
}

function MyBusinessNetworkRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  const [inviteOpen, setInviteOpen] = useState(false);
  return (
    <>
      <MyBusinessNetworkScreen
        onBack={navigation.goBack}
        onOpenSearch={() => undefined}
        onOpenProfile={() => undefined}
        onOpenSubTab={tabKey => {
          if (tabKey === 'Deals') navigation.navigate('CentralDealsManagement');
          if (tabKey === 'Manage') navigation.navigate('MyReferrals');
        }}
        onCopyLink={() => undefined}
        onShareLink={() => setInviteOpen(true)}
        onQuickShare={() => setInviteOpen(true)}
        onScan={() => undefined}
        onOpenMilestones={() => navigation.navigate('NetworkMilestones')}
        onOpenPartner={() => navigation.navigate('MyReferrals')}
        onViewAllPartners={() => navigation.navigate('MyReferrals')}
        onOpenHowItWorks={() => navigation.navigate('BusinessNetworkInfo')}
      />
      <InviteABusinessSheet
        visible={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onCopyMessage={() => undefined}
        onCopyLink={() => undefined}
        onShareDevice={() => undefined}
        onShareChannel={() => undefined}
      />
    </>
  );
}

function NetworkMilestonesRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <NetworkMilestonesScreen
      onBack={navigation.goBack}
      onOpenInfo={() => navigation.navigate('BusinessNetworkInfo')}
      onOpenProfile={() => undefined}
      onOpenSubTab={tabKey => {
        if (tabKey === 'Network') navigation.navigate('BusinessNetworkDashboard');
        if (tabKey === 'Partners') navigation.navigate('MyReferrals');
      }}
      onOpenMilestone={() => undefined}
    />
  );
}

function BusinessNetworkInfoRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <BusinessNetworkInfoScreen
      onBack={navigation.goBack}
      onOpenHelp={() => navigation.navigate('BusinessSupportHelp')}
      onOpenProfile={() => undefined}
      onOpenStep={() => undefined}
      onGetLink={() => navigation.navigate('MyBusinessNetwork')}
      onBackToNetwork={() => navigation.goBack()}
    />
  );
}

function MyReferralsRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  const [inviteOpen, setInviteOpen] = useState(false);
  return (
    <>
      <MyReferralsScreen
        onBack={navigation.goBack}
        onOpenFilter={() => undefined}
        onOpenProfile={() => undefined}
        onApplyFilter={() => undefined}
        onSearch={() => undefined}
        onOpenReferral={referralId =>
          navigation.navigate('ReferralDetail', { referralId })
        }
        onInvite={() => setInviteOpen(true)}
      />
      <InviteABusinessSheet
        visible={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onCopyMessage={() => undefined}
        onCopyLink={() => undefined}
        onShareDevice={() => undefined}
        onShareChannel={() => undefined}
      />
    </>
  );
}

function ReferralDetailRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  const route = useRoute<RouteProp<BusinessTabParamList, 'ReferralDetail'>>();
  return (
    <ReferralDetailScreen
      referralId={route.params?.referralId}
      onBack={navigation.goBack}
      onShare={() => undefined}
      onMoreOptions={() => undefined}
      onSendMessage={() => navigation.navigate('BusinessMessages')}
      onViewBusiness={() =>
        navigation.navigate('BusinessHub', { screen: 'BusinessHubHome' })
      }
    />
  );
}

function BusinessNetworkDashboardRoute() {
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <BusinessNetworkActiveDashboardScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onOpenSubTab={tabKey => {
        if (tabKey === 'Promos') navigation.navigate('CampaignsHub');
        if (tabKey === 'Partners') navigation.navigate('MyReferrals');
        if (tabKey === 'Analytics') navigation.navigate('BusinessPerformanceAnalytics');
      }}
      onShareLink={() => navigation.navigate('MyBusinessNetwork')}
      onOpenConnection={referralId =>
        navigation.navigate('ReferralDetail', { referralId })
      }
      onViewAllReferrals={() => navigation.navigate('MyReferrals')}
      onOpenMilestones={() => navigation.navigate('NetworkMilestones')}
      onOpenHowItWorks={() => navigation.navigate('BusinessNetworkInfo')}
    />
  );
}

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
function BusinessMoreHubOperationsRoute() {
  const navigation = useNavigation<MoreHubNavigation>();

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
      onBack={navigation.goBack}
      onOpenNotifications={() => navigation.navigate('BusinessNotifications')}
      onOpenProfile={() => undefined}
      onOpenPosTile={goToPosTile}
      onOpenRow={goToRow}
      onSwitchToCustomer={() => navigation.navigate('SwitchToCustomer')}
      onSignOut={() => undefined}
    />
  );
}

/** `pos_home_offline_mode_active` — the local till running without a network. */
function PosHomeOfflineModeRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosHomeOfflineModeScreen
      onBack={navigation.goBack}
      onChangeBranch={() => navigation.navigate('LocationsBranches')}
      onOpenProfile={() => undefined}
      onOpenSettings={() => navigation.navigate('BusinessSettings')}
      onRetrySync={() => undefined}
      onOpenAction={actionId => {
        // While offline the register must stay local, so a new sale opens the
        // encrypted checkout terminal rather than the networked display.
        if (actionId === 'new-sale') navigation.navigate('PosOfflineCheckoutTerminal');
        if (actionId === 'transactions')
          navigation.navigate('PosTransactionsLedgerShift');
        if (actionId === 'customers') navigation.navigate('CustomerCrmDirectory');
        if (actionId === 'products') navigation.navigate('CentralCatalogue');
      }}
      onOpenCustomerDisplay={() => navigation.navigate('CustomerDisplayOrder')}
      onOpenDrawer={() => undefined}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* POS sale-flow routes                                                       */
/* -------------------------------------------------------------------------- */

function PosBranchTillSwitcherRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosBranchTillSwitcherScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onSelectTill={() => undefined}
      onSwitchBranch={() => undefined}
      onConfirmSwitch={() => navigation.goBack()}
      onCancel={() => navigation.goBack()}
    />
  );
}

function PosHomeSalesOperationsRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosHomeSalesOperationsScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onOpenSettings={() => navigation.navigate('PosGeneralSettings')}
      onSelectBranch={() => navigation.navigate('PosBranchTillSwitcher')}
      onSyncCheck={() => undefined}
      // The register's quick actions target the same till surfaces the
      // operations hub exposes, not the central directory/catalogue.
      onQuickAction={actionId => {
        if (actionId === 'new-sale') navigation.navigate('PosNewSaleCatalog');
        if (actionId === 'transactions')
          navigation.navigate('PosTransactionsLedgerShift');
        if (actionId === 'customers') navigation.navigate('PosCustomerLookupList');
        if (actionId === 'products') navigation.navigate('PosProductsInventory');
      }}
      onOpenDrawer={() => navigation.navigate('BusinessPosOrders')}
      onOpenControl={controlId => {
        if (controlId === 'public-mode') navigation.navigate('PublicPosOrderMenu');
        if (controlId === 'drawer') navigation.navigate('BusinessPosOrders');
        if (controlId === 'offline') navigation.navigate('PosHomeOfflineMode');
        if (controlId === 'offline-sale')
          navigation.navigate('PosOfflineCheckoutTerminal');
        if (controlId === 'sync') navigation.navigate('PosSyncReconciliation');
        if (controlId === 'cash-drawer') navigation.navigate('BusinessPosOrders');
        if (controlId === 'settings') navigation.navigate('PosReceiptCustomization');
      }}
    />
  );
}

function PosNewSaleCatalogRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosNewSaleCatalogScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onSearch={() => undefined}
      onScan={() => undefined}
      onDialpad={() => undefined}
      onFilterCategory={() => undefined}
      onAddItem={() => navigation.navigate('PosCurrentSaleCart')}
      onAddCustomItem={() => navigation.navigate('PosCurrentSaleCart')}
      onOpenCustomer={() => navigation.navigate('CustomerCrmDirectory')}
      onCharge={() => navigation.navigate('PosCurrentSaleCart')}
    />
  );
}

function PosCurrentSaleCartRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosCurrentSaleCartScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      // Changing the customer on a running ticket is the active-checkout match
      // flow, not the directory browse.
      onChangeCustomer={() => navigation.navigate('PosCustomerLookupActive')}
      onReorder={() => navigation.navigate('PosNewSaleCatalog')}
      onChangeQty={() => undefined}
      onRemoveLine={() => undefined}
      onAddKitchenNote={() => undefined}
      onAddDiscount={() => undefined}
      onHold={() => undefined}
      onCharge={() => navigation.navigate('PosTenderCheckout')}
    />
  );
}

function PosTenderCheckoutRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosTenderCheckoutScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onApplyPoints={() => undefined}
      onSelectTender={() => undefined}
      onCashPreset={() => undefined}
      onSwitchTerminal={() => undefined}
      onResendTransfer={() => undefined}
      onCheckInflow={() => undefined}
      onCopyAccount={() => undefined}
      onApplyVoucher={() => undefined}
      onScanVoucher={() => undefined}
      onReceiptOption={() => navigation.navigate('PosSaleCompleted')}
      onCompleteSale={() => navigation.navigate('PosSaleCompleted')}
    />
  );
}

function PosSaleCompletedRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosSaleCompletedScreen
      onOpenProfile={() => undefined}
      onPrint={() => navigation.navigate('PosReceiptCustomization')}
      onSendToMobile={() => undefined}
      onNewSale={() => navigation.navigate('PosNewSaleCatalog')}
    />
  );
}

function PosReceiptCustomizationRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosReceiptCustomizationScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onToggleSetting={() => undefined}
      onEditReceipt={() => undefined}
      onPrintTest={() => undefined}
    />
  );
}

function PosCustomerLookupActiveRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosCustomerLookupActiveScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onSearch={() => undefined}
      onClearSearch={() => undefined}
      onScan={() => navigation.navigate('PosCustomerLookupLoyalty')}
      onLiveScan={() => navigation.navigate('PosCustomerLookupLoyalty')}
      onNewWalkInProfile={() => navigation.navigate('CustomerCrmDirectory')}
      onApplyPerk={() => undefined}
      onAttach={() => navigation.navigate('PosTenderCheckout')}
      onViewReceipts={() => navigation.navigate('DigitalEReceipt')}
      onSendWhatsApp={() => navigation.navigate('BusinessMessages')}
    />
  );
}

function PosCustomerLookupListRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosCustomerLookupListScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onSelectBranch={() => navigation.navigate('PosBranchTillSwitcher')}
      onSyncRegister={() => undefined}
      onOpenCrmHub={() => navigation.navigate('CustomerCrmDirectory')}
      onSearch={() => undefined}
      onScan={() => navigation.navigate('PosCustomerLookupLoyalty')}
      onNewCustomer={() => navigation.navigate('CustomerCrmDirectory')}
      onSelectSegment={() => undefined}
      onAttach={customerId =>
        customerId === 'michael'
          ? navigation.navigate('PosCustomerLookupLoyalty')
          : navigation.navigate('PosCustomerDossier', { customerId })
      }
      onOpenDossier={customerId =>
        navigation.navigate('PosCustomerDossier', { customerId })
      }
      onOpenOverflow={() => undefined}
    />
  );
}

function PosCustomerLookupLoyaltyRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosCustomerLookupLoyaltyScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onSearch={() => undefined}
      onScan={() => undefined}
      onChangeCustomer={() => navigation.navigate('PosCustomerLookupList')}
      onOpenRewards={() => navigation.navigate('LoyaltyProgramme')}
      onRedeem={() => navigation.navigate('PosTenderCheckout')}
      onRegisterCustomer={() => navigation.navigate('CustomerCrmDirectory')}
      onContinueAsGuest={() => navigation.navigate('PosTenderCheckout')}
      onAttach={() => navigation.navigate('PosTenderCheckout')}
    />
  );
}

function PosCustomerDossierRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosCustomerDossierScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onAttachToSale={() => navigation.navigate('PosTenderCheckout')}
      onApplyPerk={() => undefined}
      onOpenNotes={() => undefined}
      onOpenVisit={() => navigation.navigate('BusinessPosOrders')}
      onOpenCrm={() => navigation.navigate('CustomerCrmDirectory')}
    />
  );
}

function PosProductsInventoryRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosProductsInventoryScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onOpenNotifications={() => undefined}
      onSearch={() => undefined}
      onScan={() => undefined}
      onSelectFilter={() => undefined}
      onAdjustStock={() => undefined}
      onOpenOverride={() => undefined}
      onOpenDeal={() =>
        navigation.navigate('CentralDealsManagement', { layout: 'compact' })
      }
      onOpenDealTerms={() =>
        navigation.navigate('CentralDealsManagement', { layout: 'compact' })
      }
      // The full add-product wizard lives in the BusinessSetup root stack, which a
      // nested Orders screen cannot address; hand off to the catalogue instead.
      onAddCustomItem={() =>
        navigation.navigate('CentralCatalogue', { layout: 'directory' })
      }
      onAuthorize={() => undefined}
    />
  );
}

function PosProductShiftStockStatusRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosProductShiftStockStatusScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onToggleRegisterAvailability={() => undefined}
      onMarkSoldOut={() => undefined}
      onAdjustCount={() => undefined}
      onOpenSetCount={() => undefined}
      onOpenGovernance={() => navigation.navigate('CentralCatalogue')}
      onAddToSale={() => navigation.navigate('PosCurrentSaleCart')}
      onSave={() => undefined}
    />
  );
}

function PosTransactionsLedgerShiftRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosTransactionsLedgerShiftScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onOpenNotifications={() => undefined}
      onOpenScope={() => navigation.navigate('PosBranchTillSwitcher')}
      onSearch={() => undefined}
      onSelectFilter={() => undefined}
      onReprint={() => navigation.navigate('PosReceiptCustomization')}
      onOpenDetails={() => navigation.navigate('PosTransactionDetails')}
      onVoid={() => navigation.navigate('PosTransactionDetails')}
      onOpenReceipt={() => navigation.navigate('PosTransactionDetails')}
      onOpenSplits={() => navigation.navigate('BusinessPosOrders')}
      onResumeTicket={() => navigation.navigate('PosCurrentSaleCart')}
      onExportShift={() => undefined}
      onOpenZReport={() => navigation.navigate('PosSyncReconciliation')}
    />
  );
}

function PosTransactionsLedgerReceiptsRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosTransactionsLedgerReceiptsScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onSelectBranch={() => navigation.navigate('PosBranchTillSwitcher')}
      onSyncLedger={() => navigation.navigate('PosSyncReconciliation')}
      onSearch={() => undefined}
      onSelectDate={() => undefined}
      onSelectShift={() => navigation.navigate('PosBranchTillSwitcher')}
      onExport={() => undefined}
      onSelectFilter={() => undefined}
      onOpenReceipt={() => navigation.navigate('PosTransactionDetails')}
      onOpenCustomer={() => navigation.navigate('PosCustomerLookupList')}
    />
  );
}

function PosTransactionDetailsRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosTransactionDetailsScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onCopyReference={() => undefined}
      onOpenPatron={() => navigation.navigate('PosCustomerDossier')}
      onOpenPoints={() => navigation.navigate('LoyaltyProgramme')}
      onPrint={() => navigation.navigate('PosReceiptCustomization')}
      onShare={() => navigation.navigate('BusinessMessages')}
      onViewEReceipt={() => navigation.navigate('DigitalEReceipt')}
      onOpenRefund={() => undefined}
      onConfirmVoid={() => undefined}
    />
  );
}

function PosOfflineCheckoutTerminalRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosOfflineCheckoutTerminalScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onSearch={() => undefined}
      onScan={() => undefined}
      onReindex={() => undefined}
      onAttachPatron={() => navigation.navigate('PosCustomerLookupList')}
      onSelectCashTender={() => undefined}
      onEnterExternalRef={() => undefined}
      onOpenHouseTab={() => navigation.navigate('BusinessPosOrders')}
      onCompleteSale={() => navigation.navigate('PosOfflineBufferQueue')}
      onOpenQueue={() => navigation.navigate('PosOfflineBufferQueue')}
    />
  );
}

function PosOfflineBufferQueueRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosOfflineBufferQueueScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onSelectFilter={() => undefined}
      onOpenSale={() => navigation.navigate('PosTransactionDetails')}
      onPrintTape={() => navigation.navigate('PosReceiptCustomization')}
      onExportBackup={() => undefined}
      onReturnToRegister={() => navigation.navigate('PosOfflineCheckoutTerminal')}
    />
  );
}

function PosSyncReconciliationRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PosSyncReconciliationScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onForceSync={() => undefined}
      onAcceptLocalSale={() => navigation.navigate('PosProductsInventory')}
      onCustomLineItem={() =>
        navigation.navigate('CentralCatalogue', { layout: 'directory' })
      }
      onOpenDetails={() => navigation.navigate('PosTransactionDetails')}
      onDownloadCsv={() => undefined}
    />
  );
}

function PublicPosOrderMenuRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PublicPosOrderMenuScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onOpenCart={() => navigation.navigate('PublicPosCartReview')}
      onShare={() => navigation.navigate('BusinessMessages')}
      onChangeTable={() => navigation.navigate('PosBranchTillSwitcher')}
      onSearch={() => undefined}
      onOpenFilters={() => undefined}
      onSelectCategory={() => undefined}
      onCustomize={() => undefined}
      onAddItem={() => navigation.navigate('PublicPosCartReview')}
      onReviewOrder={() => navigation.navigate('PublicPosCartReview')}
    />
  );
}

function PublicPosCartReviewRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PublicPosCartReviewScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onAddFood={() => navigation.navigate('PublicPosOrderMenu')}
      onChangeQty={() => undefined}
      onRemoveLine={() => undefined}
      onEditName={() => undefined}
      onEditPhone={() => undefined}
      onEditInstructions={() => undefined}
      onSubmitOrder={() => navigation.navigate('PublicPosOrderTracking')}
    />
  );
}

function PublicPosOrderTrackingRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PublicPosOrderTrackingScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onOpenOrderSummary={() => navigation.navigate('PublicPosCartReview')}
      onCallWaiter={() => undefined}
      onReopenMenu={() => navigation.navigate('PublicPosOrderMenu')}
    />
  );
}

function MerchantPosKitchenStreamRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <MerchantPosKitchenStreamScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onSelectTab={() => undefined}
      onCallGuest={() => navigation.navigate('BusinessMessages')}
      onAcceptOrder={() => navigation.navigate('PublicPosOrderTracking')}
      onPrintChit={() => navigation.navigate('PosReceiptCustomization')}
      onRejectOrder={() => undefined}
      onMarkReady={() => undefined}
      onReturnToRegister={() => navigation.navigate('PosNewSaleCatalog')}
    />
  );
}

function PosGeneralSettingsRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  // The settings hub is a pure directory: each row owns its own destination.
  // Written per branch rather than looked up from a map, so TypeScript verifies
  // every (row, screen) pairing at the call site.
  const openSetting = (settingId: string) => {
    switch (settingId) {
      case 'receipt':
        navigation.navigate('PosReceiptCustomization');
        break;
      case 'printers':
      case 'scanner':
      case 'payments':
        navigation.navigate('PaymentHardwareSetup');
        break;
      case 'taxes':
        navigation.navigate('TaxesSurcharges');
        break;
      case 'public-pos':
        navigation.navigate('PublicPosOrderMenu');
        break;
      case 'offline':
        navigation.navigate('PosSyncReconciliation');
        break;
      case 'workflow':
        navigation.navigate('MerchantPosKitchenStream');
        break;
      case 'security':
        navigation.navigate('StaffPermissionsPasscodes');
        break;
      default:
        break;
    }
  };
  return (
    <PosGeneralSettingsScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onSyncNow={() => navigation.navigate('PosSyncReconciliation')}
      onOpenSetting={openSetting}
      onTestFeed={() => navigation.navigate('PaymentHardwareSetup')}
      onOpenTill={() => navigation.navigate('PosBranchTillSwitcher')}
    />
  );
}

function PaymentHardwareSetupRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <PaymentHardwareSetupScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onToggleRail={() => undefined}
      onSelectRailAction={railId =>
        railId === 'card' ? navigation.navigate('PosTenderCheckout') : undefined
      }
      onTestFeed={() => navigation.navigate('PosReceiptCustomization')}
      onTestDrawer={() => navigation.navigate('PosBranchTillSwitcher')}
      onPairPrinter={() => undefined}
      onToggleFallbackScanner={() => undefined}
      onSave={() => undefined}
    />
  );
}

function TaxesSurchargesRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <TaxesSurchargesScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onSelectPriceApplication={() => undefined}
      onToggleExemption={() => undefined}
      onCopyTin={() => undefined}
      onToggleServiceWaiver={() => undefined}
      onTogglePackagingAuto={() => undefined}
      onToggleSelfOrdering={() => undefined}
      onToggleRushPause={() => undefined}
      onApply={() => navigation.navigate('PosProductsInventory')}
    />
  );
}

function StaffPermissionsPasscodesRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <StaffPermissionsPasscodesScreen
      onBack={navigation.goBack}
      onOpenProfile={() => undefined}
      onToggleGuard={() => undefined}
      onAddSupervisorPin={() => undefined}
      onEditSupervisorPin={() => navigation.navigate('StaffDirectory')}
      onToggleControl={() => undefined}
      onOpenAuditLog={() => navigation.navigate('PosTransactionDetails')}
      onSave={() => undefined}
    />
  );
}

function BusinessMoreRoute() {
  // Direct More-stack navigation for the account/trust/support screens, and a
  // root hop for the surfaces that live in the Business hub stack. Going through
  // the root for a sibling stack does not bubble, so each row takes the
  // shortest correct path.
  const navigation = useNavigation<MoreHubNavigation>();
  return (
    <BusinessMoreHubScreen
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
    />
  );
}

/**
 * Business-facing app shell. Owns the one business bottom navigation
 * (`BusinessTabBar`) and wraps every business screen in the compact density so
 * type sizes stay consistent across the whole business side.
 */
export function BusinessTabNavigator() {
  return (
    <TypeDensityProvider density="compact">
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={props => <BusinessTabBar {...props} />}
      >
        <Tab.Screen name="BusinessOverview" options={{ title: 'Overview' }}>
          {() => (
            <OverviewStack.Navigator screenOptions={stackOptions}>
              <OverviewStack.Screen
                name="BusinessOverviewHome"
                component={BusinessOverviewRoute}
              />
            </OverviewStack.Navigator>
          )}
        </Tab.Screen>
        <Tab.Screen name="BusinessOrders" options={{ title: 'Orders' }}>
          {() => (
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
                name="BusinessBookings"
                component={BusinessBookingsRoute}
              />
              <OrdersStack.Screen
                name="BusinessPosOrders"
                component={BusinessPosOrdersRoute}
              />
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
              <OrdersStack.Screen
                name="DigitalEReceipt"
                component={DigitalEReceiptRoute}
              />
              <OrdersStack.Screen
                name="PosHomeOfflineMode"
                component={PosHomeOfflineModeRoute}
              />
              <OrdersStack.Screen
                name="PosBranchTillSwitcher"
                component={PosBranchTillSwitcherRoute}
              />
              <OrdersStack.Screen
                name="PosHomeSalesOperations"
                component={PosHomeSalesOperationsRoute}
              />
              <OrdersStack.Screen
                name="PosNewSaleCatalog"
                component={PosNewSaleCatalogRoute}
              />
              <OrdersStack.Screen
                name="PosCurrentSaleCart"
                component={PosCurrentSaleCartRoute}
              />
              <OrdersStack.Screen
                name="PosTenderCheckout"
                component={PosTenderCheckoutRoute}
              />
              <OrdersStack.Screen
                name="PosSaleCompleted"
                component={PosSaleCompletedRoute}
              />
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
              <OrdersStack.Screen
                name="PosCustomerDossier"
                component={PosCustomerDossierRoute}
              />
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
              <OrdersStack.Screen
                name="PublicPosOrderMenu"
                component={PublicPosOrderMenuRoute}
              />
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
              <OrdersStack.Screen
                name="PosGeneralSettings"
                component={PosGeneralSettingsRoute}
              />
              <OrdersStack.Screen
                name="PaymentHardwareSetup"
                component={PaymentHardwareSetupRoute}
              />
              <OrdersStack.Screen
                name="TaxesSurcharges"
                component={TaxesSurchargesRoute}
              />
              <OrdersStack.Screen
                name="StaffPermissionsPasscodes"
                component={StaffPermissionsPasscodesRoute}
              />
            </OrdersStack.Navigator>
          )}
        </Tab.Screen>
        <Tab.Screen name="BusinessMessages" options={{ title: 'Messages' }}>
          {() => (
            <MessagesStack.Navigator screenOptions={stackOptions}>
              <MessagesStack.Screen
                name="BusinessMessagesHome"
                component={BusinessMessagesRoute}
              />
            </MessagesStack.Navigator>
          )}
        </Tab.Screen>
        <Tab.Screen name="BusinessHub" options={{ title: 'Business' }}>
          {() => (
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
                name="CreateDealLocationAssignment"
                component={CreateDealLocationAssignmentRoute}
              />
              <HubStack.Screen
                name="DealLocationAssignmentPricing"
                component={DealLocationAssignmentPricingRoute}
              />
              <HubStack.Screen
                name="ProductLocationAssignment"
                component={ProductLocationAssignmentRoute}
              />
              <HubStack.Screen
                name="BranchAvailabilityLocationPricing"
                component={BranchAvailabilityLocationPricingRoute}
              />
              <HubStack.Screen
                name="CentralCatalogue"
                component={CentralCatalogueRoute}
              />
              <HubStack.Screen
                name="ServicesCategories"
                component={ServicesCategoriesRoute}
              />
              <HubStack.Screen
                name="AddProductBasicsMedia"
                component={AddProductBasicsMediaRoute}
              />
              <HubStack.Screen
                name="LocationsBranches"
                component={LocationsBranchesRoute}
              />
              <HubStack.Screen
                name="WuseBranchDetails"
                component={WuseBranchDetailsRoute}
              />
              <HubStack.Screen
                name="CustomerCrmDirectory"
                component={CustomerCrmDirectoryRoute}
              />
              <HubStack.Screen
                name="CustomerProfileDossier"
                component={CustomerProfileDossierRoute}
              />
              <HubStack.Screen
                name="LoyaltyProgramme"
                component={LoyaltyProgrammeRoute}
              />
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
              <HubStack.Screen
                name="BranchComparison"
                component={BranchComparisonRoute}
              />
              <HubStack.Screen
                name="BusinessReviewsReputation"
                component={BusinessReviewsReputationRoute}
              />
            </HubStack.Navigator>
          )}
        </Tab.Screen>
        <Tab.Screen name="BusinessMore" options={{ title: 'More' }}>
          {() => (
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
              <MoreStack.Screen
                name="BusinessSupportHelp"
                component={BusinessSupportHelpRoute}
              />
              <MoreStack.Screen
                name="BusinessSettings"
                component={BusinessSettingsRoute}
              />
              <MoreStack.Screen
                name="SwitchToCustomer"
                component={SwitchToCustomerRoute}
              />
              <MoreStack.Screen name="CampaignsHub" component={CampaignsHubRoute} />
              <MoreStack.Screen
                name="CustomerSegments"
                component={CustomerSegmentsRoute}
              />
              <MoreStack.Screen name="BoostEngine" component={BoostEngineRoute} />
              {/* VEMTAP Intelligence */}
              <MoreStack.Screen
                name="BusinessAnalytics"
                component={BusinessAnalyticsRoute}
              />
              <MoreStack.Screen
                name="CustomersAnalytics"
                component={CustomersAnalyticsRoute}
              />
              <MoreStack.Screen name="DealsAnalytics" component={DealsAnalyticsRoute} />
              <MoreStack.Screen
                name="LocationsAnalytics"
                component={LocationsAnalyticsRoute}
              />
              <MoreStack.Screen name="PosAnalytics" component={PosAnalyticsRoute} />
              <MoreStack.Screen
                name="AnalyticsExportReport"
                component={AnalyticsExportReportRoute}
              />
              {/* Boost */}
              <MoreStack.Screen
                name="BoostGoalAudience"
                component={BoostGoalAudienceRoute}
              />
              <MoreStack.Screen
                name="BoostBudgetSchedule"
                component={BoostBudgetScheduleRoute}
              />
              <MoreStack.Screen
                name="BoostPreviewPayment"
                component={BoostPreviewPaymentRoute}
              />
              <MoreStack.Screen
                name="BoostPerformance"
                component={BoostPerformanceRoute}
              />
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
              <MoreStack.Screen
                name="CreateCustomSegment"
                component={CreateCustomSegmentRoute}
              />
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
              <MoreStack.Screen
                name="MyBusinessNetwork"
                component={MyBusinessNetworkRoute}
              />
              <MoreStack.Screen
                name="NetworkMilestones"
                component={NetworkMilestonesRoute}
              />
              <MoreStack.Screen
                name="BusinessNetworkInfo"
                component={BusinessNetworkInfoRoute}
              />
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
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </TypeDensityProvider>
  );
}
