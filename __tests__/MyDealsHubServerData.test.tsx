import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MyDealsHubScreen } from '@features/myDeals/screens/MyDealsHubScreen';
import { sortMyDeals } from '@features/myDeals/components/MyDealsFilterSheet';
import { strings } from '@constants/strings';
import { claimFixture } from './helpers/mockCustomerHub';

jest.mock('@features/accountHub/hooks/useSavedHub', () =>
  jest.requireActual('./helpers/mockCustomerHub').mockSavedHubModule(),
);

jest.mock('@features/myDeals/hooks/useMyClaims', () =>
  jest.requireActual('./helpers/mockCustomerHub').mockMyClaimsModule(),
);

jest.mock('@features/accountHub/hooks/useSavings', () =>
  jest.requireActual('./helpers/mockCustomerHub').mockSavingsModule(),
);

const { useMyClaims, useMyGifts, useMyDealsSavingsTotal } = jest.requireMock(
  '@features/myDeals/hooks/useMyClaims',
);

/**
 * These tests are about the My Deals hub being *server* driven: the search, the
 * four tab rows and the summary are all asserted against the hooks they come
 * from, so a stub that returns the wrong thing shows up as a failed expectation
 * rather than as plausible-looking hardcoded rows.
 *
 * The hub used to render a fabricated "Gifted to Others" card — a fixed badge,
 * recipient, deal and date — and a Gifted tab with no source at all.
 */

/** A sent gift, as `GET /me/gifts` returns it. */
const giftFixture = {
  id: 'gift-1',
  recipientEmail: 'sam@example.com',
  recipientName: 'Sam Taylor',
  note: 'Enjoy lunch on me!',
  status: 'pending',
  createdAt: '2026-10-08T19:26:05.899Z',
  acceptedAt: null,
  rejectedAt: null,
  rejectionReason: null,
  offer: {
    id: 'offer-1',
    name: 'Apo Lunch Combo',
    mainImage: null,
    calculatedPrice: 8500,
    originalPrice: 10000,
  },
  businessName: 'Patrick Ventures',
  branchName: 'Apo Branch',
};

/**
 * A declined gift. The server keeps it for the sender's history while hiding it
 * from the branch dashboard, so it is a row to render, not one to drop.
 */
const declinedGift = {
  ...giftFixture,
  id: 'gift-2',
  recipientEmail: 'ada.obi@example.com',
  recipientName: 'Ada Obi',
  status: 'rejected',
  rejectedAt: '2026-10-09T10:00:00Z',
  rejectionReason: 'Location is too far',
};

const claimsQuery = (data: unknown[], total = data.length) => ({
  data: { data, total, page: 1, limit: 50 },
  isLoading: false,
  isSuccess: true,
  isError: false,
  refetch: jest.fn(),
});

const giftsQuery = (data: unknown[]) => ({
  data: { data, total: data.length, page: 1, limit: 50 },
  isLoading: false,
  isSuccess: true,
  isError: false,
  refetch: jest.fn(),
});

/**
 * `render` attaches its queries asynchronously in this RNTL version, so the
 * call is awaited and the bound queries are read from `screen` afterwards.
 */
async function renderHub() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MyDealsHubScreen />
    </QueryClientProvider>,
  );
}

const searchPlaceholder = strings.myDealsHub.search;

