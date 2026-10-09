import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
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
    // Nothing is pre-selected: the old defaults were invented categories with no
    // counterpart in the API taxonomy, so they could never have been submitted.
    expect(
      view.getByText(businessProfileCopy.basicInfo.categoryPlaceholder),
    ).toBeTruthy();
    expect(view.getByText(businessProfileCopy.basicInfo.categoryFirst)).toBeTruthy();
    expect(
      view.getByText(businessProfileCopy.basicInfo.previewEmptySubtitle),
    ).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText('Continue to Branding'));
    });
    // No category selected yet: the step must block and explain why rather than
    // submit a profile the API would reject (a real taxonomy id is required).
    expect(onContinue).not.toHaveBeenCalled();
    expect(view.getByText(businessProfileCopy.basicInfo.categoryRequired)).toBeTruthy();
  });

  it('opens the alphabet keyboard for the business name field', async () => {
    const view = await render(<BusinessProfileBasicInfoScreen onContinue={jest.fn()} />);

    // `FieldInput` renders `BusinessNumberInput`, whose own default is
    // `numeric`. Passing `undefined` through used to let that default win, so
    // "Business Name" raised a number pad.
    expect(
      view.getByLabelText(businessProfileCopy.basicInfo.nameLabel).props.keyboardType,
    ).toBe('default');
    expect(
      view.getByLabelText(businessProfileCopy.basicInfo.descriptionLabel).props
        .keyboardType,
    ).toBe('default');
  });

  it('renders the branding step with cover and gallery slots', async () => {
    const view = await render(<BusinessProfileBrandingScreen />);

    expect(view.getByText(businessProfileCopy.branding.title)).toBeTruthy();
    expect(view.getByText('2 / 5')).toBeTruthy();
    expect(view.getByText('1200 × 675px')).toBeTruthy();
    expect(view.getByText('Continue to Contact & Channels')).toBeTruthy();
  });

  it('opens the photo library for logo, cover and gallery uploads', async () => {
    const picker = ImagePicker.launchImageLibraryAsync as jest.Mock;
    picker.mockClear();
    const view = await render(<BusinessProfileBrandingScreen />);

    await act(async () => {
      fireEvent.press(view.getByLabelText(businessProfileCopy.branding.logoChange));
    });
    expect(picker).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(view.getByLabelText(businessProfileCopy.branding.coverReplace));
    });
    expect(picker).toHaveBeenCalledTimes(2);

    await act(async () => {
      fireEvent.press(view.getByLabelText(businessProfileCopy.branding.galleryAdd));
    });
    expect(picker).toHaveBeenCalledTimes(3);
  });

  it('mirrors the draft name, category and specialties in the live preview', async () => {
    const view = await render(
      <BusinessProfileBrandingScreen
        businessName="Ada's Kitchen"
        categoryName="Food & Beverage"
        specialties={['Fine Dining']}
      />,
    );

    expect(view.getByText("Ada's Kitchen")).toBeTruthy();
    expect(view.getByText('Food & Beverage • Fine Dining • 0.3 mi away')).toBeTruthy();
  });

  it('falls back to the placeholder preview identity when the draft is empty', async () => {
    const view = await render(<BusinessProfileBrandingScreen />);

    expect(view.getByText(businessProfileCopy.branding.previewName)).toBeTruthy();
    expect(view.getByText(businessProfileCopy.branding.previewMeta)).toBeTruthy();
  });

  it('shows the picked cover and logo in the live preview', async () => {
    const picker = ImagePicker.launchImageLibraryAsync as jest.Mock;
    picker
      .mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: 'file://picked-cover.jpg' }],
      })
      .mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: 'file://picked-logo.jpg' }],
      });

    const view = await render(
      <BusinessProfileBrandingScreen businessName="Ada's Kitchen" />,
    );

    await act(async () => {
      fireEvent.press(view.getByLabelText(businessProfileCopy.branding.coverReplace));
    });
    expect(
      view.getByLabelText(businessProfileCopy.branding.previewTitle).props.source,
    ).toEqual({ uri: 'file://picked-cover.jpg' });

    await act(async () => {
      fireEvent.press(view.getByLabelText(businessProfileCopy.branding.logoChange));
    });
    expect(view.getByLabelText("Ada's Kitchen logo").props.source).toEqual({
      uri: 'file://picked-logo.jpg',
    });
  });

  it('restores picked media from the draft when the step is revisited', async () => {
    const view = await render(
      <BusinessProfileBrandingScreen
        initialValue={{
          coverUri: 'file://saved-cover.jpg',
          logoUri: 'file://saved-logo.jpg',
        }}
      />,
    );

    expect(
      view.getByLabelText(businessProfileCopy.branding.previewTitle).props.source,
    ).toEqual({ uri: 'file://saved-cover.jpg' });
    expect(
      view.getByLabelText(`${businessProfileCopy.branding.previewName} logo`).props
        .source,
    ).toEqual({ uri: 'file://saved-logo.jpg' });
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

  it('blocks Basic Info with an empty name and names the requirement', async () => {
    const onContinue = jest.fn();
    const view = await render(<BusinessProfileBasicInfoScreen onContinue={onContinue} />);

    await act(async () => {
      fireEvent.changeText(
        view.getByLabelText(businessProfileCopy.basicInfo.nameLabel),
        '   ',
      );
    });
    await act(async () => {
      fireEvent.press(view.getByText('Continue to Branding'));
    });

    expect(onContinue).not.toHaveBeenCalled();
    expect(view.getByText(businessProfileCopy.basicInfo.nameRequired)).toBeTruthy();
  });

  it('blocks Contact Channels on an invalid email and names the requirement', async () => {
    const onComplete = jest.fn();
    const view = await render(
      <BusinessProfileContactChannelsScreen onComplete={onComplete} />,
    );

    await act(async () => {
      fireEvent.changeText(
        view.getByLabelText(businessProfileCopy.contactChannels.emailLabel),
        'not-an-email',
      );
    });
    await act(async () => {
      fireEvent.press(view.getByText(businessProfileCopy.contactChannels.complete));
    });

    expect(onComplete).not.toHaveBeenCalled();
    expect(
      view.getByText(businessProfileCopy.contactChannels.emailRequired),
    ).toBeTruthy();
  });

  it('blocks Contact Channels with a missing phone number', async () => {
    const onComplete = jest.fn();
    const view = await render(
      <BusinessProfileContactChannelsScreen onComplete={onComplete} />,
    );

    await act(async () => {
      // `getByDisplayValue` targets the TextInput; the country-prefix control
      // shares the field's accessibility label.
      fireEvent.changeText(view.getByDisplayValue('803 555 9821'), '');
    });
    await act(async () => {
      fireEvent.press(view.getByText(businessProfileCopy.contactChannels.complete));
    });

    expect(onComplete).not.toHaveBeenCalled();
    expect(
      view.getByText(businessProfileCopy.contactChannels.phoneRequired),
    ).toBeTruthy();
  });

  it('re-enables the Contact CTA as soon as the last field is valid, without blurring', async () => {
    const onComplete = jest.fn();
    const view = await render(
      <BusinessProfileContactChannelsScreen onComplete={onComplete} />,
    );
    const cta = () => view.getByLabelText(businessProfileCopy.contactChannels.complete);

    await act(async () => {
      fireEvent.changeText(view.getByDisplayValue('hello@urbangrill.ng'), '');
    });
    expect(cta().props.accessibilityState.disabled).toBe(true);
    expect(
      view.getByText(businessProfileCopy.contactChannels.emailRequired),
    ).toBeTruthy();

    // Type the replacement into the still-focused field; no blur/click-out.
    await act(async () => {
      fireEvent.changeText(
        view.getByLabelText(businessProfileCopy.contactChannels.emailLabel),
        'owner@newbiz.ng',
      );
    });

    expect(
      view.queryByText(businessProfileCopy.contactChannels.emailRequired),
    ).toBeNull();
    expect(cta().props.accessibilityState.disabled).toBe(false);

    await act(async () => {
      fireEvent.press(cta());
    });
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'owner@newbiz.ng' }),
    );
  });

  it('re-enables the Location CTA as soon as an address is typed, without blurring', async () => {
    const onContinue = jest.fn();
    const view = await render(
      <WhereIsYourBusinessLocatedScreen onContinue={onContinue} />,
    );
    const cta = () => view.getByLabelText(businessLocationCopy.whereLocated.continue);

    await act(async () => {
      fireEvent.changeText(
        view.getByLabelText(businessLocationCopy.whereLocated.searchPlaceholder),
        '',
      );
      fireEvent.changeText(
        view.getByLabelText(businessLocationCopy.whereLocated.streetLabel),
        '',
      );
      fireEvent.changeText(
        view.getByLabelText(businessLocationCopy.whereLocated.landmarkLabel),
        '',
      );
    });
    expect(cta().props.accessibilityState.disabled).toBe(true);
    expect(
      view.getByText(businessLocationCopy.whereLocated.addressRequired),
    ).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(
        view.getByLabelText(businessLocationCopy.whereLocated.streetLabel),
        '12 Ademola Way',
      );
    });

    expect(
      view.queryByText(businessLocationCopy.whereLocated.addressRequired),
    ).toBeNull();
    expect(cta().props.accessibilityState.disabled).toBe(false);

    await act(async () => {
      fireEvent.press(cta());
    });
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('blocks Location when every editable address field is empty', async () => {
    const onContinue = jest.fn();
    const view = await render(
      <WhereIsYourBusinessLocatedScreen onContinue={onContinue} />,
    );

    await act(async () => {
      fireEvent.changeText(
        view.getByLabelText(businessLocationCopy.whereLocated.searchPlaceholder),
        '',
      );
      fireEvent.changeText(
        view.getByLabelText(businessLocationCopy.whereLocated.streetLabel),
        '',
      );
      fireEvent.changeText(
        view.getByLabelText(businessLocationCopy.whereLocated.landmarkLabel),
        '',
      );
    });
    await act(async () => {
      fireEvent.press(view.getByText(businessLocationCopy.whereLocated.continue));
    });

    expect(onContinue).not.toHaveBeenCalled();
    expect(
      view.getByText(businessLocationCopy.whereLocated.addressRequired),
    ).toBeTruthy();
  });
});
