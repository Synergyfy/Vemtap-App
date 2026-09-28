import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { BusinessDashboardOverviewScreen } from '@features/business/screens/BusinessDashboardOverviewScreen';
import { BusinessOrdersHubScreen } from '@features/business/screens/BusinessOrdersHubScreen';
import { BusinessMessagesHomeScreen } from '@features/business/screens/BusinessMessagesHomeScreen';
import { BusinessHubCentralManagementScreen } from '@features/business/screens/BusinessHubCentralManagementScreen';
import { BusinessMoreHubScreen } from '@features/business/screens/BusinessMoreHubScreen';
import { OrderDetailScreen } from '@features/business/screens/BusinessOrderDetailScreen';
import { BusinessBookingsHubScreen } from '@features/business/screens/BusinessBookingsHubScreen';
import { BusinessPosOrdersViewScreen } from '@features/business/screens/BusinessPosOrdersViewScreen';
import { businessTabMeta } from '@features/business/components/BusinessTabBar';
import { strings } from '@constants/strings';

const shell = strings.businessShell;

describe('business bottom navigation', () => {
  it('owns the five design tabs with their badges', () => {
    expect(Object.keys(businessTabMeta)).toEqual([
      'BusinessOverview',
      'BusinessOrders',
      'BusinessMessages',
      'BusinessHub',
      'BusinessMore',
    ]);
    expect(businessTabMeta.BusinessOverview.label).toBe(shell.tabs.overview);
    expect(businessTabMeta.BusinessOrders.icon).toBe('receipt');
    expect(businessTabMeta.BusinessOrders.badge).toEqual({
      count: shell.ordersBadge,
      tone: 'brand',
    });
    expect(businessTabMeta.BusinessMessages.badge).toEqual({
      count: shell.messagesBadge,
      tone: 'error',
    });
    expect(businessTabMeta.BusinessHub.icon).toBe('storefront');
    expect(businessTabMeta.BusinessMore.label).toBe(shell.tabs.more);
  });
});

describe('business dashboard overview', () => {
  it('renders the branch context, growth tip, metrics, activity and shortcuts', async () => {
    const view = await render(<BusinessDashboardOverviewScreen />);
    const copy = strings.businessDashboard;

    expect(view.getByText(copy.branchLive)).toBeTruthy();
    expect(view.getByText(copy.growthTipTitle)).toBeTruthy();
    expect(view.getByText(copy.overviewTitle)).toBeTruthy();
    expect(view.getByText(copy.metrics.viewsValue)).toBeTruthy();
    expect(view.getByText(copy.metrics.customersValue)).toBeTruthy();
    expect(view.getByText(copy.metrics.dealsClaimedValue)).toBeTruthy();
    expect(view.getByText(copy.metrics.ordersBookingsVolume)).toBeTruthy();
    expect(view.getByText(copy.posAmount)).toBeTruthy();
    expect(view.getByText(copy.activityTitle)).toBeTruthy();
    copy.activity.forEach(item => {
      expect(view.getByText(item.title)).toBeTruthy();
      expect(view.getByText(item.cta)).toBeTruthy();
    });
    expect(view.getByText(copy.shortcutsTitle)).toBeTruthy();
    copy.shortcuts.forEach(tile => {
      // "Boost a Deal" also appears in the growth tip and the recommendation card.
      expect(view.getAllByText(tile.title).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.weekTitle)).toBeTruthy();
    expect(view.getByText(copy.recommendationsTitle)).toBeTruthy();
  });

  it('invokes the activity and branch-switch callbacks', async () => {
    const onOpenOrders = jest.fn();
    const onOpenMessages = jest.fn();
    const onBoostDeal = jest.fn();
    const view = await render(
      <BusinessDashboardOverviewScreen
        onOpenOrders={onOpenOrders}
        onOpenMessages={onOpenMessages}
        onBoostDeal={onBoostDeal}
      />,
    );
    const copy = strings.businessDashboard;

    await act(async () => {
      fireEvent.press(view.getByText('View'));
    });
    expect(onOpenOrders).toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(view.getByText('Reply'));
    });
    expect(onOpenMessages).toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(view.getAllByText(copy.growthTipCta)[0]);
    });
    expect(onBoostDeal).toHaveBeenCalled();
  });

  it('opens the branch sheet from the shared modal shell and switches branch', async () => {
    const view = await render(<BusinessDashboardOverviewScreen />);
    const copy = strings.businessDashboard;

    expect(view.queryByText(copy.branchSheetTitle)).toBeNull();

    await act(async () => {
      fireEvent.press(view.getAllByLabelText(copy.allBranches)[0]);
    });
    expect(view.getByText(copy.branchSheetTitle)).toBeTruthy();
    expect(view.getByText(copy.branchSheetSubtitle)).toBeTruthy();
    expect(view.getByText(copy.addBranch)).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.branches[1].name));
    });
    expect(view.queryByText(copy.branchSheetTitle)).toBeNull();
  });
});

