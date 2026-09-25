import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { BusinessIntroductionScreen } from '@features/business/screens/BusinessIntroductionScreen';
import { BusinessProfileBasicInfoScreen } from '@features/business/screens/BusinessProfileBasicInfoScreen';
import { BusinessProfileBrandingScreen } from '@features/business/screens/BusinessProfileBrandingScreen';
import { BusinessProfileContactChannelsScreen } from '@features/business/screens/BusinessProfileContactChannelsScreen';
import { WhereIsYourBusinessLocatedScreen } from '@features/business/screens/WhereIsYourBusinessLocatedScreen';
import { BusinessLocationsMultiBranchScreen } from '@features/business/screens/BusinessLocationsMultiBranchScreen';
import { AddBranchLocationScreen } from '@features/business/screens/AddBranchLocationScreen';
import { AddProductsOrServicesScreen } from '@features/business/screens/AddProductsOrServicesScreen';
import {
  businessProfileCopy,
  businessLocationCopy,
} from '@features/business/businessCopy';

describe('business intro, profile and location screens', () => {
  it('renders the business introduction pillars and audience estimator', async () => {
    const onSetUp = jest.fn();
    const view = await render(<BusinessIntroductionScreen onSetUpBusiness={onSetUp} />);

    expect(view.getByText('1.5 km radius')).toBeTruthy();
    expect(view.getByText('High Density')).toBeTruthy();
    expect(view.getByText('Get Discovered Locally')).toBeTruthy();
    expect(view.getByText('Live Business Insights')).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText('Set Up My Business'));
    });
    expect(onSetUp).toHaveBeenCalledTimes(1);
  });

  it('renders the basic information step with live preview', async () => {
    const onContinue = jest.fn();
    const view = await render(<BusinessProfileBasicInfoScreen onContinue={onContinue} />);

    expect(view.getByText(businessProfileCopy.basicInfo.title)).toBeTruthy();
    expect(view.getByText('2 / 2 selected')).toBeTruthy();
    expect(view.getByText('Grill & Steakhouse • Bistro & Cafe')).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText('Continue to Branding'));
    });
    expect(onContinue).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Urban Grill & Bistro' }),
    );
  });

  it('renders the branding step with cover and gallery slots', async () => {
    const view = await render(<BusinessProfileBrandingScreen />);

    expect(view.getByText(businessProfileCopy.branding.title)).toBeTruthy();
    expect(view.getByText('2 / 5')).toBeTruthy();
    expect(view.getByText('1200 × 675px')).toBeTruthy();
    expect(view.getByText('Continue to Contact & Channels')).toBeTruthy();
  });

  it('renders the contact channels step with presence rows', async () => {
    const view = await render(<BusinessProfileContactChannelsScreen />);

    expect(view.getByText(businessProfileCopy.contactChannels.title)).toBeTruthy();
    expect(view.getByText('@urbangrill_lagos')).toBeTruthy();
    expect(view.getByText('wa.me/2348035559821')).toBeTruthy();
    expect(view.getByText('Complete Profile Setup')).toBeTruthy();
  });

  it('renders the location pin screen with resolved territory', async () => {
    const onContinue = jest.fn();
    const view = await render(
      <WhereIsYourBusinessLocatedScreen onContinue={onContinue} />,
    );

    expect(view.getByText(businessLocationCopy.whereLocated.title)).toBeTruthy();
    expect(view.getByText('Wuse Commercial Hub Cluster #04')).toBeTruthy();
    expect(view.getByText('Wuse 2')).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText('Continue to Branch Details'));
    });
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('renders the multi-branch list and collapses to the primary branch', async () => {
    const view = await render(<BusinessLocationsMultiBranchScreen />);

    expect(view.getByText(businessLocationCopy.locations.title)).toBeTruthy();
    expect(view.getByText('1 — Wuse Branch')).toBeTruthy();
    expect(view.getByText('2 — Garki Branch')).toBeTruthy();

    await act(async () => {
      fireEvent(
        view.getByLabelText(businessLocationCopy.locations.multiLabel),
        'valueChange',
        false,
      );
    });
    expect(view.queryByText('2 — Garki Branch')).toBeNull();
  });

  it('renders the add branch form with inherited identity and lead fields', async () => {
    const onSave = jest.fn();
    const view = await render(<AddBranchLocationScreen onSave={onSave} />);

    expect(view.getByText(businessLocationCopy.addBranch.inheritTitle)).toBeTruthy();
    expect(view.getByDisplayValue('Garki District Flagship')).toBeTruthy();
    expect(view.getByText('9.0348° N, 7.4891° E')).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText('Save & Add Branch Location'));
    });
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Garki District Flagship' }),
    );
  });

  it('renders the catalog step and removes an item', async () => {
    const view = await render(<AddProductsOrServicesScreen />);

    expect(view.getByText('Woodfire Aged Ribeye Steak')).toBeTruthy();
    expect(view.getByText('Executive Table Reservation & Tasting')).toBeTruthy();
    expect(view.getByLabelText('Filter')).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText('Remove Artisanal Prime Truffle Burger'));
    });
    expect(view.queryByText('Artisanal Prime Truffle Burger')).toBeNull();
  });
});
