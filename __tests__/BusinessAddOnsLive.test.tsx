import React from 'react';
import { render } from '@testing-library/react-native';
import { BusinessLogo } from '@features/business/components/VerificationPrimitives';
import { plansFor } from '@features/business/hooks/useCreditPlans';
import type { CreditPlan } from '@api/creditPlansApi';

const plan = (id: string, price: number, sms: number, ai: number): CreditPlan => ({
  id,
  name: id,
  price,
  currency: 'NGN',
  smsAmount: sms,
  emailAmount: 0,
  whatsappAmount: 0,
  aiAmount: ai,
});

test('a business without a logo shows its initials, not a stock storefront', async () => {
  const view = await render(<BusinessLogo name="Aurora Grill House" />);
  expect(view.getByText('AG')).toBeTruthy();
  expect(view.toJSON()).not.toEqual(expect.objectContaining({ type: 'Image' }));
  expect(JSON.stringify(view.toJSON())).not.toContain('googleusercontent');
});

test('credit bundles are matched to their channel, cheapest first', () => {
  const plans = [
    plan('big', 9000, 1000, 0),
    plan('ai', 1000, 0, 100),
    plan('small', 1500, 250, 0),
  ];
  expect(plansFor(plans, 'sms').map(p => p.id)).toEqual(['small', 'big']);
  expect(plansFor(plans, 'ai').map(p => p.id)).toEqual(['ai']);
  expect(plansFor(undefined, 'sms')).toEqual([]);
});
