import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BusinessDashboardOverviewScreen } from '@features/business/screens/BusinessDashboardOverviewScreen';
import { businessDashboardApi } from '@api/businessDashboardApi';
import {
  activityPercents,
  countPendingClaims,
  countUnreadMessages,
  formatCompactNaira,
  pickStat,
  toBranchList,
} from '@features/business/hooks/useBusinessDashboardData';
import { strings } from '@constants/strings';

const mockGetMyBusiness = jest.fn();
const mockGetBusinessDashboard = jest.fn();
const mockGetPosDashboard = jest.fn();
const mockGetUnreadCount = jest.fn();
const mockGetNewOrdersCount = jest.fn();
const mockGetClaims = jest.fn();

jest.mock('@api/businessDashboardApi', () => ({
  ...jest.requireActual('@api/businessDashboardApi'),
  businessDashboardApi: {
    getMyBusiness: (...args: unknown[]) => mockGetMyBusiness(...args),
    getBusinessDashboard: (...args: unknown[]) => mockGetBusinessDashboard(...args),
    getPosDashboard: (...args: unknown[]) => mockGetPosDashboard(...args),
    getUnreadCount: (...args: unknown[]) => mockGetUnreadCount(...args),
    getNewOrdersCount: (...args: unknown[]) => mockGetNewOrdersCount(...args),
    getClaims: (...args: unknown[]) => mockGetClaims(...args),
  },
}));

const copy = strings.businessDashboard;
const switcherCopy = strings.businessBranchSwitcher;

const branchA = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Wuse Flagship',
  address: 'Aminu Kano Cres',
  city: 'Wuse II',
  isActive: true,
  isMainBranch: true,
};
const branchB = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Maitama Annex',
  address: 'Gana Street',
  city: 'Maitama',
  isActive: true,
  isMainBranch: false,
};

/** Everything the Overview reads, wired to succeed. */
function mockLiveBackend(
  overrides: {
    stats?: Record<string, unknown>;
    messages?: Record<string, unknown>[];
  } = {},
) {
  mockGetMyBusiness.mockResolvedValue({
    id: 'biz-1',
    name: 'Aurora Grill',
    isVerified: true,
    city: 'Wuse II',
    state: 'FCT',
    address: '12 Adetokunbo Cres',
    branches: [branchA, branchB],
  });
  mockGetBusinessDashboard.mockResolvedValue({
    businessName: 'Aurora Grill',
    stats: overrides.stats ?? {
      views: 9021,
      customers: 137,
      dealsClaimed: 63,
      revenue: 72400,
    },
    messages: overrides.messages ?? [
      { id: 'm1', read: false },
      { id: 'm2', read: true },
      { id: 'm3', read: true },
    ],
    notifications: [],
    activityData: [
      { day: 'Mon', value: 10 },
      { day: 'Tue', value: 20 },
      { day: 'Wed', value: 40 },
    ],
    recentVisitors: [],
    rewards: [],
    staffMembers: [],
    devices: [],
  });
  mockGetPosDashboard.mockResolvedValue({
    revenue: 312400,
    transactionCount: 27,
    averageSaleValue: 11570,
  });
  mockGetUnreadCount.mockResolvedValue(5);
  mockGetNewOrdersCount.mockResolvedValue(4);
  mockGetClaims.mockResolvedValue([
    { id: 'c1', status: 'pending' },
    { id: 'c2', status: 'pending' },
    { id: 'c3', status: 'redeemed' },
  ]);
}

function renderDashboard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <BusinessDashboardOverviewScreen />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('business dashboard — live data', () => {
  it('shows the business, metrics, POS takings and counts from the API', async () => {
    mockLiveBackend();
    const view = await renderDashboard();

    await waitFor(() => expect(view.getByText('Aurora Grill')).toBeTruthy());
    // Wait for the branch-scoped queries (dashboard + POS) to land too.
    await waitFor(() => expect(view.getByText('₦312,400')).toBeTruthy());
    await waitFor(() => expect(view.getByText('4 New Orders')).toBeTruthy());
    expect(view.getByText('9,021')).toBeTruthy();
    expect(view.getByText('137')).toBeTruthy();
    expect(view.getByText('63')).toBeTruthy();
    expect(view.getByText('₦72.4k vol')).toBeTruthy();
    expect(view.getByText('27 txns')).toBeTruthy();
    // Unread notifications drive the header badge (hidden when zero).
    expect(view.getByText('5')).toBeTruthy();
    expect(view.getByText('1 Unread Message')).toBeTruthy();
    expect(view.getByText('2 Deal Claims Pending')).toBeTruthy();
    expect(view.getByText('7 require action')).toBeTruthy();
    expect(view.queryByText('3 New Orders')).toBeNull();
    expect(view.queryByText('2 Unread Messages')).toBeNull();
    // The designed placeholders are gone once the API answered.
    expect(view.queryByText(copy.metrics.viewsValue)).toBeNull();
    expect(view.queryByText(copy.posAmount)).toBeNull();
  });

  it('renders "—" for stats the response does not carry', async () => {
    mockLiveBackend({ stats: {} });
    const view = await renderDashboard();

    await waitFor(() => expect(view.getByText('Aurora Grill')).toBeTruthy());
    await waitFor(() => expect(view.getAllByText('—').length).toBe(4));
    expect(view.queryByText(copy.metrics.viewsValue)).toBeNull();
    // No growth deltas are published, so no fabricated percentages either.
    expect(view.queryByText(copy.metrics.viewsDelta)).toBeNull();
  });

  it('switches branch through the API branch list and refetches', async () => {
    mockLiveBackend();
    const view = await renderDashboard();

    await waitFor(() =>
      expect(
        view.getByLabelText(`${switcherCopy.switchLabel}: Wuse Flagship`),
      ).toBeTruthy(),
    );
    expect(mockGetBusinessDashboard).toHaveBeenCalledWith(branchA.id);

    await act(async () => {
      fireEvent.press(
        view.getAllByLabelText(`${switcherCopy.switchLabel}: Wuse Flagship`)[0],
      );
    });
    await act(async () => {
      fireEvent.press(view.getByLabelText('Maitama Annex'));
    });

    expect(
      view.getByLabelText(`${switcherCopy.switchLabel}: Maitama Annex`),
    ).toBeTruthy();
    await waitFor(() =>
      expect(mockGetBusinessDashboard).toHaveBeenCalledWith(branchB.id),
    );
  });

  it('hides rows whose live count is zero', async () => {
    mockLiveBackend();
    mockGetNewOrdersCount.mockResolvedValue(0);
    const view = await renderDashboard();

    await waitFor(() => expect(view.getByText('Aurora Grill')).toBeTruthy());
    await waitFor(() => expect(view.getByText('1 Unread Message')).toBeTruthy());
    // The orders row is gone entirely — neither the live nor the static title.
    expect(view.queryByText('4 New Orders')).toBeNull();
    expect(view.queryByText('3 New Orders')).toBeNull();
    // Remaining rows still render, so the section never collapses to nothing.
    expect(view.getByText('2 Deal Claims Pending')).toBeTruthy();
  });
});

