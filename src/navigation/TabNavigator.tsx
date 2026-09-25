import React, { useCallback, useMemo } from 'react';
import {
  createBottomTabNavigator,
  type BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import {
  useNavigation,
  useRoute,
  type CompositeNavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { SavedHubScreen } from '@features/accountHub/screens/SavedHubScreen';
import { CustomerDashboardScreen } from '@features/accountHub/screens/CustomerDashboardScreen';
import { MyDealsHubScreen } from '@features/myDeals/screens/MyDealsHubScreen';
import { OrdersBookingsHubScreen } from '@features/order/screens/OrdersBookingsHubScreen';
import { UrbanOrderDetailScreen } from '@features/order/screens/UrbanOrderDetailScreen';
import { MessagesScreen } from '@features/merchantChat/screens/MessagesScreen';
import { UrbanConversationScreen } from '@features/merchantChat/screens/UrbanConversationScreen';
import { MoreHubScreen } from '@features/accountHub/screens/MoreHubScreen';
import { MyActivityScreen } from '@features/accountHub/screens/MyActivityScreen';
import { RewardsScreen } from '@features/accountHub/screens/RewardsScreen';
import { SavingsHistoryScreen } from '@features/accountHub/screens/SavingsHistoryScreen';
import { NotificationsCenterScreen } from '@features/accountHub/screens/NotificationsCenterScreen';
import { AccountSettingsSecurityScreen } from '@features/accountHub/screens/AccountSettingsSecurityScreen';
import { EditProfileScreen } from '@features/accountHub/screens/EditProfileScreen';
import { BookingDetailScreen } from '@features/accountHub/screens/BookingDetailScreen';
import { ClaimedDealDetailPassScreen } from '@features/claimedDeal/screens/ClaimedDealDetailPassScreen';
import { DealsDiscoveryScreen } from '@features/deals/screens/DealsDiscoveryScreen';
import { DiscoverScreen } from '@features/discover/screens/DiscoverScreen';
import { UrbanGrillProfileScreen } from '@features/discover/screens/UrbanGrillProfileScreen';
import { UrbanGrillProductsCatalogueScreen } from '@features/discover/screens/UrbanGrillProductsCatalogueScreen';
import { UrbanGrillMenuScreen } from '@features/discover/screens/UrbanGrillMenuScreen';
import { UrbanGrillAllDealsScreen } from '@features/discover/screens/UrbanGrillAllDealsScreen';
import { GlowSerenityProfileScreen } from '@features/discover/screens/GlowSerenityProfileScreen';
import { GlowSerenityServicesScreen } from '@features/discover/screens/GlowSerenityServicesScreen';
import { BusinessProfileScreen } from '@features/discover/screens/BusinessProfileScreen';
import { TabIcon } from '@navigation/TabIcon';
import { CenteredTabButton } from '@navigation/CenteredTabButton';
import type {
  AccountStackParamList,
  AppStackParamList,
  DiscoverStackParamList,
  HomeStackParamList,
  MainTabParamList,
} from '@navigation/types';
import { businesses } from '@features/discover/data/discoverData';
import { strings } from '@constants/strings';
import { tabBarTopShadow } from '@theme/shadows';
import { useAuthStore } from '@store/authStore';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const DiscoverStack = createNativeStackNavigator<DiscoverStackParamList>();
const AccountStack = createNativeStackNavigator<AccountStackParamList>();

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
  const onOpenBusinessSetup = useMemo(
    () => () => navigation.navigate('BusinessSetup'),
    [navigation],
  );

  return (
    <HomeScreen
      onOpenDiscover={onOpenDiscover}
      onOpenDeal={onOpenDeal}
      onOpenBusinessSetup={onOpenBusinessSetup}
    />
  );
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
      const business = businesses.find(item => item.id === businessId);
      if (business) {
        navigation.push('BusinessProfile', { business });
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
      onOpenEnrollment={() => navigation.navigate('BusinessSetup')}
    />
  );
}

function BusinessProfileTabScreen() {
  const navigation = useNavigation<DiscoverStackNavigation>();
  const route = useRoute<RouteProp<DiscoverStackParamList, 'BusinessProfile'>>();
  return (
    <BusinessProfileScreen business={route.params.business} onBack={navigation.goBack} />
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
      <DiscoverStack.Screen name="BusinessProfile" component={BusinessProfileTabScreen} />
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

type SavedTabNavigation = BottomTabNavigationProp<MainTabParamList> &
  NativeStackNavigationProp<AppStackParamList>;

function SavedTabScreen() {
  const navigation = useNavigation<SavedTabNavigation>();
  const onOpenDeal = useCallback(
    (dealId: string) => navigation.navigate('DealDetail', { dealId }),
    [navigation],
  );
  const onOpenBusiness = useCallback(
    (businessName: string) => {
      const business = businesses.find(
        item => item.name.toLocaleLowerCase() === businessName.toLocaleLowerCase(),
      );
      if (business) {
        navigation.navigate('Tabs', {
          screen: 'Discover',
          params: {
            screen: 'BusinessProfile',
            params: { business },
          },
        });
      }
    },
    [navigation],
  );

  return (
    <SavedHubScreen
      onNotifications={() => navigation.navigate('Account', { screen: 'Notifications' })}
      onAccount={() => navigation.navigate('Account', { screen: 'More' })}
      onOpenDeal={onOpenDeal}
      onOpenBusiness={onOpenBusiness}
    />
  );
}

type AccountStackNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<AccountStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

const signOut = () => useAuthStore.getState().markUnauthenticated();

function AccountDashboardRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  const openDeal = useCallback(
    (id: string) => {
      if (id === 'my-deals') {
        navigation.navigate('MyDeals');
      } else if (id === 'urban-grill-lunch') {
        navigation.navigate('ClaimedDealPass', { dealId: id });
      } else if (id === 'glow-booking') {
        navigation.navigate('BookingDetail', { bookingNumber: id });
      } else {
        navigation.navigate('Deals');
      }
    },
    [navigation],
  );

  return (
    <CustomerDashboardScreen
      onNotifications={() => navigation.navigate('Notifications')}
      onOpenAccount={() => navigation.navigate('More')}
      onOpenDeal={openDeal}
      onOpenRewards={() => navigation.navigate('Rewards')}
      onOpenActivity={() => navigation.navigate('Activity')}
    />
  );
}

function MyDealsRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  return (
    <MyDealsHubScreen
      onAccount={() => navigation.navigate('More')}
      onOpenDeal={dealId => navigation.navigate('ClaimedDealPass', { dealId })}
    />
  );
}

function OrdersBookingsRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  return (
    <OrdersBookingsHubScreen
      onOpenOrder={orderNumber => navigation.navigate('OrderDetail', { orderNumber })}
      onOpenBooking={bookingNumber =>
        navigation.navigate('BookingDetail', { bookingNumber })
      }
      onNavigate={action => {
        if (action === 'support') navigation.navigate('AccountSettings');
      }}
    />
  );
}

function MessagesRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  return (
    <MessagesScreen
      onOpenConversation={merchant => navigation.navigate('Conversation', { merchant })}
    />
  );
}

function MoreRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  return (
    <MoreHubScreen
      onBack={() => navigation.goBack()}
      onOpenRewards={() => navigation.navigate('Rewards')}
      onOpenSavings={() => navigation.navigate('SavingsHistory')}
      onOpenActivity={() => navigation.navigate('Activity')}
      onOpenSaved={() => navigation.navigate('Saved')}
      onOpenNotifications={() => navigation.navigate('Notifications')}
      onOpenSettings={() => navigation.navigate('AccountSettings')}
      onOpenEditProfile={() => navigation.navigate('EditProfile')}
      onSignOut={signOut}
    />
  );
}

function ActivityRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  return (
    <MyActivityScreen
      onBack={() => navigation.goBack()}
      onOpenDeal={dealId => navigation.navigate('ClaimedDealPass', { dealId })}
      onViewReceipt={() => navigation.navigate('OrderDetail', {})}
    />
  );
}

function RewardsRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  return <RewardsScreen onBack={() => navigation.goBack()} />;
}

function SavingsHistoryRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  return <SavingsHistoryScreen onBack={() => navigation.goBack()} />;
}

function NotificationsRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  return <NotificationsCenterScreen onBack={() => navigation.goBack()} />;
}

function AccountSettingsRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  return (
    <AccountSettingsSecurityScreen
      onBack={() => navigation.goBack()}
      onSignOutAll={signOut}
    />
  );
}

function EditProfileRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  return (
    <EditProfileScreen
      onBack={() => navigation.goBack()}
      onSave={() => navigation.goBack()}
      onDiscard={() => navigation.goBack()}
    />
  );
}

function ClaimedDealPassRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  return (
    <ClaimedDealDetailPassScreen
      onBack={() => navigation.goBack()}
      onOpenChat={() => navigation.navigate('Conversation', {})}
    />
  );
}

function OrderDetailRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  return (
    <UrbanOrderDetailScreen
      onBack={() => navigation.goBack()}
      onChat={() => navigation.navigate('Conversation', {})}
    />
  );
}

function BookingDetailRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  return (
    <BookingDetailScreen
      onBack={() => navigation.goBack()}
      onChat={() => navigation.navigate('Conversation', {})}
    />
  );
}

function ConversationRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  return (
    <UrbanConversationScreen
      onBack={() => navigation.goBack()}
      onViewPass={() => navigation.navigate('ClaimedDealPass', {})}
    />
  );
}

export function AccountStackNavigator() {
  return (
    <AccountStack.Navigator screenOptions={{ headerShown: false }}>
      <AccountStack.Screen name="AccountDashboard" component={AccountDashboardRoute} />
      <AccountStack.Screen name="MyDeals" component={MyDealsRoute} />
      <AccountStack.Screen name="OrdersBookings" component={OrdersBookingsRoute} />
      <AccountStack.Screen name="Messages" component={MessagesRoute} />
      <AccountStack.Screen name="More" component={MoreRoute} />
      <AccountStack.Screen name="Activity" component={ActivityRoute} />
      <AccountStack.Screen name="Rewards" component={RewardsRoute} />
      <AccountStack.Screen name="SavingsHistory" component={SavingsHistoryRoute} />
      <AccountStack.Screen name="Notifications" component={NotificationsRoute} />
      <AccountStack.Screen name="AccountSettings" component={AccountSettingsRoute} />
      <AccountStack.Screen name="EditProfile" component={EditProfileRoute} />
      <AccountStack.Screen name="ClaimedDealPass" component={ClaimedDealPassRoute} />
      <AccountStack.Screen name="OrderDetail" component={OrderDetailRoute} />
      <AccountStack.Screen name="BookingDetail" component={BookingDetailRoute} />
      <AccountStack.Screen name="Conversation" component={ConversationRoute} />
    </AccountStack.Navigator>
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
        component={SavedTabScreen}
        options={{
          title: strings.home.tabSaved,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={strings.home.tabSaved} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountStackNavigator}
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
