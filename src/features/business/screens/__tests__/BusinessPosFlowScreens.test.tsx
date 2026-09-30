import React from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { strings } from '@constants/strings';
import { PosBranchTillSwitcherScreen } from '@features/business/screens/PosBranchTillSwitcherScreen';
import { PosHomeSalesOperationsScreen } from '@features/business/screens/PosHomeSalesOperationsScreen';
import { PosNewSaleCatalogScreen } from '@features/business/screens/PosNewSaleCatalogScreen';
import { PosCurrentSaleCartScreen } from '@features/business/screens/PosCurrentSaleCartScreen';
import { PosTenderCheckoutScreen } from '@features/business/screens/PosTenderCheckoutScreen';
import { PosSaleCompletedScreen } from '@features/business/screens/PosSaleCompletedScreen';
import { PosReceiptCustomizationScreen } from '@features/business/screens/PosReceiptCustomizationScreen';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import {
  cartGrandTotal,
  cartLines,
  catalogItems,
  completedSale,
  posBranchChoices,
  posBranches,
  posQuickActions,
  posTills,
  receiptPreview,
  tenderOrder,
} from '@features/business/data/businessPosFlowData';

afterEach(cleanup);

/**
 * Press a control and let its resulting render settle before the next
 * interaction. Two back-to-back presses with no flush in between leave React's
 * act queue unbalanced, which poisons every later test in the run — so
 * consecutive interactions go through here.
 */
/** Press the first match, for labels that repeat across sibling controls. */
async function pressFirst(view: Awaited<ReturnType<typeof render>>, label: string) {
  fireEvent.press(view.getAllByLabelText(label)[0]);
  await waitFor(() => expect(view.getAllByLabelText(label).length).toBeGreaterThan(0));
}

async function pressAndSettle(view: Awaited<ReturnType<typeof render>>, label: string) {
  fireEvent.press(view.getByLabelText(label));
  await waitFor(() => expect(view.getByLabelText(label)).toBeTruthy());
}

