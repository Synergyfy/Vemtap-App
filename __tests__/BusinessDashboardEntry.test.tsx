import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  useBusinessDashboardEntry,
  businessDashboardEntry,
} from '@navigation/BusinessSetupNavigator';

jest.mock('@store/authStore', () => ({
  useAuthStore: { getState: () => ({ markUnauthenticated: jest.fn() }) },
}));

const Root = createNativeStackNavigator();
const App = createNativeStackNavigator();
const Auth = createNativeStackNavigator();
const BusinessTabsStack = createNativeStackNavigator();

/** The onboarding flow's exit button, wired exactly as in production. */
function BusinessFlowStub() {
  const openDashboard = useBusinessDashboardEntry();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continue to Business Dashboard"
      onPress={openDashboard}
    >
      <Text>Continue to Business Dashboard</Text>
    </Pressable>
  );
}

function ConsumerTabsStub() {
  return <Text>CONSUMER_TABS</Text>;
}

function BusinessOverviewStub() {
  return <Text>BUSINESS_OVERVIEW</Text>;
}

function TestBusinessTabs() {
  return (
    <BusinessTabsStack.Navigator screenOptions={{ headerShown: false }}>
      <BusinessTabsStack.Screen
        name="BusinessOverview"
        component={BusinessOverviewStub}
      />
    </BusinessTabsStack.Navigator>
  );
}

function TestAppStack() {
  return (
    <App.Navigator screenOptions={{ headerShown: false }}>
      <App.Screen name="Tabs" component={ConsumerTabsStub} />
    </App.Navigator>
  );
}

function TestAuthStack() {
  return (
    <Auth.Navigator screenOptions={{ headerShown: false }}>
      <Auth.Screen name="SignIn" component={ConsumerTabsStub} />
    </Auth.Navigator>
  );
}

/**
 * Mirrors `RootNavigator`: `AppStack` and `AuthStack` are mutually exclusive
 * (auth state), while the onboarding flow (`BusinessSetup`) and the business app
 * (`BusinessTabs`) are always-registered root siblings. Nothing is nested inside
 * AppStack — the flow must be able to exit whether or not the user is signed in.
 */
const makeRoot = (authenticated: boolean) => () => (
  <Root.Navigator initialRouteName="BusinessSetup" screenOptions={{ headerShown: false }}>
    {authenticated ? (
      <Root.Screen name="AppStack" component={TestAppStack} />
    ) : (
      <Root.Screen name="AuthStack" component={TestAuthStack} />
    )}
    <Root.Screen name="BusinessSetup" component={BusinessFlowStub} />
    <Root.Screen name="BusinessTabs" component={TestBusinessTabs} />
  </Root.Navigator>
);

test('exits to the business dashboard while signed out (no AppStack route)', async () => {
  const screen = await render(
    <NavigationContainer>{React.createElement(makeRoot(false))}</NavigationContainer>,
  );

  await fireEvent.press(screen.getByLabelText('Continue to Business Dashboard'));

  await waitFor(() => {
    expect(screen.getByText('BUSINESS_OVERVIEW')).toBeTruthy();
  });
  expect(screen.queryByText('CONSUMER_TABS')).toBeNull();
});

test('exits to the business dashboard while signed in', async () => {
  const screen = await render(
    <NavigationContainer>{React.createElement(makeRoot(true))}</NavigationContainer>,
  );

  await fireEvent.press(screen.getByLabelText('Continue to Business Dashboard'));

  await waitFor(() => {
    expect(screen.getByText('BUSINESS_OVERVIEW')).toBeTruthy();
  });
  expect(screen.queryByText('CONSUMER_TABS')).toBeNull();
});

test('the entry targets the root BusinessTabs route, never AppStack', () => {
  expect(businessDashboardEntry).toEqual({ screen: 'BusinessOverview' });
});
