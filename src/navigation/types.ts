import type { NavigatorScreenParams } from '@react-navigation/native';
import type { BusinessProfileSummary } from '@features/discover/data/discoverData';

/**
 * Bottom-tab shell for the customer personal hub
 * (Home · My Deals · Messages · Orders · More), taken from the
 * "Customer Dashboard (Personal Overview)" spec. Root-level sibling of `Tabs`.
 */
export type PersonalHubParamList = {
  /** The overview also accepts a deep link so deal/booking details stay in this shell. */
  PersonalHome:
    | {
        deepLink?:
          | { screen: 'PersonalClaimedDealPass'; dealId?: string }
          | { screen: 'PersonalBookingDetail'; bookingNumber?: string };
      }
    | undefined;
  PersonalMyDeals: undefined;
  PersonalMessages: undefined;
  PersonalOrders: undefined;
  PersonalMore: undefined;
  /**
   * Stack roots are named distinctly from their tab route. React Navigation keys
   * routes by name, so a stack screen sharing its tab's name trips the dev-only
   * "screens with the same name nested inside one another" warning.
   */
  PersonalHomeOverview: undefined;
  PersonalMyDealsList: undefined;
  PersonalMessagesInbox: undefined;
  PersonalOrdersBookings: undefined;
  PersonalMoreHub: undefined;
  /** Personal-flow detail screens, so the personal bar stays visible end to end. */
  PersonalActivity: undefined;
  PersonalRewards: undefined;
  PersonalSavings: undefined;
  PersonalNotifications: undefined;
  PersonalSettings: undefined;
  PersonalEditProfile: undefined;
  PersonalHelpCentre: undefined;
  PersonalClaimedDealPass: { dealId?: string } | undefined;
  PersonalOrderDetail: { orderNumber?: string } | undefined;
  PersonalBookingDetail: { bookingNumber?: string } | undefined;
  PersonalConversation: { merchant?: string } | undefined;
};

/**
 * Bottom-tab shell for the business-facing app (Overview · Orders · Messages ·
 * Business · More). Each tab owns a stack, so the bottom navigation is the only
 * chrome — detail pages are pushed, never given their own footer.
 */
/**
 * Every screen pushed inside a business tab stack. These deliberately differ
 * from the tab names: a tab and its own root screen sharing a name makes
 * `navigate()` ambiguous, which breaks the Orders <-> Bookings switcher.
 */