describe('pos branch & till switcher', () => {
  const copy = strings.posBranchTillSwitcher;

  it('renders the current context, every till and every branch', async () => {
    const view = await render(<PosBranchTillSwitcherScreen />);

    expect(view.getByText(copy.headerSubtitle)).toBeTruthy();
    expect(view.getAllByText(copy.currentBranch).length).toBeGreaterThan(0);
    expect(view.getByText(copy.loggedStaff)).toBeTruthy();
    expect(view.getByText(copy.register)).toBeTruthy();
    posTills.forEach(till => {
      expect(view.getAllByText(till.name).length).toBeGreaterThan(0);
    });
    posBranches.forEach(branch => {
      // The current branch also names the tills panel and the context card.
      expect(view.getAllByText(branch.name).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.securityTitle)).toBeTruthy();
  });

  it('selects a till, a branch, then confirms or cancels', async () => {
    const onSelectTill = jest.fn();
    const onSwitchBranch = jest.fn();
    const onConfirmSwitch = jest.fn();
    const onCancel = jest.fn();
    const view = await render(
      <PosBranchTillSwitcherScreen
        onSelectTill={onSelectTill}
        onSwitchBranch={onSwitchBranch}
        onConfirmSwitch={onConfirmSwitch}
        onCancel={onCancel}
      />,
    );

    await pressAndSettle(view, posTills[1].name);
    expect(onSelectTill).toHaveBeenCalledWith(posTills[1].id);

    await pressAndSettle(view, posBranches[1].name);
    expect(onSwitchBranch).toHaveBeenCalledWith(posBranches[1].id);

    await pressAndSettle(view, copy.confirmCta);
    expect(onConfirmSwitch).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.cancelCta);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe('pos home sales & operations hub', () => {
  const copy = strings.posHomeSalesOperations;

  it('renders branches, sync, offline protection, quick actions and the summary', async () => {
    const view = await render(<PosHomeSalesOperationsScreen />);

    expect(view.getByText(copy.storeTitle)).toBeTruthy();
    expect(view.getByText(copy.syncLabel)).toBeTruthy();
    expect(view.getByText(copy.offlineTitle)).toBeTruthy();
    expect(view.getByText(copy.storageTitle)).toBeTruthy();
    posQuickActions.forEach(action => {
      expect(view.getAllByLabelText(action.label).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.summaryTitle)).toBeTruthy();
    expect(view.getByText(copy.drawerTitle)).toBeTruthy();
  });

  it('runs quick actions, a sync check, the drawer and a register control', async () => {
    const onQuickAction = jest.fn();
    const onSyncCheck = jest.fn();
    const onOpenDrawer = jest.fn();
    const onOpenControl = jest.fn();
    const onSelectBranch = jest.fn();
    const view = await render(
      <PosHomeSalesOperationsScreen
        onQuickAction={onQuickAction}
        onSyncCheck={onSyncCheck}
        onOpenDrawer={onOpenDrawer}
        onOpenControl={onOpenControl}
        onSelectBranch={onSelectBranch}
      />,
    );

    await pressAndSettle(view, posQuickActions[0].label);
    expect(onQuickAction).toHaveBeenCalledWith('new-sale');

    await pressAndSettle(view, 'Check');
    expect(onSyncCheck).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, 'Drawer Balance');
    expect(onOpenDrawer).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, 'Customer Public Mode');
    expect(onOpenControl).toHaveBeenCalledWith('public-mode');
  });
});

describe('pos new sale register catalog', () => {
  const copy = strings.posNewSaleCatalog;

  it('renders the search, categories, every item and the running order', async () => {
    const view = await render(<PosNewSaleCatalogScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.registerLabel)).toBeTruthy();
    expect(view.getByText(copy.catalogTitle)).toBeTruthy();
    copy.categories.forEach(category => {
      expect(view.getAllByLabelText(category.label).length).toBeGreaterThan(0);
    });
    catalogItems.forEach(item => {
      expect(view.getAllByText(item.name).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.customTitle)).toBeTruthy();
    expect(view.getByText(copy.guestLabel)).toBeTruthy();
  });

  it('adds an item, filters a category, scans and charges', async () => {
    const onAddItem = jest.fn();
    const onFilterCategory = jest.fn();
    const onScan = jest.fn();
    const onCharge = jest.fn();
    const view = await render(
      <PosNewSaleCatalogScreen
        onAddItem={onAddItem}
        onFilterCategory={onFilterCategory}
        onScan={onScan}
        onCharge={onCharge}
      />,
    );

    await pressAndSettle(view, `${catalogItems[0].name} ${copy.addItemCta}`);
    expect(onAddItem).toHaveBeenCalledWith(catalogItems[0].id);

    await pressAndSettle(view, copy.categories[0].label);
    expect(onFilterCategory).toHaveBeenCalledWith(copy.categories[0].id);

    await pressAndSettle(view, 'Scan');
    expect(onScan).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.chargeCta);
    expect(onCharge).toHaveBeenCalledTimes(1);
  });
});

describe('pos current sale & cart review', () => {
  const copy = strings.posCurrentSaleCart;

  it('renders the customer, every line, the totals and the total due', async () => {
    const view = await render(<PosCurrentSaleCartScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText('Michael James')).toBeTruthy();
    cartLines.forEach(line => {
      expect(view.getAllByText(line.name).length).toBeGreaterThan(0);
    });
    expect(view.getAllByText(cartGrandTotal).length).toBeGreaterThan(0);
    expect(view.getByText(copy.noteCta)).toBeTruthy();
    expect(view.getByText(copy.discountCta)).toBeTruthy();
  });

  it('changes quantity, removes a line, holds and charges', async () => {
    const onChangeQty = jest.fn();
    const onRemoveLine = jest.fn();
    const onHold = jest.fn();
    const onCharge = jest.fn();
    const view = await render(
      <PosCurrentSaleCartScreen
        onChangeQty={onChangeQty}
        onRemoveLine={onRemoveLine}
        onHold={onHold}
        onCharge={onCharge}
      />,
    );

    await pressAndSettle(view, `${cartLines[0].name} increase`);
    expect(onChangeQty).toHaveBeenCalledWith(cartLines[0].id, cartLines[0].qty + 1);

    await pressAndSettle(view, `${cartLines[0].name} delete`);
    expect(onRemoveLine).toHaveBeenCalledWith(cartLines[0].id);

    await pressAndSettle(view, copy.holdTicketCta);
    expect(onHold).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.chargeCta);
    expect(onCharge).toHaveBeenCalledTimes(1);
  });
});

describe('pos payment tender checkout', () => {
  const copy = strings.posTenderCheckout;

  it('renders the amount due, the order, points and every tender method', async () => {
    const view = await render(<PosTenderCheckoutScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    // The amount due heads the panel and repeats in the receipt-dispatch total.
    expect(view.getAllByText(tenderOrder.due).length).toBeGreaterThan(0);
    copy.tenderMethods.forEach(method => {
      expect(view.getAllByLabelText(method.label).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.tenderTitle)).toBeTruthy();
    expect(view.getByText(copy.receiptTitle)).toBeTruthy();
  });

  it('switches tender, applies points, picks a cash preset and completes', async () => {
    const onSelectTender = jest.fn();
    const onApplyPoints = jest.fn();
    const onCashPreset = jest.fn();
    const onCompleteSale = jest.fn();
    const view = await render(
      <PosTenderCheckoutScreen
        onSelectTender={onSelectTender}
        onApplyPoints={onApplyPoints}
        onCashPreset={onCashPreset}
        onCompleteSale={onCompleteSale}
      />,
    );

    await pressAndSettle(view, copy.tenderMethods[1].label);
    expect(onSelectTender).toHaveBeenCalledWith(copy.tenderMethods[1].id);
    // Transfer panel replaces the cash calculator.
    expect(view.getByText(copy.bankLabel)).toBeTruthy();

    await pressAndSettle(view, copy.applyPointsCta);
    expect(onApplyPoints).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.tenderMethods[0].label);
    await pressAndSettle(view, '₦28,000');
    expect(onCashPreset).toHaveBeenCalledWith('₦28,000');

    await pressAndSettle(view, `${copy.completeCta} (${tenderOrder.due})`);
    expect(onCompleteSale).toHaveBeenCalledTimes(1);
  });
});

describe('pos sale completed & receipt', () => {
  const copy = strings.posSaleCompleted;

  it('renders the confirmation, receipt identity, lines and tender breakdown', async () => {
    const view = await render(<PosSaleCompletedScreen />);

    expect(view.getByText(copy.headline)).toBeTruthy();
    // The receipt id shares a line with the sale timestamp.
    expect(
      view.getByText(new RegExp(completedSale.receiptId.replace('#', '\\#'))),
    ).toBeTruthy();
    expect(view.getByText(completedSale.cashier)).toBeTruthy();
    expect(view.getByText(completedSale.customer)).toBeTruthy();
    // "Total Paid" heads the payment summary and labels the cash tender row.
    expect(view.getAllByText(copy.totalPaidLabel).length).toBeGreaterThan(0);
    expect(view.getAllByText(copy.cashLabel).length).toBeGreaterThan(0);
  });

  it('prints, sends and starts a new sale', async () => {
    const onPrint = jest.fn();
    const onSendToMobile = jest.fn();
    const onNewSale = jest.fn();
    const view = await render(
      <PosSaleCompletedScreen
        onPrint={onPrint}
        onSendToMobile={onSendToMobile}
        onNewSale={onNewSale}
      />,
    );

    // "Print Thermal Receipt" labels both the footer CTA and the printer row.
    await pressFirst(view, copy.printCta);
    expect(onPrint).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.sendCta);
    expect(onSendToMobile).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.newSaleCta);
    expect(onNewSale).toHaveBeenCalledTimes(1);
  });
});

