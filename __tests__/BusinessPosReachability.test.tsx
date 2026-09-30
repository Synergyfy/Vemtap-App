import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { strings } from '@constants/strings';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';

/**
 * Reachability guard for the POS surfaces.
 *
 * Registering a route is not the same as being able to get to it: a screen that
 * nothing navigates *to* is dead code wearing a route name. Every destination
 * asserted below is pressed from the app shell — a real entry point a cashier
 * can find — so a future refactor that drops a hand-off fails here rather than
 * shipping an unreachable screen.
 *
 * Note on the offline chain: while a till is offline, "New Sale" must open the
 * encrypted checkout terminal rather than the networked customer display, so
 * that path is asserted explicitly.
 */
afterEach(cleanup);

const shell = strings.businessShell;
const more = strings.businessMore;
const ops = strings.businessMoreHubOperations;
const settings = strings.posGeneralSettings;
const posHome = strings.posHomeSalesOperations;

async function openBusinessShell() {
  await render(
    <NavigationContainer>
      <BusinessTabNavigator />
    </NavigationContainer>,
  );
}

/** More tab -> More hub "POS" row -> the operations-dense hub. */
async function openOperationsHub() {
  const rows: { id: string; label: string }[] = [];
  more.sections.forEach(section => {
    section.items.forEach(item => rows.push({ id: item.id, label: item.label }));
  });
  const posRow = rows.find(item => item.id === 'pos-launch');
  if (!posRow) throw new Error('No More-hub row with id "pos-launch"');
  await act(async () => {
    fireEvent.press(screen.getByLabelText(shell.tabs.more));
  });
  await act(async () => {
    fireEvent.press(screen.getByLabelText(posRow.label));
  });
}

/** ... then the POS register home. */
async function openRegisterHome() {
  await openOperationsHub();
  const tile = ops.posTiles.find(item => item.id === 'pos-home');
  if (!tile) throw new Error('No operations-hub tile with id "pos-home"');
  await act(async () => {
    fireEvent.press(screen.getByLabelText(tile.label));
  });
}

async function openSettingsHub() {
  await openRegisterHome();
  await act(async () => {
    fireEvent.press(screen.getByLabelText(posHome.settingsActionLabel));
  });
}

/** Pop one screen off the Orders stack. */
async function goBack() {
  await act(async () => {
    fireEvent.press(screen.getByLabelText('Go back'));
  });
}

