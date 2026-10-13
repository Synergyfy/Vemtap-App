import { useHistoryBack } from '@navigation/useHistoryBack';
import { useHideTabBarOnFocus } from '@navigation/useHideTabBarOnFocus';
import { useOpenClaimChat } from '@features/merchantChat/hooks/useOpenClaimChat';
import { useConversationActions } from '@navigation/useConversationActions';
import { useCustomerThreads } from '@features/merchantChat/hooks/useCustomerMessaging';
import { useNavigation } from '@react-navigation/native';
// Imported from its own module: the realtime bridge is NOT exported by
// `useCustomerMessaging`, and pulling it from there left the binding
// undefined, which threw on render and took the shell down.
import { useCustomerMessagingRealtime } from '@features/merchantChat/hooks/useCustomerMessagingRealtime';
import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  useRoute,
  type CompositeNavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CustomerDashboardScreen } from '@features/accountHub/screens/CustomerDashboardScreen';
import { MoreHubScreen } from '@features/accountHub/screens/MoreHubScreen';
import { MyActivityScreen } from '@features/accountHub/screens/MyActivityScreen';
import { RewardsScreen } from '@features/accountHub/screens/RewardsScreen';
import { SavingsHistoryScreen } from '@features/accountHub/screens/SavingsHistoryScreen';
import { SavedHubScreen } from '@features/accountHub/screens/SavedHubScreen';
import { ComposeMessageSheet } from '@features/merchantChat/components/ComposeMessageSheet';
import { NotificationsCenterScreen } from '@features/accountHub/screens/NotificationsCenterScreen';
import { useNotifications } from '@features/accountHub/hooks/useNotifications';
import { matchSegment } from '@navigation/notificationRoutes';
import { AccountSettingsSecurityScreen } from '@features/accountHub/screens/AccountSettingsSecurityScreen';
import { EditProfileScreen } from '@features/accountHub/screens/EditProfileScreen';
import { HelpCentreScreen } from '@features/accountHub/screens/HelpCentreScreen';
import { ClaimedDealDetailPassScreen } from '@features/claimedDeal/screens/ClaimedDealDetailPassScreen';
import { MyDealsHubScreen } from '@features/myDeals/screens/MyDealsHubScreen';
import { useClaimPass } from '@features/myDeals/hooks/useMyClaims';
import { MessagesScreen } from '@features/merchantChat/screens/MessagesScreen';
import { UrbanConversationScreen } from '@features/merchantChat/screens/UrbanConversationScreen';
import { OrdersBookingsHubScreen } from '@features/order/screens/OrdersBookingsHubScreen';
import { UrbanOrderDetailScreen } from '@features/order/screens/UrbanOrderDetailScreen';
import { BookingDetailScreen } from '@features/accountHub/screens/BookingDetailScreen';
import { TypeDensityProvider } from '@theme/TypeDensityProvider';
import { strings } from '@constants/strings';
import type {
  AccountStackParamList,
  AppStackParamList,
  MainTabParamList,
  PersonalHubParamList,
} from './types';

const Stack = createNativeStackNavigator<PersonalHubParamList>();

/**
 * The personal stack is nested three levels deep (Account tab → AccountStack →
 * PersonalHub), so destinations owned by ancestor navigators are reached by
 * bubbling. The composite keeps those cross-shell routes type-safe:
 *
 *  - `DealDetail` / `ServiceDetail` are owned by `AppStack` (root of the
 *    consumer shell).
 *  - `BusinessProfile` lives inside the Discover tab, a *sibling* of Account;
 *    a bare `navigate('BusinessProfile')` would be a silent no-op, so it is
 *    addressed through the tab (`navigate('Discover', { screen: … })`).
 */
type HubNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<PersonalHubParamList>,
  CompositeNavigationProp<
    NativeStackNavigationProp<AccountStackParamList>,
    CompositeNavigationProp<
      BottomTabNavigationProp<MainTabParamList>,
      NativeStackNavigationProp<AppStackParamList>
    >
  >
>;

/** The overview accepts a deep link so deal/booking details land in this stack. */
function PersonalHomeRoute() {
  const goBack = useHistoryBack();

  const navigation = useNavigation<HubNavigation>();
  const route = useRoute<RouteProp<PersonalHubParamList, 'PersonalHome'>>();
  const deepLink = route.params?.deepLink;

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
      onBack={goBack}
      onNotifications={() => navigation.navigate('PersonalNotifications')}
      onShop={() => navigation.navigate('PersonalOrders')}
      shopLabel={strings.accountScreens.moreHub.ordersTitle}
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
      onOpenClaim={claimId => navigation.navigate('PersonalClaimedDealPass', { claimId })}
    />
  );
}

