import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import {
  BusinessEditProfileScreen,
  type BusinessProfileFormValue,
} from '@features/business/screens/BusinessEditProfileScreen';
import { BusinessProfilePreviewScreen } from '@features/business/screens/BusinessProfilePreviewScreen';

const copy = strings.businessEditProfile;

const saved: BusinessProfileFormValue = {
  name: 'Aurora Grill',
  about: 'Smoky jollof in Jabi.',
  phone: '+234 800 000 0000',
  whatsappNumber: '',
  officialEmail: 'hello@aurora.test',
  website: 'aurora.test',
  address: '12 Jabi Lake Road',
  instagram: '@aurora',
  facebook: '',
  tiktok: '',
  x: '',
};

jest.mock('@api/businessDashboardApi', () => ({
  businessDashboardApi: {
    updateMyBusiness: jest.fn(async () => undefined),
    getMyBusiness: jest.fn(async () => ({ id: 'biz-1', name: 'Aurora Grill' })),
  },
}));

describe('edit business profile', () => {
  it('starts from the saved profile and saves the edited values', async () => {
    const onSave = jest.fn();
    const view = await render(
      <BusinessEditProfileScreen initialValue={saved} onSave={onSave} />,
    );
    expect(view.getByDisplayValue('Aurora Grill')).toBeTruthy();
    expect(view.getByDisplayValue('@aurora')).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(view.getByLabelText(copy.aboutLabel), 'New menu weekly.');
    });
    await act(async () => {
      fireEvent.press(view.getByText(copy.save));
    });
    expect(onSave).toHaveBeenCalledWith({ ...saved, about: 'New menu weekly.' });
  });

  it('blocks a save without a name or with a bad email, and says why', async () => {
    const onSave = jest.fn();
    const view = await render(
      <BusinessEditProfileScreen initialValue={saved} onSave={onSave} />,
    );

    await act(async () => {
      fireEvent.changeText(view.getByLabelText(copy.nameLabel), '  ');
    });
    await act(async () => {
      fireEvent.press(view.getByText(copy.save));
    });
    expect(onSave).not.toHaveBeenCalled();
    expect(view.getByText(copy.nameRequired)).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(view.getByLabelText(copy.nameLabel), 'Aurora Grill');
      fireEvent.changeText(view.getByLabelText(copy.emailLabel), 'not-an-email');
    });
    await act(async () => {
      fireEvent.press(view.getByText(copy.save));
    });
    expect(onSave).not.toHaveBeenCalled();
    expect(view.getByText(copy.emailInvalid)).toBeTruthy();
  });

  it('changes the logo and banner, and shows the upload in progress', async () => {
    const onChangeImage = jest.fn();
    const view = await render(
      <BusinessEditProfileScreen
        initialValue={saved}
        onSave={jest.fn()}
        onChangeImage={onChangeImage}
      />,
    );
    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.changeCover));
    });
    await act(async () => {
      fireEvent.press(view.getByText(copy.changeLogo));
    });
    expect(onChangeImage.mock.calls).toEqual([['cover'], ['logo']]);

    await view.rerender(
      <BusinessEditProfileScreen
        initialValue={saved}
        onSave={jest.fn()}
        uploading="cover"
      />,
    );
    expect(view.getAllByText(copy.uploading).length).toBeGreaterThan(0);
  });
});

describe('business profile actions', () => {
  it('opens the editor and storefront, and uploads from the cover and logo', async () => {
    const handlers = {
      onEditProfile: jest.fn(),
      onPublicPreview: jest.fn(),
      onChangeCover: jest.fn(),
      onEditAvatar: jest.fn(),
    };
    const view = await render(<BusinessProfilePreviewScreen {...handlers} />);
    const preview = strings.businessProfilePreview;

    // The old "Locations Detail" title and the dead "more" button are gone.
    expect(view.getByText(preview.headerTitle)).toBeTruthy();
    expect(view.queryByText('Locations Detail')).toBeNull();

    await act(async () => {
      fireEvent.press(view.getByText(preview.editProfile));
    });
    await act(async () => {
      fireEvent.press(view.getByLabelText(preview.publicPreview));
    });
    await act(async () => {
      fireEvent.press(view.getByLabelText(preview.changeCover));
    });
    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.changeLogo));
    });
    expect(handlers.onEditProfile).toHaveBeenCalled();
    expect(handlers.onPublicPreview).toHaveBeenCalled();
    expect(handlers.onChangeCover).toHaveBeenCalled();
    expect(handlers.onEditAvatar).toHaveBeenCalled();
  });
});
