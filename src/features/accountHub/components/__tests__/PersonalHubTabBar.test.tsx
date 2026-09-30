import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PersonalHubNavigator } from '@navigation/PersonalHubNavigator';
import { personalHubTabMeta } from '@features/accountHub/components/PersonalHubTabBar';
import { strings } from '@constants/strings';

const shell = strings.personalHubShell;

describe('personal hub bottom navigation', () => {
  it('matches the Customer Dashboard (Personal Overview) spec', () => {
    expect(Object.keys(personalHubTabMeta)).toEqual([
      'PersonalHome',
      'PersonalMyDeals',
      'PersonalMessages',
      'PersonalOrders',
      'PersonalMore',
    ]);
    expect(personalHubTabMeta.PersonalHome).toEqual({
      icon: 'dashboard',
      label: shell.tabs.home,
    });
    expect(personalHubTabMeta.PersonalMyDeals).toEqual({
      icon: 'confirmation',
      label: shell.tabs.myDeals,
      badge: { count: shell.myDealsBadge },
    });
    expect(personalHubTabMeta.PersonalMessages).toEqual({
      icon: 'message',
      label: shell.tabs.messages,
      badge: { count: shell.messagesBadge },
    });
    expect(personalHubTabMeta.PersonalOrders).toEqual({
      icon: 'receiptLong',
      label: shell.tabs.orders,
    });
    expect(personalHubTabMeta.PersonalMore).toEqual({
      icon: 'more',
      label: shell.tabs.more,
    });
  });

  it('owns the bar on the personal overview and switches tabs', async () => {
    const screen = await render(
      <NavigationContainer>
        <PersonalHubNavigator />
      </NavigationContainer>,
    );

    // The personal overview renders under its own nav, not the consumer one.
    expect(screen.getByText(shell.tabs.home)).toBeTruthy();
    expect(screen.getByText(shell.tabs.myDeals)).toBeTruthy();
    expect(screen.getByText(shell.tabs.messages)).toBeTruthy();
    expect(screen.getByText(shell.tabs.orders)).toBeTruthy();
    expect(screen.getByText(shell.tabs.more)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(shell.tabs.myDeals));
    expect(screen.getAllByText(shell.tabs.myDeals).length).toBeGreaterThan(1);
  });
});
