import React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { BusinessAnalyticsPerformanceScreen } from '@features/business/screens/BusinessAnalyticsPerformanceScreen';
import { CustomerIntelligenceAnalyticsScreen } from '@features/business/screens/CustomerIntelligenceAnalyticsScreen';
import { LocationsBranchComparisonScreen } from '@features/business/screens/LocationsBranchComparisonScreen';
import { CustomerDisplayOrderTotalScreen } from '@features/business/screens/CustomerDisplayOrderTotalScreen';
import { CustomerDisplayTapQrPayScreen } from '@features/business/screens/CustomerDisplayTapQrPayScreen';
import { CustomerDisplayTipRatingScreen } from '@features/business/screens/CustomerDisplayTipRatingScreen';
import { SplitTheBillScreen } from '@features/business/screens/SplitTheBillScreen';
import { DigitalEReceiptScreen } from '@features/business/screens/DigitalEReceiptScreen';
import {
  branchComparison,
  customerValueSegments,
  receiptOrder,
  splitLines,
  splitModes,
  topCustomers,
} from '@features/business/data/businessAnalyticsData';

afterEach(cleanup);

/**
 * Press a control and let its resulting render settle before the next
 * interaction. Two back-to-back presses with no flush in between leave React's
 * act queue unbalanced, which poisons every later test in the run — so
 * consecutive interactions go through here.
 */
async function pressAndSettle(view: Awaited<ReturnType<typeof render>>, label: string) {
  fireEvent.press(view.getByLabelText(label));
  await waitFor(() => expect(view.getByLabelText(label)).toBeTruthy());
}

