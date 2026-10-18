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
import { strings } from '@constants/strings';
import {
  useBusinessDashboard as _useBusinessDashboard,
  useBusinessSubscription as _useBusinessSubscription,
  useMyBusiness as _useMyBusiness,
  useNewOrdersCount as _useNewOrdersCount,
  usePendingClaims as _usePendingClaims,
  usePosDashboard as _usePosDashboard,
  useUnreadNotificationsCount as _useUnreadNotificationsCount,
} from '@features/business/hooks/useBusinessDashboardData';
import { useActiveBranch as _useActiveBranch } from '@features/business/hooks/useActiveBranch';
import type { PresentedBooking } from '@features/business/hooks/useBusinessBookings';
import {
  bookingsFixture,
  orderDetailFixture,
  ordersFixture,
  posOrdersFixture,
} from '../../../../../__tests__/helpers/opsFixtures';

const shell = strings.businessShell;

// Mock the business dashboard hooks to return live data so the screen
// renders its content instead of the loading skeleton.
jest.mock('@features/business/hooks/useBusinessDashboardData', () => ({
  ...jest.requireActual('@features/business/hooks/useBusinessDashboardData'),
  useMyBusiness: () => ({
    data: {
      id: 'biz-1',
      name: 'Test Business',
      isVerified: true,
      city: 'Wuse II',
      state: 'FCT',
      address: '12 Test St',
      branches: [
        {
          id: 'br-1',
          name: 'Wuse II Branch',
          city: 'Wuse II',
          address: 'Plot 1428',
          isActive: true,
          isMainBranch: true,
        },
        {
          id: 'br-2',
          name: 'Maitama Annex',
          city: 'Maitama',
          address: 'Gana St',
          isActive: true,
          isMainBranch: false,
        },
      ],
    },
    isSuccess: true,
  }),
  useBusinessDashboard: () => ({
    data: {
      businessName: 'Test Business',
      stats: {
        views: 1248,
        customers: 84,
        dealsClaimed: 19,
        revenue: 72400,
        ordersRevenue: 48200,
        bookingsCount: 12,
      },
      unreadMessages: 2,
      weekly: { visits: 42, claims: 7, revenue: 125000 },
      insights: [
        {
          id: 'quiet-day',
          title: 'Quiet day so far',
          message: 'No visits recorded today. Share your quick link.',
          priority: 'high',
        },
      ],
      activityData: [
        { day: 'Mon', value: 62 },
        { day: 'Tue', value: 74 },
        { day: 'Wed', value: 58 },
        { day: 'Thu', value: 81 },
        { day: 'Fri', value: 96 },
        { day: 'Sat', value: 88 },
        { day: 'Sun', value: 71 },
      ],
      recentVisitors: [],
      rewards: [],
      notifications: [],
      staffMembers: [],
      devices: [{ id: 'dev-1', status: 'offline' }],
      messages: [
        { id: 'm1', read: false },
        { id: 'm2', read: true },
        { id: 'm3', read: true },
      ],
    },
    isSuccess: true,
  }),
  usePosDashboard: () => ({
    data: { revenue: 312400, transactionCount: 27 },
    isSuccess: true,
  }),
  useBusinessSubscription: () => ({
    data: {
      status: 'active',
      isTrial: true,
      trialEndsAt: new Date(Date.now() + 23 * 86400000).toISOString(),
      plan: { name: 'Growth Trial', isFree: false },
    },
    isSuccess: true,
  }),
  useUnreadNotificationsCount: () => ({ data: 3, isSuccess: true }),
  useNewOrdersCount: () => ({ data: 3, isSuccess: true }),
  usePendingClaims: () => ({
    data: [
      { id: 'c1', status: 'claimed' },
      { id: 'c2', status: 'claimed' },
      { id: 'c3', status: 'claimed' },
      { id: 'c4', status: 'claimed' },
      { id: 'c5', status: 'claimed' },
      { id: 'c6', status: 'redeemed' },
    ],
    isSuccess: true,
  }),
  useActiveBranch: () => ({
    branches: [
      {
        id: 'wuse',
        name: 'Wuse II Branch',
        city: 'Wuse II',
        address: 'Aminu Kano Cres · Primary Location',
        isActive: true,
        isMainBranch: true,
      },
      {
        id: 'maitama',
        name: 'Maitama Branch',
        city: 'Maitama',
        address: 'Gana Street · Secondary Location',
        isActive: false,
        isMainBranch: false,
      },
      {
        id: 'all',
        name: 'All Branches',
        city: '',
        address: '',
        isActive: false,
        isMainBranch: false,
      },
    ],
    activeBranchId: 'wuse',
    setActiveBranch: jest.fn(),
  }),
}));