function PersonalMyDealsRoute() {
  const goBack = useHistoryBack();

  const navigation = useNavigation<HubNavigation>();
  return (
    <MyDealsHubScreen
      onBack={goBack}
      onAccount={() => navigation.navigate('PersonalMore')}
      onOpenClaim={claimId => navigation.navigate('PersonalClaimedDealPass', { claimId })}
      onViewGuidelines={() => navigation.navigate('PersonalHelpCentre')}
    />
  );
}

function PersonalMessagesRoute() {
  const goBack = useHistoryBack();
  const [composing, setComposing] = useState(false);

  const navigation = useNavigation<HubNavigation>();
  return (
    <>
      <MessagesScreen
        onBack={goBack}
        onOpenConversation={threadId =>
          navigation.navigate('PersonalConversation', { threadId })
        }
        onCompose={() => setComposing(true)}
      />
      <ComposeMessageSheet visible={composing} onClose={() => setComposing(false)} />
    </>
  );
}

function PersonalConversationRoute() {
  const goBack = useHistoryBack();
  useHideTabBarOnFocus();

  const navigation = useNavigation<HubNavigation>();
  const route = useRoute<RouteProp<PersonalHubParamList, 'PersonalConversation'>>();

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
      // Discover is a sibling of Account, so the tab is addressed first.
      navigation.navigate('Discover', { screen: 'BusinessProfile', params: { code } }),
    onOpenPass: id => navigation.navigate('PersonalClaimedDealPass', { claimId: id }),
  });

  return (
    <>
      <UrbanConversationScreen
        threadId={route.params?.threadId}
        claimId={claimId}
        onBack={goBack}
        onViewPass={id => navigation.navigate('PersonalClaimedDealPass', { claimId: id })}
        {...actions}
      />
      {sheet}
    </>
  );
}

function PersonalOrdersRoute() {
  const goBack = useHistoryBack();

  const navigation = useNavigation<HubNavigation>();
  return (
    <OrdersBookingsHubScreen
      onBack={goBack}
      onOpenOrder={orderId => navigation.navigate('PersonalOrderDetail', { orderId })}
      onOpenBooking={bookingNumber =>
        navigation.navigate('PersonalBookingDetail', { bookingNumber })
      }
    />
  );
}

function PersonalOrderDetailRoute() {
  const goBack = useHistoryBack();

  const route = useRoute<RouteProp<PersonalHubParamList, 'PersonalOrderDetail'>>();
  return <UrbanOrderDetailScreen orderId={route.params?.orderId} onBack={goBack} />;
}

function PersonalBookingDetailRoute() {
  const goBack = useHistoryBack();

  return <BookingDetailScreen onBack={goBack} />;
}

