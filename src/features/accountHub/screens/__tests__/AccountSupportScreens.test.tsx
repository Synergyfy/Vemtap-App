import React from 'react';
import { Linking } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { SavedHubScreen } from '@features/accountHub/screens/SavedHubScreen';
import { NotificationsCenterScreen } from '@features/accountHub/screens/NotificationsCenterScreen';
import { AccountSettingsSecurityScreen } from '@features/accountHub/screens/AccountSettingsSecurityScreen';
import { SavingsHistoryScreen } from '@features/accountHub/screens/SavingsHistoryScreen';
import { strings } from '@constants/strings';
import { useSavingsLedger } from '@features/accountHub/hooks/useSavings';

jest.mock('@features/accountHub/hooks/useSavedHub', () =>
  jest
    .requireActual('../../../../../__tests__/helpers/mockCustomerHub')
    .mockSavedHubModule(),
);
jest.mock('@features/accountHub/hooks/useSavings', () =>
  jest
    .requireActual('../../../../../__tests__/helpers/mockCustomerHub')
    .mockSavingsModule(),
);
jest.mock('@features/accountHub/hooks/useLoyalty', () =>
  jest
    .requireActual('../../../../../__tests__/helpers/mockCustomerHub')
    .mockLoyaltyModule(),
);

const { savingsFixtures } = jest.requireActual(
  '../../../../../__tests__/helpers/mockCustomerHub',
) as typeof import('../../../../../__tests__/helpers/mockCustomerHub');

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

  it('renders the savings hero, category split and ledger from the API', async () => {
    const view = await render(<SavingsHistoryScreen />);
    const { savings } = strings.accountScreens;

    expect(view.getByText(savings.audited)).toBeTruthy();
    expect(view.getByText(savings.exportStatement)).toBeTruthy();
    expect(view.getByText(savings.lifetimeLabel)).toBeTruthy();
    expect(view.getByText(savings.dealsRedeemedLabel)).toBeTruthy();
    expect(view.getByText(savings.avgDiscountLabel)).toBeTruthy();
    expect(view.getByText(savings.pointsLabel)).toBeTruthy();
    // Ledger reports 1 record worth ₦1,500 at 15% off.
    expect(view.getByText(savings.ledgerCount(1))).toBeTruthy();
    expect(view.getByText(savings.categoryCount(1))).toBeTruthy();
    expect(view.getByText(savingsFixtures.entry.merchantName)).toBeTruthy();
    expect(view.getByText(savingsFixtures.entry.offerName)).toBeTruthy();
    expect(view.getByText(savingsFixtures.category.name)).toBeTruthy();
    expect(view.getByText(savings.integrityTitle)).toBeTruthy();
    expect(view.getByText(savings.downloadLabel)).toBeTruthy();
    expect(view.getByText(savings.disputePrompt)).toBeTruthy();
  });

  it('hides the growth pill when the previous period has no baseline', async () => {
    const view = await render(<SavingsHistoryScreen />);
    const { savings } = strings.accountScreens;

    // The analytics fixture reports percent: null, so no growth chip renders.
    expect(view.queryByText(savings.growthPill(18))).toBeNull();
  });

  it('re-queries the ledger when the timeframe chip changes', async () => {
    const view = await render(<SavingsHistoryScreen />);
    const { savings } = strings.accountScreens;

    expect(useSavingsLedger).toHaveBeenLastCalledWith(30);

    await act(async () => {
      fireEvent.press(view.getByText(savings.timeframes[2]));
    });
    expect(useSavingsLedger).toHaveBeenLastCalledWith(undefined);

    await act(async () => {
      fireEvent.press(view.getByText(savings.timeframes[1]));
    });
    expect(useSavingsLedger).toHaveBeenLastCalledWith(90);
  });

  it('runs the export feedback while the CSV statement opens', async () => {
    jest.useFakeTimers();
    const onExport = jest.fn();
    // The export opens a CSV attachment; hold it open so the intermediate
    // "preparing" state is observable instead of flashing past.
    let resolveOpen: (() => void) | undefined;
    const openSpy = jest.spyOn(Linking, 'openURL').mockImplementation(
      () =>
        new Promise<void>(resolve => {
          resolveOpen = resolve;
        }),
    );
    const view = await render(<SavingsHistoryScreen onExport={onExport} />);
    const { savings } = strings.accountScreens;

    await act(async () => {
      fireEvent.press(view.getByLabelText(savings.exportStatement));
    });
    expect(onExport).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenCalledWith(expect.stringContaining('/me/savings/export'));
    expect(view.getByText(savings.preparingLabel)).toBeTruthy();

    await act(async () => {
      resolveOpen?.();
    });
    expect(view.getByText(savings.downloadedLabel)).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(view.getByText(savings.downloadLabel)).toBeTruthy();
    openSpy.mockRestore();
    jest.useRealTimers();
  });

  it('returns the export button to idle when the statement cannot open', async () => {
    jest.useFakeTimers();
    const openSpy = jest
      .spyOn(Linking, 'openURL')
      .mockRejectedValue(new Error('no browser'));
    const view = await render(<SavingsHistoryScreen />);
    const { savings } = strings.accountScreens;

    await act(async () => {
      fireEvent.press(view.getByLabelText(savings.exportStatement));
    });
    expect(view.getByText(savings.downloadLabel)).toBeTruthy();
    openSpy.mockRestore();
    jest.useRealTimers();
  });
});
