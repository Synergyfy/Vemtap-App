import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { catalogueApi } from '@api/catalogueApi';
import { ServiceBookingRulesFlow } from '@navigation/serviceFlowRoutes';

const copy = strings.serviceFlow;
const BRANCH = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';

/** No gc timers, so Jest exits once the tests pass. */
function testQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
}

async function settle() {
  await act(async () => {
    await new Promise<void>(resolve => {
      setTimeout(resolve, 20);
    });
  });
}

const service = {
  id: 'svc-1',
  name: 'Deep tissue massage',
  bookingRules: {
    days: [1, 2, 3, 4, 5],
    from: '10:00',
    to: '17:00',
    blockouts: [{ date: '2026-12-25', reason: 'Christmas' }],
  },
};

let update: jest.SpyInstance;

beforeEach(() => {
  jest.spyOn(catalogueApi, 'getItemBranchPricing').mockResolvedValue({
    itemId: 'svc-1',
    pricingMode: 'uniform',
    basePrice: 15000,
    baseCompareAtPrice: null,
    branches: [
      {
        branchId: BRANCH,
        branchName: 'Wuse II',
        isMainBranch: true,
        isAvailable: true,
        price: 15000,
        compareAtPrice: null,
      },
      {
        branchId: 'c3d4e5f6-a7b8-4c9d-8e0f-2a3b4c5d6e7f',
        branchName: 'Garki',
        isMainBranch: false,
        isAvailable: false,
        price: 15000,
        compareAtPrice: null,
      },
    ],
  });
  update = jest
    .spyOn(catalogueApi, 'updateCatalogueItem')
    .mockResolvedValue({ id: 'svc-1' } as never);
});

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

async function open() {
  await render(
    <QueryClientProvider client={testQueryClient()}>
      <ServiceBookingRulesFlow service={service} onClose={jest.fn()} />
    </QueryClientProvider>,
  );
  await settle();
}

describe('booking rules for an existing service', () => {
  it('summarises the saved rules and lists only the branches offering it', async () => {
    await open();
    expect(screen.getByText(copy.bookingRulesSheet.title)).toBeTruthy();
    expect(screen.getByText('Mon, Tue, Wed, Thu, Fri • 10:00 AM – 5:00 PM')).toBeTruthy();
    expect(screen.getByText(copy.blockouts.summary(1))).toBeTruthy();
    expect(screen.getByText('Wuse II')).toBeTruthy();
    expect(screen.queryByText('Garki')).toBeNull();
  });

  it('removes a blocked date and saves the merged rules', async () => {
    await open();
    await fireEvent.press(screen.getByText(copy.bookingRulesSheet.blockouts));
    await fireEvent.press(screen.getByLabelText(copy.blockouts.remove('25 Dec 2026')));
    await act(async () => {
      fireEvent.press(screen.getByText(copy.blockouts.save));
    });
    await settle();

    expect(update).toHaveBeenCalledWith('svc-1', {
      bookingRules: { days: [1, 2, 3, 4, 5], from: '10:00', to: '17:00', blockouts: [] },
    });
    // Back on the menu.
    expect(screen.getByText(copy.blockouts.summary(0))).toBeTruthy();
  });

  it('gives one branch its own hours and keeps the rest of the rules', async () => {
    await open();
    await fireEvent.press(screen.getByText('Wuse II'));
    await fireEvent.press(screen.getByText(copy.locationSchedule.custom));
    await fireEvent.changeText(
      screen.getByLabelText(copy.locationSchedule.startLabel),
      '12:00',
    );
    await act(async () => {
      fireEvent.press(screen.getByText(copy.locationSchedule.save));
    });
    await settle();

    expect(update).toHaveBeenCalledWith('svc-1', {
      bookingRules: {
        ...service.bookingRules,
        branchSchedules: [
          { branchId: BRANCH, days: [1, 2, 3, 4, 5], from: '12:00', to: '17:00' },
        ],
      },
    });
  });
});