export type BusinessStackParamList = {
  BusinessOverviewHome: undefined;
  BusinessOrdersHome: undefined;
  BusinessMessagesHome: undefined;
  BusinessHubHome: undefined;
  BusinessMoreHome: undefined;
  BusinessOrderDetail: { orderId?: string } | undefined;
  BusinessBookings: undefined;
  BusinessPosOrders: undefined;
  /**
   * Business management destinations. Each maps 1:1 to a Stitch screen; the
   * screens that have several design treatments take an optional `layout`.
   */
  BusinessProfilePreview: undefined;
  BusinessManagementHub: undefined;
  CentralDealsManagement: { layout?: 'hero' | 'compact' | 'discovery' } | undefined;
  /**
   * Each numbered Stitch design gets its own destination so it has a real back
   * stack entry, while the screen component stays shared (no forked variants).
   * `central_deals_management_1/2/3`.
   */
  DealsFlashRadar: { layout?: 'compact' } | undefined;
  CampaignsDealsManagement: { layout?: 'discovery' } | undefined;
  DealDetailsPerformance: undefined;
  CreateDealLocationAssignment: undefined;
  DealLocationAssignmentPricing: undefined;
  ProductLocationAssignment: undefined;
  BranchAvailabilityLocationPricing: undefined;
  CentralCatalogue: { layout?: 'directory' | 'businessHub' } | undefined;
  /** `central_products_services_catalogue_2` — the business-hub treatment. */
  BusinessHubCatalogue: { layout?: 'businessHub' } | undefined;
  ServicesCategories: undefined;
  AddProductBasicsMedia: undefined;
  LocationsBranches: undefined;
  WuseBranchDetails: undefined;
  CustomerCrmDirectory: undefined;
  CustomerProfileDossier: undefined;
  LoyaltyProgramme: undefined;
  LoyaltyRewards: undefined;
  StaffDirectory: undefined;
  InviteStaff: undefined;
  /** Analytics & intelligence surfaces (More hub → Analytics & Intelligence). */
  BusinessCustomerIntelligence: undefined;
  BusinessPerformanceAnalytics: undefined;
  BranchComparison: undefined;
  BusinessReviewsReputation: undefined;
  /** Customer-facing table surfaces, reached from the POS register. */
  CustomerDisplayOrder: undefined;
  CustomerDisplayPayment: undefined;
  CustomerDisplayRating: undefined;
  SplitTheBill: undefined;
  DigitalEReceipt: undefined;
  /** Account, trust & support surfaces (More hub). */
  /** One chat surface for every thread on the Messages hub. */
  BusinessConversation: { threadId: string } | undefined;
  BusinessNotifications: undefined;
  BusinessSubscriptionBilling: undefined;
  BusinessVerificationTrust: undefined;
  BusinessSupportHelp: undefined;
  BusinessSettings: undefined;
  SwitchToCustomer: undefined;
  /** Growth surfaces (More hub → Marketing & Growth). */
  CampaignsHub: undefined;
  CustomerSegments: undefined;
  BoostEngine: undefined;
  /**
   * VEMTAP Intelligence — the five analytics surfaces share one chrome
   * (`BusinessAnalyticsShell`) and swap content by route.
   */
  BusinessAnalytics: undefined;
  CustomersAnalytics: undefined;
  DealsAnalytics: undefined;
  LocationsAnalytics: undefined;
  PosAnalytics: undefined;
  AnalyticsExportReport: undefined;
  /** Boost wizard (three sequential steps) and its analytics/wallet siblings. */
  BoostGoalAudience:
    { goalId?: string; audienceScope?: string; radiusKm?: string } | undefined;
  BoostBudgetSchedule:
    | {
        goalId?: string;
        audienceScope?: string;
        radiusKm?: string;
        placements?: string[];
      }
    | undefined;
  BoostPreviewPayment:
    { budget?: number; days?: number; dayparting?: boolean } | undefined;
  BoostPerformance: undefined;
  BoostWallet: undefined;
  /** Create Campaign wizard — one stack entry per step, per AGENTS rule 21. */
  CampaignCreateObjective: undefined;
  CampaignCreateContent: { objectiveId?: string } | undefined;
  CampaignCreateAudience:
    { objectiveId?: string; assetIds?: string[]; segmentId?: string } | undefined;
  CampaignCreateSchedule:
    | {
        objectiveId?: string;
        assetIds?: string[];
        segmentId?: string;
        radius?: string;
      }
    | undefined;
  CampaignCreateBudget:
    | {
        objectiveId?: string;
        assetIds?: string[];
        segmentId?: string;
        radius?: string;
        durationDays?: number;
      }
    | undefined;
  CampaignReviewLaunch:
    | {
        objectiveId?: string;
        objectiveTitle?: string;
        assetIds?: string[];
        assetNames?: string[];
        segmentId?: string;
        cohortNames?: string[];
        branchIds?: string[];
        branchNames?: string[];
        clusterNames?: string[];
        radius?: string;
        durationDays?: number;
        total?: number;
        daily?: number;
      }
    | undefined;
  /** Segment surfaces. `SegmentActions` is the shared BottomSheet owner. */
  SegmentActions: { segmentId?: string; segmentName?: string } | undefined;
  CreateCustomSegment: undefined;
  SegmentAudienceDetails: { segmentId?: string } | undefined;
  /** QR & storefront discovery surfaces (More hub → QR & Storefront Discovery). */
  BusinessQr: undefined;
  LocationQr: undefined;
  BusinessDiscoveryFeed: undefined;
  /** Business Network surfaces (More hub → Business Network). */
  BusinessNetworkIntroHub: undefined;
  MyBusinessNetwork: undefined;
  NetworkMilestones: undefined;
  BusinessNetworkInfo: undefined;
  MyReferrals: undefined;
  ReferralDetail: { referralId?: string } | undefined;
  BusinessNetworkDashboard: undefined;
  /** `business_more_hub_3` — the operations-dense More hub variant. */
  BusinessMoreHubOperations: undefined;
  /** `pos_home_offline_mode_active` — POS home with the local till offline. */
  PosHomeOfflineMode: undefined;
  /** POS sale flow: branch routing, catalog, cart, tender, receipt, settings. */
  PosBranchTillSwitcher: undefined;
  PosHomeSalesOperations: undefined;
  PosNewSaleCatalog: undefined;
  PosCurrentSaleCart: { ticketId?: string } | undefined;
  PosTenderCheckout: undefined;
  PosSaleCompleted: undefined;
  PosReceiptCustomization: undefined;
  /** Customer lookup + dossier, and the till catalogue / shift stock editors. */
  PosCustomerLookupActive: undefined;
  PosCustomerLookupList: undefined;
  PosCustomerLookupLoyalty: undefined;
  PosCustomerDossier: { customerId?: string } | undefined;
  PosProductsInventory: undefined;
  PosProductShiftStockStatus: { itemId?: string } | undefined;
  /** Shift/receipt ledgers, transaction detail, and the offline + sync surfaces. */
  PosTransactionsLedgerShift: undefined;
  PosTransactionsLedgerReceipts: undefined;
  PosTransactionDetails: { receiptId?: string } | undefined;
  PosOfflineCheckoutTerminal: undefined;
  PosOfflineBufferQueue: undefined;
  PosSyncReconciliation: undefined;
  /** Guest-facing public POS menu, cart and live tracking, plus the KDS stream. */
  PublicPosOrderMenu: { tableId?: string } | undefined;
  PublicPosCartReview: undefined;
  PublicPosOrderTracking: undefined;
  MerchantPosKitchenStream: undefined;
  /** Owner-only register configuration: settings hub, hardware, tax, security. */
  PosGeneralSettings: undefined;
  PaymentHardwareSetup: undefined;
  TaxesSurcharges: undefined;
  StaffPermissionsPasscodes: undefined;
};

