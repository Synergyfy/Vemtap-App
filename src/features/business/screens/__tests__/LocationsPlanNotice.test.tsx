import React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { LocationsBranchesScreen } from '@features/business/screens/LocationsBranchesScreen';

/**
 * A plan refusal is the one failure on this screen the merchant cannot fix by
 * typing something different, so it gets a notice that outlives the toast and
 * carries the way out. These pin the contract: it appears only when told to,
 * it offers an action, and it can be dismissed.
 *
 * The slug→copy mapping itself is covered in `BranchPlanErrors.test.ts`; what is
 * under test here is the surface the merchant actually sees.
 */

afterEach(cleanup);

const copy = strings.locationsBranches;

describe('locations plan notice', () => {
  it('is absent until a plan refusal has happened', async () => {
    const view = await render(<LocationsBranchesScreen />);

    // A generic failure (bad name, network drop) must not raise it — the toast
    // already covers those, and a permanent-looking notice for a transient
    // error would send people to buy a plan they do not need.
    expect(view.queryByText(copy.planNoticeTitle)).toBeNull();
    expect(view.queryByLabelText(copy.planNoticeCta)).toBeNull();
  });

  it('appears with a way to reach the plan screen', async () => {
    const onOpenPlan = jest.fn();
    const view = await render(
      <LocationsBranchesScreen planBlocked onOpenPlan={onOpenPlan} />,
    );

    expect(view.getByText(copy.planNoticeTitle)).toBeTruthy();
    expect(view.getByText(copy.planNoticeBody)).toBeTruthy();

    fireEvent.press(view.getByLabelText(copy.planNoticeCta));
    expect(onOpenPlan).toHaveBeenCalledTimes(1);
  });

  it('can be dismissed', async () => {
    const onDismissPlanNotice = jest.fn();
    const view = await render(
      <LocationsBranchesScreen planBlocked onDismissPlanNotice={onDismissPlanNotice} />,
    );

    fireEvent.press(view.getByLabelText(copy.dismissPlanNotice));
    await waitFor(() => expect(onDismissPlanNotice).toHaveBeenCalledTimes(1));
  });

  it('leaves the rest of the page usable while it is shown', async () => {
    const onAddLocation = jest.fn();
    const onViewDetails = jest.fn();
    const view = await render(
      <LocationsBranchesScreen
        planBlocked
        onAddLocation={onAddLocation}
        onViewDetails={onViewDetails}
      />,
    );

    // The plan blocks *adding* a location; it must not block the locations that
    // already exist or the rest of the screen.
    fireEvent.press(view.getByLabelText(copy.addLocation));
    expect(onAddLocation).toHaveBeenCalledTimes(1);

    fireEvent.press(view.getAllByText(copy.viewDetails)[0]);
    expect(onViewDetails).toHaveBeenCalledWith('wuse');
  });
});
