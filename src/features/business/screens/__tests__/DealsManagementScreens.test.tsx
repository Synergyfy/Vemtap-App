import React from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import type { DealLedgerRow } from '@api/catalogueApi';
import {
  CentralDealsManagementScreen,
  type CentralDealRow,
} from '@features/business/screens/CentralDealsManagementScreen';
import { DealRedemptionLedgerScreen } from '@features/business/screens/DealRedemptionLedgerScreen';
import { DealItemPickerSheet } from '@features/business/components/DealItemPickerSheet';
import { CreateDealStep1DiscountStrategyScreen } from '@features/business/screens/CreateDealStep1DiscountStrategyScreen';

afterEach(cleanup);

const deals = strings.centralDeals;
const ledger = strings.dealLedger;

const card = (
  id: string,
  title: string,
  tab: CentralDealRow['tab'],
  isPaused = false,
): CentralDealRow => ({
  id,
  dealGroupId: `group-${id}`,
  title,
  subtitle: '',
  discount: '20% OFF',
  wasPrice: '',
  price: '₦8,000',
  branches: 'Wuse',
  status: '',
  schedule: '',
  logistics: '',
  claims: 0,
  redeemed: 0,
  conversion: 0,
  percent: 0,
  tab,
  isPaused,
});

const liveDeals = [
  card('1', 'Lunch Combo', 'active'),
  card('2', 'Weekend Brunch', 'scheduled'),
  card('3', 'Paused Wings', 'drafts', true),
];

describe('Deals & Promotions (live)', () => {
  it('counts and filters by tab', async () => {
    const view = await render(<CentralDealsManagementScreen deals={liveDeals} />);
    expect(view.queryByText('Lunch Combo')).toBeTruthy();
    expect(view.queryByText('Weekend Brunch')).toBeNull();

    const tab = (label: string) =>
      view.getAllByRole('tab').find(node => node.props.accessibilityLabel === label)!;
    await act(async () => {
      fireEvent.press(tab('Scheduled'));
    });
    expect(view.queryByText('Weekend Brunch')).toBeTruthy();
    expect(view.queryByText('Lunch Combo')).toBeNull();

    await act(async () => {
      fireEvent.press(tab('Expired'));
    });
    expect(view.queryByText(deals.emptyByTab.expired.title)).toBeTruthy();
  });

  it('offers Resume for a paused deal and reports its group id', async () => {
    const onResumeDeal = jest.fn();
    const view = await render(
      <CentralDealsManagementScreen deals={liveDeals} onResumeDeal={onResumeDeal} />,
    );
    const tab = view
      .getAllByRole('tab')
      .find(node => node.props.accessibilityLabel === 'Drafts')!;
    await act(async () => {
      fireEvent.press(tab);
    });
    await act(async () => {
      fireEvent.press(view.getByLabelText(deals.resume));
    });
    expect(onResumeDeal).toHaveBeenCalledWith('group-3');
    expect(view.queryByLabelText(deals.pause)).toBeNull();
  });

  it('shows the live net revenue instead of the design figure', async () => {
    const view = await render(
      <CentralDealsManagementScreen deals={liveDeals} netRevenue="₦8,500" />,
    );
    expect(view.queryByText('₦8,500')).toBeTruthy();
    expect(view.queryByText('₦1,248,000')).toBeNull();
  });
});

const ledgerRow = (overrides: Partial<DealLedgerRow>): DealLedgerRow => ({
  id: 'c1',
  claimCode: 'VEM-1',
  status: 'redeemed',
  customerName: 'Ada O.',
  contact: 'ad***@mail.com',
  dealName: 'Lunch Combo',
  dealGroupId: 'group-1',
  offerId: 'offer-1',
  branchId: 'branch-1',
  branchName: 'Wuse',
  amount: 8000,
  discountGiven: 2000,
  claimedAt: '2026-10-15T09:00:00Z',
  redeemedAt: '2026-10-15T10:00:00Z',
  expiresAt: null,
  activityAt: '2026-10-15T10:00:00Z',
  ...overrides,
});