/**
 * The five bottom-tab destinations. Each accepts nested
 * `NavigatorScreenParams<BusinessStackParamList>` so a sibling tab can switch
 * tab and push a screen in a single `navigate()` call. Referencing the stack
 * list (rather than the combined list) keeps the types from being circular.
 */
export type BusinessTabRootParamList = {
  BusinessOverview: NavigatorScreenParams<BusinessStackParamList> | undefined;
  BusinessOrders: NavigatorScreenParams<BusinessStackParamList> | undefined;
  BusinessMessages: NavigatorScreenParams<BusinessStackParamList> | undefined;
  BusinessHub: NavigatorScreenParams<BusinessStackParamList> | undefined;
  BusinessMore: NavigatorScreenParams<BusinessStackParamList> | undefined;
};

export type BusinessTabParamList = BusinessTabRootParamList & BusinessStackParamList;

export type BusinessSetupStackParamList = {
  BusinessIntroduction: undefined;
  BusinessProfileBasicInfo: undefined;
  BusinessProfileBranding: undefined;
  BusinessProfileContactChannels: undefined;
  BusinessLocation: undefined;
  BusinessLocations: undefined;
  AddBranchLocation: undefined;
  AddProductsOrServices: undefined;
  AddServiceBasics: undefined;
  AddServiceDurationPricing: undefined;
  AddServiceAvailabilityRules: undefined;
  ReviewServiceSummary: undefined;
  ServicePublished: undefined;
  AddProductLocationPricing: undefined;
  AddProductBasics: undefined;
  AddProductPricingVariants: undefined;
  AddProductBranchAvailability: undefined;
  ReviewProductSummary: undefined;
  ProductPublished: undefined;
  ProductMakeDeal: undefined;
  CreateDealAutoImported: undefined;
  CreateDealStep1: undefined;
  CreateDealStep2: undefined;
  CreateDealStep3: undefined;
  CreateDealStep4: undefined;
  BusinessQrReady: undefined;
  VerifyYourBusiness: undefined;
  VerifyYourIdentity: undefined;
  IdVerification: undefined;
  IdVerificationSuccess: undefined;
  IdVerificationNeedsReview: undefined;
  BusinessRegistration: undefined;
  CacVerification: undefined;
  UnregisteredBusiness: undefined;
  CacVerificationSuccess: undefined;
  VerificationInProgress: undefined;
  YouReVerified: undefined;
  BusinessVerificationStatusCenter: undefined;
  FreeTrialConfirmation: undefined;
  BusinessPlanTrialOverview: undefined;
  TrialActiveStatus: undefined;
  SubscribeNowPayment: undefined;
  PaymentSuccessVemtapGrowth: undefined;
  TrialEndingRenewGrowth: undefined;
  TrialExpiredReactivate: undefined;
  VemtapAddOns: undefined;
};

