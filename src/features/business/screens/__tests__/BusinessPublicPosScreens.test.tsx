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
import { PublicPosOrderTrackingScreen } from '@features/business/screens/PublicPosOrderTrackingScreen';
import { PublicPosCartReviewScreen } from '@features/business/screens/PublicPosCartReviewScreen';
import { PublicPosOrderMenuScreen } from '@features/business/screens/PublicPosOrderMenuScreen';
import { MerchantPosKitchenStreamScreen } from '@features/business/screens/MerchantPosKitchenStreamScreen';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import {
  merchantPosStreamFooterStats,
  merchantPosStreamLines,
  merchantPosStreamTabs,
  publicPosCartLines,
  publicPosBillRows,
  publicPosMenuCategories,
  publicPosMenuItems,
  publicPosOrderLines,
  publicPosPrepSteps,
} from '@features/business/data/businessPublicPosData';

afterEach(cleanup);

/**
 * Press a control and let its resulting render settle before the next
 * interaction. Two back-to-back presses with no flush in between leave React's
 * act queue unbalanced, which poisons every later test in the run.
 */
async function pressAndSettle(view: Awaited<ReturnType<typeof render>>, label: string) {
  fireEvent.press(view.getByLabelText(label));
  await waitFor(() => expect(view.getByLabelText(label)).toBeTruthy());
}

describe('public pos order tracking', () => {
  const copy = strings.publicPosOrderTracking;

  it('renders the confirmation, prep timeline, summary and guest actions', async () => {
    const view = await render(<PublicPosOrderTrackingScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.headline)).toBeTruthy();
    expect(view.getByText(copy.prepValue)).toBeTruthy();
    publicPosPrepSteps.forEach(step => {
      expect(view.getAllByText(step.title).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.summaryTitle)).toBeTruthy();
    publicPosOrderLines.forEach(line => {
      // Qty and name share one line in the summary rows.
      expect(
        view.getAllByText(new RegExp(line.name.replace(/[()]/g, '\\$&'))).length,
      ).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.totalLabel)).toBeTruthy();
    expect(view.getByText(copy.callWaiterCta)).toBeTruthy();
    expect(view.getByText(copy.addItemsCta)).toBeTruthy();
  });

  it('calls the waiter, reopens the menu and opens the summary', async () => {
    const onCallWaiter = jest.fn();
    const onReopenMenu = jest.fn();
    const onOpenOrderSummary = jest.fn();
    const view = await render(
      <PublicPosOrderTrackingScreen
        onCallWaiter={onCallWaiter}
        onReopenMenu={onReopenMenu}
        onOpenOrderSummary={onOpenOrderSummary}
      />,
    );

    await pressAndSettle(view, copy.callWaiterCta);
    expect(onCallWaiter).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.addItemsCta);
    expect(onReopenMenu).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.summaryTitle);
    expect(onOpenOrderSummary).toHaveBeenCalledTimes(1);
  });
});

describe('public pos cart review', () => {
  const copy = strings.publicPosCartReview;

  it('renders the table, every dish, guest details and the bill', async () => {
    const view = await render(<PublicPosCartReviewScreen />);

    expect(view.getByText(copy.tableLabel)).toBeTruthy();
    expect(view.getByText(copy.verifiedBadge)).toBeTruthy();
    expect(view.getByText(copy.dishesTitle)).toBeTruthy();
    publicPosCartLines.forEach(line => {
      expect(view.getAllByText(line.name).length).toBeGreaterThan(0);
      expect(view.getAllByText(line.price).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.nameValue)).toBeTruthy();
    expect(view.getByText(copy.phoneValue)).toBeTruthy();
    expect(view.getByText(copy.seatTitle)).toBeTruthy();
    expect(view.getByText(copy.instructionsValue)).toBeTruthy();
    publicPosBillRows.forEach(row => {
      expect(view.getAllByText(row.value).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.totalDue)).toBeTruthy();
    expect(view.getByText(copy.payTitle)).toBeTruthy();
    expect(view.getByText(copy.submitCta)).toBeTruthy();
  });

  it('changes quantities, removes a line, edits details and submits', async () => {
    const onChangeQty = jest.fn();
    const onRemoveLine = jest.fn();
    onChangeQty.mockClear();
    const onAddFood = jest.fn();
    const onEditName = jest.fn();
    const onEditPhone = jest.fn();
    const onEditInstructions = jest.fn();
    const onSubmitOrder = jest.fn();
    const view = await render(
      <PublicPosCartReviewScreen
        onChangeQty={onChangeQty}
        onRemoveLine={onRemoveLine}
        onAddFood={onAddFood}
        onEditName={onEditName}
        onEditPhone={onEditPhone}
        onEditInstructions={onEditInstructions}
        onSubmitOrder={onSubmitOrder}
      />,
    );

    await pressAndSettle(view, `${publicPosCartLines[0].name} increase`);
    expect(onChangeQty).toHaveBeenCalledWith('ribeye', 2);

    await pressAndSettle(view, `${publicPosCartLines[1].name} delete`);
    expect(onRemoveLine).toHaveBeenCalledWith('burger');

    await pressAndSettle(view, copy.addFoodCta);
    expect(onAddFood).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.nameLabel);
    expect(onEditName).toHaveBeenCalledWith(copy.nameValue);

    await pressAndSettle(view, copy.phoneLabel);
    expect(onEditPhone).toHaveBeenCalledWith(copy.phoneValue);

    await pressAndSettle(view, copy.instructionsTitle);
    expect(onEditInstructions).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.submitCta);
    expect(onSubmitOrder).toHaveBeenCalledTimes(1);
  });
});

