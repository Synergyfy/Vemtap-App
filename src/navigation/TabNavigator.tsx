import { useOpenBusinessChat } from '@features/merchantChat/hooks/useOpenBusinessChat';
import { useHistoryBack } from '@navigation/useHistoryBack';
import { useHideTabBarOnFocus } from '@navigation/useHideTabBarOnFocus';
import { useOpenClaimChat } from '@features/merchantChat/hooks/useOpenClaimChat';
import { useConversationActions } from '@navigation/useConversationActions';
import { useCustomerThreads } from '@features/merchantChat/hooks/useCustomerMessaging';
import { useClaimPass } from '@features/myDeals/hooks/useMyClaims';
import { useTabBarStore } from '@store/tabBarStore';
import { useNavigation } from '@react-navigation/native';
import { tabRePressListenersFor } from '@navigation/navigationHistory';
import React, { useCallback, useMemo, useState } from 'react';
import {
  createBottomTabNavigator,
  type BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import {
  useRoute,
  type CompositeNavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import { useOptionalNavigation } from '@navigation/useOptionalNavigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { useLocationStore } from '@store/locationStore';
import { endSession } from '@features/auth/endSession';
import { FeaturedDealsScreen } from '@features/home/screens/FeaturedDealsScreen';
import { AccountHomeScreen } from '@features/accountHub/screens/AccountHomeScreen';
import { useOpenBusinessSetup } from '@features/business/hooks/useOpenBusinessSetup';
import { CustomerDashboardScreen } from '@features/accountHub/screens/CustomerDashboardScreen';
import { MyDealsHubScreen } from '@features/myDeals/screens/MyDealsHubScreen';
import { OrdersBookingsHubScreen } from '@features/order/screens/OrdersBookingsHubScreen';
import { PersonalHubNavigator } from '@navigation/PersonalHubNavigator';
import { UrbanOrderDetailScreen } from '@features/order/screens/UrbanOrderDetailScreen';
import { MessagesScreen } from '@features/merchantChat/screens/MessagesScreen';
import { ComposeMessageSheet } from '@features/merchantChat/components/ComposeMessageSheet';
import { UrbanConversationScreen } from '@features/merchantChat/screens/UrbanConversationScreen';
import { HelpCentreScreen } from '@features/accountHub/screens/HelpCentreScreen';
import { MoreHubScreen } from '@features/accountHub/screens/MoreHubScreen';
import { MyActivityScreen } from '@features/accountHub/screens/MyActivityScreen';
import { RewardsScreen } from '@features/accountHub/screens/RewardsScreen';
import { SavingsHistoryScreen } from '@features/accountHub/screens/SavingsHistoryScreen';
import { AccountSettingsSecurityScreen } from '@features/accountHub/screens/AccountSettingsSecurityScreen';
import { EditProfileScreen } from '@features/accountHub/screens/EditProfileScreen';
import { BookingDetailScreen } from '@features/accountHub/screens/BookingDetailScreen';
import { ClaimPassView } from '@navigation/ClaimPassView';
import { DealsDiscoveryScreen } from '@features/deals/screens/DealsDiscoveryScreen';
import { DiscoverScreen } from '@features/discover/screens/DiscoverScreen';
import { BusinessProfileScreen } from '@features/discover/screens/BusinessProfileScreen';
import { TabIcon } from '@navigation/TabIcon';
import { CenteredTabButton } from '@navigation/CenteredTabButton';
import type {
  AccountStackParamList,
  AppStackParamList,
  BusinessProfileSummary,
  DiscoverStackParamList,
  HomeStackParamList,
  MainTabParamList,
  RootStackParamList,
} from '@navigation/types';
import { strings } from '@constants/strings';
import { tabBarTopShadow } from '@theme/shadows';
import { typeMetrics } from '@theme/typography';
import { TypeDensityProvider } from '@theme/TypeDensityProvider';
import { useAuthStore } from '@store/authStore';
import { useHomeDistrictSync } from '@features/home/hooks/useHomeDistrictSync';

// A re-tap on the focused tab unwinds it to the screen its stack starts on. Each
// tab supplies its own base screen, because that is where its stack lives; the
// Deals tab has no stack of its own and is left out.
const rePressHome = tabRePressListenersFor('HomeFeed');
const rePressDiscover = tabRePressListenersFor('DiscoverHome');
const rePressAccount = tabRePressListenersFor('AccountHome');

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
  const navigation = useOptionalNavigation<DealsTabNavigation>();
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
    () => () =>
      navigation.navigate('Account', {
        screen: 'PersonalHub',
        params: { screen: 'PersonalNotifications' },
      }),
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
  const navigation = useOptionalNavigation<HomeStackNavigation>();
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
  const onOpenBusinessSetup = useOpenBusinessSetup();
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
    () => () =>
      navigation.navigate('Account', {
        screen: 'PersonalHub',
        params: { screen: 'PersonalNotifications' },
      }),
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
      onOpenProduct={productId => navigation.navigate('ProductDetail', { productId })}
    />
  );
}