describe('business orders hub', () => {
  it('renders the switcher, status chips, alert strip and every order row', async () => {
    const view = await render(<BusinessOrdersHubScreen />);
    const copy = strings.businessOrders;

    expect(view.getAllByText(copy.title).length).toBeGreaterThan(0);
    copy.switcher.forEach(label =>
      expect(view.getAllByText(label).length).toBeGreaterThan(0),
    );
    copy.filters.forEach(chip =>
      expect(view.getByText(`${chip.label} (${chip.count})`)).toBeTruthy(),
    );
    expect(view.getByText(copy.alertTitle)).toBeTruthy();
    expect(view.getByText(copy.alertBody)).toBeTruthy();
    copy.orders.forEach(order => {
      expect(view.getByText(order.reference)).toBeTruthy();
      expect(view.getByText(order.customer)).toBeTruthy();
      expect(view.getByText(order.amount)).toBeTruthy();
    });
  });

  it('keeps order card copy compact and contained', async () => {
    const view = await render(<BusinessOrdersHubScreen />);
    const copy = strings.businessOrders;

    // Compact-hub tokens: no heading-scale text inside the order cards.
    copy.orders.forEach(order => {
      const reference = view.getByText(order.reference);
      const amount = view.getByText(order.amount);
      const customer = view.getByText(order.customer);

      // Every value that shares a row is capped to one line so nothing can
      // spill out of the card.
      [reference, amount, customer].forEach(node => {
        expect(node.props.numberOfLines).toBe(1);
      });
    });

    // Payment chips truncate instead of pushing the CTA out of the row.
    expect(view.getAllByText(copy.orders[0].payment)[0].props.numberOfLines).toBe(1);
  });

  it('reports accepting an order and opening one', async () => {
    const onAcceptOrder = jest.fn();
    const onOpenOrder = jest.fn();
    const view = await render(
      <BusinessOrdersHubScreen onAcceptOrder={onAcceptOrder} onOpenOrder={onOpenOrder} />,
    );
    const copy = strings.businessOrders;

    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.orders[0].cta));
    });
    expect(onAcceptOrder).toHaveBeenCalledWith(copy.orders[0].id);

    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.orders[0].reference));
    });
    expect(onOpenOrder).toHaveBeenCalledWith(copy.orders[0].id);
  });
});

describe('business messages home', () => {
  it('renders filters, the connected strip and every thread', async () => {
    const view = await render(<BusinessMessagesHomeScreen />);
    const copy = strings.businessMessages;

    expect(view.getAllByText(copy.title).length).toBeGreaterThan(0);
    copy.filters.forEach(chip =>
      expect(view.getByText(`${chip.label} ${chip.count}`)).toBeTruthy(),
    );
    expect(view.getByText(copy.connected)).toBeTruthy();
    expect(view.getByText(copy.hubBranch)).toBeTruthy();
    copy.threads.forEach(thread => {
      expect(view.getByText(thread.name)).toBeTruthy();
      expect(view.getByText(thread.preview)).toBeTruthy();
    });
    expect(view.getByText(copy.newMessage)).toBeTruthy();
  });

  it('opens a thread and the new-message flow', async () => {
    const onOpenThread = jest.fn();
    const onNewMessage = jest.fn();
    const view = await render(
      <BusinessMessagesHomeScreen
        onOpenThread={onOpenThread}
        onNewMessage={onNewMessage}
      />,
    );
    const copy = strings.businessMessages;

    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.threads[0].name));
    });
    expect(onOpenThread).toHaveBeenCalledWith(copy.threads[0].id);

    await act(async () => {
      fireEvent.press(view.getByText(copy.newMessage));
    });
    expect(onNewMessage).toHaveBeenCalled();
  });
});

