import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { BusinessHubCentralManagementScreen } from '@features/business/screens/BusinessHubCentralManagementScreen';
import {
  presentBusinessHub,
  type BusinessHubInput,
} from '@features/business/hooks/useBusinessHubData';
import type { MyBusiness } from '@api/businessDashboardApi';
import { strings } from '@constants/strings';

const copy = strings.businessHub;

const business = {
  id: 'biz-1',
  name: 'The Azure Bistro',
  isVerified: true,
  logoUrl: 'https://cdn/logo.png',
  coverImage: 'https://cdn/cover.png',
  phone: '+2348039002210',
  website: 'azurebistro.ng',
  amenities: ['Outdoor Seating', 'Free Wi-Fi'],
  category: { id: 'cat-1', name: 'Food & Beverage' },
  subcategory: { id: 'sub-1', name: 'Casual Dining' },
  branches: [
    { id: 'br-1', name: 'Main Branch', isActive: true, isMainBranch: true },
    { id: 'br-2', name: 'Wuse Branch', isActive: true, isMainBranch: false },
  ],
} as unknown as MyBusiness;

const input: BusinessHubInput = {
  business,
  catalogueTotal: 38,
  offers: [
    { id: 'o-1', status: 'active' },
    { id: 'o-2', status: 'active' },
    { id: 'o-3', status: 'scheduled' },
  ] as never,
  customers: { totalCustomers: 482, newThisWeek: 38 },
  loyalty: {
    stats: [
      { label: 'Points Issued', value: '12,400' },
      { label: 'Active Programs', value: '3' },
    ],
  },
  reviews: { averageRating: 4.9, totalReviews: 128, pendingReviews: 2 },
  dashboard: {
    devices: [{ id: 'd-1', status: 'active' }],
    staffMembers: [{ id: 'u-1' }, { id: 'u-2' }, { id: 'u-3' }],
  } as never,
};

describe('presentBusinessHub', () => {
  it('maps identity, stats, amenities and module counts', () => {
    const view = presentBusinessHub(input);

    expect(view.name).toBe('The Azure Bistro');
    expect(view.categoryLine).toBe('Food & Beverage \u00b7 Casual Dining');
    expect(view.logoUrl).toBe('https://cdn/logo.png');
    expect(view.coverUrl).toBe('https://cdn/cover.png');
    expect(view.isVerified).toBe(true);
    expect(view.phone).toBe('+2348039002210');
    expect(view.website).toBe('azurebistro.ng');
    expect(view.branchCount).toBe(2);
    expect(view.branchNames).toBe('Main Branch & Wuse Branch');
    expect(view.reviews).toEqual({ average: 4.9, total: 128 });
    expect(view.amenities).toEqual(['Outdoor Seating', 'Free Wi-Fi']);
    expect(view.moduleBodies.locations).toBe(
      '2 Active Locations \u00b7 Main Branch & Wuse Branch',
    );
    expect(view.moduleBodies.products).toBe('38 Items in catalogue');
    expect(view.moduleBodies.deals).toBe('2 Active \u00b7 1 Scheduled');
    expect(view.moduleBodies.crm).toBe('482 Total Customers \u00b7 38 New this week');
    expect(view.moduleBodies.loyalty).toBe(
      '3 Active Programmes \u00b7 12,400 points issued',
    );
    expect(view.moduleBodies.staff).toBe('3 Team Members');
    expect(view.readerStatus).toBe('1 of 1 terminals online');
  });

  it('degrades cleanly with no API payloads', () => {
    const view = presentBusinessHub({});

    expect(view.name).toBeUndefined();
    expect(view.isVerified).toBe(false);
    expect(view.reviews).toEqual({ average: null, total: 0 });
    expect(view.amenities).toEqual([]);
    expect(view.moduleBodies).toEqual({});
    expect(view.readerStatus).toBeUndefined();
  });

  it('reports zero live offers instead of a designed number', () => {
    const view = presentBusinessHub({ ...input, offers: [] });
    expect(view.moduleBodies.deals).toBe('No live offers');
  });
});

describe('business hub live rendering', () => {
  const view = presentBusinessHub(input);

  it('renders the live identity, stats, modules and reader status', async () => {
    const screen = await render(<BusinessHubCentralManagementScreen hub={view} />);

    expect(screen.getByText('The Azure Bistro')).toBeTruthy();
    expect(screen.getByText('Food & Beverage \u00b7 Casual Dining')).toBeTruthy();
    expect(screen.getByText('+2348039002210')).toBeTruthy();
    expect(screen.getByText(/4\.9/)).toBeTruthy();
    expect(screen.getByText('Outdoor Seating')).toBeTruthy();
    expect(screen.getByText('482 Total Customers \u00b7 38 New this week')).toBeTruthy();
    expect(screen.getByText('1 of 1 terminals online')).toBeTruthy();
    // The designed numbers must not leak into live mode.
    expect(screen.queryByText(copy.name)).toBeNull();
  });

  it('switches branches through the live option list', async () => {
    const onChangeBranch = jest.fn();
    const screen = await render(
      <BusinessHubCentralManagementScreen
        hub={view}
        branches={[
          { id: 'br-1', name: 'Main Branch', address: '' },
          { id: 'br-2', name: 'Wuse Branch', address: '' },
        ]}
        activeBranchId="br-1"
        onChangeBranch={onChangeBranch}
      />,
    );

    await act(async () => {
      fireEvent.press(screen.getByLabelText(`${copy.viewingPrefix}: Main Branch`));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Wuse Branch'));
    });

    expect(onChangeBranch).toHaveBeenCalledWith('br-2');
  });
});
