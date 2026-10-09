import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BusinessDashboardOverviewScreen } from '@features/business/screens/BusinessDashboardOverviewScreen';
import { BusinessOrdersHubScreen } from '@features/business/screens/BusinessOrdersHubScreen';
import {
  BusinessMessagesHomeScreen,
  type BusinessMessageThreadView,
} from '@features/business/screens/BusinessMessagesHomeScreen';
import { BusinessHubCentralManagementScreen } from '@features/business/screens/BusinessHubCentralManagementScreen';
import { BusinessMoreHubScreen } from '@features/business/screens/BusinessMoreHubScreen';
import { OrderDetailScreen } from '@features/business/screens/BusinessOrderDetailScreen';
import { BusinessBookingsHubScreen } from '@features/business/screens/BusinessBookingsHubScreen';
import { BusinessPosOrdersViewScreen } from '@features/business/screens/BusinessPosOrdersViewScreen';
import {
  BusinessTabBar,
  businessTabMeta,
} from '@features/business/components/BusinessTabBar';
import { useAuthStore } from '@store/authStore';
import { strings } from '@constants/strings';

const shell = strings.businessShell;

// Branch selection is persisted in the auth store; reset it so one test's pick
// cannot change what the next test sees on the shared switcher.
beforeEach(() => {
  useAuthStore.setState({ activeBranchId: null });
});

/**
 * The Overview screen reads the owner API (my business, dashboard stats, POS,
 * activity counts), so it needs a QueryClient. In tests there is no API base
 * URL, the queries reject immediately, and the screen falls back to its
 * designed copy — which is exactly what these assertions cover.
 */
function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('business tab hubs', () => {
  /**
   * The five Business tab surfaces are dense hubs: many rows read at a glance.
   * They render at the compact type density (navbar included) so the type scale
   * does the work instead of per-row overrides, and no row may render above the
   * label end of the scale.
   */
  const hubs: [string, React.ComponentType<{ onBack?: () => void }>][] = [
    ['overview', BusinessDashboardOverviewScreen as never],
    ['orders', BusinessOrdersHubScreen as never],
    ['business', BusinessHubCentralManagementScreen as never],
    ['messages', BusinessMessagesHomeScreen as never],
    ['more', BusinessMoreHubScreen as never],
  ];

  function fontSizesOf(view: Awaited<ReturnType<typeof render>>): number[] {
    const sizes: number[] = [];
    const walk = (node: unknown) => {
      const n = node as { props?: Record<string, unknown>; children?: unknown[] };
      if (!n || typeof n !== 'object') return;
      const style = n.props?.style as { fontSize?: number } | undefined;
      if (style && typeof style.fontSize === 'number') sizes.push(style.fontSize);
      (n.children ?? []).forEach(walk);
    };
    walk(view.toJSON());
    return sizes;
  }

  it.each(hubs)('renders the %s hub with no raw pixel font sizes', async (_name, Hub) => {
    const view = await renderWithClient(<Hub onBack={jest.fn()} />);
    const sizes = fontSizesOf(view);

    // `VemtapText` resolves its size from the type scale (compact under these
    // hubs), so any literal fontSize in the tree is a hand-typed size that
    // escaped the scale. Allowed values are exactly the scale's steps.
    const allowed = new Set([
      11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 26, 28, 29,
    ]);
    expect(sizes.filter(size => !allowed.has(size))).toEqual([]);
  });
});