describe('Redemption Ledger', () => {
  const base = {
    totals: { claims: 3, redeemed: 1, expired: 1, netRevenue: 8000, discountGiven: 2000 },
    status: 'all' as const,
    onChangeStatus: jest.fn(),
    period: '30' as const,
    onChangePeriod: jest.fn(),
    branch: 'all',
    branchOptions: [],
    onChangeBranch: jest.fn(),
    now: new Date('2026-10-15T15:00:00Z'),
  };

  it('leads with net revenue and groups rows by day', async () => {
    const view = await render(
      <DealRedemptionLedgerScreen
        {...base}
        rows={[
          ledgerRow({}),
          ledgerRow({
            id: 'c2',
            claimCode: 'VEM-2',
            status: 'claimed',
            activityAt: '2026-10-14T10:00:00Z',
          }),
        ]}
      />,
    );
    // The net-revenue figure is the page's one header-level number.
    expect(view.getByRole('header', { name: '₦8,000' })).toBeTruthy();
    expect(view.getByText(ledger.today)).toBeTruthy();
    expect(view.getByText(ledger.yesterday)).toBeTruthy();
    // Status is words in a pill, never colour alone, and each row reads as one sentence.
    // once as the tab, once as the row's pill
    expect(view.getAllByText(ledger.statusLabels.claimed)).toHaveLength(2);
    expect(
      view.getByLabelText(/Lunch Combo, Ada O\., Redeemed, ₦8,000, Today/),
    ).toBeTruthy();
  });

  it('reports status changes and offers a reset when filters empty the list', async () => {
    const onChangeStatus = jest.fn();
    const onResetFilters = jest.fn();
    const view = await render(
      <DealRedemptionLedgerScreen
        {...base}
        rows={[]}
        status="expired"
        onChangeStatus={onChangeStatus}
        isFiltered
        onResetFilters={onResetFilters}
      />,
    );
    expect(view.getByText(ledger.emptyFilteredTitle)).toBeTruthy();
    await act(async () => {
      fireEvent.press(view.getByText(ledger.resetFilters));
    });
    expect(onResetFilters).toHaveBeenCalled();

    const tab = view
      .getAllByRole('tab')
      .find(node => node.props.accessibilityLabel === 'Redeemed')!;
    await act(async () => {
      fireEvent.press(tab);
    });
    expect(onChangeStatus).toHaveBeenCalledWith('redeemed');
  });

  it('pages on demand', async () => {
    const onLoadMore = jest.fn();
    const view = await render(
      <DealRedemptionLedgerScreen
        {...base}
        rows={[ledgerRow({})]}
        hasMore
        onLoadMore={onLoadMore}
      />,
    );
    await act(async () => {
      fireEvent.press(view.getByLabelText(ledger.loadMore));
    });
    expect(onLoadMore).toHaveBeenCalled();
  });
});

describe('Deal item picker', () => {
  const picker = strings.dealItemPicker;
  const items = [
    {
      id: 'i1',
      name: 'Jollof Bowl',
      price: 6000,
      kind: 'product' as const,
      category: 'Mains',
    },
    { id: 'i2', name: 'Zobo', price: 1500, kind: 'product' as const, category: 'Drinks' },
    { id: 'i3', name: 'Deep Massage', price: 15000, kind: 'service' as const },
  ];

  it('picks a bundle and reports the chosen items', async () => {
    const onConfirm = jest.fn();
    const view = await render(
      <DealItemPickerSheet
        visible
        onClose={jest.fn()}
        items={items}
        selectedIds={[]}
        onConfirm={onConfirm}
      />,
    );
    expect(view.getByText(picker.confirm(0))).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByLabelText('Jollof Bowl'));
    });
    await act(async () => {
      fireEvent.press(view.getByLabelText('Zobo'));
    });
    expect(view.getByText(picker.selectedSummary(2, '₦7,500'))).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText(picker.confirm(2)));
    });
    expect(onConfirm).toHaveBeenCalledWith([items[0], items[1]]);
  });

  it('filters by name or category', async () => {
    const view = await render(
      <DealItemPickerSheet
        visible
        onClose={jest.fn()}
        items={items}
        selectedIds={[]}
        onConfirm={jest.fn()}
      />,
    );
    await act(async () => {
      fireEvent.changeText(view.getByLabelText(picker.searchPlaceholder), 'drinks');
    });
    expect(view.queryByLabelText('Zobo')).toBeTruthy();
    expect(view.queryByLabelText('Jollof Bowl')).toBeNull();
  });

  it('says so when there are no live items', async () => {
    const view = await render(
      <DealItemPickerSheet
        visible
        onClose={jest.fn()}
        items={[]}
        selectedIds={[]}
        onConfirm={jest.fn()}
      />,
    );
    expect(view.getByText(picker.emptyTitle)).toBeTruthy();
  });
});

describe('Create deal Step 1 without an item', () => {
  const { step1 } = strings.businessCreateDeal;

  it('asks for items and holds Continue until one is chosen', async () => {
    const onContinue = jest.fn();
    const onChangeItem = jest.fn();
    const view = await render(
      <CreateDealStep1DiscountStrategyScreen
        onBack={jest.fn()}
        needsItem
        onContinue={onContinue}
        onChangeItem={onChangeItem}
      />,
    );
    expect(view.getByText(step1.chooseItemsTitle)).toBeTruthy();
    await act(async () => {
      fireEvent.press(view.getByText(step1.continueLabel));
    });
    expect(onContinue).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(view.getByText(step1.chooseItemsCta));
    });
    expect(onChangeItem).toHaveBeenCalled();
  });
});
