import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StatusPillTabs } from '@features/accountHub/components/HubPrimitives';

const onSelect = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

test('renders the default variant and keeps press behaviour', async () => {
  await render(
    <StatusPillTabs
      labels={['All 3', 'Unread 1', 'System']}
      selected={0}
      onSelect={onSelect}
    />,
  );

  expect(screen.getByText('All 3')).toBeTruthy();
  await fireEvent.press(screen.getByText('Unread 1'));
  expect(onSelect).toHaveBeenCalledWith(1);
});

test('a missing labels array renders an empty row instead of crashing', async () => {
  const view = await render(
    <StatusPillTabs
      labels={undefined as unknown as readonly string[]}
      selected={0}
      onSelect={onSelect}
    />,
  );

  expect(view.toJSON()).toBeTruthy();
});

test('non-string labels are coerced instead of crashing React', async () => {
  await render(
    <StatusPillTabs
      labels={[123, null, { label: 'x' }, undefined] as unknown as readonly string[]}
      selected={0}
      onSelect={onSelect}
    />,
  );

  expect(screen.getByText('123')).toBeTruthy();
});

test('switcher tolerates null counts and null disabledTabs', async () => {
  await render(
    <StatusPillTabs
      variant="switcher"
      labels={['Orders', 'Bookings']}
      counts={null as unknown as readonly string[]}
      disabledTabs={null as unknown as readonly number[]}
      selected={1}
      onSelect={onSelect}
    />,
  );

  expect(screen.getByText('Orders')).toBeTruthy();
  await fireEvent.press(screen.getByText('Bookings'));
  expect(onSelect).toHaveBeenCalledWith(1);
});

test('segmented variant survives a bad labels payload', async () => {
  const view = await render(
    <StatusPillTabs
      segmented
      labels={undefined as unknown as readonly string[]}
      selected={0}
      onSelect={onSelect}
    />,
  );

  expect(view.toJSON()).toBeTruthy();
});

test('pressing a tab without an onSelect handler never throws', async () => {
  await render(
    <StatusPillTabs
      labels={['All', 'Unread']}
      selected={0}
      onSelect={undefined as unknown as (index: number) => void}
    />,
  );

  await fireEvent.press(screen.getByText('Unread'));
  expect(screen.getByText('All')).toBeTruthy();
  expect(onSelect).not.toHaveBeenCalled();
});
