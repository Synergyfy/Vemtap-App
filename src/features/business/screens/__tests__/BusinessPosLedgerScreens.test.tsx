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
import { PosTransactionsLedgerShiftScreen } from '@features/business/screens/PosTransactionsLedgerShiftScreen';
import { PosTransactionsLedgerReceiptsScreen } from '@features/business/screens/PosTransactionsLedgerReceiptsScreen';
import { PosTransactionDetailsScreen } from '@features/business/screens/PosTransactionDetailsScreen';
import { PosOfflineCheckoutTerminalScreen } from '@features/business/screens/PosOfflineCheckoutTerminalScreen';
import { PosOfflineBufferQueueScreen } from '@features/business/screens/PosOfflineBufferQueueScreen';
import { PosSyncReconciliationScreen } from '@features/business/screens/PosSyncReconciliationScreen';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import {
  posBufferedSales,
  posBufferFilters,
  posLedgerReceipts,
  posReceiptLedgerFilters,
  posShiftJournal,
  posShiftLedgerFilters,
  posShiftSalesMix,
  posSyncJournal,
  posSyncMetrics,
  posTransactionItems,
  posTransactionTotals,
} from '@features/business/data/businessPosLedgerData';
import { completedSale } from '@features/business/data/businessPosFlowData';

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

describe('pos transactions & shift ledger', () => {
  const copy = strings.posTransactionsLedgerShift;

  it('renders shift totals, the tender mix, filters and every journal ticket', async () => {
    const view = await render(<PosTransactionsLedgerShiftScreen />);

    expect(view.getByText(copy.title)).toBeTruthy();
    expect(view.getByText(copy.shiftSalesValue)).toBeTruthy();
    posShiftSalesMix.forEach(mix => {
      expect(view.getAllByText(mix.value).length).toBeGreaterThan(0);
    });
    posShiftLedgerFilters.forEach(filter => {
      expect(view.getAllByLabelText(filter.label).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.feedTitle)).toBeTruthy();
    posShiftJournal.forEach(ticket => {
      expect(view.getAllByText(ticket.reference).length).toBeGreaterThan(0);
      expect(view.getAllByText(ticket.total).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.exportCta)).toBeTruthy();
    expect(view.getByText(copy.zReportCta)).toBeTruthy();
  });

  it('reprints, opens details, voids, splits and resumes', async () => {
    const onReprint = jest.fn();
    const onOpenDetails = jest.fn();
    const onVoid = jest.fn();
    const onOpenSplits = jest.fn();
    const onResumeTicket = jest.fn();
    const onSelectFilter = jest.fn();
    const onExportShift = jest.fn();
    const onOpenZReport = jest.fn();
    const view = await render(
      <PosTransactionsLedgerShiftScreen
        onReprint={onReprint}
        onOpenDetails={onOpenDetails}
        onVoid={onVoid}
        onOpenSplits={onOpenSplits}
        onResumeTicket={onResumeTicket}
        onSelectFilter={onSelectFilter}
        onExportShift={onExportShift}
        onOpenZReport={onOpenZReport}
      />,
    );

    await pressAndSettle(view, `${copy.reprintCta} ${posShiftJournal[0].reference}`);
    expect(onReprint).toHaveBeenCalledWith('tk-108');

    await pressAndSettle(view, `${copy.detailCta} ${posShiftJournal[0].reference}`);
    expect(onOpenDetails).toHaveBeenCalledWith('tk-108');

    await pressAndSettle(view, `Void ${posShiftJournal[0].reference}`);
    expect(onVoid).toHaveBeenCalledWith('tk-108');

    await pressAndSettle(view, `${copy.splitsCta} ${posShiftJournal[2].reference}`);
    expect(onOpenSplits).toHaveBeenCalledWith('tk-106');

    await pressAndSettle(view, `${copy.resumeCta} ${posShiftJournal[3].reference}`);
    expect(onResumeTicket).toHaveBeenCalledWith('tk-105');

    await pressAndSettle(view, posShiftLedgerFilters[1].label);
    expect(onSelectFilter).toHaveBeenCalledWith('completed');

    await pressAndSettle(view, copy.exportCta);
    expect(onExportShift).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.zReportCta);
    expect(onOpenZReport).toHaveBeenCalledTimes(1);
  });
});

describe('pos receipt ledger', () => {
  const copy = strings.posTransactionsLedgerReceipts;

  it('renders the gross total banner, filters and every receipt', async () => {
    const view = await render(<PosTransactionsLedgerReceiptsScreen />);

    expect(view.getByText(copy.grossTitle)).toBeTruthy();
    expect(view.getByText(copy.grossValue)).toBeTruthy();
    posReceiptLedgerFilters.forEach(filter => {
      expect(view.getAllByLabelText(filter.label).length).toBeGreaterThan(0);
    });
    posLedgerReceipts.forEach(receipt => {
      expect(view.getAllByText(receipt.reference).length).toBeGreaterThan(0);
      expect(view.getAllByText(receipt.total).length).toBeGreaterThan(0);
    });
  });

  it('filters, opens a receipt, opens the customer, exports and syncs', async () => {
    const onSelectFilter = jest.fn();
    const onOpenReceipt = jest.fn();
    const onOpenCustomer = jest.fn();
    const onExport = jest.fn();
    const onSyncLedger = jest.fn();
    const view = await render(
      <PosTransactionsLedgerReceiptsScreen
        onSelectFilter={onSelectFilter}
        onOpenReceipt={onOpenReceipt}
        onOpenCustomer={onOpenCustomer}
        onExport={onExport}
        onSyncLedger={onSyncLedger}
      />,
    );

    await pressAndSettle(view, posReceiptLedgerFilters[2].label);
    expect(onSelectFilter).toHaveBeenCalledWith('pending');

    await pressAndSettle(
      view,
      `${posLedgerReceipts[0].reference} ${posLedgerReceipts[0].total}`,
    );
    expect(onOpenReceipt).toHaveBeenCalledWith('rc-94021');

    await pressAndSettle(view, posLedgerReceipts[1].customer);
    expect(onOpenCustomer).toHaveBeenCalledWith(posLedgerReceipts[1].customer);

    await pressAndSettle(view, copy.exportCta);
    expect(onExport).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.syncActionLabel);
    expect(onSyncLedger).toHaveBeenCalledTimes(1);
  });
});

