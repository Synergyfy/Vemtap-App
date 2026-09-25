import type { NavigatorScreenParams } from '@react-navigation/native';
import type { BusinessProfileSummary } from '@features/discover/data/discoverData';

export type RootStackParamList = {
  AuthStack: undefined;
  AppStack: NavigatorScreenParams<AppStackParamList> | undefined;
  Onboarding: undefined;
  LocationPermission: undefined;
  DealDetail: { dealId: string };
  BusinessSetup: undefined;
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

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Deals: undefined;
  Discover: NavigatorScreenParams<DiscoverStackParamList> | undefined;
  Saved: undefined;
  Account: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
