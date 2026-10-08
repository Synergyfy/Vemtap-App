import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerDashboardScreen } from '@features/accountHub/screens/CustomerDashboardScreen';
import { MoreHubScreen } from '@features/accountHub/screens/MoreHubScreen';
import { MyActivityScreen } from '@features/accountHub/screens/MyActivityScreen';
import { RewardsScreen } from '@features/accountHub/screens/RewardsScreen';
import { SavingsHistoryScreen } from '@features/accountHub/screens/SavingsHistoryScreen';
import { SavedHubScreen } from '@features/accountHub/screens/SavedHubScreen';
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
import type { PersonalHubParamList } from './types';

const Stack = createNativeStackNavigator<PersonalHubParamList>();

type HubNavigation = NativeStackNavigationProp<PersonalHubParamList>;

/** The overview accepts a deep link so deal/booking details land in this stack. */
function PersonalHomeRoute() {
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
      onBack={navigation.goBack}
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
      onBack={navigation.goBack}
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
      onOpenConversation={threadId =>
        navigation.navigate('PersonalConversation', { threadId })
      }
    />
  );
}

function PersonalConversationRoute() {
  const navigation = useNavigation<HubNavigation>();
  const route = useRoute<RouteProp<PersonalHubParamList, 'PersonalConversation'>>();
  return (
    <UrbanConversationScreen
      threadId={route.params?.threadId}
      onBack={navigation.goBack}
    />
  );
}

function PersonalOrdersRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <OrdersBookingsHubScreen
      onBack={navigation.goBack}
      onOpenOrder={orderId => navigation.navigate('PersonalOrderDetail', { orderId })}
      onOpenBooking={bookingNumber =>
        navigation.navigate('PersonalBookingDetail', { bookingNumber })
      }
    />
  );
}

function PersonalOrderDetailRoute() {
  const navigation = useNavigation<HubNavigation>();
  const route = useRoute<RouteProp<PersonalHubParamList, 'PersonalOrderDetail'>>();
  return (
    <UrbanOrderDetailScreen orderId={route.params?.orderId} onBack={navigation.goBack} />
  );
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

function PersonalSavedRoute() {
  const navigation = useNavigation<HubNavigation>();
  return (
    <SavedHubScreen
      onBack={navigation.goBack}
      onNotifications={() => navigation.navigate('PersonalNotifications')}
      onOpenDeal={dealId => navigation.navigate('PersonalClaimedDealPass', { dealId })}
    />
  );
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
