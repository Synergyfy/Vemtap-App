import React from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { PosCustomerLookupListScreen } from '@features/business/screens/PosCustomerLookupListScreen';
import { PosCustomerLookupActiveScreen } from '@features/business/screens/PosCustomerLookupActiveScreen';
import { PosCustomerLookupLoyaltyScreen } from '@features/business/screens/PosCustomerLookupLoyaltyScreen';
import { PosCustomerDossierScreen } from '@features/business/screens/PosCustomerDossierScreen';
import { PosProductsInventoryScreen } from '@features/business/screens/PosProductsInventoryScreen';
import { PosProductShiftStockStatusScreen } from '@features/business/screens/PosProductShiftStockStatusScreen';

afterEach(cleanup);

/** Every interaction flushes before the next, so the act queue stays balanced. */
const press = (element: Parameters<typeof fireEvent.press>[0]) =>
  act(async () => {
    fireEvent.press(element);
  });

const customerCard = {
  id: 'c1',
  name: 'Tolu Ade',
  initials: 'TA',
  contact: '0800  •  tolu@x.com',
  tier: 'Gold • VIP',
  vip: true,
  isNew: false,
  points: '2,450 pts • Gold',
  visits: '12 total',
  spend: '₦120,000',
  lastVisit: 'Today, 9:00 AM',
};

describe('pos customer lookup list', () => {
  const copy = strings.posCustomerLookupList;

  it('filters by segment and attaches or opens the dossier', async () => {
    const onSelectSegment = jest.fn();
    const onAttach = jest.fn();
    const onOpenDossier = jest.fn();
    const view = await render(
      <PosCustomerLookupListScreen
        search=""
        segment="all"
        onSelectSegment={onSelectSegment}
        onAttach={onAttach}
        onOpenDossier={onOpenDossier}
        view={{
          branchName: 'Branch One',
          hasActiveSale: true,
          segments: [
            { id: 'all', label: copy.filterAll, count: 3 },
            { id: 'vip', label: copy.filterVip, count: 1 },
          ],
          customers: [customerCard],
          hasMore: false,
        }}
      />,
    );
    expect(view.getByText('Tolu Ade')).toBeTruthy();
    expect(view.getByText(copy.linkBadge)).toBeTruthy();
    await press(view.getByText(copy.filterVip));
    expect(onSelectSegment).toHaveBeenCalledWith('vip');
    await press(view.getByLabelText(`${copy.attachCta} Tolu Ade`));
    expect(onAttach).toHaveBeenCalledWith('c1');
    await press(view.getByLabelText(`${copy.dossierCta} Tolu Ade`));
    expect(onOpenDossier).toHaveBeenCalledWith('c1');
  });

  it('explains an empty list', async () => {
    const view = await render(
      <PosCustomerLookupListScreen
        search="nobody"
        segment="all"
        view={{
          branchName: '',
          hasActiveSale: false,
          segments: [],
          customers: [],
          hasMore: false,
        }}
      />,
    );
    expect(view.getByText(copy.empty.title)).toBeTruthy();
  });
});

describe('pos customer lookup active', () => {
  const copy = strings.posCustomerLookupActive;

  it('prompts for a phone number', async () => {
    const empty = await render(
      <PosCustomerLookupActiveScreen search="" match={null} ticketLabel="No items yet" />,
    );
    expect(empty.getByText(copy.prompt.title)).toBeTruthy();
  });

  it('attaches the matched customer', async () => {
    const onAttach = jest.fn();

    const view = await render(
      <PosCustomerLookupActiveScreen
        search="0800"
        ticketLabel="Current ticket • 2 items"
        onAttach={onAttach}
        match={{
          id: 'c1',
          name: 'Tolu Ade',
          initials: 'TA',
          phone: '0800',
          tier: 'Gold',
          points: '2,450 pts',
          stats: [
            { id: 'visits', label: copy.visitsLabel, value: '12', note: copy.visitsNote },
          ],
          lastVisit: 'Last here today',
          rewards: [
            {
              id: 'r1',
              title: 'Free drink',
              body: '500 pts',
              badge: copy.rewardReady,
              affordable: true,
            },
          ],
        }}
      />,
    );
    expect(view.getByText('Free drink')).toBeTruthy();
    await press(view.getByText(copy.attachCta('Tolu Ade')));
    expect(onAttach).toHaveBeenCalled();
  });
});

