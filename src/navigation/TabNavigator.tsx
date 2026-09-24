import React, { useMemo } from 'react';
import {
  createBottomTabNavigator,
  type BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { ProfileScreen } from '@features/profile/screens/ProfileScreen';
import { DealsDiscoveryScreen } from '@features/deals/screens/DealsDiscoveryScreen';
import { DiscoverScreen } from '@features/discover/screens/DiscoverScreen';
import { UrbanGrillProfileScreen } from '@features/discover/screens/UrbanGrillProfileScreen';
import { UrbanGrillProductsCatalogueScreen } from '@features/discover/screens/UrbanGrillProductsCatalogueScreen';
import { UrbanGrillMenuScreen } from '@features/discover/screens/UrbanGrillMenuScreen';
import { UrbanGrillAllDealsScreen } from '@features/discover/screens/UrbanGrillAllDealsScreen';
import { GlowSerenityProfileScreen } from '@features/discover/screens/GlowSerenityProfileScreen';
import { GlowSerenityServicesScreen } from '@features/discover/screens/GlowSerenityServicesScreen';
import { TabIcon } from '@navigation/TabIcon';
import { CenteredTabButton } from '@navigation/CenteredTabButton';
import type {
  AppStackParamList,
  DiscoverStackParamList,
  HomeStackParamList,
  MainTabParamList,
} from '@navigation/types';
import { strings } from '@constants/strings';
import { tabBarTopShadow } from '@theme/shadows';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const DiscoverStack = createNativeStackNavigator<DiscoverStackParamList>();

/** Visible footer height above the home-indicator inset. */
const TAB_BAR_CONTENT_HEIGHT = 64;

type DealsTabNavigation = BottomTabNavigationProp<MainTabParamList> &
  NativeStackNavigationProp<AppStackParamList>;

function DealsTabScreen() {
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
      variant="featured"
      onOpenFilters={onOpenFilters}
      onOpenDeal={onOpenDeal}
    />
  );
}

type HomeStackNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    NativeStackNavigationProp<AppStackParamList>
  >
>;

function HomeFeedScreen() {
  const navigation = useNavigation<HomeStackNavigation>();
  const onOpenDiscover = useMemo(
    () => () => navigation.push('DealsDiscovery'),
    [navigation],
  );
  const onOpenDeal = useMemo(
    () => (dealId: string) => navigation.navigate('DealDetail', { dealId }),
    [navigation],
  );

  return <HomeScreen onOpenDiscover={onOpenDiscover} onOpenDeal={onOpenDeal} />;
}

function HomeDealsDiscoveryScreen() {
  const navigation = useNavigation<HomeStackNavigation>();
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
      variant="standard"
      onOpenFilters={onOpenFilters}
      onOpenDeal={onOpenDeal}
    />
  );
}

function HomeTabScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeFeed" component={HomeFeedScreen} />
      <HomeStack.Screen name="DealsDiscovery" component={HomeDealsDiscoveryScreen} />
    </HomeStack.Navigator>
  );
}

type DiscoverStackNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<DiscoverStackParamList>,
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    NativeStackNavigationProp<AppStackParamList>
  >
>;

function DiscoverHomeScreen() {
  const navigation = useNavigation<DiscoverStackNavigation>();
  const onOpenBusiness = useMemo(
    () => (businessId: string) => {
      if (businessId === 'urban-grill') {
        navigation.push('UrbanGrillProfile');
      } else if (businessId === 'glow-serenity') {
        navigation.push('GlowSerenityProfile');
      }
    },
    [navigation],
  );

  return (
    <DiscoverScreen
      onOpenBusiness={onOpenBusiness}
      onOpenFilters={() => undefined}
      onToggleMap={() => undefined}
      onOpenNotifications={() => undefined}
      onOpenAccount={() => navigation.navigate('Tabs', { screen: 'Account' })}
      onOpenEnrollment={() => undefined}
    />
  );
}

