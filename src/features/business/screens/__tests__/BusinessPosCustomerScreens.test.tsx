import React from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { strings } from '@constants/strings';
import { PosCustomerLookupActiveScreen } from '@features/business/screens/PosCustomerLookupActiveScreen';
import { PosCustomerLookupListScreen } from '@features/business/screens/PosCustomerLookupListScreen';
import { PosCustomerLookupLoyaltyScreen } from '@features/business/screens/PosCustomerLookupLoyaltyScreen';
import { PosCustomerDossierScreen } from '@features/business/screens/PosCustomerDossierScreen';
import { PosProductsInventoryScreen } from '@features/business/screens/PosProductsInventoryScreen';
import { PosProductShiftStockStatusScreen } from '@features/business/screens/PosProductShiftStockStatusScreen';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import {
  posCustomerCards,
  posCustomerSegments,
  posDossierPerks,
  posDossierVisits,
  posInventoryItems,
  posLoyaltyRewards,
  posShiftAuditLog,
  posStockCountSteps,
} from '@features/business/data/businessPosCustomerData';
import { cartCustomer } from '@features/business/data/businessPosFlowData';

afterEach(cleanup);

/**
 * Press a control and let its resulting render settle before the next
 * interaction. Two back-to-back presses with no flush in between leave React's
 * act queue unbalanced, which poisons every later test in the run.
 */
async function pressAndSettle(view: Awaited<ReturnType<typeof render>>, label: string) {
  fireEvent.press(view.getByLabelText(label));
  await waitFor(() => expect(view.getByLabelText(label)).toBeTruthy());
}

describe('pos customer lookup - active checkout', () => {
  const copy = strings.posCustomerLookupActive;

  it('renders the capture banner, matched patron, stats, perks and note', async () => {
    const view = await render(<PosCustomerLookupActiveScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.nfcTitle)).toBeTruthy();
    expect(view.getByText(copy.nfcCta)).toBeTruthy();
    expect(view.getByText(copy.matchedLabel)).toBeTruthy();
    expect(view.getAllByText(cartCustomer.name).length).toBeGreaterThan(0);
    expect(view.getByText(copy.memberIdValue)).toBeTruthy();
    expect(view.getByText(copy.perksTitle)).toBeTruthy();
    expect(view.getByText(copy.perk1Title)).toBeTruthy();
    expect(view.getByText(copy.perk2Title)).toBeTruthy();
    expect(view.getByText(copy.perk3Title)).toBeTruthy();
    expect(view.getByText(copy.notesBody)).toBeTruthy();
    expect(view.getByText(copy.attachCta)).toBeTruthy();
  });

  it('scans, opens a walk-in profile, applies a perk and attaches', async () => {
    const onScan = jest.fn();
    const onLiveScan = jest.fn();
    const onNewWalkInProfile = jest.fn();
    const onApplyPerk = jest.fn();
    const onAttach = jest.fn();
    const onViewReceipts = jest.fn();
    const onSendWhatsApp = jest.fn();
    const view = await render(
      <PosCustomerLookupActiveScreen
        onScan={onScan}
        onLiveScan={onLiveScan}
        onNewWalkInProfile={onNewWalkInProfile}
        onApplyPerk={onApplyPerk}
        onAttach={onAttach}
        onViewReceipts={onViewReceipts}
        onSendWhatsApp={onSendWhatsApp}
      />,
    );

    await pressAndSettle(view, copy.nfcCta);
    expect(onLiveScan).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.scanCta);
    expect(onScan).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.walkInCta);
    expect(onNewWalkInProfile).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, `${copy.perk1Cta} ${copy.perk1Title}`);
    expect(onApplyPerk).toHaveBeenCalledWith('weekend-prime');

    await pressAndSettle(view, copy.receiptsCta);
    expect(onViewReceipts).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.whatsappCta);
    expect(onSendWhatsApp).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.attachCta);
    expect(onAttach).toHaveBeenCalledTimes(1);
  });
});