describe('receipt & order customization', () => {
  const copy = strings.posReceiptCustomization;

  it('renders the settings and the live thermal simulation', async () => {
    const view = await render(<PosReceiptCustomizationScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.settingsTitle)).toBeTruthy();
    expect(view.getByText(copy.previewTitle)).toBeTruthy();
    expect(view.getByText(copy.totalDueLabel)).toBeTruthy();
    expect(view.getByText(receiptPreview.total)).toBeTruthy();
    expect(view.getByText(copy.thanksLabel)).toBeTruthy();
  });

  it('toggles a setting, edits and prints a test slip', async () => {
    const onToggleSetting = jest.fn();
    const onEditReceipt = jest.fn();
    const onPrintTest = jest.fn();
    const view = await render(
      <PosReceiptCustomizationScreen
        onToggleSetting={onToggleSetting}
        onEditReceipt={onEditReceipt}
        onPrintTest={onPrintTest}
      />,
    );

    await pressAndSettle(view, 'Bold headings');
    expect(onToggleSetting).toHaveBeenCalledWith('bold', false);

    // "Customize Receipt" labels both the footer CTA and the preview action.
    await pressFirst(view, copy.editCta);
    expect(onEditReceipt).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.printCta);
    expect(onPrintTest).toHaveBeenCalledTimes(1);
  });
});

