import React from 'react';
import { cleanup, render } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { LocationsBranchesScreen } from '@features/business/screens/LocationsBranchesScreen';

/**
 * Coverage for the operating-view scope trigger on the locations screen.
 *
 * Scope note: this asserts what the trigger *shows*, not that the flyout opens.
 * Driving `BusinessScopePicker`'s flyout open is not currently expressible in
 * this harness — its Pressable renders the same host tree as the working
 * `Switch`/`View Details` Pressables on the same screen, but `fireEvent.press`
 * does not toggle it, and no other suite drives it either. Adding a
 * workaround here would test the workaround, not the component.
 *
 * The stacking fix itself is likewise not asserted: NativeWind's `className`
 * does not resolve to `style` under this Jest preset, so a rendered-style
 * assertion would pass vacuously. See the comment on the toolbar row in
 * `LocationsBranchesScreen.tsx` — that one is verified on device.
 */

afterEach(cleanup);

const copy = strings.locationsBranches;

describe('operating-view scope trigger', () => {
  it('shows the active branch as the current scope', async () => {
    const view = await render(<LocationsBranchesScreen />);

    // The prototype list opens on its first branch, so that is the scope.
    expect(view.getByLabelText(copy.branches[0].name)).toBeTruthy();
  });

  it('shows the live branch name once real data is supplied', async () => {
    const view = await render(
      <LocationsBranchesScreen
        branches={[
          {
            id: 'live-1',
            name: 'Maitama Branch',
            tag: 'Flagship Branch',
            cluster: 'Abuja • FCT',
            address: 'Plot 1 Maitama',
            status: 'Active',
            active: true,
          },
        ]}
      />,
    );

    expect(view.getByLabelText('Maitama Branch')).toBeTruthy();
  });

  it('falls back to the first live branch when the stored scope is gone', async () => {
    // A business whose branches changed since the owner last picked one must
    // not be left pointing at an id that no longer exists — otherwise the
    // trigger would read the raw id instead of a branch name.
    const view = await render(
      <LocationsBranchesScreen
        branches={[
          {
            id: 'live-2',
            name: 'Victoria Island Branch',
            tag: 'Branch',
            cluster: '',
            address: '8B Adeola Odeku Street',
            status: 'Active',
            active: true,
          },
        ]}
      />,
    );

    expect(view.getByLabelText('Victoria Island Branch')).toBeTruthy();
    expect(view.queryByText('wuse')).toBeNull();
  });
});