describe('My Deals hub search', () => {
  beforeEach(() => {
    (useMyClaims as jest.Mock).mockImplementation(() => claimsQuery([claimFixture]));
    (useMyGifts as jest.Mock).mockImplementation(() => giftsQuery([]));
    (useMyDealsSavingsTotal as jest.Mock).mockReturnValue({
      data: { totalSavedAmount: 1500 },
      isSuccess: true,
      isError: false,
    });
  });

  it('sends the typed search to the API as q, debounced', async () => {
    await renderHub();

    fireEvent.changeText(screen.getByLabelText(searchPlaceholder), 'apo');

    // Not immediately: one request per keystroke would be a request per
    // character, and this search is server-side.
    expect(useMyClaims).not.toHaveBeenCalledWith('ACTIVE', 'apo');

    // The 300 ms debounce is what stands between the keypress and the request.
    await waitFor(() => expect(useMyClaims).toHaveBeenCalledWith('ACTIVE', 'apo'), {
      timeout: 2000,
    });
    expect(useMyClaims).toHaveBeenCalledWith('REDEEMED', 'apo');
    expect(useMyClaims).toHaveBeenCalledWith('EXPIRED', 'apo');
    // The Gifted tab is a different endpoint and is searched too.
    expect(useMyGifts).toHaveBeenCalledWith('apo');
  });

  it('trims the search, so a lone space is not a query', async () => {
    await renderHub();

    fireEvent.changeText(screen.getByLabelText(searchPlaceholder), '   ');

    await waitFor(() => expect(useMyClaims).toHaveBeenCalled(), { timeout: 2000 });
    expect(useMyClaims).not.toHaveBeenCalledWith('ACTIVE', '   ');
  });

  it('distinguishes "nothing matched your search" from an empty tab', async () => {
    (useMyClaims as jest.Mock).mockImplementation(() => claimsQuery([]));

    await renderHub();

    fireEvent.changeText(screen.getByLabelText(searchPlaceholder), 'zzzz');

    await waitFor(() => expect(screen.getByText('No deals match "zzzz".')).toBeTruthy(), {
      timeout: 2000,
    });
    // The old copy claimed the tab was empty, which reads as "no data" rather
    // than "no match for what you typed".
    expect(screen.queryByText('Active deals appear here.')).toBeNull();
  });
});

describe('My Deals hub filter affordances', () => {
  beforeEach(() => {
    (useMyClaims as jest.Mock).mockImplementation(() => claimsQuery([claimFixture]));
    (useMyGifts as jest.Mock).mockImplementation(() => giftsQuery([]));
    (useMyDealsSavingsTotal as jest.Mock).mockReturnValue({
      data: { totalSavedAmount: 1500 },
      isSuccess: true,
      isError: false,
    });
  });

  it('leaves exactly one filter control, on the navbar', async () => {
    await renderHub();

    // The navbar tune icon is the only one; the duplicate inside the search
    // field is gone, so "Filter" no longer lands on a dead button.
    expect(screen.getAllByLabelText('Filter')).toHaveLength(1);
  });

  it('opens the sort sheet from the navbar with every sort listed', async () => {
    await renderHub();

    fireEvent.press(screen.getByLabelText('Filter'));

    await waitFor(() => expect(screen.getByText('Sort by')).toBeTruthy());
    expect(screen.getByText('Newest claimed')).toBeTruthy();
    expect(screen.getByText('Price: low to high')).toBeTruthy();
    expect(screen.getByText('Price: high to low')).toBeTruthy();
    expect(screen.getByText('Expiring soonest')).toBeTruthy();
    // The API has no filter beyond status, which the tabs already do — the
    // sheet says so rather than implying it filters.
    expect(
      screen.getByText(
        'Status lives on the tabs above — this sheet only orders the list.',
      ),
    ).toBeTruthy();
  });

  it('orders rows by price without inventing or hiding any', () => {
    const rows = [
      {
        ...claimFixture,
        id: 'pricey',
        offer: { ...claimFixture.offer, calculatedPrice: 9000 },
      },
      {
        ...claimFixture,
        id: 'cheap',
        offer: { ...claimFixture.offer, calculatedPrice: 100 },
      },
    ];

    const priceOf = (claim: typeof claimFixture) => claim.offer.calculatedPrice;
    const expiryOf = (claim: typeof claimFixture) => claim.expiresAt;

    // The sheet orders rows; it must never add or drop one, which is the line
    // between a sort and a filter.
    expect(sortMyDeals(rows, 'priceAsc', priceOf, expiryOf).map(r => r.id)).toEqual([
      'cheap',
      'pricey',
    ]);
    expect(sortMyDeals(rows, 'priceDesc', priceOf, expiryOf).map(r => r.id)).toEqual([
      'pricey',
      'cheap',
    ]);
    // `newest` is the server's order, so it is left alone rather than re-sorted
    // against a date the rows do not all carry.
    expect(sortMyDeals(rows, 'newest', priceOf, expiryOf).map(r => r.id)).toEqual([
      'pricey',
      'cheap',
    ]);
    // Expiring soonest orders by the pass's own expiry.
    expect(
      sortMyDeals(
        [
          { ...claimFixture, id: 'late', expiresAt: '2027-01-01T00:00:00Z' },
          { ...claimFixture, id: 'soon', expiresAt: '2026-01-01T00:00:00Z' },
        ],
        'expiring',
        priceOf,
        expiryOf,
      ).map(r => r.id),
    ).toEqual(['soon', 'late']);
  });
});

