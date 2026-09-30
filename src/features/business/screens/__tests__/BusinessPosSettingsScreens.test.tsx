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
import { PosGeneralSettingsScreen } from '@features/business/screens/PosGeneralSettingsScreen';
import { PaymentHardwareSetupScreen } from '@features/business/screens/PaymentHardwareSetupScreen';
import { TaxesSurchargesScreen } from '@features/business/screens/TaxesSurchargesScreen';
import { StaffPermissionsPasscodesScreen } from '@features/business/screens/StaffPermissionsPasscodesScreen';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import {
  posPeripheralGroups,
  posSettingsGroups,
  posSettingsLinks,
  posSettingsTelemetry,
  posTenderRails,
  posTerminalChannels,
} from '@features/business/data/businessPosSettingsData';

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

describe('pos general settings', () => {
  const copy = strings.posGeneralSettings;

  it('renders the till card, telemetry, every settings group and the controls', async () => {
    const view = await render(<PosGeneralSettingsScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.venueLabel)).toBeTruthy();
    expect(view.getByText(copy.tillLabel)).toBeTruthy();
    expect(view.getByText(copy.liveBadge)).toBeTruthy();
    expect(view.getByText(copy.modePin)).toBeTruthy();
    posSettingsTelemetry.forEach(node => {
      expect(view.getAllByText(node.title).length).toBeGreaterThan(0);
    });
    posSettingsGroups.forEach(group => {
      expect(view.getAllByText(group.title).length).toBeGreaterThan(0);
    });
    posSettingsLinks.forEach(link => {
      expect(view.getAllByLabelText(link.title).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.feedTestCta)).toBeTruthy();
    expect(view.getByText(copy.drawerPopCta)).toBeTruthy();
    expect(view.getByText(copy.engineLabel)).toBeTruthy();
  });

  it('syncs, opens each settings group and runs the till controls', async () => {
    const onSyncNow = jest.fn();
    const onOpenSetting = jest.fn();
    const onTestFeed = jest.fn();
    const onOpenTill = jest.fn();
    const view = await render(
      <PosGeneralSettingsScreen
        onSyncNow={onSyncNow}
        onOpenSetting={onOpenSetting}
        onTestFeed={onTestFeed}
        onOpenTill={onOpenTill}
      />,
    );

    await pressAndSettle(view, copy.syncNowCta);
    expect(onSyncNow).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, posSettingsLinks[0].title);
    expect(onOpenSetting).toHaveBeenCalledWith('receipt');

    await pressAndSettle(view, posSettingsLinks[posSettingsLinks.length - 1].title);
    expect(onOpenSetting).toHaveBeenCalledWith('security');

    await pressAndSettle(view, copy.feedTestCta);
    expect(onTestFeed).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.drawerPopCta);
    expect(onOpenTill).toHaveBeenCalledTimes(1);
  });
});