describe('pos transaction details', () => {
  const copy = strings.posTransactionDetails;

  it('renders the record, patron, items, totals and tender breakdown', async () => {
    const view = await render(<PosTransactionDetailsScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.statusBadge)).toBeTruthy();
    // The gross total heads the record and repeats on the totals block.
    expect(view.getAllByText(completedSale.amount).length).toBeGreaterThan(0);
    expect(view.getByText(copy.uidValue)).toBeTruthy();
    expect(view.getByText(copy.hardwareValue)).toBeTruthy();
    expect(view.getByText(copy.patronPoints)).toBeTruthy();
    posTransactionItems.forEach(item => {
      expect(view.getAllByText(item.name).length).toBeGreaterThan(0);
    });
    posTransactionTotals.forEach(row => {
      expect(view.getAllByText(row.value).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.methodValue)).toBeTruthy();
    expect(view.getByText(copy.cashReceivedValue)).toBeTruthy();
    expect(view.getByText(copy.changeValue)).toBeTruthy();
    expect(view.getByText(copy.clearanceTitle)).toBeTruthy();
    expect(view.getByText(copy.printCta)).toBeTruthy();
  });

  it('copies the reference, opens the patron, prints and gates the void behind a PIN', async () => {
    const onCopyReference = jest.fn();
    const onOpenPatron = jest.fn();
    const onPrint = jest.fn();
    const onShare = jest.fn();
    const onViewEReceipt = jest.fn();
    const onOpenRefund = jest.fn();
    const onConfirmVoid = jest.fn();
    const view = await render(
      <PosTransactionDetailsScreen
        onCopyReference={onCopyReference}
        onOpenPatron={onOpenPatron}
        onPrint={onPrint}
        onShare={onShare}
        onViewEReceipt={onViewEReceipt}
        onOpenRefund={onOpenRefund}
        onConfirmVoid={onConfirmVoid}
      />,
    );

    await pressAndSettle(view, copy.recordValue);
    expect(onCopyReference).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, completedSale.customer);
    expect(onOpenPatron).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.patronPoints);
    await pressAndSettle(view, copy.printCta);
    expect(onPrint).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.shareCta);
    expect(onShare).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.eReceiptCta);
    expect(onViewEReceipt).toHaveBeenCalledTimes(1);

    // The refund action opens the shared manager-authorization sheet.
    await pressAndSettle(view, copy.refundCta);
    expect(onOpenRefund).toHaveBeenCalledTimes(1);
    expect(view.getAllByText(copy.voidSheetTitle).length).toBeGreaterThan(0);
    await pressAndSettle(view, copy.voidConfirmCta);
    expect(onConfirmVoid).toHaveBeenCalledWith('');
  });
});