describe('business hub and more', () => {
  it('renders the storefront deck and every operations module', async () => {
    const onOpenCrm = jest.fn();
    const view = await render(
      <BusinessHubCentralManagementScreen onOpenCrm={onOpenCrm} />,
    );
    const copy = strings.businessHub;

    expect(view.getByText(copy.name)).toBeTruthy();
    expect(view.getByText(copy.category)).toBeTruthy();
    expect(view.getByText(copy.phone)).toBeTruthy();
    expect(view.getByText(copy.website)).toBeTruthy();
    expect(view.getByText(copy.modulesTitle)).toBeTruthy();
    copy.modules.forEach(module => {
      expect(view.getByText(module.title)).toBeTruthy();
      expect(view.getByText(module.meta)).toBeTruthy();
    });
    expect(view.getByText(copy.readerTitle)).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.modules[3].title));
    });
    expect(onOpenCrm).toHaveBeenCalled();
  });

  it('renders the more hub sections, consumer switch and sign out', async () => {
    const onSwitchToCustomer = jest.fn();
    const onSignOut = jest.fn();
    const view = await render(
      <BusinessMoreHubScreen
        onSwitchToCustomer={onSwitchToCustomer}
        onSignOut={onSignOut}
      />,
    );
    const copy = strings.businessMore;

    expect(view.getByText(copy.name)).toBeTruthy();
    expect(view.getByText(copy.plan)).toBeTruthy();
    expect(view.getByText(copy.terminalStatus)).toBeTruthy();
    copy.sections.forEach(section => {
      expect(view.getAllByText(section.title).length).toBeGreaterThan(0);
      section.items.forEach(item => {
        expect(view.getByLabelText(item.label)).toBeTruthy();
      });
    });
    expect(view.getByText(copy.buildFootnote)).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.switchToCustomer));
    });
    expect(onSwitchToCustomer).toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.signOut));
    });
    expect(onSignOut).toHaveBeenCalled();
  });
});

describe('order detail #VG-94021', () => {
  it('renders the status hero, triage, customer, items, ledger, timeline and modifiers', async () => {
    const view = await render(<OrderDetailScreen onBack={jest.fn()} />);
    const copy = strings.businessOrderDetail;

    expect(view.getByText(copy.reference)).toBeTruthy();
    expect(view.getByText(copy.statusLabel)).toBeTruthy();
    expect(view.getByText(copy.statusTitle)).toBeTruthy();
    expect(view.getByText(copy.statusEstimateValue)).toBeTruthy();
    expect(view.getByText(copy.customerName)).toBeTruthy();
    expect(view.getByText(copy.customerMeta)).toBeTruthy();
    expect(view.getByText(copy.callCustomer)).toBeTruthy();
    expect(view.getByText(copy.vemtapChat)).toBeTruthy();
    copy.items.forEach(item => expect(view.getByText(item.name)).toBeTruthy());
    expect(view.getByText(copy.subtotalValue)).toBeTruthy();
    expect(view.getByText(copy.totalValue)).toBeTruthy();
    expect(view.getByText(copy.settlementMethod)).toBeTruthy();
    copy.timeline.forEach(step => expect(view.getByText(step.title)).toBeTruthy());
    expect(view.getByText(copy.branchValue)).toBeTruthy();
    expect(view.getByText(copy.stationValue)).toBeTruthy();
    expect(view.getByText(copy.modifiersTitle)).toBeTruthy();
  });

  it('declines, accepts (revealing the kitchen notice) and fires state modifiers', async () => {
    const onAcceptOrder = jest.fn();
    const onDeclineOrder = jest.fn();
    const onMarkReady = jest.fn();
    const view = await render(
      <OrderDetailScreen
        onBack={jest.fn()}
        onAcceptOrder={onAcceptOrder}
        onDeclineOrder={onDeclineOrder}
        onMarkReady={onMarkReady}
      />,
    );
    const copy = strings.businessOrderDetail;

    expect(view.queryByText(copy.kitchenNotice)).toBeNull();

    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.triageAccept));
    });
    expect(onAcceptOrder).toHaveBeenCalled();
    expect(view.getByText(copy.kitchenNotice)).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.triageDecline));
    });
    expect(onDeclineOrder).toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.markReady));
    });
    expect(onMarkReady).toHaveBeenCalled();
  });
});

