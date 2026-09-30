import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import { strings } from '@constants/strings';

const Root = createNativeStackNavigator();
const shell = strings.businessShell;
const orders = strings.businessOrders;
const bookings = strings.businessBookings;

/**
 * Regression guard: the business shell is mounted as a root Stack.Screen, and
 * every route wrapper resolves navigation through useBusinessNavigation()
 * (useNavigation + useNavigationState). When the business tabs were declared
 * with a function child on Tab.Screen, that hook ran outside the screen's own
 * scene and threw "Couldn't find a navigation context", blanking the Orders hub.
 * This mounts the real nesting so the crash cannot come back silently.
 */
test('Orders and Bookings hubs mount inside the root stack without a navigation error', async () => {
  const consoleError = jest.spyOn(console, 'error');

  await render(
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        <Root.Screen name="BusinessTabs" component={BusinessTabNavigator} />
      </Root.Navigator>
    </NavigationContainer>,
  );

  await act(async () => {
    fireEvent.press(screen.getByLabelText(shell.tabs.orders));
  });
  expect(screen.getByText(orders.alertTitle)).toBeTruthy();

  // Bookings is currently disabled (see BusinessOrdersBookingsSwitch.test.tsx):
  // pressing it must stay a no-op rather than throwing.
  const bookingsTab = screen.getByLabelText(bookings.switcher[1]);
  expect(bookingsTab.props.accessibilityState?.disabled).toBe(true);
  await act(async () => {
    fireEvent.press(bookingsTab);
  });
  expect(screen.getByText(orders.alertTitle)).toBeTruthy();

  const navContextErrors = consoleError.mock.calls.filter(call =>
    String(call[0]).includes('navigation context'),
  );
  expect(navContextErrors).toEqual([]);

  consoleError.mockRestore();
});
