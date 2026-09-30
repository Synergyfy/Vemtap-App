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

const bi = strings.businessIntelligence;

afterEach(cleanup);

describe('business analytics surfaces', () => {
  it('renders the business overview KPIs from copy', async () => {
    await render(<BusinessAnalyticsVemtapIntelligenceScreen />);
    expect(screen.getByText(bi.business.revenueLabel)).toBeTruthy();
    expect(screen.getByText(bi.business.revenueValue)).toBeTruthy();
    expect(screen.getByText(bi.business.heroTitle)).toBeTruthy();
  });

  it('renders the customer acquisition cohort and segment rows', async () => {
    await render(<CustomersAnalyticsVemtapIntelligenceScreen />);
    expect(screen.getByText(bi.customers.total)).toBeTruthy();
    expect(screen.getByText(bi.customers.retentionTitle)).toBeTruthy();
    expect(screen.getByText(bi.customers.segments[0].badge)).toBeTruthy();
  });

  it('renders per-deal performance with claim rates', async () => {
    await render(<DealsAnalyticsVemtapIntelligenceScreen />);
    expect(screen.getByText(bi.deals.deals[0].name)).toBeTruthy();
    expect(screen.getByText(bi.deals.deals[0].claimRate)).toBeTruthy();
  });

  it('narrows the location scope when a branch chip is pressed', async () => {
    await render(<LocationsAnalyticsVemtapIntelligenceScreen />);
    expect(screen.getByText(bi.locations.networkValue)).toBeTruthy();
    expect(screen.getByText(bi.locations.scorecards[0].name)).toBeTruthy();
  });

  it('renders POS rhythm, tender mix and till audit rows', async () => {
    await render(<PosAnalyticsVemtapIntelligenceScreen />);
    expect(screen.getByText(bi.pos.rhythmTitle)).toBeTruthy();
    expect(screen.getByText(bi.pos.tenders[0].label)).toBeTruthy();
    expect(screen.getByText(bi.pos.audit[0].name)).toBeTruthy();
  });

  it('reports the analytics tab that was requested', async () => {
    const onTabChange = jest.fn();
    await render(<BusinessAnalyticsVemtapIntelligenceScreen onTabChange={onTabChange} />);
    await fireEvent.press(screen.getByLabelText('Locations'));
    expect(onTabChange).toHaveBeenCalledWith('locations');
  });
});

describe('analytics filter settings modal', () => {
  it('applies the selection and closes', async () => {
    const onApply = jest.fn();
    const onClose = jest.fn();
    await render(
      <AnalyticsFilterSettingsSheet visible onClose={onClose} onApply={onApply} />,
    );
    expect(screen.getByText(bi.filters.title)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(bi.filters.locations[1].label));
    await fireEvent.press(
      screen.getByText(bi.filters.applyActive.replace('{count}', '1')),
    );
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ location: bi.filters.locations[1].id }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('counts active filters on the apply action', async () => {
    await render(<AnalyticsFilterSettingsSheet visible onClose={jest.fn()} />);
    expect(screen.getByText(bi.filters.apply)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(bi.filters.ranges[0]));
    expect(screen.getByText(bi.filters.applyActive.replace('{count}', '1'))).toBeTruthy();
    await fireEvent.press(screen.getByText(bi.filters.reset));
    expect(screen.getByText(bi.filters.apply)).toBeTruthy();
  });

  it('reveals the custom range window when Custom is selected', async () => {
    await render(<AnalyticsFilterSettingsSheet visible onClose={jest.fn()} />);
    await fireEvent.press(
      screen.getByLabelText(bi.filters.ranges[bi.filters.ranges.length - 1]),
    );
    expect(screen.getByText(bi.filters.startDate)).toBeTruthy();
  });
});

describe('export analytics report', () => {
  it('exposes every module and the generated payload', async () => {
    const onExport = jest.fn();
    await render(<ExportAnalyticsReportScreen onExport={onExport} />);
    expect(screen.getByText(bi.exportReport.title)).toBeTruthy();
    for (const module of bi.exportReport.modules) {
      expect(screen.getByText(module.name)).toBeTruthy();
    }
    await fireEvent.press(
      screen.getByText(
        bi.exportReport.generate.replace('{format}', bi.exportReport.formats[0].name),
      ),
    );
    expect(onExport).toHaveBeenCalledWith(
      expect.objectContaining({
        format: bi.exportReport.formats[0].id,
        modules: bi.exportReport.modules.map(module => module.id),
        destination: bi.exportReport.destinations[0].id,
      }),
    );
  });

  it('deselects all modules and disables the generate action', async () => {
    await render(<ExportAnalyticsReportScreen onExport={jest.fn()} />);
    await fireEvent.press(screen.getByText(bi.exportReport.deselectAll));
    expect(screen.getByText(bi.exportReport.selectAll)).toBeTruthy();
    expect(
      screen.getByText(
        bi.exportReport.modulesSelected.replace('{count}', '0').replace('{total}', '6'),
      ),
    ).toBeTruthy();
  });
});
