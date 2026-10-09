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
   * The Bookings hop used to throw "Couldn't find a navigation context" and
   * blank the Orders hub, so the switcher rendered that tab disabled. Bookings
   * is wired now, so the tab must be live and land on the Bookings hub instead.
   */
  it('opens the Bookings hub from the switcher without a navigation error', async () => {
    const consoleError = jest.spyOn(console, 'error');
    await render(
      <NavigationContainer>
        <BusinessTabNavigator />
      </NavigationContainer>,
    );

    await act(async () => {
      fireEvent.press(screen.getByLabelText(shell.tabs.orders));
    });
    expect(
      screen.queryByText(orders.alertTitle) ?? screen.getByText(orders.alertTitleFor(0)),
    ).toBeTruthy();

    const bookingsTab = screen.getByLabelText(bookings.switcher[1]);
    expect(bookingsTab.props.accessibilityState?.disabled).toBeFalsy();

    await act(async () => {
      fireEvent.press(bookingsTab);
    });

    // Bookings hub mounted; the Orders surface is no longer the one on screen.
    expect(
      screen.queryByText(bookings.summaryTitleFor(0)) ??
        screen.queryByText(bookings.summaryTitle),
    ).toBeTruthy();
    expect(
      consoleError.mock.calls.filter(call =>
        String(call[0]).includes('navigation context'),
      ),
    ).toEqual([]);

    consoleError.mockRestore();
  });
});
