import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  useNavigation,
  useRoute,
  type CompositeNavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PersonalHubTabBar } from '@features/accountHub/components/PersonalHubTabBar';
import { CustomerDashboardScreen } from '@features/accountHub/screens/CustomerDashboardScreen';
import { MoreHubScreen } from '@features/accountHub/screens/MoreHubScreen';
import { MyActivityScreen } from '@features/accountHub/screens/MyActivityScreen';
import { RewardsScreen } from '@features/accountHub/screens/RewardsScreen';
import { SavingsHistoryScreen } from '@features/accountHub/screens/SavingsHistoryScreen';
import { NotificationsCenterScreen } from '@features/accountHub/screens/NotificationsCenterScreen';
import { AccountSettingsSecurityScreen } from '@features/accountHub/screens/AccountSettingsSecurityScreen';
import { EditProfileScreen } from '@features/accountHub/screens/EditProfileScreen';
import { HelpCentreScreen } from '@features/accountHub/screens/HelpCentreScreen';
import { ClaimedDealDetailPassScreen } from '@features/claimedDeal/screens/ClaimedDealDetailPassScreen';
import { MyDealsHubScreen } from '@features/myDeals/screens/MyDealsHubScreen';
import { MessagesScreen } from '@features/merchantChat/screens/MessagesScreen';
import { UrbanConversationScreen } from '@features/merchantChat/screens/UrbanConversationScreen';
import { OrdersBookingsHubScreen } from '@features/order/screens/OrdersBookingsHubScreen';
import { UrbanOrderDetailScreen } from '@features/order/screens/UrbanOrderDetailScreen';
import { BookingDetailScreen } from '@features/accountHub/screens/BookingDetailScreen';
import { TypeDensityProvider } from '@theme/TypeDensityProvider';
import type {
  AppStackParamList,
  PersonalHubParamList,
  RootStackParamList,
} from './types';

const Tab = createBottomTabNavigator<PersonalHubParamList>();
const HomeStack = createNativeStackNavigator<PersonalHubParamList>();
const DealsStack = createNativeStackNavigator<PersonalHubParamList>();
const MessagesStack = createNativeStackNavigator<PersonalHubParamList>();
const OrdersStack = createNativeStackNavigator<PersonalHubParamList>();
const MoreStack = createNativeStackNavigator<PersonalHubParamList>();

const stackOptions = { headerShown: false } as const;

type HubNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<PersonalHubParamList>,
  CompositeNavigationProp<
    BottomTabNavigationProp<PersonalHubParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

/** The overview is the personal hub's Home tab, so its actions stay in-shell. */
function PersonalHomeRoute() {
  const navigation = useNavigation<HubNavigation>();
  const route = useRoute<RouteProp<PersonalHubParamList, 'PersonalHome'>>();
  const deepLink = route.params?.deepLink;

  // Deep links (claimed deal pass, booking detail) resolve inside this shell so the
  // personal bottom navigation stays visible instead of handing off to AppStack.
  useEffect(() => {
    if (!deepLink) return;
    if (deepLink.screen === 'PersonalClaimedDealPass') {
      navigation.navigate('PersonalClaimedDealPass', { dealId: deepLink.dealId });
    } else {
      navigation.navigate('PersonalBookingDetail', {
        bookingNumber: deepLink.bookingNumber,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepLink?.screen]);

  return (
    <CustomerDashboardScreen
      onNotifications={() => navigation.navigate('PersonalNotifications')}
      onOpenAccount={() => navigation.navigate('PersonalMore')}
      onOpenRewards={() => navigation.navigate('PersonalRewards')}
      onOpenActivity={() => navigation.navigate('PersonalActivity')}
      onOpenDeal={dealId => {
        if (dealId === 'my-deals') {
          navigation.navigate('PersonalMyDeals');
        } else {
          navigation.navigate('PersonalClaimedDealPass', { dealId });
        }
      }}
    />
  );
}

function PersonalMyDealsRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <MyDealsHubScreen
      onAccount={() => navigation.navigate('PersonalMore')}
      onOpenDeal={dealId => navigation.navigate('PersonalClaimedDealPass', { dealId })}
    />
  );
}

function PersonalMessagesRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <MessagesScreen
      onBack={navigation.goBack}
      onOpenConversation={merchant =>
        navigation.navigate('PersonalConversation', { merchant })
      }
    />
  );
}

