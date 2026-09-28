import type { NavigatorScreenParams } from '@react-navigation/native';
import type { BusinessProfileSummary } from '@features/discover/data/discoverData';

/**
 * Bottom-tab shell for the business-facing app (Overview · Orders · Messages ·
 * Business · More). Each tab owns a stack, so the bottom navigation is the only
 * chrome — detail pages are pushed, never given their own footer.
 */
export type BusinessTabParamList = {
  // Tab names (owned by the bottom tab bar).
  BusinessOverview: undefined;
  BusinessOrders: undefined;
  BusinessMessages: undefined;
  BusinessHub: undefined;
  BusinessMore: undefined;
  /**
   * Nested stack screens. These deliberately differ from the tab names:
   * a tab and its own root screen sharing a name makes `navigate()`
   * ambiguous, which breaks the Orders <-> Bookings switcher.
   */
  BusinessOverviewHome: undefined;
  BusinessOrdersHome: undefined;
  BusinessMessagesHome: undefined;
  BusinessHubHome: undefined;
  BusinessMoreHome: undefined;
  BusinessOrderDetail: { orderId?: string } | undefined;
  BusinessBookings: undefined;
  BusinessPosOrders: undefined;
};

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
};

export type AuthStackParamList = {
  Welcome: undefined;
  DiscoverDeals: undefined;
  StartVemtap: undefined;
  SignIn: undefined;
  Register: undefined;
  VerifyEmail: { email: string };
  ProfileSetup: { email: string };
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
  Notifications: undefined;
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
