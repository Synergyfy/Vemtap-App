import { strings } from '@constants/strings';
import {
  displayUrl,
  toBusinessQrView,
  toLocationQrView,
  toQrReadyView,
} from '@features/business/utils/qrMappers';
import { qrSummaryFixture } from './helpers/qrFixtures';

describe('QR view models', () => {
  it('strips the protocol for display', () => {
    expect(displayUrl('https://vemtap.com/b/ABC')).toBe('vemtap.com/b/ABC');
    expect(displayUrl('http://localhost:3000/b/ABC')).toBe('localhost:3000/b/ABC');
  });

  it('builds the business QR with comparisons and the claim rate', () => {
    const view = toBusinessQrView(qrSummaryFixture);
    expect(view.statusSub).toBe(
      strings.businessQr.statusSub('Wuse Flagship', 'Urban Grill'),
    );
    expect(view.svg.startsWith('<svg')).toBe(true);
    expect(view.stats.map(stat => [stat.id, stat.value, stat.direction])).toEqual([
      ['scans', '120', 'up'],
      ['new', '30', 'up'],
      ['claims', '25%', 'flat'],
    ]);
  });

  it('groups branch codes and tap points per branch', () => {
    const view = toLocationQrView(qrSummaryFixture);
    expect(view.groups.map(group => [group.id, group.count])).toEqual([
      [null, '(4)'],
      ['b-wuse', '(2)'],
      ['b-garki', '(2)'],
    ]);
    expect(view.branchCodes[0]).toMatchObject({
      branchId: 'b-wuse',
      url: 'https://vemtap.com/b/WUSE01',
    });
    expect(view.points.map(point => [point.status, point.tone, point.icon])).toEqual([
      [strings.locationQr.statusLive, 'success', 'contactlessPay'],
      [strings.locationQr.statusInactive, 'neutral', 'storefront'],
    ]);
    expect(view.points[0].meta).toBe('Wuse Flagship • Card • Main counter');
  });

  it('describes the QR-ready business from its main branch', () => {
    const view = toQrReadyView(qrSummaryFixture);
    expect(view.descriptor).toBe('Wuse Flagship • Wuse II, Abuja');
    expect(view.displayUrl).toBe('vemtap.com/b/BIZ8820');
  });
});
