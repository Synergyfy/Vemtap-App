import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import {
  serviceBranches,
  serviceFlowImages,
} from '@features/business/data/serviceFlowData';
import { AddServiceBasicsMediaScreen } from '@features/business/screens/AddServiceBasicsMediaScreen';
import { AddServiceDurationPricingScreen } from '@features/business/screens/AddServiceDurationPricingScreen';
import { AddServiceAvailabilityRulesScreen } from '@features/business/screens/AddServiceAvailabilityRulesScreen';
import { ReviewServiceSummaryScreen } from '@features/business/screens/ReviewServiceSummaryScreen';
import { serviceDraftToCreateInput } from '@features/business/utils/catalogueDraftMappers';
import {
  dailySlots,
  durationMinutes,
  parseTime,
  toClock,
} from '@features/business/utils/serviceSchedule';
import type { ServiceDraft } from '@store/catalogueDraftStore';

const copy = strings.serviceFlow;
const BRANCH = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';

afterEach(cleanup);

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
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
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
