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
import { BusinessMoreHubOperationsScreen } from '@features/business/screens/BusinessMoreHubOperationsScreen';
import { PosHomeOfflineModeScreen } from '@features/business/screens/PosHomeOfflineModeScreen';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import {
  hubAnalyticsRows,
  hubMarketingRows,
  hubPosTiles,
  hubQrRows,
  offlineQueuedCount,
  offlineTally,
} from '@features/business/data/businessOpsHubData';

afterEach(cleanup);

/**
 * Press a control and let its resulting render settle before the next
 * interaction. Two back-to-back presses with no flush in between leave React's
 * act queue unbalanced, which poisons every later test in the run — so
 * consecutive interactions go through here.
 */
async function pressAndSettle(view: Awaited<ReturnType<typeof render>>, label: string) {
  fireEvent.press(view.getByLabelText(label));
  await waitFor(() => expect(view.getByLabelText(label)).toBeTruthy());
}

describe('business more hub (operations variant)', () => {
  const copy = strings.businessMoreHubOperations;
  const more = strings.businessMore;

  it('renders the identity block, POS grid, net sales and every link group', async () => {
    const view = await render(<BusinessMoreHubOperationsScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.identityName)).toBeTruthy();
    expect(view.getByText(copy.identityMeta)).toBeTruthy();
    expect(view.getByText(copy.terminalStatus)).toBeTruthy();
    expect(view.getByText(copy.posTitle)).toBeTruthy();
    expect(view.getByText(copy.netSalesValue)).toBeTruthy();

    hubPosTiles.forEach(tile => {
      expect(view.getByLabelText(tile.label)).toBeTruthy();
    });
    [...hubAnalyticsRows, ...hubMarketingRows, ...hubQrRows].forEach(row => {
      expect(view.getAllByLabelText(row.title).length).toBeGreaterThan(0);
    });
    // The management group inherits the standard More hub rows.
    expect(
      view.getAllByLabelText(more.sections[4].items[0].label).length,
    ).toBeGreaterThan(0);
  });

  it('opens a POS tile, an analytics row, a management row, switch and sign out', async () => {
    const onOpenPosTile = jest.fn();
    const onOpenRow = jest.fn();
    const onSwitchToCustomer = jest.fn();
    const onSignOut = jest.fn();
    const view = await render(
      <BusinessMoreHubOperationsScreen
        onOpenPosTile={onOpenPosTile}
        onOpenRow={onOpenRow}
        onSwitchToCustomer={onSwitchToCustomer}
        onSignOut={onSignOut}
      />,
    );

    await pressAndSettle(view, 'Offline Mode');
    expect(onOpenPosTile).toHaveBeenCalledWith('offline');

    await pressAndSettle(view, hubAnalyticsRows[1].title);
    expect(onOpenRow).toHaveBeenCalledWith(hubAnalyticsRows[1].id);

    await pressAndSettle(view, hubMarketingRows[0].title);
    expect(onOpenRow).toHaveBeenCalledWith('boost');

    await pressAndSettle(view, hubQrRows[1].title);
    expect(onOpenRow).toHaveBeenCalledWith('location-qr');

    await pressAndSettle(view, more.switchToCustomer);
    expect(onSwitchToCustomer).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, more.signOut);
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});

describe('pos home offline mode active', () => {
  const copy = strings.posHomeOfflineMode;

  it('renders the offline banner, buffer, sync panel, actions and local tally', async () => {
    const view = await render(<PosHomeOfflineModeScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.offlineTitle)).toBeTruthy();
    expect(view.getByText(copy.offlineSubtitle)).toBeTruthy();
    expect(view.getByText(copy.encryptedLabel)).toBeTruthy();
    expect(view.getByText(copy.encryptedBody)).toBeTruthy();
    expect(view.getByText(copy.bufferTitle)).toBeTruthy();
    expect(view.getByText(copy.syncTitle)).toBeTruthy();
    expect(
      view.getByText(copy.syncCount.replace('{count}', String(offlineQueuedCount))),
    ).toBeTruthy();
    expect(view.getByText(copy.tallyTitle)).toBeTruthy();
    offlineTally.forEach(tallied => {
      expect(view.getAllByText(tallied.value).length).toBeGreaterThan(0);
    });
    copy.offlineActions.forEach(action => {
      expect(view.getAllByLabelText(action.title).length).toBeGreaterThan(0);
    });
  });

  it('retries sync, opens an offline action, drawer and customer display', async () => {
    const onRetrySync = jest.fn();
    const onOpenAction = jest.fn();
    const onOpenDrawer = jest.fn();
    const onOpenCustomerDisplay = jest.fn();
    const view = await render(
      <PosHomeOfflineModeScreen
        onRetrySync={onRetrySync}
        onOpenAction={onOpenAction}
        onOpenDrawer={onOpenDrawer}
        onOpenCustomerDisplay={onOpenCustomerDisplay}
      />,
    );

    // The CTA is docked and repeated in the sync panel; the first is the dock.
    fireEvent.press(view.getAllByLabelText(copy.retrySyncCta)[0]);
    await waitFor(() =>
      expect(view.getAllByLabelText(copy.retrySyncCta).length).toBeGreaterThan(0),
    );
    expect(onRetrySync).toHaveBeenCalled();

    await pressAndSettle(view, copy.offlineActions[0].title);
    expect(onOpenAction).toHaveBeenCalledWith(copy.offlineActions[0].id);

    await pressAndSettle(view, copy.drawerLabel);
    expect(onOpenDrawer).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.displayModeLabel);
    expect(onOpenCustomerDisplay).toHaveBeenCalledTimes(1);
  });
});

describe('operations hub + offline pos navigation', () => {
  const shell = strings.businessShell;
  const more = strings.businessMore;
  const copy = strings.businessMoreHubOperations;
  const offline = strings.posHomeOfflineMode;

  afterEach(cleanup);

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

  const posRow = () => {
    const rows: { id: string; label: string }[] = [];
    more.sections.forEach(section => {
      section.items.forEach(item => rows.push({ id: item.id, label: item.label }));
    });
    const found = rows.find(item => item.id === 'pos-launch');
    if (!found) throw new Error('No More-hub row with id "pos-launch"');
    return found;
  };

  it('reaches the operations hub from the More hub POS row', async () => {
    await openMoreTab();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(posRow().label));
    });
    expect(screen.getAllByText(copy.headerTitle).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText('Offline Mode').length).toBeGreaterThan(0);
  });

  it('reaches the offline POS home from the operations hub tile', async () => {
    await openMoreTab();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(posRow().label));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Offline Mode'));
    });
    expect(screen.getAllByText(offline.offlineTitle).length).toBeGreaterThan(0);
  });
});