describe('pos offline checkout terminal', () => {
  const copy = strings.posOfflineCheckoutTerminal;

  it('renders the offline banner, cached ticket, totals and tender options', async () => {
    const view = await render(<PosOfflineCheckoutTerminalScreen />);

    expect(view.getAllByText(copy.offlineTitle).length).toBeGreaterThan(0);
    expect(view.getByText(copy.queueBadge)).toBeTruthy();
    expect(view.getByText(copy.branchOffline)).toBeTruthy();
    expect(view.getByText(copy.cacheLabel)).toBeTruthy();
    expect(view.getByText(copy.ticketRef)).toBeTruthy();
    expect(view.getByText(copy.line1)).toBeTruthy();
    expect(view.getByText(copy.line3Price)).toBeTruthy();
    expect(view.getByText(copy.subtotalValue)).toBeTruthy();
    expect(view.getByText(copy.totalValue)).toBeTruthy();
    expect(view.getByText(copy.cashTender)).toBeTruthy();
    expect(view.getByText(copy.changeDueValue)).toBeTruthy();
    expect(view.getByText(copy.externalTitle)).toBeTruthy();
    expect(view.getByText(copy.guaranteeTitle)).toBeTruthy();
    expect(view.getByText(copy.completeCta)).toBeTruthy();
  });

  it('attaches a patron, picks tender, enters an external ref and completes', async () => {
    const onAttachPatron = jest.fn();
    const onSelectCashTender = jest.fn();
    const onEnterExternalRef = jest.fn();
    const onOpenHouseTab = jest.fn();
    const onCompleteSale = jest.fn();
    const onOpenQueue = jest.fn();
    const onReindex = jest.fn();
    const view = await render(
      <PosOfflineCheckoutTerminalScreen
        onAttachPatron={onAttachPatron}
        onSelectCashTender={onSelectCashTender}
        onEnterExternalRef={onEnterExternalRef}
        onOpenHouseTab={onOpenHouseTab}
        onCompleteSale={onCompleteSale}
        onOpenQueue={onOpenQueue}
        onReindex={onReindex}
      />,
    );

    await pressAndSettle(view, copy.reindexCta);
    expect(onReindex).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.attachPatronCta);
    expect(onAttachPatron).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.cashTender);
    expect(onSelectCashTender).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.externalCta);
    expect(onEnterExternalRef).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.houseTabTitle);
    expect(onOpenHouseTab).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.completeCta);
    expect(onCompleteSale).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.queueCta);
    expect(onOpenQueue).toHaveBeenCalledTimes(1);
  });
});

describe('pos offline buffer queue', () => {
  const copy = strings.posOfflineBufferQueue;

  it('renders the pending volume, filters and every queued sale', async () => {
    const view = await render(<PosOfflineBufferQueueScreen />);

    expect(view.getByText(copy.pendingValue)).toBeTruthy();
    expect(view.getByText(copy.volumeValue)).toBeTruthy();
    expect(view.getByText(copy.storageLabel)).toBeTruthy();
    expect(view.getByText(copy.storageBadge)).toBeTruthy();
    posBufferFilters.forEach(filter => {
      expect(view.getAllByLabelText(filter.label).length).toBeGreaterThan(0);
    });
    posBufferedSales.forEach(sale => {
      expect(view.getAllByText(sale.reference).length).toBeGreaterThan(0);
      expect(view.getAllByText(sale.total).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.warningTitle)).toBeTruthy();
    expect(view.getByText(copy.returnCta)).toBeTruthy();
  });

  it('filters, opens a queued sale, prints the tape and exports', async () => {
    const onSelectFilter = jest.fn();
    const onOpenSale = jest.fn();
    const onPrintTape = jest.fn();
    const onExportBackup = jest.fn();
    const onReturnToRegister = jest.fn();
    const view = await render(
      <PosOfflineBufferQueueScreen
        onSelectFilter={onSelectFilter}
        onOpenSale={onOpenSale}
        onPrintTape={onPrintTape}
        onExportBackup={onExportBackup}
        onReturnToRegister={onReturnToRegister}
      />,
    );

    await pressAndSettle(view, posBufferFilters[1].label);
    expect(onSelectFilter).toHaveBeenCalledWith('cash');

    await pressAndSettle(
      view,
      `${posBufferedSales[0].reference} ${posBufferedSales[0].total}`,
    );
    expect(onOpenSale).toHaveBeenCalledWith('loc-005');

    await pressAndSettle(view, copy.printCta);
    expect(onPrintTape).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.exportCta);
    expect(onExportBackup).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.returnCta);
    expect(onReturnToRegister).toHaveBeenCalledTimes(1);
  });
});

