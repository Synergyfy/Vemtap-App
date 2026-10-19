import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { BusinessHeader } from '@features/business/components/BusinessPrimitives';
import { useAuthStore } from '@store/authStore';

const mockGetMyBusiness = jest.fn();

jest.mock('@api/businessDashboardApi', () => ({
  businessDashboardApi: {
    getMyBusiness: (...args: unknown[]) => mockGetMyBusiness(...args),
  },
}));

beforeEach(() => {
  mockGetMyBusiness.mockReset();
  useAuthStore.setState({
    status: 'authenticated',
    user: { firstName: 'Ada', lastName: 'Obi' },
  } as never);
});
afterEach(() =>
  useAuthStore.setState({ status: 'unauthenticated', user: null } as never),
);

describe('business navbar avatar', () => {
  it('shows the business logo', async () => {
    mockGetMyBusiness.mockResolvedValue({
      id: 'biz-1',
      name: 'Aurora Grill',
      logoUrl: 'https://cdn.test/logo.png',
    });
    const view = await render(<BusinessHeader title="Orders" />);
    await waitFor(() => expect(view.getByLabelText('Aurora Grill logo')).toBeTruthy());
    // The logo renders in place of the initials.
    expect(view.queryByText('AG')).toBeNull();
    expect(view.queryByText('AO')).toBeNull();
  });

  it('falls back to the business initials without a logo', async () => {
    mockGetMyBusiness.mockResolvedValue({
      id: 'biz-1',
      name: 'Aurora Grill',
      logoUrl: null,
    });
    const view = await render(<BusinessHeader title="Orders" />);
    await waitFor(() => expect(view.getByText('AG')).toBeTruthy());
  });
});