describe('pos customer lookup - till list', () => {
  const copy = strings.posCustomerLookupList;

  it('renders the till context, every segment and every patron card', async () => {
    const view = await render(<PosCustomerLookupListScreen />);

    expect(view.getByText(copy.tillStatus)).toBeTruthy();
    expect(view.getByText(copy.tipTitle)).toBeTruthy();
    posCustomerSegments.forEach(segment => {
      expect(view.getAllByLabelText(segment.label).length).toBeGreaterThan(0);
    });
    posCustomerCards.forEach(customer => {
      expect(view.getAllByText(customer.name).length).toBeGreaterThan(0);
      // Phone and email share one line, so match on the number alone.
      expect(
        view.getAllByText(new RegExp(customer.phone.split(' ')[1])).length,
      ).toBeGreaterThan(0);
    });
    // Only the first card is expanded in the design.
    expect(view.getByText('20% Off Weekend Lunch Deal')).toBeTruthy();
    expect(view.getByText(copy.autoApplyBadge)).toBeTruthy();
  });

  it('filters, attaches and opens a dossier', async () => {
    const onSelectSegment = jest.fn();
    const onAttach = jest.fn();
    const onOpenDossier = jest.fn();
    const onNewCustomer = jest.fn();
    const view = await render(
      <PosCustomerLookupListScreen
        onSelectSegment={onSelectSegment}
        onAttach={onAttach}
        onOpenDossier={onOpenDossier}
        onNewCustomer={onNewCustomer}
      />,
    );

    await pressAndSettle(view, posCustomerSegments[1].label);
    expect(onSelectSegment).toHaveBeenCalledWith('vip');

    await pressAndSettle(view, copy.newCta);
    expect(onNewCustomer).toHaveBeenCalledTimes(1);

    await pressAndSettle(
      view,
      copy.attachLabel
        .replace('{action}', posCustomerCards[0].attachCta)
        .replace('{name}', posCustomerCards[0].name),
    );
    expect(onAttach).toHaveBeenCalledWith('michael');

    await pressAndSettle(
      view,
      copy.attachLabel
        .replace('{action}', posCustomerCards[1].dossierCta)
        .replace('{name}', posCustomerCards[1].name),
    );
    expect(onOpenDossier).toHaveBeenCalledWith('sarah');
  });
});

describe('pos customer lookup - loyalty attach', () => {
  const copy = strings.posCustomerLookupLoyalty;

  it('renders the matched pass, balance, stats and rewards', async () => {
    const view = await render(<PosCustomerLookupLoyaltyScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.matchedLabel)).toBeTruthy();
    expect(view.getByText(copy.balanceValue)).toBeTruthy();
    expect(view.getByText(copy.visitsValue)).toBeTruthy();
    expect(view.getByText(copy.statusValue)).toBeTruthy();
    expect(view.getByText(copy.earnedTitle)).toBeTruthy();
    expect(view.getByText(copy.rewardsTitle)).toBeTruthy();
    posLoyaltyRewards.forEach(reward => {
      expect(view.getAllByText(reward.title).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.registerCta)).toBeTruthy();
    expect(view.getByText(copy.attachCta)).toBeTruthy();
  });

  it('redeems a reward, changes customer, registers and continues as guest', async () => {
    const onRedeem = jest.fn();
    const onChangeCustomer = jest.fn();
    const onRegisterCustomer = jest.fn();
    const onContinueAsGuest = jest.fn();
    const onAttach = jest.fn();
    const view = await render(
      <PosCustomerLookupLoyaltyScreen
        onRedeem={onRedeem}
        onChangeCustomer={onChangeCustomer}
        onRegisterCustomer={onRegisterCustomer}
        onContinueAsGuest={onContinueAsGuest}
        onAttach={onAttach}
      />,
    );

    await pressAndSettle(
      view,
      `${posLoyaltyRewards[0].cta} ${posLoyaltyRewards[0].title}`,
    );
    expect(onRedeem).toHaveBeenCalledWith('cash-1000');

    await pressAndSettle(view, copy.changeCta);
    expect(onChangeCustomer).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.registerCta);
    expect(onRegisterCustomer).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.guestCta);
    expect(onContinueAsGuest).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.attachCta);
    expect(onAttach).toHaveBeenCalledTimes(1);
  });
});

