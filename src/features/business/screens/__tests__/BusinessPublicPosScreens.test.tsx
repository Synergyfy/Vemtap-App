import React from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { PublicPosOrderMenuScreen } from '@features/business/screens/PublicPosOrderMenuScreen';
import { PublicPosCartReviewScreen } from '@features/business/screens/PublicPosCartReviewScreen';
import { PublicPosOrderTrackingScreen } from '@features/business/screens/PublicPosOrderTrackingScreen';
import { MerchantPosKitchenStreamScreen } from '@features/business/screens/MerchantPosKitchenStreamScreen';

afterEach(cleanup);

const press = (element: Parameters<typeof fireEvent.press>[0]) =>
  act(async () => {
    fireEvent.press(element);
  });
const type = (element: Parameters<typeof fireEvent.changeText>[0], text: string) =>
  act(async () => {
    fireEvent.changeText(element, text);
  });

describe('public pos menu', () => {
  const copy = strings.publicPosMenu;
  const menuView = {
    venue: 'Test Kitchen',
    branch: 'Branch One',
    tableLabel: copy.tableLabel('4'),
    acceptingOrders: true,
    prepLabel: copy.prepLabel(15),
    categories: [{ id: 'c1', label: 'Mains' }],
    items: [
      { id: 'i1', name: 'Rice', detail: '', price: '₦500', inCart: 0, soldOut: false },
      { id: 'i2', name: 'Soup', detail: '', price: '₦900', inCart: 0, soldOut: true },
    ],
    cart: { count: 1, total: '₦500' },
  };

  it('adds available dishes and opens the tray', async () => {
    const onAddItem = jest.fn();
    const onReviewOrder = jest.fn();
    const view = await render(
      <PublicPosOrderMenuScreen
        search=""
        category="all"
        view={menuView}
        onAddItem={onAddItem}
        onReviewOrder={onReviewOrder}
      />,
    );
    expect(view.getByText(copy.soldOut)).toBeTruthy();
    await press(view.getByLabelText(`${copy.addCta} Rice`));
    expect(onAddItem).toHaveBeenCalledWith('i1');
    await press(view.getByText(copy.reviewCta(1, '₦500')));
    expect(onReviewOrder).toHaveBeenCalled();
  });

  it('warns and blocks review while QR orders are paused', async () => {
    const onReviewOrder = jest.fn();
    const view = await render(
      <PublicPosOrderMenuScreen
        search=""
        category="all"
        view={{ ...menuView, acceptingOrders: false }}
        onReviewOrder={onReviewOrder}
      />,
    );
    expect(view.getByText(copy.pausedNote)).toBeTruthy();
    await press(view.getByText(copy.reviewCta(1, '₦500')));
    expect(onReviewOrder).not.toHaveBeenCalled();
  });
});

describe('public pos cart review', () => {
  const copy = strings.publicPosCartReview;

  it('needs a name and phone before sending to the kitchen', async () => {
    const onSubmitOrder = jest.fn();
    const props = {
      tableLabel: 'Table 4',
      lines: [{ id: 'i1', name: 'Rice', qty: 1, price: '₦500' }],
      totals: [{ id: 'subtotal', label: 'Subtotal', value: '₦500' }],
      total: '₦500',
      notes: '',
      error: null,
      onSubmitOrder,
    };
    const blank = await render(<PublicPosCartReviewScreen {...props} name="" phone="" />);
    await press(blank.getByText(copy.submitCta('₦500')));
    expect(onSubmitOrder).not.toHaveBeenCalled();
  });

  it('sends a complete order', async () => {
    const onSubmitOrder = jest.fn();
    const onEditName = jest.fn();
    const view = await render(
      <PublicPosCartReviewScreen
        tableLabel="Table 4"
        lines={[{ id: 'i1', name: 'Rice', qty: 1, price: '₦500' }]}
        totals={[]}
        total="₦500"
        name="Tolu Ade"
        phone="08012345678"
        notes=""
        error={null}
        onEditName={onEditName}
        onSubmitOrder={onSubmitOrder}
      />,
    );
    await type(view.getByLabelText(copy.nameLabel), 'Tolu');
    expect(onEditName).toHaveBeenCalledWith('Tolu');
    await press(view.getByText(copy.submitCta('₦500')));
    expect(onSubmitOrder).toHaveBeenCalled();
  });
});

describe('public pos order tracking', () => {
  it('shows the live steps and the order', async () => {
    const copy = strings.publicPosOrderTracking;
    const view = await render(
      <PublicPosOrderTrackingScreen
        view={{
          headline: copy.headline.processing,
          body: copy.body('Test Kitchen', '4'),
          readyBy: copy.readyBy('12:20 PM'),
          cancelled: false,
          steps: [
            { status: 'new', label: copy.steps.new, at: '12:00 PM', reached: true },
            {
              status: 'processing',
              label: copy.steps.processing,
              at: '12:03 PM',
              reached: true,
            },
            { status: 'ready', label: copy.steps.ready, at: '', reached: false },
          ],
          reference: '#ABCDEF12',
          tableLabel: copy.tableLabel('4'),
          server: copy.serverLabel('Musa'),
          lines: [{ id: 'l1', label: '1× Rice', value: '₦500' }],
          total: '₦500',
        }}
      />,
    );
    expect(view.getByText(copy.headline.processing)).toBeTruthy();
    expect(view.getByText(copy.steps.ready)).toBeTruthy();
    expect(view.getByText('1× Rice')).toBeTruthy();
  });
});

describe('merchant kitchen stream', () => {
  const copy = strings.merchantPosKitchenStream;

  it('moves a new order forward and switches stages', async () => {
    const onAction = jest.fn();
    const onSelectTab = jest.fn();
    const view = await render(
      <MerchantPosKitchenStreamScreen
        tab="new"
        onAction={onAction}
        onSelectTab={onSelectTab}
        view={{
          branchLabel: 'Branch One',
          counts: { new: 1, processing: 0, ready: 0, completed: 3 },
          orders: [
            {
              id: 'o1',
              reference: '#ABCDEF12',
              tableLabel: copy.tableLabel('4'),
              guest: 'Tolu',
              guestPhone: null,
              elapsed: copy.elapsed(4),
              lines: [{ id: 'l1', qty: '1', name: 'Rice', price: '₦500' }],
              note: 'No pepper',
              total: '₦500',
              paid: false,
            },
          ],
          stats: { active: '1', avgPrep: copy.avgPrepValue(12), unpaid: '₦500' },
        }}
      />,
    );
    expect(view.getByText('No pepper')).toBeTruthy();
    await press(view.getByText(copy.actions.accept));
    expect(onAction).toHaveBeenCalledWith('o1', 'accept');
    await press(view.getByText(copy.tabs.ready));
    expect(onSelectTab).toHaveBeenCalledWith('ready');
  });
});