describe('public pos order menu', () => {
  const copy = strings.publicPosMenu;

  it('renders venue, table, categories, every dish and the cart hand-off', async () => {
    const view = await render(<PublicPosOrderMenuScreen />);

    expect(view.getByText(copy.venueName)).toBeTruthy();
    expect(view.getByText(copy.tableTitle)).toBeTruthy();
    publicPosMenuCategories.forEach(category => {
      expect(view.getAllByLabelText(category.label).length).toBeGreaterThan(0);
    });
    publicPosMenuItems.forEach(item => {
      expect(view.getAllByText(item.name).length).toBeGreaterThan(0);
      expect(view.getAllByText(item.price).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.dealBadge)).toBeTruthy();
    expect(view.getByText(copy.dietaryNote)).toBeTruthy();
    expect(view.getByLabelText(copy.viewCartCta)).toBeTruthy();
    expect(view.getByText(copy.reviewOrderCta)).toBeTruthy();
  });

  it('filters, customises, adds a dish and reviews the order', async () => {
    const onSelectCategory = jest.fn();
    const onCustomize = jest.fn();
    const onAddItem = jest.fn();
    const onReviewOrder = jest.fn();
    const onOpenCart = jest.fn();
    const onChangeTable = jest.fn();
    const onOpenFilters = jest.fn();
    const view = await render(
      <PublicPosOrderMenuScreen
        onSelectCategory={onSelectCategory}
        onCustomize={onCustomize}
        onAddItem={onAddItem}
        onReviewOrder={onReviewOrder}
        onOpenCart={onOpenCart}
        onChangeTable={onChangeTable}
        onOpenFilters={onOpenFilters}
      />,
    );

    await pressAndSettle(view, copy.filterCta);
    expect(onOpenFilters).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, publicPosMenuCategories[1].label);
    expect(onSelectCategory).toHaveBeenCalledWith('grills');

    await pressAndSettle(view, `${copy.customizeCta} ${publicPosMenuItems[0].name}`);
    expect(onCustomize).toHaveBeenCalledWith('ribeye');

    await pressAndSettle(
      view,
      `${publicPosMenuItems[1].cta} ${publicPosMenuItems[1].name}`,
    );
    expect(onAddItem).toHaveBeenCalledWith('combo');

    await pressAndSettle(view, copy.tableTitle);
    expect(onChangeTable).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.reviewOrderCta);
    expect(onReviewOrder).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.viewCartCta);
    expect(onOpenCart).toHaveBeenCalledTimes(1);
  });
});