function HomeFeaturedDealsScreen() {
  const goBack = useHistoryBack();

  const navigation = useNavigation<HomeStackNavigation>();
  const onOpenDeal = useMemo(
    () => (dealId: string) => navigation.navigate('DealDetail', { dealId }),
    [navigation],
  );
  const onOpenFilters = useMemo(
    () => () => navigation.navigate('DealFilters'),
    [navigation],
  );
  const onOpenBusinessSetup = useOpenBusinessSetup();

  return (
    <FeaturedDealsScreen
      onBack={goBack}
      onOpenDeal={onOpenDeal}
      onOpenFilters={onOpenFilters}
      onOpenBusinessSetup={onOpenBusinessSetup}
    />
  );
}

function HomeDealsDiscoveryScreen() {
  const navigation = useOptionalNavigation<HomeStackNavigation>();
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
    () => () =>
      navigation.navigate('Account', {
        screen: 'PersonalHub',
        params: { screen: 'PersonalNotifications' },
      }),
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

/** Cross-shell handoff to the personal hub's Messages tab via the Account tab. */
function useOpenPersonalMessages() {
  const navigation = useNavigation<DiscoverStackNavigation>();
  return useCallback(
    () =>
      navigation.navigate('Account', {
        screen: 'PersonalHub',
        params: { screen: 'PersonalMessages' },
      }),
    [navigation],
  );
}

function DiscoverHomeScreen() {
  const navigation = useNavigation<DiscoverStackNavigation>();
  const onOpenBusiness = useMemo(
    () => (businessId: string, fallbackBusiness?: BusinessProfileSummary) => {
      navigation.push('BusinessProfile', {
        code: businessId,
        business: fallbackBusiness,
      });
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
  const openBusinessSetup = useOpenBusinessSetup();

  return (
    <DiscoverScreen
      onOpenBusiness={onOpenBusiness}
      onOpenFilters={openFilters}
      onToggleMap={() => undefined}
      onOpenNotifications={() =>
        navigation.navigate('Account', {
          screen: 'PersonalHub',
          params: { screen: 'PersonalNotifications' },
        })
      }
      onOpenAccount={() => navigation.navigate('Tabs', { screen: 'Account' })}
      onOpenEnrollment={openBusinessSetup}
      onOpenLocationSelect={onOpenLocationSelect}
    />
  );
}

function BusinessProfileTabScreen() {
  const goBack = useHistoryBack();

  const route = useRoute<RouteProp<DiscoverStackParamList, 'BusinessProfile'>>();
  // Two sources for one screen: the bundled Discover businesses pass a
  // `business` summary, while a real offer passes the merchant's code and the
  // profile is fetched from `GET /public/businesses/code/:code`.
  //
  // Both are forwarded, never one-or-the-other. The feed hands over its summary
  // as a fallback while that fetch is in flight, but dropping `code` here used
  // to disable the request outright — the summary was then the only thing the
  // screen could render, and it carries no `branches[]`, so the booking flow
  // downstream had no branch to key off.
  const navigation = useNavigation<DiscoverStackNavigation>();
  const openMessages = useOpenPersonalMessages();
  const openChat = useOpenBusinessChat(
    useCallback(
      params =>
        navigation.navigate('Account', {
          screen: 'PersonalHub',
          params: { screen: 'PersonalConversation', params },
        }),
      [navigation],
    ),
  );
  return (
    <BusinessProfileScreen
      code={'code' in route.params ? route.params.code : undefined}
      business={'business' in route.params ? route.params.business : undefined}
      onBack={goBack}
      onOpenInApp={target => (target ? openChat.open(target) : openMessages())}
      onOpenService={target => navigation.navigate('ServiceDetail', target)}
      onOpenDeal={dealId => navigation.navigate('DealDetail', { dealId })}
      onOpenProduct={target => navigation.navigate('ProductDetail', target)}
      onOpenProducts={target => navigation.navigate('BusinessProducts', target)}
    />
  );
}

function DiscoverTabScreen() {
  return (
    <DiscoverStack.Navigator screenOptions={{ headerShown: false }}>
      <DiscoverStack.Screen name="DiscoverHome" component={DiscoverHomeScreen} />
      <DiscoverStack.Screen name="BusinessProfile" component={BusinessProfileTabScreen} />
    </DiscoverStack.Navigator>
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
 * Tears the whole session down — token, query cache, auth store, realtime
 * socket — from the shared helper, so a manual sign-out and a 401 expiry
 * cannot drift apart. Doing this by hand is what previously left a dead token
 * in secure storage, so every later request carried it and the flow could not
 * be re-run cleanly.
 */
const signOut = () => {
  const store = useAuthStore.getState();
  if (store.status === 'authenticated') {
    endSession().catch(() => undefined);
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
  const navigation = useOptionalNavigation<AccountStackNavigation>();
  return useMemo(
    () => ({
      myDeals: () => navigation.navigate('PersonalHub', { screen: 'PersonalMyDeals' }),
      messages: () => navigation.navigate('PersonalHub', { screen: 'PersonalMessages' }),
      orders: () => navigation.navigate('PersonalHub', { screen: 'PersonalOrders' }),
      rewards: () => navigation.navigate('PersonalHub', { screen: 'PersonalRewards' }),
      activity: () => navigation.navigate('PersonalHub', { screen: 'PersonalActivity' }),
      savings: () => navigation.navigate('PersonalHub', { screen: 'PersonalSavings' }),
      saved: () => navigation.navigate('PersonalHub', { screen: 'PersonalSaved' }),
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
  const navigation = useOptionalNavigation<AccountStackNavigation>();
  const personal = usePersonalFlowHandoff();
  const ownerAccount = useAuthStore(state => state.ownerAccount);
  const onOpenBusinessSetup = useOpenBusinessSetup();

  return (
    <AccountHomeScreen
      onOpenNotifications={personal.notifications}
      onOpenHelp={personal.helpCentre}
      onOpenAccountMenu={() => navigation.navigate('More')}
      onEditProfile={personal.editProfile}
      // Enters the personal-hub shell, which owns the personal bottom navigation
      // (Home · My Deals · Messages · Orders · More) for the whole personal flow.
      onOpenCustomerDashboard={() => navigation.navigate('PersonalHub')}
      // Messages is a personal-flow screen, so the row hands off to the shell that
      // owns it rather than pushing a second copy under the consumer bar.
      onOpenMessages={personal.messages}
      onOpenDeals={personal.myDeals}
      onOpenOrders={personal.orders}
      onOpenSavings={personal.savings}
      onOpenSaved={personal.saved}
      onOpenPrivacy={personal.settings}
      onOpenHelpCentre={personal.helpCentre}
      onOpenTerms={personal.settings}
      onOpenBusinessSetup={onOpenBusinessSetup}
      businessCtaLabel={ownerAccount ? strings.accountHome.switchToBusiness : undefined}
      onSignOut={signOut}
    />
  );
}

function AccountDashboardRoute() {
  const navigation = useOptionalNavigation<AccountStackNavigation>();
  const openDeal = useCallback(
    (id: string) => {
      if (id === 'my-deals') {
        navigation.navigate('PersonalHub', { screen: 'PersonalMyDeals' });
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
      onShop={() => navigation.navigate('Home')}
      onOpenAccount={() => navigation.navigate('PersonalHub', { screen: 'PersonalMore' })}
      onOpenDeal={openDeal}
      onOpenOffer={dealId => navigation.navigate('DealDetail', { dealId })}
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
  const navigation = useOptionalNavigation<AccountStackNavigation>();
  return (
    <MyDealsHubScreen
      onAccount={() => navigation.navigate('More')}
      onOpenClaim={claimId => navigation.navigate('ClaimedDealPass', { claimId })}
    />
  );
}

function OrdersBookingsRoute() {
  const goBack = useHistoryBack();

  const navigation = useNavigation<AccountStackNavigation>();
  return (
    <OrdersBookingsHubScreen
      onBack={goBack}
      onOpenOrder={orderId => navigation.navigate('OrderDetail', { orderId })}
      onOpenBooking={bookingId => navigation.navigate('BookingDetail', { bookingId })}
      onNavigate={action => {
        if (action === 'support') navigation.navigate('AccountSettings');
      }}
    />
  );
}

function MessagesRoute() {
  const goBack = useHistoryBack();
  const [composing, setComposing] = useState(false);

  const navigation = useNavigation<AccountStackNavigation>();
  return (
    <>
      <MessagesScreen
        onBack={goBack}
        onOpenConversation={threadId => navigation.navigate('Conversation', { threadId })}
        onCompose={() => setComposing(true)}
      />
      <ComposeMessageSheet visible={composing} onClose={() => setComposing(false)} />
    </>
  );
}

function MoreRoute() {
  const goBack = useHistoryBack();

  const personal = usePersonalFlowHandoff();
  return (
    <MoreHubScreen
      onBack={goBack}
      onOpenRewards={personal.rewards}
      onOpenSavings={personal.savings}
      onOpenActivity={personal.activity}
      onOpenSaved={personal.saved}
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
  const goBack = useHistoryBack();

  const navigation = useNavigation<AccountStackNavigation>();
  return (
    <HelpCentreScreen
      onBack={goBack}
      onStartChat={() => navigation.navigate('Messages')}
      onOwnBusiness={() => navigation.navigate('EditProfile')}
    />
  );
}

function ActivityRoute() {
  const goBack = useHistoryBack();

  const navigation = useNavigation<AccountStackNavigation>();
  return (
    <MyActivityScreen
      onBack={goBack}
      onOpenClaim={dealId => navigation.navigate('ClaimedDealPass', { dealId })}
      onOpenOrder={orderId => navigation.navigate('OrderDetail', { orderId })}
      onOpenBooking={bookingId => navigation.navigate('BookingDetail', { bookingId })}
      // Deal and product pages live on the root app stack; navigate bubbles up.
      onOpenDeal={dealId =>
        (navigation.navigate as (name: string, params: object) => void)('DealDetail', {
          dealId,
        })
      }
      onOpenProduct={productId =>
        (navigation.navigate as (name: string, params: object) => void)('ProductDetail', {
          productId,
        })
      }
    />
  );
}

function RewardsRoute() {
  const goBack = useHistoryBack();

  return (
    <TypeDensityProvider density="dense">
      <RewardsScreen onBack={goBack} />
    </TypeDensityProvider>
  );
}

function SavingsHistoryRoute() {
  const goBack = useHistoryBack();

  return <SavingsHistoryScreen onBack={goBack} />;
}

function AccountSettingsRoute() {
  const goBack = useHistoryBack();

  return <AccountSettingsSecurityScreen onBack={goBack} onSignOutAll={signOut} />;
}

function EditProfileRoute() {
  const goBack = useHistoryBack();

  const navigation = useNavigation<AccountStackNavigation>();
  return (
    <EditProfileScreen
      onBack={goBack}
      onSave={() => navigation.goBack()}
      onDiscard={() => navigation.goBack()}
    />
  );
}

function ClaimedDealPassRoute() {
  const goBack = useHistoryBack();

  const navigation = useNavigation<AccountStackNavigation>();
  const route = useRoute<RouteProp<AccountStackParamList, 'ClaimedDealPass'>>();
  const pass = useClaimPass({
    claimId: route.params?.claimId,
    offerId: route.params?.dealId,
  });
  const openChat = useOpenClaimChat(pass.claim, params =>
    navigation.navigate('Conversation', params),
  );
  return (
    <ClaimPassView
      pass={pass}
      onBack={goBack}
      onOpenChat={openChat}
      navigate={navigation.navigate as (route: string, params: object) => void}
    />
  );
}

function OrderDetailRoute() {
  const goBack = useHistoryBack();

  const navigation = useNavigation<AccountStackNavigation>();
  const route = useRoute<RouteProp<AccountStackParamList, 'OrderDetail'>>();
  return (
    <UrbanOrderDetailScreen
      orderId={route.params?.orderId}
      onBack={goBack}
      onChat={() => navigation.navigate('Conversation', {})}
      // Checkout lives on the parent app stack, which this stack's type does
      // not describe; navigate bubbles up to it.
      onReorder={draft =>
        (navigation.navigate as (name: string, params: object) => void)('OrderCheckout', {
          draft,
        })
      }
    />
  );
}

function BookingDetailRoute() {
  const goBack = useHistoryBack();
  const route = useRoute<RouteProp<AccountStackParamList, 'BookingDetail'>>();

  const navigation = useNavigation<AccountStackNavigation>();
  return (
    <BookingDetailScreen
      onBack={goBack}
      bookingId={route.params?.bookingId}
      onChat={() => navigation.navigate('Conversation', {})}
    />
  );
}

function ConversationRoute() {
  const goBack = useHistoryBack();
  useHideTabBarOnFocus();

  const navigation = useNavigation<AccountStackNavigation>();
  const route = useRoute<RouteProp<AccountStackParamList, 'Conversation'>>();

  // The thread and its linked claim drive which actions the navbar can offer.
  const threadsQuery = useCustomerThreads();
  const thread = (threadsQuery.data ?? []).find(
    item => item.id === route.params?.threadId,
  );
  const branchCode = thread?.branch?.code ?? undefined;
  const branchPhone = thread?.branch?.phone ?? undefined;
  const claimId = route.params?.claimId ?? thread?.claimId ?? undefined;

  const { props: actions, sheet } = useConversationActions({
    hasClaim: claimId != null,
    claimId,
    branchCode,
    branchPhone,
    onOpenBusiness: code =>
      navigation.navigate('Discover', {
        screen: 'BusinessProfile',
        params: { code },
      }),
    onOpenPass: id => navigation.navigate('ClaimedDealPass', { claimId: id }),
  });

  return (
    <>
      <UrbanConversationScreen
        threadId={route.params?.threadId}
        claimId={claimId}
        onBack={goBack}
        onViewPass={id => navigation.navigate('ClaimedDealPass', { claimId: id })}
        {...actions}
      />
      {sheet}
    </>
  );
}

export function AccountStackNavigator() {
  return (
    <TypeDensityProvider density="comfortable">
      <AccountStack.Navigator screenOptions={{ headerShown: false }}>
        <AccountStack.Screen name="AccountHome" component={AccountHomeRoute} />
        {/*
          Nested inside the Account tab on purpose: the tab's bottom navigation
          stays visible on every personal page instead of being covered by a
          root-level screen.
        */}
        <AccountStack.Screen name="PersonalHub" component={PersonalHubNavigator} />
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
  // The consumer shell: keep the account's home district in step with the area.
  useHomeDistrictSync();
  const isTabBarHidden = useTabBarStore(state => state.isTabBarHidden);

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
      // The conversation view is a full-height canvas, so it asks for the bar
      // to be hidden while it is focused (`useHideTabBarOnFocus`).
      tabBarStyle: isTabBarHidden
        ? { display: 'none' as const }
        : {
            height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
            paddingTop: 0,
            paddingBottom: insets.bottom,
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            ...tabBarTopShadow,
          },
    }),
    [insets.bottom, isTabBarHidden],
  );

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeTabScreen}
        listeners={rePressHome}
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
        listeners={rePressDiscover}
        options={{
          title: strings.home.tabBusiness,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={strings.home.tabBusiness} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountStackNavigator}
        listeners={rePressAccount}
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
