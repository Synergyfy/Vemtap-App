import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BusinessTabBar } from '@features/business/components/BusinessTabBar';
import { BusinessDashboardOverviewScreen } from '@features/business/screens/BusinessDashboardOverviewScreen';
import { BusinessOrdersHubScreen } from '@features/business/screens/BusinessOrdersHubScreen';
import { OrderDetailScreen } from '@features/business/screens/BusinessOrderDetailScreen';
import { BusinessBookingsHubScreen } from '@features/business/screens/BusinessBookingsHubScreen';
import { BusinessPosOrdersViewScreen } from '@features/business/screens/BusinessPosOrdersViewScreen';
import { BusinessMessagesHomeScreen } from '@features/business/screens/BusinessMessagesHomeScreen';
import { BusinessHubCentralManagementScreen } from '@features/business/screens/BusinessHubCentralManagementScreen';
import { BusinessMoreHubScreen } from '@features/business/screens/BusinessMoreHubScreen';
import { TypeDensityProvider } from '@theme/TypeDensityProvider';
import type {
  AppStackParamList,
  BusinessTabParamList,
  RootStackParamList,
} from './types';

/**
 * The business app lives inside AppStack, so tab routes need the AppStack prop and
 * root-level routes (the business onboarding flow) need the Root prop.
 */
type AppStackNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<BusinessTabParamList>,
  CompositeNavigationProp<
    NativeStackNavigationProp<AppStackParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

type OrdersStackNavigation = NativeStackNavigationProp<BusinessTabParamList>;

const Tab = createBottomTabNavigator<BusinessTabParamList>();
const OverviewStack = createNativeStackNavigator<BusinessTabParamList>();
const OrdersStack = createNativeStackNavigator<BusinessTabParamList>();
const MessagesStack = createNativeStackNavigator<BusinessTabParamList>();
const HubStack = createNativeStackNavigator<BusinessTabParamList>();
const MoreStack = createNativeStackNavigator<BusinessTabParamList>();

const stackOptions = { headerShown: false } as const;

function BusinessOverviewRoute() {
  const navigation = useNavigation<AppStackNavigation>();
  return (
    <BusinessDashboardOverviewScreen
      onOpenOrders={() =>
        navigation.navigate('BusinessTabs', { screen: 'BusinessOrders' })
      }
      onOpenMessages={() =>
        navigation.navigate('BusinessTabs', { screen: 'BusinessMessages' })
      }
      onManageLocations={() =>
        navigation.navigate('BusinessTabs', { screen: 'BusinessHub' })
      }
      onAddBranch={() => navigation.navigate('BusinessTabs', { screen: 'BusinessHub' })}
    />
  );
}

/**
 * Orders <-> Bookings switcher. Both surfaces live in the same stack, so the
 * switcher returns to the existing Orders screen instead of pushing a second
 * copy: `navigate` on a route already in the stack pops back to it.
 */
function BusinessOrdersSurfaceRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <BusinessOrdersHubScreen
      onOpenBookings={() => navigation.navigate('BusinessBookings')}
      onOpenPosOrders={() => navigation.navigate('BusinessPosOrders')}
      onOpenOrder={orderId =>
        navigation.navigate('BusinessOrderDetail', { orderId: orderId ?? 'vg-94021' })
      }
      onAcceptOrder={() => undefined}
      onSendToKitchen={() => undefined}
    />
  );
}

function BusinessOrderDetailRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <OrderDetailScreen
      onBack={navigation.goBack}
      onMarkProcessing={() => undefined}
      onMarkReady={() => undefined}
      onConfirmPayment={() => undefined}
      onAdjustRefund={() => undefined}
      onOpenChat={() => navigation.navigate('BusinessMessages')}
    />
  );
}

function BusinessBookingsRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <BusinessBookingsHubScreen
      // Returns to the Orders surface already sitting below in this stack, so
      // switching never pushes a duplicate screen. If Bookings was opened
      // directly (deep link) there is nothing to pop, so navigate instead.
      onOpenOrders={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('BusinessOrdersHome');
        }
      }}
      onCheckIn={() => undefined}
    />
  );
}

function BusinessPosOrdersRoute() {
  const navigation = useNavigation<OrdersStackNavigation>();
  return (
    <BusinessPosOrdersViewScreen
      onBack={navigation.goBack}
      onOpenOrder={() => undefined}
      onPrintReceipt={() => undefined}
    />
  );
}

function BusinessMessagesRoute() {
  const navigation = useNavigation<AppStackNavigation>();
  return (
    <BusinessMessagesHomeScreen
      onNewMessage={() =>
        navigation.navigate('BusinessTabs', { screen: 'BusinessMessages' })
      }
    />
  );
}

function BusinessHubRoute() {
  return <BusinessHubCentralManagementScreen />;
}

function BusinessMoreRoute() {
  const navigation = useNavigation<AppStackNavigation>();
  return (
    <BusinessMoreHubScreen
      // Re-entering the setup stack keeps verification reachable from inside
      // the business app, not only from onboarding.
      onOpenRow={id =>
        id === 'verification'
          ? navigation.navigate('BusinessSetup', { screen: 'VerifyYourBusiness' })
          : undefined
      }
    />
  );
}

/**
 * Business-facing app shell. Owns the one business bottom navigation
 * (`BusinessTabBar`) and wraps every business screen in the compact density so
 * type sizes stay consistent across the whole business side.
 */
export function BusinessTabNavigator() {
  return (
    <TypeDensityProvider density="compact">
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={props => <BusinessTabBar {...props} />}
      >
        <Tab.Screen name="BusinessOverview" options={{ title: 'Overview' }}>
          {() => (
            <OverviewStack.Navigator screenOptions={stackOptions}>
              <OverviewStack.Screen
                name="BusinessOverviewHome"
                component={BusinessOverviewRoute}
              />
            </OverviewStack.Navigator>
          )}
        </Tab.Screen>
        <Tab.Screen name="BusinessOrders" options={{ title: 'Orders' }}>
          {() => (
            <OrdersStack.Navigator screenOptions={stackOptions}>
              <OrdersStack.Screen
                name="BusinessOrdersHome"
                component={BusinessOrdersSurfaceRoute}
              />
              <OrdersStack.Screen
                name="BusinessOrderDetail"
                component={BusinessOrderDetailRoute}
              />
              <OrdersStack.Screen
                name="BusinessBookings"
                component={BusinessBookingsRoute}
              />
              <OrdersStack.Screen
                name="BusinessPosOrders"
                component={BusinessPosOrdersRoute}
              />
            </OrdersStack.Navigator>
          )}
        </Tab.Screen>
        <Tab.Screen name="BusinessMessages" options={{ title: 'Messages' }}>
          {() => (
            <MessagesStack.Navigator screenOptions={stackOptions}>
              <MessagesStack.Screen
                name="BusinessMessagesHome"
                component={BusinessMessagesRoute}
              />
            </MessagesStack.Navigator>
          )}
        </Tab.Screen>
        <Tab.Screen name="BusinessHub" options={{ title: 'Business' }}>
          {() => (
            <HubStack.Navigator screenOptions={stackOptions}>
              <HubStack.Screen name="BusinessHubHome" component={BusinessHubRoute} />
            </HubStack.Navigator>
          )}
        </Tab.Screen>
        <Tab.Screen name="BusinessMore" options={{ title: 'More' }}>
          {() => (
            <MoreStack.Navigator screenOptions={stackOptions}>
              <MoreStack.Screen name="BusinessMoreHome" component={BusinessMoreRoute} />
            </MoreStack.Navigator>
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </TypeDensityProvider>
  );
}
