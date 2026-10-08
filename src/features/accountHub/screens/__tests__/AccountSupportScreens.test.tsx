import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { SavedHubScreen } from '@features/accountHub/screens/SavedHubScreen';
import { NotificationsCenterScreen } from '@features/accountHub/screens/NotificationsCenterScreen';
import { AccountSettingsSecurityScreen } from '@features/accountHub/screens/AccountSettingsSecurityScreen';
import { SavingsHistoryScreen } from '@features/accountHub/screens/SavingsHistoryScreen';
import { strings } from '@constants/strings';

jest.mock('@features/accountHub/hooks/useSavedHub', () =>
  jest
    .requireActual('../../../../../__tests__/helpers/mockCustomerHub')
    .mockSavedHubModule(),
);

describe('standalone account support screens', () => {
  it('renders the saved hub', async () => {
    const view = await render(<SavedHubScreen />);
    const { savedHub } = strings;
    expect(view.getByText(savedHub.title)).toBeTruthy();
    expect(view.getByText(savedHub.filters[1].label)).toBeTruthy();
  });

  it('renders the notifications center', async () => {
    const view = await render(<NotificationsCenterScreen />);
    const { notificationsCenter } = strings;
    expect(view.getByText(notificationsCenter.title)).toBeTruthy();
    expect(view.getByText(notificationsCenter.inbox)).toBeTruthy();
  });

  it('renders account settings and security', async () => {
    const view = await render(<AccountSettingsSecurityScreen />);
    const { accountSettingsSecurity } = strings;
    expect(view.getByText(accountSettingsSecurity.title)).toBeTruthy();
    expect(view.getByText(accountSettingsSecurity.protected)).toBeTruthy();
  });

  it('renders the savings hero, category split and ledger entries', async () => {
    const view = await render(<SavingsHistoryScreen />);
    const { savings } = strings.accountScreens;

    expect(view.getByText(savings.audited)).toBeTruthy();
    expect(view.getByText(savings.exportStatement)).toBeTruthy();
    expect(view.getByText(savings.lifetimeLabel)).toBeTruthy();
    expect(view.getByText('₦48,500')).toBeTruthy();
    expect(view.getByText(savings.growthPill)).toBeTruthy();
    expect(view.getByText('Deals Redeemed')).toBeTruthy();
    expect(view.getByText('Avg Discount')).toBeTruthy();
    expect(view.getByText('VEM Points')).toBeTruthy();
    expect(view.getByText(savings.categoryTitle)).toBeTruthy();
    expect(view.getByText('Food & Dining')).toBeTruthy();
    expect(view.getByText('Wellness & Beauty')).toBeTruthy();
    expect(view.getByText('Fashion & Retail')).toBeTruthy();
    expect(view.getByText(savings.categoryTitle)).toBeTruthy();
    expect(view.getByText(savings.ledgerTitle)).toBeTruthy();
    expect(view.getByText(savings.ledgerCount)).toBeTruthy();
    savings.entries.forEach(entry => {
      expect(view.getByText(entry.merchant)).toBeTruthy();
      expect(view.getByText(`${savings.savedPrefix} ${entry.saved}`)).toBeTruthy();
      expect(view.getByText(`Paid ${entry.paid}`)).toBeTruthy();
    });
    expect(view.getByText(savings.integrityTitle)).toBeTruthy();
    expect(view.getByText(savings.downloadLabel)).toBeTruthy();
    expect(view.getByText(savings.disputePrompt)).toBeTruthy();
  });

  it('switches the lifetime total with the timeframe selector', async () => {
    const view = await render(<SavingsHistoryScreen />);
    const { savings } = strings.accountScreens;

    await act(async () => {
      fireEvent.press(view.getByText(savings.timeframes[2]));
    });
    expect(view.getByText(savings.lifetimeTotals[2])).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText(savings.timeframes[1]));
    });
    expect(view.getByText(savings.lifetimeTotals[1])).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText(savings.timeframes[0]));
    });
    expect(view.getByText(savings.lifetimeTotals[0])).toBeTruthy();
  });

  it('runs the export feedback from the pill and the primary action', async () => {
    jest.useFakeTimers();
    const onExport = jest.fn();
    const view = await render(<SavingsHistoryScreen onExport={onExport} />);
    const { savings } = strings.accountScreens;

    await act(async () => {
      fireEvent.press(view.getByLabelText(savings.exportStatement));
    });
    expect(onExport).toHaveBeenCalledTimes(1);
    expect(view.getByText(savings.preparingLabel)).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(1200);
    });
    expect(view.getByText(savings.downloadedLabel)).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(view.getByText(savings.downloadLabel)).toBeTruthy();
    jest.useRealTimers();
  });
});
