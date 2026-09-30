import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import { strings } from '@constants/strings';

const shell = strings.businessShell;
const orders = strings.businessOrders;
const bookings = strings.businessBookings;

describe('orders <-> bookings switcher', () => {
  /**
   * The Bookings hop is deliberately not wired: navigating into it threw
   * "Couldn't find a navigation context" and blanked the Orders hub. The switcher
   * now renders that tab disabled so the tap cannot reach the broken route.
   * Re-enable by passing `onOpenBookings` to BusinessOrdersHubScreen again, and
   * this test should fail until it does.
   */
  it('renders the Bookings tab disabled and keeps the Orders hub mounted', async () => {
    const consoleError = jest.spyOn(console, 'error');
    await render(
      <NavigationContainer>
        <BusinessTabNavigator />
      </NavigationContainer>,
    );

    await act(async () => {
      fireEvent.press(screen.getByLabelText(shell.tabs.orders));
    });
    expect(screen.getByText(orders.alertTitle)).toBeTruthy();

    const bookingsTab = screen.getByLabelText(bookings.switcher[1]);
    expect(bookingsTab.props.accessibilityState?.disabled).toBe(true);

    await act(async () => {
      fireEvent.press(bookingsTab);
    });

    // Still on Orders: the disabled tab neither navigates nor crashes.
    expect(screen.getByText(orders.alertTitle)).toBeTruthy();
    expect(screen.queryByText(bookings.summaryTitle)).toBeNull();
    expect(
      consoleError.mock.calls.filter(call =>
        String(call[0]).includes('navigation context'),
      ),
    ).toEqual([]);

    consoleError.mockRestore();
  });
});
