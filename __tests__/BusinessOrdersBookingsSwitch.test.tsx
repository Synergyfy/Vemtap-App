import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import { strings } from '@constants/strings';

const shell = strings.businessShell;
const orders = strings.businessOrders;
const bookings = strings.businessBookings;

describe('orders <-> bookings switcher', () => {
  it('switches between the two surfaces inside the Orders tab', async () => {
    await render(
      <NavigationContainer>
        <BusinessTabNavigator />
      </NavigationContainer>,
    );

    // Land on the Orders tab through the shared business tab bar.
    await act(async () => {
      fireEvent.press(screen.getByLabelText(shell.tabs.orders));
    });
    expect(screen.getByText(orders.alertTitle)).toBeTruthy();

    // In-screen switcher -> Bookings.
    await act(async () => {
      fireEvent.press(screen.getByLabelText(bookings.switcher[1]));
    });
    expect(screen.getByText(bookings.summaryTitle)).toBeTruthy();
    expect(screen.queryByText(orders.alertTitle)).toBeNull();

    // In-screen switcher -> back to Orders. `Orders` also labels the bottom
    // tab, and the in-screen switcher renders first.
    await act(async () => {
      fireEvent.press(screen.getAllByLabelText(bookings.switcher[0])[0]);
    });
    expect(screen.getByText(orders.alertTitle)).toBeTruthy();
    expect(screen.queryByText(bookings.summaryTitle)).toBeNull();
  });
});