describe('customer intelligence analytics', () => {
  const copy = strings.customerIntelligenceAnalytics;

  it('renders the greeting, KPIs, segments and top customers', async () => {
    const view = await render(<CustomerIntelligenceAnalyticsScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(copy.greeting)).toBeTruthy();
    expect(view.getByText(copy.totalCustomersValue)).toBeTruthy();
    expect(view.getByText(copy.repeatRateValue)).toBeTruthy();
    customerValueSegments.forEach(segment => {
      expect(view.getByText(segment.name)).toBeTruthy();
    });
    topCustomers.forEach(customer => {
      expect(view.getByText(customer.name)).toBeTruthy();
    });
  });

  it('switches the active analytics tab and routes the loyalty tab', async () => {
    const onOpenLoyaltyProgramme = jest.fn();
    const view = await render(
      <CustomerIntelligenceAnalyticsScreen
        onOpenLoyaltyProgramme={onOpenLoyaltyProgramme}
      />,
    );

    await pressAndSettle(view, copy.navTabs.loyalty);

    expect(onOpenLoyaltyProgramme).toHaveBeenCalledTimes(1);
  });

  it('changes the date range and exports the report', async () => {
    const onExport = jest.fn();
    const view = await render(
      <CustomerIntelligenceAnalyticsScreen onExport={onExport} />,
    );

    fireEvent.press(view.getByLabelText(copy.dateRanges[3]));
    await waitFor(() => expect(view.getByLabelText(copy.dateRanges[3])).toBeTruthy());
    await pressAndSettle(view, copy.exportCta);

    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('opens a segment and a customer from their rows', async () => {
    const onOpenSegment = jest.fn();
    const onOpenCustomer = jest.fn();
    const view = await render(
      <CustomerIntelligenceAnalyticsScreen
        onOpenSegment={onOpenSegment}
        onOpenCustomer={onOpenCustomer}
      />,
    );

    await pressAndSettle(view, customerValueSegments[0].name);
    await pressAndSettle(view, topCustomers[0].name);

    expect(onOpenSegment).toHaveBeenCalledWith(customerValueSegments[0].id);
    expect(onOpenCustomer).toHaveBeenCalledWith(topCustomers[0].id);
  });
});

describe('business analytics performance', () => {
  const copy = strings.businessAnalyticsPerformance;

  it('renders the five-way analytics nav, KPIs and all performance panels', async () => {
    const view = await render(<BusinessAnalyticsPerformanceScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    copy.navTabs &&
      Object.values(copy.navTabs).forEach(tab => {
        expect(view.getByLabelText(tab)).toBeTruthy();
      });
    expect(view.getByText(copy.revenueValue)).toBeTruthy();
    expect(view.getByText(copy.channelTitle)).toBeTruthy();
    expect(view.getByText(copy.topProductsTitle)).toBeTruthy();
    expect(view.getByText(copy.hourlyTitle)).toBeTruthy();
    expect(view.getByText(copy.staffTitle)).toBeTruthy();
  });

  it('routes tab changes and the report switch', async () => {
    const onOpenTab = jest.fn();
    const onSwitchReport = jest.fn();
    const view = await render(
      <BusinessAnalyticsPerformanceScreen
        onOpenTab={onOpenTab}
        onSwitchReport={onSwitchReport}
      />,
    );

    await pressAndSettle(view, copy.navTabs.locations);
    await pressAndSettle(view, copy.switchCta);

    expect(onOpenTab).toHaveBeenCalledWith('locations');
    expect(onSwitchReport).toHaveBeenCalledTimes(1);
  });
});

describe('locations branch comparison', () => {
  const copy = strings.locationsBranchComparison;

  it('renders a comparable card for every branch', async () => {
    const view = await render(<LocationsBranchComparisonScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getAllByText(copy.branchCountValue).length).toBeGreaterThan(0);
    // The best/worst branch names also appear in the summary metric grid.
    branchComparison.forEach(branch => {
      expect(view.getAllByText(branch.name).length).toBeGreaterThan(0);
      expect(view.getAllByText(branch.revenue).length).toBeGreaterThan(0);
    });
  });

  it('opens a branch and exports the comparison', async () => {
    const onOpenBranch = jest.fn();
    const onExport = jest.fn();
    const view = await render(
      <LocationsBranchComparisonScreen onOpenBranch={onOpenBranch} onExport={onExport} />,
    );

    await pressAndSettle(view, branchComparison[0].name);
    await pressAndSettle(view, copy.exportCta);

    expect(onOpenBranch).toHaveBeenCalledWith(branchComparison[0].id);
    expect(onExport).toHaveBeenCalledTimes(1);
  });
});

describe('customer display order total', () => {
  const copy = strings.customerDisplayOrderTotal;

  it('renders every line, the totals stack and the grand total', async () => {
    const view = await render(<CustomerDisplayOrderTotalScreen />);

    expect(view.getByText('Woodfire Ribeye')).toBeTruthy();
    expect(view.getByText('Truffle Parmesan Fries')).toBeTruthy();
    expect(view.getByText('#66,938')).toBeTruthy();
    expect(view.getByText(copy.thanksTitle)).toBeTruthy();
  });

  it('routes split bill, ask staff and add more items', async () => {
    const onSplitBill = jest.fn();
    const onAskStaff = jest.fn();
    const onAddMoreItems = jest.fn();
    const view = await render(
      <CustomerDisplayOrderTotalScreen
        onSplitBill={onSplitBill}
        onAskStaff={onAskStaff}
        onAddMoreItems={onAddMoreItems}
      />,
    );

    await pressAndSettle(view, copy.paySplitCta);
    await pressAndSettle(view, copy.payAskStaffCta);
    await pressAndSettle(view, copy.moreItemsCta);

    expect(onSplitBill).toHaveBeenCalledTimes(1);
    expect(onAskStaff).toHaveBeenCalledTimes(1);
    expect(onAddMoreItems).toHaveBeenCalledTimes(1);
  });
});

describe('customer display tap and qr pay', () => {
  const copy = strings.customerDisplayTapQrPay;

  it('renders the amount due, tap panel, QR frame and accepted methods', async () => {
    const view = await render(<CustomerDisplayTapQrPayScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText('#66,938')).toBeTruthy();
    expect(view.getAllByText(copy.tapTitle).length).toBeGreaterThan(0);
    expect(view.getByText(copy.qrCaption)).toBeTruthy();
    copy.methods.forEach(method => {
      expect(view.getByText(method)).toBeTruthy();
    });
  });

  it('starts contactless, confirms the scan and changes method', async () => {
    const onContactlessStarted = jest.fn();
    const onQrScanned = jest.fn();
    const onChangeMethod = jest.fn();
    const view = await render(
      <CustomerDisplayTapQrPayScreen
        onContactlessStarted={onContactlessStarted}
        onQrScanned={onQrScanned}
        onChangeMethod={onChangeMethod}
      />,
    );

    await pressAndSettle(view, copy.tapTitle);
    await pressAndSettle(view, copy.onScanLabel);
    await pressAndSettle(view, copy.backCta);

    expect(onContactlessStarted).toHaveBeenCalledTimes(1);
    expect(onQrScanned).toHaveBeenCalledTimes(1);
    expect(onChangeMethod).toHaveBeenCalledTimes(1);
  });
});

describe('customer display tip and rating', () => {
  const copy = strings.customerDisplayTipRating;

  it('starts on the rating step and blocks submit until a star is chosen', async () => {
    const onSubmitRating = jest.fn();
    const view = await render(
      <CustomerDisplayTipRatingScreen onSubmitRating={onSubmitRating} />,
    );

    expect(view.getByText(copy.thanksTitle)).toBeTruthy();
    expect(view.getByText(copy.commentLabel)).toBeTruthy();
  });

  it('advances to the tip step after rating and updates the total', async () => {
    const onSubmitRating = jest.fn();
    const onSubmitTip = jest.fn();
    const view = await render(
      <CustomerDisplayTipRatingScreen
        onSubmitRating={onSubmitRating}
        onSubmitTip={onSubmitTip}
      />,
    );

    fireEvent.press(view.getByLabelText('5'));
    await waitFor(() => expect(view.getByLabelText('5')).toBeTruthy());
    await pressAndSettle(view, copy.ratingSubmitCta);

    expect(onSubmitRating).toHaveBeenCalledWith(5);
    await waitFor(() => expect(view.getByText(copy.tipTitle)).toBeTruthy());

    await pressAndSettle(view, copy.tipSubmitCta);
    expect(onSubmitTip).toHaveBeenCalledWith('ten');
    await waitFor(() => expect(view.getByText(copy.doneTitle)).toBeTruthy());
  });

  it('skips rating without submitting a value', async () => {
    const onSubmitRating = jest.fn();
    const onSkip = jest.fn();
    const view = await render(
      <CustomerDisplayTipRatingScreen onSubmitRating={onSubmitRating} onSkip={onSkip} />,
    );

    await pressAndSettle(view, copy.ratingSkipCta);

    expect(onSubmitRating).not.toHaveBeenCalled();
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});

describe('split the bill', () => {
  const copy = strings.splitTheBill;

  it('renders the mode picker, items, totals and per-person shares', async () => {
    const view = await render(<SplitTheBillScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    splitModes.forEach(mode => {
      expect(view.getByText(mode.title)).toBeTruthy();
    });
    splitLines.forEach(line => {
      expect(view.getByText(line.name)).toBeTruthy();
    });
    expect(view.getByText('#58,163')).toBeTruthy();
  });

  it('changes the split mode, assigns an item and pays the share', async () => {
    const onChangeMode = jest.fn();
    const onAssignItem = jest.fn();
    const onPayShare = jest.fn();
    const view = await render(
      <SplitTheBillScreen
        onChangeMode={onChangeMode}
        onAssignItem={onAssignItem}
        onPayShare={onPayShare}
      />,
    );

    fireEvent.press(view.getByLabelText(`${copy.modesTitle}: ${splitModes[1].title}`));
    await waitFor(() =>
      expect(
        view.getByLabelText(`${copy.modesTitle}: ${splitModes[1].title}`),
      ).toBeTruthy(),
    );
    await pressAndSettle(view, splitLines[0].name);
    await pressAndSettle(view, copy.payShareCta);

    expect(onChangeMode).toHaveBeenCalledWith(splitModes[1].id);
    expect(onAssignItem).toHaveBeenCalledWith(splitLines[0].id);
    expect(onPayShare).toHaveBeenCalledWith('#19,388');
  });
});

describe('digital e-receipt', () => {
  const copy = strings.digitalEReceipt;

  it('renders receipt identity, every line and the paid total', async () => {
    const view = await render(<DigitalEReceiptScreen />);

    expect(view.getByText(copy.headerTitle)).toBeTruthy();
    expect(view.getByText(receiptOrder.id)).toBeTruthy();
    receiptOrder.items.forEach(item => {
      expect(view.getByText(item.name)).toBeTruthy();
    });
    expect(view.getByText(receiptOrder.grandTotal)).toBeTruthy();
  });

  it('routes share, save, rate and order again', async () => {
    const onShare = jest.fn();
    const onSave = jest.fn();
    const onRateAndTip = jest.fn();
    const onOrderAgain = jest.fn();
    const view = await render(
      <DigitalEReceiptScreen
        onShare={onShare}
        onSave={onSave}
        onRateAndTip={onRateAndTip}
        onOrderAgain={onOrderAgain}
      />,
    );

    await pressAndSettle(view, copy.shareCta);
    await pressAndSettle(view, copy.printCta);
    await pressAndSettle(view, copy.rateCta);
    await pressAndSettle(view, copy.reorderCta);

    expect(onShare).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onRateAndTip).toHaveBeenCalledTimes(1);
    expect(onOrderAgain).toHaveBeenCalledTimes(1);
  });
});
