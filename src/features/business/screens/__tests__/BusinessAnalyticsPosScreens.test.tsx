import React from 'react';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
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

describe('customer display', () => {
  const press = (element: Parameters<typeof fireEvent.press>[0]) =>
    act(async () => {
      fireEvent.press(element);
    });

  it('welcomes the guest until the till pushes a ticket', async () => {
    const copy = strings.customerDisplayOrderTotal;
    const view = await render(
      <CustomerDisplayOrderTotalScreen venue="Test Kitchen" ticket={null} />,
    );
    expect(view.getByText(copy.welcomeTitle('Test Kitchen'))).toBeTruthy();
  });

  it('shows the live ticket and opens the ways to pay', async () => {
    const copy = strings.customerDisplayOrderTotal;
    const onPay = jest.fn();
    const view = await render(
      <CustomerDisplayOrderTotalScreen
        onPay={onPay}
        ticket={{
          venue: 'Test Kitchen',
          tableLabel: copy.tableLabel('4'),
          lines: [{ id: 'l1', label: '2× Rice', value: '₦1,000' }],
          totals: [{ id: 'subtotal', label: 'Subtotal', value: '₦1,000' }],
          total: '₦1,075',
        }}
      />,
    );
    expect(view.getByText('₦1,075')).toBeTruthy();
    await press(view.getByText(copy.payCta));
    expect(onPay).toHaveBeenCalled();
  });

  it('lists only the enabled payment methods and the transfer account', async () => {
    const copy = strings.customerDisplayTapQrPay;
    const view = await render(
      <CustomerDisplayTapQrPayScreen
        view={{
          total: '₦1,075',
          tableLabel: null,
          methods: [
            { id: 'cash', enabled: true },
            { id: 'oneTap', enabled: false },
          ],
          transfer: {
            bankName: 'Wema',
            accountNumber: '0123456789',
            accountName: 'Test Kitchen',
          },
        }}
      />,
    );
    expect(view.getByText('0123456789')).toBeTruthy();
    expect(view.getByText(copy.methods.cash)).toBeTruthy();
    expect(view.queryByText(copy.methods.oneTap)).toBeNull();
  });

  it('sends the rating and a percentage tip', async () => {
    const copy = strings.customerDisplayTipRating;
    const onSubmit = jest.fn();
    const view = await render(
      <CustomerDisplayTipRatingScreen billTotal={10000} onSubmit={onSubmit} />,
    );
    await press(view.getByLabelText(copy.starLabel(5)));
    await press(view.getByLabelText('10%'));
    await press(view.getByText(copy.submitCta));
    expect(onSubmit).toHaveBeenCalledWith({ rating: 5, tipAmount: 1000 });
  });
});

describe('split the bill', () => {
  const copy = strings.splitTheBill;
  const press = (element: Parameters<typeof fireEvent.press>[0]) =>
    act(async () => {
      fireEvent.press(element);
    });

  it('shows each share, switches mode and settles', async () => {
    const onChangeMode = jest.fn();
    const onSettle = jest.fn();
    const view = await render(
      <SplitTheBillScreen
        lines={[{ id: 'i1', name: 'Rice', qty: 2, price: '₦1,000' }]}
        mode="equal"
        people={[
          { key: 'a', name: 'Tolu', lineIds: [], amount: '', tender: 'cash' },
          { key: 'b', name: 'Ada', lineIds: [], amount: '', tender: 'card' },
        ]}
        shares={[
          { amount: '₦538', detail: 'Tax ₦38' },
          { amount: '₦537', detail: 'Tax ₦37' },
        ]}
        totals={[]}
        grandTotal="₦1,075"
        error={null}
        tenders={['cash', 'card']}
        onChangeMode={onChangeMode}
        onSettle={onSettle}
      />,
    );
    expect(view.getByText('₦538')).toBeTruthy();
    await press(view.getByText(copy.modes.by_item));
    expect(onChangeMode).toHaveBeenCalledWith('by_item');
    await press(view.getByText(copy.settleCta('₦1,075')));
    expect(onSettle).toHaveBeenCalled();
  });

  it('blocks settling while the split does not add up', async () => {
    const onSettle = jest.fn();
    const view = await render(
      <SplitTheBillScreen
        lines={[{ id: 'i1', name: 'Rice', qty: 2, price: '₦1,000' }]}
        mode="custom"
        people={[
          { key: 'a', name: 'Tolu', lineIds: [], amount: '100', tender: 'cash' },
          { key: 'b', name: 'Ada', lineIds: [], amount: '100', tender: 'cash' },
        ]}
        shares={null}
        totals={[]}
        grandTotal="₦1,075"
        error="Custom amounts add up to 200 but the bill is 1075"
        tenders={['cash']}
        onSettle={onSettle}
      />,
    );
    expect(
      view.getByText('Custom amounts add up to 200 but the bill is 1075'),
    ).toBeTruthy();
    await press(view.getByText(copy.settleCta('₦1,075')));
    expect(onSettle).not.toHaveBeenCalled();
  });
});

describe('digital e-receipt', () => {
  it('renders the receipt and offers rating only when a till display is linked', async () => {
    const copy = strings.digitalEReceipt;
    const receipt = {
      id: 's1',
      receiptNumber: 'RCT-1',
      when: 'Today',
      status: 'completed' as const,
      tender: 'Cash',
      amount: '₦1,075',
      cashier: 'Ada',
      storeName: 'Test Kitchen',
      branchName: 'Branch One',
      address: '1 Road',
      phone: '',
      tin: '123',
      header: '',
      footer: 'Come again',
      logo: null,
      customer: null,
      pointsEarned: 0,
      lines: [{ id: 'l1', name: 'Rice', qty: 2, price: '₦1,000', refunded: 0 }],
      totals: [],
      payments: [],
    };
    const view = await render(
      <DigitalEReceiptScreen receipt={receipt} canRate={false} />,
    );
    expect(view.getByText('Come again')).toBeTruthy();
    expect(view.getByText(copy.tinLabel('123'))).toBeTruthy();
    expect(view.queryByText(copy.rateCta)).toBeNull();
  });
});
