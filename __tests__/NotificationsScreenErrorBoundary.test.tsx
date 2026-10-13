import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { NotificationsCenterScreen } from '@features/accountHub/screens/NotificationsCenterScreen';
import { strings } from '@constants/strings';

jest.mock('@features/accountHub/components/HubPrimitives', () => ({
  ...jest.requireActual('@features/accountHub/components/HubPrimitives'),
  StatusPillTabs: () => {
    throw new Error('simulated tab-row crash');
  },
}));

test('a crash inside the screen stays screen-scoped with a retry', async () => {
  const origError = console.error;
  console.error = () => {};
  await render(<NotificationsCenterScreen />);
  console.error = origError;

  // The shared fallback renders in place — the app shell survives.
  expect(screen.getByText('Something went wrong')).toBeTruthy();
  expect(screen.getByText(strings.common.retry)).toBeTruthy();
});
