import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react-native';
import { strings } from '@constants/strings';
import {
  serviceBranches,
  serviceFlowImages,
} from '@features/business/data/serviceFlowData';
import { AddServiceBasicsMediaScreen } from '@features/business/screens/AddServiceBasicsMediaScreen';
import { AddServiceDurationPricingScreen } from '@features/business/screens/AddServiceDurationPricingScreen';
import { AddServiceAvailabilityRulesScreen } from '@features/business/screens/AddServiceAvailabilityRulesScreen';
import { ReviewServiceSummaryScreen } from '@features/business/screens/ReviewServiceSummaryScreen';
import { ServiceBlockoutsSheet } from '@features/business/components/ServiceBlockoutsSheet';
import { LocationScheduleSheet } from '@features/business/components/LocationScheduleSheet';
import {
  serviceBranchPricingInput,
  serviceDraftToCreateInput,
} from '@features/business/utils/catalogueDraftMappers';
import { usePublishCatalogueItem } from '@features/business/hooks/useCatalogueMutations';
import { catalogueApi } from '@api/catalogueApi';
import { useCatalogueDraftStore } from '@store/catalogueDraftStore';
import {
  dailySlots,
  durationMinutes,
  parseTime,
  toClock,
} from '@features/business/utils/serviceSchedule';
import type { ServiceDraft } from '@store/catalogueDraftStore';

const copy = strings.serviceFlow;
const BRANCH = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

/**
 * No retries, and no garbage-collection timers: React Query's default 5-minute
 * gcTime keeps Jest from exiting after the tests pass.
 */
function testQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
}

describe('service schedule arithmetic', () => {
  it('parses times and durations the way the bookings API does', () => {
    expect(parseTime('09:30')).toBe(570);
    expect(parseTime('25:00')).toBeNull();
    expect(toClock(13 * 60 + 5)).toBe('1:05 PM');
    expect(durationMinutes('1.5 hrs')).toBe(90);
    expect(durationMinutes('45 mins')).toBe(45);
  });

  it('lays slots on the 30-minute grid with the buffer after each booking', () => {
    // 60 min + 15 min buffer → every 90 minutes.
    expect(dailySlots(9 * 60, 13 * 60, 60, 15).map(toClock)).toEqual([
      '9:00 AM',
      '10:30 AM',
      '12:00 PM',
    ]);
  });
});

describe('service draft → create DTO', () => {
  const draft: ServiceDraft = {
    name: 'Deep tissue massage',
    description: 'Ninety minutes of deep work',
    deliveryMode: 'in-salon',
    highlights: [],
    audience: 'all',
    galleryImages: [],
    basePrice: '15,000',
    duration: '60 mins',
    bookingEnabled: true,
    branchIds: [BRANCH],
    serviceMode: 'location',
    isBookable: true,
    pricingMode: 'uniform',
    branchPrices: {},
    tiers: [{ id: 't1', name: 'Hot stones', price: '5,000', duration: '30 mins' }],
    bookingRules: {
      days: [1, 2, 3],
      from: '10:00',
      to: '17:00',
      bufferMinutes: 15,
      leadMinutes: 120,
      horizonDays: 30,
      capacity: 2,
      requiresConfirmation: false,
    },
  };

  it('sends tiers as priced variants and the booking rules', () => {
    const input = serviceDraftToCreateInput(draft, BRANCH);
    expect(input.variants).toEqual([{ name: 'Hot stones (30 mins)', price: 5000 }]);
    expect(input.bookingRules).toEqual(draft.bookingRules);
    expect(input.branchId).toBe(BRANCH);
  });

  it('sends no booking rules when online booking is off', () => {
    expect(
      serviceDraftToCreateInput({ ...draft, bookingEnabled: false }, BRANCH).bookingRules,
    ).toBeUndefined();
  });
});