describe('business bookings hub', () => {
  it('renders the calendar strip, filters, summary and every booking', async () => {
    const view = await render(<BusinessBookingsHubScreen />);
    const copy = strings.businessBookings;

    expect(view.getAllByText(copy.title).length).toBeGreaterThan(0);
    copy.days.forEach(d => {
      expect(view.getByText(d.day)).toBeTruthy();
      expect(view.getByText(d.date)).toBeTruthy();
      expect(view.getAllByText(d.month).length).toBeGreaterThan(0);
    });
    copy.filters.forEach(f =>
      expect(view.getByText(`${f.label} ${f.count}`)).toBeTruthy(),
    );
    expect(view.getByText(copy.summaryTitle)).toBeTruthy();
    copy.bookings.forEach(booking => {
      expect(view.getByText(booking.time)).toBeTruthy();
      expect(view.getByText(booking.customer)).toBeTruthy();
    });
  });

  it('switches back to orders and checks a booking in', async () => {
    const onOpenOrders = jest.fn();
    const onCheckIn = jest.fn();
    const view = await render(
      <BusinessBookingsHubScreen onOpenOrders={onOpenOrders} onCheckIn={onCheckIn} />,
    );
    const copy = strings.businessBookings;

    const switcherTabs = view.getAllByRole('tab');
    await act(async () => {
      fireEvent.press(switcherTabs[0]);
    });
    expect(onOpenOrders).toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(view.getAllByLabelText(copy.bookings[0].cta)[0]);
    });
    expect(onCheckIn).toHaveBeenCalledWith(copy.bookings[0].id);
  });
});

describe('business POS orders view', () => {
  it('renders the terminal banner, volume and the unified order stream', async () => {
    const view = await render(<BusinessPosOrdersViewScreen onBack={jest.fn()} />);
    const copy = strings.businessPos;

    expect(view.getByText(copy.terminalName)).toBeTruthy();
    expect(view.getByText(copy.terminalStatus)).toBeTruthy();
    expect(view.getByText(copy.volumeValue)).toBeTruthy();
    expect(view.getByText(copy.activityTitle)).toBeTruthy();
    copy.orders.forEach(order => {
      expect(view.getByText(order.reference)).toBeTruthy();
      expect(view.getByText(order.total)).toBeTruthy();
    });
  });

  it('filters the stream by the search field and opens the register', async () => {
    const onOpenPos = jest.fn();
    const view = await render(
      <BusinessPosOrdersViewScreen onBack={jest.fn()} onOpenPos={onOpenPos} />,
    );
    const copy = strings.businessPos;

    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.openPos));
    });
    expect(onOpenPos).toHaveBeenCalled();

    await act(async () => {
      fireEvent.changeText(view.getByLabelText(copy.searchPlaceholder), 'MNP-9204');
    });
    expect(view.queryByText(copy.orders[0].reference)).toBeNull();
    expect(view.getByText(copy.orders[2].reference)).toBeTruthy();
  });
});
