import type { NavigatorScreenParams } from '@react-navigation/native';

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

export type AppStackParamList = {
  Tabs: undefined;
  Profile: undefined;
  Settings: undefined;
  DealDetail: { dealId: string };
  DealFilters: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Deals: undefined;
  Discover: undefined;
  Saved: undefined;
  Account: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
