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
import { useLocationStore } from '@store/locationStore';
import { queryClient } from '@store/queryClient';
import { clearSecureStorage } from '@utils/secureStorage';
import { FeaturedDealsScreen } from '@features/home/screens/FeaturedDealsScreen';
import { SavedHubScreen } from '@features/accountHub/screens/SavedHubScreen';
import { AccountHomeScreen } from '@features/accountHub/screens/AccountHomeScreen';
import { CustomerDashboardScreen } from '@features/accountHub/screens/CustomerDashboardScreen';
import { MyDealsHubScreen } from '@features/myDeals/screens/MyDealsHubScreen';
import { OrdersBookingsHubScreen } from '@features/order/screens/OrdersBookingsHubScreen';
import { UrbanOrderDetailScreen } from '@features/order/screens/UrbanOrderDetailScreen';
import { MessagesScreen } from '@features/merchantChat/screens/MessagesScreen';
import { UrbanConversationScreen } from '@features/merchantChat/screens/UrbanConversationScreen';
import { HelpCentreScreen } from '@features/accountHub/screens/HelpCentreScreen';
import { MoreHubScreen } from '@features/accountHub/screens/MoreHubScreen';
import { MyActivityScreen } from '@features/accountHub/screens/MyActivityScreen';
import { RewardsScreen } from '@features/accountHub/screens/RewardsScreen';
import { SavingsHistoryScreen } from '@features/accountHub/screens/SavingsHistoryScreen';
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
  RootStackParamList,
} from '@navigation/types';
import { businesses } from '@features/discover/data/discoverData';
import { strings } from '@constants/strings';
import { tabBarTopShadow } from '@theme/shadows';
import { typeMetrics } from '@theme/typography';
import { TypeDensityProvider } from '@theme/TypeDensityProvider';
import { useAuthStore } from '@store/authStore';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const DiscoverStack = createNativeStackNavigator<DiscoverStackParamList>();
const AccountStack = createNativeStackNavigator<AccountStackParamList>();

/** Visible footer height above the home-indicator inset. */
const TAB_BAR_CONTENT_HEIGHT = 64;

type DealsTabNavigation = BottomTabNavigationProp<MainTabParamList> &
  NativeStackNavigationProp<AppStackParamList> &
  NativeStackNavigationProp<RootStackParamList>;

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

  // Same shared selection page Home uses, reached by bubbling to the root stack.
  const area = useLocationStore(state => state.area);
  const onOpenLocationSelect = useMemo(
    () => () => navigation.navigate('LocationSelect', { currentArea: area }),
    [area, navigation],
  );
  // Notifications and the account hub live in the account shell, so the bell
  // hands off across shells instead of duplicating those screens here.
  const onOpenNotifications = useMemo(
    () => () => navigation.navigate('PersonalHub', { screen: 'PersonalNotifications' }),
    [navigation],
  );
  const onOpenAccount = useMemo(
    () => () => navigation.navigate('Account', { screen: 'AccountHome' }),
    [navigation],
  );

  return (
    <DealsDiscoveryScreen
      variant="featured"
      onOpenFilters={onOpenFilters}
      onOpenDeal={onOpenDeal}
      onOpenLocationSelect={onOpenLocationSelect}
      onOpenNotifications={onOpenNotifications}
      onOpenAccount={onOpenAccount}
    />
  );
}

type HomeStackNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    CompositeNavigationProp<
      NativeStackNavigationProp<AppStackParamList>,
      NativeStackNavigationProp<RootStackParamList>
    >
  >
>;

