import React from 'react';
import { render } from '@testing-library/react-native';
import { SavedHubScreen } from '@features/accountHub/screens/SavedHubScreen';
import { NotificationsCenterScreen } from '@features/accountHub/screens/NotificationsCenterScreen';
import { AccountSettingsSecurityScreen } from '@features/accountHub/screens/AccountSettingsSecurityScreen';
import { strings } from '@constants/strings';

describe('standalone account support screens', () => {
  it('renders the saved hub', async () => {
    const view = await render(<SavedHubScreen />);
    expect(view.getByText(strings.savedHub.title)).toBeTruthy();
    expect(view.getByText(strings.savedHub.dealsTitle)).toBeTruthy();
  });

  it('renders the notifications center', async () => {
    const view = await render(<NotificationsCenterScreen />);
    expect(view.getByText(strings.notificationsCenter.title)).toBeTruthy();
    expect(view.getByText(strings.notificationsCenter.inbox)).toBeTruthy();
  });

  it('renders account settings and security', async () => {
    const view = await render(<AccountSettingsSecurityScreen />);
    expect(view.getByText(strings.accountSettingsSecurity.title)).toBeTruthy();
    expect(view.getByText(strings.accountSettingsSecurity.protected)).toBeTruthy();
  });
});