describe('payment & hardware setup', () => {
  const copy = strings.paymentHardwareSetup;

  it('renders the terminal card, every tender rail and every peripheral', async () => {
    const view = await render(<PaymentHardwareSetupScreen />);

    expect(view.getByText(copy.headerCardTitle)).toBeTruthy();
    // The ready badge also heads the cash-drawer peripheral row.
    expect(view.getAllByText(copy.readyBadge).length).toBeGreaterThan(0);
    posTerminalChannels.forEach(channel => {
      expect(view.getAllByText(channel.label).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.liveTitle)).toBeTruthy();
    expect(view.getByText(copy.methodsTitle)).toBeTruthy();
    posTenderRails.forEach(rail => {
      expect(view.getAllByText(rail.title).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.moniepointTitle)).toBeTruthy();
    expect(view.getByText(copy.bankAccountValue)).toBeTruthy();
    expect(view.getByText(copy.houseTabWarning)).toBeTruthy();
    posPeripheralGroups.forEach(group => {
      expect(view.getAllByText(group.title).length).toBeGreaterThan(0);
    });
    // The fallback scanner title labels both the group heading and its switch row.
    expect(view.getAllByText(copy.fallbackTitle).length).toBeGreaterThan(0);
    expect(view.getByText(copy.saveCta)).toBeTruthy();
  });

  it('toggles rails, picks a terminal, tests hardware and saves', async () => {
    const onToggleRail = jest.fn();
    const onSelectRailAction = jest.fn();
    const onTestFeed = jest.fn();
    const onTestDrawer = jest.fn();
    const onPairPrinter = jest.fn();
    const onToggleFallbackScanner = jest.fn();
    const onSave = jest.fn();
    const view = await render(
      <PaymentHardwareSetupScreen
        onToggleRail={onToggleRail}
        onSelectRailAction={onSelectRailAction}
        onTestFeed={onTestFeed}
        onTestDrawer={onTestDrawer}
        onPairPrinter={onPairPrinter}
        onToggleFallbackScanner={onToggleFallbackScanner}
        onSave={onSave}
      />,
    );

    const cashKick = posTenderRails[0].switches[0];
    await pressAndSettle(view, cashKick.title);
    expect(onToggleRail).toHaveBeenCalledWith('cash', cashKick.id, false);

    const cardPush = posTenderRails[1].switches[0];
    await pressAndSettle(view, cardPush.title);
    expect(onToggleRail).toHaveBeenCalledWith('card', cardPush.id, false);

    await pressAndSettle(view, copy.moniepointAction);
    expect(onSelectRailAction).toHaveBeenCalledWith('card', 'moniepoint');

    await pressAndSettle(view, copy.testFeedCta);
    expect(onTestFeed).toHaveBeenCalledWith('counter-printer');

    await pressAndSettle(view, copy.testDrawerCta);
    expect(onTestDrawer).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.pairCta);
    expect(onPairPrinter).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.fallbackTitle);
    expect(onToggleFallbackScanner).toHaveBeenCalledWith(false);

    await pressAndSettle(view, copy.saveCta);
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});

describe('taxes & surcharges', () => {
  const copy = strings.taxesSurcharges;

  it('renders the statutory, surcharge and QR rule sections', async () => {
    const view = await render(<TaxesSurchargesScreen />);

    // The heading repeats in the header bar.
    expect(view.getAllByText(copy.title).length).toBeGreaterThan(0);
    expect(view.getByText(copy.pinBadge)).toBeTruthy();
    expect(view.getByText(copy.sessionLabel)).toBeTruthy();
    expect(view.getByText(copy.vatTitle)).toBeTruthy();
    expect(view.getAllByText(copy.vatValue).length).toBeGreaterThan(0);
    expect(view.getByText(copy.inclusiveTitle)).toBeTruthy();
    expect(view.getByText(copy.exclusiveTitle)).toBeTruthy();
    expect(view.getByText(copy.tinValue)).toBeTruthy();
    expect(view.getByText(copy.serviceChargeTitle)).toBeTruthy();
    expect(view.getByText(copy.packagingTitle)).toBeTruthy();
    expect(view.getByText(copy.selfOrderTitle)).toBeTruthy();
    expect(view.getByText(copy.qrScopeTitle)).toBeTruthy();
    expect(view.getByText(copy.rushTitle)).toBeTruthy();
    expect(view.getByText(copy.auditBody)).toBeTruthy();
    expect(view.getByText(copy.applyCta)).toBeTruthy();
  });

  it('switches price application, copies the TIN and applies the rules', async () => {
    const onSelectPriceApplication = jest.fn();
    const onCopyTin = jest.fn();
    const onToggleExemption = jest.fn();
    const onToggleServiceWaiver = jest.fn();
    const onToggleRushPause = jest.fn();
    const onToggleSelfOrdering = jest.fn();
    const onApply = jest.fn();
    const view = await render(
      <TaxesSurchargesScreen
        onSelectPriceApplication={onSelectPriceApplication}
        onCopyTin={onCopyTin}
        onToggleExemption={onToggleExemption}
        onToggleServiceWaiver={onToggleServiceWaiver}
        onToggleRushPause={onToggleRushPause}
        onToggleSelfOrdering={onToggleSelfOrdering}
        onApply={onApply}
      />,
    );

    await pressAndSettle(view, copy.inclusiveTitle);
    expect(onSelectPriceApplication).toHaveBeenCalledWith('inclusive');

    await pressAndSettle(view, copy.tinValue);
    expect(onCopyTin).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.exemptionTitle);
    expect(onToggleExemption).toHaveBeenCalledWith(false);

    await pressAndSettle(view, copy.serviceWaiverTitle);
    expect(onToggleServiceWaiver).toHaveBeenCalledWith(false);

    await pressAndSettle(view, copy.rushTitle);
    expect(onToggleRushPause).toHaveBeenCalledWith(true);

    await pressAndSettle(view, copy.selfOrderTitle);
    expect(onToggleSelfOrdering).toHaveBeenCalledWith(false);

    await pressAndSettle(view, copy.applyCta);
    expect(onApply).toHaveBeenCalledTimes(1);
  });
});

describe('staff permissions & passcodes', () => {
  const copy = strings.staffPermissionsPasscodes;

  it('renders the vault, guard switches, PIN list and every policy section', async () => {
    const view = await render(<StaffPermissionsPasscodesScreen />);

    expect(view.getByText(copy.vaultTitle)).toBeTruthy();
    expect(view.getByText(copy.vaultBadge)).toBeTruthy();
    expect(view.getByText(copy.idleTitle)).toBeTruthy();
    expect(view.getByText(copy.overrideTitle)).toBeTruthy();
    expect(view.getByText(copy.pinsBadge)).toBeTruthy();
    expect(view.getByText('Chief Tunde B.')).toBeTruthy();
    expect(view.getByText('Sarah A.')).toBeTruthy();
    expect(view.getByText(copy.discountTitle)).toBeTruthy();
    expect(view.getByText(copy.drawerTitle)).toBeTruthy();
    expect(view.getByText(copy.customTitle)).toBeTruthy();
    expect(view.getByText(copy.voidTitle)).toBeTruthy();
    expect(view.getByText(copy.refundTitle)).toBeTruthy();
    expect(view.getByText(copy.reprintTitle)).toBeTruthy();
    expect(view.getByText(copy.blindTitle)).toBeTruthy();
    expect(view.getByText(copy.closeTitle)).toBeTruthy();
    expect(view.getByText(copy.forcePushTitle)).toBeTruthy();
    expect(view.getByText(copy.clearCacheTitle)).toBeTruthy();
    expect(view.getByText(copy.auditBody)).toBeTruthy();
    expect(view.getByText(copy.saveCta)).toBeTruthy();
  });

  it('toggles guards, adds and edits PINs, opens the audit log and saves', async () => {
    const onToggleGuard = jest.fn();
    const onAddSupervisorPin = jest.fn();
    const onEditSupervisorPin = jest.fn();
    const onToggleControl = jest.fn();
    const onOpenAuditLog = jest.fn();
    const onSave = jest.fn();
    const view = await render(
      <StaffPermissionsPasscodesScreen
        onToggleGuard={onToggleGuard}
        onAddSupervisorPin={onAddSupervisorPin}
        onEditSupervisorPin={onEditSupervisorPin}
        onToggleControl={onToggleControl}
        onOpenAuditLog={onOpenAuditLog}
        onSave={onSave}
      />,
    );

    await pressAndSettle(view, copy.idleTitle);
    expect(onToggleGuard).toHaveBeenCalledWith('idle', false);

    await pressAndSettle(view, copy.addPinCta);
    expect(onAddSupervisorPin).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, 'Edit Sarah A.');
    expect(onEditSupervisorPin).toHaveBeenCalledWith('sarah');

    await pressAndSettle(view, copy.drawerTitle);
    expect(onToggleControl).toHaveBeenCalledWith('drawer', false);

    await pressAndSettle(view, copy.voidTitle);
    expect(onToggleControl).toHaveBeenCalledWith('void', false);

    await pressAndSettle(view, copy.clearCacheTitle);
    expect(onToggleControl).toHaveBeenCalledWith('clear-cache', true);

    await pressAndSettle(view, copy.auditCta);
    expect(onOpenAuditLog).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.saveCta);
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});

describe('pos settings navigation', () => {
  const shell = strings.businessShell;
  const more = strings.businessMore;
  const settings = strings.posGeneralSettings;
  const taxes = strings.taxesSurcharges;
  const security = strings.staffPermissionsPasscodes;
  const hardware = strings.paymentHardwareSetup;

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

  async function openSettingsHub() {
    await openOperationsHub();
    const posHomeTile = strings.businessMoreHubOperations.posTiles.find(
      tile => tile.id === 'pos-home',
    );
    await act(async () => {
      fireEvent.press(screen.getByLabelText(posHomeTile!.label));
    });
    await act(async () => {
      fireEvent.press(
        screen.getByLabelText(strings.posHomeSalesOperations.settingsActionLabel),
      );
    });
  }

  it('reaches the settings hub from the register home and walks its rows', async () => {
    await render(
      <NavigationContainer>
        <BusinessTabNavigator />
      </NavigationContainer>,
    );
    await openSettingsHub();
    expect(screen.getAllByText(settings.venueLabel).length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Taxes & Surcharges'));
    });
    expect(screen.getAllByText(taxes.title).length).toBeGreaterThan(0);

    // Pop back to the settings hub, then take the security row from there.
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Go back'));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Staff POS Permissions & Supervisor PINs'));
    });
    expect(screen.getAllByText(security.vaultTitle).length).toBeGreaterThan(0);
  });

  it('reaches hardware setup and the receipt customiser from the settings hub', async () => {
    await render(
      <NavigationContainer>
        <BusinessTabNavigator />
      </NavigationContainer>,
    );
    await openSettingsHub();

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Payment Methods & Tender Rails'));
    });
    expect(screen.getAllByText(hardware.headerCardTitle).length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Go back'));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Receipt & Order Customization'));
    });
    expect(
      screen.getAllByText(strings.posReceiptCustomization.headerTitle).length,
    ).toBeGreaterThan(0);
  });
});