describe('pos customer quick dossier', () => {
  const copy = strings.posCustomerDossier;

  it('renders identity, standing figures, perks, notes and recent tickets', async () => {
    const view = await render(<PosCustomerDossierScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getAllByText(cartCustomer.name).length).toBeGreaterThan(0);
    expect(view.getByText(copy.memberRef)).toBeTruthy();
    expect(view.getByText(copy.registerLinkLabel)).toBeTruthy();
    expect(view.getByText(copy.pointsValue)).toBeTruthy();
    expect(view.getByText(copy.spendValue)).toBeTruthy();
    expect(view.getByText(copy.avgValue)).toBeTruthy();
    posDossierPerks.forEach(perk => {
      expect(view.getAllByText(perk.title).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.notesBody)).toBeTruthy();
    posDossierVisits.forEach(visit => {
      expect(view.getAllByText(visit.total).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.crmCta)).toBeTruthy();
  });

  it('applies a perk, opens a visit, attaches to sale and opens CRM', async () => {
    const onApplyPerk = jest.fn();
    const onOpenVisit = jest.fn();
    const onAttachToSale = jest.fn();
    const onOpenCrm = jest.fn();
    const onOpenNotes = jest.fn();
    const view = await render(
      <PosCustomerDossierScreen
        onApplyPerk={onApplyPerk}
        onOpenVisit={onOpenVisit}
        onAttachToSale={onAttachToSale}
        onOpenCrm={onOpenCrm}
        onOpenNotes={onOpenNotes}
      />,
    );

    await pressAndSettle(view, `${posDossierPerks[0].cta} ${posDossierPerks[0].title}`);
    expect(onApplyPerk).toHaveBeenCalledWith('weekend-lunch');

    await pressAndSettle(
      view,
      `${posDossierVisits[0].reference} ${posDossierVisits[0].total}`,
    );
    expect(onOpenVisit).toHaveBeenCalledWith('tk-108');

    await pressAndSettle(view, copy.notesTitle);
    expect(onOpenNotes).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.crmCta);
    expect(onOpenCrm).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.attachCta);
    expect(onAttachToSale).toHaveBeenCalledTimes(1);
  });
});

describe('pos products & catalog inventory', () => {
  const copy = strings.posProductsInventory;

  it('renders the till catalogue, filters, every stock row and the deal card', async () => {
    const view = await render(<PosProductsInventoryScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.branchAvailable)).toBeTruthy();
    [copy.filterAll, copy.filterLow, copy.filterOut, copy.filterDeals].forEach(label => {
      expect(view.getAllByLabelText(label).length).toBeGreaterThan(0);
    });
    posInventoryItems.forEach(item => {
      expect(view.getAllByText(item.name).length).toBeGreaterThan(0);
      expect(view.getAllByText(item.price).length).toBeGreaterThan(0);
    });
    expect(view.getByText('Prime Lunch Combo Deal')).toBeTruthy();
    expect(view.getByText(copy.addCustomCta)).toBeTruthy();
  });

  it('adjusts stock, filters, and gates overrides behind manager authorization', async () => {
    const onAdjustStock = jest.fn();
    const onSelectFilter = jest.fn();
    const onOpenOverride = jest.fn();
    const onAuthorize = jest.fn();
    const onAddCustomItem = jest.fn();
    const view = await render(
      <PosProductsInventoryScreen
        onAdjustStock={onAdjustStock}
        onSelectFilter={onSelectFilter}
        onOpenOverride={onOpenOverride}
        onAuthorize={onAuthorize}
        onAddCustomItem={onAddCustomItem}
      />,
    );

    await pressAndSettle(view, `${posInventoryItems[0].name} increase`);
    expect(onAdjustStock).toHaveBeenCalledWith('wr-0294', 1);

    await pressAndSettle(view, `${posInventoryItems[1].name} decrease`);
    expect(onAdjustStock).toHaveBeenCalledWith('db-1102', -1);

    await pressAndSettle(view, copy.filterLow);
    expect(onSelectFilter).toHaveBeenCalledWith('low');

    await pressAndSettle(view, copy.addCustomCta);
    expect(onAddCustomItem).toHaveBeenCalledTimes(1);

    // Override opens the shared manager-authorization sheet.
    await pressAndSettle(view, `${copy.overrideCta} ${posInventoryItems[0].name}`);
    expect(onOpenOverride).toHaveBeenCalledWith('wr-0294');
    // The sheet heading and the PIN field label share the copy.
    expect(view.getAllByText(copy.authTitle).length).toBeGreaterThan(0);
    expect(view.getByText(copy.authBody)).toBeTruthy();
    await pressAndSettle(view, copy.authCta);
    expect(onAuthorize).toHaveBeenCalledWith('');
  });
});