function HomeFeedScreen() {
  const navigation = useNavigation<HomeStackNavigation>();
  // The store is the single source for the district/radius both consumer
  // navbars read, so the selection page only has to write to it.
  const area = useLocationStore(state => state.area);
  const openLocationSelect = useCallback(
    () => navigation.navigate('LocationSelect', { currentArea: area }),
    [area, navigation],
  );
  const onOpenDiscover = useMemo(
    () => () => navigation.push('DealsDiscovery'),
    [navigation],
  );
  const onOpenDeal = useMemo(
    () => (dealId: string) => navigation.navigate('DealDetail', { dealId }),
    [navigation],
  );
  // Home's search-bar filter icon opens the same shared page as the Deals feed,
  // so both surfaces filter through one implementation.
  const openFilters = useMemo(
    () => () => navigation.navigate('DealFilters'),
    [navigation],
  );
  const onOpenBusinessSetup = useMemo(
    () => () => navigation.navigate('BusinessSetup'),
    [navigation],
  );
  const onOpenDealsTab = useMemo(() => () => navigation.navigate('Deals'), [navigation]);
  const onOpenDiscoverTab = useMemo(
    () => () => navigation.navigate('Discover'),
    [navigation],
  );
  const onOpenFeaturedDeals = useMemo(
    () => () => navigation.navigate('HomeFeaturedDeals'),
    [navigation],
  );
  const onOpenNotifications = useMemo(
    () => () => navigation.navigate('PersonalHub', { screen: 'PersonalNotifications' }),
    [navigation],
  );
  const onOpenAccount = useMemo(
    () => () => navigation.navigate('Account', { screen: 'AccountHome' }),
    [navigation],
  );

  return (
    <HomeScreen
      onOpenDiscover={onOpenDiscover}
      onOpenFilters={openFilters}
      onOpenDeal={onOpenDeal}
      onOpenBusinessSetup={onOpenBusinessSetup}
      onOpenDealsTab={onOpenDealsTab}
      onOpenDiscoverTab={onOpenDiscoverTab}
      onOpenFeaturedDeals={onOpenFeaturedDeals}
      onOpenLocationSelect={openLocationSelect}
      onSearchArea={openLocationSelect}
      onOpenNotifications={onOpenNotifications}
      onOpenAccount={onOpenAccount}
    />
  );
}

function HomeFeaturedDealsScreen() {
  const navigation = useNavigation<HomeStackNavigation>();
  const onOpenDeal = useMemo(
    () => (dealId: string) => navigation.navigate('DealDetail', { dealId }),
    [navigation],
  );
  const onOpenFilters = useMemo(
    () => () => navigation.navigate('DealFilters'),
    [navigation],
  );
  const onOpenBusinessSetup = useMemo(
    () => () => navigation.navigate('BusinessSetup'),
    [navigation],
  );

  return (
    <FeaturedDealsScreen
      onBack={navigation.goBack}
      onOpenDeal={onOpenDeal}
      onOpenFilters={onOpenFilters}
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
  // Same shared selection page the Deals tab and Home navbar use, so all three
  // bars agree on the active district and write through one store.
  const area = useLocationStore(state => state.area);
  const onOpenLocationSelect = useMemo(
    () => () => navigation.navigate('LocationSelect', { currentArea: area }),
    [area, navigation],
  );
  const onOpenNotifications = useMemo(
    () => () => navigation.navigate('PersonalHub', { screen: 'PersonalNotifications' }),
    [navigation],
  );
  const onOpenAccount = useMemo(
    () => () => navigation.navigate('Account', { screen: 'AccountHome' }),
    [navigation],
  );

  return (
    <DealsDiscoveryScreen
      variant="standard"
      onOpenFilters={onOpenFilters}
      onOpenDeal={onOpenDeal}
      onOpenLocationSelect={onOpenLocationSelect}
      onOpenNotifications={onOpenNotifications}
      onOpenAccount={onOpenAccount}
    />
  );
}

function HomeTabScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeFeed" component={HomeFeedScreen} />
      <HomeStack.Screen name="DealsDiscovery" component={HomeDealsDiscoveryScreen} />
      <HomeStack.Screen name="HomeFeaturedDeals" component={HomeFeaturedDealsScreen} />
    </HomeStack.Navigator>
  );
}

type DiscoverStackNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<DiscoverStackParamList>,
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    CompositeNavigationProp<
      NativeStackNavigationProp<AppStackParamList>,
      NativeStackNavigationProp<RootStackParamList>
    >
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

  // The same shared district-selection page the Home and Deals navbars use.
  const area = useLocationStore(state => state.area);
  const onOpenLocationSelect = useMemo(
    () => () => navigation.navigate('LocationSelect', { currentArea: area }),
    [area, navigation],
  );

  // Discover's filter icon is a real control, so it opens the shared filter
  // page rather than a Discover-only variant.
  const openFilters = useMemo(
    () => () => navigation.navigate('DealFilters'),
    [navigation],
  );

  return (
    <DiscoverScreen
      onOpenBusiness={onOpenBusiness}
      onOpenFilters={openFilters}
      onToggleMap={() => undefined}
      onOpenNotifications={() => undefined}
      onOpenAccount={() => navigation.navigate('Tabs', { screen: 'Account' })}
      onOpenEnrollment={() => navigation.navigate('BusinessSetup')}
      onOpenLocationSelect={onOpenLocationSelect}
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
  NativeStackNavigationProp<AppStackParamList> &
  NativeStackNavigationProp<RootStackParamList>;

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
      onBack={navigation.goBack}
      onNotifications={() =>
        navigation.navigate('PersonalHub', { screen: 'PersonalNotifications' })
      }
      onOpenDeal={onOpenDeal}
      onOpenBusiness={onOpenBusiness}
      onOpenService={onOpenDeal}
    />
  );
}

type AccountStackNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<AccountStackParamList>,
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

/**
 * `markUnauthenticated` alone left the bearer token in secure storage, so every
 * later request still carried a dead token and the flow could not be re-run
 * cleanly. Delegate to the logout hook so storage and the query cache clear too.
 */
const signOut = () => {
  const store = useAuthStore.getState();
  if (store.status === 'authenticated') {
    queryClient.clear();
    clearSecureStorage()
      .catch(() => undefined)
      .finally(() => store.clearSession());
  } else {
    store.markUnauthenticated();
  }
};

/**
 * Personal-flow destinations (My Deals, Messages, Orders, Rewards, …) are hosted by
 * the personal-hub shell, which owns the personal bottom navigation. Handing them
 * off here guarantees one screen → one bar, instead of the same screen rendering
 * under the consumer nav when opened from Account.
 */
function usePersonalFlowHandoff() {
  const navigation = useNavigation<AccountStackNavigation>();
  return useMemo(
    () => ({
      myDeals: () => navigation.navigate('PersonalHub', { screen: 'PersonalMyDeals' }),
      messages: () => navigation.navigate('PersonalHub', { screen: 'PersonalMessages' }),
      orders: () => navigation.navigate('PersonalHub', { screen: 'PersonalOrders' }),
      rewards: () => navigation.navigate('PersonalHub', { screen: 'PersonalRewards' }),
      activity: () => navigation.navigate('PersonalHub', { screen: 'PersonalActivity' }),
      savings: () => navigation.navigate('PersonalHub', { screen: 'PersonalSavings' }),
      notifications: () =>
        navigation.navigate('PersonalHub', { screen: 'PersonalNotifications' }),
      settings: () => navigation.navigate('PersonalHub', { screen: 'PersonalSettings' }),
      editProfile: () =>
        navigation.navigate('PersonalHub', { screen: 'PersonalEditProfile' }),
      helpCentre: () =>
        navigation.navigate('PersonalHub', { screen: 'PersonalHelpCentre' }),
    }),
    [navigation],
  );
}

function AccountHomeRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  const personal = usePersonalFlowHandoff();
  return (
    <AccountHomeScreen
      onOpenNotifications={personal.notifications}
      onOpenHelp={personal.helpCentre}
      onOpenAccountMenu={() => navigation.navigate('More')}
      onEditProfile={personal.editProfile}
      // Enters the personal-hub shell, which owns the personal bottom navigation
      // (Home · My Deals · Messages · Orders · More) for the whole personal flow.
      onOpenCustomerDashboard={() => navigation.navigate('PersonalHub')}
      onOpenDeals={personal.myDeals}
      onOpenOrders={personal.orders}
      onOpenSavings={personal.savings}
      onOpenSaved={() => navigation.navigate('Saved')}
      onOpenPrivacy={personal.settings}
      onOpenHelpCentre={personal.helpCentre}
      onOpenTerms={personal.settings}
      onSignOut={signOut}
    />
  );
}

function AccountDashboardRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  const openDeal = useCallback(
    (id: string) => {
      if (id === 'my-deals') {
        navigation.navigate('PersonalHub', { screen: 'PersonalMyDeals' });
      } else if (id === 'urban-grill-lunch') {
        navigation.navigate('PersonalHub', {
          screen: 'PersonalHome',
          params: { deepLink: { screen: 'PersonalClaimedDealPass', dealId: id } },
        });
      } else if (id === 'glow-booking') {
        navigation.navigate('PersonalHub', {
          screen: 'PersonalHome',
          params: {
            deepLink: { screen: 'PersonalBookingDetail', bookingNumber: id },
          },
        });
      } else {
        navigation.navigate('Deals');
      }
    },
    [navigation],
  );

  return (
    <CustomerDashboardScreen
      onNotifications={() =>
        navigation.navigate('PersonalHub', { screen: 'PersonalNotifications' })
      }
      onOpenAccount={() => navigation.navigate('PersonalHub', { screen: 'PersonalMore' })}
      onOpenDeal={openDeal}
      onOpenRewards={() =>
        navigation.navigate('PersonalHub', { screen: 'PersonalRewards' })
      }
      onOpenActivity={() =>
        navigation.navigate('PersonalHub', { screen: 'PersonalActivity' })
      }
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
      onBack={navigation.goBack}
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
      onBack={navigation.goBack}
      onOpenConversation={merchant => navigation.navigate('Conversation', { merchant })}
    />
  );
}

function MoreRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  const personal = usePersonalFlowHandoff();
  return (
    <MoreHubScreen
      onBack={() => navigation.goBack()}
      onOpenRewards={personal.rewards}
      onOpenSavings={personal.savings}
      onOpenActivity={personal.activity}
      onOpenSaved={() => navigation.navigate('Saved')}
      onOpenNotifications={personal.notifications}
      onOpenSettings={personal.settings}
      onOpenOrders={personal.orders}
      onOpenEditProfile={personal.editProfile}
      onOpenHelpCentre={personal.helpCentre}
      onSignOut={signOut}
    />
  );
}

function HelpCentreRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  return (
    <HelpCentreScreen
      onBack={() => navigation.goBack()}
      onStartChat={() => navigation.navigate('Messages')}
      onOwnBusiness={() => navigation.navigate('EditProfile')}
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
  return (
    <TypeDensityProvider density="dense">
      <RewardsScreen onBack={() => navigation.goBack()} />
    </TypeDensityProvider>
  );
}

function SavingsHistoryRoute() {
  const navigation = useNavigation<AccountStackNavigation>();
  return <SavingsHistoryScreen onBack={() => navigation.goBack()} />;
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
    <TypeDensityProvider density="comfortable">
      <AccountStack.Navigator screenOptions={{ headerShown: false }}>
        <AccountStack.Screen name="AccountHome" component={AccountHomeRoute} />
        <AccountStack.Screen name="AccountDashboard" component={AccountDashboardRoute} />
        <AccountStack.Screen name="MyDeals" component={MyDealsRoute} />
        <AccountStack.Screen name="OrdersBookings" component={OrdersBookingsRoute} />
        <AccountStack.Screen name="Messages" component={MessagesRoute} />
        <AccountStack.Screen name="More" component={MoreRoute} />
        <AccountStack.Screen name="HelpCentre" component={HelpCentreRoute} />
        <AccountStack.Screen name="Activity" component={ActivityRoute} />
        <AccountStack.Screen name="Rewards" component={RewardsRoute} />
        <AccountStack.Screen name="SavingsHistory" component={SavingsHistoryRoute} />
        <AccountStack.Screen name="AccountSettings" component={AccountSettingsRoute} />
        <AccountStack.Screen name="EditProfile" component={EditProfileRoute} />
        <AccountStack.Screen name="ClaimedDealPass" component={ClaimedDealPassRoute} />
        <AccountStack.Screen name="OrderDetail" component={OrderDetailRoute} />
        <AccountStack.Screen name="BookingDetail" component={BookingDetailRoute} />
        <AccountStack.Screen name="Conversation" component={ConversationRoute} />
      </AccountStack.Navigator>
    </TypeDensityProvider>
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
      // Small but readable labels under each icon (type scale: micro / 11px).
      tabBarLabelStyle: {
        ...typeMetrics('micro'),
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
