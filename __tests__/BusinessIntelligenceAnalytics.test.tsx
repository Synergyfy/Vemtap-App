import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { BusinessAnalyticsVemtapIntelligenceScreen } from '@features/business/screens/BusinessAnalyticsVemtapIntelligenceScreen';
import { CustomersAnalyticsVemtapIntelligenceScreen } from '@features/business/screens/CustomersAnalyticsVemtapIntelligenceScreen';
import { DealsAnalyticsVemtapIntelligenceScreen } from '@features/business/screens/DealsAnalyticsVemtapIntelligenceScreen';
import { LocationsAnalyticsVemtapIntelligenceScreen } from '@features/business/screens/LocationsAnalyticsVemtapIntelligenceScreen';
import { PosAnalyticsVemtapIntelligenceScreen } from '@features/business/screens/PosAnalyticsVemtapIntelligenceScreen';
import { AnalyticsFilterSettingsSheet } from '@features/business/screens/AnalyticsFilterSettingsSheet';
import { ExportAnalyticsReportScreen } from '@features/business/screens/ExportAnalyticsReportScreen';
import {
  toBusinessOverviewView,
  toCustomersAnalyticsView,
  toDealsAnalyticsView,
  toLocationsAnalyticsView,
  toPosAnalyticsView,
} from '@features/business/utils/analyticsMappers';
import {
  customersFixture,
  dealsFixture,
  locationsFixture,
  overviewFixture,
  posFixture,
} from './helpers/analyticsFixtures';

const bi = strings.businessIntelligence;

afterEach(cleanup);

