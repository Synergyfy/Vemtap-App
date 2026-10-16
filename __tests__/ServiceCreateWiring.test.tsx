import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import {
  serviceBranches,
  serviceFlowDraft,
} from '@features/business/data/serviceFlowData';
import { AddServiceBasicsMediaScreen } from '@features/business/screens/AddServiceBasicsMediaScreen';
import { AddServiceDurationPricingScreen } from '@features/business/screens/AddServiceDurationPricingScreen';
import { AddServiceAvailabilityRulesScreen } from '@features/business/screens/AddServiceAvailabilityRulesScreen';
import { ReviewServiceSummaryScreen } from '@features/business/screens/ReviewServiceSummaryScreen';
import { ServicePublishedStatusScreen } from '@features/business/screens/ServicePublishedStatusScreen';

afterEach(cleanup);

describe('service basics screen', () => {
  test('emits typed values on continue', async () => {
    const onNext = jest.fn();
    await render(<AddServiceBasicsMediaScreen onBack={jest.fn()} onNext={onNext} />);

    const title = screen.getByDisplayValue(serviceFlowDraft.title);
    await fireEvent.changeText(title, 'Express Glow Facial');
    await fireEvent.press(screen.getByText('Continue to Duration & Pricing'));

    expect(onNext).toHaveBeenCalledTimes(1);
    const value = onNext.mock.calls[0][0];
    expect(value.title).toBe('Express Glow Facial');
    expect(value.description).toBeTruthy();
    expect(value.delivery).toBe('in-salon');
    expect(value.highlights).toContain('Sensitive Skin Safe');
    expect(value.audience).toBe('all');
  });

  test('save draft emits the same value shape', async () => {
    const onSaveDraft = jest.fn();
    await render(
      <AddServiceBasicsMediaScreen onBack={jest.fn()} onSaveDraft={onSaveDraft} />,
    );

    await fireEvent.press(screen.getByText('Save as Draft & Exit'));

    expect(onSaveDraft).toHaveBeenCalledTimes(1);
    expect(onSaveDraft.mock.calls[0][0]).toMatchObject({
      title: serviceFlowDraft.title,
      delivery: 'in-salon',
    });
  });
});

describe('service duration & pricing screen', () => {
  test('emits pricing and duration values', async () => {
    const onNext = jest.fn();
    await render(<AddServiceDurationPricingScreen onBack={jest.fn()} onNext={onNext} />);

    await fireEvent.press(screen.getByText('Continue to Branch Availability'));

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onNext.mock.calls[0][0]).toMatchObject({
      basePrice: serviceFlowDraft.basePrice,
      compareAtPrice: serviceFlowDraft.compareAtPrice,
      duration: '60 mins',
      bookingEnabled: true,
    });
  });
});

describe('service availability rules screen', () => {
  test('emits seeded branch ids', async () => {
    const onNext = jest.fn();
    await render(
      <AddServiceAvailabilityRulesScreen onBack={jest.fn()} onNext={onNext} />,
    );

    await fireEvent.press(screen.getByText('Review & Publish'));

    expect(onNext).toHaveBeenCalledTimes(1);
    const value = onNext.mock.calls[0][0];
    expect(value.branchIds).toEqual(serviceBranches.map(b => b.id));
  });

  test('toggle removes a branch', async () => {
    const onNext = jest.fn();
    await render(
      <AddServiceAvailabilityRulesScreen onBack={jest.fn()} onNext={onNext} />,
    );

    await fireEvent.press(screen.getByLabelText(serviceBranches[0].name));
    await fireEvent.press(screen.getByText('Review & Publish'));

    expect(onNext.mock.calls[0][0].branchIds).toEqual([serviceBranches[1].id]);
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
          tiers: [],
          galleryImages: [],
        }}
      />,
    );

    expect(screen.getByText('Custom Signature Massage')).toBeTruthy();
    expect(screen.getByText('₦25,000')).toBeTruthy();
  });

  test('falls back to prototype copy without a draft', async () => {
    await render(<ReviewServiceSummaryScreen onBack={jest.fn()} />);

    expect(screen.getByText(serviceFlowDraft.title)).toBeTruthy();
    // The base rate and the branch summaries both quote it.
    expect(
      screen.getAllByText(serviceFlowDraft.basePriceFormatted).length,
    ).toBeGreaterThan(0);
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
