import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import { strings } from '@constants/strings';
import { boostsApi } from '@api/boostsApi';
import { adWalletApi } from '@api/adWalletApi';

const copy = strings.campaignWizard;
const boost = strings.boostWizard;
const more = strings.businessMore;

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

/** The live boost screens need something to boost and a wallet to pay from. */
function mockBoostApis() {
  jest.spyOn(boostsApi, 'eligibleAssets').mockResolvedValue([
    {
      type: 'deal',
      id: 'deal-1',
      title: 'Jollof Combo',
      image: null,
      price: 4000,
      wasPrice: 5000,
      priorClaims: 12,
    },
  ]);
  jest.spyOn(adWalletApi, 'getWallet').mockResolvedValue({
    walletRef: 'VEM-WAL-ABC123',
    balance: 12_000,
    reserved: 0,
    spendable: 12_000,
  });
}

async function settle() {
  await act(async () => {
    await new Promise<void>(resolve => {
      setTimeout(resolve, 50);
    });
  });
}

/** Mount the business shell and land on the More tab. */
async function openMoreTab() {
  await render(
    <NavigationContainer>
      <BusinessTabNavigator />
    </NavigationContainer>,
  );
  await act(async () => {
    fireEvent.press(screen.getByLabelText(strings.businessShell.tabs.more));
  });
}

/** The accessible label the More hub puts on a given row. */
function moreRowLabel(id: string): string {
  const section = more.sections.find(entry => entry.items.some(item => item.id === id));
  const item = section?.items.find(entry => entry.id === id);
  if (!item) throw new Error(`No More-hub row with id "${id}"`);
  return item.label;
}

/** Press a More-hub row by id and settle the transition. */
async function pressMoreRow(id: string) {
  await act(async () => {
    fireEvent.press(screen.getByLabelText(moreRowLabel(id)));
  });
}

describe('VEMTAP Intelligence navigation', () => {
  it('walks the shared analytics strip across surfaces', async () => {
    await openMoreTab();
    await pressMoreRow('intelligence');

    expect(
      screen.getByText(strings.businessIntelligence.business.revenueLabel),
    ).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Customers'));
    });
    expect(screen.getByText(strings.businessIntelligence.customers.title)).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Locations'));
    });
    expect(
      screen.getByText(strings.businessIntelligence.locations.networkValue),
    ).toBeTruthy();
  });

  it('keeps the shell tab bar as the only bottom navigation', async () => {
    await openMoreTab();
    await pressMoreRow('intelligence');
    expect(screen.getByLabelText(strings.businessShell.tabs.overview)).toBeTruthy();
    expect(screen.getByLabelText(strings.businessShell.tabs.more)).toBeTruthy();
  });
});

describe('boost wizard navigation', () => {
  it('reaches step 1 from the growth hub and advances to budget', async () => {
    mockBoostApis();
    await openMoreTab();
    // More → Marketing & Growth (the growth hub) → Boost sub-tab → Boost engine.
    await pressMoreRow('boost');
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Boost'));
    });
    await settle();
    await act(async () => {
      fireEvent.press(screen.getByText(/^Launch Boost Campaign/));
    });

    // The live goal step shows the business's own deal, not the sample.
    expect(screen.getAllByText('Jollof Combo').length).toBeGreaterThan(0);
    await act(async () => {
      fireEvent.press(screen.getByLabelText(boost.goalStep.cta));
    });
    expect(screen.getByText(boost.budgetStep.forecastTitle)).toBeTruthy();
  });
});

describe('create campaign wizard navigation', () => {
  it('advances step 1 → step 2 carrying the chosen objective', async () => {
    await openMoreTab();
    await pressMoreRow('boost');
    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.campaignsHub.createCta));
    });

    expect(screen.getByText(copy.step1.hero)).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(copy.step1.objectives[2].title));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText(copy.step1.cta));
    });
    expect(screen.getByText(copy.step2.hero)).toBeTruthy();
  });
});

describe('segment navigation', () => {
  it('opens the create-segment page from the segments hub', async () => {
    await openMoreTab();
    await pressMoreRow('boost');
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Segments'));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.customerSegments.newSegmentCta));
    });
    expect(screen.getAllByText(copy.customSegment.hero).length).toBeGreaterThan(0);
    expect(screen.getByText(copy.customSegment.sectionOne)).toBeTruthy();
  });
});

describe('boost wallet reachability', () => {
  it('opens Boost Wallet from the payment method card', async () => {
    mockBoostApis();
    await openMoreTab();
    await pressMoreRow('boost');
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Boost'));
    });
    await settle();
    await act(async () => {
      fireEvent.press(screen.getByText(/^Launch Boost Campaign/));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText(boost.goalStep.cta));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText(boost.budgetStep.cta));
    });
    // ₦5,000/day (Top Pick) x 7 days, carried from the engine.
    expect(screen.getByText('₦35,000')).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(boost.preview.openWallet));
    });
    await settle();
    // Balance and spendable (nothing reserved) both read from the live wallet.
    expect(screen.getByText('Ref: VEM-WAL-ABC123')).toBeTruthy();
    expect(screen.getAllByText('₦12,000')).toHaveLength(2);
    expect(screen.queryByText(boost.wallet.balance)).toBeNull();
  });
});
