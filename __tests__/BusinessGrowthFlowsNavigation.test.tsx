import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import { strings } from '@constants/strings';

const copy = strings.campaignWizard;
const boost = strings.boostWizard;
const more = strings.businessMore;

afterEach(cleanup);

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
    await openMoreTab();
    // More → Marketing & Growth (the growth hub) → Boost sub-tab → Boost engine.
    await pressMoreRow('boost');
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Boost'));
    });
    await act(async () => {
      fireEvent.press(screen.getByText(/^Launch Boost Campaign/));
    });

    expect(screen.getByText(boost.goalStep.assetName)).toBeTruthy();
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
    await openMoreTab();
    await pressMoreRow('boost');
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Boost'));
    });
    await act(async () => {
      fireEvent.press(screen.getByText(/^Launch Boost Campaign/));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText(boost.goalStep.cta));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText(boost.budgetStep.cta));
    });
    expect(screen.getByText(boost.preview.totalValue)).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(boost.preview.openWallet));
    });
    expect(screen.getByText(boost.wallet.balance)).toBeTruthy();
  });
});