describe('pos customer loyalty', () => {
  const copy = strings.posCustomerLookupLoyalty;
  const loyaltyView = {
    name: 'Tolu Ade',
    initials: 'TA',
    phone: '0800',
    tier: 'Gold',
    balance: '2,450',
    stats: [{ label: copy.visitsLabel, value: '12' }],
    rewards: [
      {
        id: 'r1',
        title: 'Free drink',
        cost: '500 pts',
        body: copy.rewardReady,
        affordable: true,
      },
      {
        id: 'r2',
        title: 'Free meal',
        cost: '5,000 pts',
        body: copy.rewardShort(2550),
        affordable: false,
      },
    ],
    attached: false,
  };

  it('offers a code only for affordable rewards', async () => {
    const onIssueCode = jest.fn();
    const view = await render(
      <PosCustomerLookupLoyaltyScreen
        view={loyaltyView}
        issued={null}
        onIssueCode={onIssueCode}
      />,
    );
    expect(view.getAllByText(copy.issueCta)).toHaveLength(1);
    await press(view.getByText(copy.issueCta));
    expect(onIssueCode).toHaveBeenCalledWith('r1');
  });

  it('shows the issued code', async () => {
    const issued = await render(
      <PosCustomerLookupLoyaltyScreen
        view={loyaltyView}
        issued={{ rewardId: 'r1', code: '123456789' }}
      />,
    );
    expect(issued.getByText('123456789')).toBeTruthy();
  });
});

describe('pos customer dossier', () => {
  const copy = strings.posCustomerDossier;

  it('lists recent visits and opens one', async () => {
    const onOpenVisit = jest.fn();
    const view = await render(
      <PosCustomerDossierScreen
        onOpenVisit={onOpenVisit}
        view={{
          name: 'Tolu Ade',
          initials: 'TA',
          phone: '0800',
          email: '',
          tier: 'Gold',
          since: copy.since('Jan 4'),
          stats: [
            {
              id: 'points',
              label: copy.pointsLabel,
              value: '2,450',
              note: copy.pointsNote,
            },
          ],
          rewards: [],
          visits: [
            {
              id: 's1',
              reference: 'RCT-1',
              when: 'Today',
              total: '₦1,000',
              items: 'Rice',
              tender: 'Cash',
            },
          ],
        }}
      />,
    );
    expect(view.getByText(copy.noRewards)).toBeTruthy();
    await press(view.getByLabelText('RCT-1'));
    expect(onOpenVisit).toHaveBeenCalledWith('s1');
  });
});

describe('pos products inventory', () => {
  const copy = strings.posProductsInventory;

  it('nudges tracked stock and opens an item', async () => {
    const onAdjustStock = jest.fn();
    const onOpenItem = jest.fn();
    const view = await render(
      <PosProductsInventoryScreen
        search=""
        filter="all"
        onAdjustStock={onAdjustStock}
        onOpenItem={onOpenItem}
        view={{
          branchName: 'Branch One',
          counts: { all: 2, low: 1, out: 0 },
          items: [
            {
              id: 'i1',
              name: 'Rice',
              sku: 'R1',
              category: 'Mains',
              price: '₦500',
              stock: 3,
              state: 'low',
            },
            {
              id: 'i2',
              name: 'Tea',
              sku: '',
              category: '',
              price: '₦200',
              stock: null,
              state: 'untracked',
            },
          ],
        }}
      />,
    );
    await press(view.getByLabelText(`Rice ${copy.decreaseLabel}`));
    expect(onAdjustStock).toHaveBeenCalledWith('i1', 2);
    expect(view.queryByLabelText(`Tea ${copy.increaseLabel}`)).toBeNull();
    await press(view.getByLabelText('Tea'));
    expect(onOpenItem).toHaveBeenCalledWith('i2');
  });
});

describe('pos product stock status', () => {
  const copy = strings.posProductShiftStockStatus;

  it('saves a new count and marks sold out', async () => {
    const onSaveCount = jest.fn();
    const onMarkSoldOut = jest.fn();
    const view = await render(
      <PosProductShiftStockStatusScreen
        onSaveCount={onSaveCount}
        onMarkSoldOut={onMarkSoldOut}
        view={{
          name: 'Rice',
          meta: 'SKU R1',
          price: '₦500',
          stock: 10,
          state: 'ok',
          stateLabel: '10 in stock',
          history: [
            {
              id: 'm1',
              title: 'Sale • -1 → 10 on hand',
              detail: 'POS sale',
              when: 'Today',
            },
          ],
        }}
      />,
    );
    await press(view.getByLabelText(`${copy.countTitle} +5`));
    await press(view.getByText(copy.saveCta));
    expect(onSaveCount).toHaveBeenCalledWith(15);
    await press(view.getByLabelText(copy.soldOutCta));
    expect(onMarkSoldOut).toHaveBeenCalled();
    expect(view.getByText('POS sale')).toBeTruthy();
  });

  it('explains items that are not stock-tracked', async () => {
    const view = await render(
      <PosProductShiftStockStatusScreen
        view={{
          name: 'Tea',
          meta: '',
          price: '₦200',
          stock: null,
          state: 'untracked',
          stateLabel: '',
          history: [],
        }}
      />,
    );
    expect(view.getByText(copy.untrackedBody)).toBeTruthy();
  });
});
