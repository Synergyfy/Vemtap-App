import React from 'react';
import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BusinessDashboardOverviewScreen } from '@features/business/screens/BusinessDashboardOverviewScreen';
import { strings } from '@constants/strings';

const copy = strings.businessDashboard;

const mockBranch = {
  id: 'br-1',
  name: 'Main Branch',
  city: 'Wuse II',
  address: 'Plot 1428, Adetokunbo Ademola Crescent, Wuse 2, Abuja',
  isActive: true,
  isMainBranch: true,
};

const mockBusiness = {
  id: 'biz-1',
  name: 'The Azure Bistro',
  isVerified: true,
  logoUrl: 'https://cdn.vemtap.com/logo.png',
  city: 'Wuse II',
  state: 'FCT',
  address: '12 Ademola Way',
  branches: [mockBranch],
};

const mockDashboard = {
  businessName: 'The Azure Bistro',
  businessLogo: 'https://cdn.vemtap.com/logo.png',
  generatedAt: new Date().toISOString(),
  stats: {
    totalViews: 1248,
    newVisitors: 84,
    totalClaims: 19,
    visitorsDelta: 14,
    claimsDelta: 22,
    revenueDelta: null,
  },
  weekly: { visits: 9000, claims: 142, revenue: 486000 },
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
  messages: [],
  devices: [{ id: 'dev-1', status: 'offline' }],
};

jest.mock('@features/business/hooks/useBusinessDashboardData', () => {
  const actual = jest.requireActual('@features/business/hooks/useBusinessDashboardData');
  return {
    ...actual,
    useMyBusiness: () => ({ data: mockBusiness, isSuccess: true }),
    useBusinessDashboard: () => ({ data: mockDashboard, isSuccess: true }),
    usePosDashboard: () => ({
      data: { revenue: 312400, transactionCount: 12 },
      isSuccess: true,
    }),
    useBusinessSubscription: () => ({
      data: {
        status: 'active',
        isTrial: false,
        plan: { name: 'Starter (Free)', isFree: true },
      },
      isSuccess: true,
    }),
    useUnreadNotificationsCount: () => ({ data: 3 }),
    useNewOrdersCount: () => ({ data: 2 }),
    usePendingClaims: () => ({ data: [] }),
  };
});

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

test('the overview renders live dashboard values over the design copy', async () => {
  const view = await renderWithClient(<BusinessDashboardOverviewScreen />);

  // Navbar: real name, address and logo.
  expect(view.getByText('The Azure Bistro')).toBeTruthy();
  expect(view.getByText('Wuse II')).toBeTruthy();
  expect(view.getByLabelText('The Azure Bistro logo')).toBeTruthy();

  // Metric tiles and their live deltas.
  expect(view.getByText('1,248')).toBeTruthy();
  expect(view.getByText('84')).toBeTruthy();
  expect(view.getByText('19')).toBeTruthy();
  expect(view.getAllByText('+14%').length).toBeGreaterThan(0);
  expect(view.getAllByText('+22%').length).toBeGreaterThan(0);

  // This Week's Momentum comes from `weekly`, not the design copy.
  expect(view.getByText('9,000')).toBeTruthy();
  expect(view.getByText('142')).toBeTruthy();
  expect(view.getByText('₦486.0k')).toBeTruthy();
  expect(view.queryByText(copy.weekStats[0].value)).toBeNull();

  // Chart peak derives from the live series.
  expect(view.getByText(copy.weekChartPeakFor('Fri'))).toBeTruthy();

  // Insights replace the designed recommendation cards.
  expect(view.getByText('Quiet day so far')).toBeTruthy();
  expect(view.getByText('No visits recorded today. Share your quick link.')).toBeTruthy();
  expect(view.getByText(copy.recommendationsHighBadge)).toBeTruthy();

  // Offline device becomes the sync row; zero-count rows disappear.
  expect(view.getByText(copy.activityDevicesTitle(1))).toBeTruthy();
  expect(view.getByText(copy.activityDevicesBody)).toBeTruthy();
  expect(view.queryByText(copy.activity[1].title)).toBeNull();

  // Payload age and plan pill are live.
  expect(view.getByText(copy.overviewMetaFor('Just now'))).toBeTruthy();
  expect(view.getByText('Starter (Free)')).toBeTruthy();
});