describe('pos sale flow navigation', () => {
  const shell = strings.businessShell;
  const catalog = strings.posNewSaleCatalog;
  const cart = strings.posCurrentSaleCart;
  const tender = strings.posTenderCheckout;
  const more = strings.businessMore;

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
    await act(async () => {
      fireEvent.press(screen.getAllByLabelText(posHomeTile.label)[0]);
    });
  }

  const posHomeTile = strings.businessMoreHubOperations.posTiles.find(
    tile => tile.id === 'pos-home',
  )!;

  afterEach(cleanup);

  it('walks catalog -> cart -> tender from the POS register', async () => {
    await render(
      <NavigationContainer>
        <BusinessTabNavigator />
      </NavigationContainer>,
    );
    // More tab -> More hub POS row -> operations hub -> POS register home tile.
    await openOperationsHub();
    expect(
      screen.getAllByText(strings.posHomeSalesOperations.storeTitle).length,
    ).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getAllByLabelText('New Sale')[0]);
    });
    expect(screen.getAllByText(catalog.headerTitle).length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getByLabelText(catalog.chargeCta));
    });
    expect(screen.getAllByText(cart.headerTitle).length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getByLabelText(cart.chargeCta));
    });
    expect(screen.getAllByText(tender.headerTitle).length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getByLabelText(tender.tenderMethods[0].label));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText('₦28,000'));
    });
    await act(async () => {
      fireEvent.press(
        screen.getByLabelText(`${tender.completeCta} (${tenderOrder.due})`),
      );
    });
    expect(screen.getAllByText(strings.posSaleCompleted.headline).length).toBeGreaterThan(
      0,
    );

    // The completed-sale printer action hands off to receipt customisation.
    await act(async () => {
      fireEvent.press(screen.getAllByLabelText(strings.posSaleCompleted.printCta)[0]);
    });
    expect(
      screen.getAllByText(strings.posReceiptCustomization.headerTitle).length,
    ).toBeGreaterThan(0);
  });

  it('reaches till switching from the register home', async () => {
    await render(
      <NavigationContainer>
        <BusinessTabNavigator />
      </NavigationContainer>,
    );
    await openOperationsHub();
    expect(
      screen.getAllByText(strings.posHomeSalesOperations.storeTitle).length,
    ).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getByLabelText(posBranchChoices[0].name));
    });
    expect(
      screen.getAllByText(strings.posBranchTillSwitcher.headerTitle).length,
    ).toBeGreaterThan(0);
  });
});
