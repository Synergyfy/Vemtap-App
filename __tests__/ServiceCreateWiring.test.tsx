import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { useCatalogueDraftStore } from '@store/catalogueDraftStore';
import { AddServiceBasicsMediaScreen } from '@features/business/screens/AddServiceBasicsMediaScreen';
import { AddServiceDurationPricingScreen } from '@features/business/screens/AddServiceDurationPricingScreen';
import { AddServiceAvailabilityRulesScreen } from '@features/business/screens/AddServiceAvailabilityRulesScreen';
import { ReviewServiceSummaryScreen } from '@features/business/screens/ReviewServiceSummaryScreen';
import { ServicePublishedStatusScreen } from '@features/business/screens/ServicePublishedStatusScreen';

afterEach(cleanup);

const branches = [
  { id: 'br-1', name: 'Aurora Maitama', address: '1 Maitama Close' },
  { id: 'br-2', name: 'Aurora Wuse', address: '2 Wuse Road' },
];

describe('service basics screen', () => {
  test('starts empty and emits typed values on continue', async () => {
    const onNext = jest.fn();
    await render(<AddServiceBasicsMediaScreen onBack={jest.fn()} onNext={onNext} />);

    expect(screen.queryByDisplayValue(/Deep Hydration|Facial/)).toBeNull();
    await fireEvent.changeText(
      screen.getByLabelText('Service Title'),
      'Express Glow Facial',
    );
    await fireEvent.press(screen.getByText('Continue to Duration & Pricing'));

    expect(onNext).toHaveBeenCalledTimes(1);
    const value = onNext.mock.calls[0][0];
    expect(value.title).toBe('Express Glow Facial');
    expect(value.delivery).toBe('in-salon');
    expect(value.highlights).toEqual([]);
    expect(value.audience).toBe('all');
  });

  test('save draft emits the same value shape', async () => {
    const onSaveDraft = jest.fn();
    await render(
      <AddServiceBasicsMediaScreen
        onBack={jest.fn()}
        onSaveDraft={onSaveDraft}
        initialValue={{ title: 'Hot Stone Therapy' }}
      />,
    );

    await fireEvent.press(screen.getByText('Save as Draft & Exit'));

    expect(onSaveDraft).toHaveBeenCalledTimes(1);
    expect(onSaveDraft.mock.calls[0][0]).toMatchObject({
      title: 'Hot Stone Therapy',
      delivery: 'in-salon',
    });
  });
});

describe('service duration & pricing screen', () => {
  test('emits pricing and duration values', async () => {
    const onNext = jest.fn();
    await render(
      <AddServiceDurationPricingScreen
        onBack={jest.fn()}
        onNext={onNext}
        initialValue={{ basePrice: '16000', compareAtPrice: '20000' }}
      />,
    );

    await fireEvent.press(screen.getByText('Continue to Branch Availability'));

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onNext.mock.calls[0][0]).toMatchObject({
      basePrice: '16000',
      compareAtPrice: '20000',
      duration: '60 mins',
      bookingEnabled: true,
    });
  });
});

describe('service availability rules screen', () => {
  test('emits the real branch ids', async () => {
    const onNext = jest.fn();
    await render(
      <AddServiceAvailabilityRulesScreen
        onBack={jest.fn()}
        onNext={onNext}
        branches={branches}
        basePrice="₦16,000"
      />,
    );

    await fireEvent.press(screen.getByText('Review & Publish'));

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onNext.mock.calls[0][0].branchIds).toEqual(['br-1', 'br-2']);
  });

  test('toggle removes a branch', async () => {
    const onNext = jest.fn();
    await render(
      <AddServiceAvailabilityRulesScreen
        onBack={jest.fn()}
        onNext={onNext}
        branches={branches}
        basePrice="₦16,000"
      />,
    );

    await fireEvent.press(screen.getByLabelText('Aurora Maitama'));
    await fireEvent.press(screen.getByText('Review & Publish'));

    expect(onNext.mock.calls[0][0].branchIds).toEqual(['br-2']);
  });
});

describe('review service summary screen', () => {
  test('renders draft values when provided', async () => {
    await render(
      <ReviewServiceSummaryScreen
        onBack={jest.fn()}
        draft={{
          name: 'Custom Signature Massage',
          description: 'A bespoke full-body ritual.',
          deliveryMode: 'mobile',
          highlights: ['Aromatherapy'],
          audience: 'women',
          basePrice: '25,000',
          compareAtPrice: '30,000',
          duration: '90 mins',
          bookingEnabled: true,
          branchIds: ['maitama'],
          serviceMode: 'location',
          isBookable: true,
          pricingMode: 'uniform',
          branchPrices: {},
          tiers: [],
          galleryImages: [],
        }}
      />,
    );

    expect(screen.getByText('Custom Signature Massage')).toBeTruthy();
    expect(screen.getByText('₦25,000')).toBeTruthy();
  });

  test('an empty draft shows neutral placeholders, not sample copy', async () => {
    useCatalogueDraftStore.getState().resetService();
    await render(
      <ReviewServiceSummaryScreen
        onBack={jest.fn()}
        draft={useCatalogueDraftStore.getState().service}
      />,
    );

    expect(screen.getByText('Untitled service')).toBeTruthy();
    expect(screen.queryByText(/Deep Hydration|Glow|Maitama/)).toBeNull();
  });
});

describe('service published status screen', () => {
  test('renders draft name and toggles status', async () => {
    const onStatusChange = jest.fn();
    await render(
      <ServicePublishedStatusScreen
        onBack={jest.fn()}
        onNext={jest.fn()}
        onStatusChange={onStatusChange}
        draft={{
          name: 'Hot Stone Therapy',
          description: 'Heated basalt stone treatment.',
          deliveryMode: 'location',
          highlights: ['Relaxing'],
          audience: 'all',
          basePrice: '18,000',
          compareAtPrice: '',
          duration: '75 mins',
          bookingEnabled: true,
          branchIds: ['wuse'],
          serviceMode: 'location',
          isBookable: true,
          pricingMode: 'uniform',
          branchPrices: {},
          tiers: [],
          galleryImages: [],
        }}
      />,
    );

    expect(screen.getByText('Hot Stone Therapy')).toBeTruthy();
    expect(screen.getByText('Live Online')).toBeTruthy();

    await fireEvent.press(screen.getByText('Saved as Draft'));
    expect(onStatusChange).toHaveBeenCalledWith('draft');
    expect(screen.getAllByText('Saved as Draft').length).toBeGreaterThan(0);
  });
});