function UrbanGrillProfileTabScreen() {
  const navigation = useNavigation<DiscoverStackNavigation>();
  return (
    <UrbanGrillProfileScreen
      onBack={navigation.goBack}
      onOpenCatalogue={() => navigation.push('UrbanGrillProductsCatalogue')}
      onOpenMenu={() => navigation.push('UrbanGrillMenu')}
      onOpenAllDeals={() => navigation.push('UrbanGrillAllDeals')}
      onOpenDeal={() =>
        navigation.navigate('DealDetail', { dealId: 'urban-grill-lunch' })
      }
    />
  );
}

function UrbanGrillCatalogueTabScreen() {
  const navigation = useNavigation<DiscoverStackNavigation>();
  return (
    <UrbanGrillProductsCatalogueScreen
      onBack={navigation.goBack}
      onOpenProduct={productId => navigation.navigate('ProductDetail', { productId })}
      onCheckout={() =>
        navigation.navigate('OrderCheckout', {
          draft: {
            quantity: 1,
            temperature: 'Medium Rare',
            side: 'Truffle Parmesan Wedges',
            addons: [],
            instructions: '',
            unitPrice: 14000,
            total: 14000,
          },
        })
      }
    />
  );
}

function UrbanGrillMenuTabScreen() {
  const navigation = useNavigation<DiscoverStackNavigation>();
  return (
    <UrbanGrillMenuScreen
      onBack={navigation.goBack}
      onOpenAllDeals={() => navigation.push('UrbanGrillAllDeals')}
    />
  );
}

function UrbanGrillDealsTabScreen() {
  const navigation = useNavigation<DiscoverStackNavigation>();
  return (
    <UrbanGrillAllDealsScreen
      onBack={navigation.goBack}
      onOpenDeal={() =>
        navigation.navigate('DealDetail', { dealId: 'urban-grill-lunch' })
      }
    />
  );
}

function GlowSerenityProfileTabScreen() {
  const navigation = useNavigation<DiscoverStackNavigation>();
  return (
    <GlowSerenityProfileScreen
      onBack={navigation.goBack}
      onOpenServices={() => navigation.push('GlowSerenityServices')}
      onOpenDeal={() => navigation.navigate('DealDetail', { dealId: 'glow-spa-weekend' })}
    />
  );
}

function GlowSerenityServicesTabScreen() {
  const navigation = useNavigation<DiscoverStackNavigation>();
  return (
    <GlowSerenityServicesScreen
      onBack={navigation.goBack}
      onOpenService={serviceId => navigation.navigate('ServiceDetail', { serviceId })}
      onContinueToBook={serviceId => navigation.navigate('ServiceDetail', { serviceId })}
    />
  );
}

function DiscoverTabScreen() {
  return (
    <DiscoverStack.Navigator screenOptions={{ headerShown: false }}>
      <DiscoverStack.Screen name="DiscoverHome" component={DiscoverHomeScreen} />
      <DiscoverStack.Screen
        name="UrbanGrillProfile"
        component={UrbanGrillProfileTabScreen}
      />
      <DiscoverStack.Screen
        name="UrbanGrillProductsCatalogue"
        component={UrbanGrillCatalogueTabScreen}
      />
      <DiscoverStack.Screen name="UrbanGrillMenu" component={UrbanGrillMenuTabScreen} />
      <DiscoverStack.Screen
        name="UrbanGrillAllDeals"
        component={UrbanGrillDealsTabScreen}
      />
      <DiscoverStack.Screen
        name="GlowSerenityProfile"
        component={GlowSerenityProfileTabScreen}
      />
      <DiscoverStack.Screen
        name="GlowSerenityServices"
        component={GlowSerenityServicesTabScreen}
      />
    </DiscoverStack.Navigator>
  );
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
        component={HomeTabScreen}
        options={{
          title: strings.home.tabHome,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={strings.home.tabHome} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Deals"
        component={DealsTabScreen}
        options={{
          title: strings.home.tabDeals,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={strings.home.tabDeals} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverTabScreen}
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
