import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '@features/auth/screens/WelcomeScreen';
import { DiscoverDealsScreen } from '@features/auth/screens/DiscoverDealsScreen';
import { StartVemtapScreen } from '@features/auth/screens/StartVemtapScreen';
import { SignInScreen } from '@features/auth/screens/SignInScreen';
import { RegisterScreen } from '@features/auth/screens/RegisterScreen';
import { OtpVerificationScreen } from '@features/auth/screens/OtpVerificationScreen';
import { ProfileSetupScreen } from '@features/auth/screens/ProfileSetupScreen';
import { ForgotPinScreen } from '@features/auth/screens/ForgotPinScreen';
import {
  LocationPermissionScreen,
  ManualLocationSearchScreen,
  LocationConfirmationScreen,
  DiscoveringNearbyDealsScreen,
} from '@features/location/screens';
import type { AuthStackParamList } from '@navigation/types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="DiscoverDeals" component={DiscoverDealsScreen} />
      <Stack.Screen name="StartVemtap" component={StartVemtapScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VerifyEmail" component={OtpVerificationScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="ForgotPin" component={ForgotPinScreen} />
      <Stack.Screen name="LocationPermission" component={LocationPermissionScreen} />
      <Stack.Screen name="ManualLocationSearch" component={ManualLocationSearchScreen} />
      <Stack.Screen name="LocationConfirmation" component={LocationConfirmationScreen} />
      <Stack.Screen
        name="DiscoveringNearbyDeals"
        component={DiscoveringNearbyDealsScreen}
      />
    </Stack.Navigator>
  );
}