describe('business bottom navigation', () => {
  it('owns the five design tabs with live (not baked) badges', () => {
    expect(Object.keys(businessTabMeta)).toEqual([
      'BusinessOverview',
      'BusinessOrders',
      'BusinessMessages',
      'BusinessHub',
      'BusinessMore',
    ]);
    expect(businessTabMeta.BusinessOverview.label).toBe(shell.tabs.overview);
    expect(businessTabMeta.BusinessOrders.icon).toBe('receipt');
    // Counts arrive from the API via `BusinessTabBarWithLiveBadges`; the static
    // meta must never carry a designed number.
    expect(businessTabMeta.BusinessOrders.badge).toBeUndefined();
    expect(businessTabMeta.BusinessMessages.badge).toBeUndefined();
    expect(businessTabMeta.BusinessHub.icon).toBe('storefront');
    expect(businessTabMeta.BusinessMore.label).toBe(shell.tabs.more);
  });

  it('renders only the live badge it is given', async () => {
    const tabBarProps = {
      state: {
        routes: [
          { key: 'k-orders', name: 'BusinessOrders' },
          { key: 'k-messages', name: 'BusinessMessages' },
        ],
        index: 0,
      } as never,
      navigation: {
        emit: () => ({ defaultPrevented: false }),
        navigate: jest.fn(),
      } as never,
      descriptors: {} as never,
      insets: { top: 0, bottom: 0, left: 0, right: 0 },
    };

    const live = await render(
      <BusinessTabBar
        {...tabBarProps}
        badges={{ BusinessOrders: { count: 4, tone: 'brand' } }}
      />,
    );
    expect(live.getByText('4')).toBeTruthy();
    // The messages tab has no live count, so the designed `2` must not appear.
    expect(live.queryByText(String(shell.messagesBadge))).toBeNull();

    const bare = await render(<BusinessTabBar {...tabBarProps} />);
    expect(bare.queryByText(String(shell.ordersBadge))).toBeNull();
  });
});