describe('business dashboard — API unavailable', () => {
  it('falls back to the designed copy when every call fails', async () => {
    mockGetMyBusiness.mockRejectedValue(new Error('offline'));
    mockGetBusinessDashboard.mockRejectedValue(new Error('offline'));
    mockGetPosDashboard.mockRejectedValue(new Error('offline'));
    mockGetUnreadCount.mockRejectedValue(new Error('offline'));
    mockGetNewOrdersCount.mockRejectedValue(new Error('offline'));
    mockGetClaims.mockRejectedValue(new Error('offline'));

    const view = await renderDashboard();

    await waitFor(() => expect(view.getByText(copy.pageTitle)).toBeTruthy());
    expect(view.getByText(copy.metrics.viewsValue)).toBeTruthy();
    expect(view.getByText(copy.posAmount)).toBeTruthy();
    copy.activity.forEach(row => {
      expect(view.getByText(row.title)).toBeTruthy();
    });
    // Nothing was verified, so the verified marks stay hidden.
    expect(view.queryByText(copy.verifiedBusiness)).toBeNull();
    expect(view.queryByText('5')).toBeNull();
  });
});

describe('business dashboard mappers', () => {
  it('reads stats through candidate keys and skips unreadable values', () => {
    expect(pickStat({ views: 12 }, ['views'])).toBe(12);
    expect(pickStat({ views: '1,248' }, ['views'])).toBe(1248);
    expect(pickStat({ profileViews: 9 }, ['views', 'profileViews'])).toBe(9);
    expect(pickStat({ views: 'n/a' }, ['views'])).toBeUndefined();
    expect(pickStat(undefined, ['views'])).toBeUndefined();
  });

  it('counts unread messages with or without read state', () => {
    expect(countUnreadMessages([{ read: false }, { read: true }, { read: false }])).toBe(
      2,
    );
    expect(countUnreadMessages([{ id: 'a' }, { id: 'b' }])).toBe(2);
    expect(countUnreadMessages([{ unread: true }, { unread: false }])).toBe(1);
  });

  it('counts pending claims by status when the field exists', () => {
    expect(
      countPendingClaims([
        { status: 'pending' },
        { status: 'PENDING_VERIFICATION' },
        { status: 'redeemed' },
      ]),
    ).toBe(2);
    expect(countPendingClaims([{ id: 'a' }, { id: 'b' }])).toBe(2);
  });

  it('normalises activity bars and refuses unreadable series', () => {
    expect(activityPercents([{ value: 10 }, { value: 20 }, { value: 40 }])).toEqual([
      25, 50, 100,
    ]);
    expect(activityPercents([{ value: 1 }, { value: 2 }])).toBeNull();
    expect(activityPercents(undefined)).toBeNull();
  });

  it('maps branches for the switcher, skipping inactive ones', () => {
    const list = toBranchList({
      id: 'biz-1',
      name: 'Aurora Grill',
      isVerified: true,
      city: '',
      state: '',
      address: '',
      branches: [{ ...branchA }, { ...branchB, isActive: false }],
    });
    expect(list).toEqual([
      {
        id: branchA.id,
        name: branchA.name,
        address: branchA.address,
        active: true,
      },
    ]);
    expect(toBranchList(undefined)).toEqual([]);
  });

  it('formats naira compactly for the volume tile', () => {
    expect(formatCompactNaira(48200)).toBe('₦48.2k');
    expect(formatCompactNaira(1_200_000)).toBe('₦1.2m');
    expect(formatCompactNaira(500)).toBe('₦500');
  });
});

it('exposes the six dashboard endpoints through the API object', () => {
  expect(Object.keys(businessDashboardApi).sort()).toEqual([
    'getBusinessDashboard',
    'getClaims',
    'getMyBusiness',
    'getNewOrdersCount',
    'getPosDashboard',
    'getUnreadCount',
  ]);
});
