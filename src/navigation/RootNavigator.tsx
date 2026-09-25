import React from 'react';
import { NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStack } from '@navigation/AuthStack';
import { AppStack } from '@navigation/AppStack';
import { BusinessSetupNavigator } from '@navigation/BusinessSetupNavigator';
import type { RootStackParamList } from '@navigation/types';
import { useAuthStore, selectIsAuthenticated } from '@store/authStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Deep-link paths — keep in sync with server-side link generation + FCM payloads. */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['vemtap://', 'https://vemtap.com'],
  config: {
    screens: {
      AuthStack: {
        screens: {
          Welcome: 'welcome',
          SignIn: 'sign-in',
          Register: 'register',
          VerifyEmail: 'verify-email',
          ProfileSetup: 'profile-setup',
          LocationPermission: 'location-permission',
          ManualLocationSearch: 'location-search',
          LocationConfirmation: 'location-confirm',
          DiscoveringNearbyDeals: 'discovering',
        },
      },
      AppStack: {
        screens: {
          Tabs: {
            screens: {
              Home: 'home',
              Deals: 'deals',
              Discover: {
                screens: {
                  DiscoverHome: 'discover',
                  UrbanGrillProfile: 'discover/urban-grill',
                  UrbanGrillProductsCatalogue: 'discover/urban-grill/catalogue',
                  UrbanGrillMenu: 'discover/urban-grill/menu',
                  UrbanGrillAllDeals: 'discover/urban-grill/deals',
                  GlowSerenityProfile: 'discover/glow-serenity',
                  GlowSerenityServices: 'discover/glow-serenity/services',
                },
              },
              Saved: 'saved',
              Account: 'account',
            },
          },
          Profile: 'profile/:id?',
          Settings: 'settings',
          DealDetail: 'deals/:dealId',
          DealTermsConditions: 'deals/:dealId/terms',
          HowToClaim: 'deals/:dealId/how-to-claim',
          DealClaimedSuccess: 'deals/:dealId/claimed/success',
          MyClaimedDeal: 'deals/:dealId/claimed',
          MerchantChat: 'deals/:dealId/chat',
          DealFilters: 'deals/filters',
          ProductDetail: 'orders/woodfire-aged-ribeye',
          OrderCheckout: 'orders/checkout',
          OrderPlaced: 'orders/placed',
          ServiceDetail: 'bookings/deep-hydration-radiance-facial',
          ScheduleAppointment: 'bookings/deep-hydration-radiance-facial/schedule',
          BookingCheckout: 'bookings/deep-hydration-radiance-facial/checkout',
          BookingConfirmed: 'bookings/deep-hydration-radiance-facial/confirmed',
        },
      },
      DealDetail: 'deals/:dealId',
      BusinessSetup: 'business/setup',
      LocationPermission: 'location',
    },
  },
};

export function RootNavigator() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="AppStack" component={AppStack} />
        ) : (
          <Stack.Screen name="AuthStack" component={AuthStack} />
        )}
        <Stack.Screen name="BusinessSetup" component={BusinessSetupNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