describe('pos product shift stock status', () => {
  const copy = strings.posProductShiftStockStatus;

  it('renders pricing, availability states, count, audit log and CTAs', async () => {
    const view = await render(<PosProductShiftStockStatusScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.stationLabel)).toBeTruthy();
    expect(view.getByText(copy.priceTitle)).toBeTruthy();
    expect(view.getByText(copy.availabilityTitle)).toBeTruthy();
    // "Available on Register" labels both the row and its register switch.
    expect(view.getAllByText(copy.registerTitle).length).toBeGreaterThan(0);
    expect(view.getByText(copy.inStockLabel)).toBeTruthy();
    expect(view.getByText(copy.lowLabel)).toBeTruthy();
    expect(view.getByText(copy.outLabel)).toBeTruthy();
    expect(view.getByText(copy.soldOutCta)).toBeTruthy();
    expect(view.getByText(copy.countValue)).toBeTruthy();
    posShiftAuditLog.forEach(entry => {
      expect(view.getAllByText(entry.label).length).toBeGreaterThan(0);
    });
    // The footer CTA carries the list price alongside the label.
    expect(view.getByText(new RegExp(copy.addToSaleCta))).toBeTruthy();
    expect(view.getByText(copy.saveCta)).toBeTruthy();
  });

  it('steps the count, sets an exact count, 86s the item and saves', async () => {
    const onAdjustCount = jest.fn();
    const onOpenSetCount = jest.fn();
    const onMarkSoldOut = jest.fn();
    const onSave = jest.fn();
    const onToggleRegisterAvailability = jest.fn();
    const onOpenGovernance = jest.fn();
    const onAddToSale = jest.fn();
    const view = await render(
      <PosProductShiftStockStatusScreen
        onAdjustCount={onAdjustCount}
        onOpenSetCount={onOpenSetCount}
        onMarkSoldOut={onMarkSoldOut}
        onSave={onSave}
        onToggleRegisterAvailability={onToggleRegisterAvailability}
        onOpenGovernance={onOpenGovernance}
        onAddToSale={onAddToSale}
      />,
    );

    await pressAndSettle(view, `${copy.countTitle} ${posStockCountSteps[0]}`);
    expect(onAdjustCount).toHaveBeenCalledWith('-5');

    await pressAndSettle(view, copy.setCta);
    expect(onOpenSetCount).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.soldOutCta);
    expect(onMarkSoldOut).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.governanceCta);
    expect(onOpenGovernance).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.addToSaleCta);
    expect(onAddToSale).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.saveCta);
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});

describe('pos customer + catalogue navigation', () => {
  const shell = strings.businessShell;
  const more = strings.businessMore;
  const inventory = strings.posProductsInventory;
  const list = strings.posCustomerLookupList;

  /** More tab -> More hub "POS" row -> the operations-dense hub. */
  async function openOperationsHub() {
    const rows: { id: string; label: string }[] = [];
    more.sections.forEach(section => {
      section.items.forEach(item => rows.push({ id: item.id, label: item.label }));
    });
    const posRow = rows.find(item => item.id === 'pos-launch');
    if (!posRow) throw new Error('No More-hub row with id "pos-launch"');
    await act(async () => {
      fireEvent.press(screen.getByLabelText(shell.tabs.more));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText(posRow.label));
    });
  }

  it('reaches the till catalogue from the operations hub', async () => {
    await render(
      <NavigationContainer>
        <BusinessTabNavigator />
      </NavigationContainer>,
    );
    await openOperationsHub();

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Products'));
    });
    expect(screen.getAllByText(inventory.headerTitle).length).toBeGreaterThan(0);
  });

  it('reaches the till customer list from the operations hub', async () => {
    await render(
      <NavigationContainer>
        <BusinessTabNavigator />
      </NavigationContainer>,
    );
    await openOperationsHub();

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Customers'));
    });
    expect(screen.getAllByText(list.tillStatus).length).toBeGreaterThan(0);
  });

  it('walks the customer list into the loyalty attach and tender hand-off', async () => {
    await render(
      <NavigationContainer>
        <BusinessTabNavigator />
      </NavigationContainer>,
    );
    await openOperationsHub();
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Customers'));
    });
    expect(screen.getAllByText(list.tillStatus).length).toBeGreaterThan(0);

    // The expanded VIP patron attaches into the rewards screen.
    await act(async () => {
      fireEvent.press(
        screen.getByLabelText(
          list.attachLabel
            .replace('{action}', posCustomerCards[0].attachCta)
            .replace('{name}', posCustomerCards[0].name),
        ),
      );
    });
    expect(
      screen.getAllByText(strings.posCustomerLookupLoyalty.headerTitle).length,
    ).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.posCustomerLookupLoyalty.attachCta));
    });
    expect(
      screen.getAllByText(strings.posTenderCheckout.headerTitle).length,
    ).toBeGreaterThan(0);
  });
});
