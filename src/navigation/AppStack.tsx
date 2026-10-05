import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from '@navigation/TabNavigator';
import { ProfileScreen } from '@features/profile/screens/ProfileScreen';
import { ManualLocationSearchScreen } from '@features/location/screens/ManualLocationSearchScreen';
import { useLocationStore } from '@store/locationStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AreaName } from '@constants/locations';
import { DealFiltersScreen } from '@features/deals/screens/DealFiltersScreen';
import { DealDetailScreen } from '@features/dealDetail/screens/DealDetailScreen';
import { DealTermsConditionsScreen } from '@features/dealDetail/screens/DealTermsConditionsScreen';
import { HowToClaimScreen } from '@features/howToClaim/screens/HowToClaimScreen';
import { DealClaimedSuccessScreen } from '@features/claimedDeal/screens/DealClaimedSuccessScreen';
import { MyClaimedDealScreen } from '@features/claimedDeal/screens/MyClaimedDealScreen';
import { MerchantChatScreen } from '@features/merchantChat/screens/MerchantChatScreen';
import { GiftDealSentSuccessScreen } from '@features/giftDeal/screens/GiftDealSentSuccessScreen';
import { ProductDetailScreen } from '@features/order/screens/ProductDetailScreen';
import { OrderCheckoutScreen } from '@features/order/screens/OrderCheckoutScreen';
import { OrderPlacedScreen } from '@features/order/screens/OrderPlacedScreen';
import { ServiceDetailScreen } from '@features/booking/screens/ServiceDetailScreen';
import { ScheduleAppointmentScreen } from '@features/booking/screens/ScheduleAppointmentScreen';
import { BookingCheckoutScreen } from '@features/booking/screens/BookingCheckoutScreen';
import { BookingConfirmedScreen } from '@features/booking/screens/BookingConfirmedScreen';
import type { AppStackParamList } from '@navigation/types';

const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * District selection shared by the Home and Deals navbars. It reuses the same
 * component the signup flow registers as `ManualLocationSearch` and writes the
 * chosen district to the shared store, so both navbars stay in step.
 */
function LocationSelectScreen({
  navigation,
  route,
}: NativeStackScreenProps<AppStackParamList, 'LocationSelect'>) {
  const setArea = useLocationStore(state => state.setArea);
  const setCoords = useLocationStore(state => state.setCoords);

  return (
    <ManualLocationSearchScreen
      initialArea={route.params?.currentArea}
      onBack={navigation.goBack}
      onSelected={(next, coords) => {
        // A GPS read travels with the district so the feed can measure from the
        // real position; a hand-picked district must drop any older reading.
        if (coords) setCoords(coords, next as AreaName);
        else setArea(next as AreaName);
        navigation.goBack();
      }}
    />
  );
}

export function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: true, title: 'Profile' }}
      />
      {/* Shared by the Home and Deals navbars — one registration, both tabs. */}
      <Stack.Screen name="LocationSelect" component={LocationSelectScreen} />
      <Stack.Screen name="DealFilters" component={DealFiltersScreen} />
      <Stack.Screen name="DealDetail" component={DealDetailScreen} />
      <Stack.Screen name="DealTermsConditions" component={DealTermsConditionsScreen} />
      <Stack.Screen name="HowToClaim" component={HowToClaimScreen} />
      <Stack.Screen name="DealClaimedSuccess" component={DealClaimedSuccessScreen} />
      <Stack.Screen name="MyClaimedDeal" component={MyClaimedDealScreen} />
      <Stack.Screen name="MerchantChat" component={MerchantChatScreen} />
      <Stack.Screen name="GiftDealSentSuccess" component={GiftDealSentSuccessScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="OrderCheckout" component={OrderCheckoutScreen} />
      <Stack.Screen name="OrderPlaced" component={OrderPlacedScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="ScheduleAppointment" component={ScheduleAppointmentScreen} />
      <Stack.Screen name="BookingCheckout" component={BookingCheckoutScreen} />
      <Stack.Screen name="BookingConfirmed" component={BookingConfirmedScreen} />
    </Stack.Navigator>
  );
}