describe('My Deals hub Gifted tab', () => {
  beforeEach(() => {
    (useMyClaims as jest.Mock).mockImplementation(() => claimsQuery([]));
    (useMyGifts as jest.Mock).mockImplementation(() => giftsQuery([]));
    (useMyDealsSavingsTotal as jest.Mock).mockReturnValue({
      data: { totalSavedAmount: 0 },
      isSuccess: true,
    });
  });

  it('fetches the tab from the API rather than rendering fixed rows', async () => {
    (useMyGifts as jest.Mock).mockImplementation(() =>
      giftsQuery([giftFixture, declinedGift]),
    );

    await renderHub();

    await waitFor(() =>
      expect(screen.getByText(strings.myDealsHub.tabLabels[3])).toBeTruthy(),
    );
    fireEvent.press(screen.getByText(strings.myDealsHub.tabLabels[3]));

    await waitFor(() => expect(screen.getByText('Sam Taylor')).toBeTruthy());
    // Recipient detail, deal and price all come from the payload.
    expect(screen.getByText('sam@example.com')).toBeTruthy();
    expect(screen.getAllByText('Apo Lunch Combo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('₦8,500').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Patrick Ventures').length).toBeGreaterThan(0);
    // A declined gift is a real outcome, not a dropped row.
    expect(screen.getByText('Ada Obi')).toBeTruthy();
    expect(screen.getByText('Declined')).toBeTruthy();
    expect(screen.getByText('Location is too far')).toBeTruthy();
    expect(screen.getByText('Awaiting claim')).toBeTruthy();
  });

  it('shows an honest empty state when nothing has been gifted', async () => {
    await renderHub();

    fireEvent.press(screen.getByText(strings.myDealsHub.tabLabels[3]));

    await waitFor(() =>
      expect(
        screen.getByText('Deals you gift to friends and family appear here.'),
      ).toBeTruthy(),
    );
    // None of the old fabricated rows survive.
    expect(screen.queryByText('Samuel Adeleke')).toBeNull();
    expect(screen.queryByText('samuel.adeleke@example.com')).toBeNull();
    expect(screen.queryByText('Urban Grill 20% Off Combo')).toBeNull();
    expect(screen.queryByText('Sent on Oct 14, 2024')).toBeNull();
  });
});

describe('My Deals hub summary', () => {
  it('shows the ledger’s lifetime savings figure, not a page sum', async () => {
    (useMyClaims as jest.Mock).mockImplementation(() => claimsQuery([]));
    (useMyGifts as jest.Mock).mockImplementation(() => giftsQuery([]));
    (useMyDealsSavingsTotal as jest.Mock).mockReturnValue({
      data: { totalSavedAmount: 1500 },
      isSuccess: true,
    });

    await renderHub();

    await waitFor(() => expect(screen.getByText('₦1,500')).toBeTruthy());
  });
});

describe('no fabricated deal copy', () => {
  it('keeps the old sample rows and mock figures out of the hub’s copy', () => {
    // Scoped to this hub's copy block: the same phrases cannot be traced back
    // to a screen that no longer shows them.
    const serialised = JSON.stringify(strings.myDealsHub);

    // These were hardcoded into the Gifted section; they must not come back
    // through the strings module either.
    expect(serialised).not.toContain('Samuel Adeleke');
    expect(serialised).not.toContain('samuel.adeleke@example.com');
    expect(serialised).not.toContain('Urban Grill 20% Off Combo');
    expect(serialised).not.toContain('Sent on Oct 14, 2024');
    // The dead mock figures for the summary card, replaced by live values.
    expect(serialised).not.toContain('₦24,500');
    expect(serialised).not.toContain('14 Total');
  });
});