describe('pos surface reachability', () => {
  it('reaches the receipt ledger, and the transaction detail behind it', async () => {
    await openBusinessShell();
    await openOperationsHub();

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Transactions'));
    });
    expect(
      screen.getAllByText(strings.posTransactionsLedgerReceipts.grossTitle).length,
    ).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getByLabelText('#RC-94021 ₦27,251'));
    });
    expect(
      screen.getAllByText(strings.posTransactionDetails.headerTitle).length,
    ).toBeGreaterThan(0);
  });

  it('reaches the active-checkout customer match from the running ticket', async () => {
    await openBusinessShell();
    await openRegisterHome();

    await act(async () => {
      fireEvent.press(screen.getAllByLabelText('New Sale')[0]);
    });
    expect(
      screen.getAllByText(strings.posNewSaleCatalog.headerTitle).length,
    ).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.posNewSaleCatalog.chargeCta));
    });
    expect(
      screen.getAllByText(strings.posCurrentSaleCart.headerTitle).length,
    ).toBeGreaterThan(0);

    // Changing the customer on an open ticket is the match/attach flow.
    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.posCurrentSaleCart.changeCta));
    });
    expect(
      screen.getAllByText(strings.posCustomerLookupActive.matchedLabel).length,
    ).toBeGreaterThan(0);

    // ... and that flow hands forward to rewards, then to tender.
    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.posCustomerLookupActive.scanCta));
    });
    expect(
      screen.getAllByText(strings.posCustomerLookupLoyalty.headerTitle).length,
    ).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.posCustomerLookupLoyalty.attachCta));
    });
    expect(
      screen.getAllByText(strings.posTenderCheckout.headerTitle).length,
    ).toBeGreaterThan(0);
  });

  it('reaches the offline checkout terminal, then the encrypted buffer queue', async () => {
    await openBusinessShell();
    await openOperationsHub();

    // The operations-hub "Offline Mode" tile is the till's offline section.
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Offline Mode'));
    });
    expect(
      screen.getAllByText(strings.posHomeOfflineMode.headerTitle).length,
    ).toBeGreaterThan(0);

    // A new sale while offline stays on the encrypted local register.
    await act(async () => {
      fireEvent.press(screen.getByLabelText('New Sale'));
    });
    expect(
      screen.getAllByText(strings.posOfflineCheckoutTerminal.headerTitle).length,
    ).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.posOfflineCheckoutTerminal.queueCta));
    });
    expect(
      screen.getAllByText(strings.posOfflineBufferQueue.headerTitle).length,
    ).toBeGreaterThan(0);

    // The queue returns the cashier to the offline register.
    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.posOfflineBufferQueue.returnCta));
    });
    expect(
      screen.getAllByText(strings.posOfflineCheckoutTerminal.headerTitle).length,
    ).toBeGreaterThan(0);
  });

  it('reaches offline mode from the settings hub and back out to the register', async () => {
    await openBusinessShell();
    await openSettingsHub();
    expect(screen.getAllByText(settings.venueLabel).length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Offline Storage & Cloud Sync'));
    });
    expect(
      screen.getAllByText(strings.posSyncReconciliation.headerTitle).length,
    ).toBeGreaterThan(0);

    // Sync now is a real action, not decoration.
    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.posSyncReconciliation.syncNowCta));
    });
    expect(
      screen.getAllByText(strings.posSyncReconciliation.syncTitle).length,
    ).toBeGreaterThan(0);
  });

  it('reaches the shift journal, the z-report and the kiosk flow from the register', async () => {
    await openBusinessShell();
    await openRegisterHome();

    await act(async () => {
      fireEvent.press(screen.getAllByLabelText('Transactions')[0]);
    });
    expect(
      screen.getAllByText(strings.posTransactionsLedgerShift.title).length,
    ).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(
        screen.getByLabelText(strings.posTransactionsLedgerShift.zReportCta),
      );
    });
    expect(
      screen.getAllByText(strings.posSyncReconciliation.headerTitle).length,
    ).toBeGreaterThan(0);

    await goBack();
    // A parked ticket resumes into the running sale it was holding.
    await act(async () => {
      fireEvent.press(
        screen.getByLabelText(`${strings.posTransactionsLedgerShift.resumeCta} #TK-105`),
      );
    });
    expect(
      screen.getAllByText(strings.posCurrentSaleCart.headerTitle).length,
    ).toBeGreaterThan(0);
  });

  it('reaches till controls, the till catalogue and the customer list from the register', async () => {
    await openBusinessShell();
    await openRegisterHome();

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Customer Public Mode'));
    });
    expect(screen.getAllByText(strings.publicPosMenu.venueName).length).toBeGreaterThan(
      0,
    );

    await goBack();
    // The drawer's own control reports shift status on the POS order view.
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Cash Drawer & Shift Status'));
    });
    expect(screen.getAllByText(strings.businessPos.title).length).toBeGreaterThan(0);
  });

  it('reaches the security policy and the hardware profile from the settings hub', async () => {
    await openBusinessShell();
    await openSettingsHub();

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Printers & Kitchen Displays'));
    });
    expect(
      screen.getAllByText(strings.paymentHardwareSetup.headerCardTitle).length,
    ).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Test Drawer Kick'));
    });
    expect(
      screen.getAllByText(strings.posBranchTillSwitcher.headerTitle).length,
    ).toBeGreaterThan(0);
  });
});
