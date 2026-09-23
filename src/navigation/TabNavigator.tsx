import React, { useMemo } from 'react';
import {
  createBottomTabNavigator,
  type BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { ProfileScreen } from '@features/profile/screens/ProfileScreen';
import { DealsDiscoveryScreen } from '@features/deals/screens/DealsDiscoveryScreen';
import { TabIcon } from '@navigation/TabIcon';
import { CenteredTabButton } from '@navigation/CenteredTabButton';
import type { AppStackParamList, MainTabParamList } from '@navigation/types';
import { strings } from '@constants/strings';
import { tabBarTopShadow } from '@theme/shadows';

const Tab = createBottomTabNavigator<MainTabParamList>();

/** Visible footer height above the home-indicator inset. */
const TAB_BAR_CONTENT_HEIGHT = 64;

type DealsTabNavigation = BottomTabNavigationProp<MainTabParamList> &
  NativeStackNavigationProp<AppStackParamList>;

function DealsTabScreen({ variant }: { variant: 'featured' | 'standard' }) {
  const navigation = useNavigation<DealsTabNavigation>();
  const onOpenFilters = useMemo(
    () => () => navigation.navigate('DealFilters'),
    [navigation],
  );

  const onOpenDeal = useMemo(
    () => (dealId: string) => navigation.navigate('DealDetail', { dealId }),
    [navigation],
  );

  return (
    <DealsDiscoveryScreen
      variant={variant}
      onOpenFilters={onOpenFilters}
      onOpenDeal={onOpenDeal}
    />
  );
}

function FeaturedDealsTabScreen() {
  return <DealsTabScreen variant="featured" />;
}

function StandardDealsTabScreen() {
  return <DealsTabScreen variant="standard" />;
}

export function TabNavigator() {
  const insets = useSafeAreaInsets();

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarActiveTintColor: '#066CF4',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarShowLabel: true,
      // Small but readable labels under each icon (matches text-micro / 11px).
      tabBarLabelStyle: {
        fontSize: 11,
        lineHeight: 14,
        marginTop: 2,
      },
      tabBarButton: CenteredTabButton,
      tabBarStyle: {
        height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
        paddingTop: 0,
        paddingBottom: insets.bottom,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 0,
        ...tabBarTopShadow,
      },
    }),
    [insets.bottom],
  );

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: strings.home.tabHome,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={strings.home.tabHome} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Deals"
        component={FeaturedDealsTabScreen}
        options={{
          title: strings.home.tabDeals,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={strings.home.tabDeals} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={StandardDealsTabScreen}
        options={{
          title: strings.home.tabDiscover,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={strings.home.tabDiscover} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Saved"
        component={HomeScreen}
        options={{
          title: strings.home.tabSaved,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={strings.home.tabSaved} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={ProfileScreen}
        options={{
          title: strings.home.tabAccount,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={strings.home.tabAccount} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