function PersonalMoreRoute() {
  const goBack = useHistoryBack();

  const navigation = useNavigation<HubNavigation>();
  return (
    <MoreHubScreen
      onBack={goBack}
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
  const goBack = useHistoryBack();

  // Rewards is a dense hub: keep the same density it has in the Account stack.
  return (
    <TypeDensityProvider density="dense">
      <RewardsScreen onBack={goBack} />
    </TypeDensityProvider>
  );
}

function PersonalActivityRoute() {
  const goBack = useHistoryBack();

  return <MyActivityScreen onBack={goBack} />;
}

function PersonalSavingsRoute() {
  const goBack = useHistoryBack();

  return <SavingsHistoryScreen onBack={goBack} />;
}

function PersonalSavedRoute() {
  const goBack = useHistoryBack();

  const navigation = useNavigation<HubNavigation>();
  return (
    <SavedHubScreen
      onBack={goBack}
      onNotifications={() => navigation.navigate('PersonalNotifications')}
      onOpenDeal={offerId => navigation.navigate('DealDetail', { dealId: offerId })}
      onOpenBusiness={code =>
        // A sibling tab cannot be reached by bubbling; address the tab first.
        navigation.navigate('Discover', {
          screen: 'BusinessProfile',
          params: { code },
        })
      }
      onOpenService={serviceId => navigation.navigate('ServiceDetail', { serviceId })}
    />
  );
}

function PersonalNotificationsRoute() {
  const goBack = useHistoryBack();
  const navigation = useNavigation<HubNavigation>();
  const { data: rows } = useNotifications();

  // A tap is a request to go somewhere, not just to clear the dot. The row's
  // `actionUrl` is the only thing that says where, so this resolves it rather
  // than guessing from the notification type — a type can be written by several
  // different things, and a wrong guess drops the user on the wrong order.
  //
  // An unknown or absent URL marks the row read and stays put. That is the
  // whole point of allowlisting: `/dashboard/settings/subscription` and other
  // admin-broadcast paths are written for the web panel and have no in-app
  // destination, so navigating to them blindly would dead-end the tap.
  const openNotification = (id: string) => {
    const actionUrl = rows?.find(row => row.id === id)?.actionUrl;
    const orderId = matchSegment(actionUrl, 'orders');
    if (orderId) {
      navigation.navigate('PersonalOrderDetail', { orderId });
      return;
    }
    const threadId = matchSegment(actionUrl, 'messages');
    if (threadId) {
      navigation.navigate('PersonalConversation', { threadId });
    }
  };

  return (
    <NotificationsCenterScreen onBack={goBack} onOpenNotification={openNotification} />
  );
}

function PersonalSettingsRoute() {
  const goBack = useHistoryBack();

  return <AccountSettingsSecurityScreen onBack={goBack} />;
}

function PersonalEditProfileRoute() {
  const goBack = useHistoryBack();

  return <EditProfileScreen onBack={goBack} />;
}

function PersonalHelpCentreRoute() {
  const goBack = useHistoryBack();

  return <HelpCentreScreen onBack={goBack} />;
}

function PersonalClaimedDealPassRoute() {
  const goBack = useHistoryBack();

  const navigation = useNavigation<HubNavigation>();
  const route = useRoute<RouteProp<PersonalHubParamList, 'PersonalClaimedDealPass'>>();
  const pass = useClaimPass({
    claimId: route.params?.claimId,
    offerId: route.params?.dealId,
  });
  const openChat = useOpenClaimChat(pass.claim, params =>
    navigation.navigate('PersonalConversation', params),
  );
  return (
    <ClaimedDealDetailPassScreen
      claim={pass.claim}
      onBack={goBack}
      onOpenChat={openChat}
    />
  );
}

/**
 * The customer personal flow.
 *
 * This was a five-tab bottom-navigation shell (Home · My Deals · Messages ·
 * Orders · More), then a bar-less root-level stack. It is now nested inside the
 * consumer Account tab: each entry pushes one page, the Account tab's bottom
 * navigation stays visible throughout, and the back button pops to the previous
 * page (or straight back to the Account hub).
 */
export function PersonalHubNavigator() {
  // One socket bridge for the consumer shell, mirroring the business tab's.
  useCustomerMessagingRealtime();

  return (
    <TypeDensityProvider density="comfortable">
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PersonalHome" component={PersonalHomeRoute} />
        <Stack.Screen name="PersonalMyDeals" component={PersonalMyDealsRoute} />
        <Stack.Screen name="PersonalMessages" component={PersonalMessagesRoute} />
        <Stack.Screen name="PersonalOrders" component={PersonalOrdersRoute} />
        <Stack.Screen name="PersonalMore" component={PersonalMoreRoute} />
        <Stack.Screen name="PersonalConversation" component={PersonalConversationRoute} />
        <Stack.Screen name="PersonalOrderDetail" component={PersonalOrderDetailRoute} />
        <Stack.Screen
          name="PersonalBookingDetail"
          component={PersonalBookingDetailRoute}
        />
        <Stack.Screen
          name="PersonalClaimedDealPass"
          component={PersonalClaimedDealPassRoute}
        />
        <Stack.Screen name="PersonalRewards" component={PersonalRewardsRoute} />
        <Stack.Screen name="PersonalActivity" component={PersonalActivityRoute} />
        <Stack.Screen name="PersonalSavings" component={PersonalSavingsRoute} />
        <Stack.Screen name="PersonalSaved" component={PersonalSavedRoute} />
        <Stack.Screen
          name="PersonalNotifications"
          component={PersonalNotificationsRoute}
        />
        <Stack.Screen name="PersonalSettings" component={PersonalSettingsRoute} />
        <Stack.Screen name="PersonalEditProfile" component={PersonalEditProfileRoute} />
        <Stack.Screen name="PersonalHelpCentre" component={PersonalHelpCentreRoute} />
      </Stack.Navigator>
    </TypeDensityProvider>
  );
}