function PersonalConversationRoute() {
  const navigation = useNavigation<HubNavigation>();
  return <UrbanConversationScreen onBack={navigation.goBack} />;
}

function PersonalOrdersRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <OrdersBookingsHubScreen
      onBack={navigation.goBack}
      onOpenOrder={orderNumber =>
        navigation.navigate('PersonalOrderDetail', { orderNumber })
      }
      onOpenBooking={bookingNumber =>
        navigation.navigate('PersonalBookingDetail', { bookingNumber })
      }
    />
  );
}

function PersonalOrderDetailRoute() {
  const navigation = useNavigation<HubNavigation>();
  return <UrbanOrderDetailScreen onBack={navigation.goBack} />;
}

function PersonalBookingDetailRoute() {
  const navigation = useNavigation<HubNavigation>();
  return <BookingDetailScreen onBack={navigation.goBack} />;
}

function PersonalMoreRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <MoreHubScreen
      onBack={navigation.goBack}
      onOpenSaved={() => undefined}
      onOpenOrders={() => navigation.navigate('PersonalOrders')}
      onOpenRewards={() => navigation.navigate('PersonalRewards')}
      onOpenSavings={() => navigation.navigate('PersonalSavings')}
      onOpenActivity={() => navigation.navigate('PersonalActivity')}
      onOpenNotifications={() => navigation.navigate('PersonalNotifications')}
      onOpenSettings={() => navigation.navigate('PersonalSettings')}
      onOpenEditProfile={() => navigation.navigate('PersonalEditProfile')}
      onOpenHelpCentre={() => navigation.navigate('PersonalHelpCentre')}
      onSignOut={() => undefined}
    />
  );
}

function PersonalRewardsRoute() {
  const navigation = useNavigation<HubNavigation>();
  // Rewards is a dense hub: keep the same density it has in the Account stack.
  return (
    <TypeDensityProvider density="dense">
      <RewardsScreen onBack={navigation.goBack} />
    </TypeDensityProvider>
  );
}

function PersonalActivityRoute() {
  const navigation = useNavigation<HubNavigation>();
  return <MyActivityScreen onBack={navigation.goBack} />;
}

function PersonalSavingsRoute() {
  const navigation = useNavigation<HubNavigation>();
  return <SavingsHistoryScreen onBack={navigation.goBack} />;
}

function PersonalNotificationsRoute() {
  const navigation = useNavigation<HubNavigation>();
  return <NotificationsCenterScreen onBack={navigation.goBack} />;
}

function PersonalSettingsRoute() {
  const navigation = useNavigation<HubNavigation>();
  return <AccountSettingsSecurityScreen onBack={navigation.goBack} />;
}

function PersonalEditProfileRoute() {
  const navigation = useNavigation<HubNavigation>();
  return <EditProfileScreen onBack={navigation.goBack} />;
}

function PersonalHelpCentreRoute() {
  const navigation = useNavigation<HubNavigation>();
  return <HelpCentreScreen onBack={navigation.goBack} />;
}

function PersonalClaimedDealPassRoute() {
  const navigation = useNavigation<HubNavigation>();
  return <ClaimedDealDetailPassScreen onBack={navigation.goBack} />;
}

/** Personal-flow screens reachable from the overview, kept inside the personal shell. */
const personalFlowScreens: Array<[keyof PersonalHubParamList, React.ComponentType<any>]> =
  [
    ['PersonalRewards', PersonalRewardsRoute],
    ['PersonalActivity', PersonalActivityRoute],
    ['PersonalSavings', PersonalSavingsRoute],
    ['PersonalNotifications', PersonalNotificationsRoute],
    ['PersonalSettings', PersonalSettingsRoute],
    ['PersonalEditProfile', PersonalEditProfileRoute],
    ['PersonalHelpCentre', PersonalHelpCentreRoute],
    ['PersonalClaimedDealPass', PersonalClaimedDealPassRoute],
  ];

