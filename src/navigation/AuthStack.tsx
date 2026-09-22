import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '@features/auth/screens/WelcomeScreen';
import { DiscoverDealsScreen } from '@features/auth/screens/DiscoverDealsScreen';
import { StartVemtapScreen } from '@features/auth/screens/StartVemtapScreen';
import { SignInScreen } from '@features/auth/screens/SignInScreen';
import { SignUpScreen } from '@features/auth/screens/SignUpScreen';
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
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}