describe('merchant pos kitchen stream', () => {
  const copy = strings.merchantPosKitchenStream;

  it('renders the stream tabs, the incoming ticket and the live order', async () => {
    const view = await render(<MerchantPosKitchenStreamScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.branchLabel)).toBeTruthy();
    expect(view.getByText(copy.liveBadge)).toBeTruthy();
    merchantPosStreamTabs.forEach(tab => {
      expect(view.getAllByLabelText(tab.label).length).toBeGreaterThan(0);
    });
    expect(view.getByText('Order #UG-1085')).toBeTruthy();
    expect(view.getByText('Samuel Adeleke')).toBeTruthy();
    merchantPosStreamLines.forEach(line => {
      expect(view.getAllByText(line.name).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.noteTitle)).toBeTruthy();
    expect(view.getByText(copy.unpaidBadge)).toBeTruthy();
    expect(view.getByText('Order #UG-1084')).toBeTruthy();
    merchantPosStreamFooterStats.forEach(stat => {
      expect(view.getAllByText(stat.value).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.acceptCta)).toBeTruthy();
    expect(view.getByText(copy.returnCta)).toBeTruthy();
  });

  it('accepts, prints, rejects, marks ready and returns to the register', async () => {
    const onAcceptOrder = jest.fn();
    const onPrintChit = jest.fn();
    const onRejectOrder = jest.fn();
    const onMarkReady = jest.fn();
    const onReturnToRegister = jest.fn();
    const onSelectTab = jest.fn();
    const onCallGuest = jest.fn();
    const view = await render(
      <MerchantPosKitchenStreamScreen
        onAcceptOrder={onAcceptOrder}
        onPrintChit={onPrintChit}
        onRejectOrder={onRejectOrder}
        onMarkReady={onMarkReady}
        onReturnToRegister={onReturnToRegister}
        onSelectTab={onSelectTab}
        onCallGuest={onCallGuest}
      />,
    );

    await pressAndSettle(view, merchantPosStreamTabs[1].label);
    expect(onSelectTab).toHaveBeenCalledWith('preparing');

    await pressAndSettle(view, 'Call Samuel Adeleke');
    expect(onCallGuest).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.acceptCta);
    expect(onAcceptOrder).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.printCta);
    expect(onPrintChit).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.rejectCta);
    expect(onRejectOrder).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.markReadyCta);
    expect(onMarkReady).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.returnCta);
    expect(onReturnToRegister).toHaveBeenCalledTimes(1);
  });
});

describe('public pos navigation', () => {
  const shell = strings.businessShell;
  const more = strings.businessMore;
  const menu = strings.publicPosMenu;
  const cart = strings.publicPosCartReview;
  const tracking = strings.publicPosOrderTracking;

  /** More tab -> More hub "POS" row -> the operations-dense hub. */
  async function openOperationsHub() {
    const rows: { id: string; label: string }[] = [];
    more.sections.forEach(section => {
      section.items.forEach(item => rows.push({ id: item.id, label: item.label }));
    });
    const posRow = rows.find(item => item.id === 'pos-launch');
    if (!posRow) throw new Error('No More-hub row with id "pos-launch"');
    // Inside a pushed stack the More tab also labels the hub's own title, so
    // target the tab bar explicitly.
    await act(async () => {
      fireEvent.press(screen.getAllByLabelText(shell.tabs.more)[0]);
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText(posRow.label));
    });
  }

  it('reaches the kitchen stream from the operations hub and back to the guest view', async () => {
    await render(
      <NavigationContainer>
        <BusinessTabNavigator />
      </NavigationContainer>,
    );
    await openOperationsHub();

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Public POS'));
    });
    expect(
      screen.getAllByText(strings.merchantPosKitchenStream.headerTitle).length,
    ).toBeGreaterThan(0);

    // Accepting the public ticket hands off to the guest's tracking view.
    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.merchantPosKitchenStream.acceptCta));
    });
    expect(screen.getAllByText(tracking.headline).length).toBeGreaterThan(0);
  });

  it('reaches the guest menu from the register home public mode', async () => {
    await render(
      <NavigationContainer>
        <BusinessTabNavigator />
      </NavigationContainer>,
    );
    await openOperationsHub();
    const posHomeTile = strings.businessMoreHubOperations.posTiles.find(
      tile => tile.id === 'pos-home',
    );
    await act(async () => {
      fireEvent.press(screen.getByLabelText(posHomeTile!.label));
    });

    // "Customer Public Mode" is the register's door onto the guest-facing menu.
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Customer Public Mode'));
    });
    expect(screen.getAllByText(menu.venueName).length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getByLabelText(menu.reviewOrderCta));
    });
    expect(screen.getAllByText(cart.dishesTitle).length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getByLabelText(cart.submitCta));
    });
    expect(screen.getAllByText(tracking.headline).length).toBeGreaterThan(0);
  });
});