describe('live service screens', () => {
  it('basics starts empty with no sample photos and needs a name', async () => {
    const onNext = jest.fn();
    await render(
      <AddServiceBasicsMediaScreen
        onBack={jest.fn()}
        onNext={onNext}
        live={{
          provider: 'Mama Put Spa',
          providerLocation: 'Wuse II',
          primaryCategory: 'Health & Beauty',
          subCategory: 'Massage',
        }}
      />,
    );
    expect(screen.getByText('Mama Put Spa')).toBeTruthy();
    expect(screen.getByText(copy.noPhotoYet)).toBeTruthy();
    expect(screen.queryByText('Glow & Serenity Spa & Salon')).toBeNull();

    await fireEvent.press(screen.getByText('Continue to Duration & Pricing'));
    expect(onNext).not.toHaveBeenCalled();

    await fireEvent.changeText(
      screen.getByPlaceholderText('e.g. 60 Min Classic Therapeutic Massage'),
      'Deep tissue massage',
    );
    await fireEvent.press(screen.getByText('Continue to Duration & Pricing'));
    expect(onNext.mock.calls[0][0]).toMatchObject({
      title: 'Deep tissue massage',
      mainImage: undefined,
      galleryImages: [],
    });
    expect(onNext.mock.calls[0][0].mainImage).not.toBe(serviceFlowImages.cover.uri);
  });

  it('pricing adds a tier through the dialog and emits the schedule', async () => {
    const onNext = jest.fn();
    await render(
      <AddServiceDurationPricingScreen
        onBack={jest.fn()}
        onNext={onNext}
        live
        initialValue={{ basePrice: '15,000' }}
      />,
    );
    expect(screen.getByText(copy.noTiers)).toBeTruthy();

    await fireEvent.press(screen.getByText(copy.addTier));
    await fireEvent.changeText(screen.getByLabelText(copy.tierDialog.name), 'Hot stones');
    await fireEvent.changeText(screen.getByLabelText(copy.tierDialog.price), '5000');
    await act(async () => {
      fireEvent.press(screen.getByLabelText(copy.tierDialog.confirm));
    });
    expect(screen.getByText('Hot stones')).toBeTruthy();

    await fireEvent.press(screen.getByText('Continue to Branch Availability'));
    const value = onNext.mock.calls[0][0];
    expect(value.tiers).toEqual([
      expect.objectContaining({ name: 'Hot stones', price: '5000' }),
    ]);
    expect(value.schedule).toEqual({
      days: [1, 2, 3, 4, 5, 6],
      from: '09:00',
      to: '18:00',
      bufferMinutes: 15,
      requiresConfirmation: true,
      blockouts: [],
    });
  });

  it('availability lists the real branches and emits their ids with the rules', async () => {
    const onNext = jest.fn();
    await render(
      <AddServiceAvailabilityRulesScreen
        onBack={jest.fn()}
        onNext={onNext}
        branches={[{ id: BRANCH, name: 'Wuse II', address: 'Aminu Kano Cres' }]}
      />,
    );
    expect(screen.getByText('Wuse II')).toBeTruthy();
    expect(screen.queryByText(serviceBranches[0].name)).toBeNull();
    expect(screen.queryByText('Garki Branch')).toBeNull();

    await fireEvent.press(screen.getByText('Review & Publish'));
    expect(onNext.mock.calls[0][0]).toMatchObject({
      branchIds: [BRANCH],
      rules: { leadMinutes: 120, horizonDays: 30, capacity: 2 },
    });
  });

  it('review shows the draft, its tiers and its booking rules', async () => {
    jest
      .spyOn(catalogueApi, 'listBusinessBranches')
      .mockResolvedValue([{ id: BRANCH, name: 'Wuse II' } as never]);
    const client = testQueryClient();
    await render(
      <QueryClientProvider client={client}>
        <ReviewServiceSummaryScreen
          onBack={jest.fn()}
          provider={{ name: 'Mama Put Spa', category: 'Health & Beauty > Massage' }}
          draft={{
            name: 'Deep tissue massage',
            description: 'Ninety minutes of deep work',
            deliveryMode: 'in-salon',
            highlights: [],
            audience: 'all',
            galleryImages: [],
            basePrice: '15000',
            duration: '60 mins',
            bookingEnabled: true,
            branchIds: [BRANCH],
            serviceMode: 'location',
            isBookable: true,
            pricingMode: 'uniform',
            branchPrices: {},
            tiers: [{ id: 't1', name: 'Hot stones', price: '5000' }],
            bookingRules: {
              days: [1, 2, 3],
              from: '10:00',
              to: '17:00',
              requiresConfirmation: false,
            },
          }}
        />
      </QueryClientProvider>,
    );
    expect(screen.getByText('Mama Put Spa')).toBeTruthy();
    expect(screen.getByText('₦15,000')).toBeTruthy();
    expect(screen.getByText('Hot stones')).toBeTruthy();
    expect(screen.getByText('Mon, Tue, Wed • 10:00 AM – 5:00 PM')).toBeTruthy();
    expect(screen.getByText(copy.review.confirmOff)).toBeTruthy();
    expect(screen.queryByText('Pay at Salon Reception')).toBeNull();
  });
});

