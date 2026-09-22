import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { ProfileScreen } from '@features/profile/screens/ProfileScreen';
import { TabIcon } from '@navigation/TabIcon';
import type { MainTabParamList } from '@navigation/types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#066CF4',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { borderTopColor: '#E5E7EB' },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Discover"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Nearby" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Claims"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Claims" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Account" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
