import React, { useState } from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { ServiceChoiceCard } from '@features/business/components/ServiceFlowPrimitives';
import { NewMessageCustomerSheet } from '@features/business/components/NewMessageCustomerSheet';
import { businessCustomersApi } from '@api/businessCustomersApi';
import { classNameOf } from './helpers/CssInteropUpgradeSafety';

function DeliveryChoices() {
  const [delivery, setDelivery] = useState('in-salon');
  return (
    <>
      {['in-salon', 'mobile'].map(id => (
        <ServiceChoiceCard
          key={id}
          title={id}
          description=""
          selected={delivery === id}
          onPress={() => setDelivery(id)}
        />
      ))}
    </>
  );
}

/**
 * Picking a Service Delivery Format did nothing on device: the card gained
 * `shadow-sm` when selected, css-interop remounted it and the tap was lost.
 */
test('delivery format cards switch and keep one className in every state', async () => {
  const view = await render(<DeliveryChoices />);
  const before = [classNameOf(view, 'in-salon'), classNameOf(view, 'mobile')];
  await act(async () => {
    fireEvent.press(view.getByLabelText('mobile'));
  });
  expect(view.getByLabelText('mobile').props.accessibilityState.selected).toBe(true);
  expect(view.getByLabelText('in-salon').props.accessibilityState.selected).toBe(false);
  expect([classNameOf(view, 'in-salon'), classNameOf(view, 'mobile')]).toEqual(before);
});

test('New Message lists the business customers and hands back the one picked', async () => {
  jest.spyOn(businessCustomersApi, 'directory').mockResolvedValue({
    data: [
      {
        userId: 'cust-1',
        name: 'Ada Obi',
        email: 'ada@example.com',
        phone: null,
        avatarUrl: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 30,
    hasNextPage: false,
  } as never);
  const onPick = jest.fn();
  const copy = strings.businessMessages.newMessageSheet;
  const view = await render(
    <NewMessageCustomerSheet visible onClose={jest.fn()} onPick={onPick} />,
  );
  const row = await view.findByLabelText(copy.messageCustomer('Ada Obi'));
  await act(async () => {
    fireEvent.press(row);
  });
  expect(onPick).toHaveBeenCalledWith({ userId: 'cust-1', name: 'Ada Obi' });
});
