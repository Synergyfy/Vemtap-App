import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { strings } from '@constants/strings';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import { usePosTicketStore } from '@store/posTicketStore';
import { hubPosTiles } from '@features/business/data/businessOpsHubData';
import {
  catalogueApiFixtures,
  fixtureMyBusiness,
  posApiFixtures,
} from './helpers/posApiFixtures';

/**
 * Reachability guard for the POS surfaces.
 *
 * Registering a route is not the same as being able to get to it: a screen that
 * nothing navigates *to* is dead code wearing a route name. Every destination
 * asserted below is pressed from the app shell — a real entry point a cashier
 * can find — with the POS API answering from fixtures, so the data-driven
 * controls that carry the hand-offs actually render.
 */
jest.mock('@api/posApi', () => {
  const actual = jest.requireActual('@api/posApi');
  const { posApiFixtures: fixtures } = jest.requireActual('./helpers/posApiFixtures');
  return { ...actual, posApi: { ...actual.posApi, ...fixtures } };
});

jest.mock('@api/catalogueApi', () => {
  const actual = jest.requireActual('@api/catalogueApi');
  const { catalogueApiFixtures: fixtures } = jest.requireActual(
    './helpers/posApiFixtures',
  );
  return { ...actual, catalogueApi: { ...actual.catalogueApi, ...fixtures } };
});

jest.mock('@api/businessDashboardApi', () => {
  const actual = jest.requireActual('@api/businessDashboardApi');
  const { fixtureMyBusiness: business } = jest.requireActual('./helpers/posApiFixtures');
  return {
    ...actual,
    businessDashboardApi: {
      ...actual.businessDashboardApi,
      getMyBusiness: async () => actual.myBusinessSchema.parse(business),
      getPosDashboard: async () => ({
        revenue: 1075,
        transactionCount: 1,
        averageSaleValue: 1075,
        heldSalesCount: 0,
      }),
    },
  };
});

afterEach(() => {
  cleanup();
  usePosTicketStore.getState().clear();
});

// Keep the imported fixtures referenced so the mocks above stay in sync with them.
void posApiFixtures;
void catalogueApiFixtures;
void fixtureMyBusiness;

const shell = strings.businessShell;
const more = strings.businessMore;
const posHome = strings.posHomeSalesOperations;

async function press(label: string, index = 0) {
  await act(async () => {
    fireEvent.press((await screen.findAllByLabelText(label))[index]);
  });
}

async function pressText(text: string) {
  await act(async () => {
    fireEvent.press(await screen.findByText(text));
  });
}

async function expectText(text: string) {
  expect((await screen.findAllByText(text)).length).toBeGreaterThan(0);
}

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
  await press(shell.tabs.more);
  await press(posRow.label);
}

/** ... then the POS register home. */
async function openRegisterHome() {
  await openOperationsHub();
  const tile = hubPosTiles.find(item => item.id === 'pos-home');
  if (!tile) throw new Error('No operations-hub tile with id "pos-home"');
  await press(tile.label);
  await expectText('Test Kitchen');
}

async function openSettingsHub() {
  await openRegisterHome();
  await press(posHome.settingsActionLabel);
  await expectText(strings.posGeneralSettings.headerTitle);
}

async function goBack() {
  await press('Go back');
}

describe('pos surface reachability', () => {
  it('reaches the receipt ledger, and the transaction detail behind it', async () => {
    await openBusinessShell();
    await openOperationsHub();
    await press('Transactions');
    await expectText(strings.posTransactionsLedgerReceipts.grossTitle);
    await press('RCT-20261016-001 ₦1,075');
    await expectText(strings.posTransactionDetails.headerTitle);
  });

  it('rings up a sale: catalog -> cart -> customer match -> tender -> split', async () => {
    await openBusinessShell();
    await openRegisterHome();
    await press(posHome.quickActions.newSale.label);
    await expectText(strings.posNewSaleCatalog.headerTitle);
    await press(`Rice ${strings.posNewSaleCatalog.addItemCta}`);
    await pressText(strings.posNewSaleCatalog.chargeCta);
    await expectText(strings.posCurrentSaleCart.headerTitle);

    await press(strings.posCurrentSaleCart.changeCta);
    await expectText(strings.posCustomerLookupActive.prompt.title);
    await goBack();

    await pressText(strings.posCurrentSaleCart.chargeCta);
    await expectText(strings.posTenderCheckout.headerTitle);
    await press(strings.posTenderCheckout.methods.split.label);
    await expectText(strings.splitTheBill.headerTitle);
  });

  it('reaches the offline home, its queue and back to the register', async () => {
    await openBusinessShell();
    await openOperationsHub();
    await press('Offline Mode');
    await expectText(strings.posHomeOfflineMode.headerTitle);
    await press(strings.posHomeOfflineMode.actions.queue.title);
    await expectText(strings.posOfflineBufferQueue.headerTitle);
    await pressText(strings.posOfflineBufferQueue.returnCta);
    await expectText(strings.posNewSaleCatalog.headerTitle);
  });

  it('reaches every settings area from the settings hub', async () => {
    const { links } = strings.posGeneralSettings;
    await openBusinessShell();
    await openSettingsHub();

    await press(links.offline.title);
    await expectText(strings.posSyncReconciliation.headerTitle);
    await goBack();
    await press(links.taxes.title);
    await expectText(strings.taxesSurcharges.title);
    await goBack();
    await press(links.security.title);
    await expectText(strings.staffPermissionsPasscodes.guardsTitle);
    await goBack();
    await press(links.hardware.title);
    await expectText(strings.paymentHardwareSetup.methodsTitle);
    await goBack();
    await press(links.receipt.title);
    await expectText(strings.posReceiptCustomization.settingsTitle);
    await goBack();
    await press(links.kitchen.title);
    await expectText(strings.merchantPosKitchenStream.headerTitle);
    await goBack();
    await press(links.tills.title);
    await expectText(strings.posBranchTillSwitcher.headerSubtitle);
  });

  it('reaches the shift journal, the guest kiosk and the customer list from the register', async () => {
    await openBusinessShell();
    await openRegisterHome();

    await press(posHome.controls.drawer.title);
    await expectText(strings.posTransactionsLedgerShift.title);
    await goBack();

    await press(posHome.controls.publicMode.title);
    await expectText(strings.publicPosMenu.addCta);
    await goBack();

    await press(posHome.quickActions.customers.label);
    await expectText(strings.posCustomerLookupList.title);
    await press(`${strings.posCustomerLookupList.dossierCta} Tolu Ade`);
    await expectText(strings.posCustomerDossier.headerTitle);
  });

  it('reaches stock: inventory -> one item', async () => {
    await openBusinessShell();
    await openRegisterHome();
    await press(posHome.quickActions.products.label);
    await expectText(strings.posProductsInventory.headerTitle);
    await press('Rice');
    await expectText(strings.posProductShiftStockStatus.auditTitle);
  });

  it('walks the customer display from the POS orders view to payment', async () => {
    await openBusinessShell();
    await press(shell.tabs.orders);
    await press(
      screen.queryByLabelText('\u2026')
        ? '\u2026'
        : strings.businessOrders.alertTitleFor(0),
    );
    await expectText(strings.businessPos.title);
    await press('#RCT-20261016-001');
    await expectText(strings.customerDisplayOrderTotal.orderLabel);
    await pressText(strings.customerDisplayOrderTotal.payCta);
    await expectText(strings.customerDisplayTapQrPay.totalDueLabel);
  });
});