describe('tiered branch pricing', () => {
  const OTHER = 'c3d4e5f6-a7b8-4c9d-8e0f-2a3b4c5d6e7f';
  const branches = [
    { id: BRANCH, name: 'Wuse II', address: '' },
    { id: OTHER, name: 'Maitama', address: '' },
  ];

  it('asks for a price per ticked branch, prefilled with the base price', async () => {
    const onNext = jest.fn();
    await render(
      <AddServiceAvailabilityRulesScreen
        onBack={jest.fn()}
        onNext={onNext}
        branches={branches}
        basePrice="₦15,000"
      />,
    );
    expect(screen.queryByText(copy.branchPriceLabel)).toBeNull();

    await fireEvent.press(screen.getByText('Tiered Branch Pricing'));
    expect(screen.getAllByText(copy.branchPriceLabel)).toHaveLength(2);

    await fireEvent.changeText(screen.getAllByDisplayValue('15,000')[1], '18,000');
    await fireEvent.press(screen.getByText('Review & Publish'));
    expect(onNext.mock.calls[0][0]).toMatchObject({
      pricingMode: 'per_branch',
      branchPrices: { [BRANCH]: '15,000', [OTHER]: '18,000' },
    });
  });

  it('blocks continuing while a ticked branch has no price', async () => {
    const onNext = jest.fn();
    await render(
      <AddServiceAvailabilityRulesScreen
        onBack={jest.fn()}
        onNext={onNext}
        branches={branches}
        initialPricingMode="per_branch"
        initialBranchPrices={{ [BRANCH]: '' }}
      />,
    );
    expect(screen.getByText(copy.branchPriceMissing)).toBeTruthy();
    await fireEvent.press(screen.getByText('Review & Publish'));
    expect(onNext).not.toHaveBeenCalled();
  });

  it('turns per-branch prices into the branch-pricing body', () => {
    const base: ServiceDraft = {
      name: 'Massage',
      description: '',
      deliveryMode: '',
      highlights: [],
      audience: '',
      galleryImages: [],
      basePrice: '15,000',
      bookingEnabled: true,
      branchIds: [BRANCH, OTHER],
      serviceMode: 'location',
      isBookable: true,
      tiers: [],
      pricingMode: 'per_branch',
      branchPrices: { [OTHER]: '18,000' },
    };
    expect(serviceBranchPricingInput(base)).toEqual({
      pricingMode: 'per_branch',
      branches: [
        { branchId: BRANCH, isAvailable: true, price: 15000 },
        { branchId: OTHER, isAvailable: true, price: 18000 },
      ],
    });
    expect(
      serviceBranchPricingInput({ ...base, pricingMode: 'uniform' }),
    ).toBeUndefined();
  });

  it('publishes, then sets the branch prices on the new service', async () => {
    const created = { id: 'svc-1', name: 'Massage' };
    const create = jest
      .spyOn(catalogueApi, 'createCatalogueItem')
      .mockResolvedValue(created as never);
    const importItem = jest
      .spyOn(catalogueApi, 'importItemToBranch')
      .mockResolvedValue(created as never);
    const setPricing = jest
      .spyOn(catalogueApi, 'setItemBranchPricing')
      .mockResolvedValue({} as never);
    useCatalogueDraftStore.getState().resetService();
    useCatalogueDraftStore.getState().setService({
      name: 'Massage',
      basePrice: '15,000',
      branchIds: [BRANCH, OTHER],
      pricingMode: 'per_branch',
      branchPrices: { [BRANCH]: '15,000', [OTHER]: '18,000' },
    });
    const client = testQueryClient();
    const { result } = await renderHook(() => usePublishCatalogueItem(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });

    await act(async () => {
      await result.current.mutateAsync({ kind: 'service', status: 'active' });
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ branchId: BRANCH, pricingMode: 'per_branch' }),
    );
    expect(importItem).toHaveBeenCalledWith('svc-1', OTHER);
    expect(setPricing).toHaveBeenCalledWith('svc-1', {
      pricingMode: 'per_branch',
      branches: [
        { branchId: BRANCH, isAvailable: true, price: 15000 },
        { branchId: OTHER, isAvailable: true, price: 18000 },
      ],
    });
    jest.restoreAllMocks();
    useCatalogueDraftStore.getState().resetService();
  });
});