describe('business analytics surfaces', () => {
  it('renders the business overview from the API figures', async () => {
    await render(
      <BusinessAnalyticsVemtapIntelligenceScreen
        view={toBusinessOverviewView(overviewFixture)}
      />,
    );
    expect(screen.getByText(bi.business.revenueLabel)).toBeTruthy();
    expect(screen.getByText('₦485,000')).toBeTruthy();
    expect(screen.getByText(bi.vsPrevious('+21.3%'))).toBeTruthy();
    expect(screen.getByText(bi.business.busiestDay('Saturday'))).toBeTruthy();
    expect(screen.getByText(bi.business.topDeal('Prime Lunch Combo'))).toBeTruthy();
  });

  it('shows a loading state before data arrives', async () => {
    await render(<BusinessAnalyticsVemtapIntelligenceScreen />);
    expect(screen.getByText(bi.loading)).toBeTruthy();
  });

  it('shows an error instead of figures when the request fails', async () => {
    await render(
      <BusinessAnalyticsVemtapIntelligenceScreen isError onRetry={jest.fn()} />,
    );
    expect(screen.getByText(bi.error.title)).toBeTruthy();
    expect(screen.queryByText(bi.business.revenueLabel)).toBeNull();
  });

  it('renders customer cohorts, dormant customers and segments', async () => {
    const onReengage = jest.fn();
    await render(
      <CustomersAnalyticsVemtapIntelligenceScreen
        view={toCustomersAnalyticsView(customersFixture)}
        onReengage={onReengage}
      />,
    );
    expect(screen.getByText(bi.customers.total)).toBeTruthy();
    expect(screen.getByText('120')).toBeTruthy();
    expect(screen.getByText(bi.customers.inactiveBody('9'))).toBeTruthy();
    expect(screen.getByText(bi.customers.segments.vip)).toBeTruthy();
    expect(screen.getByText(bi.customers.channels.claim)).toBeTruthy();
    await fireEvent.press(screen.getByText(bi.customers.inactiveCta));
    expect(onReengage).toHaveBeenCalled();
  });

  it('renders per-deal performance and opens a deal', async () => {
    const onOpenDeal = jest.fn();
    await render(
      <DealsAnalyticsVemtapIntelligenceScreen
        view={toDealsAnalyticsView(dealsFixture, null)}
        onOpenDeal={onOpenDeal}
      />,
    );
    expect(screen.getAllByText('Prime Lunch Combo').length).toBeGreaterThan(0);
    expect(screen.getByText(bi.deals.percentOff('20'))).toBeTruthy();
    expect(screen.getByText(bi.deals.endedBadge)).toBeTruthy();
    expect(screen.getByText(bi.deals.boostNone)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Prime Lunch Combo'));
    expect(onOpenDeal).toHaveBeenCalledWith('g-lunch');
  });

  it('narrows the location scope when a branch chip is pressed', async () => {
    const onSelectBranch = jest.fn();
    const view = toLocationsAnalyticsView({
      ...locationsFixture,
      branches: [
        ...locationsFixture.branches,
        {
          ...locationsFixture.branches[1],
          branchId: 'b-maitama',
          name: 'Maitama Heights',
        },
      ],
    });
    await render(
      <LocationsAnalyticsVemtapIntelligenceScreen
        view={view}
        onSelectBranch={onSelectBranch}
      />,
    );
    expect(screen.getByText('₦485,000')).toBeTruthy();
    expect(screen.getAllByText('Wuse Flagship').length).toBeGreaterThan(0);
    await fireEvent.press(screen.getByLabelText('Maitama Heights'));
    expect(onSelectBranch).toHaveBeenCalledWith('b-maitama');
  });

  it('renders POS rhythm, tender mix and cashier rows', async () => {
    await render(
      <PosAnalyticsVemtapIntelligenceScreen view={toPosAnalyticsView(posFixture)} />,
    );
    expect(screen.getByText(bi.pos.rhythmTitle)).toBeTruthy();
    expect(screen.getAllByText(bi.pos.tenders.cash).length).toBeGreaterThan(0);
    expect(screen.getByText('Ada Obi')).toBeTruthy();
    expect(screen.getByText(bi.pos.peak(1, '20:00', '₦98k'))).toBeTruthy();
  });

  it('reports the analytics tab that was requested', async () => {
    const onTabChange = jest.fn();
    await render(
      <BusinessAnalyticsVemtapIntelligenceScreen
        view={toBusinessOverviewView(overviewFixture)}
        onTabChange={onTabChange}
      />,
    );
    await fireEvent.press(screen.getByLabelText('Locations'));
    expect(onTabChange).toHaveBeenCalledWith('locations');
  });
});

describe('analytics filter settings modal', () => {
  const value = {
    preset: '30d' as const,
    customFrom: null,
    customTo: null,
    branchId: null,
  };
  const branches = [
    { id: 'b-wuse', name: 'Wuse Flagship', address: 'Wuse II' },
    { id: 'b-garki', name: 'Garki Express', address: 'Area 11' },
  ];

  it('applies a branch selection and closes', async () => {
    const onApply = jest.fn();
    const onClose = jest.fn();
    await render(
      <AnalyticsFilterSettingsSheet
        visible
        value={value}
        branches={branches}
        onClose={onClose}
        onApply={onApply}
      />,
    );
    await fireEvent.press(screen.getByLabelText('Garki Express'));
    await fireEvent.press(
      screen.getByText(bi.filters.applyActive.replace('{count}', '1')),
    );
    expect(onApply).toHaveBeenCalledWith({
      preset: '30d',
      customFrom: null,
      customTo: null,
      branchId: 'b-garki',
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('counts active filters and resets them', async () => {
    await render(
      <AnalyticsFilterSettingsSheet
        visible
        value={value}
        branches={branches}
        onClose={jest.fn()}
      />,
    );
    expect(screen.getByText(bi.filters.apply)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(bi.filters.ranges.today));
    expect(screen.getByText(bi.filters.applyActive.replace('{count}', '1'))).toBeTruthy();
    await fireEvent.press(screen.getByText(bi.filters.reset));
    expect(screen.getByText(bi.filters.apply)).toBeTruthy();
  });

  it('validates a custom window before applying it', async () => {
    const onApply = jest.fn();
    await render(
      <AnalyticsFilterSettingsSheet
        visible
        value={value}
        branches={branches}
        onClose={jest.fn()}
        onApply={onApply}
      />,
    );
    await fireEvent.press(screen.getByLabelText(bi.filters.ranges.custom));
    await fireEvent.changeText(screen.getByLabelText(bi.filters.startDate), '2026-10-10');
    await fireEvent.changeText(screen.getByLabelText(bi.filters.endDate), '2026-10-01');
    expect(screen.getByText(bi.filters.customInvalid)).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText(bi.filters.endDate), '2026-10-20');
    await fireEvent.press(
      screen.getByText(bi.filters.applyActive.replace('{count}', '1')),
    );
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        preset: 'custom',
        customFrom: '2026-10-10',
        customTo: '2026-10-20',
      }),
    );
  });
});

describe('export analytics report', () => {
  const scope = {
    timeframe: '1 Oct – 7 Oct 2026',
    timeframeMeta: '7 days',
    branch: 'All Locations',
  };

  it('shows the live scope and exports every module by default', async () => {
    const onExport = jest.fn();
    await render(<ExportAnalyticsReportScreen scope={scope} onExport={onExport} />);
    expect(screen.getByText(scope.timeframe)).toBeTruthy();
    expect(screen.getByText(scope.branch)).toBeTruthy();
    for (const module of bi.exportReport.modules) {
      expect(screen.getByText(module.name)).toBeTruthy();
    }
    await fireEvent.press(
      screen.getByText(
        bi.exportReport.generate.replace('{format}', bi.exportReport.formats[0].name),
      ),
    );
    expect(onExport).toHaveBeenCalledWith({
      format: 'csv',
      modules: bi.exportReport.modules.map(module => module.id),
    });
  });

  it('cannot export with no modules, and shows the result message', async () => {
    const onExport = jest.fn();
    await render(
      <ExportAnalyticsReportScreen
        scope={scope}
        onExport={onExport}
        message={{ tone: 'error', text: bi.exportReport.shareUnavailable }}
      />,
    );
    expect(screen.getByText(bi.exportReport.shareUnavailable)).toBeTruthy();
    await fireEvent.press(screen.getByText(bi.exportReport.deselectAll));
    expect(
      screen.getByText(
        bi.exportReport.modulesSelected.replace('{count}', '0').replace('{total}', '6'),
      ),
    ).toBeTruthy();
    await fireEvent.press(
      screen.getByText(
        bi.exportReport.generate.replace('{format}', bi.exportReport.formats[0].name),
      ),
    );
    expect(onExport).not.toHaveBeenCalled();
  });
});