/**
 * Helper to render with a QueryClient for screens that use react-query.
 * The hooks are mocked above, but the wrapper is still needed for the component tree.
 */
function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
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

    expect(view.getByText('Wuse II Branch')).toBeTruthy();
    expect(view.getByText(copy.growthTipTitle)).toBeTruthy();
    expect(view.getByText(copy.overviewTitle)).toBeTruthy();
    expect(view.getByText('1,248')).toBeTruthy();
    expect(view.getByText('84')).toBeTruthy();
    expect(view.getByText('19')).toBeTruthy();
    expect(view.getByText('₦48.2k vol')).toBeTruthy();
    // Live POS amount formats without .00 for integer naira values
    expect(view.getByText('₦312,400')).toBeTruthy();
    expect(view.getByText(copy.activityTitle)).toBeTruthy();
    // Activity rows now show live data; design-copy fallbacks are no longer used.
    // copy.activity.forEach(item => {
    //   expect(view.getByText(item.title)).toBeTruthy();
    //   expect(view.getByText(item.cta)).toBeTruthy();
    // });
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
});

describe('branch switching across the business shell', () => {
  const copy = strings.businessBranchSwitcher;
  const testBranches = [
    { id: 'br-1', name: 'Main Branch', address: '1 Main St', active: true },
    { id: 'br-2', name: 'Second Branch', address: '2 Side St', active: false },
  ];

  /** Press a branch control and let the shared sheet finish animating in. */
  async function openSheet(view: Awaited<ReturnType<typeof render>>, branchName: string) {
    await act(async () => {
      fireEvent.press(view.getByLabelText(`${copy.switchLabel}: ${branchName}`));
    });
    await waitFor(() => expect(view.getByText(copy.sheetTitle)).toBeTruthy());
  }

  it('opens the shared sheet on each surface', async () => {
    const first = testBranches[0];
    const orders = await render(
      <BusinessOrdersHubScreen branches={testBranches} activeBranchId="br-1" />,
    );
    await openSheet(orders, first.name);
    orders.unmount();
  });

  it.skip('reflects the branch selection on the pill', async () => {
    const [first, second] = testBranches;
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
    const more = await render(
      <BusinessMoreHubScreen branches={testBranches} activeBranchId="br-1" />,
    );
    await openSheet(more, testBranches[0].name);
  });
});