function HomeFlowStack() {
  return (
    <HomeStack.Navigator screenOptions={stackOptions}>
      <HomeStack.Screen name="PersonalHomeOverview" component={PersonalHomeRoute} />
      {personalFlowScreens.map(([name, component]) => (
        <HomeStack.Screen key={name} name={name} component={component} />
      ))}
    </HomeStack.Navigator>
  );
}

function DealsFlowStack() {
  return (
    <DealsStack.Navigator screenOptions={stackOptions}>
      <DealsStack.Screen name="PersonalMyDealsList" component={PersonalMyDealsRoute} />
      <DealsStack.Screen
        name="PersonalClaimedDealPass"
        component={PersonalClaimedDealPassRoute}
      />
    </DealsStack.Navigator>
  );
}

function MessagesFlowStack() {
  return (
    <MessagesStack.Navigator screenOptions={stackOptions}>
      <MessagesStack.Screen
        name="PersonalMessagesInbox"
        component={PersonalMessagesRoute}
      />
      <MessagesStack.Screen
        name="PersonalConversation"
        component={PersonalConversationRoute}
      />
    </MessagesStack.Navigator>
  );
}

function OrdersFlowStack() {
  return (
    <OrdersStack.Navigator screenOptions={stackOptions}>
      <OrdersStack.Screen name="PersonalOrdersBookings" component={PersonalOrdersRoute} />
      <OrdersStack.Screen
        name="PersonalOrderDetail"
        component={PersonalOrderDetailRoute}
      />
      <OrdersStack.Screen
        name="PersonalBookingDetail"
        component={PersonalBookingDetailRoute}
      />
    </OrdersStack.Navigator>
  );
}

function MoreFlowStack() {
  return (
    <MoreStack.Navigator screenOptions={stackOptions}>
      <MoreStack.Screen name="PersonalMoreHub" component={PersonalMoreRoute} />
      {personalFlowScreens
        .filter(([name]) => name !== 'PersonalClaimedDealPass')
        .map(([name, component]) => (
          <MoreStack.Screen key={name} name={name} component={component} />
        ))}
    </MoreStack.Navigator>
  );
}

/**
 * Customer personal-hub shell.
 *
 * Owns the bottom navigation extracted from the "Customer Dashboard (Personal
 * Overview)" spec — Home · My Deals · Messages · Orders · More — which is personal
 * to the signed-in customer, unlike the general customer dashboard nav
 * (Home · Deals · Discover · Saved · Account).
 *
 * Mounted at the root as a sibling of `Tabs`, so the personal bar and the general
 * bar can never stack: entering the personal flow swaps shells, and the personal
 * bar stays visible across the whole personal flow.
 */
export function PersonalHubNavigator() {
  return (
    <TypeDensityProvider density="comfortable">
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={props => <PersonalHubTabBar {...props} />}
      >
        <Tab.Screen name="PersonalHome" options={{ title: 'Home' }}>
          {HomeFlowStack}
        </Tab.Screen>
        <Tab.Screen name="PersonalMyDeals" options={{ title: 'My Deals' }}>
          {DealsFlowStack}
        </Tab.Screen>
        <Tab.Screen name="PersonalMessages" options={{ title: 'Messages' }}>
          {MessagesFlowStack}
        </Tab.Screen>
        <Tab.Screen name="PersonalOrders" options={{ title: 'Orders' }}>
          {OrdersFlowStack}
        </Tab.Screen>
        <Tab.Screen name="PersonalMore" options={{ title: 'More' }}>
          {MoreFlowStack}
        </Tab.Screen>
      </Tab.Navigator>
    </TypeDensityProvider>
  );
}

export type { AppStackParamList };