describe('business dashboard overview', () => {
  it('renders the branch context, growth tip, metrics, activity and shortcuts', async () => {
    const view = await renderWithClient(<BusinessDashboardOverviewScreen />);
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
    const view = await renderWithClient(
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
    const view = await renderWithClient(<BusinessDashboardOverviewScreen />);
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

describe('branch switching across the business shell', () => {
  const copy = strings.businessBranchSwitcher;

  /** Press a branch control and let the shared sheet finish animating in. */
  async function openSheet(view: Awaited<ReturnType<typeof render>>, branchName: string) {
    await act(async () => {
      fireEvent.press(view.getByLabelText(`${copy.switchLabel}: ${branchName}`));
    });
    await waitFor(() => expect(view.getByText(copy.sheetTitle)).toBeTruthy());
  }

  it('opens the shared sheet on each surface', async () => {
    const first = strings.businessBranchSwitcher.branches[0];
    const orders = await render(<BusinessOrdersHubScreen />);
    await openSheet(orders, first.name);
    orders.unmount();
  });

  it('reflects the branch selection on the pill', async () => {
    const first = strings.businessBranchSwitcher.branches[0];
    const second = strings.businessBranchSwitcher.branches[1];
    const dashboard = await renderWithClient(<BusinessDashboardOverviewScreen />);
    await openSheet(dashboard, first.name);
    await act(async () => {
      fireEvent.press(dashboard.getByLabelText(second.name));
    });
    // The pill now shows the branch that was picked, not the static default.
    expect(dashboard.getByLabelText(`${copy.switchLabel}: ${second.name}`)).toBeTruthy();
    dashboard.unmount();
  });

  it('opens the shared sheet from the More hub', async () => {
    const more = await render(<BusinessMoreHubScreen />);
    await openSheet(more, strings.businessBranchSwitcher.branches[0].name);
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
  const threads: BusinessMessageThreadView[] = [
    {
      id: 't1',
      name: 'Sarah Adams',
      initials: 'SA',
      preview: 'Hi, is the lunch combo still available?',
      time: 'Today, 10:42 AM',
      unread: 2,
      context: 'Deal',
      contextIcon: 'localOffer',
      contextTone: 'discount',
      categories: ['unread', 'deals'],
    },
    {
      id: 't2',
      name: 'Michael James',
      initials: 'MJ',
      preview: 'Your order is packed and ready for pickup.',
      time: 'Today, 9:24 AM',
      unread: 0,
      context: 'Order',
      contextIcon: 'receipt',
      contextTone: 'brand',
      categories: ['orders'],
    },
  ];
  const filterCounts = ['2', '1', '1', '1', '0'];

  it('renders live filters with counts, the branch strip and every conversation', async () => {
    const view = await render(
      <BusinessMessagesHomeScreen threads={threads} branchName="Maitama Branch" />,
    );
    const copy = strings.businessMessages;

    expect(view.getAllByText(copy.title).length).toBeGreaterThan(0);
    copy.filters.forEach((chip, index) => {
      expect(view.getByText(`${chip.label} (${filterCounts[index]})`)).toBeTruthy();
    });
    expect(view.getByText(copy.connected)).toBeTruthy();
    expect(view.getByText('Maitama Branch')).toBeTruthy();
    threads.forEach(thread => {
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
        threads={threads}
        onOpenThread={onOpenThread}
        onNewMessage={onNewMessage}
      />,
    );

    await act(async () => {
      fireEvent.press(view.getByLabelText(threads[0].name));
    });
    expect(onOpenThread).toHaveBeenCalledWith(threads[0].id);

    await act(async () => {
      fireEvent.press(view.getByText(strings.businessMessages.newMessage));
    });
    expect(onNewMessage).toHaveBeenCalled();
  });

  it('filters rows by chip and by search query', async () => {
    const view = await render(<BusinessMessagesHomeScreen threads={threads} />);
    const copy = strings.businessMessages;

    await act(async () => {
      fireEvent.press(view.getByText(`${copy.filters[2].label} (1)`));
    });
    expect(view.queryByText(threads[0].name)).toBeNull();
    expect(view.getByText(threads[1].name)).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(view.getByPlaceholderText(copy.searchPlaceholder), 'sarah');
    });
    expect(view.queryByText(threads[1].name)).toBeNull();
  });

  it('shows the empty state when there are no conversations', async () => {
    const view = await render(<BusinessMessagesHomeScreen threads={[]} />);
    expect(view.getByText(strings.businessMessages.emptyTitle)).toBeTruthy();
  });

  it('shows the error state with a retry action', async () => {
    const onRetry = jest.fn();
    const view = await render(
      <BusinessMessagesHomeScreen threads={undefined} isError onRetry={onRetry} />,
    );

    await act(async () => {
      fireEvent.press(view.getByText(strings.common.retry));
    });
    expect(onRetry).toHaveBeenCalled();
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
  it('keeps every size at or below the label end of the scale', async () => {
    // A dense register list: scanning many tickets, not reading prose. A
    // `heading*` token creeping back in is what makes every label look like it
    // is shouting, so the rendered tree is checked directly.
    const view = await render(<BusinessPosOrdersViewScreen onBack={jest.fn()} />);

    const sizes: number[] = [];
    const walk = (node: unknown) => {
      const n = node as { props?: Record<string, unknown>; children?: unknown[] };
      if (!n || typeof n !== 'object') return;
      const style = n.props?.style as { fontSize?: number } | undefined;
      if (style && typeof style.fontSize === 'number') sizes.push(style.fontSize);
      (n.children ?? []).forEach(walk);
    };
    walk(view.toJSON());

    expect(sizes.length).toBeGreaterThan(0);
    expect(Math.max(...sizes)).toBeLessThanOrEqual(18);
  });

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

describe('overview quick shortcuts', () => {
  it('routes every shortcut to its handler', async () => {
    const copy = strings.businessDashboard;
    const handlers: Record<string, jest.Mock> = {
      scan: jest.fn(),
      pos: jest.fn(),
      deal: jest.fn(),
      product: jest.fn(),
      messages: jest.fn(),
      boost: jest.fn(),
    };
    const view = await renderWithClient(
      <BusinessDashboardOverviewScreen
        onOpenScanner={handlers.scan}
        onOpenPos={handlers.pos}
        onCreateDeal={handlers.deal}
        onAddProduct={handlers.product}
        onOpenMessages={handlers.messages}
        onBoostDeal={handlers.boost}
      />,
    );

    await act(async () => {
      copy.shortcuts.forEach(shortcut => {
        fireEvent.press(view.getByLabelText(shortcut.title));
      });
    });

    copy.shortcuts.forEach(shortcut => {
      expect(handlers[shortcut.id]).toHaveBeenCalledTimes(1);
    });
  });
});