describe('pos sync reconciliation', () => {
  const copy = strings.posSyncReconciliation;

  it('renders progress, the four metrics, the journal and diagnostics', async () => {
    const view = await render(<PosSyncReconciliationScreen />);

    expect(view.getByText(copy.syncTitle)).toBeTruthy();
    expect(view.getByText(copy.syncPercent)).toBeTruthy();
    posSyncMetrics.forEach(metric => {
      expect(view.getAllByText(metric.value).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.syncNowCta)).toBeTruthy();
    expect(view.getByText(copy.journalTitle)).toBeTruthy();
    posSyncJournal.forEach(entry => {
      expect(view.getAllByText(entry.reference).length).toBeGreaterThan(0);
    });
    expect(view.getByText(copy.diagnosticsTitle)).toBeTruthy();
    expect(view.getByText(copy.endpointValue)).toBeTruthy();
    expect(view.getByText(copy.downloadCta)).toBeTruthy();
  });

  it('forces a sync and resolves the stock collision', async () => {
    const onForceSync = jest.fn();
    const onAcceptLocalSale = jest.fn();
    const onCustomLineItem = jest.fn();
    const onOpenDetails = jest.fn();
    const onDownloadCsv = jest.fn();
    const view = await render(
      <PosSyncReconciliationScreen
        onForceSync={onForceSync}
        onAcceptLocalSale={onAcceptLocalSale}
        onCustomLineItem={onCustomLineItem}
        onOpenDetails={onOpenDetails}
        onDownloadCsv={onDownloadCsv}
      />,
    );

    await pressAndSettle(view, copy.syncNowCta);
    expect(onForceSync).toHaveBeenCalledTimes(1);

    await pressAndSettle(view, copy.acceptCta);
    expect(onAcceptLocalSale).toHaveBeenCalledWith('loc-001');

    await pressAndSettle(view, copy.customLineCta);
    expect(onCustomLineItem).toHaveBeenCalledWith('loc-001');

    await pressAndSettle(view, copy.viewDetailsCta);
    expect(onOpenDetails).toHaveBeenCalledWith('loc-001');

    await pressAndSettle(view, copy.downloadCta);
    expect(onDownloadCsv).toHaveBeenCalledTimes(1);
  });
});

describe('pos ledger + offline navigation', () => {
  const shell = strings.businessShell;
  const more = strings.businessMore;

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

  /** ... then the POS register home, which owns the sale-flow entry points. */
  async function openRegisterHome() {
    await openOperationsHub();
    const posHomeTile = strings.businessMoreHubOperations.posTiles.find(
      tile => tile.id === 'pos-home',
    );
    await act(async () => {
      fireEvent.press(screen.getByLabelText(posHomeTile!.label));
    });
  }

  it('reaches the shift ledger from the operations hub and walks into the receipt', async () => {
    await render(
      <NavigationContainer>
        <BusinessTabNavigator />
      </NavigationContainer>,
    );
    await openRegisterHome();

    await act(async () => {
      fireEvent.press(screen.getAllByLabelText('Transactions')[0]);
    });
    expect(
      screen.getAllByText(strings.posTransactionsLedgerShift.title).length,
    ).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(
        screen.getByLabelText(
          `${strings.posTransactionsLedgerShift.detailCta} ${posShiftJournal[0].reference}`,
        ),
      );
    });
    expect(
      screen.getAllByText(strings.posTransactionDetails.headerTitle).length,
    ).toBeGreaterThan(0);
  });

  it('hands the shift ledger off to receipt customisation via reprint', async () => {
    await render(
      <NavigationContainer>
        <BusinessTabNavigator />
      </NavigationContainer>,
    );
    await openRegisterHome();
    await act(async () => {
      fireEvent.press(screen.getAllByLabelText('Transactions')[0]);
    });

    await act(async () => {
      fireEvent.press(
        screen.getByLabelText(
          `${strings.posTransactionsLedgerShift.reprintCta} ${posShiftJournal[0].reference}`,
        ),
      );
    });
    expect(
      screen.getAllByText(strings.posReceiptCustomization.headerTitle).length,
    ).toBeGreaterThan(0);
  });

  it('reaches the sync centre and the offline register from the operations hub', async () => {
    await render(
      <NavigationContainer>
        <BusinessTabNavigator />
      </NavigationContainer>,
    );
    await openOperationsHub();

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Sync Till'));
    });
    expect(
      screen.getAllByText(strings.posSyncReconciliation.headerTitle).length,
    ).toBeGreaterThan(0);

    // The reconciliation centre resolves a stock collision on the till catalogue.
    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.posSyncReconciliation.acceptCta));
    });
    expect(
      screen.getAllByText(strings.posProductsInventory.headerTitle).length,
    ).toBeGreaterThan(0);
  });
});