export type RootStackParamList = {
  AuthStack: undefined;
  AppStack: NavigatorScreenParams<AppStackParamList> | undefined;
  Onboarding: undefined;
  LocationPermission: undefined;
  DealDetail: { dealId: string };
  BusinessSetup: NavigatorScreenParams<BusinessSetupStackParamList> | undefined;
  BusinessTabs: NavigatorScreenParams<BusinessTabParamList> | undefined;
  PersonalHub: NavigatorScreenParams<PersonalHubParamList> | undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  DiscoverDeals: undefined;
  StartVemtap: undefined;
  SignIn: undefined;
  Register: undefined;
  VerifyEmail: { email: string };
  ProfileSetup: { email: string; code: string };
  LocationPermission: undefined;
  ManualLocationSearch: undefined;
  LocationConfirmation: { area?: string };
  DiscoveringNearbyDeals: undefined;
};

export type BookingDraft = {
  addons: string[];
  therapistId: string;
  date: string;
  time: string;
  notes: string;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList> | undefined;
  /**
   * District selection, shared by the Home and Deals navbars. It lives on the
   * root stack so both consumer tabs reach one registration by bubbling,
   * rather than each tab declaring its own copy (AGENTS rule 21). It renders the
   * same component the signup flow registers as `ManualLocationSearch`.
   */
  LocationSelect: { currentArea?: string } | undefined;
  Profile: undefined;
  Settings: undefined;
  DealDetail: { dealId: string };
  DealTermsConditions: { dealId: string };
  HowToClaim: { dealId: string };
  DealClaimedSuccess: { dealId: string };
  MyClaimedDeal: { dealId: string };
  MerchantChat: { dealId: string };
  GiftDealSentSuccess: {
    dealId: string;
    recipient: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
  DealFilters: undefined;
  ProductDetail: { productId: string };
  OrderCheckout: {
    draft?: {
      quantity: number;
      temperature: string;
      side: string;
      addons: string[];
      instructions: string;
      unitPrice: number;
      total: number;
    };
  };
  OrderPlaced:
    | {
        total: string;
        fulfillment: 'pickup' | 'delivery';
        orderNumber: string;
      }
    | undefined;
  ServiceDetail: { serviceId: string };
  ScheduleAppointment: { draft?: BookingDraft } | undefined;
  BookingCheckout: { draft?: BookingDraft } | undefined;
  BookingConfirmed: { draft?: BookingDraft } | undefined;
};

export type HomeStackParamList = {
  HomeFeed: undefined;
  DealsDiscovery: undefined;
  /** "See All" on the Home Featured Deals section. */
  HomeFeaturedDeals: { area?: string; radiusKm?: number } | undefined;
};

export type DiscoverStackParamList = {
  DiscoverHome: undefined;
  BusinessProfile: { business: BusinessProfileSummary };
  UrbanGrillProfile: undefined;
  UrbanGrillProductsCatalogue: undefined;
  UrbanGrillMenu: undefined;
  UrbanGrillAllDeals: undefined;
  GlowSerenityProfile: undefined;
  GlowSerenityServices: undefined;
};

export type AccountStackParamList = {
  AccountHome: undefined;
  AccountDashboard: undefined;
  MyDeals: undefined;
  OrdersBookings: undefined;
  Messages: undefined;
  More: undefined;
  HelpCentre: undefined;
  Activity: undefined;
  Rewards: undefined;
  SavingsHistory: undefined;
  AccountSettings: undefined;
  EditProfile: undefined;
  ClaimedDealPass: { dealId?: string } | undefined;
  OrderDetail: { orderNumber?: string } | undefined;
  BookingDetail: { bookingNumber?: string } | undefined;
  Conversation: { merchant?: string } | undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Deals: undefined;
  Discover: NavigatorScreenParams<DiscoverStackParamList> | undefined;
  Saved: undefined;
  Account: NavigatorScreenParams<AccountStackParamList> | undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
