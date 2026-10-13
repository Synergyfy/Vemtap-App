import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import { strings } from '@constants/strings';

const shell = strings.businessShell;
const more = strings.businessMore;

afterEach(cleanup);

/** Mount the business shell and land on the More tab. */
async function openMoreTab() {
  await render(
    <NavigationContainer>
      <BusinessTabNavigator />
    </NavigationContainer>,
  );
  await act(async () => {
    fireEvent.press(screen.getByLabelText(shell.tabs.more));
  });
}

/** Press a More-hub row by its stable id and settle the transition. */
async function pressMoreRow(id: string) {
  await act(async () => {
    fireEvent.press(screen.getByLabelText(moreRowLabel(id)));
  });
}

/** The accessible label the More hub puts on a given row. */
function moreRowLabel(id: string) {
  const section = more.sections.find(entry => entry.items.some(item => item.id === id));
  const item = section?.items.find(entry => entry.id === id);
  if (!item) throw new Error(`No More-hub row with id "${id}"`);
  return item.label;
}

describe('business shell navigation', () => {
  it('keeps the shared bottom tab bar across every tab', async () => {
    await render(
      <NavigationContainer>
        <BusinessTabNavigator />
      </NavigationContainer>,
    );

    Object.values(shell.tabs).forEach(tab => {
      expect(screen.getAllByLabelText(tab).length).toBeGreaterThan(0);
    });
  });

  it('reaches the account, trust and support screens from the More hub', async () => {
    await openMoreTab();

    const cases: [string, string][] = [
      ['notifications', strings.businessNotificationsCenter.headerTitle],
      ['billing', strings.businessSubscriptionBilling.headerTitle],
      ['verification', strings.businessVerificationTrust.headerTitle],
      ['support', strings.businessSupportHelp.headerTitle],
      ['settings', strings.businessSettings.headerTitle],
    ];

    // Each case re-mounts the shell: the More stack keeps its navigation state,
    // so a second press in the same mount would not re-trigger the row.
    await cases.reduce(async (previous, [rowId, expectedHeader]) => {
      await previous;
      await openMoreTab();
      await pressMoreRow(rowId);
      expect(screen.getByText(expectedHeader)).toBeTruthy();
    }, Promise.resolve());
  });

  it('reaches the switch-to-customer confirmation from the More hub', async () => {
    await openMoreTab();

    await act(async () => {
      fireEvent.press(screen.getByLabelText(more.switchToCustomer));
    });

    expect(screen.getByText(strings.switchToCustomer.title)).toBeTruthy();
  });

  it('reaches reviews and performance analytics from the More hub', async () => {
    await openMoreTab();
    await pressMoreRow('reviews');
    expect(screen.getByText(strings.businessReviewsReputation.headerTitle)).toBeTruthy();

    await openMoreTab();
    await pressMoreRow('insights');
    expect(
      screen.getByText(strings.businessAnalyticsPerformance.headerTitle),
    ).toBeTruthy();
  });

  it('reaches the growth and QR hubs from the More hub', async () => {
    await openMoreTab();
    await pressMoreRow('boost');
    expect(screen.getByText(strings.campaignsHub.headerTitle)).toBeTruthy();

    await openMoreTab();
    await pressMoreRow('master-qr');
    expect(screen.getByText(strings.businessQr.headerTitle)).toBeTruthy();
  });

  it('cross-links the growth hubs through their sub-tabs', async () => {
    await openMoreTab();
    await pressMoreRow('boost');
    expect(screen.getByText(strings.campaignsHub.headerTitle)).toBeTruthy();

    // Campaigns → Segments via the shared growth sub-tab strip.
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Segments'));
    });
    expect(screen.getByText(strings.customerSegments.headerTitle)).toBeTruthy();

    // Segments → Campaigns.
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Campaigns'));
    });
    expect(screen.getByText(strings.campaignsHub.headerTitle)).toBeTruthy();

    // Campaigns → Boost.
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Boost'));
    });
    expect(screen.getByText(strings.boostEngine.headerTitle)).toBeTruthy();
  });

  it('reaches location QRs and the discovery feed from the master QR', async () => {
    await openMoreTab();
    await pressMoreRow('master-qr');
    expect(screen.getByText(strings.businessQr.headerTitle)).toBeTruthy();

    // The CTA appears in both the footer and the closing prompt.
    await act(async () => {
      fireEvent.press(screen.getAllByLabelText(strings.businessQr.locationQrsLink)[0]);
    });
    expect(screen.getByText(strings.locationQr.headerTitle)).toBeTruthy();

    // Location QRs → Hub tab, which owns the discovery feed entry.
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Hub'));
    });
    expect(
      screen.getAllByText(strings.businessDiscoveryFeed.headerTitle).length,
    ).toBeGreaterThan(0);
  });

  it('walks the POS transaction from the register to the receipt', async () => {
    await render(
      <NavigationContainer>
        <BusinessTabNavigator />
      </NavigationContainer>,
    );

    // Orders tab -> POS alert card -> POS register -> customer display ->
    // split the bill -> payment.
    await act(async () => {
      fireEvent.press(screen.getByLabelText(shell.tabs.orders));
    });
    await act(async () => {
      fireEvent.press(
        screen.queryByLabelText(strings.businessOrders.alertTitle) ??
          screen.getByLabelText(strings.businessOrders.alertTitleFor(0)),
      );
    });
    expect(screen.getByText(strings.businessPos.title)).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.businessPos.orders[0].reference));
    });
    expect(screen.getByText(strings.customerDisplayOrderTotal.thanksTitle)).toBeTruthy();

    await act(async () => {
      fireEvent.press(
        screen.getByLabelText(strings.customerDisplayOrderTotal.paySplitCta),
      );
    });
    expect(screen.getByText(strings.splitTheBill.billTitle)).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.splitTheBill.payShareCta));
    });
    // "Tap to Pay" labels both the panel and its call-to-action.
    expect(
      screen.getAllByText(strings.customerDisplayTapQrPay.tapTitle).length,
    ).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.customerDisplayTapQrPay.onScanLabel));
    });
    expect(screen.getByText(strings.customerDisplayTipRating.thanksTitle)).toBeTruthy();
  });
});
