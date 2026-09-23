import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from '@navigation/TabNavigator';
import { ProfileScreen } from '@features/profile/screens/ProfileScreen';
import { DealFiltersScreen } from '@features/deals/screens/DealFiltersScreen';
import { DealDetailScreen } from '@features/dealDetail/screens/DealDetailScreen';
import type { AppStackParamList } from '@navigation/types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: true, title: 'Profile' }}
      />
      <Stack.Screen name="DealFilters" component={DealFiltersScreen} />
      <Stack.Screen name="DealDetail" component={DealDetailScreen} />
    </Stack.Navigator>
  );
}