describe('blocked dates and branch schedules', () => {
  // Friday 16 Oct 2026, local time.
  const NOW = new Date(2026, 9, 16, 9, 0);

  it('blocks and unblocks days from the month strip, with a reason', async () => {
    const onSave = jest.fn();
    await render(
      <ServiceBlockoutsSheet
        visible
        onClose={jest.fn()}
        value={[]}
        onSave={onSave}
        now={NOW}
      />,
    );
    expect(screen.getByText('October 2026')).toBeTruthy();

    await fireEvent.changeText(
      screen.getByLabelText(copy.blockouts.reasonLabel),
      'Staff training',
    );
    await fireEvent.press(screen.getByText('Sat 24'));
    await fireEvent.press(screen.getByLabelText(copy.blockouts.nextMonth));
    expect(screen.getByText('November 2026')).toBeTruthy();
    await fireEvent.press(screen.getByText('Mon 2'));
    // Tapping again unblocks.
    await fireEvent.press(screen.getByText('Mon 2'));
    await fireEvent.press(screen.getByText('Tue 3'));
    await fireEvent.press(screen.getByText(copy.blockouts.save));

    expect(onSave).toHaveBeenCalledWith([
      { date: '2026-10-24', reason: 'Staff training' },
      { date: '2026-11-03', reason: 'Staff training' },
    ]);
  });

  const locationProps = (onSave: jest.Mock) => ({
    visible: true,
    onClose: jest.fn(),
    branchName: 'Maitama',
    serviceSchedule: { days: [1, 2, 3, 4, 5, 6], from: '09:00', to: '18:00' },
    onSave,
  });

  it('keeps the service schedule at a branch by default', async () => {
    const onSave = jest.fn();
    await render(<LocationScheduleSheet {...locationProps(onSave)} />);
    await fireEvent.press(screen.getByText(copy.locationSchedule.save));
    expect(onSave).toHaveBeenLastCalledWith(undefined);
  });

  it('gives a branch its own days and hours, validating the times', async () => {
    const onSave = jest.fn();
    await render(<LocationScheduleSheet {...locationProps(onSave)} />);
    await fireEvent.press(screen.getByText(copy.locationSchedule.custom));
    await fireEvent.press(screen.getByText('Sat'));
    await fireEvent.changeText(
      screen.getByLabelText(copy.locationSchedule.startLabel),
      '10:00',
    );
    await fireEvent.changeText(
      screen.getByLabelText(copy.locationSchedule.endLabel),
      '8:00',
    );
    await fireEvent.press(screen.getByText(copy.locationSchedule.save));
    expect(screen.getByText(copy.locationSchedule.invalid)).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();

    await fireEvent.changeText(
      screen.getByLabelText(copy.locationSchedule.endLabel),
      '20:00',
    );
    await fireEvent.press(screen.getByText(copy.locationSchedule.save));
    expect(onSave).toHaveBeenLastCalledWith({
      days: [1, 2, 3, 4, 5],
      from: '10:00',
      to: '20:00',
    });
  });

  it('opens the location schedule from a ticked branch and emits the override', async () => {
    const onNext = jest.fn();
    await render(
      <AddServiceAvailabilityRulesScreen
        onBack={jest.fn()}
        onNext={onNext}
        branches={[{ id: BRANCH, name: 'Wuse II', address: '' }]}
        serviceSchedule={{ days: [1, 2, 3, 4, 5, 6], from: '09:00', to: '18:00' }}
      />,
    );
    await fireEvent.press(screen.getByLabelText('Edit Location Schedule for Wuse II'));
    await fireEvent.press(screen.getByText(copy.locationSchedule.custom));
    await fireEvent.changeText(
      screen.getByLabelText(copy.locationSchedule.startLabel),
      '12:00',
    );
    await fireEvent.press(screen.getByText(copy.locationSchedule.save));
    expect(screen.getByText(copy.locationSchedule.customPill)).toBeTruthy();

    await fireEvent.press(screen.getByText('Review & Publish'));
    expect(onNext.mock.calls[0][0].branchSchedules).toEqual([
      { branchId: BRANCH, days: [1, 2, 3, 4, 5, 6], from: '12:00', to: '18:00' },
    ]);
  });

  it('opens the blockouts editor from the pricing step and emits the dates', async () => {
    const onNext = jest.fn();
    await render(
      <AddServiceDurationPricingScreen
        onBack={jest.fn()}
        onNext={onNext}
        live
        initialValue={{
          basePrice: '15,000',
          schedule: { blockouts: [{ date: '2026-12-25', reason: 'Christmas' }] },
        }}
      />,
    );
    expect(screen.getByText(copy.blockouts.summary(1))).toBeTruthy();
    await fireEvent.press(screen.getByText('Customize Specific Dates & Blockouts'));
    expect(screen.getByText(copy.blockouts.blockedTitle(1))).toBeTruthy();

    await fireEvent.press(screen.getByText('Continue to Branch Availability'));
    expect(onNext.mock.calls[0][0].schedule.blockouts).toEqual([
      { date: '2026-12-25', reason: 'Christmas' },
    ]);
  });
});
