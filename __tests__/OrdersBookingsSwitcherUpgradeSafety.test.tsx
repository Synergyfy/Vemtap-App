import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { BusinessOrdersHubScreen } from '@features/business/screens/BusinessOrdersHubScreen';
import { strings } from '@constants/strings';
import { classNameOf, flattenStyle } from './helpers/CssInteropUpgradeSafety';

const [ordersLabel, bookingsLabel] = strings.businessOrders.switcher;

/**
 * Selecting Bookings once made its pill gain a background class, which made
 * css-interop "upgrade" the pill; in dev its warning walked the whole props
 * tree and, minutes into a session, the app closed. The pills' className must
 * stay byte-identical in every state, with the selected look in `style`.
 */
test('switcher pills keep one className and carry state in style', async () => {
  const view = await render(<BusinessOrdersHubScreen />);
  const before = [classNameOf(view, ordersLabel), classNameOf(view, bookingsLabel)];
  expect(
    flattenStyle(view.getByLabelText(ordersLabel).props.style).backgroundColor,
  ).not.toBe('transparent');

  await act(async () => {
    fireEvent.press(view.getByLabelText(bookingsLabel));
  });

  expect([classNameOf(view, ordersLabel), classNameOf(view, bookingsLabel)]).toEqual(
    before,
  );
  expect(
    flattenStyle(view.getByLabelText(bookingsLabel).props.style).backgroundColor,
  ).not.toBe('transparent');
  expect(flattenStyle(view.getByLabelText(ordersLabel).props.style).backgroundColor).toBe(
    'transparent',
  );
});