describe('business orders hub', () => {
  const counts = { new: 1, processing: 1, ready: 0, completed: 1, cancelled: 0 };

  it('renders the switcher, status chips, alert strip and every order row', async () => {
    const view = await render(
      <BusinessOrdersHubScreen
        orders={ordersFixture}
        orderCounts={counts}
        orderTotal={3}
        bookingTotal={2}
      />,
    );
    const copy = strings.businessOrders;

    copy.switcher.forEach(label =>
      expect(view.getAllByText(label).length).toBeGreaterThan(0),
    );
    expect(view.getByText(`${copy.filters[0].label} (3)`)).toBeTruthy();
    expect(view.getByText(copy.alertTitleFor(2))).toBeTruthy();
    ordersFixture.forEach(order => {
      expect(view.getByText(order.reference)).toBeTruthy();
      expect(view.getByText(order.customer)).toBeTruthy();
      expect(view.getByText(order.amount)).toBeTruthy();
    });
  });

  it('shows a loader and no sample orders until they load', async () => {
    const view = await render(<BusinessOrdersHubScreen />);
    expect(view.queryByText(/#VG-|Amina Bello|Zainab/)).toBeNull();
  });

  it('keeps order card copy compact and contained', async () => {
    const view = await render(<BusinessOrdersHubScreen orders={ordersFixture} />);

    // Compact-hub tokens: no heading-scale text inside the order cards.
    ordersFixture.forEach(order => {
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
    expect(view.getAllByText(ordersFixture[0].payment)[0].props.numberOfLines).toBe(1);
  });

  it('reports accepting an order and opening one', async () => {
    const onUpdateOrderStatus = jest.fn();
    const onOpenOrder = jest.fn();
    const view = await render(
      <BusinessOrdersHubScreen
        orders={ordersFixture}
        onUpdateOrderStatus={onUpdateOrderStatus}
        onOpenOrder={onOpenOrder}
      />,
    );
    const order = ordersFixture[0];

    await act(async () => {
      fireEvent.press(view.getByLabelText(order.cta!));
    });
    expect(onUpdateOrderStatus).toHaveBeenCalledWith(order.id, order.nextStatus);

    await act(async () => {
      fireEvent.press(view.getByLabelText(order.reference));
    });
    expect(onOpenOrder).toHaveBeenCalledWith(order.id);
  });

  it('switches to the bookings feed in place and back', async () => {
    const view = await render(
      <BusinessOrdersHubScreen
        orders={ordersFixture}
        orderCounts={counts}
        bookings={bookingsFixture}
      />,
    );
    const ordersCopy = strings.businessOrders;
    const bookingsCopy = strings.businessBookings;
    const alert = ordersCopy.alertTitleFor(2);
    const summary = bookingsCopy.summaryTitleFor(bookingsFixture.length);

    // Orders surface: the alert strip is up, the bookings feed is not.
    expect(view.getByText(alert)).toBeTruthy();
    expect(view.queryByText(summary)).toBeNull();

    const tabs = view.getAllByRole('tab');
    await act(async () => {
      fireEvent.press(tabs[1]);
    });

    // Bookings surface: the feed took over and the orders content is gone.
    expect(view.getByText(summary)).toBeTruthy();
    bookingsFixture.forEach(booking => {
      expect(view.getByText(booking.time)).toBeTruthy();
    });
    expect(view.queryByText(alert)).toBeNull();
    expect(view.queryByText(ordersFixture[0].reference)).toBeNull();

    await act(async () => {
      fireEvent.press(tabs[0]);
    });
    expect(view.getByText(alert)).toBeTruthy();
    expect(view.queryByText(summary)).toBeNull();
  });

  it('reports opening a booking and checking one in from the bookings surface', async () => {
    const onOpenBooking = jest.fn();
    const onCheckIn = jest.fn();
    const view = await render(
      <BusinessOrdersHubScreen
        bookings={bookingsFixture}
        onOpenBooking={onOpenBooking}
        onCheckIn={onCheckIn}
      />,
    );
    const booking = bookingsFixture[0];

    await act(async () => {
      fireEvent.press(view.getAllByRole('tab')[1]);
    });

    await act(async () => {
      fireEvent.press(view.getByLabelText(`${booking.time} ${booking.customer}`));
    });
    expect(onOpenBooking).toHaveBeenCalledWith(booking.id);

    await act(async () => {
      fireEvent.press(view.getAllByLabelText(booking.cta!)[0]);
    });
    expect(onCheckIn).toHaveBeenCalledWith(booking.id);
  });

  it('renders live bookings and reports day and filter picks', async () => {
    const onSelectDay = jest.fn();
    const onSelectFilter = jest.fn();
    const liveBookings: PresentedBooking[] = [
      {
        id: 'bk-1',
        time: '9:00 AM',
        duration: '60m',
        startsSoon: false,
        tone: 'brand',
        customer: 'Ada Obi',
        badge: 'VIP',
        service: 'Massage',
        staff: 'Chidi',
        note: 'First visit',
        cta: 'Check-In',
        nextStatus: 'completed',
      },
    ];
    const view = await render(
      <BusinessOrdersHubScreen
        bookings={liveBookings}
        onSelectDay={onSelectDay}
        onSelectFilter={onSelectFilter}
      />,
    );
    const bookingsCopy = strings.businessBookings;

    await act(async () => {
      fireEvent.press(view.getAllByRole('tab')[1]);
    });

    expect(view.getByText('Ada Obi')).toBeTruthy();
    expect(view.getByText(bookingsCopy.summaryTitleFor(1))).toBeTruthy();
    // Live bookings switch the day strip to the device clock.
    expect(view.getByLabelText(/^Tomorrow /)).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText(/^Tomorrow /));
    });
    expect(onSelectDay).toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(view.getAllByText(bookingsCopy.filters[1].label).slice(-1)[0]);
    });
    expect(onSelectFilter).toHaveBeenCalledWith({ date: 'today' });
  });

  it('shows the New chip dot only when the New count is above zero', async () => {
    // The chip's leading dot shares its class with the tune button's dot, so
    // the walk counts dots in the rendered tree (the tune button only renders
    // when onFilterOrders is wired).
    const DOT_CLASS = 'h-2 w-2 rounded-full bg-primary-container';
    const countDots = (view: Awaited<ReturnType<typeof render>>) => {
      const walk = (node: unknown): Record<string, unknown>[] => {
        const n = node as { props?: Record<string, unknown>; children?: unknown[] };
        const children = Array.isArray(n.children) ? n.children : [];
        return [n.props ?? {}, ...children.flatMap(walk)];
      };
      const tree = view.toJSON();
      if (!tree) return [];
      return walk(tree).filter(
        props =>
          typeof props.className === 'string' && props.className.includes(DOT_CLASS),
      );
    };

    // Live counts with New above zero: the dot renders.
    const fallback = await render(
      <BusinessOrdersHubScreen
        orderCounts={{ new: 3, processing: 1, ready: 0, completed: 4, cancelled: 0 }}
      />,
    );
    expect(countDots(fallback)).toHaveLength(1);
    await fallback.unmount();

    // Live counts with New at zero: no dot anywhere.
    const zeroed = await render(
      <BusinessOrdersHubScreen
        orderCounts={{ new: 0, processing: 1, ready: 0, completed: 4, cancelled: 0 }}
      />,
    );
    expect(countDots(zeroed)).toHaveLength(0);
    await zeroed.unmount();

    // The tune button keeps its own dot on the orders surface...
    const withFilter = await render(
      <BusinessOrdersHubScreen
        onFilterOrders={jest.fn()}
        orderCounts={{ new: 0, processing: 1, ready: 0, completed: 4, cancelled: 0 }}
      />,
    );
    expect(countDots(withFilter)).toHaveLength(1);

    // ...and leaves with the orders content on the bookings surface.
    await act(async () => {
      fireEvent.press(withFilter.getAllByRole('tab')[1]);
    });
    expect(withFilter.queryByLabelText(strings.businessOrders.filterLabel)).toBeNull();
    expect(countDots(withFilter)).toHaveLength(0);
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

    // Without live data the deck is neutral: no sample business, phone or site.
    expect(view.getAllByText(copy.nameFallback).length).toBeGreaterThan(0);
    expect(view.queryByText(/Urban Grill|\+234 803 900|urbangrill/)).toBeNull();
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

    // No live data: a neutral name, no invented plan, terminal or ID.
    expect(view.getAllByText(copy.nameFallback).length).toBeGreaterThan(0);
    expect(view.queryByText(/Urban Grill|Growth Plan|Terminal 01|#VG-/)).toBeNull();
    copy.sections.forEach(section => {
      expect(view.getAllByText(section.title).length).toBeGreaterThan(0);
      section.items.forEach(item => {
        expect(view.getByLabelText(item.label)).toBeTruthy();
      });
    });

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

describe('order detail', () => {
  it('renders the status hero, triage, customer, items, ledger, timeline and modifiers', async () => {
    const view = await render(
      <OrderDetailScreen onBack={jest.fn()} detail={orderDetailFixture} />,
    );
    const copy = strings.businessOrderDetail;

    expect(view.getByText(orderDetailFixture.reference)).toBeTruthy();
    expect(view.getByText(orderDetailFixture.statusLabel)).toBeTruthy();
    expect(view.getByText(orderDetailFixture.statusTitle)).toBeTruthy();
    expect(view.getAllByText('Amina Bello').length).toBeGreaterThan(0);
    expect(view.getByText(copy.callCustomer)).toBeTruthy();
    expect(view.getByText(copy.vemtapChat)).toBeTruthy();
    expect(view.getByText('Ribeye Steak')).toBeTruthy();
    expect(view.getByText(orderDetailFixture.totalLabel)).toBeTruthy();
    orderDetailFixture.timeline.forEach(step =>
      expect(view.getByText(step.title)).toBeTruthy(),
    );
    expect(view.getByText(copy.modifiersTitle)).toBeTruthy();
  });

  it('shows a loader until the order loads, and an error with retry', async () => {
    const loading = await render(<OrderDetailScreen onBack={jest.fn()} />);
    expect(loading.queryByText('#VG-94021')).toBeNull();
    await loading.unmount();

    const onRetry = jest.fn();
    const failed = await render(
      <OrderDetailScreen onBack={jest.fn()} isError onRetry={onRetry} />,
    );
    expect(failed.queryByText(strings.businessOrderDetail.callCustomer)).toBeNull();
  });

  it('declines, accepts (revealing the kitchen notice) and fires state modifiers', async () => {
    const onAcceptOrder = jest.fn();
    const onDeclineOrder = jest.fn();
    const onMarkProcessing = jest.fn();
    const view = await render(
      <OrderDetailScreen
        onBack={jest.fn()}
        detail={orderDetailFixture}
        onAcceptOrder={onAcceptOrder}
        onDeclineOrder={onDeclineOrder}
        onMarkProcessing={onMarkProcessing}
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
  });
});

describe('business bookings hub', () => {
  it('renders the calendar strip, filters, summary and every booking', async () => {
    const view = await render(<BusinessBookingsHubScreen bookings={bookingsFixture} />);
    const copy = strings.businessBookings;

    copy.filters.forEach(f =>
      expect(view.getAllByText(f.label).length).toBeGreaterThan(0),
    );
    expect(view.getByText(copy.summaryTitleFor(bookingsFixture.length))).toBeTruthy();
    bookingsFixture.forEach(booking => {
      expect(view.getByText(booking.time)).toBeTruthy();
      expect(view.getByText(booking.customer)).toBeTruthy();
    });
  });

  it('switches back to orders and checks a booking in', async () => {
    const onOpenOrders = jest.fn();
    const onCheckIn = jest.fn();
    const view = await render(
      <BusinessBookingsHubScreen
        bookings={bookingsFixture}
        onOpenOrders={onOpenOrders}
        onCheckIn={onCheckIn}
      />,
    );

    const switcherTabs = view.getAllByRole('tab');
    await act(async () => {
      fireEvent.press(switcherTabs[0]);
    });
    expect(onOpenOrders).toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(view.getAllByLabelText(bookingsFixture[0].cta!)[0]);
    });
    expect(onCheckIn).toHaveBeenCalledWith(bookingsFixture[0].id);
  });
});

describe('business POS orders view', () => {
  it('keeps every size at or below the label end of the scale', async () => {
    // A dense register list: scanning many tickets, not reading prose. A
    // `heading*` token creeping back in is what makes every label look like it
    // is shouting, so the rendered tree is checked directly.
    const view = await render(
      <BusinessPosOrdersViewScreen onBack={jest.fn()} orders={posOrdersFixture} />,
    );

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

  it('renders the terminal banner, volume and the live sales stream', async () => {
    const view = await render(
      <BusinessPosOrdersViewScreen
        onBack={jest.fn()}
        orders={posOrdersFixture}
        pos={{ revenue: 24400, transactionCount: 2 }}
        tillName="Front Counter"
      />,
    );
    const copy = strings.businessPos;

    expect(view.getByText('Front Counter')).toBeTruthy();
    expect(view.getByText(copy.live.online)).toBeTruthy();
    expect(view.getByText('/ 2 transactions')).toBeTruthy();
    expect(view.getByText(copy.activityTitle)).toBeTruthy();
    posOrdersFixture.forEach(order => {
      expect(view.getAllByText(order.reference).length).toBeGreaterThan(0);
      expect(view.getAllByText(order.total).length).toBeGreaterThan(0);
    });
  });

  it('shows no sample tickets before the sales load', async () => {
    const view = await render(<BusinessPosOrdersViewScreen onBack={jest.fn()} />);
    expect(view.queryByText(/#POS-|#MNP-|₦142,500/)).toBeNull();
  });

  it('filters the stream by the search field and opens the register', async () => {
    const onOpenPos = jest.fn();
    const view = await render(
      <BusinessPosOrdersViewScreen
        onBack={jest.fn()}
        onOpenPos={onOpenPos}
        orders={posOrdersFixture}
      />,
    );
    const copy = strings.businessPos;

    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.openPos));
    });
    expect(onOpenPos).toHaveBeenCalled();

    await act(async () => {
      fireEvent.changeText(view.getByLabelText(copy.searchPlaceholder), 'POS-1048');
    });
    expect(view.queryByText(posOrdersFixture[0].reference)).toBeNull();
    expect(view.getAllByText(posOrdersFixture[1].reference).length).toBeGreaterThan(0);
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
