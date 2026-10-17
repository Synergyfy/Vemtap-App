import { strings } from '@constants/strings';
import {
  toCustomerDirectoryView,
  toCustomerDossierView,
  toCustomerRow,
} from '@features/business/utils/crmMappers';
import {
  amakaCard,
  directoryFixture,
  dossierFixture,
  michaelCard,
} from './helpers/crmFixtures';

const crm = strings.customerCrm;
const dossier = strings.customerDossier;

describe('CRM view models', () => {
  it('builds a directory row with contact, stats and the last interaction', () => {
    const row = toCustomerRow(michaelCard);
    expect(row.initials).toBe('MJ');
    expect(row.segmentTone).toBe('brand');
    expect(row.contact).toBe('+234 803 219 8831 · michael@example.com');
    expect(row.stats.map(stat => stat.value)).toEqual(['14', '11', '4', '2,450']);
    expect(row.context).toBe(crm.interaction.pos('RC-94021'));
    expect(row.icon).toBe('pointOfSale');
  });

  it('flags a claim as the success context and handles missing contact', () => {
    const row = toCustomerRow(amakaCard);
    expect(row.contact).toBe(crm.noContact);
    expect(row.contextTone).toBe('success');
    expect(row.segment).toBe(crm.segmentLine(crm.segments.new, 'Bronze'));
  });

  it('summarises the directory pages with counts and the insight', () => {
    const view = toCustomerDirectoryView([directoryFixture]);
    expect(view.rows).toHaveLength(2);
    expect(view.filters.map(filter => [filter.key, filter.count])).toEqual([
      ['all', '2'],
      ['frequent', '1'],
      ['returning', '0'],
      ['new', '1'],
      ['inactive', '0'],
    ]);
    expect(view.insightTitle).toBe(crm.insightsTitle('1', '58%'));
    expect(view.insightBody).toBe(crm.insightsBody('3'));
  });

  it('falls back when no customer is frequent yet', () => {
    const view = toCustomerDirectoryView([
      {
        ...directoryFixture,
        meta: {
          ...directoryFixture.meta,
          insight: { ...directoryFixture.meta.insight, frequentCustomers: 0 },
        },
      },
    ]);
    expect(view.insightTitle).toBe(crm.insightsEmpty);
  });

  it('builds the dossier', () => {
    const view = toCustomerDossierView(dossierFixture);
    expect(view.preferred).toBe(`${dossier.preferredPrefix}Wuse Branch`);
    expect(view.metrics[2]).toMatchObject({
      figure: dossier.dealsFigure('4'),
      sub: dossier.dealsSub('100%'),
    });
    expect(view.claims[0]).toMatchObject({ status: 'Redeemed', tone: 'success' });
    expect(view.ledger.map(entry => entry.positive)).toEqual([true, false]);
    expect(view.note?.tags).toEqual(['vip', 'wine']);
    expect(view.code).toBe('C0FFEE00');
  });
});
