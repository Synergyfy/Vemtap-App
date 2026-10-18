import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { businessLocationCopy } from '@features/business/businessCopy';
import { AddBranchLocationScreen } from '@features/business/screens/AddBranchLocationScreen';
import { BusinessLocationsMultiBranchScreen } from '@features/business/screens/BusinessLocationsMultiBranchScreen';
import { BusinessMoreHubScreen } from '@features/business/screens/BusinessMoreHubScreen';

test('a new branch form starts empty and says it is not pinned', async () => {
  const onSave = jest.fn();
  const view = await render(<AddBranchLocationScreen onSave={onSave} />);
  const copy = businessLocationCopy.addBranch;

  expect(view.getByText(copy.notPinned)).toBeTruthy();
  expect(view.queryByText(copy.gpsLinked)).toBeNull();
  expect(view.queryByDisplayValue(/Garki|Okafor|urbangrill/)).toBeNull();

  await act(async () => {
    fireEvent.press(view.getByText(copy.save));
  });
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ name: '', street: '', leadName: '', leadEmail: '' }),
  );
});

test('a pinned branch shows its real coordinates', async () => {
  const view = await render(
    <AddBranchLocationScreen coordinates={{ latitude: 9.0712, longitude: 7.4958 }} />,
  );
  expect(view.getByText('9.0712° N, 7.4958° E')).toBeTruthy();
  expect(view.getByText(businessLocationCopy.addBranch.gpsLinked)).toBeTruthy();
});

test('setup lists no sample branches when the business has none', async () => {
  const view = await render(<BusinessLocationsMultiBranchScreen />);
  expect(view.queryByText(/Wuse Branch|Garki Branch|Urban Grill/)).toBeNull();
});

test('More hub shows live plan, row status and version, and no invented values', async () => {
  const copy = strings.businessMore;
  const view = await render(
    <BusinessMoreHubScreen
      planName="Growth"
      appVersion="1.4.0"
      rowStatus={{
        reviews: { meta: copy.reviewsMeta('4.6', 12) },
        notifications: { badge: copy.unreadBadge(3) },
        verification: { badge: 'Verified', badgeTone: 'success' },
      }}
    />,
  );

  expect(view.getByText('Growth')).toBeTruthy();
  expect(view.getByText(copy.reviewsMeta('4.6', 12))).toBeTruthy();
  expect(view.getByText('3 unread')).toBeTruthy();
  expect(view.getByText('Verified')).toBeTruthy();
  expect(view.getByText(copy.buildFootnote('1.4.0'))).toBeTruthy();
  expect(
    view.queryByText(/4\.9|128 verified|Tier 3|Nov 14|Terminal 01|ISO-27001|Build 9042/),
  ).toBeNull();
});
